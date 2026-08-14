// components/Home/sections/AllProductsSection.jsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Container from "@/components/Container/Container";
import DiscountProductCard from "@/components/DiscountProduct/DiscountProductCard";
import QuickViewModal from "@/components/Modal/QuickViewModal";

const AllProductsSection = ({ products = [], user = null }) => {
  const [selectedQuickViewProduct, setSelectedQuickViewProduct] =
    useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const [isWishlistLoading, setIsWishlistLoading] = useState({});
  const [isCartLoading, setIsCartLoading] = useState({});

  // Show 4 products on desktop (1 row 4 cards) and 4 products on mobile (2 rows 2 cards)
  const displayedProducts = products.slice(0, 4);

  if (!displayedProducts || displayedProducts.length === 0) return null;

  return (
    <section className="py-2 md:py-4 md:mt-[-16px] bg-white">
      <Container>
        {/* Section Heading */}
        <div className="flex flex-col items-center mb-8 space-y-2">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[16px] md:text-[18px] text-black font-normal font-outfit"
          >
            Explore Our Catalog
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[22px] md:text-2xl lg:text-[48px] font-normal text-black text-center font-outfit uppercase tracking-tight"
          >
            All Products
          </motion.h2>
          <div className="h-[1px] w-12 bg-stone-400 mt-2" />
        </div>

        {/* Products Grid: 4 cards on desktop (1 row 4 cols), 4 cards on mobile (1 row 2 cols = 2 rows 2 cols) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {displayedProducts.map((product) => {
            const originalPrice = parseFloat(product.price) || 0;
            const discountValue = product.campaignInfo?.discountValue || 0;
            const maxDiscount = product.campaignInfo?.maxDiscountAmount;

            let discountedPrice = originalPrice;
            let discountAmount = 0;

            if (discountValue > 0) {
              discountAmount = (originalPrice * discountValue) / 100;
              if (maxDiscount && discountAmount > maxDiscount) {
                discountAmount = maxDiscount;
                discountedPrice = originalPrice - maxDiscount;
              } else {
                discountedPrice = originalPrice - discountAmount;
              }
            }

            return (
              <DiscountProductCard
                key={`all-prod-${product.id}`}
                product={product}
                user={user}
                isHovered={hoveredProductId === product.id}
                onMouseEnter={() => setHoveredProductId(product.id)}
                onMouseLeave={() => setHoveredProductId(null)}
                isWishlistLoading={isWishlistLoading[product.id]}
                isCartLoading={isCartLoading[product.id]}
                onWishlistToggle={(productId, isLoading) =>
                  setIsWishlistLoading((prev) => ({
                    ...prev,
                    [productId]: isLoading,
                  }))
                }
                onCartToggle={(productId, isLoading) =>
                  setIsCartLoading((prev) => ({
                    ...prev,
                    [productId]: isLoading,
                  }))
                }
                discountedPrice={discountedPrice}
                discountAmount={discountAmount}
                originalPrice={originalPrice}
                onOpenQuickView={(prod) => {
                  setSelectedQuickViewProduct(prod);
                  setIsQuickViewOpen(true);
                }}
              />
            );
          })}
        </div>

        {/* View All Products Button */}
        <div className="text-center mt-8 md:mt-12">
          <Link href="/product">
            <button className="px-8 py-3 bg-[#5A0C3D] hover:bg-[#450322] text-white font-outfit text-sm font-semibold rounded-[8px] transition-all duration-300 cursor-pointer shadow-md select-none active:scale-95">
              View All Products
            </button>
          </Link>
        </div>
      </Container>

      {/* Quick View Modal */}
      <QuickViewModal
        product={selectedQuickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={() => {
          setIsQuickViewOpen(false);
          setSelectedQuickViewProduct(null);
        }}
        user={user}
      />
    </section>
  );
};

export default AllProductsSection;
