import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Mail, Lock, Languages, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { authApi } from '../../api/api';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await authApi.login(formData);
            const { token, ...user } = response.data;

            // Store token and user info
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            navigate('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Left side - Visuals */}
            <div className="hidden lg:flex lg:w-1/2 bg-brand items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 0 L100 100 M0 100 L100 0" stroke="white" strokeWidth="0.1" />
                    </svg>
                </div>

                <div className="relative z-10 text-white max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <TrendingUp className="w-16 h-16 mb-8 text-primary-300" />
                        <h2 className="text-4xl font-display font-bold leading-tight">
                            Start your journey to <br />
                            <span className="text-primary-300">Financial Independence.</span>
                        </h2>
                        <p className="mt-6 text-lg text-brand-100 opacity-90">
                            Join thousands of users who are already mastering their finances with WealthWise AI.
                        </p>

                        <div className="mt-12 space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold">1</div>
                                <div>
                                    <h4 className="font-bold">Privacy Guaranteed</h4>
                                    <p className="text-sm opacity-70">Your data is encrypted with 256-bit AES protection.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold">2</div>
                                <div>
                                    <h4 className="font-bold">Multilingual Support</h4>
                                    <p className="text-sm opacity-70">Switch between 8+ Indian languages instantly.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="max-w-md w-full">
                    <div className="mb-10 text-center lg:text-left">
                        <Link to="/" className="inline-flex items-center gap-2 mb-8 group lg:hidden">
                            <TrendingUp className="text-brand w-8 h-8" />
                            <span className="text-2xl font-display font-bold gradient-text">WealthWise AI</span>
                        </Link>
                        <h3 className="text-3xl font-display font-bold text-slate-900">Welcome Back</h3>
                        <p className="mt-2 text-slate-500 font-medium">Please enter your details to sign in.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-danger/5 border border-danger/20 rounded-xl flex items-center gap-3 text-danger text-sm font-bold">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    className="input-field pl-10 h-11 w-full bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand/10 transition-all text-black"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-semibold text-slate-700">Password</label>
                                <a href="#" className="text-sm font-bold text-brand hover:underline underline-offset-4">Forgot?</a>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    className="input-field pl-10 h-11 w-full bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand/10 transition-all text-black"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-brand text-white rounded-xl hover:bg-brand-dark transition-all font-bold shadow-lg shadow-brand/20 flex items-center justify-center gap-2 group disabled:opacity-70"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-slate-600 font-medium">
                        Don't have an account? {' '}
                        <Link to="/register" className="text-brand font-bold hover:underline underline-offset-4">Create Account</Link>
                    </p>

                    <div className="mt-12 pt-8 border-t border-slate-100 flex justify-center gap-4">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                            <Languages className="w-4 h-4" />
                            Switch to Hindi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
