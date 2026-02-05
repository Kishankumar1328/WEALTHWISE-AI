import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    BarChart3, TrendingUp, PieChart, Activity, Plus,
    ArrowRight, Sparkles, Filter, MoreHorizontal
} from 'lucide-react';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
    PieChart as RePieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { smeAnalyticsApi } from '../../api/api';
import PageContainer from '../../components/common/PageContainer';
import LoadingScreen from '../../components/common/LoadingScreen';

// --- New Visualization Components ---

const getColSpan = (cols) => {
    if (cols >= 3) return 'lg:col-span-3'; // Full width on large screens
    if (cols >= 2) return 'lg:col-span-2';
    return 'lg:col-span-1';
};

const KPIGrid = ({ overview }) => {
    const summary = overview?.summary || {};
    const metrics = [
        { label: 'Total Revenue', value: summary.totalCredits || 0, prefix: '₹', color: 'text-emerald-500' },
        { label: 'Total Spend', value: summary.totalDebits || 0, prefix: '₹', color: 'text-rose-500' },
        { label: 'Net Cash Flow', value: summary.netCashFlow || 0, prefix: '₹', color: summary.netCashFlow >= 0 ? 'text-emerald-500' : 'text-rose-500' },
        { label: 'Tx Volume', value: summary.transactionCount || 0, prefix: '#', color: 'text-indigo-500' },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {metrics.map((m, i) => (
                <div key={i} className="horizon-card p-4 flex flex-col justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{m.label}</span>
                    <div className={`text-2xl font-black mt-2 ${m.color}`}>
                        {m.prefix === '₹' ? `₹${Number(m.value).toLocaleString()}` : m.value}
                    </div>
                </div>
            ))}
        </div>
    );
};

const BusinessHealthRadar = ({ widthCols }) => {
    const data = [
        { subject: 'Liquidity', A: 120, fullMark: 150 },
        { subject: 'Solvency', A: 98, fullMark: 150 },
        { subject: 'Growth', A: 86, fullMark: 150 },
        { subject: 'Stability', A: 99, fullMark: 150 },
        { subject: 'Efficiency', A: 85, fullMark: 150 },
        { subject: 'Margins', A: 65, fullMark: 150 },
    ];

    return (
        <div className={`horizon-card p-6 h-full flex flex-col ${getColSpan(widthCols)}`}>
            <h4 className="font-black text-slate-800 flex items-center gap-2 mb-4">
                <Activity size={18} className="text-indigo-600" /> Business Health Score
            </h4>
            <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                        <Radar name="My Business" dataKey="A" stroke="#6366f1" strokeWidth={3} fill="#6366f1" fillOpacity={0.4} />
                        <Tooltip />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};


const RevenueTrendWidget = ({ widthCols, trendPoints = [] }) => {
    // Only take every 3rd point if too many
    const displayData = trendPoints.length > 30
        ? trendPoints.filter((_, i) => i % 3 === 0)
        : trendPoints;

    const data = (Array.isArray(displayData) && displayData.length > 0)
        ? displayData.map(p => ({
            label: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: Number(p.credits || 0),
            expense: Number(p.debits || 0),
            net: Number(p.net || 0),
        }))
        : [];

    return (
        <div className={`horizon-card p-6 h-full flex flex-col ${getColSpan(widthCols)}`}>
            <div className="flex items-center justify-between mb-6">
                <h4 className="font-black text-slate-800 flex items-center gap-2">
                    <TrendingUp size={18} className="text-emerald-500" /> Revenue & Expense Trajectory
                </h4>
                <div className="flex gap-2">
                    <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Rev</span>
                    <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Exp</span>
                </div>
            </div>
            <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} minTickGap={30} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(value) => `₹${value / 1000}k`} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value) => `₹${value.toLocaleString()}`}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                        <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// Pie Chart Breakdown Widget
const ExpenseBreakdownWidget = ({ widthCols, overview }) => {
    const breakdown = overview?.summary?.categoryBreakdown || {
        'Operations': 40000,
        'Payroll': 35000,
        'Marketing': 15000,
        'Software': 10000
    };

    const data = Object.entries(breakdown).map(([name, value], index) => ({
        name,
        value: Number(value),
        color: ['#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b'][index % 5]
    }));

    return (
        <div className={`horizon-card p-6 h-full flex flex-col ${getColSpan(widthCols)}`}>
            <h4 className="font-black text-slate-800 flex items-center gap-2 mb-2">
                <PieChart size={18} className="text-indigo-600" /> Expense Allocation
            </h4>
            <div className="flex-1 w-full min-h-[220px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                            formatter={(value) => `₹${Number(value).toLocaleString()}`}
                        />
                    </RePieChart>
                </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
                {data.slice(0, 4).map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                        <span>{d.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CashFlowWidget = ({ widthCols, trendPoints = [] }) => {
    // Only show last 14 days for bar chart to keep it clean
    const recentPoints = Array.isArray(trendPoints) ? trendPoints.slice(-14) : [];

    const data = recentPoints.map(p => ({
        name: new Date(p.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
        inflow: Number(p.credits || 0),
        outflow: Number(p.debits || 0),
    }));

    return (
        <div className={`horizon-card p-6 h-full flex flex-col ${getColSpan(widthCols)}`}>
            <div className="flex items-center justify-between mb-6">
                <h4 className="font-black text-slate-800 flex items-center gap-2">
                    <Activity size={18} className="text-indigo-600" /> Daily Cash Velocity
                </h4>
            </div>
            <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                        <Tooltip
                            cursor={{ fill: '#f1f5f9' }}
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#1e293b' }}
                        />
                        <Bar dataKey="inflow" fill="#6366f1" radius={[4, 4, 0, 0]} name="Inflow" />
                        <Bar dataKey="outflow" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Outflow" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const AiInsightWidget = ({ widthCols, overview, risks }) => {
    const totalIncome = overview?.summary?.totalCredits ?? 0;
    const totalExpense = overview?.summary?.totalDebits ?? 0;
    const net = overview?.summary?.netCashFlow ?? 0;
    const primaryRisk = Array.isArray(risks?.risks) && risks.risks.length > 0 ? risks.risks[0] : null;

    const incomeText = totalIncome || totalExpense
        ? `Current inflow is ₹${Number(totalIncome).toLocaleString()} against outflow of ₹${Number(totalExpense).toLocaleString()}, net position ₹${Number(net).toLocaleString()}.`
        : 'No recent cashflow data available for this period.';

    const riskText = primaryRisk
        ? `Cashflow risk band is ${primaryRisk.band || 'LOW'} with ${primaryRisk.negativeNetDays || 0} negative net days in the last ${primaryRisk.daysAnalyzed || 0} sessions.`
        : 'Risk engine has not detected any significant patterns yet.';

    return (
        <div className={`bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[24px] p-6 text-white h-full flex flex-col ${getColSpan(widthCols)}`}>
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                    <Sparkles size={20} className="text-amber-400" />
                </div>
                <div>
                    <h4 className="font-black text-lg">AI Strategic Advisor</h4>
                    <span className="text-xs font-medium text-slate-400">Powered by WealthWise Neural Engine</span>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-sm font-medium leading-relaxed opacity-90">
                        {incomeText}
                    </p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-sm font-medium leading-relaxed opacity-90">
                        {riskText}
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---

const Analytics = () => {
    const queryClient = useQueryClient();
    const [selectedBusiness, setSelectedBusiness] = useState(null);

    // Fetch Businesses
    const { data: businesses = [], isLoading: businessesLoading } = useQuery({
        queryKey: ['sme-businesses'],
        queryFn: async () => {
            try {
                const response = await smeAnalyticsApi.getBusinesses ? await smeAnalyticsApi.getBusinesses() : await import('../../api/api').then(m => m.smeBusinessApi.getAll());
                return Array.isArray(response.data) ? response.data : [];
            } catch (e) { return []; }
        }
    });

    useEffect(() => {
        if (businesses.length > 0 && !selectedBusiness) {
            setSelectedBusiness(businesses[0]);
        }
    }, [businesses, selectedBusiness]);

    const businessId = selectedBusiness?.id;

    // Overview metrics
    const { data: overview, isLoading: overviewLoading } = useQuery({
        queryKey: ['analytics-overview', businessId],
        queryFn: () => businessId
            ? smeAnalyticsApi.getOverview(businessId).then(res => res.data)
            : Promise.resolve(null),
        enabled: !!businessId
    });

    // Trends
    const { data: trends, isLoading: trendsLoading } = useQuery({
        queryKey: ['analytics-trends', businessId],
        queryFn: () => businessId
            ? smeAnalyticsApi.getTrends(businessId, { days: 90 }).then(res => res.data)
            : Promise.resolve(null),
        enabled: !!businessId
    });

    // Risks
    const { data: risks, isLoading: risksLoading } = useQuery({
        queryKey: ['analytics-risks', businessId],
        queryFn: () => businessId
            ? smeAnalyticsApi.getRisks(businessId, { days: 90 }).then(res => res.data)
            : Promise.resolve(null),
        enabled: !!businessId
    });

    // Fetch Widgets
    const { data: widgets = [], isLoading: widgetsLoading } = useQuery({
        queryKey: ['analytics-widgets', businessId],
        queryFn: async () => {
            if (!businessId) return [];
            try {
                const res = await smeAnalyticsApi.getWidgets();
                if (res.data && res.data.length === 0) {
                    await smeAnalyticsApi.initWidgets();
                    return (await smeAnalyticsApi.getWidgets()).data;
                }
                return res.data;
            } catch (e) { return []; }
        },
        enabled: !!businessId
    });

    // Fetch Scenarios
    const { data: scenarios = [], isLoading: scenariosLoading } = useQuery({
        queryKey: ['analytics-scenarios', businessId],
        queryFn: () => businessId ? smeAnalyticsApi.getScenarios(businessId).then(res => res.data) : [],
        enabled: !!businessId
    });

    // Create Scenario Mutation
    const createScenarioMutation = useMutation({
        mutationFn: (data) => smeAnalyticsApi.createScenario(businessId, data),
        onSuccess: () => queryClient.invalidateQueries(['analytics-scenarios', businessId])
    });

    const [form, setForm] = useState({ name: '', revenueGrowth: 10, expenseGrowth: 5, description: '' });

    const trendPoints = Array.isArray(trends?.points) ? trends.points : [];

    if (businessesLoading || widgetsLoading || overviewLoading || trendsLoading || risksLoading) {
        return <LoadingScreen message="Initializing Analytics Engine..." />;
    }

    const renderWidget = (widget) => {
        switch (widget.widgetType) {
            case 'REVENUE_TREND':
                return <RevenueTrendWidget key={widget.id} widthCols={widget.widthCols} trendPoints={trendPoints} />;
            case 'CASH_FLOW_CHART':
                return <CashFlowWidget key={widget.id} widthCols={widget.widthCols} trendPoints={trendPoints} />;
            case 'AI_INSIGHTS':
                return <AiInsightWidget key={widget.id} widthCols={widget.widthCols} overview={overview} risks={risks} />;
            default:
                return <ExpenseBreakdownWidget key={widget.id} widthCols={1} overview={overview} />;
        }
    };

    return (
        <PageContainer>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Advanced Analytics</h1>
                    <p className="text-slate-500 font-bold mt-2">Interactive visualization and predictive modeling.</p>
                </div>
                <button className="btn-primary-horizon">
                    <Filter size={18} /> Customize View
                </button>
            </div>

            <KPIGrid overview={overview} />

            {/* Widget Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                <RevenueTrendWidget widthCols={2} trendPoints={trendPoints} />
                <BusinessHealthRadar widthCols={1} />
                <ExpenseBreakdownWidget widthCols={1} overview={overview} />
                <CashFlowWidget widthCols={2} trendPoints={trendPoints} />
                <AiInsightWidget widthCols={3} overview={overview} risks={risks} />
            </div>

            {/* Scenario Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form */}
                <div className="lg:col-span-4 horizon-card p-8 h-fit">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                        <Sparkles className="text-indigo-600" size={20} /> What-If Simulator
                    </h3>
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Scenario Name</label>
                            <input
                                className="input-horizon w-full"
                                placeholder="e.g. Best Case Q4"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Revenue Growth (%)</label>
                            <input
                                type="number"
                                className="input-horizon w-full"
                                value={form.revenueGrowth}
                                onChange={e => setForm({ ...form, revenueGrowth: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Expense Growth (%)</label>
                            <input
                                type="number"
                                className="input-horizon w-full"
                                value={form.expenseGrowth}
                                onChange={e => setForm({ ...form, expenseGrowth: e.target.value })}
                            />
                        </div>
                        <button
                            className="w-full btn-primary-horizon mt-4 justify-center"
                            onClick={() => createScenarioMutation.mutate(form)}
                            disabled={createScenarioMutation.isPending}
                        >
                            {createScenarioMutation.isPending ? 'Simulating...' : 'Run Simulation'}
                        </button>
                    </div>
                </div>

                {/* Results List */}
                <div className="lg:col-span-8 space-y-4">
                    <h3 className="text-xl font-black mb-6 text-slate-900">Simulation History</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {scenarios.map(scenario => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={scenario.id}
                                className="horizon-card p-6 border-l-4 border-indigo-500 hover:shadow-xl transition-all"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-bold text-slate-900 text-lg">{scenario.scenarioName}</h4>
                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-black uppercase">
                                        {new Date(scenario.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl text-xs font-mono text-slate-600 mb-4">
                                    {scenario.resultSummaryJson?.replace(/[{}"]/g, ' ')}
                                    {/* Simple cleanup for display, ideally parse JSON */}
                                </div>
                                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs cursor-pointer hover:underline">
                                    View Full Report <ArrowRight size={14} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

export default Analytics;
