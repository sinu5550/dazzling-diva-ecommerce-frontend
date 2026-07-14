"use client";

import { useState } from "react";
import NewProductCard from "@/components/NewArrival/NewProductCard";
import { motion } from "framer-motion";
import Container from "@/components/Container/Container";
import QuickViewModal from "@/components/Modal/QuickViewModal";

export const NewArrivalProducts = ({ newProductData }) => {
  const [selectedQuickViewProduct, setSelectedQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

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
            className="text-[18px]   text-black font-normal font-outfit"
          >
            New Arrivals
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl lg:text-[48px] font-normal text-black text-center font-outfit uppercase"
          >
            The latest styles <br />you'll love.
          </motion.h2>
          <div className="h-[1px] w-12 bg-stone-400 mt-2" />
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {newArrivalProductsData.slice(0, 8).map((product) => (
            <NewProductCard 
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
        {newArrivalProductsData?.length > 8 && (
          <div className="text-center mt-8 md:mt-12">
            <button className="px-8 py-3 bg-[#5A0C3D] hover:bg-[#5A0C3D]/90 text-white font-outfit text-sm font-semibold rounded-[8px] transition-all duration-300 cursor-pointer shadow-md select-none active:scale-95">
              View All New Products
            </button>
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

export default NewArrivalProducts;
