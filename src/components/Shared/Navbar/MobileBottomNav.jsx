'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Search, User, Heart } from 'lucide-react';
import { CartIcon } from '@/components/svg';
import { useHeaderCounts } from '@/hooks/useHeaderCounts';

import { useCartDrawer } from "@/context/CartDrawerContext";

export default function MobileBottomNav({ onOpenMenu, onOpenSearch }) {
    const pathname = usePathname();
    const { cartCount, wishlistCount } = useHeaderCounts();
    const { openCartDrawer } = useCartDrawer();

    if (pathname === '/checkout') return null;

    const isActive = (path) => {
        if (path === '/') return pathname === '/';
        return pathname?.startsWith(path);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#5A0C3D] text-white lg:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.15)] font-outfit">
            <div className="flex items-center justify-around h-[52px] px-1">
                {/* HOME */}
                <Link
                    href="/"
                    className={`flex flex-col items-center justify-center flex-1 h-full py-0.5 transition-colors ${
                        isActive('/') ? 'text-white font-bold' : 'text-white/90 hover:text-white'
                    }`}
                >
                    <Home size={18} strokeWidth={2.2} />
                    <span className="text-[9px] uppercase tracking-wider font-semibold mt-0.5">HOME</span>
                </Link>

                {/* MENU */}
                <button
                    type="button"
                    onClick={onOpenMenu}
                    className="flex flex-col items-center justify-center flex-1 h-full py-0.5 text-white/90 hover:text-white transition-colors cursor-pointer"
                >
                    <LayoutGrid size={18} strokeWidth={2.2} />
                    <span className="text-[9px] uppercase tracking-wider font-semibold mt-0.5">MENU</span>
                </button>

                {/* CART */}
                <button
                    type="button"
                    onClick={openCartDrawer}
                    className={`flex flex-col items-center justify-center flex-1 h-full py-0.5 relative transition-colors cursor-pointer ${
                        isActive('/cart') ? 'text-white font-bold' : 'text-white/90 hover:text-white'
                    }`}
                >
                    <div className="relative">
                        <CartIcon className="w-[18px] h-[18px] text-white" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-2 bg-slate-900 text-white text-[9px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center leading-none border border-white">
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-semibold mt-0.5">CART</span>
                </button>

                {/* SEARCH */}
                <button
                    type="button"
                    onClick={onOpenSearch}
                    className="flex flex-col items-center justify-center flex-1 h-full py-0.5 text-white/90 hover:text-white transition-colors cursor-pointer"
                >
                    <Search size={18} strokeWidth={2.2} />
                    <span className="text-[9px] uppercase tracking-wider font-semibold mt-0.5">SEARCH</span>
                </button>

                {/* ACCOUNT */}
                <Link
                    href="/my-account"
                    className={`flex flex-col items-center justify-center flex-1 h-full py-0.5 transition-colors ${
                        isActive('/my-account') ? 'text-white font-bold' : 'text-white/90 hover:text-white'
                    }`}
                >
                    <User size={18} strokeWidth={2.2} />
                    <span className="text-[9px] uppercase tracking-wider font-semibold mt-0.5">ACCOUNT</span>
                </Link>
            </div>
        </div>
    );
}
