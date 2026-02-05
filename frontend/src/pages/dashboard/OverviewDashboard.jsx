import React, { Suspense, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
    Wallet, CreditCard, TrendingUp, Plus, Filter,
    Sparkles, ChevronRight, History, Utensils,
    ShoppingBag, Car, Tag, Target, ArrowUpRight,
    ArrowDownRight, Activity, PieChart, Calendar,
    Fingerprint, Gauge, ShieldCheck, Zap, MoreHorizontal
} from 'lucide-react';
import { dashboardApi, aiApi } from '../../api/api';
import { format } from 'date-fns';
import SmartStatCard from '../../components/dashboard/SmartStatCard';

const OverviewDashboard = () => {
    const navigate = useNavigate();
    const [aiAdvice, setAiAdvice] = useState(null);

    // Robust User Parsing
    const [user, setUser] = useState({ id: 1, fullName: 'Analyst' });

    useEffect(() => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr && userStr !== 'undefined') {
                setUser(JSON.parse(userStr));
            }
        } catch (e) {
            console.error("User parsing error", e);
        }
    }, []);

    const { data: summary, isLoading } = useQuery({
        queryKey: ['dashboard-summary'],
        queryFn: () => dashboardApi.getSummary().then(res => res.data),
    });

    useEffect(() => {
        if (summary && user?.id) {
            aiApi.getAdvice({
                userId: user.id,
                query: "Give me a 1-sentence quick snapshot of my finances.",
                language: 'en'
            }).then(res => {
                setAiAdvice(res.data.advice);
            }).catch(() => {
                setAiAdvice("Assets are synced. Ready for neural optimization?");
            });
        }
    }, [summary, user?.id]);

    const getTxIcon = (category) => {
        const size = 18;
        const cat = category?.toUpperCase() || '';
        if (cat.includes('FOOD')) return { icon: <Utensils size={size} />, color: 'bg-amber-100 text-amber-600' };
        if (cat.includes('SHOPPING')) return { icon: <ShoppingBag size={size} />, color: 'bg-indigo-100 text-indigo-600' };
        if (cat.includes('TRANSPORT')) return { icon: <Car size={size} />, color: 'bg-emerald-100 text-emerald-600' };
        return { icon: <Tag size={size} />, color: 'bg-slate-100 text-slate-500' };
    };

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2 bg-indigo-50 w-fit px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-indigo-600 uppercase border border-indigo-100/50">
                        <ShieldCheck size={12} /> Financial Integrity Dashboard
                    </div>
                    <h1 className="text-4xl font-black text-[#1B254B] tracking-tight">
                        Financial Health Snapshot
                    </h1>
                    <p className="text-slate-400 font-bold mt-2">
                        Welcome back, <span className="text-[#1B254B]">{user?.fullName || 'Analyst'}</span>.
                    </p>
                </div>

                <div className="flex gap-4">
                    <button className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-400">
                        <Filter size={20} />
                    </button>
                    <Link to="/expenses" className="flex items-center gap-3 px-6 py-3.5 bg-[#4318FF] text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:-translate-y-1 transition-all">
                        <Plus size={20} /> INGEST DATA
                    </Link>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SmartStatCard
                    title="Aggregated Liquidity"
                    amount={isLoading ? "..." : `₹${(summary?.totalBalance || 0).toLocaleString()}`}
                    change="REAL-TIME"
                    icon={<Wallet />}
                    isLoading={isLoading}
                />
                <SmartStatCard
                    title="Burn Rate (Monthly)"
                    amount={isLoading ? "..." : `₹${(summary?.monthlySpending || 0).toLocaleString()}`}
                    change="ACTIVE"
                    icon={<CreditCard />}
                    isLoading={isLoading}
                />
                <SmartStatCard
                    title="Growth Portfolios"
                    amount={isLoading ? "..." : `₹${(summary?.totalInvestments || 0).toLocaleString()}`}
                    change="+4.2%"
                    isPositive={true}
                    icon={<TrendingUp />}
                    isLoading={isLoading}
                />
                <SmartStatCard
                    title="Stochastic Score"
                    amount={isLoading ? "..." : (summary?.totalBudget > 0 ? `${Math.round(summary?.budgetUsagePercentage)}/100` : "845")}
                    change="OPTIMAL"
                    isPositive={true}
                    icon={<Gauge />}
                    hideArrow={true}
                    isLoading={isLoading}
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 bg-white rounded-[32px] p-10 shadow-[14px_17px_40px_4px_rgba(112,144,176,0.08)] border border-slate-50 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-[#1B254B]">Stochastic Spending Hub</h3>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Last 30 Days</p>
                        </div>
                    </div>

                    <div className="h-[400px] w-full bg-[#f8faff]/50 rounded-[24px] border border-dashed border-slate-200 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4 text-slate-300">
                            <PieChart size={64} className="animate-pulse" />
                            <span className="font-black text-xs uppercase tracking-[0.3em]">Processing Render...</span>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-3 gap-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fixed Overhead</span>
                            <span className="text-lg font-black text-[#1B254B]">₹42,500</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Variable Burn</span>
                            <span className="text-lg font-black text-[#1B254B]">₹28,120</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Savings</span>
                            <span className="text-lg font-black text-emerald-500">₹14,400</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[32px] shadow-[14px_17px_40px_4px_rgba(112,144,176,0.08)] border border-slate-50">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xl font-black text-[#1B254B]">Surveillance</h3>
                        </div>
                        <Link to="/expenses" className="p-2 bg-slate-50 rounded-xl text-slate-400">
                            <MoreHorizontal size={20} />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {summary?.recentTransactions?.slice(0, 5).map((tx, idx) => {
                            const { icon, color } = getTxIcon(tx.category);
                            return (
                                <div key={tx.id || idx} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-white transition-all cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center ${color}`}>
                                            {icon}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-[#1B254B] truncate max-w-[120px]">{tx.description}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{tx.category?.replace('_', ' ')}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-black ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-[#1B254B]'}`}>
                                            {tx.type === 'INCOME' ? '+' : '-'}₹{(tx.amount || 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-[#4318FF] to-[#7018FF] rounded-[40px] p-12 text-white relative shadow-[0px_40px_80px_rgba(67,24,255,0.2)]">
                <div className="relative z-10 max-w-3xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-white/20 rounded-2xl">
                            <Sparkles size={24} className="text-white" />
                        </div>
                        <span className="font-black text-white uppercase tracking-[0.3em] text-[10px]">Stochastic AI Intel</span>
                    </div>

                    <h2 className="text-4xl font-black mb-8 leading-[1.1] tracking-tight">
                        {aiAdvice ? `"${aiAdvice}"` : "Initializing neural analysis..."}
                    </h2>

                    <div className="flex gap-4">
                        <Link to="/advisor" className="px-10 py-4 bg-white text-[#4318FF] rounded-2xl font-black text-sm text-center">
                            OPTIMIZE PORTFOLIO
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewDashboard;
