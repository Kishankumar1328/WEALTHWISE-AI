import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Receipt, Plus, Search, Filter, ArrowUpRight, ArrowDownRight,
    Calendar, Clock, AlertTriangle, CheckCircle, X, IndianRupee,
    Briefcase, Building2, ChevronRight, MoreVertical, LayoutGrid, List,
    ArrowRightCircle, Wallet, Pencil, Trash2, Building
} from 'lucide-react';
import { smeInvoiceApi, smeBusinessApi } from '../../api/api';
import './InvoiceManagement.css';

const InvoiceManagement = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [editingInvoice, setEditingInvoice] = useState(null);

    const [invoiceForm, setInvoiceForm] = useState({
        invoiceType: 'RECEIVABLE',
        invoiceNumber: '',
        partyName: '',
        partyGstin: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        amount: '',
        taxAmount: '',
        description: '',
        category: ''
    });

    const { data: businesses = [] } = useQuery({
        queryKey: ['sme-businesses'],
        queryFn: () => smeBusinessApi.getAll().then(res => res.data)
    });

    useEffect(() => {
        if (businesses.length > 0 && !selectedBusiness) {
            setSelectedBusiness(businesses[0]);
        }
    }, [businesses, selectedBusiness]);

    const { data: invoices = [], isLoading } = useQuery({
        queryKey: ['sme-invoices', selectedBusiness?.id, activeTab],
        queryFn: async () => {
            if (!selectedBusiness?.id) return [];
            let response;
            if (activeTab === 'receivables') response = await smeInvoiceApi.getReceivables(selectedBusiness.id);
            else if (activeTab === 'payables') response = await smeInvoiceApi.getPayables(selectedBusiness.id);
            else if (activeTab === 'overdue') response = await smeInvoiceApi.getOverdue(selectedBusiness.id);
            else response = await smeInvoiceApi.getAll(selectedBusiness.id);
            return response.data;
        },
        enabled: !!selectedBusiness?.id,
        refetchInterval: 30000
    });

    const { data: summary } = useQuery({
        queryKey: ['sme-invoice-summary', selectedBusiness?.id],
        queryFn: () => smeInvoiceApi.getSummary(selectedBusiness.id).then(res => res.data),
        enabled: !!selectedBusiness?.id,
        refetchInterval: 30000
    });

    const createInvoiceMutation = useMutation({
        mutationFn: (data) => smeInvoiceApi.create(selectedBusiness.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sme-invoices', selectedBusiness?.id] });
            queryClient.invalidateQueries({ queryKey: ['sme-invoice-summary', selectedBusiness?.id] });
            setShowModal(false);
            resetForm();
        }
    });

    const markAsPaidMutation = useMutation({
        mutationFn: ({ invoiceId, amount }) => smeInvoiceApi.markAsPaid(selectedBusiness.id, invoiceId, amount),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sme-invoices', selectedBusiness?.id] });
            queryClient.invalidateQueries({ queryKey: ['sme-invoice-summary', selectedBusiness?.id] });
        }
    });

    const updateInvoiceMutation = useMutation({
        mutationFn: (data) => smeInvoiceApi.update(selectedBusiness.id, data.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sme-invoices', selectedBusiness?.id] });
            queryClient.invalidateQueries({ queryKey: ['sme-invoice-summary', selectedBusiness?.id] });
            setShowModal(false);
            setEditingInvoice(null);
            resetForm();
        }
    });

    const deleteInvoiceMutation = useMutation({
        mutationFn: (invoiceId) => smeInvoiceApi.delete(selectedBusiness.id, invoiceId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sme-invoices', selectedBusiness?.id] });
            queryClient.invalidateQueries({ queryKey: ['sme-invoice-summary', selectedBusiness?.id] });
        }
    });

    const resetForm = () => {
        setInvoiceForm({ invoiceType: 'RECEIVABLE', invoiceNumber: '', partyName: '', partyGstin: '', invoiceDate: new Date().toISOString().split('T')[0], dueDate: '', amount: '', taxAmount: '', description: '', category: '' });
        setEditingInvoice(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInvoiceForm(prev => ({ ...prev, [name]: value }));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const getStatusBadge = (status) => {
        const badges = {
            PENDING: { style: 'pending', icon: <Clock size={12} />, text: 'UNPAID' },
            PAID: { style: 'paid', icon: <CheckCircle size={12} />, text: 'SETTLED' },
            PARTIALLY_PAID: { style: 'pending', icon: <Clock size={12} />, text: 'PARTIAL' },
            OVERDUE: { style: 'overdue', icon: <AlertTriangle size={12} />, text: 'CRITICAL' },
            CANCELLED: { style: 'pending', icon: <X size={12} />, text: 'VOIDED' }
        };
        return badges[status] || badges.PENDING;
    };

    const filteredInvoices = invoices.filter(inv =>
        (inv.partyName || inv.clientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.invoiceNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const containerVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.08 } }
    };

    if (isLoading && !invoices.length) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Receipt className="animate-spin text-indigo-600" size={40} />
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Querying Financial Ledger...</p>
        </div>
    );

    return (
        <motion.div
            className="invoice-management-v2 px-6 lg:px-12 py-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <header className="invoice-header-horizon flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-16">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-lg uppercase tracking-[0.2em]">Live Ledger Surveillance</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                        Invoice <br />
                        <span className="text-indigo-600">Omni-Channel</span>
                    </h1>
                </div>

                <div className="flex flex-col items-end gap-6">
                    <div className="horizon-card px-2 py-1 flex items-center bg-white shadow-xl shadow-slate-100">
                        <select
                            className="bg-transparent px-6 py-3 font-black text-slate-700 outline-none border-none min-w-[240px]"
                            value={selectedBusiness?.id || ''}
                            onChange={(e) => setSelectedBusiness(businesses.find(b => b.id === parseInt(e.target.value)))}
                        >
                            {businesses.map(b => <option key={b.id} value={b.id}>{b.businessName}</option>)}
                        </select>
                    </div>
                    <button className="btn-primary-horizon" onClick={() => setShowModal(true)}>
                        <Plus size={20} /> REGISTER TRANSACTION
                    </button>
                </div>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                <div className="horizon-card p-8 group hover:bg-slate-900 transition-colors duration-500">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-white/10 group-hover:text-emerald-400"><ArrowUpRight size={24} /></div>
                        <span className="text-[10px] font-black group-hover:text-white/60 uppercase tracking-widest text-slate-400">Expected Inflow</span>
                    </div>
                    <h4 className="text-3xl font-black group-hover:text-white tracking-tighter">{formatCurrency(summary?.totalReceivables)}</h4>
                </div>
                <div className="horizon-card p-8 group hover:bg-slate-900 transition-colors duration-500">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center group-hover:bg-white/10 group-hover:text-rose-400"><ArrowDownRight size={24} /></div>
                        <span className="text-[10px] font-black group-hover:text-white/60 uppercase tracking-widest text-slate-400">Projected Outflow</span>
                    </div>
                    <h4 className="text-3xl font-black group-hover:text-white tracking-tighter">{formatCurrency(summary?.totalPayables)}</h4>
                </div>
                <div className="horizon-card p-8 group hover:bg-slate-900 transition-colors duration-500">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:bg-white/10 group-hover:text-amber-400"><AlertTriangle size={24} /></div>
                        <span className="text-[10px] font-black group-hover:text-white/60 uppercase tracking-widest text-slate-400">Aging Exposure</span>
                    </div>
                    <h4 className="text-3xl font-black group-hover:text-white tracking-tighter">{formatCurrency(summary?.overdueReceivables)}</h4>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-12">
                <div className="invoice-tabs-horizon">
                    {['all', 'receivables', 'payables', 'overdue'].map(tab => (
                        <button key={tab} className={`invoice-tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Neural filter by Entity or ID..."
                        className="w-full pl-16 pr-8 py-5 border-none bg-white rounded-[24px] font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-indigo-50 outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <AnimatePresence mode="wait">
                <motion.div key={activeTab + searchQuery} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {filteredInvoices.length > 0 ? filteredInvoices.map((inv) => (
                        <div key={inv.id} className="invoice-card-horizon">
                            <div className={`invoice-type-icon ${inv.invoiceType === 'RECEIVABLE' ? 'receivable' : 'payable'}`}>
                                {inv.invoiceType === 'RECEIVABLE' ? <ArrowUpRight size={32} /> : <ArrowDownRight size={32} />}
                            </div>
                            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                                <div>
                                    <h5 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">ID: {inv.invoiceNumber}</h5>
                                    <span className="text-xl font-black text-slate-900 tracking-tighter">{inv.partyName || inv.clientName}</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Calendar size={12} /> ISSUED: {new Date(inv.invoiceDate).toLocaleDateString()}
                                    </span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${inv.status === 'OVERDUE' ? 'text-rose-500' : 'text-slate-400'}`}>
                                        <Clock size={12} /> DUE: {new Date(inv.dueDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between lg:justify-end gap-12">
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-slate-900 block">{formatCurrency(inv.totalAmount)}</span>
                                        <span className={`invoice-status-pill ${getStatusBadge(inv.status).style}`}>
                                            {getStatusBadge(inv.status).text}
                                        </span>
                                    </div>
                                    {inv.status !== 'PAID' && (
                                        <button className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm" onClick={() => {
                                            const amount = prompt('ENTER SETTLEMENT QUANTUM:', inv.totalAmount - (inv.paidAmount || 0));
                                            if (amount) markAsPaidMutation.mutate({ invoiceId: inv.id, amount: parseFloat(amount) });
                                        }}>
                                            <Wallet size={20} />
                                        </button>
                                    )}
                                    <div className="flex gap-2">
                                        <button className="p-4 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm" onClick={() => {
                                            setEditingInvoice(inv);
                                            setInvoiceForm({
                                                ...inv,
                                                invoiceDate: inv.invoiceDate ? new Date(inv.invoiceDate).toISOString().split('T')[0] : '',
                                                dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '',
                                                amount: inv.amount.toString(),
                                                taxAmount: inv.taxAmount.toString()
                                            });
                                            setShowModal(true);
                                        }}>
                                            <Pencil size={18} />
                                        </button>
                                        <button className="p-4 bg-slate-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-sm" onClick={() => {
                                            if (window.confirm('Delete this record from ledger?')) {
                                                deleteInvoiceMutation.mutate(inv.id);
                                            }
                                        }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="py-24 horizon-card border-dashed border-2 flex flex-col items-center justify-center text-center">
                            <Receipt size={64} className="text-slate-100 mb-6" />
                            <h4 className="text-2xl font-black text-slate-200 uppercase tracking-tighter">No Transaction Vectors Detected</h4>
                            <p className="text-slate-300 font-bold mt-2 uppercase tracking-widest text-[10px]">Adjust filtration protocol to locate records</p>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="modal-overlay fixed inset-0 bg-slate-900/40 backdrop-blur-xl flex items-center justify-center z-50 p-6 overflow-y-auto">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="horizon-modal shadow-2xl shadow-black/30">
                            <div className="flex justify-between items-center mb-12">
                                <div>
                                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{editingInvoice ? 'Modify' : 'Register'} <br /><span className="text-indigo-600">Transaction</span></h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">{editingInvoice ? 'Adjusting ledger entry' : 'Ingesting manual ledger entry'}</p>
                                </div>
                                <button className="p-4 bg-slate-50 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all" onClick={() => setShowModal(false)}><X size={32} /></button>
                            </div>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const data = {
                                    ...invoiceForm,
                                    amount: parseFloat(invoiceForm.amount),
                                    taxAmount: invoiceForm.taxAmount ? parseFloat(invoiceForm.taxAmount) : 0
                                };
                                if (editingInvoice) {
                                    updateInvoiceMutation.mutate({ ...data, id: editingInvoice.id });
                                } else {
                                    createInvoiceMutation.mutate(data);
                                }
                            }}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="horizon-input-group md:col-span-2">
                                        <label>Transaction Vector</label>
                                        <div className="flex gap-4">
                                            <button type="button" className={`flex-1 py-4 rounded-2xl font-black text-xs transition-all ${invoiceForm.invoiceType === 'RECEIVABLE' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`} onClick={() => setInvoiceForm(prev => ({ ...prev, invoiceType: 'RECEIVABLE' }))}>RECEIVABLE</button>
                                            <button type="button" className={`flex-1 py-4 rounded-2xl font-black text-xs transition-all ${invoiceForm.invoiceType === 'PAYABLE' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`} onClick={() => setInvoiceForm(prev => ({ ...prev, invoiceType: 'PAYABLE' }))}>PAYABLE</button>
                                        </div>
                                    </div>
                                    <div className="horizon-input-group">
                                        <label>Invoice Number</label>
                                        <input type="text" name="invoiceNumber" placeholder="INV-001" value={invoiceForm.invoiceNumber} onChange={handleInputChange} required />
                                    </div>
                                    <div className="horizon-input-group">
                                        <label>Counterparty Node</label>
                                        <input type="text" name="partyName" placeholder="Entity Name" value={invoiceForm.partyName} onChange={handleInputChange} required />
                                    </div>
                                    <div className="horizon-input-group">
                                        <label>Emission Date</label>
                                        <input type="date" name="invoiceDate" value={invoiceForm.invoiceDate} onChange={handleInputChange} required />
                                    </div>
                                    <div className="horizon-input-group">
                                        <label>Maturity Deadline</label>
                                        <input type="date" name="dueDate" value={invoiceForm.dueDate} onChange={handleInputChange} required />
                                    </div>
                                    <div className="horizon-input-group">
                                        <label>Quantum (Base)</label>
                                        <input type="number" name="amount" placeholder="0.00" value={invoiceForm.amount} onChange={handleInputChange} required />
                                    </div>
                                    <div className="horizon-input-group">
                                        <label>Tax Index (%)</label>
                                        <input type="number" name="taxAmount" placeholder="0.00" value={invoiceForm.taxAmount} onChange={handleInputChange} />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-6 mt-20 pt-10 border-t border-slate-100">
                                    <button type="button" className="text-xs font-black text-slate-400 uppercase tracking-widest" onClick={() => setShowModal(false)}>Discard</button>
                                    <button type="submit" className="btn-primary-horizon px-12 py-5" disabled={createInvoiceMutation.isPending || updateInvoiceMutation.isPending}>
                                        {createInvoiceMutation.isPending || updateInvoiceMutation.isPending ? 'Syncing...' : (editingInvoice ? 'Update Entry' : 'Confirm Ingestion')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default InvoiceManagement;
