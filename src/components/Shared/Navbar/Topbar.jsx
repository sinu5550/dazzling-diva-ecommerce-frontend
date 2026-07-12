'use client';

import Link from "next/link";
import { User, Heart, ShoppingCart, Menu, X, Search, MapPin, Truck } from 'lucide-react';
import Container from "@/components/Container/Container";
// import logo from '../../../../public/assects/Logo.png';
// import Image from "next/image";

import { useHeaderCounts } from "@/hooks/useHeaderCounts";
import SearchComponent from "@/components/Search/SearchComponent";



const Topbar = ({
    contactData,
    onMobileMenuToggle,
    isMobileMenuOpen,
    user = null,
    onMobileSearchToggle,
    mobileSearchOpen
}) => {
    const { wishlistCount, cartCount } = useHeaderCounts(user);
    const { phone_number } = contactData?.data || {};

    const userActions = [
        { href: "/track-order", icon: Truck, label: "Track", badge: null },
        { href: "/find-store", icon: MapPin, label: "Store", badge: null },
        { href: "/my-account", icon: User, label: "Account", badge: null },
        { href: "/wishlist", icon: Heart, label: "Wishlist", badge: wishlistCount },
        { href: "/cart", icon: ShoppingCart, label: "Cart", badge: cartCount },
    ];

    const formatPhoneNumber = (phone) => phone?.replace(/\s/g, '') || '';

    return (
        <div className="bg-white text-gray-800 text-sm">
            <Container>
                {/* ─── Main Topbar Row ─── */}
                <div className="flex items-center justify-between py-2">
                    {/* Mobile: Hamburger */}
                    <button
                        className="lg:hidden w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        onClick={onMobileMenuToggle}
                        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                    >
                        {isMobileMenuOpen
                            ? <X size={19} className="text-gray-700" />
                            : <Menu size={19} className="text-gray-700" />
                        }
                    </button>

                    {/* Logo */}
                    <div className="flex-shrink-0 lg:w-[200px]">
                        <Link href="/" aria-label="Home">
                            {/* <Image
                                src={logo}
                                alt="Dazzling Diva"
                                width={140}
                                height={34}
                                priority
                                className="h-auto"
                            /> */}

                            <h2 className="text-2xl lg:text-3xl font-bold font-geist">Dazzling Diva</h2>
                        </Link>
                    </div>

                    {/* Desktop Search — centred, flex-1 */}
                    <div className="hidden lg:block flex-1 max-w-xl mx-10">
                        <SearchComponent />
                    </div>

                    {/* Desktop: User Actions */}
                    <div className="hidden lg:flex items-center gap-1 lg:w-[200px] justify-end">
                        {userActions.map((action) => (
                            <Link
                                key={action.label}
                                href={action.href}
                                className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 group"
                                aria-label={action.label}
                            >
                                <div className="relative">
                                    <action.icon
                                        size={19}
                                        className="text-gray-600 group-hover:text-primary transition-colors duration-200"
                                        strokeWidth={1.6}
                                    />
                                    {action.badge > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center leading-none">
                                            {action.badge > 99 ? '99+' : action.badge}
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs font text-gray-800 group-hover:text-primary transition-colors">
                                    {action.label}
                                </span>
                            </Link>
                        ))}
                    </div>

                    {/* Mobile: Search + Cart */}
                    <div className="lg:hidden flex items-center gap-1">
                        <button
                            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors"
                            onClick={onMobileSearchToggle}
                            aria-label="Search"
                        >
                            <Search size={19} className="text-gray-700" />
                        </button>

                        <Link
                            href="/cart"
                            className="relative w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors"
                            aria-label="Cart"
                        >
                            <ShoppingCart size={19} className="text-gray-700" strokeWidth={1.6} />
                            {cartCount > 0 && (
                                <span className="absolute top-1 right-1 bg-primary text-gray-600 text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center leading-none">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default Topbar;