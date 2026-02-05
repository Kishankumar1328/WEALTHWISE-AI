import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    BookOpen, Plus, Play, RefreshCw, CheckCircle,
    AlertTriangle, Sparkles, Filter, Trash2
} from 'lucide-react';
import { smeBookkeepingApi, smeBusinessApi } from '../../api/api';
import PageContainer from '../../components/common/PageContainer';
import LoadingScreen from '../../components/common/LoadingScreen';
import ErrorState from '../../components/common/ErrorState';

const Bookkeeping = () => {
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [newRule, setNewRule] = useState({ allowMultiple: true, ruleName: '', keywordPattern: '', targetCategory: '', amountMin: '', amountMax: '' });
    const [selectedBusiness, setSelectedBusiness] = useState(null);

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

    const { data: rules = [], isLoading } = useQuery({
        queryKey: ['bookkeeping-rules', businessId],
        queryFn: () => businessId ? smeBookkeepingApi.getRules(businessId).then(res => res.data) : [],
        enabled: !!businessId
    });

    const createMutation = useMutation({
        mutationFn: (data) => smeBookkeepingApi.createRule(businessId, data),
        onSuccess: () => {
            setIsCreating(false);
            setNewRule({ allowMultiple: true, ruleName: '', keywordPattern: '', targetCategory: '', amountMin: '', amountMax: '' });
            queryClient.invalidateQueries(['bookkeeping-rules', businessId]);
        }
    });

    const runCategorizationMutation = useMutation({
        mutationFn: () => smeBookkeepingApi.runCategorization(businessId),
        onSuccess: (res) => {
            alert(`Processed ${res.data.processed} transactions successfully!`);
        }
    });

    const scanDuplicatesMutation = useMutation({
        mutationFn: () => smeBookkeepingApi.scanDuplicates(businessId),
        onSuccess: (res) => {
            alert(`Found ${res.data.duplicatesFound} potential duplicate records.`);
        }
    });

    const deleteRuleMutation = useMutation({
        mutationFn: (ruleId) => smeBookkeepingApi.deleteRule(businessId, ruleId),
        onSuccess: () => {
            queryClient.invalidateQueries(['bookkeeping-rules', businessId]);
        }
    });

    if (isLoading) return <LoadingScreen message="Loading Automation Rules..." />;

    return (
        <PageContainer>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Automated Bookkeeping</h1>
                    <p className="text-slate-500 font-bold mt-2">Define rules to auto-categorize transactions and detect anomalies.</p>
                    <div className="mt-6 flex items-center gap-4">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Business:</span>
                        <select
                            className="bg-white px-4 py-2 rounded-xl font-bold text-slate-700 shadow-sm border-none outline-none min-w-[200px]"
                            value={businessId || ''}
                            onChange={(e) => setSelectedBusiness(businesses.find(b => b.id === parseInt(e.target.value)))}
                        >
                            {businesses.map(b => <option key={b.id} value={b.id}>{b.businessName}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => scanDuplicatesMutation.mutate()}
                        className="btn-ghost-horizon text-amber-600 bg-amber-50 hover:bg-amber-100"
                        disabled={scanDuplicatesMutation.isPending}
                    >
                        <RefreshCw size={18} className={scanDuplicatesMutation.isPending ? 'animate-spin' : ''} />
                        Scan Duplicates
                    </button>
                    <button
                        onClick={() => runCategorizationMutation.mutate()}
                        className="btn-primary-horizon"
                        disabled={runCategorizationMutation.isPending}
                    >
                        <Play size={18} />
                        Run Auto-Pilot
                    </button>
                </div>
            </div>

            {/* Rules Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create New Rule Card */}
                <div className="horizon-card p-6 border-dashed border-2 border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/30">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            <Plus size={20} />
                        </div>
                        <h3 className="font-black text-slate-800">New Rule</h3>
                    </div>
                    <div className="space-y-4">
                        <input
                            placeholder="Rule Name (e.g. Uber Travel)"
                            className="input-horizon text-sm"
                            value={newRule.ruleName}
                            onChange={e => setNewRule({ ...newRule, ruleName: e.target.value })}
                        />
                        <input
                            placeholder="If text contains... (e.g. Uber)"
                            className="input-horizon text-sm"
                            value={newRule.keywordPattern}
                            onChange={e => setNewRule({ ...newRule, keywordPattern: e.target.value })}
                        />
                        <input
                            placeholder="Set Category To... (e.g. Travel)"
                            className="input-horizon text-sm"
                            value={newRule.targetCategory}
                            onChange={e => setNewRule({ ...newRule, targetCategory: e.target.value })}
                        />
                        <button
                            className="w-full btn-primary-horizon justify-center mt-4"
                            onClick={() => createMutation.mutate(newRule)}
                            disabled={!newRule.ruleName || !newRule.targetCategory}
                        >
                            Create Automation Rule
                        </button>
                    </div>
                </div>

                {/* Existing Rules */}
                {rules.map((rule) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={rule.id}
                        className="horizon-card p-6"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                    <Sparkles size={16} />
                                </div>
                                <h3 className="font-bold text-slate-900">{rule.ruleName}</h3>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-2 py-1 rounded">Active</span>
                        </div>

                        <div className="space-y-3 text-sm text-slate-600 font-medium">
                            <div className="flex items-center gap-2">
                                <Filter size={14} className="text-slate-400" />
                                <span>If text contains "<b>{rule.keywordPattern}</b>"</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <BookOpen size={14} className="text-slate-400" />
                                <span>Mark as <span className="text-indigo-600 font-bold">{rule.targetCategory}</span></span>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-xs text-slate-400 font-semibold">Processed {rule.processedCount || 0} txns</span>
                            <button
                                onClick={() => {
                                    if (window.confirm('Delete this automation rule?')) {
                                        deleteRuleMutation.mutate(rule.id);
                                    }
                                }}
                                className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </PageContainer>
    );
};

export default Bookkeeping;
