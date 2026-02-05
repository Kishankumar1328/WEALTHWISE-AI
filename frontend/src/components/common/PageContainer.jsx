import React from 'react';
import { motion } from 'framer-motion';

const PageContainer = ({ children, className = '' }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`min-h-screen bg-slate-50/50 pb-20 pt-8 px-4 lg:px-8 max-w-[1920px] mx-auto ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default PageContainer;
