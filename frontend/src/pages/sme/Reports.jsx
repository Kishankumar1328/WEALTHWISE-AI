import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    FileText, Download, Clock, CheckCircle, XCircle,
    Printer, Share2, Plus
} from 'lucide-react';
import { smeReportApi, smeBusinessApi } from '../../api/api';
import PageContainer from '../../components/common/PageContainer';
import LoadingScreen from '../../components/common/LoadingScreen';

const Reports = () => {
    const queryClient = useQueryClient();
    const [selectedBusiness, setSelectedBusiness] = React.useState(null);
    const [selectedType, setSelectedType] = useState('MIS_REPORT');
    const [reportTitle, setReportTitle] = useState('');

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

    const { data: reports = [], isLoading } = useQuery({
        queryKey: ['financial-reports', businessId],
        queryFn: () => businessId ? smeReportApi.getAll(businessId).then(res => res.data) : [],
        enabled: !!businessId,
        refetchInterval: 5000 // Poll for status updates
    });

    const generateMutation = useMutation({
        mutationFn: () => smeReportApi.generate(businessId, selectedType, reportTitle || `${selectedType.replace('_', ' ')} - ${new Date().toLocaleDateString()}`),
        onSuccess: () => {
            setReportTitle('');
            queryClient.invalidateQueries(['financial-reports', businessId]);
        }
    });

    const reportTypes = [
        { id: 'MIS_REPORT', label: 'MIS Monthly Report' },
        { id: 'INVESTOR_PITCH_DECK', label: 'Investor Pitch Logic' },
        { id: 'TAX_FILING_SUMMARY', label: 'Tax Filing Summary' },
        { id: 'CASH_FLOW_ANALYSIS', label: 'Cash Flow Deep Dive' }
    ];

    const handleDownload = async (reportId, filename) => {
        try {
            const response = await smeReportApi.download(businessId, reportId);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${filename || 'report'}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Failed to download report.');
        }
    };

    if (isLoading) return <LoadingScreen message="Loading Report Archives..." />;

    return (
        <PageContainer>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Report Center</h1>
                    <p className="text-slate-500 font-bold mt-2">Generate audit-ready financial statements and investor decks.</p>
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                {/* Generator Card */}
                <div className="horizon-card p-6 bg-slate-900 text-white border-none shadow-xl col-span-1 lg:col-span-1">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                        <Printer size={20} className="text-indigo-400" /> Generate New
                    </h3>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Report Type</label>
                            <select
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-indigo-500"
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                            >
                                {reportTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Report Title (Optional)</label>
                            <input
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-indigo-500 placeholder:text-slate-600"
                                placeholder="e.g. Q3 Financials"
                                value={reportTitle}
                                onChange={(e) => setReportTitle(e.target.value)}
                            />
                        </div>
                        <button
                            className="w-full btn-primary-horizon bg-indigo-500 hover:bg-indigo-400 border-none justify-center mt-4"
                            onClick={() => generateMutation.mutate()}
                            disabled={generateMutation.isPending}
                        >
                            {generateMutation.isPending ? 'Queuing...' : 'Generate PDF Package'}
                        </button>
                    </div>
                </div>

                {/* History List */}
                <div className="col-span-1 lg:col-span-2 space-y-4">
                    {reports.map((report) => (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={report.id}
                            className="horizon-card p-5 flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg
                                    ${report.status === 'COMPLETED' ? 'bg-indigo-50 text-indigo-600' :
                                        report.status === 'FAILED' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600 animate-pulse'}`}>
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{report.reportTitle}</h4>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                                        <span>{new Date(report.generationDate).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span className="uppercase">{report.reportType.replace('_', ' ')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {report.status === 'COMPLETED' ? (
                                    <button
                                        onClick={() => handleDownload(report.id, report.reportTitle)}
                                        className="btn-ghost-horizon text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                                    >
                                        <Download size={14} /> Download PDF
                                    </button>
                                ) : report.status === 'GENERATING' ? (
                                    <span className="flex items-center gap-2 text-xs font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-3 py-2 rounded-lg">
                                        <Clock size={14} className="animate-spin" /> Processing
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2 text-xs font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-3 py-2 rounded-lg">
                                        <XCircle size={14} /> Failed
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </PageContainer>
    );
};

export default Reports;
