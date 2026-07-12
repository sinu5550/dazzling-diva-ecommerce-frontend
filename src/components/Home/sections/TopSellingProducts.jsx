'use client'

import React, { useMemo } from 'react';
import { motion } from "framer-motion";
import Container from '@/components/Container/Container';
import ProductCard from '@/components/Products/ProductCard';

export const TopSellingProducts = ({ topSellingProductData }) => {

    const topSellingProducts = topSellingProductData?.products || [];

// Top top logic:
  

    return (
        <section>
            <Container>
                {/*Heading */}
                <div className="flex flex-col items-center mb-8 space-y-2">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-xs uppercase tracking-[0.3em] text-gray-400 font-medium"
                    >
                        Top Selling
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl lg:text-[42px] font-bold text-gray-800  text-center tracking-wide"
                    >
                       Top Trending Products
                    </motion.h2>
                    <div className="h-[1px] w-12 bg-stone-400 mt-2" />
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-10 xl:gap-6">
                    {topSellingProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                        />
                    ))}
                </div>

                {/* View All Button (Optional) */}
                {topSellingProducts.length > 6 && (
                    <div className="text-center mt-8 md:mt-12">
                        <button className="px-6 py-2 border border-secound text-secound hover:bg-secound hover:text-white transition-all duration-300 rounded-md font-medium text-sm">
                            View All Top Selling Products
                        </button>
                    </div>
                )}
            </Container>
        </section>
    );
};



export default TopSellingProducts;