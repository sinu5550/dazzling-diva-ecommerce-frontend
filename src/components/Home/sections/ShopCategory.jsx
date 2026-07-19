"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Container from "@/components/Container/Container";
import Image from "next/image";
import CategorySkeletonLoading from "@/components/Skeleton/CategorySkeletonLoading";
import { HiArrowLongLeft, HiArrowLongRight } from "react-icons/hi2";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Category = ({ data }) => {

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(null);

  // Touch scroll state for mobile gestures
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

  // Encode Category Name
  const encodeCategory = (name) => encodeURIComponent(name);

  // Responsive Items
  useEffect(() => {
    const handleResize = () => {
      let items = 2;

      if (window.innerWidth >= 1024) {
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
          <CategorySkeletonLoading itemsCount={4} />
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

  // Helper to generate Explore link text to match the design in the image
  const getExploreText = (name) => {
    if (name.toLowerCase().includes("wedding")) {
      return "Explore All Wedding Collection";
    }
    return `Explore All ${name.replace(/Collections?/gi, "").trim()}`;
  };

  return (
    <section className="overflow-hidden py-12 pt-4">
      <Container>
        {/*Heading */}
        <div className="flex flex-col items-center mb-10 space-y-1">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[18px] font-outfit font-normal text-black text-center tracking-wide"
          >
            Shop By Category
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[32px] md:text-[48px] uppercase text-black font-normal tracking-wide text-center"
          >
            Find your Perfect Style
          </motion.h2>
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
                rounded-full !bg-white shadow-lg border border-gray-200
                flex items-center justify-center
                opacity-0 invisible
                group-hover:opacity-100 group-hover:visible
                hover:bg-primary text-stone-500 hover:text-white
                transition-all duration-300 cursor-pointer
              "
            >
              <ChevronLeft className="text-sm lg:text-base text-[#5A0C3D]" />

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
                rounded-full !bg-white shadow-lg border border-gray-200
                flex items-center justify-center
                opacity-0 invisible
                group-hover:opacity-100 group-hover:visible
                hover:bg-primary text-stone-500 hover:text-white
                transition-all duration-300 cursor-pointer
              "
            >
              <ChevronRight className="text-sm lg:text-base text-[#5A0C3D]" />
            </button>
          )}

          {/* Slider */}
          <div 
            className="overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
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
                  className="flex-shrink-0 px-2"
                  style={{ width: `${100 / itemsPerPage}%` }}
                >
                  <Link
                    href={`/products/category/${encodeCategory(
                      category.name
                    )}`}
                    className="group/card block"
                  >
                    {/* Card */}
                    <div className="relative h-[340px] md:h-[420px] xl:h-[480px] rounded-[12px] overflow-hidden bg-gray-200">
                      {/* Image */}
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        priority
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="
                          object-cover
                          transition-transform duration-700
                          group-hover/card:scale-105
                        "
                      />

                      {/* Gradient Overlay */}
                      <div
                        className="
                          absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent
                          transition-all duration-500
                        "
                      />

                      {/* Text details overlay at the bottom left */}
                      <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col items-start gap-2">
                        <h3 className="text-lg md:text-[26px] font-outfit font-semibold text-white tracking-wide leading-tight">
                          {category.name}
                        </h3>
                        <span className="text-[12px] md:text-[14px] font-outfit font-light tracking-wide flex items-center gap-1 opacity-90 group-hover/card:opacity-100 group-hover/card:translate-x-1 transition-all duration-300">
                          {getExploreText(category.name)} &rarr;
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Navigation Arrows (Bottom of section) */}
          {maxIndex > 0 && (
            <div className="flex md:hidden justify-center items-center gap-6 mt-6">
              <button
                onClick={prevSlide}
                aria-label="Previous categories"
                className="w-10 h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-[#5A0C3D] hover:bg-[#5A0C3D] hover:text-white transition-all cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextSlide}
                aria-label="Next categories"
                className="w-10 h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-[#5A0C3D] hover:bg-[#5A0C3D] hover:text-white transition-all cursor-pointer"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default Category;
