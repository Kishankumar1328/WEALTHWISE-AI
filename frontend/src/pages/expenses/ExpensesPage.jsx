import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Utensils,
    Car,
    ShoppingBag,
    Lightbulb,
    Home,
    Trash2,
    Edit,
    Calendar,
    Tag,
    Pizza,
    HeartPulse,
    Gamepad2,
    GraduationCap,
    ShieldCheck,
    Smartphone,
    Plane,
    Sparkles,
    Gift,
    BarChart3,
    Ban,
    Search,
    Filter,
    Plus,
    X,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { expenseApi } from '../../api/api';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const ExpensesPage = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingExpense, setEditingExpense] = useState(null);
    const [formError, setFormError] = useState(null);

    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: 'FOOD_DINING',
        transactionDate: format(new Date(), 'yyyy-MM-dd'),
        type: 'EXPENSE',
        merchant: '',
        paymentMethod: 'UPI'
    });

    const { data: expenses, isLoading } = useQuery({
        queryKey: ['expenses'],
        queryFn: () => expenseApi.getAll().then(res => res.data.content),
    });

    const addMutation = useMutation({
        mutationFn: (data) => expenseApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['expenses']);
            queryClient.invalidateQueries(['dashboard-summary']);
            closeModal();
        },
        onError: (err) => {
            setFormError(err.response?.data?.message || err.message || 'Failed to save transaction.');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => expenseApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['expenses']);
            queryClient.invalidateQueries(['dashboard-summary']);
            closeModal();
        },
        onError: (err) => {
            setFormError(err.response?.data?.message || err.message || 'Failed to update transaction.');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => expenseApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['expenses']);
            queryClient.invalidateQueries(['dashboard-summary']);
        },
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError(null);
        const payload = {
            ...formData,
            amount: parseFloat(formData.amount)
        };

        if (editingExpense) {
            updateMutation.mutate({ id: editingExpense.id, data: payload });
        } else {
            addMutation.mutate(payload);
        }
    };

    const openEditModal = (expense) => {
        setEditingExpense(expense);
        setFormData({
            description: expense.description,
            amount: expense.amount.toString(),
            category: expense.category,
            transactionDate: format(new Date(expense.transactionDate), 'yyyy-MM-dd'),
            type: expense.type,
            merchant: expense.merchant || '',
            paymentMethod: expense.paymentMethod || 'UPI'
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingExpense(null);
        setFormError(null);
        setFormData({
            description: '',
            amount: '',
            category: 'FOOD_DINING',
            transactionDate: format(new Date(), 'yyyy-MM-dd'),
            type: 'EXPENSE',
            merchant: '',
            paymentMethod: 'UPI'
        });
    };

    const filteredExpenses = expenses?.filter(e =>
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.merchant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getCategoryIcon = (category) => {
        const size = 20;
        const color = "text-brand";
        switch (category) {
            case 'FOOD_DINING': return <Utensils size={size} className={color} />;
            case 'GROCERIES': return <Pizza size={size} className={color} />;
            case 'TRANSPORTATION': return <Car size={size} className={color} />;
            case 'UTILITIES': return <Lightbulb size={size} className={color} />;
            case 'HEALTHCARE': return <HeartPulse size={size} className={color} />;
            case 'ENTERTAINMENT': return <Gamepad2 size={size} className={color} />;
            case 'SHOPPING': return <ShoppingBag size={size} className={color} />;
            case 'EDUCATION': return <GraduationCap size={size} className={color} />;
            case 'RENT': return <Home size={size} className={color} />;
            case 'INSURANCE': return <ShieldCheck size={size} className={color} />;
            case 'SUBSCRIPTIONS': return <Smartphone size={size} className={color} />;
            case 'TRAVEL': return <Plane size={size} className={color} />;
            case 'PERSONAL_CARE': return <Sparkles size={size} className={color} />;
            case 'GIFTS': return <Gift size={size} className={color} />;
            case 'INVESTMENTS': return <BarChart3 size={size} className={color} />;
            case 'EMI': return <Ban size={size} className={color} />;
            default: return <Tag size={size} className={color} />;
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 text-brand animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900">Transactions</h1>
                    <p className="text-slate-500 font-medium font-bold">Track and manage your daily cash flow.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingExpense(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-6 py-2 bg-brand text-white rounded-xl hover:bg-brand-dark transition-all font-bold shadow-lg shadow-brand/20 text-black"
                >
                    <Plus size={18} />
                    Add Transaction
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand outline-none text-black font-bold"
                    />
                </div>
            </div>

            {/* Expense Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-black">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-50">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredExpenses?.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">
                                    No transactions found.
                                </td>
                            </tr>
                        ) : (
                            filteredExpenses?.map((expense) => (
                                <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg">
                                                {getCategoryIcon(expense.category)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{expense.description}</p>
                                                <p className="text-xs text-slate-500 font-bold">{expense.merchant || '-'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-lg w-fit text-[10px] font-black uppercase ${expense.type === 'INCOME' ? 'bg-success/10 text-success' : 'bg-primary-50 text-brand'}`}>
                                            {expense.category.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 font-bold">
                                        {format(new Date(expense.transactionDate), 'MMM dd, yyyy')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className={`font-bold ${expense.type === 'INCOME' ? 'text-success' : 'text-slate-900'}`}>
                                            {expense.type === 'INCOME' ? '+' : '-'}₹{expense.amount.toLocaleString()}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEditModal(expense)}
                                                className="p-2 text-slate-400 hover:text-brand transition-colors">
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Delete this transaction?')) {
                                                        deleteMutation.mutate(expense.id);
                                                    }
                                                }}
                                                className="p-2 text-slate-400 hover:text-danger transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Combined Add/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-black">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl relative"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-display font-bold text-slate-900">
                                    {editingExpense ? 'Edit Transaction' : 'Add New Transaction'}
                                </h2>
                                <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-black">
                                    <X size={24} className="text-slate-400" />
                                </button>
                            </div>

                            {formError && (
                                <div className="mb-6 p-4 bg-danger/5 border border-danger/20 rounded-2xl flex items-center gap-3 text-danger text-sm font-bold">
                                    <AlertCircle size={18} />
                                    {formError}
                                </div>
                            )}

                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Type</label>
                                        <select
                                            name="type"
                                            value={formData.type}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-50 border-none rounded-xl p-3 font-bold text-slate-900"
                                        >
                                            <option value="EXPENSE">Expense</option>
                                            <option value="INCOME">Income</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Category</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-50 border-none rounded-xl p-3 font-bold text-slate-900"
                                        >
                                            <option value="FOOD_DINING">Food & Dining</option>
                                            <option value="GROCERIES">Groceries</option>
                                            <option value="TRANSPORTATION">Transportation</option>
                                            <option value="UTILITIES">Utilities</option>
                                            <option value="SHOPPING">Shopping</option>
                                            <option value="RENT">Rent & Home</option>
                                            <option value="ENTERTAINMENT">Entertainment</option>
                                            <option value="HEALTHCARE">Healthcare</option>
                                            <option value="EDUCATION">Education</option>
                                            <option value="INVESTMENTS">Investments</option>
                                            <option value="EMI">EMI / Loans</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Description</label>
                                    <input
                                        type="text"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full bg-slate-50 border-none rounded-xl p-3 font-bold text-slate-900 focus:ring-2 focus:ring-brand outline-none"
                                        placeholder="e.g. Monthly Rent, Groceries"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Amount (₹)</label>
                                        <input
                                            type="number"
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full bg-slate-50 border-none rounded-xl p-3 font-bold text-slate-900 focus:ring-2 focus:ring-brand outline-none"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Date</label>
                                        <input
                                            type="date"
                                            name="transactionDate"
                                            value={formData.transactionDate}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full bg-slate-50 border-none rounded-xl p-3 font-bold text-slate-900 focus:ring-2 focus:ring-brand outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Merchant (Optional)</label>
                                    <input
                                        type="text"
                                        name="merchant"
                                        value={formData.merchant}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border-none rounded-xl p-3 font-bold text-slate-900 focus:ring-2 focus:ring-brand outline-none"
                                        placeholder="e.g. Amazon, Uber, Swiggy"
                                    />
                                </div>

                                <div className="flex gap-4 mt-8">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all text-black">
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={addMutation.isPending || updateMutation.isPending}
                                        className="flex-1 px-6 py-3 bg-brand text-white rounded-xl font-bold shadow-lg shadow-brand/20 hover:bg-brand-dark transition-all disabled:opacity-50"
                                    >
                                        {(addMutation.isPending || updateMutation.isPending) ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 size={20} className="animate-spin" />
                                                Saving...
                                            </div>
                                        ) : 'Confirm'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ExpensesPage;
