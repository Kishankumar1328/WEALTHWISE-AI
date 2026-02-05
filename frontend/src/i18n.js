import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        debug: false,
        interpolation: {
            escapeValue: false,
        },
        resources: {
            en: {
                translation: {
                    common: {
                        dashboard: 'Dashboard',
                        expenses: 'Expenses',
                        budgets: 'Budgets',
                        goals: 'Goals',
                        advisor: 'AI Advisor',
                        settings: 'Settings',
                        logout: 'Logout',
                        overview: 'Overview',
                        financial_goals: 'Financial Goals',
                        health_dashboard: 'Health Dashboard',
                        invoices: 'Invoices',
                        tax_compliance: 'Tax Compliance',
                        ai_forecasting: 'AI Forecasting',
                        document_analysis: 'Document Analysis',
                        working_capital: 'Working Capital',
                        auto_bookkeeping: 'Auto Bookkeeping',
                        cost_optimization: 'Cost Optimization',
                        financial_products: 'Financial Products',
                        reports: 'Reports',
                        advanced_analytics: 'Advanced Analytics',
                        search_placeholder: 'Search Intel...',
                        sme_command: 'SME Command',
                        global_portfolio: 'Global Portfolio'
                    }
                }
            },
            hi: {
                translation: {
                    common: {
                        dashboard: 'डैशबोर्ड',
                        expenses: 'खर्च',
                        budgets: 'बजट',
                        goals: 'लक्ष्य',
                        advisor: 'एआई सलाहकार',
                        settings: 'सेटिंग्स',
                        logout: 'लॉगआउट',
                        overview: 'अवलोकन',
                        financial_goals: 'वित्तीय लक्ष्य',
                        health_dashboard: 'स्वास्थ्य डैशबोर्ड',
                        invoices: 'चालान',
                        tax_compliance: 'कर अनुपालन',
                        ai_forecasting: 'एआई पूर्वानुमान',
                        document_analysis: 'दस्तावेज़ विश्लेषण',
                        working_capital: 'कार्यशील पूंजी',
                        auto_bookkeeping: 'ऑटो बहीखाता',
                        cost_optimization: 'लागत अनुकूलन',
                        financial_products: 'वित्तीय उत्पाद',
                        reports: 'रिपोर्ट',
                        advanced_analytics: 'उन्नत विश्लेषण',
                        search_placeholder: 'खोज...',
                        sme_command: 'एसएमई कमांड',
                        global_portfolio: 'ग्लोबल पोर्टफोलियो'
                    }
                }
            },
            ta: {
                translation: {
                    common: {
                        dashboard: 'டாஷ்போர்டு',
                        expenses: 'செலவுகள்',
                        budgets: 'பட்ஜெட்டுகள்',
                        goals: 'இலக்குகள்',
                        advisor: 'AI ஆலோசகர்',
                        settings: 'அமைப்புகள்',
                        logout: 'வெளியேறு',
                        overview: 'கண்ணோட்டம்',
                        financial_goals: 'நிதி இலக்குகள்',
                        health_dashboard: 'சுகாதார குழு',
                        invoices: 'விலைப்பட்டியல்கள்',
                        tax_compliance: 'வரி இணக்கம்',
                        ai_forecasting: 'AI முன்னறிவிப்பு',
                        document_analysis: 'ஆவண பகுப்பாய்வு',
                        working_capital: 'பணி மூலதனம்',
                        auto_bookkeeping: 'தானியங்கி கணக்கு',
                        cost_optimization: 'செலவு மேம்பாடு',
                        financial_products: 'நிதி தயாரிப்புகள்',
                        reports: 'றிக்கைகள்',
                        advanced_analytics: 'மேம்பட்ட பகுப்பாய்வு',
                        search_placeholder: 'தேடு...',
                        sme_command: 'SME கட்டளை',
                        global_portfolio: 'உலகளாவிய போர்ட்ஃபோலியோ'
                    }
                }
            }
        }
    });

export default i18n;
