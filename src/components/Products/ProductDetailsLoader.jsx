'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getProductBySlug, getRelatedProducts, getDiscountProductBySlug } from '@/lib/products';
import ProductDetailsClient from '@/components/Products/ProductDetailsClient';
import DiscountProductDetailsClient from '@/components/DiscountProduct/DiscountProductDetailsClient';
import { RefreshCw, AlertTriangle, ArrowLeft } from 'lucide-react';
import Container from '@/components/Container/Container';
import Link from 'next/link';

export default function ProductDetailsLoader({ slug, type = 'product' }) {
    const [data, setData] = useState({ product: null, relatedProducts: [] });
    const [status, setStatus] = useState({ loading: true, error: null });
    const [fadeState, setFadeState] = useState('entering'); // 'entering' | 'loading' | 'leaving' | 'done'
    const loadedSlugRef = useRef(null);

    const preloadImage = (src) => {
        return new Promise((resolve) => {
            if (!src) return resolve();
            const img = new window.Image();
            img.src = src;
            img.onload = () => resolve();
            img.onerror = () => resolve(); // Proceed even if preload fails
        });
    };

    const loadData = useCallback(async () => {
        if (loadedSlugRef.current === slug) {
            return;
        }
        setStatus({ loading: true, error: null });
        setFadeState('loading');
        const startTime = Date.now();

        try {
            let productData = null;
            let relatedData = [];

            if (type === 'campaign') {
                productData = await getDiscountProductBySlug(slug);
            } else {
                productData = await getProductBySlug(slug);
                if (productData) {
                    relatedData = await getRelatedProducts(
                        productData.subCategoryId,
                        productData.id,
                        4
                    );
                }
            }

            if (!productData) {
                throw new Error('Product not found');
            }

            // Preload the first product image
            const firstImage = productData.images?.[0] || '';
            await preloadImage(firstImage);

            // Guarantee a minimum loading display time of 1200ms to avoid flashing
            const elapsed = Date.now() - startTime;
            const minDelay = 1200;
            if (elapsed < minDelay) {
                await new Promise((resolve) => setTimeout(resolve, minDelay - elapsed));
            }

            setData({ product: productData, relatedProducts: relatedData });
            loadedSlugRef.current = slug;

            // Trigger transition animation
            setFadeState('leaving');
            setTimeout(() => {
                setStatus({ loading: false, error: null });
                setFadeState('done');
            }, 500); // match duration-500 transition exactly

        } catch (err) {
            console.error('Error loading product details:', err);
            setStatus({ loading: false, error: err.message || 'Failed to load product details' });
        }
    }, [slug, type]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (status.error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center font-outfit px-4">
                <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-xl p-8 text-center animate-fadeIn">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
                        <AlertTriangle className="text-red-500 w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Something went wrong</h2>
                    <p className="text-gray-600 mb-6">
                        {status.error === 'Product not found'
                            ? "We couldn't find the product you're looking for. It might have been removed or is currently unavailable."
                            : "We encountered an error while fetching the product details. Please check your internet connection."}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={loadData}
                            className="px-6 py-3 bg-[#5A0C3D] hover:bg-[#4a0a32] text-white font-medium rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                        >
                            <RefreshCw className="w-4 h-4 animate-spin-slow" />
                            <span>Retry Loading</span>
                        </button>
                        <Link
                            href="/"
                            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Go to Home</span>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (status.loading || fadeState === 'leaving') {
        return (
            <div
                className={`min-h-screen bg-gray-50/50 transition-all duration-500 ease-in-out ${fadeState === 'leaving' ? 'opacity-0 translate-y-4 scale-95 pointer-events-none' : 'opacity-100 translate-y-0 scale-100'
                    }`}
            >
                {/* Friendly Premium Message Overlay */}
                <div className="bg-[#5A0C3D]/5 border-b border-[#5A0C3D]/10 py-6 px-4 sticky top-[72px] z-40 backdrop-blur-md">
                    <Container>
                        <div className="flex items-center justify-center gap-3 max-w-2xl mx-auto">
                            <p className="text-sm md:text-base font-medium text-[#5A0C3D] text-center font-outfit leading-relaxed">
                                Awesome! You’ve chosen a beautiful product that everyone loves. We're getting it ready for you...
                            </p>
                        </div>
                    </Container>
                </div>

                {/* Premium Details Skeleton Loader */}
                <Container className="py-8 md:py-12 font-outfit">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 animate-pulse">

                        {/* Left Column: Image Gallery Skeleton */}
                        <div className="space-y-4">
                            {/* Main Image */}
                            <div className="aspect-[4/5] w-full bg-gray-200 rounded-2xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                            </div>
                            {/* Thumbnails */}
                            <div className="flex gap-4">
                                {Array.from({ length: 4 }).map((_, idx) => (
                                    <div key={idx} className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Details Skeleton */}
                        <div className="space-y-6">
                            {/* Category & Brand */}
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded-md w-1/4" />
                                <div className="h-8 bg-gray-200 rounded-lg w-3/4" />
                            </div>

                            {/* Ratings & Stock */}
                            <div className="flex items-center gap-4">
                                <div className="h-5 bg-gray-200 rounded-md w-1/3" />
                                <div className="h-5 bg-gray-200 rounded-md w-1/4" />
                            </div>

                            {/* Price */}
                            <div className="h-10 bg-gray-200 rounded-lg w-1/3" />

                            <hr className="border-gray-200" />

                            {/* Options/Variants */}
                            <div className="space-y-3">
                                <div className="h-5 bg-gray-200 rounded-md w-1/5" />
                                <div className="flex gap-3">
                                    {Array.from({ length: 3 }).map((_, idx) => (
                                        <div key={idx} className="w-12 h-12 bg-gray-200 rounded-full" />
                                    ))}
                                </div>
                            </div>

                            {/* Description Short */}
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded-md w-full" />
                                <div className="h-4 bg-gray-200 rounded-md w-full" />
                                <div className="h-4 bg-gray-200 rounded-md w-2/3" />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <div className="h-14 bg-gray-200 rounded-xl flex-1" />
                                <div className="h-14 bg-gray-200 rounded-xl w-14" />
                            </div>

                            <hr className="border-gray-200" />

                            {/* Details Lists */}
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded-md w-1/2" />
                                <div className="h-4 bg-gray-200 rounded-md w-1/3" />
                            </div>
                        </div>

                    </div>
                </Container>

                <style jsx>{`
                    @keyframes shimmer {
                        100% {
                            transform: translateX(100%);
                        }
                    }
                `}</style>
            </div>
        );
    }

    // Fully Loaded Transition Component
    return (
        <div className="transition-opacity duration-500 ease-in-out opacity-100 animate-fadeIn">
            {type === 'campaign' ? (
                <DiscountProductDetailsClient product={data.product} />
            ) : (
                <ProductDetailsClient product={data.product} relatedProducts={data.relatedProducts} />
            )}
        </div>
    );
}
