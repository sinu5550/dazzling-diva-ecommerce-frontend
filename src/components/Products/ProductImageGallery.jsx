// components/products/ProductImageGallery.jsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaSearchPlus } from 'react-icons/fa';

export default function ProductImageGallery({ images, productName }) {

    const [selectedImage, setSelectedImage] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setMousePosition({ x, y });
    };

    return (
        <div className="space-y-4">
            <div
                className=" relative aspect-[4/5] overflow-hidden  bg-gray-100 group "
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
            >
                <Image
                    src={images[selectedImage] || ''}
                    alt={`${productName} - Image ${selectedImage + 1}`}
                    fill
                    priority
                    className=" object-cover transition-transform duration-300 ease-out "
                    style={{
                        transform: isZoomed ? 'scale(1.6)' : 'scale(1)',
                        transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                    }}
                />

                <div
                    className=" absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 pointer-events-none"
                />

                <div
                    className=" absolute top-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                >
                    <FaSearchPlus className="text-gray-700 text-sm" />
                </div>
            </div>


            {/* Thumbnail Images */}
            <div className="flex gap-4 overflow-x-auto pb-2 mt-8 hide-scrollbar">
                {images.map((image, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative flex-shrink-0 w-14 md:w-20 h-14 md:h-20 border  overflow-hidden transition-all ${selectedImage === index
                                ? 'border-secound shadow-lg'
                                : 'border-gray-200 hover:border-gray-400'
                            }`}
                    >
                        <Image
                            src={image}
                            alt={`${productName} thumbnail ${index + 1}`}
                            fill
                            className="object-contain p-1"
                            loading="lazy"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}