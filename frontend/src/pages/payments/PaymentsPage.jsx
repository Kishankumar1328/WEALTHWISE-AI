import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, DollarSign, CheckCircle, Clock, XCircle, Download, Filter } from 'lucide-react';
import PaymentButton from '../../components/payment/PaymentButton';

const PaymentsPage = () => {
    const [selectedAmount, setSelectedAmount] = useState(1000);
    const [customAmount, setCustomAmount] = useState('');
    const [paymentHistory] = useState([
        {
            id: 1,
            amount: 999,
            description: 'Premium Subscription',
            status: 'success',
            date: '2026-02-05',
            razorpayOrderId: 'order_123456',
            razorpayPaymentId: 'pay_789012'
        },
        {
            id: 2,
            amount: 499,
            description: 'Monthly Plan',
            status: 'success',
            date: '2026-01-05',
            razorpayOrderId: 'order_234567',
            razorpayPaymentId: 'pay_890123'
        },
        {
            id: 3,
            amount: 1999,
            description: 'Annual Plan',
            status: 'pending',
            date: '2026-02-01',
            razorpayOrderId: 'order_345678',
            razorpayPaymentId: null
        }
    ]);

    const quickAmounts = [500, 1000, 2000, 5000];

    const handlePaymentSuccess = (response) => {
        console.log('Payment successful:', response);
        // You can add logic to update payment history or show success message
    };

    const handlePaymentError = (error) => {
        console.error('Payment failed:', error);
        // You can add logic to show error message
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            success: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, label: 'Success' },
            pending: { color: 'bg-amber-100 text-amber-700', icon: Clock, label: 'Pending' },
            failed: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Failed' }
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${config.color}`}>
                <Icon size={14} />
                {config.label}
            </span>
        );
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Razorpay Payments</h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage your payments and subscriptions</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-colors"
                >
                    <Download size={18} />
                    Download Invoice
                </motion.button>
            </div>

            {/* Payment Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Make Payment Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                            <CreditCard className="text-indigo-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Make a Payment</h2>
                            <p className="text-sm text-slate-500">Secure payment via Razorpay</p>
                        </div>
                    </div>

                    {/* Quick Amount Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 mb-3">Quick Select Amount</label>
                        <div className="grid grid-cols-2 gap-3">
                            {quickAmounts.map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => {
                                        setSelectedAmount(amount);
                                        setCustomAmount('');
                                    }}
                                    className={`p-4 rounded-2xl border-2 font-bold transition-all ${selectedAmount === amount && !customAmount
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                                            : 'border-slate-200 hover:border-indigo-300'
                                        }`}
                                >
                                    ₹{amount}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Amount */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 mb-3">Or Enter Custom Amount</label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="number"
                                value={customAmount}
                                onChange={(e) => {
                                    setCustomAmount(e.target.value);
                                    setSelectedAmount(Number(e.target.value));
                                }}
                                placeholder="Enter amount"
                                className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-2xl font-bold focus:border-indigo-600 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    {/* Payment Button */}
                    <div className="pt-4">
                        <PaymentButton
                            amount={selectedAmount}
                            description="WealthWise Payment"
                            onSuccess={handlePaymentSuccess}
                            onError={handlePaymentError}
                        />
                    </div>

                    <p className="text-xs text-slate-400 mt-4 text-center">
                        🔒 Secured by Razorpay • All transactions are encrypted
                    </p>
                </motion.div>

                {/* Payment Stats Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-8 shadow-xl text-white"
                >
                    <h2 className="text-xl font-black mb-6">Payment Overview</h2>

                    <div className="space-y-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                            <p className="text-sm font-medium text-white/70 mb-2">Total Spent</p>
                            <p className="text-4xl font-black">₹{paymentHistory.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                                <p className="text-xs font-medium text-white/70 mb-1">Successful</p>
                                <p className="text-2xl font-black">
                                    {paymentHistory.filter(p => p.status === 'success').length}
                                </p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                                <p className="text-xs font-medium text-white/70 mb-1">Pending</p>
                                <p className="text-2xl font-black">
                                    {paymentHistory.filter(p => p.status === 'pending').length}
                                </p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <p className="text-sm text-white/70 mb-3">Payment Methods</p>
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-bold">
                                    💳 Cards
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-bold">
                                    🏦 UPI
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-sm font-bold">
                                    🌐 Net Banking
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Payment History */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
            >
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Payment History</h2>
                        <p className="text-slate-500 mt-1">View all your past transactions</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border-2 border-slate-200 rounded-xl font-bold hover:border-indigo-600 transition-colors">
                        <Filter size={18} />
                        Filter
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-8 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-8 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                                    Order ID
                                </th>
                                <th className="px-8 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-8 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paymentHistory.map((payment) => (
                                <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-8 py-5 text-sm font-bold text-slate-600">
                                        {new Date(payment.date).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-8 py-5 text-sm font-bold text-slate-900">
                                        {payment.description}
                                    </td>
                                    <td className="px-8 py-5 text-xs font-mono text-slate-500">
                                        {payment.razorpayOrderId}
                                    </td>
                                    <td className="px-8 py-5 text-sm font-black text-slate-900">
                                        ₹{payment.amount.toLocaleString()}
                                    </td>
                                    <td className="px-8 py-5">
                                        {getStatusBadge(payment.status)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentsPage;
