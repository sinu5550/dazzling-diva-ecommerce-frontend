'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/Container/Container';
import { motion } from 'framer-motion';

const HomeBento = () => {
    return (
        <section className="py-6 bg-white">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                    
                    {/* Bento Card 1: Three Pieces */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative w-full h-[320px] sm:h-[420px] md:h-[480px] lg:h-[680px] rounded-[12px] overflow-hidden group shadow-sm border border-gray-100"
                    >
                        {/* Background Image */}
                        <Image
                            src="/assects/bento-1.png"
                            alt="Timeless Elegance"
                            fill
                            priority
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover transition-transform duration-1000 group-hover:scale-103"
                        />

                        {/* Dark Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity duration-500" />

                        {/* Content Overlay */}
                        <div className="absolute bottom-8 left-8 right-8 md:bottom-12 md:left-12 md:right-12 z-10 flex flex-col items-start text-white">
                            <span className="text-xs md:text-sm font-semibold tracking-[0.2em] font-outfit text-white/80 uppercase mb-2">
                                Three Pieces
                            </span>
                            <h3 className="text-xl sm:text-2xl md:text-[34px] font-bold font-outfit text-white leading-tight mb-6 max-w-sm sm:max-w-md">
                                Timeless Elegance. Modern Comfort.
                            </h3>
                            <Link 
                                href="/products/category/Three%20Pices%20Collections"
                                className="bg-white hover:bg-[#5A0C3D] hover:text-white text-black font-outfit text-xs md:text-sm font-semibold px-6 py-2.5 md:px-8 md:py-3.5 rounded-full shadow-md transition-all duration-300 cursor-pointer select-none active:scale-95"
                            >
                                Discover More
                            </Link>
                        </div>
                    </motion.div>

                    {/* Bento Card 2: Wedding Sets */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="relative w-full h-[320px] sm:h-[420px] md:h-[480px] lg:h-[680px] rounded-[12px] overflow-hidden group shadow-sm border border-gray-100"
                    >
                        {/* Background Image */}
                        <Image
                            src="/assects/bento-2.png"
                            alt="Timeless Wedding Fashion"
                            fill
                            priority
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover transition-transform duration-1000 group-hover:scale-103"
                        />

                        {/* Dark Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity duration-500" />

                        {/* Content Overlay */}
                        <div className="absolute bottom-8 left-8 right-8 md:bottom-12 md:left-12 md:right-12 z-10 flex flex-col items-start text-white">
                            <span className="text-xs md:text-sm font-semibold tracking-[0.2em] font-outfit text-white/80 uppercase mb-2">
                                Wedding Sets
                            </span>
                            <h3 className="text-xl sm:text-2xl md:text-[34px] font-bold font-outfit text-white leading-tight mb-6 max-w-sm sm:max-w-md">
                                Timeless Wedding Fashion For Every Woman.
                            </h3>
                            <Link 
                                href="/products/category/Wedding%20Collections"
                                className="bg-white hover:bg-[#5A0C3D] hover:text-white text-black font-outfit text-xs md:text-sm font-semibold px-6 py-2.5 md:px-8 md:py-3.5 rounded-full shadow-md transition-all duration-300 cursor-pointer select-none active:scale-95"
                            >
                                Discover More
                            </Link>
                        </div>
                    </motion.div>

                </div>
            </Container>
        </section>
    );
};

export default HomeBento;
