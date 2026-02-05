import React, { memo } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const SmartStatCard = memo(({
    title,
    amount,
    change,
    isPositive,
    icon,
    hideArrow = false,
    isLoading = false
}) => {

    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-[20px] border border-slate-50 shadow-[14px_17px_40px_4px_rgba(112,144,176,0.08)] animate-pulse h-[100px]">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-100 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <div className="w-16 h-3 bg-slate-100 rounded" />
                        <div className="w-24 h-6 bg-slate-100 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-[20px] shadow-[14px_17px_40px_4px_rgba(112,144,176,0.08)] transition-all group border border-slate-50">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#F4F7FE] rounded-full flex items-center justify-center text-[#4318FF]">
                    {React.isValidElement(icon) ? React.cloneElement(icon, { size: 24 }) : icon}
                </div>
                <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{title}</p>
                    <div className="flex items-end justify-between">
                        <h4 className="text-[22px] font-black text-[#1B254B] tracking-tight leading-none">{amount}</h4>
                        {change && (
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${isPositive ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                                {change}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

SmartStatCard.propTypes = {
    title: PropTypes.string.isRequired,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    change: PropTypes.string,
    isPositive: PropTypes.bool,
    icon: PropTypes.element.isRequired,
    hideArrow: PropTypes.bool,
    isLoading: PropTypes.bool
};

SmartStatCard.displayName = 'SmartStatCard';

export default SmartStatCard;
