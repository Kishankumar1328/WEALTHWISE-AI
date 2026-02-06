import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard, Receipt, Wallet, Target, Sparkles,
    Settings, LogOut, Menu, X, Bell, Search, ChevronRight,
    Building2, FileText, Shield, TrendingUp,
    Zap, Activity, Command, HelpCircle, Moon, Sun, CreditCard
} from 'lucide-react';

import LanguageSwitcher from '../common/LanguageSwitcher';

const DashboardLayout = ({ children }) => {
    const { t } = useTranslation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [smeExpanded, setSmeExpanded] = useState(true);
    const location = useLocation();

    const menuItems = [
        { icon: <LayoutDashboard size={22} />, label: t('common.overview') || 'Overview', path: '/dashboard' },
        { icon: <Receipt size={22} />, label: t('common.expenses'), path: '/expenses' },
        { icon: <Wallet size={22} />, label: t('common.budgets'), path: '/budgets' },
        { icon: <Target size={22} />, label: t('common.financial_goals') || 'Financial Goals', path: '/goals' },
        { icon: <Receipt size={22} />, label: 'Transaction History', path: '/transactions' },
        { icon: <CreditCard size={22} />, label: 'Razorpay Payments', path: '/payments' },
        { icon: <Sparkles size={22} />, label: t('common.advisor'), path: '/advisor' },
    ];

    const smeMenuItems = [
        { icon: <TrendingUp size={18} />, label: t('common.health_dashboard') || 'Health Dashboard', path: '/sme/dashboard' },
        { icon: <Receipt size={18} />, label: t('common.invoices') || 'Invoices', path: '/sme/invoices' },
        { icon: <Shield size={18} />, label: t('common.tax_compliance') || 'Tax Compliance', path: '/sme/compliance' },
        { icon: <Zap size={18} />, label: t('common.ai_forecasting') || 'AI Forecasting', path: '/sme/forecasting' },
        { icon: <FileText size={18} />, label: t('common.document_analysis') || 'Document Analysis', path: '/sme/documents' },
        { icon: <Activity size={18} />, label: t('common.working_capital') || 'Working Capital', path: '/sme/working-capital' },
        { icon: <Settings size={18} />, label: t('common.auto_bookkeeping') || 'Auto Bookkeeping', path: '/sme/bookkeeping' },
        { icon: <LayoutDashboard size={18} />, label: t('common.cost_optimization') || 'Cost Optimization', path: '/sme/cost-optimization' },
        { icon: <Building2 size={18} />, label: t('common.financial_products') || 'Financial Products', path: '/sme/financial-products' },
        { icon: <FileText size={18} />, label: t('common.reports'), path: '/sme/reports' },
        { icon: <Sparkles size={18} />, label: t('common.advanced_analytics') || 'Advanced Analytics', path: '/sme/analytics' },
    ];

    const isSmeRoute = location.pathname ? location.pathname.startsWith('/sme') : false;
    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-[#F4F7FE] flex font-sans text-slate-900 overflow-x-hidden">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 290 : 0, opacity: sidebarOpen ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 left-0 bg-white border-r border-slate-100 z-50 lg:relative lg:block hidden overflow-hidden shadow-[20px_0_40px_rgba(0,0,0,0.02)]"
            >
                <div className="flex flex-col h-full w-[290px]">
                    <div className="h-24 flex items-center px-8 gap-4 border-b border-slate-50/50">
                        <div className="w-12 h-12 bg-indigo-600 rounded-[18px] flex items-center justify-center shadow-lg shadow-indigo-100">
                            <Command className="text-white w-7 h-7" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tighter text-slate-800 leading-none">WealthWise</span>
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Stochastic Intelligence</span>
                        </div>
                    </div>

                    <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`group flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm ${isActive(item.path)
                                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100'
                                    : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600'
                                    }`}
                            >
                                <span className={`${isActive(item.path) ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'} transition-colors`}>
                                    {item.icon}
                                </span>
                                {item.label}
                                {isActive(item.path) && (
                                    <div className="ml-auto w-1.5 h-6 bg-white rounded-full" />
                                )}
                            </Link>
                        ))}

                        <div className="pt-10 pb-4 px-6 flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.25em]">{t('common.global_portfolio') || 'Global Portfolio'}</span>
                            <div className="h-[1px] flex-1 bg-slate-100 ml-4"></div>
                        </div>

                        <button
                            onClick={() => setSmeExpanded(!smeExpanded)}
                            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm ${isSmeRoute
                                ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-100'
                                : 'text-slate-400 hover:bg-slate-50'
                                }`}
                        >
                            <Building2 size={22} className={isSmeRoute ? 'text-white' : 'text-slate-400'} />
                            <span>{t('common.sme_command') || 'SME Command'}</span>
                            <ChevronRight
                                size={16}
                                className={`ml-auto transition-transform duration-300 ${smeExpanded ? 'rotate-90' : ''}`}
                            />
                        </button>

                        <AnimatePresence>
                            {smeExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pl-6 pr-2 py-2 space-y-1">
                                        {smeMenuItems.map((item) => (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-[13px] font-bold ${isActive(item.path)
                                                    ? 'bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100/50'
                                                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                                                    }`}
                                            >
                                                <div className="w-5 h-5 flex items-center justify-center">
                                                    {item.icon}
                                                </div>
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </nav>

                    <div className="p-6 border-t border-slate-50/50 mt-auto">
                        <div className="bg-slate-50 rounded-[28px] p-4 flex items-center gap-3 border border-slate-100/50">
                            <div className="w-11 h-11 rounded-[14px] bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                                JS
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-slate-800 truncate">John Sharma</p>
                                <p className="text-[9px] font-black text-indigo-500 bg-indigo-50 w-fit px-1.5 py-0.5 rounded mt-0.5">ELITE TRADER</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <header className="h-24 bg-white/40 backdrop-blur-2xl flex items-center justify-between px-6 lg:px-12 sticky top-0 z-30 border-b border-white/20">
                    <div className="flex items-center gap-8">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-3 bg-white shadow-sm border border-slate-100 rounded-[16px] hover:bg-slate-50"
                        >
                            <Menu size={20} className="text-slate-600" />
                        </button>
                        <h2 className="text-sm font-black text-slate-800 tracking-tight hidden md:block">Wealth Health Center</h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative group hidden xl:block">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder={t('common.search_placeholder') || 'Search Intel...'}
                                className="pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-[20px] text-xs font-bold w-[260px] shadow-sm outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <LanguageSwitcher />
                            <Bell size={20} className="text-slate-400" />
                            <HelpCircle size={20} className="text-slate-400" />
                        </div>

                        <div className="w-[1px] h-10 bg-slate-100 mx-1" />

                        <div className="w-10 h-10 rounded-[14px] bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-lg">
                            JS
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto px-6 lg:px-12 py-8 relative">
                    <div className="relative z-10 max-w-[1600px] mx-auto">
                        {children || <div className="p-20 text-center text-slate-400">Loading module...</div>}
                    </div>
                    {/* Background glows that are safe */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
