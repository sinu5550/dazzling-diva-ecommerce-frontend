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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
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
        <Container className="py-10">
            <div className="flex items-center gap-2 text-gray-700 text-sm md:text-base">
                <Link href="/" className="hover:underline hover:text-teal-600 flex items-center gap-1">
                    Home <IoIosArrowForward />
                </Link>
                <p className="font-semibold">Cart</p>
            </div>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="my-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2 font-philosopher">Shopping Cart</h1>
                    <p className="text-gray-600">
                        {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                    </p>
                </div>

                {/* Cart Type Indicator */}
                {cartType === 'mixed' && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 hasib-rounded">
                        <p className="text-purple-800 font-medium">
                            🧺 <strong>Mixed Cart:</strong> Your cart contains both regular products and bundles.
                        </p>
                    </div>
                )}

                {cartType === 'bundle' && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 border-l-4 border-teal-500 hasib-rounded">
                        <p className="text-teal-800 font-medium">
                            📦 <strong>Bundle Cart:</strong> Your cart contains bundle products only.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-20">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <div className="space-y-4">
                            {cartItems?.map((item) => {
                                // Create unique updating ID for variant products
                                const updatingId = item.variantId ? `${item.id}-${item.variantId}` : item.id;
                                const isUpdating = updatingItems.has(updatingId);
                                const itemTotal = item.price * (item.quantity || 1);

                                return (
                                    <div
                                        key={item.uniqueId || `${item.type}-${item.id}`}
                                        className="bg-white rounded-xl border border-gray-200 px-4 py-2 pr-5 hover:shadow-lg transition-shadow duration-300"
                                    >
                                        <div className="flex gap-5">

                                            {/* Product Image */}
                                            <div className="flex-shrink-0">
                                                <Image
                                                    src={item.images?.[0] || item.image}
                                                    alt={item.productName || item.name}
                                                    width={500}
                                                    height={500}
                                                    className="w-32 h-32 object-cover hasib-rounded border border-gray-100"
                                                />
                                            </div>

                                            {/* Product Details */}
                                            <div className="flex-1 min-w-0">
                                                {/* Product Name & Badge */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1 pr-4">
                                                        <div>
                                                            <Link
                                                                href={`/product/${item.slug || item.productId}`}
                                                                className="font-medium text-gray-800 hover:text-teal-600 font-xl lg:text-xl"
                                                            >
                                                                {item.productName || item.name}
                                                            </Link>
                                                        </div>

                                                        {/* Variant attributes */}
                                                        {item.variantAttributes && (
                                                            <div className="mt-1">
                                                                {Object.entries(item.variantAttributes).map(([key, value]) => (
                                                                    <span
                                                                        key={key}
                                                                        className="inline-block text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded mr-2 mb-1"
                                                                    >
                                                                        {key}: {value}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Badges */}
                                                        <div className="flex flex-wrap gap-2">
                                                            {item.isBundle && (
                                                                <span className="inline-block text-xs bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-3 py-1 rounded-full font-semibold">
                                                                    🎁 Bundle
                                                                </span>
                                                            )}
                                                        </div>

                                                        {item.sku && (
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                SKU: <span className="font-mono">{item.sku}</span>
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Remove Button */}
                                                    <button
                                                        onClick={() => handleRemoveItem(item.id, item.type, item.variantId)}
                                                        className="flex-shrink-0 p-2 text-gray-400 hover:text-rose-700 hover:bg-rose-50 hasib-rounded cursor-pointer transition-colors"
                                                        disabled={loading}
                                                        title="Remove item"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>

                                                {/* Quantity & Price Controls */}
                                                <div className="flex items-center justify-between">
                                                    {/* Quantity Control - Only for Regular Products (including variants) */}
                                                    {!item.isBundle && (
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm text-gray-600 font-medium">Qty:</span>
                                                            <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                                                                <button
                                                                    onClick={() => handleQuantityChange(item.id, item.quantity, -1, item.variantId)}
                                                                    disabled={isUpdating || item.quantity <= 1}
                                                                    className="ml-2 px-2 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                                >
                                                                    <FaMinus className="text-sm" />
                                                                </button>

                                                                <span className="px-3 py-2 bg-white font-bold text-gray-800 min-w-[40px] text-center">
                                                                    {isUpdating ? (
                                                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600 mx-auto"></div>
                                                                    ) : (
                                                                        item.quantity || 1
                                                                    )}
                                                                </span>

                                                                <button
                                                                    onClick={() => handleQuantityChange(item.id, item.quantity, 1, item.variantId)}
                                                                    disabled={isUpdating}
                                                                    className="mr-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                                >
                                                                    <FaPlus className="text-sm" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Bundle Quantity Display */}
                                                    {item.isBundle && (
                                                        <div className="text-sm text-gray-600">
                                                            Quantity: <span className="font-bold text-gray-800">1</span>
                                                        </div>
                                                    )}

                                                    {/* Price */}
                                                    <div className="text-right">
                                                        <div className="text-sm text-gray-600 mb-1">
                                                            {formatPrice(item.price)} × {item.quantity || 1}
                                                        </div>
                                                        <div className="text-xl font-bold text-teal-600">
                                                            {formatPrice(itemTotal)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Clear Cart Button */}
                        {cartItems.length > 0 && (
                            <div className="mt-6 flex items-center justify-between p-4 bg-rose-50 hasib-rounded border border-rose-100">
                                <p className="text-md text-rose-600">
                                    Remove all items from your cart
                                </p>
                                <button
                                    onClick={handleClearCart}
                                    disabled={clearing}
                                    className="px-5 py-2.5 bg-rose-600 text-white rounded hover:bg-rose-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold cursor-pointer"
                                >
                                    {clearing ? (
                                        <span className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Clearing...
                                        </span>
                                    ) : (
                                        'Clear Cart'
                                    )}
                                </button>
                            </div>
                        )}

                        <div className="w-60">
                            {/* Continue Shopping Link */}
                            <Link
                                href="/"
                                className="block text-center mt-4 text-teal-600 hover:text-teal-700 font-semibold hover:underline transition-colors"
                            >
                                ← Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24 shadow-sm">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800">Order Summary</h2>

                            {/* Summary Details */}
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-semibold text-gray-800">{formatPrice(total)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="text-sm text-gray-500">Calculated at checkout</span>
                                </div>

                                {/* Total */}
                                <div className="pt-4 border-t-2 border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-gray-800">Total</span>
                                        <span className="text-2xl font-bold text-teal-600">{formatPrice(total)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <button
                                onClick={handleCheckout}
                                disabled={loading || cartItems.length === 0}
                                className="w-full py-3 font-medium text-gray-950 bg-primary hover:bg-primary-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-3"
                            >
                                Proceed to Checkout
                                <FaArrowRight />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default CartPage;