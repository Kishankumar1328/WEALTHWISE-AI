import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './i18n';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const OverviewDashboard = lazy(() => import('./pages/dashboard/OverviewDashboard'));
const AiAdvisorPage = lazy(() => import('./pages/advisor/AiAdvisorPage'));
const ExpensesPage = lazy(() => import('./pages/expenses/ExpensesPage'));
const BudgetsPage = lazy(() => import('./pages/budgets/BudgetsPage'));
const GoalsPage = lazy(() => import('./pages/goals/GoalsPage'));
const TransactionHistoryPage = lazy(() => import('./pages/transactions/TransactionHistoryPage'));

// SME Pages
import SmeDashboard from './pages/sme/SmeDashboard';
const BusinessRegistration = lazy(() => import('./pages/sme/BusinessRegistration'));
const InvoiceManagement = lazy(() => import('./pages/sme/InvoiceManagement'));
const TaxCompliance = lazy(() => import('./pages/sme/TaxCompliance'));
const DocumentUpload = lazy(() => import('./pages/sme/DocumentUpload'));
const FinancialForecasting = lazy(() => import('./pages/sme/FinancialForecasting'));
const WorkingCapital = lazy(() => import('./pages/sme/WorkingCapital'));
const Bookkeeping = lazy(() => import('./pages/sme/Bookkeeping'));
const CostOptimization = lazy(() => import('./pages/sme/CostOptimization'));
const FinancialProducts = lazy(() => import('./pages/sme/FinancialProducts'));
const Reports = lazy(() => import('./pages/sme/Reports'));
const Analytics = lazy(() => import('./pages/sme/Analytics'));

// Placeholder components for remaining pages
const PlaceholderPage = ({ title }) => (
    <div className="flex flex-col items-center justify-center p-20 text-center">
        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 mb-6">
            <h2 className="text-4xl">🚀</h2>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 text-slate-500">We are building this feature with advanced AI. Coming soon!</p>
    </div>
);

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <Suspense fallback={
                    <div className="h-screen w-full flex items-center justify-center bg-slate-50">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
                            <p className="font-bold text-slate-500 animate-pulse">Loading WealthWise...</p>
                        </div>
                    </div>
                }>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        {/* Protected Dashboard Routes */}
                        <Route path="/dashboard" element={
                            <DashboardLayout><OverviewDashboard /></DashboardLayout>
                        } />
                        <Route path="/expenses" element={
                            <DashboardLayout><ExpensesPage /></DashboardLayout>
                        } />
                        <Route path="/budgets" element={
                            <DashboardLayout><BudgetsPage /></DashboardLayout>
                        } />
                        <Route path="/goals" element={
                            <DashboardLayout><GoalsPage /></DashboardLayout>
                        } />
                        <Route path="/transactions" element={
                            <DashboardLayout><TransactionHistoryPage /></DashboardLayout>
                        } />
                        <Route path="/advisor" element={
                            <DashboardLayout><AiAdvisorPage /></DashboardLayout>
                        } />

                        {/* SME Financial Health Routes */}
                        <Route path="/sme/dashboard" element={
                            <DashboardLayout><SmeDashboard /></DashboardLayout>
                        } />
                        <Route path="/sme/register-business" element={
                            <DashboardLayout><BusinessRegistration /></DashboardLayout>
                        } />
                        <Route path="/sme/invoices" element={
                            <DashboardLayout><InvoiceManagement /></DashboardLayout>
                        } />
                        <Route path="/sme/compliance" element={
                            <DashboardLayout><TaxCompliance /></DashboardLayout>
                        } />
                        <Route path="/sme/documents" element={
                            <DashboardLayout><DocumentUpload /></DashboardLayout>
                        } />
                        <Route path="/sme/forecasting" element={
                            <DashboardLayout><FinancialForecasting /></DashboardLayout>
                        } />
                        <Route path="/sme/working-capital" element={
                            <DashboardLayout><WorkingCapital /></DashboardLayout>
                        } />
                        <Route path="/sme/bookkeeping" element={
                            <DashboardLayout><Bookkeeping /></DashboardLayout>
                        } />
                        <Route path="/sme/cost-optimization" element={
                            <DashboardLayout><CostOptimization /></DashboardLayout>
                        } />
                        <Route path="/sme/financial-products" element={
                            <DashboardLayout><FinancialProducts /></DashboardLayout>
                        } />
                        <Route path="/sme/reports" element={
                            <DashboardLayout><Reports /></DashboardLayout>
                        } />
                        <Route path="/sme/analytics" element={
                            <DashboardLayout><Analytics /></DashboardLayout>
                        } />

                        {/* Redirects */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </Router>
        </QueryClientProvider>
    );
}

export default App;

