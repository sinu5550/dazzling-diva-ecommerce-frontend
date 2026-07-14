import Link from "next/link";
import React from 'react';
import Image from 'next/image';
import Container from "@/components/Container/Container";
import { FaFacebookF, FaInstagram } from 'react-icons/fa';
import { FaXTwitter, FaLocationArrow } from "react-icons/fa6";
import { FiMail } from 'react-icons/fi';
import { apiClient } from "@/lib/apiClient";
import ShipingProcess from "@/components/Home/sections/ShipingProcess";

const footerData = {
    navigation: {
        pages: [
            { text: "New Arrival", path: "/new-arrival" },
            { text: "Offers", path: "/discount-campaigns" },
        ],
        shopping: [
            { text: "Wishlist", path: "/wishlist" },
            { text: "Cart", path: "/cart" },
            { text: "Shop by Category", path: "/product" },
        ],
        information: [
            { text: "Track My Order", path: "/track-order" },
            { text: "Corporate Enquiries", path: "/corporate-enquiries" },
        ],
        account: [
            { text: "My Account", path: "/my-account" },
            { text: "My Orders", path: "/account/orders" },
        ],
        policies: [
            { text: "Teams & Condition", path: "/terms" },
            { text: "Privacy & Policy", path: "/privacy" },
            { text: "Refund Policy", path: "/refund" },
        ],
    }
};

const Footer = async () => {
    const contactData = await apiClient("/api/contact");
    const { navigation } = footerData;

    const {
        address, google_map, phone_number,
        primary_email, facebook, instagram, twitter,
    } = contactData?.data || {};

    // Fallbacks matching Figma exactly
    const resolvedAddress = address || "29 SE 2nd Ave, Miami Florida 33131, United States";
    const resolvedEmail = primary_email || "info@dazzling.com";
    const resolvedPhone = phone_number || "(+92) 3942 7879";

    return (
        <div className="w-full">
            <ShipingProcess />
            
            {/* Main Footer */}
            <footer className="relative bg-[#5A0C3D] text-white pt-12 pb-12 w-full font-outfit overflow-hidden">
                {/* Background Overlay */}
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none z-0" 
                    style={{ backgroundImage: "url('/assects/footer-overlay.png')" }}
                />
                
                <div className="relative z-10">
                    <Container>
                        {/* Centered Brand Section */}
                        <div className="flex flex-col items-center text-center mb-12 space-y-2">
                            <div className="relative w-[250px] h-[100px]">
                                <Image
                                    src="/assects/footer-logo.svg"
                                    alt="Dazzling Diva"
                                    fill
                                    priority
                                    className="object-contain"
                                />
                            </div>
                            <p className="text-[14px] md:text-[18px] text-white max-w-2xl leading-relaxed font-light px-4">
                                We Only Carry Designs We Believe In Ethically And Aesthetically – Original, Authentic Pieces That Are Made To Last.
                            </p>
                        </div>

                        {/* Columns Grid (Center aligned columns, left aligned text) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 pt-8 border-t border-white/10 max-w-5xl mx-auto justify-items-start lg:justify-items-center w-full">
                            
                            {/* Contact Column */}
                            <div className="w-full max-w-[240px] space-y-4 text-stone-200 text-left">
                                {/* Address */}
                                <div className="flex items-start gap-2.5">
                                    <FaLocationArrow className="w-3.5 h-3.5 text-white shrink-0 mt-1 rotate-45" />
                                    <Link
                                        href={`https://maps.google.com/?q=${encodeURIComponent(google_map || resolvedAddress)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs md:text-sm hover:text-white/80 transition-colors leading-relaxed"
                                    >
                                        {resolvedAddress}
                                    </Link>
                                </div>

                                {/* Email */}
                                <div className="flex items-center gap-2.5">
                                    <FiMail className="w-3.5 h-3.5 text-white shrink-0" />
                                    <a 
                                        href={`mailto:${resolvedEmail}`} 
                                        className="text-xs md:text-sm hover:text-white/80 transition-colors"
                                    >
                                        {resolvedEmail}
                                    </a>
                                    {/* Copy Indicator icon placeholder */}
                                    <span className="w-3.5 h-3.5 border border-white/40 rounded flex items-center justify-center text-[8px] cursor-pointer opacity-70 hover:opacity-100 shrink-0">
                                        📄
                                    </span>
                                </div>

                                {/* Phone */}
                                <div className="text-sm md:text-[16px] font-bold text-white pt-1">
                                    {resolvedPhone}
                                </div>
                            </div>

                            {/* Pages Column */}
                            <div className="w-full max-w-[150px] text-left">
                                <h4 className="text-xs md:text-sm font-bold uppercase tracking-wider text-white mb-4">
                                    Pages
                                </h4>
                                <ul className="space-y-1.5">
                                    {navigation.pages.map(({ text, path }) => (
                                        <li key={text}>
                                            <Link
                                                href={path}
                                                className="text-xs md:text-sm text-stone-300 hover:text-white transition-colors block"
                                            >
                                                {text}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Shopping Column */}
                            <div className="w-full max-w-[150px] text-left">
                                <h4 className="text-xs md:text-sm font-bold uppercase tracking-wider text-white mb-4">
                                    Shopping
                                </h4>
                                <ul className="space-y-1.5">
                                    {navigation.shopping.map(({ text, path }) => (
                                        <li key={text}>
                                            <Link
                                                href={path}
                                                className="text-xs md:text-sm text-stone-300 hover:text-white transition-colors block"
                                            >
                                                {text}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Information Column */}
                            <div className="w-full max-w-[170px] text-left">
                                <h4 className="text-xs md:text-sm font-bold uppercase tracking-wider text-white mb-4">
                                    Information
                                </h4>
                                <ul className="space-y-1.5">
                                    {navigation.information.map(({ text, path }) => (
                                        <li key={text}>
                                            <Link
                                                href={path}
                                                className="text-xs md:text-sm text-stone-300 hover:text-white transition-colors block"
                                            >
                                                {text}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Account Column */}
                            <div className="w-full max-w-[150px] text-left">
                                <h4 className="text-xs md:text-sm font-bold uppercase tracking-wider text-white mb-4">
                                    Account
                                </h4>
                                <ul className="space-y-1.5">
                                    {navigation.account.map(({ text, path }) => (
                                        <li key={text}>
                                            <Link
                                                href={path}
                                                className="text-xs md:text-sm text-stone-300 hover:text-white transition-colors block"
                                            >
                                                {text}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                        </div>
                    </Container>
                </div>
            </footer>

            {/* Bottom Bar */}
            <div className="bg-[#4A0730] text-stone-300 py-6 font-outfit border-t border-white/5 w-full">
                <Container>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                        {/* Copyright */}
                        <div className="text-xs md:text-sm text-stone-200">
                            Copyright © <span className="text-stone-300 font-semibold">Orbixon</span> 2026. All rights reserved.
                        </div>

                        {/* Social Icons */}
                        <div className="flex items-center gap-6">
                            <a
                                href={facebook || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white transition-colors"
                                aria-label="Facebook"
                            >
                                <FaFacebookF size={16} />
                            </a>
                            <a
                                href={twitter || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white transition-colors"
                                aria-label="Twitter"
                            >
                                <FaXTwitter size={16} />
                            </a>
                            <a
                                href={instagram || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white transition-colors"
                                aria-label="Instagram"
                            >
                                <FaInstagram size={16} />
                            </a>
                        </div>

                        {/* Policies */}
                        <div className="flex items-center gap-6 text-xs md:text-sm">
                            {navigation.policies.map(({ text, path }) => (
                                <Link
                                    key={text}
                                    href={path}
                                    className="hover:text-white transition-colors"
                                >
                                    {text}
                                </Link>
                            ))}
                        </div>
                    </div>
                </Container>
            </div>
        </div>
    );
};

export default Footer;