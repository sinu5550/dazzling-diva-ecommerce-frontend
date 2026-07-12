'use client'

import NewProductCard from '@/components/NewArrival/NewProductCard';
import { motion } from "framer-motion";
import Container from '@/components/Container/Container';

export const NewArrivalProducts = ({ newProductData }) => {

    const newArrivalProductsData = newProductData?.data.products || [];

    // Show nothing if no new products
    if (newArrivalProductsData.length === 0) {
        return null;
    }

    return (
        <section>
            <Container>
                {/*Heading */}
                <div className="flex flex-col items-center mb-5 space-y-2">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-xs uppercase tracking-[0.3em] text-gray-400 font-medium"
                    >
                        New In
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl lg:text-[42px] font-bold text-gray-800  text-center tracking-wide"
                    >
                        New Arrivals Products
                    </motion.h2>
                    <div className="h-[1px] w-12 bg-stone-400 mt-2" />
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-10 xl:gap-6">
                    {newArrivalProductsData?.map((product) => (
                        <NewProductCard
                            key={product.id}
                            product={product}
                        />
                    ))}
                </div>

                {/* View All Button (Optional) */}
                {newArrivalProductsData?.length > 6 && (
                    <div className="text-center mt-8 md:mt-12">
                        <button className="px-6 py-2 border border-secound text-secound hover:bg-secound hover:text-white transition-all duration-300 rounded-md font-medium text-sm">
                            View All New Arrivals
                        </button>
                    </div>
                )}
            </Container>
        </section>
    );
};

export default NewArrivalProducts;