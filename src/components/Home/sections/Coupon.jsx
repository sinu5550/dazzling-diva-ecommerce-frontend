'use client';

import Container from "@/components/Container/Container";
import React, { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { RiCoupon3Line } from 'react-icons/ri';
import Swal from "sweetalert2";

const Coupon = ({ couponData }) => {
    const [isCopied, setIsCopied] = useState(false);

    const copyToClipboard = (text) => {
        if (!navigator.clipboard) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                showSuccessToast();
            } catch {
                showErrorToast();
            }
            document.body.removeChild(textArea);
            return;
        }

        navigator.clipboard.writeText(text).then(() => {
            showSuccessToast();
        }).catch(() => {
            showErrorToast();
        });
    };

    const showSuccessToast = () => {
        setIsCopied(true);
        Swal.fire({
            position: 'bottom-end',
            icon: 'success',
            title: 'Promo code applied to clipboard',
            showConfirmButton: false,
            timer: 2000,
            toast: true,
            background: '#ffffff',
            color: '#0f172a',
            iconColor: '#0f172a',
            customClass: {
                popup: ' shadow-xl border border-slate-100 font-sans'
            }
        });

        setTimeout(() => setIsCopied(false), 2500);
    };

    const showErrorToast = () => {
        Swal.fire({
            position: 'top-right',
            icon: 'error',
            title: 'Failed to copy code',
            showConfirmButton: false,
            timer: 2000,
            toast: true,
            background: '#ffffff',
            color: '#ef4444',
        });
    };

    // Safely extract active coupon
    const activeCoupon = couponData?.find(coupon => coupon.active && coupon.appliesToAll);

    if (!activeCoupon) return null;

    const getDiscountText = () => {
        if (activeCoupon.discountType === 'Fixed') {
            return `৳${activeCoupon.discountValue}`;
        } else if (activeCoupon.discountType === 'Percentage') {
            return `${activeCoupon.discountValue}%`;
        }
        return 'Special';
    };

    return (
        <div className="w-full antialiased">
            <Container>
                <div className="max-w-4xl mx-auto">
                    {/* Main Voucher Card */}
                    <div className="bg-white border border-slate-200/80  shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-0.5 flex flex-col md:flex-row items-stretch overflow-hidden relative">
                        
                        {/* LEFT SECTION: Brand Value Presentation */}
                        <div className="p-6 sm:p-8 flex-1 flex flex-col sm:flex-row items-start gap-5 sm:gap-6 relative">
                            
                            {/* Visual Discount Frame */}
                            <div className="flex-shrink-0 flex sm:flex-col items-center justify-center bg-slate-50 border border-slate-100  px-4 py-3 sm:w-24 sm:h-24 text-center">
                                <span className="text-2xl sm:text-3xl font-black text-rose-500 tracking-tight">
                                    {getDiscountText()}
                                </span>
                                <span className="text-[10px] font-bold text-rose-500 tracking-widest uppercase ml-1.5 sm:ml-0 sm:mt-0.5">
                                    OFF
                                </span>
                            </div>

                            {/* Info Blocks */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="inline-flex items-center gap-1 bg-secound text-white text-[10px] font-bold px-2 py-0.5 tracking-wider uppercase">
                                        <RiCoupon3Line className="w-3 h-3" /> Offer
                                    </span>
                                    {activeCoupon.combinable && (
                                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-100">
                                            Auto-Applies
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-1 truncate">
                                    {activeCoupon.name || 'Exclusive Storewide Savings'}
                                </h3>
                                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-md">
                                    {activeCoupon.description || 'Copy this dynamic promotional code and apply it at your checkout summary sheet to save instantly.'}
                                </p>
                            </div>
                        </div>

                        {/* MIDDLE SEPARATOR: Minimalist Coupon Cutouts */}
                        <div className="hidden md:flex flex-col justify-between items-center relative w-6 bg-white z-10 select-none pointer-events-none">
                            {/* Top semicircular notch */}
                            <div className="w-6 h-3 bg-gray-50 border-b border-slate-200/80 rounded-b-full -mt-px" />
                            {/* Vertical divider ticks */}
                            <div className="h-full border-l border-dashed border-slate-200 my-2" />
                            {/* Bottom semicircular notch */}
                            <div className="w-6 h-3 bg-gray-50 border-t border-slate-200/80 rounded-t-full -mb-px" />
                        </div>

                        {/* Mobile horizontal separator fallback */}
                        <div className="block md:hidden px-6">
                            <div className="w-full border-t border-dashed border-slate-200" />
                        </div>

                        {/* RIGHT SECTION: The Copy Action Center */}
                        <div className="w-full md:w-64 bg-slate-50/50 p-6 sm:p-8 flex flex-col justify-center">
                            <div className="w-full text-center md:text-left">
                                <label className="block text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2">
                                    Click Code to Copy
                                </label>
                                
                                <button
                                    onClick={() => copyToClipboard(activeCoupon.code)}
                                    disabled={isCopied}
                                    className={`w-full group/btn relative flex items-center justify-between gap-3 border  p-3 text-sm font-mono font-bold tracking-wider transition-all duration-200 overflow-hidden cursor-pointer ${
                                        isCopied
                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                            : 'bg-white hover:bg-white border-slate-200 text-slate-800 hover:border-slate-400 hover:shadow-sm'
                                    }`}
                                >
                                    <span className="truncate pr-2">{activeCoupon.code}</span>
                                    
                                    <div className="flex-shrink-0 border-l pl-2.5 border-inherit flex items-center justify-center">
                                        {isCopied ? (
                                            <FiCheck className="w-4 h-4 text-emerald-600 animate-scaleUp" />
                                        ) : (
                                            <FiCopy className="w-4 h-4 text-slate-400 group-hover/btn:text-slate-700 transition-colors" />
                                        )}
                                    </div>
                                </button>

                                <span className="block text-[10px] text-slate-400 text-center md:text-left mt-2">
                                    Valid for global checkout lanes.
                                </span>
                            </div>
                        </div>

                    </div>

                </div>
            </Container>
        </div>
    );
};

export default Coupon;
