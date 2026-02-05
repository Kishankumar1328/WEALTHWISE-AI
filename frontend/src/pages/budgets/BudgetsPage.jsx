import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    Calendar,
    Car,
    CheckCircle2,
    Edit,
    GraduationCap,
    HeartPulse,
    Home,
    Lightbulb,
    Loader2,
    Plus,
    ShoppingBag,
    ShoppingCart,
    Target,
    Trash2,
    TrendingUp,
    Utensils,
    X
} from 'lucide-react';
import { useState } from 'react';
import { budgetApi } from '../../api/api';

const BudgetsPage = () => {
    const queryClient = useQueryClient();
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [selectedBudgetId, setSelectedBudgetId] = useState(null);
    const [editingBudget, setEditingBudget] = useState(null);
    const [formError, setFormError] = useState(null);

    const [budgetForm, setBudgetForm] = useState({
        name: 'Monthly Budget',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        totalBudgetAmount: '',
        period: 'MONTHLY'
    });

    const [categoryForm, setCategoryForm] = useState({
        category: 'FOOD_DINING',
        budgetAmount: ''
    });

    // Start and End dates are now calculated directly during form submission to ensure consistency
    // and avoid synchronization issues with useEffect.


    const { data: user } = useQuery({
        queryKey: ['user-me'],
        queryFn: () => authApi.me().then(res => res.data),
    });

    const { data: budgets, isLoading, error: fetchError } = useQuery({
        queryKey: ['budgets'],
        queryFn: () => budgetApi.getAll().then(res => res.data),
    });

    // Mutations
    const createBudgetMutation = useMutation({
        mutationFn: (data) => budgetApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['budgets']);
            queryClient.invalidateQueries(['dashboard-summary']);
            closeBudgetModal();
        },
        onError: (err) => {
            console.error('Budget creation error:', err);
            console.error('Error response:', err.response);
            console.error('Error response data:', err.response?.data);

            const backendErrors = err.response?.data?.errors;
            let errorMsg;

            if (backendErrors && typeof backendErrors === 'object') {
                const errorDetails = Object.entries(backendErrors)
                    .map(([field, msg]) => `${field}: ${msg}`)
                    .join(', ');
                errorMsg = `${err.response?.data?.message || 'Validation Failed'} - ${errorDetails}`;
            } else if (err.response?.data?.message) {
                errorMsg = err.response.data.message;
            } else if (err.response?.status) {
                errorMsg = `Error ${err.response.status}: ${err.response.statusText || 'Unknown error'}`;
            } else if (err.message) {
                errorMsg = err.message;
            } else {
                errorMsg = 'An unexpected error occurred. Please check the console for details.';
            }

            setFormError(errorMsg);
        }
    });

    const updateBudgetMutation = useMutation({
        mutationFn: ({ id, data }) => budgetApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['budgets']);
            queryClient.invalidateQueries(['dashboard-summary']);
            closeBudgetModal();
        },
        onError: (err) => {
            const backendErrors = err.response?.data?.errors;
            const errorMsg = backendErrors
                ? `${err.response.data.message}: ${Object.entries(backendErrors).map(([field, msg]) => `${field} ${msg}`).join(', ')}`
                : (err.response?.data?.message || err.message || 'Failed to update budget plan.');
            setFormError(errorMsg);
        }
    });

    const addCategoryMutation = useMutation({
        mutationFn: ({ budgetId, data }) => budgetApi.addCategory(budgetId, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['budgets']);
            queryClient.invalidateQueries(['dashboard-summary']);
            setIsCategoryModalOpen(false);
            setCategoryForm({ category: 'FOOD_DINING', budgetAmount: '' });
        },
        onError: (err) => {
            alert(err.response?.data?.message || 'Failed to add category budget.');
        }
    });

    const deleteBudgetMutation = useMutation({
        mutationFn: (id) => budgetApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['budgets']);
            queryClient.invalidateQueries(['dashboard-summary']);
        }
    });

    const openEditBudgetModal = (budget) => {
        setEditingBudget(budget);
        setBudgetForm({
            name: budget.name,
            month: budget.month,
            year: budget.year,
            totalBudgetAmount: budget.totalBudgetAmount.toString(),
            period: budget.period
        });
        setIsBudgetModalOpen(true);
    };

    const closeBudgetModal = () => {
        setIsBudgetModalOpen(false);
        setEditingBudget(null);
        setFormError(null);
        setBudgetForm({
            name: 'Monthly Budget',
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            totalBudgetAmount: '',
            period: 'MONTHLY'
        });
    };

    const getCategoryIcon = (category) => {
        const size = 24;
        const color = "text-brand";
        switch (category) {
            case 'FOOD_DINING': return <Utensils size={size} className={color} />;
            case 'TRANSPORTATION': return <Car size={size} className={color} />;
            case 'SHOPPING': return <ShoppingBag size={size} className={color} />;
            case 'RENT': return <Home size={size} className={color} />;
            case 'UTILITIES': return <Lightbulb size={size} className={color} />;
            case 'HEALTHCARE': return <HeartPulse size={size} className={color} />;
            case 'EDUCATION': return <GraduationCap size={size} className={color} />;
            case 'GROCERIES': return <ShoppingCart size={size} className={color} />;
            default: return <Target size={size} className={color} />;
        }
    };

    // Get active budget for the current month/year
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // 1. Try to find match for current month/year
    // 2. Fallback to the one with the highest ID (most recently created)
    const activeBudget = budgets?.find(b => b.month === currentMonth && b.year === currentYear) ||
        (budgets && budgets.length > 0 ? [...budgets].sort((a, b) => b.id - a.id)[0] : null);

    const handleBudgetSubmit = (e) => {
        e.preventDefault();
        setFormError(null);

        const year = budgetForm.year;
        const month = budgetForm.month;
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        // month is 1-indexed, but Date constructor expects 0-indexed month
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        const payload = {
            ...budgetForm,
            totalBudgetAmount: parseFloat(budgetForm.totalBudgetAmount),
            startDate,
            endDate
        };

        console.log('Budget form data:', budgetForm);
        console.log('Calculated dates:', { startDate, endDate });
        console.log('Final payload to backend:', payload);

        if (isNaN(payload.totalBudgetAmount) || payload.totalBudgetAmount <= 0) {
            setFormError("Please enter a valid budget amount.");
            return;
        }

        if (editingBudget) {
            updateBudgetMutation.mutate({ id: editingBudget.id, data: payload });
        } else {
            createBudgetMutation.mutate(payload);
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 text-brand animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto text-black">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900">Budgets</h1>
                    <div className="flex items-center gap-3">
                        <p className="text-slate-500 font-medium font-bold">
                            {activeBudget ? `Active Plan: ${activeBudget.name} (${activeBudget.month}/${activeBudget.year})` : 'Set monthly limits to help you save more.'}
                        </p>
                        {activeBudget && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => openEditBudgetModal(activeBudget)}
                                    className="p-1 text-slate-400 hover:text-brand transition-colors"
                                    title="Edit Budget Plan"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={() => {
                                        if (window.confirm(`Delete budget plan "${activeBudget.name}"?`)) {
                                            deleteBudgetMutation.mutate(activeBudget.id);
                                        }
                                    }}
                                    className="p-1 text-slate-400 hover:text-danger transition-colors text-black"
                                    title="Delete Budget Plan"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => setIsBudgetModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2 bg-brand text-white rounded-xl hover:bg-brand-dark transition-all font-bold shadow-lg shadow-brand/20 text-black">
                    <Plus size={18} />
                    New Budget Plan
                </button>
            </div>

            {/* Budget Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeBudget?.categories?.map((cat) => {
                    const budgetAmt = cat.budgetAmount || 1;
                    const spentAmt = cat.spentAmount || 0;
                    const percentage = (spentAmt / budgetAmt) * 100;
                    const isOver = percentage > 100;
                    const isNear = percentage > 80 && percentage <= 100;

                    return (
                        <motion.div
                            layout
                            key={cat.id}
                            className={`bg-white p-6 rounded-3xl border ${isOver ? 'border-danger/30' : 'border-slate-100'} shadow-sm hover:shadow-md transition-all text-black`}>
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-slate-50 rounded-2xl">
                                    {getCategoryIcon(cat.category)}
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${isOver ? 'bg-danger/10 text-danger' : isNear ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                                    {isOver ? <AlertCircle size={14} /> : isNear ? <TrendingUp size={14} /> : <CheckCircle2 size={14} />}
                                    {isOver ? 'Over Limit' : isNear ? 'Running Low' : 'On Track'}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg uppercase">
                                        {(cat.category || 'OTHER').replace('_', ' ')}
                                    </h3>
                                    <p className="text-sm text-slate-500 font-bold">Target Budget</p>
                                </div>

                                <div className="space-y-2 text-black">
                                    <div className="flex justify-between text-sm font-bold">
                                        <span className="text-slate-500">Spent: ₹{spentAmt.toLocaleString()}</span>
                                        <span className="text-slate-900 font-black">Limit: ₹{budgetAmt.toLocaleString()}</span>
                                    </div>
                                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(percentage, 100)}%` }}
                                            transition={{ duration: 1 }}
                                            className={`h-full rounded-full ${isOver ? 'bg-danger' : isNear ? 'bg-warning' : 'bg-brand'}`}
                                        />
                                    </div>
                                    <p className="text-right text-xs font-black text-slate-400 uppercase tracking-tighter">
                                        {Math.round(percentage)}% of limit reached
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {/* Add Category Card */}
                {activeBudget && (
                    <button
                        onClick={() => {
                            setSelectedBudgetId(activeBudget.id);
                            setIsCategoryModalOpen(true);
                        }}
                        className="h-full min-h-[250px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-3 p-8 group hover:border-brand hover:bg-primary-50 transition-all text-black">
                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand group-hover:text-white transition-all">
                            <Plus size={24} />
                        </div>
                        <p className="font-bold text-slate-500 group-hover:text-brand transition-all">Add Category Budget</p>
                    </button>
                )}

                {(!activeBudget || budgets?.length === 0) && !isLoading && (
                    <div className="lg:col-span-3 text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 text-black">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <Calendar size={40} />
                        </div>
                        <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">No Budget Plan Found</h2>
                        <p className="text-slate-500 mb-8 max-w-sm mx-auto font-medium font-bold">Start by creating a budget plan for the month to track your spending and savings.</p>
                        <button
                            onClick={() => setIsBudgetModalOpen(true)}
                            className="bg-brand text-white px-8 py-3 rounded-2xl font-bold hover:bg-brand-dark transition-all shadow-lg shadow-brand/20">
                            Create First Budget Plan
                        </button>
                    </div>
                )}
            </div>

            {/* Combined Add/Edit Budget Modal */}
            <AnimatePresence>
                {isBudgetModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-black">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative text-black"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-display font-bold text-slate-900 text-black">
                                    {editingBudget ? 'Edit Budget Plan' : 'Create Budget Plan'}
                                </h2>
                                <button onClick={closeBudgetModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-black">
                                    <X size={24} className="text-slate-400" />
                                </button>
                            </div>

                            {formError && (
                                <div className="mb-6 p-4 bg-danger/5 border border-danger/20 rounded-2xl flex items-center gap-3 text-danger text-sm font-bold">
                                    <AlertCircle size={18} />
                                    {formError}
                                </div>
                            )}

                            <form onSubmit={handleBudgetSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Plan Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand outline-none transition-all"
                                        value={budgetForm.name}
                                        onChange={(e) => setBudgetForm({ ...budgetForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Month</label>
                                        <select
                                            className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand outline-none"
                                            value={budgetForm.month}
                                            onChange={(e) => setBudgetForm({ ...budgetForm, month: parseInt(e.target.value) })}
                                        >
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                                <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Year</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand outline-none"
                                            value={budgetForm.year}
                                            onChange={(e) => setBudgetForm({ ...budgetForm, year: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Monthly Limit (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand outline-none"
                                        placeholder="e.g. 50000"
                                        value={budgetForm.totalBudgetAmount}
                                        onChange={(e) => setBudgetForm({ ...budgetForm, totalBudgetAmount: e.target.value })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={createBudgetMutation.isPending || updateBudgetMutation.isPending}
                                    className="w-full bg-brand text-white py-4 rounded-2xl font-black text-lg hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 disabled:opacity-50">
                                    {(createBudgetMutation.isPending || updateBudgetMutation.isPending) ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 size={20} className="animate-spin" />
                                            Saving...
                                        </div>
                                    ) : (editingBudget ? 'Update Plan' : 'Create Plan')}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add Category Modal */}
            <AnimatePresence>
                {isCategoryModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-black">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative text-black"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-display font-bold text-slate-900 text-black">Add Category Budget</h2>
                                <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-black">
                                    <X size={24} className="text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                addCategoryMutation.mutate({
                                    budgetId: selectedBudgetId,
                                    data: {
                                        ...categoryForm,
                                        budgetAmount: parseFloat(categoryForm.budgetAmount)
                                    }
                                });
                            }} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                                    <select
                                        className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand outline-none"
                                        value={categoryForm.category}
                                        onChange={(e) => setCategoryForm({ ...categoryForm, category: e.target.value })}
                                    >
                                        <option value="FOOD_DINING">Food & Dining</option>
                                        <option value="TRANSPORTATION">Transportation</option>
                                        <option value="SHOPPING">Shopping</option>
                                        <option value="RENT">Rent & Home</option>
                                        <option value="UTILITIES">Utilities</option>
                                        <option value="ENTERTAINMENT">Entertainment</option>
                                        <option value="HEALTHCARE">Healthcare</option>
                                        <option value="EDUCATION">Education</option>
                                        <option value="GROCERIES">Groceries</option>
                                        <option value="INVESTMENTS">Investments</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Budget Limit (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand outline-none"
                                        placeholder="e.g. 5000"
                                        value={categoryForm.budgetAmount}
                                        onChange={(e) => setCategoryForm({ ...categoryForm, budgetAmount: e.target.value })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={addCategoryMutation.isPending}
                                    className="w-full bg-brand text-white py-4 rounded-2xl font-black text-lg hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 disabled:opacity-50">
                                    {addCategoryMutation.isPending ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 size={20} className="animate-spin" />
                                            Saving...
                                        </div>
                                    ) : 'Add Category'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BudgetsPage;
