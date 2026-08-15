'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';

export default function MobileImageLightbox({
    isOpen,
    onClose,
    images = [],
    currentIndex = 0,
    onIndexChange,
    productName = 'Product'
}) {
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    if (!isOpen || !images || images.length === 0) return null;

    const minSwipeDistance = 40;

    const handlePrev = (e) => {
        if (e) e.stopPropagation();
        const prevIdx = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
        onIndexChange?.(prevIdx);
    };

    const handleNext = (e) => {
        if (e) e.stopPropagation();
        const nextIdx = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
        onIndexChange?.(nextIdx);
    };

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
        if (distance > minSwipeDistance && images.length > 1) {
            handleNext();
        } else if (distance < -minSwipeDistance && images.length > 1) {
            handlePrev();
        }
    };

    const currentImage = images[currentIndex] || images[0] || '';

    return (
        <div
            className="fixed inset-0 z-[1000000] bg-black/85 flex flex-col justify-between md:hidden animate-fade-in touch-none select-none"
            onClick={onClose}
        >
            {/* Top Bar with Counter and Close Button */}
            <div
                className="w-full flex items-center justify-between px-4 py-3.5 text-white z-20"
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                <span className="text-xs font-semibold tracking-widest bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white">
                    {currentIndex + 1} / {images.length}
                </span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90 cursor-pointer shadow-md"
                    aria-label="Close image modal"
                >
                    <FaTimes size={18} />
                </button>
            </div>

            {/* Image Area with Left/Right Arrows & Touch Swipe Support */}
            <div
                className="relative flex-1 w-full flex items-center justify-center px-4"
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {/* Previous Button */}
                {images.length > 1 && (
                    <button
                        onClick={handlePrev}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/60 active:bg-black/90 text-white flex items-center justify-center shadow-xl transition-all active:scale-95 cursor-pointer"
                        aria-label="Previous image"
                    >
                        <FaChevronLeft size={16} />
                    </button>
                )}

                {/* White Framed Image Container */}
                <div
                    className="relative w-full max-w-xs aspect-[4/5] bg-white rounded-xl shadow-2xl overflow-hidden flex items-center justify-center p-3 z-10"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Image
                        src={currentImage}
                        alt={`${productName} image ${currentIndex + 1}`}
                        fill
                        sizes="100vw"
                        className="object-contain select-none pointer-events-none"
                        priority
                    />
                </div>

                {/* Next Button */}
                {images.length > 1 && (
                    <button
                        onClick={handleNext}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/60 active:bg-black/90 text-white flex items-center justify-center shadow-xl transition-all active:scale-95 cursor-pointer"
                        aria-label="Next image"
                    >
                        <FaChevronRight size={16} />
                    </button>
                )}
            </div>

            {/* Bottom Indicator Dots */}
            <div
                className="w-full py-4 flex items-center justify-center gap-1.5 z-20"
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                {images.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={(e) => {
                            e.stopPropagation();
                            onIndexChange?.(idx);
                        }}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                            currentIndex === idx
                                ? 'w-6 bg-white'
                                : 'w-2 bg-white/40'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
