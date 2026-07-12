'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Container from '@/components/Container/Container';

const BentoImageGalleryTwo = ({ bentoImageGalleryData }) => {
    const filteredData =
        bentoImageGalleryData?.filter(
            (item) => item.category?.toLowerCase() === 'threepices'
        ) || [];

    if (!filteredData.length) return null;

    // Maximum 6 items
    const items = filteredData.slice(0, 6);

    const getLayoutClass = (index, total) => {
        switch (total) {
            case 1:
                return 'md:col-span-4 md:row-span-2 h-[600px]';

            case 2:
                return index === 0
                    ? 'md:col-span-2 md:row-span-2 h-[600px]'
                    : 'md:col-span-2 md:row-span-2 h-[600px]';

            case 3:
                return [
                    'md:col-start-1 md:row-start-1 md:row-span-2 h-[600px]',
                    'md:col-start-2 md:row-start-1 md:row-span-2 h-[600px]',
                    'md:col-start-3 md:col-span-2 md:row-span-2 h-[600px]',
                ][index];

            case 4:
                return [
                    'md:col-start-1 md:row-start-1 md:row-span-2 h-[600px]',
                    'md:col-start-2 md:row-start-1 md:row-span-2 h-[600px]',
                    'md:col-start-3 md:row-start-1 h-[290px]',
                    'md:col-start-4 md:row-start-1 h-[290px]',
                ][index];

            case 5:
                return [
                    'md:col-start-1 md:row-start-1 md:row-span-2 h-[600px]',
                    'md:col-start-2 md:row-start-1 md:row-span-2 h-[600px]',
                    'md:col-start-3 md:row-start-1 h-[290px]',
                    'md:col-start-4 md:row-start-1 h-[290px]',
                    'md:col-start-3 md:col-span-2 md:row-start-2 h-[290px]',
                ][index];

            default:
                return [
                    'md:col-start-1 md:row-start-1 md:row-span-2 h-[600px]',
                    'md:col-start-2 md:row-start-1 md:row-span-2 h-[600px]',
                    'md:col-start-3 md:row-start-1 h-[290px]',
                    'md:col-start-4 md:row-start-1 h-[290px]',
                    'md:col-start-3 md:row-start-2 h-[290px]',
                    'md:col-start-4 md:row-start-2 h-[290px]',
                ][index];
        }
    };

    return (
        <section className="py-5">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4">
                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            className={`
                                group
                                relative
                                overflow-hidden
                                transition-all duration-500 ease-out
                                hover:shadow-2xl hover:shadow-purple-500/20
                                hover:-translate-y-1
                                ${getLayoutClass(index, items.length)}
                            `}
                        >
                            {/* Image */}
                            <div className="absolute inset-0 bg-gray-800">
                                <Image
                                    src={item.image}
                                    alt={item.title || 'Gallery Image'}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            </div>

                            {/* Overlay - Using gradient from first component */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

                            {/* Content - Enhanced with second component styling */}
                            <div className="absolute inset-0 flex flex-col justify-end items-center text-center p-6 pb-2 group-hover:pb-14 transition-all duration-500 ease-out">
                                <h3 className="text-white text-2xl font-bold">
                                    {item.title}
                                </h3>

                                {item.sub_title && (
                                    <p className="mt-2 text-gray-200 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 max-w-xs">
                                        {item.sub_title}
                                    </p>
                                )}

                                {item.link && item.link !== "" && (
                                    <div className="mt-4 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-all duration-500 delay-150">
                                        <div className="w-10 h-[2px] bg-white mb-3"></div>
                                        <Link
                                            href={item.link}
                                            className="inline-block px-4 py-2 border border-white text-white text-xs font-bold tracking-wider hover:bg-white hover:text-black transition-colors"
                                        >
                                            View More
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Shine Effect from second component */}
                            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shine_1s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10 pointer-events-none" />
                        </div>
                    ))}
                </div>
            </Container>
        </section>
    );
};

export default BentoImageGalleryTwo;