'use client';

import { useState, useEffect, useRef } from 'react';
import { FaWhatsapp, FaPhoneAlt, FaComments } from 'react-icons/fa';
import { RiMessengerFill } from "react-icons/ri";
import { TbArrowBadgeUpFilled } from "react-icons/tb";
import { apiClient } from "@/lib/apiClient";
import { useCart } from '@/hooks/useCart';
import { useUser } from '@/hooks/useUser';
import { CartIcon } from '@/components/svg';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartDrawer } from '@/context/CartDrawerContext';

export default function FloatingActions() {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [contactData, setContactData] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const speedDialRef = useRef(null);

    const { user } = useUser();
    const { getCartCount, getCartTotal } = useCart(user);
    
    const cartCount = getCartCount();
    const cartTotal = getCartTotal();
    const { openCartDrawer } = useCartDrawer();

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
            .catch(err => console.warn("[FloatingActions] Error fetching contact details:", err?.message || err));

        // Click outside listener to close speed dial
        const handleClickOutside = (event) => {
            if (speedDialRef.current && !speedDialRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    const isCartOrCheckout = pathname === '/cart' || pathname === '/checkout';

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
    
    // Messenger URL: derive page handle from facebook link or fallback to dazzlingdivabd
    const rawFacebook = contactData?.facebook || "https://www.facebook.com/dazzlingdivabd";
    const fbHandle = rawFacebook.replace(/^(?:https?:\/\/)?(?:www\.)?(?:facebook\.com|fb\.com)\/?/i, '').replace(/\/$/, '') || "dazzlingdivabd";
    const messengerUrl = `https://m.me/${fbHandle}`;

    return (
        <>
            {/* Sticky Cart Widget (Right Center - Responsive) - Hidden on Cart & Checkout */}
            {!isCartOrCheckout && (
                <>
                    {/* Mobile: opens drawer */}
                    <button
                        type="button"
                        onClick={openCartDrawer}
                        className="fixed right-0 top-[45%] z-40 md:hidden flex flex-col items-center bg-[#5A0C3D] shadow-[0_4px_20px_rgba(90,12,61,0.25)] rounded-l-2xl overflow-hidden border border-[#5A0C3D]/20 border-r-0 hover:translate-x-[-2px] transition-transform duration-300 select-none group/sticky-cart cursor-pointer"
                    >
                        <div className="bg-[#5A0C3D] text-white p-2.5 flex flex-col items-center justify-center w-14 min-h-[58px] group-hover/sticky-cart:bg-[#4a0a32] transition-colors relative">
                            <CartIcon className="w-5 h-5 text-white" />
                            <span className="text-[10px] font-semibold font-outfit whitespace-nowrap mt-1">
                                {cartCount} {cartCount === 1 ? 'Item' : 'Items'}
                            </span>
                        </div>
                        <div className="flex bg-white text-gray-800 py-1.5 px-1.5 items-center justify-center w-14 border-t border-gray-150">
                            <span className="text-[11px] font-bold font-outfit text-gray-900 truncate">
                                ৳{cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </button>
                    {/* Desktop: navigates to /cart page */}
                    <Link
                        href="/cart"
                        className="fixed right-0 top-[45%] z-40 hidden md:flex flex-col items-center bg-[#5A0C3D] shadow-[0_4px_20px_rgba(90,12,61,0.25)] rounded-l-2xl overflow-hidden border border-[#5A0C3D]/20 border-r-0 hover:translate-x-[-2px] transition-transform duration-300 select-none group/sticky-cart"
                    >
                        <div className="bg-[#5A0C3D] text-white p-3 flex flex-col items-center justify-center w-20 min-h-[75px] group-hover/sticky-cart:bg-[#4a0a32] transition-colors relative">
                            <CartIcon className="w-6 h-6 text-white" />
                            <span className="text-[11px] font-semibold font-outfit whitespace-nowrap mt-1">
                                {cartCount} {cartCount === 1 ? 'Item' : 'Items'}
                            </span>
                        </div>
                        <div className="flex bg-white text-gray-800 py-2.5 px-3 items-center justify-center w-20 border-t border-gray-150">
                            <span className="text-[13px] font-bold font-outfit text-gray-900 truncate">
                                ৳{cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </Link>
                </>
            )}

            {/* Bottom-right Floating Actions Panel */}
            <div className="fixed bottom-16 md:bottom-6 right-4 md:right-6 z-40 flex flex-col items-center gap-3.5 font-outfit">
                
                {/* Social Links Speed Dial (Collapsed by default, opens on hover/click) */}
                <div ref={speedDialRef} className={`relative group/speeddial flex flex-col items-center ${isCartOrCheckout ? 'mb-2' : '-mb-1'}`}>
                    
                    {/* Collapsed menu items */}
                    <div className={`absolute bottom-full flex flex-col items-center gap-3.5 pb-3.5 transition-all duration-300 origin-bottom 
                        ${isOpen 
                            ? 'scale-100 opacity-100 translate-y-0 pointer-events-auto' 
                            : 'scale-0 opacity-0 translate-y-10 pointer-events-none'
                        } 
                        group-hover/speeddial:scale-100 group-hover/speeddial:opacity-100 group-hover/speeddial:translate-y-0 group-hover/speeddial:pointer-events-auto`}
                    >
                        
                        {/* Messenger Button (Direct Page Inbox) */}
                        <div className="group relative">
                            <a
                                href={messengerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-[#006AFF] via-[#00B2FF] to-[#00E5FF] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl cursor-pointer"
                                aria-label="Facebook Messenger"
                                onClick={() => setIsOpen(false)}
                            >
                                <RiMessengerFill size={22} />
                            </a>
                            <span className="pointer-events-none absolute right-14 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-stone-900 px-2.5 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 shadow-md">
                                Messenger Chat
                            </span>
                        </div>

                        {/* WhatsApp Button (Direct WhatsApp Chat) */}
                        <div className="group relative">
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl cursor-pointer"
                                aria-label="WhatsApp Chat"
                                onClick={() => setIsOpen(false)}
                            >
                                <FaWhatsapp size={24} />
                            </a>
                            <span className="pointer-events-none absolute right-14 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-stone-900 px-2.5 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 shadow-md">
                                WhatsApp Chat
                            </span>
                        </div>

                        {/* Direct Call Button (Mobile Only) */}
                        <div className="group relative flex md:hidden">
                            <a
                                href={`tel:${cleanPhone}`}
                                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00B050] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
                                aria-label="Call Us"
                                onClick={() => setIsOpen(false)}
                            >
                                <FaPhoneAlt size={18} />
                            </a>
                            <span className="pointer-events-none absolute right-14 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-stone-900 px-2.5 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 shadow-md">
                                Call Us
                            </span>
                        </div>

                    </div>

                    {/* Main trigger button with chat icons */}
                    <div 
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#5A0C3D] text-white shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 border border-white/10"
                    >
                        <FaComments size={20} className={`${isOpen ? 'scale-110 rotate-12' : ''} group-hover/speeddial:scale-110 transition-all duration-300`} />
                    </div>

                </div>

                {/* Back to Top Button - Hidden on Checkout & Cart */}
                {!isCartOrCheckout && (
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
                )}

            </div>
        </>
    );
}
