// components/BundleProductDetails.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { FaShoppingCart, FaTruck, FaCheck, FaArrowRight } from 'react-icons/fa';
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import Container from "../Container/Container";
import Link from "next/link";
import { useBundleCart } from "@/hooks/useBundleCart";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useCheckoutSession } from "@/hooks/useCheckoutSession";
import CartButton from "../ui/CartButton";
import WishlistButton from "../ui/WishlistButton";
import { Eye } from "lucide-react";
import Image from 'next/image';
import { MdLiveTv, MdOutlineAssignmentReturn, MdSupportAgent } from "react-icons/md";
import PaymentLogo from "../ui/PaymentLogo";

const BundleProductDetails = ({ bundle }) => {
    const router = useRouter();
    const { createBuyNowSession } = useCheckoutSession();
    const {
        addBundleToCart,
        isBundleInCart,
        bundleCart
    } = useBundleCart();

    const [loading, setLoading] = useState(false);
    const [isInCart, setIsInCart] = useState(false);

    // Extract bundle data
    const bundleData = bundle?.data || bundle;

    useEffect(() => {
        if (!bundleData) return;

        const inCart = isBundleInCart(bundleData.id);
        setIsInCart(inCart);
    }, [bundleData, isBundleInCart, bundleCart]);

    // Calculate discount percentage if not provided
    const calculateDiscountPercentage = () => {
        if (bundleData.discountValue) return parseFloat(bundleData.discountValue);

        if (bundleData.price && bundleData.finalPrice) {
            const originalPrice = parseFloat(bundleData.price);
            const finalPrice = parseFloat(bundleData.finalPrice);
            if (originalPrice > 0) {
                return Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
            }
        }
        return 0;
    };

    // Handle add to cart (normal)
    const handleAddToCart = async () => {
        if (!bundleData) return;

        // Check stock availability
        if (bundleData.status === false) {
            toast.error('This bundle is currently out of stock');
            return;
        }

        try {
            setLoading(true);
            const success = addBundleToCart(bundleData, { directBuy: false });

            if (success) {
                toast.success('Bundle added to cart!', {
                    icon: '🛒',
                    duration: 2000,
                });
                setIsInCart(true);
            }
        } catch (error) {
            toast.error('Failed to add to cart');
        } finally {
            setLoading(false);
        }
    };

    // Handle buy now - NO CART CLEARING
    const handleBuyNow = async () => {
        if (!bundleData) return;

        // Check stock availability
        if (bundleData.status === false) {
            toast.error('This bundle is currently out of stock');
            return;
        }

        try {
            setLoading(true);

            // Format bundle for checkout
            const checkoutItem = {
                id: bundleData.id,
                name: bundleData.name,
                slug: bundleData.slug,
                image: bundleData.image,
                price: parseFloat(bundleData.finalPrice || bundleData.price),
                quantity: 1,
                sku: bundleData.sku,
                type: 'bundle',
                isBundle: true,
                bundleItems: bundleData.bundleItems,
                discountAmount: bundleData.discountAmount,
                discountValue: bundleData.discountValue,
                totalSavings: bundleData.totalSavings,
                savingsPercentage: bundleData.savingsPercentage,
                originalPrice: parseFloat(bundleData.price),
                status: bundleData.status
            };

            // Create Buy Now session (does NOT affect cart)
            createBuyNowSession(checkoutItem, 'bundle');

            toast.success('Proceeding to checkout...', {
                duration: 1500
            });

            // Navigate to checkout
            setTimeout(() => {
                router.push('/checkout');
            }, 500);

        } catch (error) {
            console.error('Buy now error:', error);
            toast.error('Failed to proceed to checkout');
        } finally {
            setLoading(false);
        }
    };

    if (!bundleData) {
        return (
            <div className="p-4 sm:p-8 text-center text-gray-600">
                <div className="text-4xl sm:text-6xl mb-4">📦</div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2">Bundle not found</h2>
                <p className="text-sm sm:text-base">The bundle you're looking for doesn't exist.</p>
            </div>
        );
    }

    const { name, image, finalPrice, price, discountValue, status, bundleItems = [] } = bundleData;
    const discountPercentage = calculateDiscountPercentage();
    const isAvailable = status === true;

    return (
        <Container>
            <div className="px-4 sm:px-6 lg:px-8 py-2 sm:py-4 text-gray-800">
                {/* Breadcrumb - Mobile optimized */}
                <nav className="flex flex-wrap items-center gap-1 sm:gap-2 text-lg sm:text-sm text-gray-600 mb-2 sm:mb-4">
                    <Link href="/" className="hover:text-teal-600 truncate">Home</Link>
                    <span>/</span>
                    <Link href="/bundle-products" className="hover:text-teal-600 truncate">Bundle Products</Link>
                    <span>/</span>
                    <span className="text-gray-800 font-medium truncate flex-1 sm:flex-none">{name}</span>
                </nav>

                <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
                    {/* Image Section - Mobile optimized */}
                    <div className="relative">
                        <div className="bg-stone-50 rounded-xl overflow-hidden border border-stone-100">
                            <Image
                                src={image}
                                alt={name}
                                width={500}
                                height={500}
                                className="w-full h-full max-h-[300px] sm:max-h-[400px] object-contain"
                                priority
                            />
                        </div>

                        {/* Bundle Preview Images - Mobile optimized */}
                        {bundleItems?.length > 0 && (
                            <div className="mt-4 sm:mt-6">
                                <h4 className="font-semibold text-gray-700 mb-3 sm:my-5 text-sm sm:text-base">Bundle Items Preview</h4>
                                <div className="flex flex-wrap gap-3 sm:gap-4">
                                    {bundleItems?.slice(0, 4).map((item, index) => {
                                        const product = item.product;
                                        if (!product?.images?.[0]) return null;

                                        return (
                                            <div key={index} className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-white diva-rounded overflow-hidden group border border-gray-200">
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.productName}
                                                    width={500}
                                                    height={500}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="text-white text-lg font-medium">{item.quantity}x</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {bundleItems?.length > 4 && (
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 diva-rounded border flex items-center justify-center">
                                            <span className="text-gray-600 font-bold text-sm sm:text-base">+{bundleItems.length - 4}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Product Info - Mobile optimized */}
                    <div className="space-y-4 sm:space-y-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{name}</h1>

                        {/* Pricing - Mobile optimized */}
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                            <span className="text-3xl sm:text-4xl font-bold text-primary flex items-center">
                                <FaBangladeshiTakaSign className="text-xl sm:text-2xl mr-1" />
                                {parseFloat(finalPrice || price).toLocaleString()}
                            </span>

                            {/* Show original price only if discount exists */}
                            {discountPercentage > 0 && (
                                <span className="text-gray-500 text-lg sm:text-xl line-through">
                                    ৳{parseFloat(price).toLocaleString()}
                                </span>
                            )}
                            {/* Stock Status Badge */}
                            <div className="w-full sm:w-auto mt-2 sm:mt-0">
                                <span className={`inline-block px-2 py-1 rounded text-lg sm:text-sm ${isAvailable ? 'bg-green-100 text-green-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {isAvailable ? 'In Stock' : 'Out of Stock'}
                                </span>
                            </div>
                        </div>

                        {/* Discount Details - Mobile optimized */}
                        {discountPercentage > 0 && (
                            <div className="bg-rose-50 border border-rose-200 diva-rounded p-3 sm:p-4">
                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <p className="text-lg sm:text-sm text-rose-800">Discount</p>
                                        <p className="text-base sm:text-lg font-bold text-rose-600">-{discountPercentage}%</p>
                                    </div>
                                    <div>
                                        <p className="text-lg sm:text-sm text-rose-800">You Save</p>
                                        <p className="text-base sm:text-lg font-bold text-rose-600 flex items-center">
                                            <FaBangladeshiTakaSign className="mr-1 text-sm sm:text-base" />
                                            {bundleData.discountAmount ||
                                                (parseFloat(price) - parseFloat(finalPrice || price)).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons - Mobile optimized */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                            <button
                                onClick={handleAddToCart}
                                disabled={loading || isInCart || !isAvailable}
                                className={`flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 sm:px-6 diva-rounded uppercase font-semibold text-sm sm:text-base transition-all ${isInCart
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : !isAvailable
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-transparent text-secound hover:bg-secound border border-secound hover:text-white'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                                        <span className="inline">Adding...</span>
                                    </span>
                                ) : isInCart ? (
                                    <>
                                        <FaCheck className="text-sm sm:text-base" />
                                        <span className="inline">Added to Cart</span>
                                    </>
                                ) : !isAvailable ? (
                                    <>
                                        <FaShoppingCart className="text-sm sm:text-base" />
                                        <span className="inline">Out of Stock</span>
                                    </>
                                ) : (
                                    <>
                                        <FaShoppingCart className="text-sm sm:text-base" />
                                        <span className="inline">Add to Cart</span>
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleBuyNow}
                                disabled={loading || !isAvailable}
                                className={`flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 sm:px-6 diva-rounded font-semibold text-sm sm:text-base transition-all uppercase ${!isAvailable
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-primary hover:bg-primary-hover text-black'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                                        <span className="hidden lg:inline">Processing...</span>
                                    </span>
                                ) : !isAvailable ? (
                                    'Out of Stock'
                                ) : (
                                    <>
                                        Buy Now <FaArrowRight className="text-sm sm:text-base" />
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Bundle Contents - Mobile optimized */}
                        <div className="space-y-3 sm:space-y-4 border border-stone-200 p-3 sm:p-4 diva-rounded">
                            <h3 className="font-bold text-base sm:text-lg">Bundle Contents ({bundleItems?.length || 0} items)</h3>
                            <div className="space-y-3">
                                {bundleItems?.map((item, index) => {
                                    const product = item.product;
                                    if (!product) return null;

                                    return (
                                        <div key={index} className="bg-gray-50 p-3 sm:p-4 diva-rounded border border-gray-100">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                                {/* Left side: Product image and info */}
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white diva-rounded overflow-hidden flex-shrink-0">
                                                        {product.images?.[0] ? (
                                                            <img
                                                                src={product.images[0]}
                                                                alt={product.productName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                                <span className="text-gray-400 text-lg">No Image</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{product.productName}</h4>
                                                        <div className="text-gray-600">
                                                            <span className="font-medium text-primary text-sm sm:text-base">৳{parseFloat(product.price).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right side: Action buttons - Mobile optimized */}
                                                <div className="flex items-center justify-end sm:justify-start gap-2 flex-shrink-0">
                                                    {/* View Details Button */}
                                                    <Link href={`/product/${product.slug}`}>
                                                        <button
                                                            title="View Product Details"
                                                            className="p-1.5 sm:p-2 rounded-full border border-gray-200 bg-white hover:border-green-200 hover:bg-green-50 transition-all duration-200 group"
                                                        >
                                                            <Eye size={16} className="sm:w-[18px] sm:h-[18px] text-gray-500 group-hover:text-green-500" />
                                                        </button>
                                                    </Link>

                                                    {/* Wishlist Button */}
                                                    <div className="rounded-full border border-gray-200 bg-white hover:border-red-200 hover:bg-red-50 transition-all duration-200 group">
                                                        <WishlistButton
                                                            product={product}
                                                            variant="minimal"
                                                            iconSize={16}
                                                            buttonClassName="p-1.5 sm:p-2"
                                                            iconClassName="text-gray-500 group-hover:text-red-500"
                                                        />
                                                    </div>

                                                    {/* Cart Button */}
                                                    <CartButton
                                                        product={product}
                                                        variant="minimal"
                                                        iconSize={16}
                                                        buttonClassName="p-1.5 sm:p-2 rounded-full border border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 group"
                                                        iconClassName="text-gray-500 group-hover:text-blue-500"
                                                        activeClassName="text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                                                        showTooltip={true}
                                                        tooltipText="Add to cart"
                                                        activeTooltipText="Remove from cart"
                                                        disabledTooltipText="Out of stock"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Delivery Info - Removed per request */}
                        {/*
                        <div className="bg-sky-50 border border-sky-200 diva-rounded p-3">
                            <p className="text-lg sm:text-sm text-sky-500">
                                <strong>Est. Delivery between</strong> 3-7 Business days
                            </p>
                        </div>
                        */}

                        {/* Service Cards - Removed per request */}
                        {/*
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 bg-yellow-50 diva-rounded p-4 sm:p-6 mt-4">
                            <div className="text-center">
                                <MdOutlineAssignmentReturn className="text-2xl sm:text-3xl mx-auto mb-2 text-gray-700" />
                                <h5 className="text-lg font-semibold text-gray-900 mb-1">
                                    Return & Refund Policy
                                </h5>
                            </div>
                            <div className="text-center lg:border-x border-yellow-200 lg:px-3">
                                <MdSupportAgent className="text-2xl sm:text-3xl mx-auto mb-2 text-gray-700" />
                                <h5 className="text-lg font-semibold text-gray-900 mb-1">
                                    Assemble & Product Support
                                </h5>
                            </div>
                            <div className="text-center">
                                <MdLiveTv className="text-2xl sm:text-3xl mx-auto mb-2 text-gray-700" />
                                <h5 className="text-lg font-semibold text-gray-900 mb-1">
                                    Have Questions? Call Us
                                </h5>
                            </div>
                        </div>
                        */}

                        {/* Payment logo - Removed per request */}
                        {/* <PaymentLogo /> */}
                    </div>
                </div>

                {/* Description - Mobile optimized */}
                <div className="mt-10 sm:mt-20 space-y-3">
                    <h3 className="text-lg sm:text-xl font-philosopher">Description</h3>
                    <p className="text-sm sm:text-md leading-relaxed">{bundleData.description}</p>
                </div>
            </div>
        </Container>
    );
};

export default BundleProductDetails;
