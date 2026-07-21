// app/cart/page.jsx - UPDATED HANDLERS
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Container from '@/components/Container/Container';
import { useCartManager } from '@/hooks/useCartManager';
import { useCheckoutSession } from '@/hooks/useCheckoutSession';
import { FaShoppingBag, FaArrowRight, FaMinus, FaPlus } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { IoIosArrowForward } from "react-icons/io";
import { Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import Image from "next/image";


const CartPage = () => {

    const router = useRouter();
    const { createCartCheckoutSession } = useCheckoutSession();

    const {
        getAllCartItems,
        getCombinedTotal,
        removeItem,
        clearAllCarts,
        updateItemQuantity,
        cartType,
        loading,
        getCartItem // Get this for variant handling
    } = useCartManager();

    const [clearing, setClearing] = useState(false);
    const [updatingItems, setUpdatingItems] = useState(new Set());

    const cartItems = getAllCartItems();
    const total = getCombinedTotal();

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    // FIXED: Handle quantity change for variant products
    const handleQuantityChange = async (itemId, currentQuantity, change, variantId = null) => {
        const newQuantity = currentQuantity + change;

        if (newQuantity < 1) {
            // If quantity becomes 0, remove the item
            handleRemoveItem(itemId, 'regular', variantId);
            return;
        }

        // Add to updating set - use unique ID for variants
        const updatingId = variantId ? `${itemId}-${variantId}` : itemId;
        setUpdatingItems(prev => new Set(prev).add(updatingId));

        try {
            const success = await updateItemQuantity(itemId, newQuantity, variantId);

            if (!success) {
                toast.error('Failed to update quantity');
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            toast.error('Failed to update quantity');
        } finally {
            // Remove from updating set
            setUpdatingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(updatingId);
                return newSet;
            });
        }
    };

    // FIXED: Handle remove item for variant products
    const handleRemoveItem = async (itemId, itemType, variantId = null) => {
        try {
            await removeItem(itemId, itemType, variantId);
        } catch (error) {
            toast.error('Failed to remove item');
        }
    };

    const handleClearCart = async () => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This will remove all items from your cart!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, clear it!",
            cancelButtonText: "Keep items"
        });

        if (!result.isConfirmed) return;

        try {
            setClearing(true);
            await clearAllCarts();

            await Swal.fire({
                title: "Success!",
                text: "Your cart has been clearose.",
                icon: "success"
            });
        } catch (error) {
            console.error('Error clearing cart:', error);

            Swal.fire({
                title: "Oops!",
                text: "Something went wrong. Please try again.",
                icon: "error"
            });

        } finally {
            setClearing(false);
        }
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            toast.error('Your cart is empty');
            return;
        }
        // Create cart checkout session
        createCartCheckoutSession(cartItems);

        // Small delay to ensure session is saved
        setTimeout(() => {
            router.push('/checkout');
        }, 100);
    };

    if (loading) {
        return (
            <Container className="py-10">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A0C3D]"></div>
                </div>
            </Container>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div>
                <Container>
                    <div className="flex items-center gap-2 text-gray-700 mt-10 text-sm md:text-base">
                        <Link
                            href="/"
                            className="hover:underline hover:text-secound  flex items-center gap-1 transition"
                        >
                            Home <IoIosArrowForward />
                        </Link>
                        <p className="font-semibold text-gray-900">Cart</p>
                    </div>
                    <div className="text-center min-h-[70vh] items-center justify-center flex flex-col">

                        <div className="mb-6">
                            <FaShoppingBag className="text-7xl text-gray-300 mx-auto" />
                        </div>
                        <h2 className="text-xl md:text-3xl font-bold text-gray-800 mb-3 font-philosopher">Your cart is empty</h2>
                        <p className="text-gray-600 mb-8 text-lg">Add some amazing products to get started!</p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-secound hover:bg-secound-hover  text-white rounded font-bold hover:secound-hover transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
                        >
                            <FaShoppingBag />
                            Start Shopping
                        </Link>
                    </div>
                </Container>
            </div>

        );
    }

    return (
        <Container className="py-5 sm:py-8 md:py-10 font-outfit">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-gray-600 text-xs md:text-sm mb-4">
                <Link href="/" className="hover:underline hover:text-[#5A0C3D] flex items-center gap-1 transition">
                    Home <IoIosArrowForward size={12} />
                </Link>
                <p className="font-semibold text-gray-900">Cart</p>
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1">Shopping Cart</h1>
                    <p className="text-xs sm:text-sm text-gray-500 font-light">
                        {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                    </p>
                </div>

                {/* Cart Type Indicator */}
                {cartType === 'mixed' && (
                    <div className="mb-4 p-3 sm:p-4 bg-[#5A0C3D]/5 border-l-4 border-[#5A0C3D] rounded-r-xl">
                        <p className="text-xs sm:text-sm text-[#5A0C3D] font-medium">
                            🧺 <strong>Mixed Cart:</strong> Your cart contains both regular products and bundles.
                        </p>
                    </div>
                )}

                {cartType === 'bundle' && (
                    <div className="mb-4 p-3 sm:p-4 bg-teal-50 border-l-4 border-teal-500 rounded-r-xl">
                        <p className="text-xs sm:text-sm text-teal-800 font-medium">
                            📦 <strong>Bundle Cart:</strong> Your cart contains bundle products only.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
                    {/* Cart Items List */}
                    <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                        {cartItems?.map((item) => {
                            const updatingId = item.variantId ? `${item.id}-${item.variantId}` : item.id;
                            const isUpdating = updatingItems.has(updatingId);
                            const itemTotal = item.price * (item.quantity || 1);

                            return (
                                <div
                                    key={item.uniqueId || `${item.type}-${item.id}`}
                                    className="bg-white rounded-2xl border border-gray-200 p-3.5 sm:p-4 hover:shadow-md transition-shadow duration-300"
                                >
                                    <div className="flex gap-3 sm:gap-4">
                                        {/* Product Image */}
                                        <div className="relative flex-shrink-0 w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                                            <Image
                                                src={item.images?.[0] || item.image}
                                                alt={item.productName || item.name}
                                                fill
                                                sizes="(max-width: 640px) 80px, 112px"
                                                className="object-cover"
                                            />
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                            {/* Header Row: Title & Delete */}
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <Link
                                                        href={`/product/${item.slug || item.productId}`}
                                                        className="font-semibold text-gray-800 hover:text-[#5A0C3D] text-xs sm:text-base line-clamp-2 leading-snug"
                                                    >
                                                        {item.productName || item.name}
                                                    </Link>

                                                    {/* Variant Attributes */}
                                                    {item.variantAttributes && (
                                                        <div className="mt-1 flex flex-wrap gap-1">
                                                            {Object.entries(item.variantAttributes).map(([key, value]) => (
                                                                <span
                                                                    key={key}
                                                                    className="inline-block text-[10px] sm:text-xs bg-[#5A0C3D]/10 text-[#5A0C3D] px-2 py-0.5 rounded-md font-medium"
                                                                >
                                                                    {key}: {value}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Badges */}
                                                    {item.isBundle && (
                                                        <span className="inline-block text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-semibold mt-1">
                                                            🎁 Bundle
                                                        </span>
                                                    )}

                                                    {item.sku && (
                                                        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
                                                            SKU: <span className="font-mono">{item.sku}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Remove Button */}
                                                <button
                                                    onClick={() => handleRemoveItem(item.id, item.type, item.variantId)}
                                                    className="flex-shrink-0 p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                    disabled={loading}
                                                    title="Remove item"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>

                                            {/* Controls & Price Row */}
                                            <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-gray-100">
                                                {/* Quantity Controls */}
                                                {!item.isBundle ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[11px] sm:text-xs text-gray-500 font-medium hidden sm:inline">Qty:</span>
                                                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                                            <button
                                                                onClick={() => handleQuantityChange(item.id, item.quantity, -1, item.variantId)}
                                                                disabled={isUpdating || item.quantity <= 1}
                                                                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-gray-200 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                <FaMinus className="text-[9px] sm:text-[10px]" />
                                                            </button>

                                                            <span className="w-7 sm:w-9 text-center font-bold text-xs sm:text-sm text-gray-800">
                                                                {isUpdating ? (
                                                                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-[#5A0C3D] mx-auto"></div>
                                                                ) : (
                                                                    item.quantity || 1
                                                                )}
                                                            </span>

                                                            <button
                                                                onClick={() => handleQuantityChange(item.id, item.quantity, 1, item.variantId)}
                                                                disabled={isUpdating}
                                                                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-gray-200 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                            >
                                                                <FaPlus className="text-[9px] sm:text-[10px]" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-500 font-medium">Qty: 1</span>
                                                )}

                                                {/* Price */}
                                                <div className="text-right">
                                                    <span className="text-[10px] sm:text-xs text-gray-400 block font-light">
                                                        {formatPrice(item.price)} × {item.quantity || 1}
                                                    </span>
                                                    <span className="text-sm sm:text-base md:text-lg font-bold text-[#5A0C3D]">
                                                        {formatPrice(itemTotal)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Clear Cart Button */}
                        {cartItems.length > 0 && (
                            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 bg-rose-50 rounded-2xl border border-rose-100">
                                <p className="text-xs sm:text-sm text-rose-700 font-medium">
                                    Remove all items from your cart
                                </p>
                                <button
                                    onClick={handleClearCart}
                                    disabled={clearing}
                                    className="w-full sm:w-auto px-4 py-2 bg-rose-600 text-white text-xs sm:text-sm rounded-xl hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold cursor-pointer"
                                >
                                    {clearing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                                            Clearing...
                                        </span>
                                    ) : (
                                        'Clear Cart'
                                    )}
                                </button>
                            </div>
                        )}

                        <div className="mt-4">
                            <Link
                                href="/"
                                className="inline-flex items-center text-xs sm:text-sm text-[#5A0C3D] hover:text-[#450322] font-semibold hover:underline transition-colors"
                            >
                                ← Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 sticky top-24 shadow-xs">
                            <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900 border-b border-gray-100 pb-3">Order Summary</h2>

                            {/* Summary Details */}
                            <div className="space-y-3 mb-5 text-xs sm:text-sm">
                                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                                    <span className="text-gray-500 font-light">Subtotal</span>
                                    <span className="font-semibold text-gray-900">{formatPrice(total)}</span>
                                </div>
                                <div className="flex justify-between items-center py-1.5">
                                    <span className="text-gray-500 font-light">Shipping</span>
                                    <span className="text-gray-400 font-light">Calculated at checkout</span>
                                </div>

                                {/* Total */}
                                <div className="pt-3 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm sm:text-base font-bold text-gray-900">Grand Total</span>
                                        <span className="text-xl sm:text-2xl font-bold text-[#5A0C3D]">{formatPrice(total)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <button
                                onClick={handleCheckout}
                                disabled={loading || cartItems.length === 0}
                                className="w-full py-3 px-4 font-bold text-xs sm:text-sm text-white bg-[#5A0C3D] hover:bg-[#450322] rounded-xl transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider"
                            >
                                Proceed to Checkout
                                <FaArrowRight size={12} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default CartPage;
