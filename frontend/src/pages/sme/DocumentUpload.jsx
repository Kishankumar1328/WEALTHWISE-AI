import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    AlertCircle, Calendar, CheckCircle, Clock,
    UploadCloud as CloudUpload,
    Database,
    Download, File, FileSpreadsheet,
    FileText,
    HardDrive,
    Image as ImageIcon,
    Play,
    RefreshCw,
    Search,
    Sparkles,
    Trash2
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { smeBusinessApi, smeDocumentApi } from '../../api/api';
import DocumentResultsModal from '../../components/sme/DocumentResultsModal';
import PageContainer from '../../components/common/PageContainer';
import LoadingScreen from '../../components/common/LoadingScreen';
import ErrorState from '../../components/common/ErrorState';
import './DocumentUpload.css';

const DOCUMENT_CATEGORIES = [
    { value: 'BANK_STATEMENT', label: 'Bank Analysis', icon: <FileText size={18} /> },
    { value: 'GST_RETURNS', label: 'GST Filings', icon: <FileSpreadsheet size={18} /> },
    { value: 'FINANCIAL_STATEMENT', label: 'Statements', icon: <FileText size={18} /> },
    { value: 'INVOICE_REGISTER', label: 'Ledgers', icon: <File size={18} /> },
];

const FILE_TYPE_ICONS = {
    'application/pdf': <File size={32} className="text-rose-500" />,
    'application/vnd.ms-excel': <FileSpreadsheet size={32} className="text-emerald-500" />,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': <FileSpreadsheet size={32} className="text-emerald-500" />,
    'text/csv': <FileSpreadsheet size={32} className="text-teal-500" />,
    'image/png': <ImageIcon size={32} className="text-blue-500" />,
    'image/jpeg': <ImageIcon size={32} className="text-blue-500" />,
};

const DocumentUpload = () => {
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [viewingDoc, setViewingDoc] = useState(null);

    const [error, setError] = useState(null);

    const { data: businesses = [], isLoading: businessesLoading } = useQuery({
        queryKey: ['sme-businesses'],
        queryFn: () => smeBusinessApi.getAll().then(res => Array.isArray(res.data) ? res.data : [])
    });

    useEffect(() => {
        if (businesses.length > 0 && !selectedBusiness) {
            setSelectedBusiness(businesses[0]);
        }
    }, [businesses, selectedBusiness]);

    const { data: documents = [], isLoading: docsLoading, refetch } = useQuery({
        queryKey: ['sme-documents', selectedBusiness?.id, activeCategory],
        queryFn: async () => {
            if (!selectedBusiness?.id) return [];
            let response;
            if (activeCategory !== 'all') {
                response = await smeDocumentApi.getByCategory(selectedBusiness.id, activeCategory);
            } else {
                response = await smeDocumentApi.getAll(selectedBusiness.id);
            }
            return Array.isArray(response.data) ? response.data : [];
        },
        enabled: !!selectedBusiness?.id,
        refetchInterval: (query) => {
            const docs = query?.state?.data;
            if (Array.isArray(docs) && docs.some(d => d.parseStatus === 'PROCESSING')) return 4000;
            return false;
        }
    });

    const uploadMutation = useMutation({
        mutationFn: async ({ file, category }) => {
            setError(null);
            if (!selectedBusiness?.id) throw new Error("No business selected");
            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', category);
            return smeDocumentApi.upload(selectedBusiness.id, formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['sme-documents']);
        },
        onError: (err) => {
            setError(err.message || "Upload failed");
        }
    });

    const parseMutation = useMutation({
        mutationFn: (documentId) => {
            setError(null);
            return smeDocumentApi.parse(documentId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['sme-documents']);
        },
        onError: (error) => {
            console.error('Parse error:', error);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to analyze document';
            setError(errorMsg);
        }
    });

    const handleFiles = (files) => {
        if (!selectedBusiness) return;
        files.forEach(file => {
            uploadMutation.mutate({ file, category: activeCategory === 'all' ? 'OTHER' : activeCategory });
        });
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getParseStatusBadge = (doc) => {
        const badges = {
            PENDING: { class: 'status-pending', icon: <Clock size={12} />, text: 'READY FOR AI' },
            PROCESSING: { class: 'status-processing', icon: <Activity size={12} className="animate-spin" />, text: 'NEURAL PARSING' },
            COMPLETED: { class: 'status-completed', icon: <CheckCircle size={12} />, text: 'AI INSIGHTS READY' },
            FAILED: { class: 'status-failed', icon: <AlertCircle size={12} />, text: 'PARSING ERROR' },
        };
        return badges[doc.parseStatus] || badges.PENDING;
    };

    const filteredDocuments = useMemo(() => {
        return documents.filter(d =>
            (d.originalFileName || d.fileName || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [documents, searchQuery]);

    const containerVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.05 } }
    };

    if (businessesLoading) {
        return <LoadingScreen message="Syncing Neural Repository..." />;
    }

    return (
        <PageContainer className="document-upload-v2 py-10">
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-indigo-600 rounded-[24px] flex items-center justify-center text-white shadow-2xl shadow-indigo-200">
                        <Database size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Neural <span className="text-indigo-600">Vault</span></h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Autonomous Ledger Ingestion active</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="horizon-card px-2 py-1 flex items-center bg-white">
                        <select
                            className="bg-transparent px-4 py-3 font-black text-slate-700 outline-none border-none min-w-[200px]"
                            value={selectedBusiness?.id || ''}
                            onChange={(e) => setSelectedBusiness(businesses.find(b => b.id === parseInt(e.target.value)))}
                        >
                            {businesses.map(b => (
                                <option key={b.id} value={b.id}>{b.businessName}</option>
                            ))}
                        </select>
                    </div>
                    <button className="btn-primary-horizon" onClick={() => fileInputRef.current?.click()}>
                        <CloudUpload size={20} /> STOCHASTIC INGEST
                    </button>
                </div>
                <input ref={fileInputRef} type="file" multiple onChange={(e) => handleFiles([...e.target.files])} style={{ display: 'none' }} />
            </header>

            {error && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-600"
                >
                    <AlertCircle size={20} />
                    <div className="flex-1">
                        <p className="text-xs font-black uppercase tracking-widest">Neural Fault Detected</p>
                        <p className="text-sm font-bold opacity-80">{error}</p>
                    </div>
                    <button onClick={() => setError(null)} className="p-2 hover:bg-rose-100 rounded-lg transition-colors">
                        <RefreshCw size={14} />
                    </button>
                </motion.div>
            )}

            <div
                className={`upload-zone horizon-card border-dashed border-2 py-16 flex flex-col items-center justify-center cursor-pointer transition-all ${dragActive ? 'bg-indigo-50/50 border-indigo-300' : 'bg-white/50 border-slate-200'}`}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles([...e.dataTransfer.files]); }}
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[32px] flex items-center justify-center mb-6">
                    {uploadMutation.isPending ? <RefreshCw size={48} className="animate-spin" /> : <CloudUpload size={48} />}
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tighter">
                    {uploadMutation.isPending ? 'Ingesting Vectors...' : 'Neural Data Drop'}
                </h3>
                <p className="text-slate-400 font-bold mt-2 uppercase">
                    {uploadMutation.isPending ? `Syncing ${uploadMutation.variables?.file?.name || 'document'}...` : 'DRAG & DROP BANK STATEMENTS OR LEDGERS FOR INSTANT PARSING'}
                </p>
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 my-12">
                <div className="flex gap-2 p-1 bg-slate-100 rounded-[20px]">
                    <button
                        className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        onClick={() => setActiveCategory('all')}
                    >
                        Master Vault
                    </button>
                    {DOCUMENT_CATEGORIES.map(cat => (
                        <button
                            key={cat.value}
                            className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeCategory === cat.value ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            onClick={() => setActiveCategory(cat.value)}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Neural search by filename..."
                        className="w-full pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-[20px] font-bold text-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {docsLoading ? (
                    <div className="col-span-full py-20 flex flex-col items-center gap-4">
                        <Activity className="animate-spin text-indigo-400" size={40} />
                        <span className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Accessing Neural Storage...</span>
                    </div>
                ) : filteredDocuments.length > 0 ? (
                    filteredDocuments.map((doc) => (
                        <motion.div
                            key={doc.id}
                            layout
                            className="horizon-card p-8 group hover:border-indigo-600"
                            variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                    {FILE_TYPE_ICONS[doc.fileType] || <File size={28} />}
                                </div>
                                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${getParseStatusBadge(doc).class === 'status-completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                                    {getParseStatusBadge(doc).icon}
                                    {getParseStatusBadge(doc).text}
                                </div>
                            </div>

                            <div className="mb-8">
                                <h4 className="text-lg font-black text-slate-800 truncate" title={doc.originalFileName}>{doc.originalFileName || doc.fileName}</h4>
                                <div className="flex gap-4 mt-2">
                                    <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest"><HardDrive size={12} /> {formatFileSize(doc.fileSize)}</span>
                                    <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Calendar size={12} className="text-indigo-400" /> {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                {doc.parseStatus === 'PENDING' && (
                                    <button
                                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                                        onClick={() => parseMutation.mutate(doc.id)}
                                        disabled={parseMutation.isPending}
                                    >
                                        <Play size={12} fill="white" /> Execute Neural Analysis
                                    </button>
                                )}
                                {doc.parseStatus === 'COMPLETED' && (
                                    <button
                                        className="w-full py-3 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                                        onClick={() => setViewingDoc(doc)}
                                    >
                                        <Sparkles size={12} /> Visual Insights
                                    </button>
                                )}
                                <div className="flex gap-3">
                                    <button className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2" onClick={() => smeDocumentApi.download(selectedBusiness.id, doc.id).then(res => {
                                        const url = window.URL.createObjectURL(new Blob([res.data]));
                                        const a = document.createElement('a'); a.href = url; a.download = doc.originalFileName || 'doc'; a.click();
                                    })}>
                                        <Download size={12} /> Download
                                    </button>
                                    <button
                                        className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                                        onClick={() => smeDocumentApi.delete(selectedBusiness.id, doc.id).then(() => queryClient.invalidateQueries(['sme-documents']))}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-24 horizon-card border-dashed border-2 flex flex-col items-center justify-center text-center">
                        <Database size={64} className="text-slate-100 mb-6" />
                        <h4 className="text-xl font-black text-slate-300">Neural Repository Empty</h4>
                        <p className="text-sm font-bold text-slate-300 mt-2 uppercase tracking-widest">Ingest financial vectors to populate vault</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {viewingDoc && <DocumentResultsModal document={viewingDoc} onClose={() => setViewingDoc(null)} />}
            </AnimatePresence>
        </PageContainer>
    );
};

export default DocumentUpload;
