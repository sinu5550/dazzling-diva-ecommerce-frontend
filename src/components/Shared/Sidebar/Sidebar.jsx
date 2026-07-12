'use client';

import { getCurrentUser, logout } from "@/lib/auth-helpers";
import {
    Loader2,
    LogOut,
    MapPin,
    MousePointerSquareDashed,
    ShoppingBag,
    User
} from 'lucide-react';
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from "react-hot-toast";
import Swal from 'sweetalert2';

const Sidebar = () => {

    const pathname = usePathname();
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {

        const fetchUser = async () => {
            try {
                const currentUser = await getCurrentUser();
                if (currentUser) {
                    setUser(currentUser);
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const menuItems = [
        { id: 'profile', label: 'My Profile', icon: User, path: "/my-account" },
        { id: 'address', label: 'Address Book', icon: MapPin, path: "/my-account/address-book" },
        { id: 'orders', label: 'My Orders', icon: ShoppingBag, path: "/my-account/orders" },
        // { id: 'loyalty', label: 'Loyalty Points', icon: MousePointerSquareDashed, path: "/my-account/loyalty-points" },
    ];

    const isActive = (path) => {
        if (path === "/my-account") {
            return pathname === path;
        }
        return pathname.startsWith(path);
    };

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Logout?',
            text: 'Are you sure you want to logout?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#14b8a6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, logout',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                setIsLoggingOut(true);
                await logout();
                toast.success('You have been successfully logged out');
                router.push('/login');
            } catch (error) {
                console.error('Logout error:', error);
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to logout. Please try again.',
                    confirmButtonColor: '#14b8a6'
                });
            } finally {
                setIsLoggingOut(false);
            }
        }
    };

    // Get user initials for avatar
    const getUserInitials = () => {
        if (!user) return '??';

        const fullName = user?.user_metadata?.full_name || user?.email || '';
        const names = fullName.trim().split(' ');

        if (names.length >= 2) {
            return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        }
        return fullName.substring(0, 2).toUpperCase();
    };

    // Get user avatar URL
    const getAvatarUrl = () => {
        return user?.user_metadata?.picture || null;
    };

    // Get display name
    const getDisplayName = () => {
        if (!user) return 'Loading...';
        return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    };

    return (
        <div className="w-full bg-white rounded-xl shadow p-4 md:p-6 h-[80vh] flex flex-col">
            {/* User Profile Section - Fixed at top */}
            <div className="flex items-center gap-3 p-4 bg-teal-50 rounded-xl mb-6 flex-shrink-0">
                {loading ? (
                    <>
                        <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Avatar - Shows picture if available, otherwise initials */}
                        {getAvatarUrl() ? (
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-teal-200">
                                <img
                                    src={getAvatarUrl()}
                                    alt={getDisplayName()}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // Fallback to initials if image fails to load
                                        e.target.style.display = 'none';
                                        e.target.nextElementSibling.style.display = 'flex';
                                    }}
                                />
                                <div
                                    className="w-12 h-12 bg-teal-100 rounded-full items-center justify-center hidden"
                                >
                                    <span className="text-teal-800 font-bold text-lg">
                                        {getUserInitials()}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                                <span className="text-teal-800 font-bold text-lg">
                                    {getUserInitials()}
                                </span>
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                                {getDisplayName()}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">
                                {user?.email || 'My Profile Information'}
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Navigation Menu - Scrollable area */}
            <nav className="space-y-3 flex-1 overflow-y-auto min-h-0 pr-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                        <Link
                            key={item.id}
                            href={item.path}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded transition-colors duration-200 ${active
                                ? 'bg-amber-50 text-amber-700 border-l-4 border-amber-500'
                                : 'bg-white shadow-xs hover:bg-amber-50 hover:text-amber-700'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${active ? 'text-amber-600' : 'text-gray-500'
                                }`} />
                            <span className={`font-medium ${active ? 'text-amber-800 font-semibold' : 'text-gray-700'
                                }`}>
                                {item.label}
                            </span>
                            {active && (
                                <span className="ml-auto w-3 h-3 animate-pulse bg-amber-500 rounded-full"></span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout Button - Fixed at bottom */}
            <div className="mt-6 pt-6 border-t border-gray-100 flex-shrink-0">
                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoggingOut ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Logging out...
                        </>
                    ) : (
                        <>
                            <LogOut className="w-5 h-5" />
                            Logout
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;