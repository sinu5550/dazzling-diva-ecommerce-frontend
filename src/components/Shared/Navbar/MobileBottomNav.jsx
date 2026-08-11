'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Search, User, Heart } from 'lucide-react';
import { CartIcon } from '@/components/svg';
import { useHeaderCounts } from '@/hooks/useHeaderCounts';

export default function MobileBottomNav({ onOpenMenu, onOpenSearch }) {
    const pathname = usePathname();
    const { cartCount, wishlistCount } = useHeaderCounts();

    const isActive = (path) => {
        if (path === '/') return pathname === '/';
        return pathname?.startsWith(path);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#5A0C3D] text-white lg:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.15)] font-outfit">
            <div className="flex items-center justify-around h-16 px-1">
                {/* HOME */}
                <Link
                    href="/"
                    className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
                        isActive('/') ? 'text-white font-bold' : 'text-white/90 hover:text-white'
                    }`}
                >
                    <Home size={20} strokeWidth={2.2} />
                    <span className="text-[10px] uppercase tracking-wider font-semibold mt-1">HOME</span>
                </Link>

                {/* MENU */}
                <button
                    type="button"
                    onClick={onOpenMenu}
                    className="flex flex-col items-center justify-center flex-1 h-full py-1 text-white/90 hover:text-white transition-colors cursor-pointer"
                >
                    <LayoutGrid size={20} strokeWidth={2.2} />
                    <span className="text-[10px] uppercase tracking-wider font-semibold mt-1">MENU</span>
                </button>

                {/* CART */}
                <Link
                    href="/cart"
                    className={`flex flex-col items-center justify-center flex-1 h-full py-1 relative transition-colors ${
                        isActive('/cart') ? 'text-white font-bold' : 'text-white/90 hover:text-white'
                    }`}
                >
                    <div className="relative">
                        <CartIcon className="w-5 h-5 text-white" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-2.5 bg-slate-900 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center leading-none border border-white">
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold mt-1">CART</span>
                </Link>

                {/* SEARCH */}
                <button
                    type="button"
                    onClick={onOpenSearch}
                    className="flex flex-col items-center justify-center flex-1 h-full py-1 text-white/90 hover:text-white transition-colors cursor-pointer"
                >
                    <Search size={20} strokeWidth={2.2} />
                    <span className="text-[10px] uppercase tracking-wider font-semibold mt-1">SEARCH</span>
                </button>

                {/* ACCOUNT */}
                <Link
                    href="/my-account"
                    className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
                        isActive('/my-account') ? 'text-white font-bold' : 'text-white/90 hover:text-white'
                    }`}
                >
                    <User size={20} strokeWidth={2.2} />
                    <span className="text-[10px] uppercase tracking-wider font-semibold mt-1">ACCOUNT</span>
                </Link>
            </div>
        </div>
    );
}
