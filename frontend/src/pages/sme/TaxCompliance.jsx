import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Calendar, Clock, AlertTriangle, CheckCircle, X,
    Plus, FileText, Download, ChevronLeft, ChevronRight, Truck, RefreshCw, CheckSquare,
    Zap, Filter, Info, ArrowUpRight
} from 'lucide-react';
import { smeComplianceApi, smeBusinessApi } from '../../api/api';
import './TaxCompliance.css';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const FILING_TYPES = [
    { value: 'GSTR1', label: 'GSTR-1', description: 'Monthly/Quarterly Sales' },
    { value: 'GSTR3B', label: 'GSTR-3B', description: 'Tax Summary Return' },
    { value: 'TDS', label: 'TDS', description: 'Withholding Returns' },
    { value: 'ADVANCE_TAX', label: 'Advance Tax', description: 'Tax Installments' },
    { value: 'GSTR9', label: 'GSTR-9', description: 'Yearly Audit' },
    { value: 'ITR', label: 'ITR', description: 'Income Tax Return' },
];

const TaxCompliance = () => {
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'calendar');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [showModal, setShowModal] = useState(false);

    // Sync tab state with URL
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) setActiveTab(tab);
    }, [searchParams]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchParams({ tab: tab });
    };

    const [filingForm, setFilingForm] = useState({
        filingType: 'GSTR3B',
        filingPeriod: '',
        dueDate: '',
        taxLiability: '',
        inputTaxCredit: ''
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

    const { data: filings = [], isLoading } = useQuery({
        queryKey: ['sme-filings', selectedBusiness?.id],
        queryFn: () => smeComplianceApi.getAllFilings(selectedBusiness.id).then(res => res.data),
        enabled: !!selectedBusiness?.id
    });

    const { data: ewayBills = [] } = useQuery({
        queryKey: ['sme-ewaybills', selectedBusiness?.id],
        queryFn: () => smeComplianceApi.getEWayBills(selectedBusiness.id).then(res => res.data),
        enabled: !!selectedBusiness?.id
    });

    const { data: complianceScore } = useQuery({
        queryKey: ['sme-compliance-score', selectedBusiness?.id],
        queryFn: () => smeComplianceApi.getScore(selectedBusiness.id).then(res => res.data),
        enabled: !!selectedBusiness?.id
    });

    const { data: pendingFilings = [] } = useQuery({
        queryKey: ['sme-pending-filings', selectedBusiness?.id],
        queryFn: () => smeComplianceApi.getPending(selectedBusiness.id).then(res => res.data),
        enabled: !!selectedBusiness?.id
    });

    const { data: overdueFilings = [] } = useQuery({
        queryKey: ['sme-overdue-filings', selectedBusiness?.id],
        queryFn: () => smeComplianceApi.getOverdue(selectedBusiness.id).then(res => res.data),
        enabled: !!selectedBusiness?.id
    });

    const createFilingMutation = useMutation({
        mutationFn: (data) => smeComplianceApi.createFiling(selectedBusiness.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['sme-filings']);
            queryClient.invalidateQueries(['sme-pending-filings']);
            queryClient.invalidateQueries(['sme-compliance-score']);
            setShowModal(false);
            resetForm();
        }
    });

    const markFiledMutation = useMutation({
        mutationFn: ({ filingId, data }) => smeComplianceApi.markFiled(selectedBusiness.id, filingId, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['sme-filings', 'sme-pending-filings', 'sme-overdue-filings', 'sme-compliance-score']);
        }
    });

    const syncGstMutation = useMutation({
        mutationFn: () => smeComplianceApi.syncGstData(selectedBusiness.id),
        onSuccess: () => {
            queryClient.invalidateQueries(['sme-filings', 'sme-pending-filings', 'sme-overdue-filings', 'sme-compliance-score', 'sme-ewaybills']);
        }
    });

    const resetForm = () => {
        setFilingForm({ filingType: 'GSTR3B', filingPeriod: '', dueDate: '', taxLiability: '', inputTaxCredit: '' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilingForm(prev => ({ ...prev, [name]: value }));
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
            PENDING: { class: 'status-pending', icon: <Clock size={14} />, text: 'Pending' },
            FILED_ON_TIME: { class: 'status-filed', icon: <CheckCircle size={14} />, text: 'Compliant' },
            FILED_LATE: { class: 'status-filed-late', icon: <CheckCircle size={14} />, text: 'Filed Late' },
            OVERDUE: { class: 'status-overdue', icon: <AlertTriangle size={14} />, text: 'Action Required' }
        };
        return badges[status] || { class: 'status-pending', icon: <Clock size={14} />, text: status };
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const renderCalendarView = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const monthFilings = filings.filter(f => {
            const dueDate = new Date(f.dueDate);
            return dueDate.getFullYear() === year && dueDate.getMonth() === month;
        });

        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);

        for (let day = 1; day <= daysInMonth; day++) {
            const dayFilings = monthFilings.filter(f => new Date(f.dueDate).getDate() === day);
            const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

            days.push(
                <motion.div
                    key={day}
                    whileHover={{ scale: 1.05, zIndex: 10 }}
                    className={`calendar-day ${isToday ? 'today' : ''} ${dayFilings.length > 0 ? 'has-filings' : ''}`}
                >
                    <span className="day-number">{day}</span>
                    <div className="day-filings">
                        {dayFilings.map((f, i) => (
                            <div key={i} className={`filing-badge ${f.filingStatus?.toLowerCase().replace('_', '-')}`} title={f.filingType}>
                                {f.filingType?.replace('GSTR', '')}
                            </div>
                        ))}
                    </div>
                </motion.div>
            );
        }

        return (
            <motion.div variants={itemVariants} className="calendar-container">
                <div className="calendar-header">
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="nav-btn">
                        <ChevronLeft size={24} />
                    </button>
                    <motion.h3 key={month}>{MONTHS[month]} <span className="text-slate-400 font-extrabold">{year}</span></motion.h3>
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="nav-btn">
                        <ChevronRight size={24} />
                    </button>
                </div>
                <div className="calendar-weekdays grid grid-cols-7 gap-4 mb-4">
                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                        <div key={day} className="text-center font-black text-[10px] text-slate-400 tracking-widest">{day}</div>
                    ))}
                </div>
                <div className="calendar-grid">
                    {days}
                </div>
            </motion.div>
        );
    };

    const renderListView = () => (
        <div className="filings-list">
            <AnimatePresence>
                {filings.map((filing, idx) => (
                    <motion.div
                        layout
                        key={filing.id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        className={`filing-card ${filing.filingStatus?.toLowerCase()}`}
                    >
                        <div className="filing-type">
                            <FileText size={40} />
                            <div>
                                <span className="type-name">{filing.filingType}</span>
                                <span className="period">Period: {filing.filingPeriod}</span>
                            </div>
                        </div>
                        <div className="filing-details">
                            <div className="detail">
                                <span className="label">DEADLINE</span>
                                <span className="value">{new Date(filing.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                            </div>
                            <div className="detail">
                                <span className="label">EST. LIABILITY</span>
                                <span className="value">{formatCurrency(filing.taxLiability)}</span>
                            </div>
                            <div className="detail">
                                <span className="label">NET PAYABLE</span>
                                <span className="value text-rose-600">{formatCurrency(filing.netTaxPayable)}</span>
                            </div>
                        </div>
                        <div className="filing-status">
                            <div className={`status ${getStatusBadge(filing.filingStatus).class}`}>
                                {getStatusBadge(filing.filingStatus).text}
                            </div>
                            {(filing.filingStatus === 'PENDING' || filing.filingStatus === 'OVERDUE') && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    className="btn-mark-filed bg-indigo-600 text-white font-black px-4 py-2 rounded-xl"
                                    onClick={() => {
                                        const arn = prompt('Enter ARN Reference Number:');
                                        if (arn) markFiledMutation.mutate({
                                            filingId: filing.id,
                                            data: { arnNumber: arn, filedDate: new Date().toISOString().split('T')[0], taxPaid: filing.netTaxPayable }
                                        });
                                    }}
                                >
                                    SET FILED
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );

    return (
        <motion.div
            className="tax-compliance"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <header className="compliance-header">
                <div className="header-left">
                    <motion.h1 layoutId="tax-title">
                        <Shield className="text-emerald-500" /> GST <span className="text-emerald-500">Compliance</span>
                    </motion.h1>
                    <select
                        className="business-selector ml-6"
                        value={selectedBusiness?.id || ''}
                        onChange={(e) => setSelectedBusiness(businesses.find(b => b.id === parseInt(e.target.value)))}
                    >
                        {businesses.map(b => (
                            <option key={b.id} value={b.id}>{b.businessName}</option>
                        ))}
                    </select>
                </div>
                <div className="header-actions">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        className="btn-secondary"
                        onClick={() => syncGstMutation.mutate()}
                        disabled={syncGstMutation.isPending}
                    >
                        <RefreshCw size={18} className={syncGstMutation.isPending ? 'spin' : ''} />
                        {syncGstMutation.isPending ? 'SYNCING GSTN...' : 'SYNC WITH PORTAL'}
                    </motion.button>
                    <button className="btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> RECORD FILING
                    </button>
                </div>
            </header>

            {/* Premium Stats Grid */}
            <div className="compliance-stats">
                <motion.div variants={itemVariants} className="stat-card score">
                    <div className="score-circle">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" className="bg-circle" />
                            <motion.circle
                                cx="50" cy="50" r="45"
                                className="score-arc"
                                initial={{ strokeDasharray: "0 283" }}
                                animate={{ strokeDasharray: `${(complianceScore?.complianceScore || 0) * 2.83} 283` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                        </svg>
                        <span className="score-value">{complianceScore?.complianceScore || 0}%</span>
                    </div>
                    <div>
                        <span className="stat-value">{complianceScore?.complianceScore || 0}%</span>
                        <span className="stat-label">Regulatory Integrity</span>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="stat-card pending">
                    <Clock />
                    <div>
                        <span className="stat-value">{pendingFilings.length}</span>
                        <span className="stat-label">Upcoming Duties</span>
                    </div>
                    {pendingFilings.length > 0 && <Zap className="absolute top-2 right-2 text-amber-300 opacity-30" size={60} />}
                </motion.div>

                <motion.div variants={itemVariants} className="stat-card overdue">
                    <AlertTriangle />
                    <div>
                        <span className="stat-value font-black text-rose-600">{overdueFilings.length}</span>
                        <span className="stat-label">Immediate Attention</span>
                    </div>
                </motion.div>
            </div>

            {/* Interactive Tabs */}
            <div className="view-tabs mb-10">
                <button className={`tab ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => handleTabChange('calendar')}>
                    <Calendar size={18} /> SURVEILLANCE MAP
                </button>
                <button className={`tab ${activeTab === 'list' ? 'active' : ''}`} onClick={() => handleTabChange('list')}>
                    <FileText size={18} /> FILING REPOSITORY
                </button>
                <button className={`tab ${activeTab === 'ewaybills' ? 'active' : ''}`} onClick={() => handleTabChange('ewaybills')}>
                    <Truck size={18} /> LOGISTICS TRACKER
                </button>
            </div>

            {/* Content Swapper */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'calendar' ? renderCalendarView() :
                        activeTab === 'list' ? renderListView() :
                            <div className="filings-list">
                                {ewayBills.map((bill, idx) => (
                                    <motion.div key={bill.id} variants={itemVariants} initial="hidden" animate="visible" className="filing-card border-l-4 border-indigo-500">
                                        <div className="filing-type">
                                            <Truck size={40} className="text-indigo-500" />
                                            <div>
                                                <span className="type-name">{bill.ewayBillNumber}</span>
                                                <span className="period">Generated: {new Date(bill.generatedDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="filing-details">
                                            <div className="detail">
                                                <span className="label">GSTIN</span>
                                                <span className="value">{bill.consigneeGstin}</span>
                                            </div>
                                            <div className="detail">
                                                <span className="label">CONSIGNMENT</span>
                                                <span className="value">{formatCurrency(bill.totalValue)}</span>
                                            </div>
                                        </div>
                                        <div className={`status font-black text-xs ${bill.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                            {bill.status}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>}
                </motion.div>
            </AnimatePresence>

            {/* Premium Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="modal-overlay fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="modal bg-white shadow-3xl"
                        >
                            <div className="modal-header flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="m-0">Record <span className="text-emerald-500">Filing</span></h2>
                                    <p className="text-slate-400 font-medium">Manually log a tax return for analysis</p>
                                </div>
                                <button className="p-2 hover:bg-slate-100 rounded-full transition-colors" onClick={() => setShowModal(false)}>
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                createFilingMutation.mutate(filingForm);
                            }}>
                                <div className="space-y-6">
                                    <div className="form-group">
                                        <label>FILING CATEGORY</label>
                                        <select name="filingType" value={filingForm.filingType} onChange={handleInputChange}>
                                            {FILING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label} - {t.description}</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-group">
                                            <label>PERIOD</label>
                                            <input type="text" name="filingPeriod" placeholder="e.g. Q1 2026" onChange={handleInputChange} required />
                                        </div>
                                        <div className="form-group">
                                            <label>DUE DATE</label>
                                            <input type="date" name="dueDate" onChange={handleInputChange} required />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-group">
                                            <label>LIABILITY (₹)</label>
                                            <input type="number" name="taxLiability" onChange={handleInputChange} />
                                        </div>
                                        <div className="form-group">
                                            <label>ITC (₹)</label>
                                            <input type="number" name="inputTaxCredit" onChange={handleInputChange} />
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-actions mt-10">
                                    <button type="button" className="text-slate-400 font-bold px-6" onClick={() => setShowModal(false)}>CANCEL</button>
                                    <button type="submit" className="btn-primary" disabled={createFilingMutation.isPending}>
                                        {createFilingMutation.isPending ? 'PROCESSING...' : 'RECORD RETURN'}
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

export default TaxCompliance;
