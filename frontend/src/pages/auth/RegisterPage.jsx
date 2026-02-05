import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Mail, Lock, User, Phone, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { authApi } from '../../api/api';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        username: '',
        password: '',
        phoneNumber: '',
        preferredLanguage: 'en'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Basic validation
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long.');
            setIsLoading(false);
            return;
        }

        try {
            await authApi.register(formData);
            // On success, redirect to login with a success indicator? 
            // Or auto-login. For now, let's redirect to login.
            navigate('/login', { state: { message: 'Account created successfully! Please sign in.' } });
        } catch (err) {
            console.error('Registration full error object:', err);

            // Extract error message safely
            let errorMessage = 'Registration failed. Please try again.';

            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                if (err.response.data) {
                    if (typeof err.response.data === 'string') {
                        errorMessage = err.response.data;
                    } else if (err.response.data.message) {
                        errorMessage = err.response.data.message;
                    } else if (err.response.data.error) {
                        errorMessage = err.response.data.error;
                    } else if (err.response.data.errors) {
                        // Spring Validation errors usually come as { errors: { field: "msg" } }
                        // Or sometimes just { field: "msg" }
                        // Let's grab the first one
                        const firstKey = Object.keys(err.response.data.errors)[0];
                        if (firstKey) {
                            errorMessage = err.response.data.errors[firstKey];
                        }
                    }
                }
            } else if (err.request) {
                // The request was made but no response was received
                errorMessage = 'No response from server. Check your connection.';
            } else {
                // Something happened in setting up the request that triggered an Error
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
                            Join the Future of <br />
                            <span className="text-primary-300">Intelligent Finance.</span>
                        </h2>
                        <p className="mt-6 text-lg text-brand-100 opacity-90">
                            Create your WealthWise AI account today and start optimizing your wealth with next-gen AI tools.
                        </p>

                        <div className="mt-12 space-y-6">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold">✓</div>
                                <div>
                                    <h4 className="font-bold">AI-Driven Insights</h4>
                                    <p className="text-sm opacity-70">Get personalized financial advice instantly.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold">✓</div>
                                <div>
                                    <h4 className="font-bold">Secure Compliant</h4>
                                    <p className="text-sm opacity-70">Bank-grade security standards.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
                <div className="max-w-md w-full py-8">
                    <div className="mb-8 text-center lg:text-left">
                        <h3 className="text-3xl font-display font-bold text-slate-900">Create Account</h3>
                        <p className="mt-2 text-slate-500 font-medium">It only takes a minute to get started.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-danger/5 border border-danger/20 rounded-xl flex items-center gap-3 text-danger text-sm font-bold">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        name="fullName"
                                        className="input-field pl-10 h-11 w-full bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand/10 transition-all text-black"
                                        placeholder="John Doe"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        name="username"
                                        className="input-field pl-10 h-11 w-full bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand/10 transition-all text-black"
                                        placeholder="john_doe"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    name="email"
                                    className="input-field pl-10 h-11 w-full bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand/10 transition-all text-black"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number (Optional)</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    className="input-field pl-10 h-11 w-full bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand/10 transition-all text-black"
                                    placeholder="+91 98765 43210"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-700">Password</label>
                            <div className="relative mt-2">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    name="password"
                                    className="input-field pl-10 h-11 w-full bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand/10 transition-all text-black"
                                    placeholder="Minimum 8 characters"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1 ml-1">Must be at least 8 characters long.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 mt-4 bg-brand text-white rounded-xl hover:bg-brand-dark transition-all font-bold shadow-lg shadow-brand/20 flex items-center justify-center gap-2 group disabled:opacity-70"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-slate-600 font-medium">
                        Already have an account? {' '}
                        <Link to="/login" className="text-brand font-bold hover:underline underline-offset-4">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
