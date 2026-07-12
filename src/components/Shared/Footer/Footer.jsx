import Link from "next/link";
import React from 'react';
import Container from "@/components/Container/Container";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaRegCopyright, FaYoutube } from 'react-icons/fa';
import { FaXTwitter, FaLocationDot } from "react-icons/fa6";
import { MdOutlineMarkEmailRead, MdPhonePaused } from 'react-icons/md';
import BackToTop from "@/components/ui/BackToTop";
import WhatsappCall from "@/components/ui/WhatsappCall";
import { apiClient } from "@/lib/apiClient";
import ShipingProcess from "@/components/Home/sections/ShipingProcess";
import PaymentLogo from "@/components/ui/PaymentLogo";

const footerData = {
    navigation: {
        explore: [
            { text: "About Us", path: "/about-us" },
            { text: "New Arrivals", path: "/new-arrival" },
            { text: "Special Price", path: "/discount-campaigns" },
            { text: "Bundle Products", path: "/bundle-products" },
            { text: "Blogs", path: "/blogs" },
            { text: "Our Stores", path: "/find-store" },
            { text: "Contact Us", path: "/corporate-enquiries" },
        ],
        shopping: [
            { text: "Wishlist", path: "/wishlist" },
            { text: "Cart", path: "/cart" },
            { text: "Checkout", path: "/checkout" },
            { text: "Shop by Category", path: "/product" },
            { text: "Track Order", path: "/track-order" },
            { text: "Shipping & Returns", path: "/shipping-returns" },
            { text: "Gift Cards", path: "/gift-cards" },
        ],
        account: [
            { text: "My Account", path: "/my-account" },
            { text: "My Orders", path: "/account/orders" },
            { text: "FAQs", path: "/faqs" },
            { text: "Size Guide", path: "/size-guide" },
        ],
        policies: [
            { text: "Terms & Conditions", path: "/terms" },
            { text: "Privacy Policy", path: "/privacy" },
            { text: "Refund Policy", path: "/refund" },
        ],
    },

    paymentMethods: [
        "VISA", "Mastercard", "bKash", "Nagad", "Rocket",
        "uPay", "Sure Cash", "DBBL", "City Bank", "BRAC Bank",
        "Islami Bank", "UCB",
    ],
};

const Footer = async () => {
    const contactData = await apiClient("/api/contact");
    const currentYear = new Date().getFullYear();
    const { navigation, paymentMethods } = footerData;

    const {
        address, google_map, phone_number,
        primary_email, facebook, linkedIn,
        youtube, instagram, twitter,
    } = contactData?.data || {};

    const socialLinks = [
        { name: "Facebook", icon: FaFacebookF, url: facebook },
        { name: "Instagram", icon: FaInstagram, url: instagram },
        { name: "Twitter / X", icon: FaXTwitter, url: twitter },
        { name: "YouTube", icon: FaYoutube, url: youtube },
        { name: "LinkedIn", icon: FaLinkedinIn, url: linkedIn },
    ].filter((s) => s.url);

    return (
        <div>
            <ShipingProcess />
            <footer className="bg-[#f1eae4] text-gray-800 pt-14 pb-5">
                <Container>
                    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-10 lg:gap-14  max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 mb-7">

                        {/* Brand Column */}
                        <div className="max-lg:col-span-3 max-md:col-span-2 max-sm:col-span-1">
                            <h2 className="text-2xl lg:text-4xl font-bold text-gray-800 font-geist tracking-tight">
                                Dazzling Diva
                            </h2>

                            <p className="text-sm text-gray-500 leading-relaxed max-w-xs mt-4 mb-6">
                                Curated fashion for the modern wardrobe. Quality pieces, fair prices, delivered to your door.
                            </p>

                            {/* Contact Info */}
                            <div className="space-y-3 mb-6">
                                {address && (
                                    <div className="flex items-start gap-3 group">
                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm group-hover:bg-gray-800 group-hover:text-white transition-all duration-300">
                                            <FaLocationDot size={13} className="text-gray-400 group-hover:text-white transition-colors duration-300" />
                                        </div>
                                        <Link
                                            href={`https://maps.google.com/?q=${encodeURIComponent(google_map || address)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-gray-500 hover:text-black transition-colors leading-relaxed pt-1"
                                        >
                                            {address}
                                        </Link>
                                    </div>
                                )}
                                {primary_email && (
                                    <div className="flex items-start gap-3 group">
                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm group-hover:bg-gray-800 transition-all duration-300">
                                            <MdOutlineMarkEmailRead size={16} className="text-gray-400 group-hover:text-white transition-colors duration-300" />
                                        </div>
                                        <a href={`mailto:${primary_email}`} className="text-sm text-gray-500 hover:text-black transition-colors pt-1">
                                            {primary_email}
                                        </a>
                                    </div>
                                )}
                                {phone_number && (
                                    <div className="flex items-start gap-3 group">
                                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm group-hover:bg-gray-800 transition-all duration-300">
                                            <MdPhonePaused size={16} className="text-gray-400 group-hover:text-white transition-colors duration-300" />
                                        </div>
                                        <a href={`tel:${phone_number.replace(/\s/g, '')}`} className="text-sm text-gray-500 hover:text-black transition-colors pt-1">
                                            {phone_number}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Explore */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-900 mb-5 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-6 after:h-[2px] after:bg-gray-800 after:rounded-full">
                                Explore
                            </h4>
                            <ul className="space-y-2.5">
                                {navigation.explore.map(({ text, path }) => (
                                    <li key={text}>
                                        <Link
                                            href={path}
                                            className="text-sm text-gray-500 hover:text-gray-900 hover:pl-1 transition-all duration-200 block"
                                        >
                                            {text}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Shopping */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-900 mb-5 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-6 after:h-[2px] after:bg-gray-800 after:rounded-full">
                                Shopping
                            </h4>
                            <ul className="space-y-2.5">
                                {navigation.shopping.map(({ text, path }) => (
                                    <li key={text}>
                                        <Link
                                            href={path}
                                            className="text-sm text-gray-500 hover:text-gray-900 hover:pl-1 transition-all duration-200 block"
                                        >
                                            {text}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Account + App */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-900 mb-5 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-6 after:h-[2px] after:bg-gray-800 after:rounded-full">
                                Account
                            </h4>
                            <ul className="space-y-2.5">
                                {navigation.account.map(({ text, path }) => (
                                    <li key={text}>
                                        <Link
                                            href={path}
                                            className="text-sm text-gray-500 hover:text-gray-900 hover:pl-1 transition-all duration-200 block"
                                        >
                                            {text}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* App Download - Compact 2-Column Grid */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-900 mb-4 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-6 after:h-[2px] after:bg-gray-800 after:rounded-full">
                                Get the App
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                <a
                                    href="#"
                                    className="flex items-center justify-center gap-1.5 px-2 py-2.5 bg-white border border-gray-200 rounded hover:border-gray-800 hover:shadow-md transition-all duration-300"
                                >
                                    <svg className="w-6 h-6 text-gray-700 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                    </svg>
                                    <span className="text-[11px] font-semibold text-gray-800">App Store</span>
                                </a>
                                <a
                                    href="#"
                                    className="flex items-center justify-center gap-1.5 px-2 py-2.5 bg-white border border-gray-200 rounded hover:border-gray-800 hover:shadow-md transition-all duration-300"
                                >
                                    <svg className="w-6 h-6 text-gray-700 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.396 13l2.302-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302L5.864 2.658z" />
                                    </svg>
                                    <span className="text-[11px] font-semibold text-gray-800">Play Store</span>
                                </a>
                            </div>
                            <div className="mt-5">
                                <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-800 mb-4">
                                    Connect us
                                </h4>
                                {/* Social Links */}
                                {socialLinks.length > 0 && (
                                    <div className="flex gap-2.5">
                                        {socialLinks.map(({ name, icon: Icon, url }) => (
                                            <a
                                                key={name}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-800 hover:text-white hover:border-gray-800 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                                                aria-label={name}
                                            >
                                                <Icon size={15} />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Payment Methods */}
                    <PaymentLogo />
                </Container>
                <BackToTop />
                <WhatsappCall />
            </footer>

            {/* Bottom Bar */}
            <div className="bg-white">
                <Container>
                    <div className="py-5">
                        {/* Copyright + Policy Links */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                                <FaRegCopyright className="text-xs" />
                                <span>{currentYear} Dazzling Diva</span>
                                <span className="mx-1.5 text-gray-300">•</span>
                                <span>All rights reserved</span>
                                <span className="mx-1.5 text-gray-300">•</span>
                                <span>Developed by</span>
                                <Link
                                    href="https://www.orbixontech.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-gray-600 hover:text-purple-600 transition-colors duration-300"
                                >
                                    Orbixon Tech
                                </Link>
                            </div>

                            <div className="flex items-center gap-5">
                                {navigation.policies.map(({ text, path }, i) => (
                                    <React.Fragment key={text}>
                                        <Link
                                            href={path}
                                            className="text-xs text-gray-400 hover:text-gray-800 transition-colors duration-200"
                                        >
                                            {text}
                                        </Link>
                                        {i < navigation.policies.length - 1 && (
                                            <span className="text-gray-200">|</span>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>
                </Container>
            </div>
        </div>
    );
};

export default Footer;