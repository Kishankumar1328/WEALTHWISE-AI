import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Building2, MapPin, Phone, Mail, Calendar, IndianRupee,
    ArrowLeft, ArrowRight, Check, AlertCircle
} from 'lucide-react';
import { smeBusinessApi } from '../../api/api';
import './BusinessRegistration.css';

const INDUSTRY_TYPES = [
    { value: 'MANUFACTURING', label: 'Manufacturing' },
    { value: 'RETAIL', label: 'Retail Trade' },
    { value: 'AGRICULTURE', label: 'Agriculture' },
    { value: 'SERVICES', label: 'Professional Services' },
    { value: 'LOGISTICS', label: 'Logistics & Transport' },
    { value: 'ECOMMERCE', label: 'E-Commerce' },
    { value: 'HEALTHCARE', label: 'Healthcare' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'CONSTRUCTION', label: 'Construction' },
    { value: 'IT_TECHNOLOGY', label: 'IT & Technology' },
    { value: 'HOSPITALITY', label: 'Hospitality' },
    { value: 'OTHER', label: 'Other' }
];

const BUSINESS_SIZES = [
    { value: 'MICRO', label: 'Micro Enterprise', description: 'Turnover up to ₹5 Cr' },
    { value: 'SMALL', label: 'Small Enterprise', description: 'Turnover ₹5 Cr - ₹75 Cr' },
    { value: 'MEDIUM', label: 'Medium Enterprise', description: 'Turnover ₹75 Cr - ₹250 Cr' }
];

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh'
];

const BusinessRegistration = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [currentStep, setCurrentStep] = useState(1);
    const [formError, setFormError] = useState(null);

    const [formData, setFormData] = useState({
        // Step 1: Basic Info
        businessName: '',
        gstin: '',
        pan: '',
        industryType: '',
        businessSize: '',

        // Step 2: Financial Info
        annualTurnover: '',
        registrationDate: '',

        // Step 3: Contact Info
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        contactEmail: '',
        contactPhone: ''
    });

    const createBusinessMutation = useMutation({
        mutationFn: (data) => smeBusinessApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['sme-businesses']);
            navigate('/sme/dashboard');
        },
        onError: (error) => {
            setFormError(error.response?.data?.message || 'Failed to register business');
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormError(null);
    };

    const validateStep = () => {
        setFormError(null);

        if (currentStep === 1) {
            if (!formData.businessName.trim()) {
                setFormError('Business name is required');
                return false;
            }
            if (!formData.industryType) {
                setFormError('Please select an industry type');
                return false;
            }
            if (!formData.businessSize) {
                setFormError('Please select your business size');
                return false;
            }
            // Validate GSTIN format if provided
            if (formData.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin)) {
                setFormError('Invalid GSTIN format');
                return false;
            }
            // Validate PAN format if provided
            if (formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan.toUpperCase())) {
                setFormError('Invalid PAN format');
                return false;
            }
        }

        if (currentStep === 2) {
            if (formData.annualTurnover && isNaN(parseFloat(formData.annualTurnover))) {
                setFormError('Please enter a valid turnover amount');
                return false;
            }
        }

        if (currentStep === 3) {
            if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
                setFormError('Please enter a valid email address');
                return false;
            }
            if (formData.contactPhone && !/^[0-9]{10}$/.test(formData.contactPhone)) {
                setFormError('Phone number must be 10 digits');
                return false;
            }
            if (formData.pincode && !/^[0-9]{6}$/.test(formData.pincode)) {
                setFormError('Pincode must be 6 digits');
                return false;
            }
        }

        return true;
    };

    const handleNext = () => {
        if (validateStep()) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateStep()) return;

        const payload = {
            ...formData,
            pan: formData.pan?.toUpperCase() || null,
            gstin: formData.gstin?.toUpperCase() || null,
            annualTurnover: formData.annualTurnover ? parseFloat(formData.annualTurnover) : null,
            registrationDate: formData.registrationDate || null
        };

        // Remove empty strings
        Object.keys(payload).forEach(key => {
            if (payload[key] === '') payload[key] = null;
        });

        createBusinessMutation.mutate(payload);
    };

    const renderStepIndicator = () => (
        <div className="step-indicator">
            {[1, 2, 3].map(step => (
                <div key={step} className={`step ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
                    <div className="step-circle">
                        {currentStep > step ? <Check size={16} /> : step}
                    </div>
                    <span className="step-label">
                        {step === 1 ? 'Business Info' : step === 2 ? 'Financial Details' : 'Contact Info'}
                    </span>
                </div>
            ))}
        </div>
    );

    const renderStep1 = () => (
        <motion.div
            className="form-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
        >
            <h2><Building2 size={24} /> Business Information</h2>

            <div className="form-group">
                <label htmlFor="businessName">Business Name *</label>
                <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="Enter your business name"
                    required
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="gstin">GSTIN (Optional)</label>
                    <input
                        type="text"
                        id="gstin"
                        name="gstin"
                        value={formData.gstin}
                        onChange={handleChange}
                        placeholder="e.g., 22AAAAA0000A1Z5"
                        maxLength={15}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="pan">PAN (Optional)</label>
                    <input
                        type="text"
                        id="pan"
                        name="pan"
                        value={formData.pan}
                        onChange={handleChange}
                        placeholder="e.g., ABCDE1234F"
                        maxLength={10}
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Industry Type *</label>
                <div className="radio-grid">
                    {INDUSTRY_TYPES.map(industry => (
                        <label
                            key={industry.value}
                            className={`radio-card ${formData.industryType === industry.value ? 'selected' : ''}`}
                        >
                            <input
                                type="radio"
                                name="industryType"
                                value={industry.value}
                                checked={formData.industryType === industry.value}
                                onChange={handleChange}
                            />
                            <span>{industry.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label>Business Size *</label>
                <div className="size-cards">
                    {BUSINESS_SIZES.map(size => (
                        <label
                            key={size.value}
                            className={`size-card ${formData.businessSize === size.value ? 'selected' : ''}`}
                        >
                            <input
                                type="radio"
                                name="businessSize"
                                value={size.value}
                                checked={formData.businessSize === size.value}
                                onChange={handleChange}
                            />
                            <strong>{size.label}</strong>
                            <span>{size.description}</span>
                        </label>
                    ))}
                </div>
            </div>
        </motion.div>
    );

    const renderStep2 = () => (
        <motion.div
            className="form-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
        >
            <h2><IndianRupee size={24} /> Financial Details</h2>

            <div className="form-group">
                <label htmlFor="annualTurnover">Annual Turnover (₹)</label>
                <div className="input-with-icon">
                    <IndianRupee size={20} />
                    <input
                        type="number"
                        id="annualTurnover"
                        name="annualTurnover"
                        value={formData.annualTurnover}
                        onChange={handleChange}
                        placeholder="e.g., 10000000"
                        min="0"
                    />
                </div>
                <span className="helper-text">Enter your previous financial year's turnover</span>
            </div>

            <div className="form-group">
                <label htmlFor="registrationDate">
                    <Calendar size={18} /> Date of Incorporation
                </label>
                <input
                    type="date"
                    id="registrationDate"
                    name="registrationDate"
                    value={formData.registrationDate}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                />
                <span className="helper-text">When was your business registered?</span>
            </div>
        </motion.div>
    );

    const renderStep3 = () => (
        <motion.div
            className="form-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
        >
            <h2><MapPin size={24} /> Contact Information</h2>

            <div className="form-group">
                <label htmlFor="addressLine1">Address Line 1</label>
                <input
                    type="text"
                    id="addressLine1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    placeholder="Building, Street name"
                />
            </div>

            <div className="form-group">
                <label htmlFor="addressLine2">Address Line 2</label>
                <input
                    type="text"
                    id="addressLine2"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    placeholder="Landmark, Area"
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="City"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="state">State</label>
                    <select
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                    >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map(state => (
                            <option key={state} value={state}>{state}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="pincode">Pincode</label>
                    <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="6-digit pincode"
                        maxLength={6}
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="contactEmail"><Mail size={18} /> Email</label>
                    <input
                        type="email"
                        id="contactEmail"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleChange}
                        placeholder="business@example.com"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="contactPhone"><Phone size={18} /> Phone</label>
                    <input
                        type="tel"
                        id="contactPhone"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleChange}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                    />
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="business-registration">
            <div className="registration-container">
                <header className="registration-header">
                    <button className="btn-back" onClick={() => navigate('/sme/dashboard')}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1>Register Your Business</h1>
                </header>

                {renderStepIndicator()}

                {formError && (
                    <div className="form-error">
                        <AlertCircle size={20} />
                        {formError}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}

                    <div className="form-actions">
                        {currentStep > 1 && (
                            <button type="button" className="btn-secondary" onClick={handleBack}>
                                <ArrowLeft size={18} /> Back
                            </button>
                        )}

                        {currentStep < 3 ? (
                            <button type="button" className="btn-primary" onClick={handleNext}>
                                Next <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={createBusinessMutation.isPending}
                            >
                                {createBusinessMutation.isPending ? 'Registering...' : 'Complete Registration'}
                                {!createBusinessMutation.isPending && <Check size={18} />}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BusinessRegistration;
