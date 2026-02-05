import React, { memo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { TrendingUp } from 'lucide-react';

/**
 * SpendingChart Component
 * 
 * Performance: 
 * - Memoized to prevent re-renders when parent state changes but data doesn't.
 * - Uses structured layout for reusability.
 */
const SpendingChart = memo(({ data, isLoading }) => {

    if (isLoading) {
        return (
            <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm animate-pulse h-[450px]">
                <div className="flex justify-between mb-8">
                    <div className="w-40 h-8 bg-slate-100 rounded-xl" />
                    <div className="w-24 h-8 bg-slate-100 rounded-xl" />
                </div>
                <div className="w-full h-[300px] bg-slate-50 rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <h3 className="font-display font-bold text-xl flex items-center gap-2">
                    <TrendingUp size={20} className="text-brand" />
                    Spending Trends
                </h3>
                <select className="bg-slate-50 border-none rounded-lg text-sm font-bold px-3 py-1 text-slate-600 outline-none cursor-pointer hover:bg-slate-100 transition-colors">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                </select>
            </div>
            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data || []}>
                        <defs>
                            <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="spent"
                            stroke="#4f46e5"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorSpent)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
});

SpendingChart.displayName = 'SpendingChart';

export default SpendingChart;
