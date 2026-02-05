import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    TrendingDown, ArrowRight, DollarSign,
    PieChart, Zap, AlertCircle, CheckCircle
} from 'lucide-react';
import { smeCostOptimizationApi, smeBusinessApi } from '../../api/api';
import PageContainer from '../../components/common/PageContainer';
import LoadingScreen from '../../components/common/LoadingScreen';

const CostOptimization = () => {
    const queryClient = useQueryClient();
    const [selectedBusiness, setSelectedBusiness] = React.useState(null);

    const { data: businesses = [] } = useQuery({
        queryKey: ['sme-businesses'],
        queryFn: () => smeBusinessApi.getAll().then(res => res.data)
    });

    React.useEffect(() => {
        if (businesses.length > 0 && !selectedBusiness) {
            setSelectedBusiness(businesses[0]);
        }
    }, [businesses, selectedBusiness]);

    const businessId = selectedBusiness?.id;

    const { data: suggestions = [], isLoading } = useQuery({
        queryKey: ['cost-suggestions', businessId],
        queryFn: () => businessId ? smeCostOptimizationApi.getSuggestions(businessId).then(res => res.data) : [],
        enabled: !!businessId
    });

    const { data: summary } = useQuery({
        queryKey: ['cost-summary', businessId],
        queryFn: () => businessId ? smeCostOptimizationApi.getSummary(businessId).then(res => res.data) : null,
        enabled: !!businessId
    });

    const generateMutation = useMutation({
        mutationFn: () => smeCostOptimizationApi.generate(businessId),
        onSuccess: (res) => {
            queryClient.invalidateQueries(['cost-suggestions', 'cost-summary', businessId]);
            alert(`Analysis complete! Found ${res.data.newSuggestions} new optimization opportunities.`);
        }
    });

    const totalSavings = suggestions.reduce((sum, s) => sum + (s.projectedMonthlySaving || 0), 0);

    if (isLoading) return <LoadingScreen message="Analyzing Spend Patterns..." />;

    return (
        <PageContainer>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Cost Optimization</h1>
                    <p className="text-slate-500 font-bold mt-2">AI-driven strategies to reduce operational expenses.</p>
                    <div className="mt-6 flex items-center gap-4">
                        <select
                            className="bg-white px-4 py-2 rounded-xl font-bold text-slate-700 shadow-sm border-none outline-none min-w-[200px]"
                            value={businessId || ''}
                            onChange={(e) => setSelectedBusiness(businesses.find(b => b.id === parseInt(e.target.value)))}
                        >
                            {businesses.map(b => <option key={b.id} value={b.id}>{b.businessName}</option>)}
                        </select>
                    </div>
                </div>
                <button
                    onClick={() => generateMutation.mutate()}
                    className="btn-primary-horizon bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200"
                    disabled={generateMutation.isPending}
                >
                    <Zap size={18} />
                    Run Deep Analysis
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="horizon-card p-8 bg-slate-900 text-white border-none shadow-xl shadow-slate-200">
                    <div className="flex items-center gap-3 mb-4 text-emerald-400">
                        <DollarSign size={24} />
                        <span className="font-black tracking-widest text-xs uppercase">Potential Monthly Savings</span>
                    </div>
                    <div className="text-5xl font-black tracking-tighter mb-2">
                        ₹{(totalSavings).toLocaleString()}
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Identified across {suggestions.length} categories</p>
                </div>

                <div className="horizon-card p-8 flex flex-col justify-center items-center text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${summary?.highPriorityCount > 0 ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                        {summary?.highPriorityCount > 0 ? <AlertCircle size={32} /> : <CheckCircle size={32} />}
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">{summary?.highPriorityCount > 0 ? 'Action Required' : 'Status: Optimal'}</h3>
                    <p className="text-slate-500 font-medium text-sm">{summary?.highPriorityCount || 0} high-priority optimization tasks detected.</p>
                </div>

                <div className="horizon-card p-8 flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-6">
                        <PieChart size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Efficiency Index</h3>
                    <p className="text-slate-500 font-medium text-sm">Your business efficiency score is <span className="text-indigo-600 font-black">{summary?.efficiencyScore || 0}%</span>.</p>
                </div>
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Optimization Opportunities</h2>
            <div className="grid gap-6">
                {suggestions.map((item, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={item.id}
                        className="horizon-card p-8 flex flex-col lg:flex-row items-center gap-8 justify-between hover:border-emerald-200 hover:shadow-lg transition-all"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-black text-xl border border-slate-100">
                                {idx + 1}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900">{item.suggestionTitle}</h3>
                                <p className="text-slate-500 font-medium mt-1 max-w-xl">{item.suggestionDetails}</p>
                                <div className="flex gap-3 mt-4">
                                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest">
                                        {item.expenseCategory}
                                    </span>
                                    <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                                        {item.actionType.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right min-w-[150px]">
                            <span className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Save Up To</span>
                            <span className="block text-3xl font-black text-emerald-600">₹{item.projectedMonthlySaving.toLocaleString()}</span>
                            <span className="block text-[10px] text-slate-400 font-bold mt-1">PER MONTH</span>
                        </div>

                        <button className="btn-ghost-horizon">
                            View Plan <ArrowRight size={16} />
                        </button>
                    </motion.div>
                ))}

                {suggestions.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
                            <Zap size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No suggestions yet</h3>
                        <p className="text-slate-400 mt-2">Run the deep analysis to generate insights.</p>
                    </div>
                )}
            </div>
        </PageContainer>
    );
};

export default CostOptimization;
