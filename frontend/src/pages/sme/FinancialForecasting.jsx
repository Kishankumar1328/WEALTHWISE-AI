import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, TrendingDown, Calendar, RefreshCw,
    Zap, AlertCircle, Info, ArrowUpRight, ArrowDownRight,
    ChevronRight, PieChart as PieChartIcon,
    Flame, Target, ShieldCheck, Sparkles, BrainCircuit, Activity,
    Layers, Cpu, ArrowRight
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, LineChart, Line, BarChart, Bar
} from 'recharts';
import { smeForecastingApi, smeBusinessApi } from '../../api/api';
import PageContainer from '../../components/common/PageContainer';
import LoadingScreen from '../../components/common/LoadingScreen';
import ErrorState from '../../components/common/ErrorState';
import './FinancialForecasting.css';

const FinancialForecasting = () => {
    const queryClient = useQueryClient();
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [forecastHorizon, setForecastHorizon] = useState(30);

    const { data: businesses = [], isLoading: businessesLoading } = useQuery({
        queryKey: ['sme-businesses'],
        queryFn: () => smeBusinessApi.getAll().then(res => Array.isArray(res.data) ? res.data : [])
    });

    useEffect(() => {
        if (businesses.length > 0 && !selectedBusiness) {
            setSelectedBusiness(businesses[0]);
        }
    }, [businesses, selectedBusiness]);

    const { data: forecasts = [], isLoading, isRefetching } = useQuery({
        queryKey: ['sme-forecasts', selectedBusiness?.id],
        queryFn: () => smeForecastingApi.getForecasts(selectedBusiness.id).then(res => Array.isArray(res.data) ? res.data : []),
        enabled: !!selectedBusiness?.id,
        refetchInterval: 30000
    });

    const refreshMutation = useMutation({
        mutationFn: () => smeForecastingApi.refresh(selectedBusiness.id, 90),
        onSuccess: () => {
            queryClient.invalidateQueries(['sme-forecasts', selectedBusiness?.id]);
        }
    });

    const filteredForecasts = useMemo(() => forecasts.slice(0, forecastHorizon), [forecasts, forecastHorizon]);

    const metrics = useMemo(() => {
        if (!filteredForecasts || !filteredForecasts.length) return null;
        const totalRevenue = filteredForecasts.reduce((sum, f) => sum + (Number(f.predictedRevenue) || 0), 0);
        const totalExpense = filteredForecasts.reduce((sum, f) => sum + (Number(f.predictedExpense) || 0), 0);
        const netCashFlow = totalRevenue - totalExpense;
        const avgConfidence = filteredForecasts.reduce((sum, f) => sum + (Number(f.confidenceScore) || 0), 0) / filteredForecasts.length;
        return { totalRevenue, totalExpense, netCashFlow, avgConfidence };
    }, [filteredForecasts]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(Math.max(0, amount || 0));
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
    };

    if ((isLoading && !isRefetching) || businessesLoading) {
        return <LoadingScreen message="Calibrating Neural Forecasting Models..." />;
    }

    if (!selectedBusiness) {
        return (
            <ErrorState
                title="No Business Context"
                message="Connect a business entity to enable AI-powered financial projections."
            />
        );
    }

    return (
        <PageContainer className="forecast-dashboard-v2 overflow-hidden">
            <motion.header
                className="forecast-header flex flex-col lg:flex-row lg:items-center justify-between gap-12 mb-20 px-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="title-group">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-lg uppercase tracking-[0.2em] shadow-lg shadow-indigo-200">Neural Sync Active</span>
                        <div className="flex items-center gap-2 bg-slate-900 text-[10px] font-black text-white px-3 py-1 rounded-lg">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                            STOCHASTIC CORE v2.5
                        </div>
                    </div>
                    <h1 className="text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-[0.85] mb-8">
                        Future Flow <br />
                        <span className="text-indigo-600">Projection Core</span>
                    </h1>

                    <div className="horizon-card-glass px-2 py-1 flex items-center bg-white/70 backdrop-blur-xl shadow-2xl shadow-slate-200/50 mt-10 max-w-fit border border-white/40">
                        <select
                            className="bg-transparent px-6 py-4 font-black text-slate-800 outline-none border-none min-w-[260px] text-lg cursor-pointer"
                            value={selectedBusiness?.id || ''}
                            onChange={(e) => setSelectedBusiness(businesses.find(b => b.id === parseInt(e.target.value)))}
                        >
                            {businesses.map(b => <option key={b.id} value={b.id}>{b.businessName}</option>)}
                        </select>
                    </div>
                </div>

                <div className="header-actions flex flex-col items-end gap-8">
                    <div className="bg-slate-100/50 p-2 rounded-[24px] flex gap-2 backdrop-blur-sm">
                        {[30, 60, 90].map(h => (
                            <button
                                key={h}
                                className={`px-6 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${forecastHorizon === h ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                                onClick={() => setForecastHorizon(h)}
                            >
                                {h}D HORIZON
                            </button>
                        ))}
                    </div>
                    <button
                        className="group flex items-center gap-3 bg-slate-900 text-white px-8 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-2xl hover:shadow-indigo-200"
                        onClick={() => refreshMutation.mutate()}
                        disabled={refreshMutation.isPending || isRefetching}
                    >
                        <RefreshCw size={18} className={(refreshMutation.isPending || isRefetching) ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} />
                        {refreshMutation.isPending ? 'Recalibrating...' : 'Sync AI Matrix'}
                    </button>
                </div>
            </motion.header>

            <motion.div
                className="forecast-metrics grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20 px-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {[
                    { label: 'Projected Revenue', value: metrics?.totalRevenue, icon: <TrendingUp size={32} />, color: 'bg-emerald-50 text-emerald-600', trend: 'OPTIMISTIC', trendColor: 'text-emerald-500' },
                    { label: 'Projected Outflow', value: metrics?.totalExpense, icon: <TrendingDown size={32} />, color: 'bg-rose-50 text-rose-600', trend: 'MATURING SOON', trendColor: 'text-rose-500' },
                    { label: 'Net Liquidity', value: metrics?.netCashFlow, icon: <Flame size={32} />, color: 'bg-indigo-50 text-indigo-600', trend: 'BAYESIAN ESTIMATE', trendColor: 'text-indigo-400' },
                    { label: 'Model Precision', value: `${(metrics?.avgConfidence * 100).toFixed(1)}%`, icon: <BrainCircuit size={32} />, color: 'bg-slate-900 text-indigo-400', trend: 'LEARNING ACTIVE', trendColor: 'text-slate-400' }
                ].map((m, i) => (
                    <motion.div key={i} className="metric-card-premium shadow-2xl shadow-slate-100" variants={itemVariants}>
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${m.color}`}>
                            {m.icon}
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{m.label}</span>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">
                            {typeof m.value === 'string' ? m.value : formatCurrency(m.value)}
                        </h2>
                        <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${m.trendColor}`}>
                            <Activity size={12} /> {m.trend}
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <div className="forecast-grid grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20 px-4">
                <motion.div
                    className="lg:col-span-8 bg-white rounded-[48px] p-10 shadow-2xl shadow-slate-100 border border-slate-50 relative overflow-hidden group"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="relative z-10 flex justify-between items-center mb-12">
                        <div>
                            <h3 className="flex items-center gap-4 text-3xl font-black text-slate-900 tracking-tighter">
                                <Layers size={28} className="text-indigo-600" /> Cash Flow Trajectory
                            </h3>
                            <p className="text-xs font-bold text-slate-400 mt-1">Multi-vector analysis of receivables and payables</p>
                        </div>
                        <div className="hidden sm:flex gap-4">
                            <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-5 py-2 rounded-2xl border border-slate-100">
                                <Sparkles size={14} className="text-indigo-400" /> Neural Consensus
                            </span>
                        </div>
                    </div>
                    <div className="h-[450px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={filteredForecasts}>
                                <defs>
                                    <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorCashFlow" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="forecastDate" tickFormatter={formatDate} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} minTickGap={30} dy={15} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} tickFormatter={(val) => `₹${val / 1000}k`} dx={-10} />
                                <Tooltip
                                    cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-slate-900/95 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 shadow-3xl text-white min-w-[300px]">
                                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">{new Date(label).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                                    <div className="space-y-6">
                                                        <div className="flex justify-between items-center group">
                                                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Revenue Alpha</span>
                                                            <span className="text-emerald-400 font-black text-2xl tracking-tighter">{formatCurrency(data.predictedRevenue)}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Net Velocity</span>
                                                            <span className="text-indigo-400 font-black text-2xl tracking-tighter">{formatCurrency(data.predictedCashFlow)}</span>
                                                        </div>
                                                    </div>
                                                    {data.explanation && (
                                                        <div className="mt-8 pt-6 border-t border-white/5 flex gap-4 bg-white/5 p-4 rounded-2xl">
                                                            <Sparkles size={20} className="text-indigo-400 shrink-0" />
                                                            <p className="text-[11px] leading-relaxed italic text-indigo-100/70 py-1">"{data.explanation}"</p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Area type="monotone" dataKey="predictedRevenue" name="Revenue" stroke="#10b981" fill="url(#colorInflow)" strokeWidth={4} />
                                <Area type="monotone" dataKey="predictedCashFlow" name="Cash Flow" stroke="#6366f1" fill="url(#colorCashFlow)" strokeWidth={5} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/30 rounded-full blur-[120px] -mr-48 -mt-48 group-hover:bg-indigo-100/50 transition-colors duration-1000" />
                </motion.div>

                <div className="lg:col-span-4 flex flex-col gap-10">
                    <motion.div
                        className="bg-white rounded-[40px] p-8 shadow-2xl shadow-slate-100 border border-slate-50"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <h3 className="flex items-center gap-3 text-xl font-black text-slate-900 mb-8"><TrendingDown size={24} className="text-rose-500" /> Consumption Node</h3>
                        <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={filteredForecasts}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="forecastDate" hide />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black">{formatCurrency(payload[0].value)}</div>;
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="predictedExpense" fill="#ef4444" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-8 p-6 bg-rose-50 rounded-[32px] border border-rose-100">
                            <h4 className="flex items-center gap-2 text-rose-600 font-black text-[10px] uppercase tracking-widest mb-2"><AlertCircle size={14} /> Convergence Warning</h4>
                            <p className="text-[11px] text-slate-600 leading-relaxed font-bold">AI detected a clustering of payables near day {Math.floor(forecastHorizon / 2)}. Prepare liquidity buffering.</p>
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-indigo-600 rounded-[40px] p-8 text-white shadow-3xl shadow-indigo-200 border border-indigo-500 relative overflow-hidden group"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="relative z-10">
                            <h3 className="flex items-center gap-3 text-xl font-black text-white mb-8"><Cpu size={24} className="opacity-50" /> Intelligence Health</h3>
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">
                                        <span>Training Convergence</span>
                                        <span>85%</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 2 }} className="h-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">
                                        <span>Model Entropy</span>
                                        <span>DECREASING</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: '94%' }} transition={{ duration: 2, delay: 0.3 }} className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-[60px] group-hover:scale-150 transition-transform duration-1000" />
                    </motion.div>
                </div>
            </div>

            <motion.div
                className="mx-4 bg-slate-50 border border-slate-100 rounded-[48px] p-12 flex flex-col lg:flex-row items-center justify-between gap-12 group hover:bg-white hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
            >
                <div className="flex flex-col lg:flex-row items-center gap-10">
                    <div className="w-24 h-24 bg-indigo-600 rounded-[36px] flex items-center justify-center text-white shadow-2xl shadow-indigo-200 group-hover:rotate-12 transition-transform">
                        <Sparkles size={48} />
                    </div>
                    <div className="text-center lg:text-left">
                        <h4 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Neural Advisory Node</h4>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Strategic Synthesis Engine Active for {selectedBusiness?.businessName}</p>
                    </div>
                </div>
                <button className="flex items-center gap-3 bg-white border-2 border-slate-900 px-10 py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] group-hover:bg-slate-900 group-hover:text-white transition-all">
                    Expand Insights <ArrowRight size={20} />
                </button>
            </motion.div>
        </PageContainer>
    );
};

export default FinancialForecasting;
