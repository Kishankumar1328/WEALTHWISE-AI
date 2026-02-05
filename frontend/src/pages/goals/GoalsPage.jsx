import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus,
    Target,
    Calendar,
    ArrowRight,
    Trophy,
    Home,
    Car,
    GraduationCap,
    HeartPulse,
    Plane,
    Wallet,
    Briefcase,
    Gem,
    TrendingUp,
    X,
    Loader2,
    PlusCircle,
    Trash2,
    Edit,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { goalApi } from '../../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const GoalsPage = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [editingGoal, setEditingGoal] = useState(null);
    const [fundAmount, setFundAmount] = useState('');
    const [formError, setFormError] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        goalType: 'HOME_PURCHASE',
        targetAmount: '',
        currentAmount: '0',
        targetDate: format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), 'yyyy-MM-dd'),
        priority: 'MEDIUM'
    });

    const { data: goals, isLoading } = useQuery({
        queryKey: ['goals'],
        queryFn: () => goalApi.getAll().then(res => res.data),
    });

    const addMutation = useMutation({
        mutationFn: (data) => goalApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['goals']);
            queryClient.invalidateQueries(['dashboard-summary']);
            closeModal();
        },
        onError: (err) => {
            setFormError(err.response?.data?.message || err.message || 'Failed to create financial goal.');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => goalApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['goals']);
            queryClient.invalidateQueries(['dashboard-summary']);
            closeModal();
        },
        onError: (err) => {
            setFormError(err.response?.data?.message || err.message || 'Failed to update goal.');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => goalApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['goals']);
            queryClient.invalidateQueries(['dashboard-summary']);
        },
    });

    const addFundsMutation = useMutation({
        mutationFn: ({ id, amount }) => goalApi.addFunds(id, amount),
        onSuccess: () => {
            queryClient.invalidateQueries(['goals']);
            queryClient.invalidateQueries(['dashboard-summary']);
            setIsAddFundsModalOpen(false);
            setFundAmount('');
            setSelectedGoal(null);
        },
        onError: (err) => {
            alert(err.response?.data?.message || 'Failed to add funds.');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError(null);
        const payload = {
            ...formData,
            targetAmount: parseFloat(formData.targetAmount),
            currentAmount: parseFloat(formData.currentAmount)
        };

        if (editingGoal) {
            updateMutation.mutate({ id: editingGoal.id, data: payload });
        } else {
            addMutation.mutate(payload);
        }
    };

    const handleAddFunds = (e) => {
        e.preventDefault();
        if (!selectedGoal || !fundAmount) return;
        addFundsMutation.mutate({
            id: selectedGoal.id,
            amount: parseFloat(fundAmount)
        });
    };

    const openEditModal = (goal) => {
        setEditingGoal(goal);
        setFormData({
            title: goal.title,
            goalType: goal.goalType,
            targetAmount: goal.targetAmount.toString(),
            currentAmount: goal.currentAmount.toString(),
            targetDate: format(new Date(goal.targetDate), 'yyyy-MM-dd'),
            priority: goal.priority
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingGoal(null);
        setFormError(null);
        setFormData({
            title: '',
            goalType: 'HOME_PURCHASE',
            targetAmount: '',
            currentAmount: '0',
            targetDate: format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), 'yyyy-MM-dd'),
            priority: 'MEDIUM'
        });
    };

    const getGoalIcon = (type) => {
        const size = 32;
        const color = "text-brand";
        switch (type) {
            case 'HOME_PURCHASE': return <Home size={size} className={color} />;
            case 'VEHICLE': return <Car size={size} className={color} />;
            case 'EDUCATION': return <GraduationCap size={size} className={color} />;
            case 'EMERGENCY_FUND': return <HeartPulse size={size} className={color} />;
            case 'VACATION': return <Plane size={size} className={color} />;
            case 'RETIREMENT': return <Wallet size={size} className={color} />;
            case 'BUSINESS': return <Briefcase size={size} className={color} />;
            case 'INVESTMENT': return <TrendingUp size={size} className={color} />;
            case 'WEDDING': return <Gem size={size} className={color} />;
            default: return <Target size={size} className={color} />;
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 text-brand animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto text-black">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900">Financial Goals</h1>
                    <p className="text-slate-500 font-medium font-bold">Plan for the things that matter most.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingGoal(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-6 py-2 bg-brand text-white rounded-xl hover:bg-brand-dark transition-all font-bold shadow-lg shadow-brand/20 text-black">
                    <Plus size={18} />
                    Create Goal
                </button>
            </div>

            {goals?.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-100 shadow-sm transition-all text-black">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <Target size={48} />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">No Goals Yet</h2>
                    <p className="text-slate-500 mb-8 max-w-sm mx-auto font-medium font-bold">Define your financial targets to stay motivated and track your progress.</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-brand text-white px-8 py-3 rounded-2xl font-bold hover:bg-brand-dark transition-all shadow-lg shadow-brand/20">
                        Set Your First Goal
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-black">
                    {goals?.map((goal) => {
                        const targetAmount = goal.targetAmount || 1;
                        const currentAmount = goal.currentAmount || 0;
                        const percentage = Math.min((currentAmount / targetAmount) * 100, 100);
                        const isCompleted = currentAmount >= targetAmount;

                        return (
                            <motion.div
                                layout
                                key={goal.id}
                                className={`bg-white p-8 rounded-[2rem] border ${isCompleted ? 'border-success/30 bg-success/5' : 'border-slate-100'} shadow-sm flex flex-col md:flex-row gap-8 relative overflow-hidden group text-black`}>
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                    <Trophy size={150} />
                                </div>

                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEditModal(goal)}
                                        className="p-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:text-brand transition-colors text-black">
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`Delete goal "${goal.title}"?`)) {
                                                deleteMutation.mutate(goal.id);
                                            }
                                        }}
                                        className="p-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:text-danger transition-colors text-black">
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="w-full md:w-32 h-32 bg-primary-50 rounded-3xl flex items-center justify-center flex-shrink-0">
                                    {getGoalIcon(goal.goalType)}
                                </div>

                                <div className="flex-1 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${getPriorityColor(goal.priority)}`}>
                                                    {goal.priority || 'Medium'}
                                                </span>
                                                {isCompleted && (
                                                    <span className="flex items-center gap-1 text-[10px] font-black uppercase text-success">
                                                        <CheckCircle2 size={12} />
                                                        Completed
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-display font-bold text-slate-900">{goal.title}</h3>
                                            <p className="text-sm text-slate-500 flex items-center gap-1 font-bold">
                                                <Calendar size={14} />
                                                Target: {goal.targetDate ? format(new Date(goal.targetDate), 'MMM yyyy') : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-display font-bold text-brand">₹{Math.max(0, targetAmount - currentAmount).toLocaleString()}</p>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Remaining</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm font-bold">
                                            <span className="text-slate-600">Progress</span>
                                            <span className="text-slate-900">{Math.round(percentage)}%</span>
                                        </div>
                                        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                className={`h-full rounded-full ${isCompleted ? 'bg-success' : 'bg-gradient-to-r from-brand to-primary-500'}`}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs font-bold text-slate-400">
                                            <span>Saved: ₹{currentAmount.toLocaleString()}</span>
                                            <span>Target: ₹{targetAmount.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {!isCompleted && (
                                        <button
                                            onClick={() => {
                                                setSelectedGoal(goal);
                                                setIsAddFundsModalOpen(true);
                                            }}
                                            className="w-full py-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-700 font-bold text-sm transition-all flex items-center justify-center gap-2 text-black">
                                            Update Progress
                                            <PlusCircle size={16} className="text-brand" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Combined Add/Edit Goal Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-black">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative overflow-hidden text-black"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-display font-bold text-slate-900">
                                    {editingGoal ? 'Edit Financial Goal' : 'Create Financial Goal'}
                                </h2>
                                <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors font-bold text-black">
                                    <X size={24} className="text-slate-400" />
                                </button>
                            </div>

                            {formError && (
                                <div className="mb-6 p-4 bg-danger/5 border border-danger/20 rounded-2xl flex items-center gap-3 text-danger text-sm font-bold">
                                    <AlertCircle size={18} />
                                    {formError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Goal Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand outline-none transition-all"
                                        placeholder="e.g. Dream House Fund"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Type</label>
                                        <select
                                            className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand outline-none"
                                            value={formData.goalType}
                                            onChange={(e) => setFormData({ ...formData, goalType: e.target.value })}
                                        >
                                            <option value="HOME_PURCHASE">Home Purchase</option>
                                            <option value="VEHICLE">Vehicle</option>
                                            <option value="EDUCATION">Education</option>
                                            <option value="EMERGENCY_FUND">Emergency Fund</option>
                                            <option value="VACATION">Vacation</option>
                                            <option value="RETIREMENT">Retirement</option>
                                            <option value="BUSINESS">Business</option>
                                            <option value="INVESTMENT">Investment</option>
                                            <option value="WEDDING">Wedding</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Priority</label>
                                        <select
                                            className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand outline-none"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        >
                                            <option value="LOW">Low</option>
                                            <option value="MEDIUM">Medium</option>
                                            <option value="HIGH">High</option>
                                            <option value="CRITICAL">Critical</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Target Date</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand outline-none"
                                            value={formData.targetDate}
                                            onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Target Amount (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 focus:ring-2 focus:ring-brand outline-none"
                                            placeholder="500000"
                                            value={formData.targetAmount}
                                            onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={addMutation.isPending || updateMutation.isPending}
                                    className="w-full bg-brand text-white py-4 rounded-2xl font-black text-lg hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 disabled:opacity-50">
                                    {(addMutation.isPending || updateMutation.isPending) ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 size={20} className="animate-spin" />
                                            Saving...
                                        </div>
                                    ) : (editingGoal ? 'Update Goal' : 'Launch Goal')}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add Funds Modal */}
            <AnimatePresence>
                {isAddFundsModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-black">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl relative text-black"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-display font-bold text-slate-900 text-black">Add Savings</h2>
                                <button onClick={() => setIsAddFundsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-black font-bold">
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleAddFunds} className="space-y-6">
                                <div>
                                    <p className="text-sm font-bold text-slate-500 mb-4">Adding funds to <span className="text-brand">{selectedGoal?.title}</span></p>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Amount to Add (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        autoFocus
                                        className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-900 text-2xl focus:ring-2 focus:ring-brand outline-none transition-all"
                                        placeholder="0.00"
                                        value={fundAmount}
                                        onChange={(e) => setFundAmount(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={addFundsMutation.isPending || !fundAmount}
                                    className="w-full bg-brand text-white py-4 rounded-2xl font-black text-lg hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 disabled:opacity-50">
                                    {addFundsMutation.isPending ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 size={20} className="animate-spin" />
                                            Processing...
                                        </div>
                                    ) : 'Add to Goal'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const getPriorityColor = (priority) => {
    switch (priority) {
        case 'CRITICAL': return 'bg-danger text-white';
        case 'HIGH': return 'bg-orange-500 text-white';
        case 'LOW': return 'bg-slate-200 text-slate-600';
        default: return 'bg-success text-white';
    }
};

export default GoalsPage;
