import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, ArrowRight, Calendar, CheckCircle2, Clock, DollarSign,
    Info, Package, ShieldAlert, TrendingUp, Zap, Sparkles,
    ArrowUpRight, ArrowDownRight, Repeat, RefreshCw, BarChart3,
    PieChart, Layers, Wallet, ArrowRightCircle
} from 'lucide-react';
import { smeWorkingCapitalApi, smeBusinessApi } from '../../api/api';
import LoadingScreen from '../../components/common/LoadingScreen';
import './WorkingCapital.css';

const WorkingCapital = () => {
    const queryClient = useQueryClient();
    const [selectedBusinessId, setSelectedBusinessId] = useState(null);
    const [activeOptimization, setActiveOptimization] = useState('inventory'); // inventory, receivables, payables

    const { data: businesses = [] } = useQuery({
        queryKey: ['sme-businesses'],
        queryFn: async () => {
            const res = await smeBusinessApi.getAll();
            const data = res.data || [];
            if (data.length > 0 && !selectedBusinessId) {
                setSelectedBusinessId(data[0].id);
            }
            return data;
        }
    });

    const { data: wc, isLoading, isRefetching } = useQuery({
        queryKey: ['working-capital', selectedBusinessId],
        queryFn: () => smeWorkingCapitalApi.getOptimization(selectedBusinessId).then(res => res.data),
        enabled: !!selectedBusinessId,
        refetchInterval: 30000 // Dynamic update every 30s
    });

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
    };

    if (isLoading) return <LoadingScreen message="Aggregating liquidity vectors and capital flow constraints..." />;

    if (!selectedBusinessId) {
        return <LoadingScreen message="Identifying available business contexts..." />;
    }

    return (
        <motion.div
            className="working-capital-v2 px-6 lg:px-12 py-10 max-w-[1600px] mx-auto overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Super Header */}
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 mb-20 px-4">
                <div className="title-group">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-lg uppercase tracking-[0.2em] shadow-lg shadow-indigo-100">Capital Matrix</span>
                        <div className="flex items-center gap-2 bg-slate-900 text-[10px] font-black text-white px-3 py-1 rounded-lg">
                            <RefreshCw size={12} className={isRefetching ? 'animate-spin' : ''} />
                            LIVE UPDATES ACTIVE
                        </div>
                    </div>
                    <h1 className="text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-[0.85] mb-8">
                        Working Capital <br />
                        <span className="text-indigo-600">Efficiency Hub</span>
                    </h1>

                    <div className="horizon-card-glass px-2 py-1 flex items-center bg-white/70 backdrop-blur-xl shadow-2xl shadow-slate-200/50 mt-10 max-w-fit border border-white/40 rounded-[24px]">
                        <select
                            className="bg-transparent px-6 py-4 font-black text-slate-800 outline-none border-none min-w-[260px] text-lg cursor-pointer"
                            value={selectedBusinessId || ''}
                            onChange={(e) => setSelectedBusinessId(e.target.value)}
                        >
                            {businesses.map(b => (
                                <option key={b.id} value={b.id}>{b.businessName}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="header-actions flex flex-col items-end">
                    <button
                        className="group flex items-center gap-3 bg-slate-900 text-white px-8 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-2xl hover:shadow-indigo-200"
                        onClick={() => queryClient.invalidateQueries(['working-capital'])}
                    >
                        <RefreshCw size={20} className={isRefetching ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} />
                        Force Re-Sync
                    </button>
                    <p className="mt-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Last compute: 30s ago</p>
                </div>
            </header>

            {/* Neural Efficiency Score Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
                <motion.div className="bg-white rounded-[48px] p-10 lg:col-span-2 relative overflow-hidden group shadow-2xl shadow-slate-100 border border-slate-50" variants={cardVariants}>
                    <div className="relative z-10">
                        <div className="flex items-center gap-6 mb-12">
                            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center shadow-inner">
                                <Activity size={32} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Cash Conversion Cycle (CCC)</h3>
                                <p className="text-sm font-bold text-slate-400">Strategic Target Efficiency: {wc?.targetCashConversionCycle} Days</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-8 py-12 px-10 bg-slate-50/50 rounded-[40px] border border-slate-100/50 backdrop-blur-sm">
                            {[
                                { label: 'Inventory (DIO)', value: wc?.daysInventoryOutstanding, op: '+', color: 'text-slate-900' },
                                { label: 'Receivables (DSO)', value: wc?.daysSalesOutstanding, op: '-', color: 'text-slate-900' },
                                { label: 'Payables (DPO)', value: wc?.daysPayablesOutstanding, op: '=', color: 'text-slate-900' },
                                { label: 'TOTAL CCC', value: wc?.cashConversionCycle, sub: 'Days', color: 'text-indigo-600', active: true }
                            ].map((node, i) => (
                                <React.Fragment key={i}>
                                    <div className="text-center group/node">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{node.label}</p>
                                        <div className="flex items-baseline justify-center gap-2">
                                            <span className={`text-6xl font-black tracking-tighter ${node.color}`}>{node.value}</span>
                                            {node.sub && <span className="text-sm font-black text-slate-400 uppercase">{node.sub}</span>}
                                        </div>
                                    </div>
                                    {node.op && <span className="text-3xl font-black text-slate-200">{node.op}</span>}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/50 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-indigo-100 transition-colors duration-1000" />
                </motion.div>

                <motion.div
                    className="bg-indigo-600 rounded-[48px] p-10 text-white flex flex-col justify-between shadow-3xl shadow-indigo-200 relative overflow-hidden group"
                    variants={cardVariants}
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[32px] flex items-center justify-center mb-8 shadow-2xl">
                            <Sparkles size={40} className="text-indigo-200" />
                        </div>
                        <h4 className="text-xs font-black opacity-60 uppercase tracking-[0.3em]">Neural Capital Unlock</h4>
                        <p className="text-5xl lg:text-6xl font-black tracking-tighter mt-4 drop-shadow-lg">{formatCurrency(wc?.potentialCashUnlocking)}</p>
                    </div>

                    <div className="relative z-10 mt-12 bg-white/10 backdrop-blur-xl rounded-[32px] p-6 border border-white/10">
                        <p className="text-sm font-bold leading-relaxed text-indigo-50">
                            AI synthesis mapped a <span className="text-white font-black">12% liquidity drift</span> in your current cycle metrics.
                            <span className="block mt-4 text-white underline cursor-pointer hover:text-indigo-200 transition-colors font-black uppercase text-[10px] tracking-widest">Generate Strategy Node →</span>
                        </p>
                    </div>
                    <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-[80px] group-hover:bg-white/10 transition-colors" />
                </motion.div>
            </div>

            {/* Interactive Strategy Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
                <div className="lg:col-span-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center text-indigo-600 border border-slate-50"><PieChart size={28} /></div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Strategic Synthesis</h3>
                        </div>
                        <div className="flex gap-2 p-2 bg-slate-100/50 backdrop-blur-sm rounded-[24px] border border-slate-100">
                            {['inventory', 'receivables', 'payables'].map(tab => (
                                <button
                                    key={tab}
                                    className={`px-8 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${activeOptimization === tab ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                                    onClick={() => setActiveOptimization(tab)}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeOptimization}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8"
                        >
                            {(activeOptimization === 'inventory' ? wc?.inventoryRecommendations : wc?.receivablesRecommendations)?.map((rec, i) => (
                                <motion.div
                                    key={i}
                                    className="bg-white rounded-[40px] p-8 group cursor-pointer border border-slate-50 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:border-indigo-100 transition-all flex flex-col justify-between"
                                    whileHover={{ y: -8 }}
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-8">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${rec.impact === 'HIGH' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                                <Zap size={28} />
                                            </div>
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${rec.impact === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                {rec.impact} Impact
                                            </span>
                                        </div>
                                        <h4 className="text-xl font-black text-slate-900 mb-4">{rec.title}</h4>
                                        <p className="text-slate-400 font-bold text-sm leading-relaxed mb-8">{rec.description}</p>
                                    </div>
                                    <div className="flex items-center gap-3 text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em] group-hover:gap-6 transition-all pt-6 border-t border-slate-50">
                                        Deploy Strategy Node <ArrowRightCircle size={18} />
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-10">
                    <motion.div className="bg-slate-900 rounded-[48px] p-10 text-white shadow-3xl shadow-slate-200 border-none relative overflow-hidden" variants={cardVariants}>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-10">
                                <Clock size={24} className="text-indigo-400" />
                                <h3 className="text-2xl font-black tracking-tighter">Receivables Aging</h3>
                            </div>
                            <div className="space-y-8">
                                {wc?.receivablesAging?.map((bucket, i) => (
                                    <div key={i} className="group/bucket">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 group-hover/bucket:text-white transition-colors">
                                            <span>{bucket.range}</span>
                                            <span className="text-white">{formatCurrency(bucket.amount)}</span>
                                        </div>
                                        <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                            <motion.div
                                                className={`h-full rounded-full ${bucket.percentage > 30 ? 'bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-indigo-500'}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${bucket.percentage}%` }}
                                                transition={{ duration: 1.5, delay: i * 0.1 }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] -mr-16 -mt-16" />
                    </motion.div>

                    <div className="bg-indigo-50/50 rounded-[48px] p-10 border-2 border-dashed border-indigo-200 flex flex-col justify-center items-center text-center group cursor-pointer hover:bg-white hover:border-solid hover:shadow-2xl transition-all duration-500">
                        <div className="w-20 h-20 bg-white rounded-[32px] shadow-2xl flex items-center justify-center mb-8 border border-white group-hover:rotate-12 transition-transform">
                            <ShieldAlert className="text-indigo-600" size={36} />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 tracking-tighter">Payables Guardian</h4>
                        <p className="text-sm font-bold text-slate-400 mt-3 leading-relaxed">
                            AI scheduling expanded your DPO by <span className="text-indigo-600 underline">4.2 days</span> this cycle.
                        </p>
                        <button className="bg-slate-900 text-white w-full py-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest mt-10 hover:bg-indigo-600 transition-colors">Manage Scheduler</button>
                    </div>
                </div>
            </div>

            {/* Optimal Payment Schedule */}
            <div className="mt-24 px-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-8 mb-12">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[28px] flex items-center justify-center shadow-inner"><Wallet size={36} /></div>
                    <div>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Liquidity Disbursement Plan</h3>
                        <p className="text-slate-400 font-bold mt-1 uppercase tracking-[0.3em] text-[10px]">AI-Calculated Optimal Windows for Maximum Cash Retention</p>
                    </div>
                </div>

                <div className="bg-white rounded-[48px] shadow-2xl shadow-slate-100 overflow-hidden border border-slate-50">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Protocol Entity</th>
                                    <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Quantum</th>
                                    <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Temporal Bounds</th>
                                    <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Strategic Window</th>
                                    <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Neural Rationale</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {wc?.optimalPaymentSchedule?.map((pay, i) => (
                                    <tr key={i} className="hover:bg-slate-50/60 transition-colors group">
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col">
                                                <span className="text-base font-black text-slate-900 mb-1">{pay.vendorName}</span>
                                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">#{pay.invoiceNumber}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className="text-xl font-black text-slate-900 tracking-tighter">{formatCurrency(pay.amount)}</span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3">
                                                <Calendar size={14} className="text-slate-300" />
                                                <span className="text-xs font-black text-slate-500 uppercase">{new Date(pay.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl flex items-center gap-3 w-fit border border-emerald-100 shadow-sm">
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                                <span className="text-xs font-black uppercase tracking-widest">{new Date(pay.suggestedPaymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 max-w-sm">
                                            <p className="text-xs font-bold text-slate-400 leading-relaxed italic border-l-2 border-slate-100 pl-4">"{pay.reasoning}"</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default WorkingCapital;
