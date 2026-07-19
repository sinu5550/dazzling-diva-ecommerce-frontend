'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Container from '@/components/Container/Container';
import TopSellingCard from '@/components/Products/TopSellingCard';
import QuickViewModal from '@/components/Modal/QuickViewModal';
import Link from 'next/link';

export const TopSellingProducts = ({ topSellingProductData }) => {
    const [selectedQuickViewProduct, setSelectedQuickViewProduct] = useState(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    const topSellingProducts = topSellingProductData?.products || [];

    if (topSellingProducts.length === 0) return null;

    // Show only 3 cards in the container
    const displayedProducts = topSellingProducts.slice(0, 3);

    return (
        <section className="py-6">
            <Container>
                {/* Heading */}
                <div className="flex flex-col items-center mb-8 space-y-2">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-[18px] text-black font-normal font-outfit"
                    >
                        Most Loved Collection
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl lg:text-[48px] font-normal text-black text-center font-outfit uppercase"
                    >
                       Shop the styles our customers <br />can't get enough of.
                    </motion.h2>
                    <div className="h-[1px] w-12 bg-stone-400 mt-2" />
                </div>

                {/* Products Grid (Only 3 cards on desktop consuming full container width) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {displayedProducts.map((product) => (
                        <TopSellingCard
                            key={product.id}
                            product={product}
                            onOpenQuickView={(prod) => {
                                setSelectedQuickViewProduct(prod);
                                setIsQuickViewOpen(true);
                            }}
                        />
                    ))}
                </div>

                {/* View All Button */}
                {topSellingProducts.length > 3 && (
                    <div className="text-center mt-8 md:mt-12">
                        <Link href="/product">
                            <button className="px-8 py-3 bg-[#5A0C3D] hover:bg-[#5A0C3D]/90 text-white font-outfit text-sm font-semibold rounded-[8px] transition-all duration-300 cursor-pointer shadow-md select-none active:scale-95">
                                View All Top Selling Products
                            </button>
                        </Link>
                    </div>
                )}
            </Container>

            {/* Quick View Modal */}
            <QuickViewModal
                product={selectedQuickViewProduct}
                isOpen={isQuickViewOpen}
                onClose={() => {
                    setIsQuickViewOpen(false);
                    setSelectedQuickViewProduct(null);
                }}
            />
        </section>
    );
};

export default TopSellingProducts;