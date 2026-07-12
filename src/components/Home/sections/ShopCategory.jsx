"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Container from "@/components/Container/Container";
import Image from "next/image";
import CategorySkeletonLoading from "@/components/Skeleton/CategorySkeletonLoading";
import { HiArrowLongLeft, HiArrowLongRight } from "react-icons/hi2";
import { motion } from "framer-motion";

const Category = ({ data }) => {

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(null);

  // Encode Category Name
  const encodeCategory = (name) => encodeURIComponent(name);

  // Responsive Items
  useEffect(() => {
    const handleResize = () => {
      let items = 2;

      if (window.innerWidth >= 1536) {
        items = 5;
      } else if (window.innerWidth >= 1280) {
        items = 5;
      } else if (window.innerWidth >= 1024) {
        items = 4;
      } else if (window.innerWidth >= 768) {
        items = 3;
      } else {
        items = 2;
      }

      setItemsPerPage(items);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Loading State
  if (itemsPerPage === null || !data || data.length === 0) {
    return (
      <Container>
        <div className="py-16 bg-[#F7F7F7]">
          <CategorySkeletonLoading itemsCount={5} />
        </div>
      </Container>
    );
  }

  // Max Slide Index
  const maxIndex = Math.max(0, data.length - itemsPerPage);

  // Next Slide
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  };

  // Previous Slide
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  };

  return (
    <section className="overflow-hidden">
      <Container>
        {/*Heading */}
        <div className="flex flex-col items-center mb-8 space-y-2">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs uppercase tracking-[0.3em] text-gray-400 font-medium"
          >
             Discover Styles for Every Occasion
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl lg:text-[42px] font-bold text-gray-800  text-center tracking-wide"
          >
            Shop by Category
          </motion.h2>
          <div className="h-[1px] w-12 bg-stone-400 mt-2" />
        </div>

        {/* Slider Wrapper */}
        <div className="relative group">
          {/* Left Arrow */}
          {maxIndex > 0 && (
            <button
              onClick={prevSlide}
              aria-label="Previous categories"
              className="
                absolute left-2 lg:-left-5 top-1/2 -translate-y-1/2 z-20
                w-10 h-10 lg:w-12 lg:h-12
                rounded-full bg-white shadow-lg border border-gray-200
                flex items-center justify-center
                opacity-0 invisible
                group-hover:opacity-100 group-hover:visible
                hover:bg-primary text-stone-500 hover:text-white
                transition-all duration-300 cursor-pointer
              "
            >
              <HiArrowLongLeft className="text-sm lg:text-base" />
            </button>
          )}

          {/* Right Arrow */}
          {maxIndex > 0 && (
            <button
              onClick={nextSlide}
              aria-label="Next categories"
              className="
                absolute right-2 lg:-right-5 top-1/2 -translate-y-1/2 z-20
                w-10 h-10 lg:w-12 lg:h-12
                rounded-full bg-white shadow-lg border border-gray-200
                flex items-center justify-center

                opacity-0 invisible
                group-hover:opacity-100 group-hover:visible

                hover:bg-primary text-stone-500 hover:text-white
                transition-all duration-300 cursor-pointer
              "
            >
              <HiArrowLongRight className="text-sm lg:text-base" />
            </button>
          )}

          {/* Slider */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerPage)
                  }%)`,
              }}
            >
              {data.map((category) => (
                <div
                  key={category.id}
                  className="flex-shrink-0 px-3"
                  style={{ width: `${100 / itemsPerPage}%` }}
                >
                  <Link
                    href={`/products/category/${encodeCategory(
                      category.name
                    )}`}
                    className="group/card block"
                  >
                    {/* Card */}
                    <div className="relative h-[280px] md:h-[360px] xl:h-[420px] overflow-hidden bg-gray-200">
                      {/* Image */}
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        priority
                        sizes="100vw"
                        className="
                          object-cover
                          transition-transform duration-700
                          group-hover/card:scale-110
                        "
                      />

                      {/* Overlay */}
                      <div
                        className="
                          absolute inset-0 bg-black/10
                          group-hover/card:bg-black/20
                          transition-all duration-500
                        "
                      />

                      {/* Bottom Category Box */}
                      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 w-[80%]">
                        <div
                          className="
                            bg-white text-center py-4 px-4 shadow-lg
                            group-hover/card:bg-primary
                            transition-all duration-300
                          "
                        >
                          <h3
                            className=" text-sm md:text-lg font-semibold text-[#16313D] group-hover/card:text-white transition-colors duration-300">
                            {category.name}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Category;