'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
    // Zoom & Pan state
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isGesturing, setIsGesturing] = useState(false);

    // Refs for gesture tracking
    const containerRef = useRef(null);
    const lastTapTime = useRef(0);
    const initialPinchDist = useRef(0);
    const initialPinchScale = useRef(1);
    const lastTouchPos = useRef({ x: 0, y: 0 });
    const swipeStartX = useRef(0);
    const swipeStartY = useRef(0);
    const currentScaleRef = useRef(1);
    const currentPosRef = useRef({ x: 0, y: 0 });

    // Sync refs with state
    useEffect(() => {
        currentScaleRef.current = scale;
    }, [scale]);

    useEffect(() => {
        currentPosRef.current = position;
    }, [position]);

    // Reset zoom and pan whenever current slide changes or modal opens/closes
    const resetZoom = useCallback(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
        currentScaleRef.current = 1;
        currentPosRef.current = { x: 0, y: 0 };
    }, []);

    useEffect(() => {
        resetZoom();
    }, [currentIndex, isOpen, resetZoom]);

    if (!isOpen || !images || images.length === 0) return null;

    const minSwipeDistance = 45;

    const handlePrev = (e) => {
        if (e) e.stopPropagation();
        resetZoom();
        const prevIdx = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
        onIndexChange?.(prevIdx);
    };

    const handleNext = (e) => {
        if (e) e.stopPropagation();
        resetZoom();
        const nextIdx = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
        onIndexChange?.(nextIdx);
    };

    // Calculate maximum pan bounds based on container size and current zoom scale
    const clampPosition = (x, y, currentScale) => {
        if (currentScale <= 1 || !containerRef.current) {
            return { x: 0, y: 0 };
        }
        const rect = containerRef.current.getBoundingClientRect();
        const maxX = ((currentScale - 1) * rect.width) / 2;
        const maxY = ((currentScale - 1) * rect.height) / 2;
        return {
            x: Math.max(-maxX, Math.min(maxX, x)),
            y: Math.max(-maxY, Math.min(maxY, y)),
        };
    };

    // Double tap / double click zoom toggle
    const handleDoubleTap = () => {
        if (scale > 1.1) {
            // Zoom out
            resetZoom();
        } else {
            // Zoom in
            const newScale = 2.5;
            setScale(newScale);
            setPosition({ x: 0, y: 0 });
            currentScaleRef.current = newScale;
            currentPosRef.current = { x: 0, y: 0 };
        }
    };

    // Touch Event Handlers
    const onTouchStart = (e) => {
        if (e.touches.length === 2) {
            // 2 Fingers -> Pinch to Zoom
            setIsGesturing(true);
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            initialPinchDist.current = dist;
            initialPinchScale.current = currentScaleRef.current;
        } else if (e.touches.length === 1) {
            // 1 Finger -> Check for double-tap or Pan / Swipe
            const now = Date.now();
            const timeSinceLastTap = now - lastTapTime.current;

            if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
                // Double tap detected!
                lastTapTime.current = 0;
                handleDoubleTap();
                return;
            }
            lastTapTime.current = now;

            setIsGesturing(true);
            lastTouchPos.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
            };
            swipeStartX.current = e.touches[0].clientX;
            swipeStartY.current = e.touches[0].clientY;
        }
    };

    const onTouchMove = (e) => {
        if (e.touches.length === 2) {
            // Pinching in/out
            if (initialPinchDist.current <= 0) return;
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const factor = dist / initialPinchDist.current;
            const rawScale = initialPinchScale.current * factor;
            const newScale = Math.min(Math.max(rawScale, 1), 4.5);

            setScale(newScale);
            currentScaleRef.current = newScale;

            if (newScale <= 1) {
                setPosition({ x: 0, y: 0 });
            } else {
                setPosition((prev) => clampPosition(prev.x, prev.y, newScale));
            }
        } else if (e.touches.length === 1) {
            const touch = e.touches[0];
            const deltaX = touch.clientX - lastTouchPos.current.x;
            const deltaY = touch.clientY - lastTouchPos.current.y;

            lastTouchPos.current = { x: touch.clientX, y: touch.clientY };

            if (currentScaleRef.current > 1) {
                // Pan around when zoomed
                setPosition((prev) => {
                    const newX = prev.x + deltaX;
                    const newY = prev.y + deltaY;
                    return clampPosition(newX, newY, currentScaleRef.current);
                });
            }
        }
    };

    const onTouchEnd = (e) => {
        setIsGesturing(false);

        if (e.touches.length === 0) {
            if (currentScaleRef.current <= 1.05) {
                // Not zoomed: check for horizontal swipe navigation
                resetZoom();
                const touchEndX = lastTouchPos.current.x;
                const distance = swipeStartX.current - touchEndX;

                if (distance > minSwipeDistance && images.length > 1) {
                    handleNext();
                } else if (distance < -minSwipeDistance && images.length > 1) {
                    handlePrev();
                }
            } else {
                // Ensure image stays within bounds
                setPosition((prev) =>
                    clampPosition(prev.x, prev.y, currentScaleRef.current)
                );
            }
        } else if (e.touches.length === 1) {
            // One finger lifted during pinch
            lastTouchPos.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
            };
        }
    };

    const currentImage = images[currentIndex] || images[0] || '';

    return (
        <div
            className="fixed inset-0 z-[1000000] bg-black/90 flex flex-col justify-between md:hidden animate-fade-in touch-none select-none overflow-hidden"
            onClick={onClose}
        >
            {/* Top Bar with Counter and Close Button */}
            <div
                className="w-full flex items-center justify-between px-4 py-3.5 text-white z-20"
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold tracking-widest bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white">
                        {currentIndex + 1} / {images.length}
                    </span>
                    {scale > 1.1 && (
                        <span className="text-[10px] font-medium tracking-wide bg-amber-500/80 backdrop-blur-md px-2 py-0.5 rounded-full text-white">
                            {scale.toFixed(1)}x
                        </span>
                    )}
                </div>

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

            {/* Image Area with Left/Right Arrows & Touch Swipe / Pinch / Double Tap Support */}
            <div
                className="relative flex-1 w-full flex items-center justify-center px-4 overflow-hidden"
                onClick={(e) => {
                    if (e.target === e.currentTarget && scale <= 1.05) onClose();
                }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {/* Previous Button */}
                {images.length > 1 && scale <= 1.1 && (
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
                    ref={containerRef}
                    className="relative w-full max-w-xs aspect-[4/5] bg-white rounded-xl shadow-2xl overflow-hidden flex items-center justify-center p-3 z-10 cursor-zoom-in"
                    onClick={(e) => e.stopPropagation()}
                    onDoubleClick={handleDoubleTap}
                >
                    <div
                        className="relative w-full h-full flex items-center justify-center"
                        style={{
                            transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
                            transition: isGesturing
                                ? 'none'
                                : 'transform 0.25s cubic-bezier(0.2, 0, 0.2, 1)',
                            transformOrigin: 'center center',
                            willChange: 'transform',
                        }}
                    >
                        <Image
                            src={currentImage}
                            alt={`${productName} image ${currentIndex + 1}`}
                            fill
                            sizes="100vw"
                            className="object-contain select-none pointer-events-none"
                            priority
                            draggable={false}
                        />
                    </div>
                </div>

                {/* Next Button */}
                {images.length > 1 && scale <= 1.1 && (
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
                    if (e.target === e.currentTarget && scale <= 1.05) onClose();
                }}
            >
                {images.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={(e) => {
                            e.stopPropagation();
                            resetZoom();
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
