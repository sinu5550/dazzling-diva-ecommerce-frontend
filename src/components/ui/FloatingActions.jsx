'use client';

import { useState, useEffect } from 'react';
import { FaWhatsapp, FaFacebookF, FaFacebookMessenger } from 'react-icons/fa';
import { TbArrowBadgeUpFilled } from "react-icons/tb";
import { apiClient } from "@/lib/apiClient";

export default function FloatingActions() {
    const [isVisible, setIsVisible] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [contactData, setContactData] = useState(null);

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
        <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-center gap-3.5 font-outfit">
            
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
    );
}
