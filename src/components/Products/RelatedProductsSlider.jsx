'use client';

import React, { useState, useEffect } from 'react';
import DiscountProductCard from '@/components/DiscountProduct/DiscountProductCard';
import QuickViewModal from '@/components/Modal/QuickViewModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function RelatedProductsSlider({ relatedProducts = [], user = null }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(4);
    const [selectedQuickViewProduct, setSelectedQuickViewProduct] = useState(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    // Touch swipe support for mobile
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > minSwipeDistance) {
            nextSlide();
        } else if (distance < -minSwipeDistance) {
            prevSlide();
        }
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setItemsPerPage(4);
            } else if (window.innerWidth >= 768) {
                setItemsPerPage(3);
            } else {
                setItemsPerPage(2);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!relatedProducts || relatedProducts.length === 0) return null;

    const maxIndex = Math.max(0, relatedProducts.length - itemsPerPage);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
    };

    return (
        <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
                <h2 className=" text-lg md:text-2xl font-semibold text-gray-900 font-outfit">
                    You May Also Like
                </h2>

                {/* Header Navigation Arrows (visible on mobile & desktop) */}
                {relatedProducts.length > itemsPerPage && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={prevSlide}
                            aria-label="Previous products"
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-[#5A0C3D] hover:bg-[#5A0C3D] hover:text-white transition-all cursor-pointer active:scale-95"
                        >
                            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                        <button
                            onClick={nextSlide}
                            aria-label="Next products"
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-[#5A0C3D] hover:bg-[#5A0C3D] hover:text-white transition-all cursor-pointer active:scale-95"
                        >
                            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Slider Container */}
            <div className="relative group">
                {/* Desktop Hover Overlay Left Arrow */}
                {relatedProducts.length > itemsPerPage && (
                    <button
                        onClick={prevSlide}
                        aria-label="Previous products"
                        className="
                            hidden lg:flex
                            absolute -left-5 top-1/2 -translate-y-1/2 z-20
                            w-12 h-12
                            rounded-full !bg-white shadow-lg border border-gray-200
                            items-center justify-center
                            opacity-0 invisible
                            group-hover:opacity-100 group-hover:visible
                            hover:bg-primary text-stone-500 hover:text-white
                            transition-all duration-300 cursor-pointer
                        "
                    >
                        <ChevronLeft className="text-base text-[#5A0C3D]" />
                    </button>
                )}

                {/* Desktop Hover Overlay Right Arrow */}
                {relatedProducts.length > itemsPerPage && (
                    <button
                        onClick={nextSlide}
                        aria-label="Next products"
                        className="
                            hidden lg:flex
                            absolute -right-5 top-1/2 -translate-y-1/2 z-20
                            w-12 h-12
                            rounded-full !bg-white shadow-lg border border-gray-200
                            items-center justify-center
                            opacity-0 invisible
                            group-hover:opacity-100 group-hover:visible
                            hover:bg-primary text-stone-500 hover:text-white
                            transition-all duration-300 cursor-pointer
                        "
                    >
                        <ChevronRight className="text-base text-[#5A0C3D]" />
                    </button>
                )}

                {/* Slider items */}
                <div
                    className="overflow-hidden"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    <div
                        className="flex transition-transform duration-500 ease-out "
                        style={{
                            transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
                        }}
                    >
                        {relatedProducts.map((relatedProduct) => (
                            <div
                                key={relatedProduct.id}
                                className="flex-shrink-0 pr-1.5  "
                                style={{ width: `${100 / itemsPerPage}%` }}
                            >
                                <DiscountProductCard
                                    product={relatedProduct}
                                    user={user}
                                    onOpenQuickView={(prod) => {
                                        setSelectedQuickViewProduct(prod);
                                        setIsQuickViewOpen(true);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick View Modal */}
            <QuickViewModal
                product={selectedQuickViewProduct}
                isOpen={isQuickViewOpen}
                onClose={() => {
                    setIsQuickViewOpen(false);
                    setSelectedQuickViewProduct(null);
                }}
            />
        </div>
    );
}
