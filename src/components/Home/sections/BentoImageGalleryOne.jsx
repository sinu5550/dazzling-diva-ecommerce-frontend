'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

const BentoImageGalleryOne = ({ bentoImageGalleryData }) => {
    // Keep original data filtering
    const data =
        bentoImageGalleryData?.filter(
            item => item.category?.toLowerCase() === 'saree'
        ) || [];

    if (!data.length) return null;

    // Slice up to 5 items: 1 big left + 4 smaller right
    const items = data.slice(0, 5);

    // If we don't have enough items, adjust layout gracefully
    const bigItem = items[0];
    const smallItems = items.slice(1);

    return (
        <section className="w-full overflow-hidden bg-white py-2">
            <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-1.5">
                
                {/* Left Column: 1 Big Card (spans 2 columns on desktop) */}
                {bigItem && (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative w-full h-[400px] sm:h-[500px] md:h-[650px] lg:h-[750px] md:col-span-2 group overflow-hidden"
                    >
                        <Image
                            src={bigItem.image}
                            alt={bigItem.title || 'Bento Image'}
                            fill
                            priority
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover object-center transition-transform duration-1000 group-hover:scale-103"
                        />
                        
                        {/* Dark Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                        {/* Content */}
                        <div className="absolute bottom-8 left-8 right-8 md:bottom-12 md:left-12 md:right-12 z-10 flex flex-col items-start text-white">
                            {bigItem.sub_title && (
                                <span className="text-[11px] md:text-xs font-semibold tracking-[0.2em] font-outfit text-white/70 uppercase mb-2">
                                    {bigItem.sub_title}
                                </span>
                            )}
                            <h3 className="text-xl sm:text-2xl md:text-[34px] font-bold font-outfit text-white leading-tight mb-6 max-w-sm sm:max-w-md">
                                {bigItem.title}
                            </h3>
                            {bigItem.link && (
                                <Link 
                                    href={bigItem.link}
                                    className="bg-white hover:bg-[#5A0C3D] hover:text-white text-black font-outfit text-xs md:text-sm font-semibold px-6 py-2.5 md:px-8 md:py-3.5 rounded-full shadow-md transition-all duration-300 cursor-pointer select-none active:scale-95"
                                >
                                    Discover More
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Right Column: 2x2 Grid of Smaller Cards (spans 2 columns on desktop) */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 w-full">
                    {smallItems.map((item, index) => (
                        <motion.div 
                            key={item.id || index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: (index + 1) * 0.1 }}
                            className="relative w-full h-[280px] sm:h-[240px] md:h-[321px] lg:h-[371px] group overflow-hidden"
                        >
                            <Image
                                src={item.image}
                                alt={item.title || 'Bento Image'}
                                fill
                                sizes="(max-width: 768px) 100vw, 25vw"
                                className="object-cover object-center transition-transform duration-1000 group-hover:scale-103"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                            
                            <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col items-start text-white">
                                {item.sub_title && (
                                    <span className="text-[10px] font-semibold tracking-[0.15em] font-outfit text-white/70 uppercase mb-1">
                                        {item.sub_title}
                                    </span>
                                )}
                                <h4 className="text-sm md:text-lg font-bold font-outfit text-white leading-snug mb-3 max-w-[200px] sm:max-w-xs line-clamp-2">
                                    {item.title}
                                </h4>
                                {item.link && (
                                    <Link 
                                        href={item.link}
                                        className="bg-white hover:bg-[#5A0C3D] hover:text-white text-black font-outfit text-[10px] md:text-xs font-semibold px-4 py-2 rounded-full shadow-sm transition-all duration-300 cursor-pointer select-none"
                                    >
                                        Discover More
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default BentoImageGalleryOne;
