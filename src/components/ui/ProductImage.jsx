// components/ProductImage.jsx
'use client';

import Image from 'next/image';

export default function ProductImage({ src, alt, isAvailable = true }) {

    return (
        <div className="relative bg-gray-100 h- overflow-hidden">
            <div className="relative aspect-[3/4] overflow-hidden  bg-gray-100">

                <Image
                    src={src}
                    alt={alt}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    className=" object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

            </div>

            {/* Out of Stock Overlay */}
            {!isAvailable && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-white text-red-600 font-bold px-3 py-1 rounded text-sm">
                        Out of Stock
                    </span>
                </div>
            )}
        </div>
    );
}