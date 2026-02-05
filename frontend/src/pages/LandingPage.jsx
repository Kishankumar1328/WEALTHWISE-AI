import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    TrendingUp,
    Shield,
    Languages,
    BrainCircuit,
    PieChart,
    Target
} from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-lg border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-brand rounded-lg shadow-brand/20 shadow-lg">
                                <TrendingUp className="text-white w-6 h-6" />
                            </div>
                            <span className="text-xl font-display font-bold gradient-text">WealthWise AI</span>
                        </div>
                        <div className="hidden md:flex items-center gap-8 text-slate-600 font-medium text-sm">
                            <a href="#features" className="hover:text-brand transition-colors">Features</a>
                            <a href="#how-it-works" className="hover:text-brand transition-colors">How it Works</a>
                            <Link to="/login" className="px-4 py-2 text-brand hover:bg-brand/5 rounded-lg transition-all">Login</Link>
                            <Link to="/register" className="btn-primary">Get Started</Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="px-4 py-1.5 bg-brand/10 text-brand text-xs font-bold rounded-full uppercase tracking-wider">
                            AI-Powered Financial Freedom
                        </span>
                        <h1 className="mt-8 text-5xl md:text-7xl font-display font-bold text-slate-900 tracking-tight">
                            Master Your Money in <br />
                            <span className="gradient-text">Your Native Language</span>
                        </h1>
                        <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                            The first intelligent personal finance app built for India. Track expenses,
                            manage budgets, and get AI-driven advice in 8+ Indian languages.
                        </p>
                        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register" className="px-8 py-4 bg-brand text-white rounded-xl hover:bg-brand-dark transition-all shadow-xl shadow-brand/20 font-semibold text-lg hover:-translate-y-1">
                                Start Your Journey
                            </Link>
                            <button className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-semibold text-lg">
                                Watch Demo
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="mt-16 mx-auto max-w-5xl rounded-2xl overflow-hidden shadow-2xl border-8 border-white/50"
                    >
                        <div className="bg-slate-900 p-4 flex items-center gap-2 border-b border-slate-800">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-amber-400" />
                                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                            </div>
                            <div className="ml-4 h-6 w-1/3 bg-slate-800 rounded-md" />
                        </div>
                        <img
                            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070"
                            alt="Dashboard Preview"
                            className="w-full grayscale-[20%] sepia-[10%] contrast-[1.1]"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-display font-bold text-slate-900">Why Choose WealthWise AI?</h2>
                        <p className="mt-4 text-slate-600">Built for the future of Indian personal finance.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<BrainCircuit className="w-6 h-6 text-brand" />}
                            title="AI Financial Advisor"
                            description="Get personalized recommendations and insights driven by advanced machine learning models."
                        />
                        <FeatureCard
                            icon={<Languages className="w-6 h-6 text-brand" />}
                            title="8+ Indian Languages"
                            description="Full support for Hindi, Tamil, Telugu, and more. Manage your money in the language you speak at home."
                        />
                        <FeatureCard
                            icon={<Shield className="w-6 h-6 text-brand" />}
                            title="Bank-Grade Security"
                            description="We use 256-bit encryption and industry-standard security protocols to keep your data safe."
                        />
                        <FeatureCard
                            icon={<PieChart className="w-6 h-6 text-brand" />}
                            title="Smart Budgeting"
                            description="Automatic categorization of expenses and intelligent budget alerts to keep you on track."
                        />
                        <FeatureCard
                            icon={<Target className="w-6 h-6 text-brand" />}
                            title="Goal Tracking"
                            description="Plan for the future. Whether it's a new home or retirement, we help you reach your goals."
                        />
                        <FeatureCard
                            icon={<Shield className="w-6 h-6 text-brand" />}
                            title="Privacy First"
                            description="Your financial data belongs to you. We never sell your personal information to third parties."
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 text-slate-400 py-12 px-4">
                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="text-brand w-6 h-6" />
                            <span className="text-xl font-display font-bold text-white">WealthWise AI</span>
                        </div>
                        <p className="text-sm">Empowering every Indian with intelligent financial management.</p>
                    </div>
                    {/* ... footer links would go here ... */}
                </div>
                <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-900 text-center text-sm">
                    © 2026 WealthWise AI. All rights reserved. Built with ❤️ for Bharat.
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="p-8 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-brand/5 transition-all group">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h3 className="mt-6 text-xl font-bold text-slate-900">{title}</h3>
        <p className="mt-3 text-slate-600 leading-relaxed text-sm">{description}</p>
    </div>
);

export default LandingPage;
