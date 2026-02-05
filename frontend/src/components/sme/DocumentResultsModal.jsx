import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, CheckCircle, AlertCircle, TrendingUp, TrendingDown, DollarSign, Calendar, PieChart as PieIcon, List, ArrowUpRight, ArrowDownRight, Sparkles, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar
} from 'recharts';
import { smeDocumentApi } from '../../api/api';
import './DocumentResultsModal.css';

const COLORS = ['#6366f1', '#4F46E5', '#818CF8', '#C7D2FE', '#312E81', '#4338CA', '#10B981', '#059669', '#34D399', '#3B82F6'];

const DocumentResultsModal = ({ document, onClose }) => {
    const [activeTab, setActiveTab] = useState('insights');

    // Safety check for document
    const docId = document?.id;
    const docName = document?.originalFileName || document?.fileName || 'Document';

    const { data: results, isLoading, error } = useQuery({
        queryKey: ['document-transactions', docId],
        queryFn: async () => {
            if (!docId) return { transactions: [] };
            const response = await smeDocumentApi.getTransactions(docId);
            return response.data;
        },
        enabled: !!docId
    });

    const { categoryData, flowData, timelineData, summaryMetrics, isSingleDate, assetData, liabilityData } = useMemo(() => {
        if (!results?.transactions || !Array.isArray(results.transactions)) {
            return {
                categoryData: [], flowData: [], timelineData: [],
                summaryMetrics: { totalIncome: 0, totalExpense: 0, netFlow: 0, avgTransaction: 0, maxTx: { amount: 0, description: 'None' } },
                isSingleDate: false, assetData: [], liabilityData: []
            };
        }

        const txs = results.transactions;

        // 1. Detect if this is a single-date document (Reference/Balance Sheet) vs Time Series
        const dates = new Set(txs.map(t => t.date ? new Date(t.date).toDateString() : 'Invalid Date'));
        const isSingleDate = dates.size <= 1;

        let totalCredit = 0;
        let totalDebit = 0;
        let maxTransaction = { amount: 0, description: 'None' };

        const expenseMap = {};
        const assetMap = {};
        const liabilityMap = {};

        txs.forEach(t => {
            const amount = parseFloat(t.amount) || 0;
            const cat = t.category || 'Uncategorized';
            const desc = t.description || 'Unknown Item';

            if (t.type === 'CREDIT') {
                totalCredit += amount;
                liabilityMap[desc] = (liabilityMap[desc] || 0) + amount;
            } else {
                totalDebit += amount;
                expenseMap[cat] = (expenseMap[cat] || 0) + amount;
                assetMap[desc] = (assetMap[desc] || 0) + amount;
            }

            if (amount > maxTransaction.amount) {
                maxTransaction = { amount, description: desc };
            }
        });

        const categoryData = Object.entries(expenseMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);

        const assetData = Object.entries(assetMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        const liabilityData = Object.entries(liabilityMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        const dateMap = {};
        txs.forEach(t => {
            if (!t.date) return;
            const dateStr = new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
            if (!dateMap[dateStr]) dateMap[dateStr] = { date: dateStr, income: 0, expense: 0 };
            const amt = parseFloat(t.amount) || 0;
            if (t.type === 'CREDIT') dateMap[dateStr].income += amt;
            else dateMap[dateStr].expense += amt;
        });

        const timelineData = Object.values(dateMap).sort((a, b) => new Date(a.date) - new Date(b.date));

        return {
            categoryData,
            flowData: [
                { name: 'Credits', value: totalCredit, fill: '#6366f1' },
                { name: 'Debits', value: totalDebit, fill: '#ef4444' }
            ],
            timelineData,
            summaryMetrics: {
                totalIncome: totalCredit,
                totalExpense: totalDebit,
                netFlow: totalCredit - totalDebit,
                avgTransaction: (totalCredit + totalDebit) / (txs.length || 1),
                maxTx: maxTransaction
            },
            isSingleDate,
            assetData,
            liabilityData
        };
    }, [results]);

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(val || 0);

    const getSummaryText = () => {
        if (!results?.transactions || results.transactions.length === 0) return "Neural engine detected no valid transaction entries in this document.";
        if (isSingleDate) {
            return `Systematic Snapshot: AI detected a single-point financial state with ${formatCurrency(summaryMetrics.totalIncome)} in total credits/liabilities and ${formatCurrency(summaryMetrics.totalExpense)} in assets/debits.`;
        }
        return `Temporal Analysis: Neural engine parsed ${results.transactions.length} entries across ${timelineData.length} active cycles. Primary outflow identified in ${categoryData[0]?.name || 'uncategorized operations'}.`;
    };

    if (!document) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="drm-results-modal" onClick={e => e.stopPropagation()}>
                {/* Header Section */}
                <div className="drm-modal-header">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-black text-slate-800 tracking-tighter">AI Neural Analysis</h2>
                            <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-indigo-100">Verified Insights</span>
                        </div>
                        <span className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-1">
                            <Calendar size={12} /> {docName}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="drm-tabs">
                            <button className={`drm-tab ${activeTab === 'insights' ? 'active' : ''}`} onClick={() => setActiveTab('insights')}>
                                <Sparkles size={16} /> Insights
                            </button>
                            <button className={`drm-tab ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}>
                                <List size={16} /> Database
                            </button>
                        </div>
                        <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400" onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="drm-modal-content">
                    {isLoading ? (
                        <div className="h-[500px] flex flex-col items-center justify-center text-slate-400 gap-4">
                            <Activity className="animate-spin text-indigo-500" size={48} />
                            <p className="font-black text-sm uppercase tracking-widest">Executing Neural Inference...</p>
                        </div>
                    ) : error ? (
                        <div className="h-[500px] flex flex-col items-center justify-center text-rose-500 gap-4">
                            <AlertCircle size={48} />
                            <p className="font-black">Neural Parsing Failed</p>
                            <span className="text-xs text-slate-400 mt-2">{error.message}</span>
                        </div>
                    ) : (
                        <div className="py-6 space-y-8">
                            {/* Summary Banner */}
                            <div className="bg-indigo-600 rounded-[28px] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles size={20} className="text-indigo-200" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Executive Summary</span>
                                    </div>
                                    <p className="text-lg font-bold leading-relaxed max-w-3xl">{getSummaryText()}</p>
                                </div>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -mr-20 -mt-20" />
                                <div className="absolute bottom-0 right-10 w-24 h-24 bg-indigo-400/20 blur-[40px] rounded-full" />
                            </div>

                            {activeTab === 'insights' ? (
                                <>
                                    {/* Metrics Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {[
                                            { label: 'Total Inflow', value: summaryMetrics?.totalIncome || 0, color: 'text-indigo-600', icon: <TrendingUp />, bg: 'bg-indigo-50' },
                                            { label: 'Total Outflow', value: summaryMetrics?.totalExpense || 0, color: 'text-rose-600', icon: <TrendingDown />, bg: 'bg-rose-50' },
                                            { label: 'Net Position', value: Math.abs(summaryMetrics?.netFlow || 0), color: (summaryMetrics?.netFlow || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600', icon: <DollarSign />, bg: (summaryMetrics?.netFlow || 0) >= 0 ? 'bg-emerald-50' : 'bg-rose-50' },
                                            { label: 'Peak Transaction', value: summaryMetrics?.maxTx?.amount || 0, color: 'text-amber-600', icon: <AlertCircle />, bg: 'bg-amber-50', sub: summaryMetrics?.maxTx?.description }
                                        ].map((m, i) => (
                                            <div key={i} className="bg-white border border-slate-100 p-6 rounded-[28px] shadow-sm hover:shadow-md transition-all duration-300">
                                                <div className={`w-12 h-12 ${m.bg} ${m.color} rounded-2xl flex items-center justify-center mb-4 shadow-inner`}>
                                                    {m.icon}
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.label}</span>
                                                <p className={`text-2xl font-black mt-1 ${m.color}`}>{formatCurrency(m.value)}</p>
                                                {m.sub && <p className="text-[10px] font-bold text-slate-400 mt-2 truncate max-w-full italic text-opacity-80">// {m.sub}</p>}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Charts Section */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm">
                                            <div className="flex items-center justify-between mb-8">
                                                <h3 className="font-black text-slate-800 text-lg">Allocation Analytics</h3>
                                                <div className="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center"><PieIcon size={16} /></div>
                                            </div>
                                            <div className="h-[300px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={categoryData.length > 0 ? categoryData : [{ name: 'Empty', value: 1 }]}
                                                            cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none"
                                                        >
                                                            {(categoryData.length > 0 ? categoryData : [{ name: 'Empty', value: 1 }]).map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip formatter={(val) => formatCurrency(val)} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }} />
                                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        <div className="bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm">
                                            <div className="flex items-center justify-between mb-8">
                                                <h3 className="font-black text-slate-800 text-lg">Stochastic Momentum</h3>
                                                <div className="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center"><Activity size={16} /></div>
                                            </div>
                                            <div className="h-[300px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={timelineData}>
                                                        <defs>
                                                            <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                                        <Tooltip formatter={(val) => formatCurrency(val)} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }} />
                                                        <Area type="monotone" dataKey="income" stroke="#6366f1" strokeWidth={4} fill="url(#colorWave)" />
                                                        <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-100">
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Date</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descriptor</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vector</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantum</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Class</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {results?.transactions?.map((tx, idx) => (
                                                    <tr key={tx.id || idx} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-black text-slate-800">{tx.date ? new Date(tx.date).toLocaleDateString() : 'N/A'}</span>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Cycle Node</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="text-xs font-bold text-slate-600 max-w-md truncate" title={tx.description}>{tx.description}</p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${tx.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                                {tx.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`text-sm font-black ${tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-slate-800'}`}>{formatCurrency(tx.amount)}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
                                                                {tx.category || 'PROCESSING'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {(!results?.transactions || results.transactions.length === 0) && (
                                        <div className="p-20 text-center text-slate-400 font-bold italic">
                                            No atomic ledger entries detected in this document.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentResultsModal;
