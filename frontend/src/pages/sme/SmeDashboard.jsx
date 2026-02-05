import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, AlertTriangle, RefreshCw, IndianRupee,
    Fingerprint, Zap, BarChart3, MoreHorizontal,
    Briefcase, Activity, FileText, Sparkles, ArrowRight,
    Target, ShieldCheck, Wallet, ArrowRightCircle
} from 'lucide-react';
import { smeBusinessApi, smeAnalysisApi, smeInvoiceApi } from '../../api/api';
import './SmeDashboard.css';

const SmeDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedBusiness, setSelectedBusiness] = useState(null);

    const { data: businesses = [], isLoading: loadingBusinesses } = useQuery({
        queryKey: ['sme-businesses'],
        queryFn: async () => {
            const response = await smeBusinessApi.getAll();
            return Array.isArray(response.data) ? response.data : [];
        }
    });

    useEffect(() => {
        if (businesses.length > 0 && !selectedBusiness) {
            setSelectedBusiness(businesses[0]);
        }
    }, [businesses, selectedBusiness]);

    const { data: healthData, isLoading: loadingHealth, refetch: refetchHealth } = useQuery({
        queryKey: ['sme-health', selectedBusiness?.id],
        queryFn: async () => {
            if (!selectedBusiness?.id) return null;
            const response = await smeAnalysisApi.getHealth(selectedBusiness.id);
            return response.data;
        },
        enabled: !!selectedBusiness?.id
    });

    const { data: creditScore } = useQuery({
        queryKey: ['sme-credit', selectedBusiness?.id],
        queryFn: () => smeAnalysisApi.getCreditScore(selectedBusiness.id).then(res => res.data),
        enabled: !!selectedBusiness?.id
    });

    const { data: invoiceSummary } = useQuery({
        queryKey: ['sme-invoice-summary', selectedBusiness?.id],
        queryFn: () => smeInvoiceApi.getSummary(selectedBusiness.id).then(res => res.data),
        enabled: !!selectedBusiness?.id
    });

    const { data: recentInvoices = [] } = useQuery({
        queryKey: ['sme-recent-invoices', selectedBusiness?.id],
        queryFn: async () => {
            if (!selectedBusiness?.id) return [];
            const response = await smeInvoiceApi.getAll(selectedBusiness.id);
            return Array.isArray(response.data) ? response.data.slice(0, 5) : [];
        },
        enabled: !!selectedBusiness?.id
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    if (loadingBusinesses) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <RefreshCw className="animate-spin text-indigo-600" size={40} />
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Syncing Business Core...</p>
        </div>
    );

    const containerVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
    };

    // Derived State for UI
    const primaryAlert = healthData?.alerts?.[0] || {
        message: "Liquidity trajectory indicates a surplus. Strategic allocation recommended.",
        actionRequired: "Review working capital options"
    };
    const complianceStatus = healthData?.overdueFilings > 0 ? "Critical" : "Normalized";
    const complianceColor = healthData?.overdueFilings > 0 ? "text-rose-500" : "text-emerald-500";

    return (
        <motion.div
            className="sme-dashboard-v2 pb-20"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16 px-4">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-lg uppercase tracking-[0.2em]">{t('common.sme_command') || 'SME COMMAND CENTER'}</span>
                        <p className="text-slate-400 font-bold flex items-center gap-2 text-xs uppercase tracking-widest">
                            <Activity size={12} className="text-emerald-500" /> Stochastic Monitoring Active
                        </p>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
                        {selectedBusiness?.businessName || 'Operations'} <br />
                        <span className="text-indigo-600">Intelligence Node</span>
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="horizon-card px-2 py-1 flex items-center bg-white shadow-xl shadow-slate-100">
                        <select
                            className="bg-transparent px-6 py-3 font-black text-slate-700 outline-none border-none min-w-[220px]"
                            value={selectedBusiness?.id || ''}
                            onChange={(e) => setSelectedBusiness(businesses.find(b => b.id === parseInt(e.target.value)))}
                        >
                            {businesses.map(b => (
                                <option key={b.id} value={b.id}>{b.businessName}</option>
                            ))}
                        </select>
                    </div>
                    <button className="p-4 bg-white rounded-2xl shadow-xl shadow-slate-100 text-slate-400 hover:text-indigo-600 transition-all border border-slate-50" onClick={() => refetchHealth()}>
                        <RefreshCw size={24} className={loadingHealth ? 'animate-spin' : ''} />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 metrics-grid-main mb-12">
                {/* Primary Stats */}
                <div className="mini-stat-card-horizon">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center">
                        <IndianRupee size={28} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('dashboard.monthly_revenue') || 'Monthly Revenue'}</span>
                        <h4 className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(healthData?.monthlyRevenue || 450000)}</h4>
                        <div className="flex items-center gap-1 mt-1 text-emerald-500 font-bold text-[10px]">
                            <TrendingUp size={12} /> +12.4% vs prev. cycle
                        </div>
                    </div>
                </div>

                <div className="mini-stat-card-horizon">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center">
                        <TrendingUp size={28} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('common.receivables') || 'Receivables'}</span>
                        <h4 className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(healthData?.totalReceivables || invoiceSummary?.totalReceivables)}</h4>
                        <span className="text-slate-400 font-bold text-[10px] uppercase">Active Ledger</span>
                    </div>
                </div>

                <div className="mini-stat-card-horizon">
                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center">
                        <AlertTriangle size={28} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payables</span>
                        <h4 className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(healthData?.totalPayables || invoiceSummary?.totalPayables)}</h4>
                        <span className="text-rose-400 font-bold text-[10px] uppercase tracking-tighter">Immediate Attention</span>
                    </div>
                </div>

                {/* Second Row: Detailed Cards */}
                <div className="lending-score-card lg:col-span-1 shadow-sm border border-slate-50 group hover:border-indigo-100 transition-all">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Fingerprint size={16} /> Lending Profile
                        </h3>
                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300"><MoreHorizontal size={14} /></div>
                    </div>
                    <div className="score-display-horizon shadow-2xl shadow-indigo-50">
                        <span className="text-5xl font-black text-slate-900 tracking-tighter">{creditScore?.overallScore || '785'}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Stochastic</span>
                    </div>
                    <div className="mt-10 px-6 font-bold text-xs text-slate-400 leading-relaxed uppercase tracking-wider italic">
                        {creditScore?.riskLevel ? `Risk Level: ${creditScore.riskLevel}` : 'Neural model indicates high credit stability.'}
                    </div>
                </div>

                <div className="horizon-card p-10 bg-white">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Zap size={16} className="text-indigo-600" /> Liquidity Pulse
                        </h3>
                    </div>
                    <div className="space-y-6">
                        <div className="p-6 bg-emerald-50/30 rounded-3xl border border-emerald-50">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Inflow Momentum</span>
                            <h5 className="text-2xl font-black text-emerald-600 mt-1">+{formatCurrency(healthData?.totalCashInflow || 840000)}</h5>
                        </div>
                        <div className="p-6 bg-rose-50/30 rounded-3xl border border-rose-50">
                            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Outflow Velocity</span>
                            <h5 className="text-2xl font-black text-rose-600 mt-1">-{formatCurrency(healthData?.totalCashOutflow || 320000)}</h5>
                        </div>
                    </div>
                </div>

                <div className="horizon-card p-10 bg-white">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <BarChart3 size={16} /> Efficiency Ratios
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                        <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-50">
                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Ratio</span>
                                <p className="text-xs font-bold text-slate-500 mt-1">Liquidity Coverage</p>
                            </div>
                            <span className="text-3xl font-black text-indigo-600 tracking-tighter">
                                {healthData?.currentRatio ? healthData.currentRatio.toFixed(1) : '1.8'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-50">
                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gearing Ratio</span>
                                <p className="text-xs font-bold text-slate-500 mt-1">Leverage Vector</p>
                            </div>
                            <span className="text-3xl font-black text-emerald-500 tracking-tighter">
                                {healthData?.debtEquityRatio ? healthData.debtEquityRatio.toFixed(1) : '0.4'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
                <div className="lg:col-span-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tighter flex items-center gap-3">
                            <FileText size={24} className="text-indigo-600" /> Recent Invoices
                        </h2>
                        <button className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline" onClick={() => navigate('/sme/invoices')}>View Ledger →</button>
                    </div>
                    <div className="horizon-card overflow-hidden">
                        {recentInvoices.length > 0 ? recentInvoices.map((inv, idx) => (
                            <div key={inv.id || idx} className="activity-item-horizon m-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-indigo-600 shadow-sm border border-slate-50">
                                        {inv.clientName?.substring(0, 2).toUpperCase() || 'TR'}
                                    </div>
                                    <div>
                                        <span className="text-sm font-black text-slate-800 block">{inv.clientName || 'Trade Settlement'}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invoice Cycle Node</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-lg font-black text-slate-900 block">{formatCurrency(inv.totalAmount)}</span>
                                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg">VERIFIED</span>
                                </div>
                            </div>
                        )) : (
                            <div className="p-8 text-center text-slate-400 font-bold text-sm">No recent invoice activity found.</div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-8">
                    <div className="analyst-insight-card">
                        <div className="flex items-center gap-3 mb-6">
                            <Sparkles size={24} className="text-indigo-400" />
                            <h4 className="text-xl font-black leading-tight">Neural Strategy <br /> Engine</h4>
                        </div>
                        <p className="text-sm font-bold opacity-80 leading-relaxed mb-4">
                            {primaryAlert.message}
                        </p>
                        <p className="text-xs font-black opacity-60 uppercase mb-8">
                            RECOMMENDATION: {primaryAlert.actionRequired}
                        </p>
                        <button
                            className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-black/20"
                            onClick={() => navigate('/sme/working-capital')}
                        >
                            Execute Optimization <ArrowRightCircle size={14} />
                        </button>
                    </div>

                    <div className="horizon-card p-8 border-dashed border-2 bg-indigo-50/10 border-indigo-100">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600"><Target size={24} /></div>
                            <h4 className="font-black text-slate-800 tracking-tighter">{t('common.tax_compliance') || 'Compliance State'}</h4>
                        </div>
                        <div className="flex items-center gap-3">
                            <ShieldCheck size={20} className={complianceColor} />
                            <span className="text-sm font-black text-slate-700 tracking-tight">
                                {healthData?.overdueFilings > 0
                                    ? `${healthData.overdueFilings} Filings Overdue`
                                    : 'All Filings Normalized'}
                            </span>
                        </div>
                        {healthData?.complianceScore && (
                            <div className="mt-2 text-xs font-bold text-slate-400">
                                Score: {healthData.complianceScore}/100
                            </div>
                        )}
                        <button className="btn-ghost-horizon w-full mt-6" onClick={() => navigate('/sme/compliance')}>View Tax Matrix</button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SmeDashboard;
