import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Briefcase, Shield, Percent, ExternalLink, ThumbsUp,
    Check, Zap
} from 'lucide-react';
import { smeFinancialProductApi, smeBusinessApi } from '../../api/api';
import PageContainer from '../../components/common/PageContainer';
import LoadingScreen from '../../components/common/LoadingScreen';

const FinancialProducts = () => {
    const queryClient = useQueryClient();
    const [selectedBusiness, setSelectedBusiness] = React.useState(null);

    const { data: businesses = [] } = useQuery({
        queryKey: ['sme-businesses'],
        queryFn: () => smeBusinessApi.getAll().then(res => res.data)
    });

    React.useEffect(() => {
        if (businesses.length > 0 && !selectedBusiness) {
            setSelectedBusiness(businesses[0]);
        }
    }, [businesses, selectedBusiness]);

    const businessId = selectedBusiness?.id;

    const { data: recommendations = [], isLoading: recsLoading } = useQuery({
        queryKey: ['product-recs', businessId],
        queryFn: () => businessId ? smeFinancialProductApi.getRecommendations(businessId).then(res => res.data) : [],
        enabled: !!businessId
    });

    const { data: allProducts = [] } = useQuery({
        queryKey: ['all-products'],
        queryFn: () => smeFinancialProductApi.getActiveProducts().then(res => res.data)
    });

    const generateMutation = useMutation({
        mutationFn: () => smeFinancialProductApi.generate(businessId),
        onSuccess: (res) => {
            queryClient.invalidateQueries(['product-recs', businessId]);
            // alert(`Analysis complete! Found ${res.data} new recommendations.`);
        }
    });

    if (recsLoading && !allProducts.length) return <LoadingScreen message="Matching Financial Products..." />;

    return (
        <PageContainer>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Financial Marketplace</h1>
                    <p className="text-slate-500 font-bold mt-2">Curated loans, insurance, and credit lines tailored to your business profile.</p>
                    <div className="mt-6 flex items-center gap-4">
                        <select
                            className="bg-white px-4 py-2 rounded-xl font-bold text-slate-700 shadow-sm border-none outline-none min-w-[200px]"
                            value={businessId || ''}
                            onChange={(e) => setSelectedBusiness(businesses.find(b => b.id === parseInt(e.target.value)))}
                        >
                            {businesses.map(b => <option key={b.id} value={b.id}>{b.businessName}</option>)}
                        </select>
                    </div>
                </div>
                <button
                    onClick={() => generateMutation.mutate()}
                    className="btn-primary-horizon"
                    disabled={generateMutation.isPending || !businessId}
                >
                    <Zap size={18} />
                    Refresh Matches
                </button>
            </div>

            {/* Recommendations Section */}
            {recommendations.length > 0 && (
                <div className="mb-16">
                    <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                        <ThumbsUp className="text-indigo-600" /> Recommended For You
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {recommendations.map((rec) => (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={rec.id}
                                className="horizon-card p-0 overflow-hidden group hover:border-indigo-200 transition-all"
                            >
                                <div className="h-2 bg-indigo-600 w-full" />
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                            <Briefcase size={20} />
                                        </div>
                                        <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black uppercase tracking-widest">
                                            {rec.matchScore}% Match
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-black text-slate-900 mb-1">{rec.product.productName}</h3>
                                    <p className="text-slate-500 text-sm font-bold mb-4">{rec.product.providerName}</p>

                                    <div className="space-y-3 mb-8">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400 font-medium">Interest Rate</span>
                                            <span className="font-black text-slate-800">{rec.product.interestRateMin}% - {rec.product.interestRateMax}%</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400 font-medium">Max Amount</span>
                                            <span className="font-black text-slate-800">₹{(rec.product.maxLoanAmount / 100000).toFixed(1)}L</span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 -mx-8 -mb-8 p-4 mt-6 border-t border-slate-100 group-hover:bg-indigo-50/30 transition-colors">
                                        <button className="w-full btn-primary-horizon justify-center">
                                            Apply Now <ExternalLink size={14} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Products Catalog */}
            <h2 className="text-2xl font-black text-slate-900 mb-6">All Financing Options</h2>
            <div className="space-y-4">
                {allProducts.map((prod) => (
                    <div key={prod.id} className="horizon-card p-6 flex flex-col lg:flex-row items-center gap-6 justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center">
                                <Shield size={20} />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 text-lg">{prod.productName}</h4>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{prod.providerName} • {prod.productType.replace('_', ' ')}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-12">
                            <div className="text-center">
                                <span className="block text-[10px] uppercase font-black text-slate-400 tracking-widest">Rate</span>
                                <span className="block font-bold text-slate-800">{prod.interestRateMin}%</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-[10px] uppercase font-black text-slate-400 tracking-widest">Fees</span>
                                <span className="block font-bold text-slate-800">{prod.processingFeePercentage}%</span>
                            </div>
                            <button className="btn-ghost-horizon text-xs">View Details</button>
                        </div>
                    </div>
                ))}
            </div>
        </PageContainer>
    );
};

export default FinancialProducts;
