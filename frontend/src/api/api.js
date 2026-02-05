import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }

        // Standardize error object
        const formattedError = {
            status: error.response?.status || 500,
            message: error.response?.data?.message || error.response?.data?.error || error.message || 'An unexpected error occurred',
            originalError: error
        };

        console.error(`[API Error] ${formattedError.status}: ${formattedError.message}`);
        return Promise.reject(formattedError);
    }
);

export const authApi = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    me: () => api.get('/auth/me'),
};

export const expenseApi = {
    getAll: (params) => api.get('/expenses', { params }),
    create: (data) => api.post('/expenses', data),
    update: (id, data) => api.put(`/expenses/${id}`, data),
    delete: (id) => api.delete(`/expenses/${id}`),
};

export const budgetApi = {
    getAll: () => api.get('/budgets'),
    getByMonth: (year, month) => api.get(`/budgets/month/${year}/${month}`),
    create: (data) => api.post('/budgets', data),
    addCategory: (budgetId, data) => api.post(`/budgets/${budgetId}/categories`, data),
    update: (id, data) => api.put(`/budgets/${id}`, data),
    delete: (id) => api.delete(`/budgets/${id}`),
};

export const goalApi = {
    getAll: () => api.get('/goals'),
    create: (data) => api.post('/goals', data),
    update: (id, data) => api.put(`/goals/${id}`, data),
    delete: (id) => api.delete(`/goals/${id}`),
    addFunds: (id, amount) => api.patch(`/goals/${id}/add-funds`, { amount }),
};

export const dashboardApi = {
    getSummary: () => api.get('/dashboard/summary'),
};

export const aiApi = {
    getAdvice: (data) => api.post('/ai/advice', data),
    getCreditAnalysis: (data) => api.post('/ai/credit-analysis', data),
    getRiskAssessment: (data) => api.post('/ai/risk-assessment', data),
    getForecast: (data) => api.post('/ai/forecast', data),
};

// SME Business Management
export const smeBusinessApi = {
    getAll: () => api.get('/sme/businesses'),
    getById: (id) => api.get(`/sme/businesses/${id}`),
    create: (data) => api.post('/sme/businesses', data),
    update: (id, data) => api.put(`/sme/businesses/${id}`, data),
    delete: (id) => api.delete(`/sme/businesses/${id}`),
};

// SME Financial Analysis
export const smeAnalysisApi = {
    getHealth: (businessId) => api.get(`/sme/analysis/${businessId}/health`),
    getCreditScore: (businessId) => api.get(`/sme/analysis/${businessId}/credit-score`),
    refreshCreditScore: (businessId) => api.post(`/sme/analysis/${businessId}/credit-score/refresh`),
    getRatios: (businessId) => api.get(`/sme/analysis/${businessId}/ratios`),
};

// SME Invoices (Receivables/Payables)
export const smeInvoiceApi = {
    getAll: (businessId) => api.get(`/sme/invoices/${businessId}`),
    getReceivables: (businessId) => api.get(`/sme/invoices/${businessId}/receivables`),
    getPayables: (businessId) => api.get(`/sme/invoices/${businessId}/payables`),
    getOverdue: (businessId) => api.get(`/sme/invoices/${businessId}/overdue`),
    getSummary: (businessId) => api.get(`/sme/invoices/${businessId}/summary`),
    create: (businessId, data) => api.post(`/sme/invoices/${businessId}`, data),
    update: (businessId, invoiceId, data) => api.put(`/sme/invoices/${businessId}/${invoiceId}`, data),
    delete: (businessId, invoiceId) => api.delete(`/sme/invoices/${businessId}/${invoiceId}`),
    markAsPaid: (businessId, invoiceId, amount) =>
        api.post(`/sme/invoices/${businessId}/${invoiceId}/pay`, { amount }),
};

// SME Documents
export const smeDocumentApi = {
    getAll: (businessId) => api.get(`/sme/documents/${businessId}`),
    getByCategory: (businessId, category) =>
        api.get(`/sme/documents/${businessId}/category/${category}`),
    upload: (businessId, formData) =>
        api.post(`/sme/documents/${businessId}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    delete: (businessId, documentId) =>
        api.delete(`/sme/documents/${businessId}/${documentId}`),
    download: (businessId, documentId) =>
        api.get(`/sme/documents/${businessId}/${documentId}/download`, {
            responseType: 'blob'
        }),
    // Parsing endpoints
    parse: (documentId) => api.post(`/sme/documents/${documentId}/parse`),
    getStatus: (documentId) => api.get(`/sme/documents/${documentId}/status`),
    getTransactions: (documentId) => api.get(`/sme/documents/${documentId}/transactions`),
    getBusinessTransactions: (businessId, params) =>
        api.get(`/sme/documents/business/${businessId}/transactions`, { params }),
    getAnalytics: (businessId, params) =>
        api.get(`/sme/documents/business/${businessId}/analytics`, { params }),
};

// SME Tax Compliance
export const smeComplianceApi = {
    getAllFilings: (businessId) => api.get(`/sme/compliance/${businessId}/filings`),
    getPending: (businessId) => api.get(`/sme/compliance/${businessId}/pending`),
    getOverdue: (businessId) => api.get(`/sme/compliance/${businessId}/overdue`),
    getUpcoming: (businessId, days = 30) =>
        api.get(`/sme/compliance/${businessId}/upcoming`, { params: { days } }),
    getScore: (businessId) => api.get(`/sme/compliance/${businessId}/score`),
    createFiling: (businessId, data) => api.post(`/sme/compliance/${businessId}/filings`, data),
    markFiled: (businessId, filingId, data) =>
        api.post(`/sme/compliance/${businessId}/filings/${filingId}/mark-filed`, data),
    generateSchedule: (businessId, fiscalYear) =>
        api.post(`/sme/compliance/${businessId}/generate-schedule`, null, { params: { fiscalYear } }),

    // New GST Endpoints
    syncGstData: (businessId) => api.post(`/sme/compliance/${businessId}/sync-gst`),
    getEWayBills: (businessId) => api.get(`/sme/compliance/${businessId}/eway-bills`),
    validateReturn: (businessId, filingId) => api.get(`/sme/compliance/${businessId}/filings/${filingId}/validate`),
};

// SME Financial Forecasting
export const smeForecastingApi = {
    getForecasts: (businessId) => api.get(`/sme/forecasting/${businessId}`),
    refresh: (businessId, days = 90) =>
        api.post(`/sme/forecasting/${businessId}/refresh`, null, { params: { days } }),
    getSummary: (businessId) => api.get(`/sme/forecasting/${businessId}/summary`),
};

// SME Working Capital Optimization
export const smeWorkingCapitalApi = {
    getOptimization: (businessId) => api.get(`/sme/working-capital/${businessId}/optimization`),
};

// Module 6: Bookkeeping & Auto-Categorization
export const smeBookkeepingApi = {
    getRules: (businessId) => api.get(`/sme/bookkeeping/${businessId}/rules`),
    createRule: (businessId, data) => api.post(`/sme/bookkeeping/${businessId}/rules`, data),
    deleteRule: (businessId, ruleId) => api.delete(`/sme/bookkeeping/${businessId}/rules/${ruleId}`),
    runCategorization: (businessId) => api.post(`/sme/bookkeeping/${businessId}/run-categorization`),
    scanDuplicates: (businessId) => api.post(`/sme/bookkeeping/${businessId}/scan-duplicates`),
};

// Module 7: Cost Optimization
export const smeCostOptimizationApi = {
    getSuggestions: (businessId) => api.get(`/sme/cost-optimization/${businessId}/suggestions`),
    getSummary: (businessId) => api.get(`/sme/cost-optimization/${businessId}/summary`),
    generate: (businessId) => api.post(`/sme/cost-optimization/${businessId}/generate`),
};

// Module 8: Financial Products
export const smeFinancialProductApi = {
    getActiveProducts: () => api.get('/sme/financial-products/active'),
    getRecommendations: (businessId) => api.get(`/sme/financial-products/${businessId}/recommendations`),
    generate: (businessId) => api.post(`/sme/financial-products/${businessId}/generate`),
};

// Module 9: Reports
export const smeReportApi = {
    getAll: (businessId) => api.get(`/sme/reports/${businessId}`),
    generate: (businessId, type, title) =>
        api.post(`/sme/reports/${businessId}/generate`, null, { params: { type, title } }),
    download: (businessId, reportId) =>
        api.get(`/sme/reports/${businessId}/${reportId}/download`, { responseType: 'blob' }),
};

// Module 10: Advanced Visualization
export const smeAnalyticsApi = {
    getScenarios: (businessId) => api.get('/analytics/scenarios', { params: { businessId } }),
    createScenario: (businessId, data) => api.post('/analytics/scenarios', null, { params: { businessId, ...data } }),
    getWidgets: () => api.get('/analytics/widgets'),
    initWidgets: () => api.post('/analytics/widgets/init'),
    getOverview: (businessId, params = {}) =>
        api.get('/analytics/overview', { params: { businessId, ...params } }),
    getTrends: (businessId, params = {}) =>
        api.get('/analytics/trends', { params: { businessId, ...params } }),
    getRisks: (businessId, params = {}) =>
        api.get('/analytics/risks', { params: { businessId, ...params } }),
};

export default api;
