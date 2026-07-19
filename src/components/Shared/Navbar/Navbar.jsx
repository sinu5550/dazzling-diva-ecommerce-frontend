import { apiClient } from "@/lib/apiClient";
import NavbarClient from "./NavbarClient";

// Constants
const STATIC_NAV_ITEMS = [
    
    { label: 'New Arrival', link: '/new-arrival' },
    { label: 'Flash Deals', link: '/discount-campaigns' },
    { label: 'Combo Products', link: '/bundle-products' },
];

const STATIC_TOPBAR_LINKS = [
    { link: "/", label: "Home" },
    { link: "/about-us", label: "About Us" },
    { link: "/find-store", label: "Find a Store" },
    { link: "/track-order", label: "Order Tracking" },
    { link: "/corporate-enquiries", label: "Corpora" },
    { link: "/blogs", label: "Blogs" },
    { link: "/faqs", label: "FAQs" },
];

const CONFIG = {
    REVALIDATE_TIME: 3600,
    MAX_CATEGORIES: 8,
    CLOSE_DELAY: 150,
    MOBILE_ANIMATION_DURATION: 300
};

async function fetchMainCategories() {
    try {
        const data = await apiClient("/api/main-categories", {
            next: { revalidate: CONFIG.REVALIDATE_TIME }
        });
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("[Navbar] Failed to fetch main categories:", error);
        return [];
    }
}

async function fetchContactData() {
    try {
        return await apiClient("/api/contact");
    } catch (error) {
        console.error("[Navbar] Failed to fetch contact data:", error);
        return { data: {} };
    }
}

export default async function Navbar() {
    const [mainCategories, contactData] = await Promise.all([
        fetchMainCategories(),
        fetchContactData()
    ]);

    const navbarData = {
        mainCategories: mainCategories.slice(0, CONFIG.MAX_CATEGORIES),
        navItems: STATIC_NAV_ITEMS,
        topbarLinks: STATIC_TOPBAR_LINKS,
    };

    return (
        <NavbarClient
            data={navbarData}
            contactData={contactData}
            config={CONFIG}
        />
    );
}
