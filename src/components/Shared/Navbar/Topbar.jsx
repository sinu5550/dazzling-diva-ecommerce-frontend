'use client';

import Link from "next/link";
import { Heart } from 'lucide-react';
import { Logo, MenuIcon, StoreIcon, TrackIcon, CartIcon, ProfileIcon, FAQIcon } from "@/components/svg";
import { useHeaderCounts } from "@/hooks/useHeaderCounts";
import { useUser } from "@/hooks/useUser";

const Topbar = ({
    contactData,
    onMobileMenuToggle,
    isMobileMenuOpen,
    user: dummyUser = null,
    onMobileSearchToggle,
    mobileSearchOpen,
    scrolled = false
}) => {
    const { wishlistCount, cartCount } = useHeaderCounts(dummyUser);
    const { user, loading, getDisplayName, getAvatarUrl } = useUser();

    return (
        <div
            className="bg-[#F8F8F8] text-gray-800 h-[72px] flex items-center border-b border-gray-200/40 w-full"
            style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)' }}
        >
            {/* 3-column CSS grid fills 100% width — guarantees logo is always centered */}
            <div className="w-full px-[3%] grid grid-cols-3 items-center">

                {/* COL 1 — LEFT: Hamburger and Links */}
                <div className="flex items-center justify-start gap-4">
                    <button
                        className="w-10 h-10 flex items-center justify-center !bg-transparent hover:bg-gray-200/50 active:scale-90 transition-all duration-200 cursor-pointer group"
                        onClick={onMobileMenuToggle}
                        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                    >
                        <div className="relative w-6 h-5 flex flex-col justify-between items-start">
                            {/* Line 1 */}
                            <span
                                className={`h-[2px] bg-black rounded-full transition-all duration-300 ease-in-out ${isMobileMenuOpen
                                    ? "w-6 rotate-45 translate-y-[9px]"
                                    : "w-6"
                                    }`}
                            />
                            {/* Line 2 */}
                            <span
                                className={`h-[2px] bg-black rounded-full transition-all duration-300 ease-in-out ${isMobileMenuOpen
                                    ? "w-0 opacity-0"
                                    : "w-[80%] group-hover:w-full"
                                    }`}
                            />
                            {/* Line 3 */}
                            <span
                                className={`h-[2px] bg-black rounded-full transition-all duration-300 ease-in-out ${isMobileMenuOpen
                                    ? "w-6 -rotate-45 -translate-y-[9px]"
                                    : "w-[60%] group-hover:w-full"
                                    }`}
                            />
                        </div>
                    </button>

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

                    {/* FAQs — desktop only */}
                    <Link
                        href="/faqs"
                        className="hidden lg:flex items-center gap-1.5 text-[16px] font-medium text-black hover:text-[#5A0C3D] transition-colors duration-200 whitespace-nowrap"
                        aria-label="FAQs"
                    >
                        <FAQIcon className="w-[18px] h-[18px]" />
                        <span>FAQs</span>
                    </Link>
                </div>

                {/* COL 2 — CENTER: Logo */}
                <div className="flex items-center justify-center">
                    <Link href="/" aria-label="Home" className="block hover:opacity-90 transition-opacity">
                        <Logo className="h-8 w-auto" />
                    </Link>
                </div>

                {/* COL 3 — RIGHT: Wishlist, Cart, Profile */}
                <div className="flex items-center justify-end gap-3">

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

                    {/* Account Section */}
                    {loading ? (
                        <div className="w-10 h-10 rounded-full border border-[#44444433] bg-white animate-pulse" />
                    ) : user ? (
                        <div className="relative group/account">
                            <Link
                                href="/my-account"
                                className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-[#44444433] bg-white hover:border-[#5A0C3D] hover:bg-gray-50 active:scale-95 transition-all duration-200"
                                aria-label="Account Menu"
                            >
                                <div className="w-8 h-8 rounded-full bg-[#5A0C3D] text-white flex items-center justify-center text-sm font-semibold overflow-hidden flex-shrink-0">
                                    {getAvatarUrl() ? (
                                        <img src={getAvatarUrl()} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{user?.user_metadata?.full_name?.substring(0, 2).toUpperCase() || 'U'}</span>
                                    )}
                                </div>
                                <div className="hidden md:flex flex-col items-start leading-tight text-left">
                                    <span className="text-[9px] text-gray-500 font-normal">Hello,</span>
                                    <span className="text-[12px] font-semibold text-black max-w-[80px] truncate">
                                        {getDisplayName()}
                                    </span>
                                </div>
                            </Link>
                            {/* Hover Dropdown Menu / Dashboard Access */}
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl py-2 opacity-0 invisible group-hover/account:opacity-100 group-hover/account:visible transition-all duration-200 z-[9999]">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <p className="text-[11px] text-gray-400">Signed in as</p>
                                    <p className="text-xs font-semibold text-gray-800 truncate">{user.email}</p>
                                </div>
                                <Link
                                    href="/my-account"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#5A0C3D] transition-colors"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/my-account/orders"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#5A0C3D] transition-colors"
                                >
                                    My Orders
                                </Link>
                                <button
                                    onClick={async () => {
                                        const { logout } = await import('@/lib/auth-helpers');
                                        await logout();
                                        window.location.reload();
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors border-t border-gray-100 mt-1 pt-2 cursor-pointer"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="flex items-center gap-2 px-3 py-2 rounded-full border border-[#44444433] bg-white hover:bg-[#5A0C3D] hover:text-white group/login active:scale-95 transition-all duration-200"
                            aria-label="Login / Sign Up"
                        >
                            <ProfileIcon className="w-[18px] h-[18px] text-black group-hover/login:text-white" />
                            <span className="hidden md:inline text-[13px] font-semibold text-black group-hover/login:text-white whitespace-nowrap">
                                Login / Sign Up
                            </span>
                        </Link>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Topbar;