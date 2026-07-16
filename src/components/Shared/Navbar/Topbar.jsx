'use client';

import Link from "next/link";
import { Heart, X } from 'lucide-react';
import { Logo, MenuIcon, StoreIcon, TrackIcon, CartIcon, ProfileIcon } from "@/components/svg";
import { useHeaderCounts } from "@/hooks/useHeaderCounts";

const Topbar = ({
    contactData,
    onMobileMenuToggle,
    isMobileMenuOpen,
    user = null,
    onMobileSearchToggle,
    mobileSearchOpen,
    scrolled = false
}) => {
    const { wishlistCount, cartCount } = useHeaderCounts(user);

    return (
        <div
            className="bg-[#F8F8F8] text-gray-800 h-[88px] flex items-center border-b border-gray-200/40 w-full"
            style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)' }}
        >
            {/* 3-column CSS grid fills 100% width — guarantees logo is always centered */}
            <div className="w-full px-[3%] grid grid-cols-3 items-center">

                {/* COL 1 — LEFT: Hamburger */}
                <div className="flex items-center justify-start">
                    <button
                        className="w-10 h-10 flex items-center justify-center  !bg-transparent hover:bg-gray-200/50 active:scale-95 transition-all duration-200 cursor-pointer"
                        onClick={onMobileMenuToggle}
                        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                    >
                        {isMobileMenuOpen
                            ? <X size={20} className="text-black" />
                            : <MenuIcon className="w-8 h-4 text-black" />
                        }
                    </button>
                </div>

                {/* COL 2 — CENTER: Logo */}
                <div className="flex items-center justify-center">
                    <Link href="/" aria-label="Home" className="block hover:opacity-90 transition-opacity">
                        <Logo className="h-8 w-auto" />
                    </Link>
                </div>

                {/* COL 3 — RIGHT: Store, Track Order, Icon Buttons */}
                <div className="flex items-center justify-end gap-3">

                    {/* Store — desktop only */}
                    <Link
                        href="/find-store"
                        className="hidden lg:flex items-center gap-1.5 text-[16px] font-medium text-black hover:text-[#5A0C3D] transition-colors duration-200 whitespace-nowrap"
                        aria-label="Store"
                    >
                        <StoreIcon className="w-[18px] h-[18px]" />
                        <span>Store</span>
                    </Link>

                    {/* Track Order — desktop only */}
                    <Link
                        href="/track-order"
                        className="hidden lg:flex items-center gap-1.5 text-[16px] font-medium text-black hover:text-[#5A0C3D] transition-colors duration-200 whitespace-nowrap"
                        aria-label="Track Order"
                    >
                        <TrackIcon className="w-[18px] h-[18px]" />
                        <span>Track Order</span>
                    </Link>

                    {/* Wishlist — desktop only */}
                    <Link
                        href="/wishlist"
                        className="hidden lg:flex items-center justify-center relative w-10 h-10 rounded-full border border-[#44444433] bg-white hover:bg-[#5A0C3D] group/wishlist  active:scale-95 transition-all duration-200"
                        aria-label="Wishlist"
                    >
                        <Heart className="w-[18px] h-[18px] text-black group-hover/wishlist:text-white" />
                        {wishlistCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-[#5A0C3D] text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center leading-none">
                                {wishlistCount > 99 ? '99+' : wishlistCount}
                            </span>
                        )}
                    </Link>

                    {/* Cart */}
                    <Link
                        href="/cart"
                        className="relative w-10 h-10 flex items-center justify-center rounded-full border border-[#44444433] bg-white hover:bg-[#5A0C3D] group/cart active:scale-95 transition-all duration-200"
                        aria-label="Cart"
                    >
                        <CartIcon className="w-[18px] h-[18px] text-black group-hover/cart:text-white" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-[#5A0C3D] text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center leading-none">
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                    </Link>

                    {/* Profile */}
                    <Link
                        href="/my-account"
                        className="w-10 h-10 flex items-center justify-center rounded-full border border-[#44444433] bg-white hover:bg-[#5A0C3D] group/profile active:scale-95 transition-all duration-200"
                        aria-label="Account"
                    >
                        <ProfileIcon className="w-[18px] h-[18px] text-black group-hover/profile:text-white" />
                    </Link>

                </div>
            </div>
        </div>
    );
};

export default Topbar;