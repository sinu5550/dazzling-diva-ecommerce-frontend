'use client';

import { useState, useEffect } from 'react';
import { FaWhatsapp, FaFacebookF, FaFacebookMessenger, FaComments } from 'react-icons/fa';
import { TbArrowBadgeUpFilled } from "react-icons/tb";
import { apiClient } from "@/lib/apiClient";
import { useCart } from '@/hooks/useCart';
import { useUser } from '@/hooks/useUser';
import { CartIcon } from '@/components/svg';
import Link from 'next/link';

export default function FloatingActions() {
    const [isVisible, setIsVisible] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [contactData, setContactData] = useState(null);

    const { user } = useUser();
    const { getCartCount, getCartTotal } = useCart(user);
    
    const cartCount = getCartCount();
    const cartTotal = getCartTotal();

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            setScrollProgress(progress);
            setIsVisible(scrollTop > 400);
        };

        window.addEventListener('scroll', handleScroll);
        
        // Fetch dynamic social links
        apiClient("/api/contact")
            .then(res => {
                if (res?.data) {
                    setContactData(res.data);
                }
            })
            .catch(err => console.error("[FloatingActions] Error fetching contact details:", err));

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Fallbacks
    const rawPhone = contactData?.phone_number || "+8801324297000";
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}`;
    
    const facebookUrl = contactData?.facebook || "https://www.facebook.com/dazzlingdivabd";
    
    // Resolve messenger username from Facebook page URL
    const getMessengerUrl = (fbUrl) => {
        if (!fbUrl) return "https://m.me/dazzlingdivabd";
        try {
            const parsed = new URL(fbUrl);
            const username = parsed.pathname.split('/').filter(Boolean).pop();
            return username ? `https://m.me/${username}` : "https://m.me/dazzlingdivabd";
        } catch (e) {
            return "https://m.me/dazzlingdivabd";
        }
    };
    const messengerUrl = getMessengerUrl(facebookUrl);

    return (
        <>
            {/* Sticky Cart Widget (Right Center) */}
            <Link 
                href="/cart"
                className="fixed right-0 top-[45%] z-[998] flex flex-col items-center bg-white shadow-[0_0_20px_rgba(0,0,0,0.15)] rounded-l-xl overflow-hidden border border-gray-200 border-r-0 hover:translate-x-[-4px] transition-transform duration-300 select-none group/sticky-cart"
            >
                {/* Top Section: Brand maroon color background */}
                <div className="bg-[#5A0C3D] text-white p-3.5 flex flex-col items-center justify-center w-20 min-h-[75px] group-hover/sticky-cart:bg-[#4a0a32] transition-colors">
                    <CartIcon className="w-6 h-6 text-white mb-1" />
                    <span className="text-[11px] font-semibold font-outfit whitespace-nowrap">
                        {cartCount} {cartCount === 1 ? 'Item' : 'Items'}
                    </span>
                </div>
                {/* Bottom Section: White background with price */}
                <div className="bg-white text-gray-800 py-2.5 px-3 flex items-center justify-center w-20 border-t border-gray-150">
                    <span className="text-[13px] font-bold font-outfit text-gray-900">
                        ৳{cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </span>
                </div>
            </Link>

            {/* Bottom-right Floating Actions Panel */}
            <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-center gap-3.5 font-outfit">
                
                {/* Social Links Speed Dial (Collapsed by default, opens on hover) */}
                <div className="relative group/speeddial flex flex-col items-center">
                    
                    {/* Collapsed menu items */}
                    <div className="flex flex-col items-center gap-3.5 mb-3.5 transition-all duration-300 scale-0 opacity-0 origin-bottom translate-y-10 pointer-events-none group-hover/speeddial:scale-100 group-hover/speeddial:opacity-100 group-hover/speeddial:translate-y-0 group-hover/speeddial:pointer-events-auto">
                        
                        {/* Facebook Page Button */}
                        <div className="group relative">
                            <a
                                href={facebookUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
                                aria-label="Facebook Page"
                            >
                                <FaFacebookF size={20} />
                            </a>
                            <span className="pointer-events-none absolute right-14 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-stone-900 px-2.5 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 shadow-md">
                                Facebook Page
                            </span>
                        </div>

                        {/* Messenger Button */}
                        <div className="group relative">
                            <a
                                href={messengerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-[#006AFF] to-[#00B2FF] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
                                aria-label="Messenger Chat"
                            >
                                <FaFacebookMessenger size={20} />
                            </a>
                            <span className="pointer-events-none absolute right-14 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-stone-900 px-2.5 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 shadow-md">
                                Chat on Messenger
                            </span>
                        </div>

                        {/* WhatsApp Button */}
                        <div className="group relative">
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
                                aria-label="WhatsApp Chat"
                            >
                                <FaWhatsapp size={24} />
                            </a>
                            <span className="pointer-events-none absolute right-14 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-stone-900 px-2.5 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 shadow-md">
                                WhatsApp Chat
                            </span>
                        </div>

                    </div>

                    {/* Main trigger button with chat icons */}
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#5A0C3D] text-white shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 border border-white/10">
                        <FaComments size={20} className="group-hover/speeddial:scale-110 transition-transform duration-300" />
                    </div>

                </div>

                {/* Back to Top Button */}
                <div className={`group relative transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0 h-0 pointer-events-none'}`}>
                    <button
                        onClick={scrollToTop}
                        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-100 bg-white text-stone-800 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl overflow-hidden cursor-pointer"
                        aria-label="Back to Top"
                    >
                        {/* Scroll progress ring/fill */}
                        <div 
                            className="absolute bottom-0 left-0 right-0 bg-[#5A0C3D]/10 transition-all duration-200"
                            style={{ height: `${scrollProgress}%` }}
                        />
                        <TbArrowBadgeUpFilled size={22} className="relative z-10 text-[#5A0C3D]" />
                    </button>
                    <span className="pointer-events-none absolute right-14 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-stone-900 px-2.5 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 shadow-md">
                        Back to Top
                    </span>
                </div>

            </div>
        </>
    );
}
