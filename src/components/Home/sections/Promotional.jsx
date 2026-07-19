"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Container from "@/components/Container/Container";

const Promotional = ({ promoData }) => {
  const leftCard = promoData?.find((item) => item.position === "LEFT");
  const middleCard = promoData?.find((item) => item.position === "MIDDLE");
  const rightCard = promoData?.find((item) => item.position === "RIGHT");

  // Animation variants for the text titles and descriptions
  const textVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  // Hover animation variants for the hidden side buttons
  const buttonHoverVariants = {
    initial: {
      opacity: 0,
      y: 20,
      height: 0,
      marginTop: 0
    },
    hover: {
      opacity: 1,
      y: 0,
      height: "auto",
      marginTop: 12,
      transition: {
        duration: 0.4,
        ease: [0.25, 1, 0.5, 1] // Custom smooth ease-out curve
      }
    }
  };

  return (
    <Container>
      {/*Heading */}
      <div className="flex flex-col items-center mb-8 space-y-2">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs uppercase tracking-[0.3em] text-gray-400 font-medium"
        >
          Discover Timeless Elegance
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-2xl lg:text-[42px] font-bold text-gray-800  text-center tracking-wide"
        >
         Special Offers & Promotions
        </motion.h2>
        <div className="h-[1px] w-12 bg-stone-400 mt-2" />
      </div>
      <div className="w-full px-4 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 items-center">

          {/* ================= LEFT CARD (Street Collection) ================= */}
          {leftCard && (
            <motion.div
              initial="initial"
              whileInView="animate"
              whileHover="hover" // Triggers children variants named "hover"
              viewport={{ once: true }}
              className="relative h-[380px] md:h-[420px] lg:h-[460px] w-full overflow-hidden cursor-pointer group col-span-1"
            >
              <motion.div
                className="relative w-full h-full"
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
              >
                <Image
                  src={leftCard.image}
                  alt={leftCard.title}
                  fill
                  sizes="(max-w-768px) 100vw, 25vw"
                  className="object-cover brightness-[0.85] transition-all duration-500 group-hover:brightness-[0.75] group-hover:scale-105"
                  priority
                />
              </motion.div>
              <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent">
                <p className="text-secound text-sm font-semibold mb-2">
                  {leftCard.promo_batch || ""}
                </p>
                <motion.h3 variants={textVariants} className="text-white text-xl font-bold tracking-wide mb-1 ">
                  {leftCard.title}
                </motion.h3>
                <motion.p variants={textVariants} className="text-gray-300 text-xs tracking-wider">
                  {leftCard.description || ""}
                </motion.p>

                {/* Reveal on Hover Button */}
                <motion.div variants={buttonHoverVariants} className="overflow-hidden">
                  <Link
                    href={leftCard.link || "#"}
                    className="inline-block bg-white text-gray-900 font-semibold text-xs  tracking-widest px-6 py-2.5 transition-all duration-300 hover:bg-primary hover:text-white"
                  >
                    Shop Now
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ================= MIDDLE CARD (New Arrival - Center) ================= */}
          {middleCard && (
            <motion.div
              initial="initial"
              whileInView="animate"
              whileHover="hover"
              viewport={{ once: true }}
              className="relative h-[480px] md:h-[530px] lg:h-[580px] w-full overflow-hidden cursor-pointer group md:col-span-1 lg:col-span-2"
            >
              <motion.div
                className="relative w-full h-full"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
              >
                <Image
                  src={middleCard.image}
                  alt={middleCard.title}
                  fill
                  sizes="(max-w-768px) 100vw, 50vw"
                  className="object-cover brightness-[0.8] transition-all duration-500 group-hover:brightness-[0.7]"
                  priority
                />
              </motion.div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/10">
                <p className="text-secound text-sm font-semibold mb-2">
                  {leftCard.promo_batch || ""}
                </p>
                <motion.h2
                  variants={textVariants}
                  className="text-white text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight mb-3 "
                >
                  {middleCard.title}
                </motion.h2>
                <motion.p
                  variants={textVariants}
                  className="text-gray-200 text-sm md:text-base max-w-sm mb-6 font-light"
                >
                  {middleCard.description || "We always bring the best for our customers"}
                </motion.p>
                <motion.div variants={textVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href={middleCard.link || "#"}
                    className="inline-block bg-transparent text-white border border-white font-semibold text-xs md:text-sm tracking-widest px-8 py-3 transition-all duration-300 hover:bg-white hover:text-gray-900"
                  >
                    Shop Now
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ================= RIGHT CARD (Picnic Collection) ================= */}
          {rightCard && (
            <motion.div
              initial="initial"
              whileInView="animate"
              whileHover="hover" // Triggers children variants named "hover"
              viewport={{ once: true }}
              className="relative h-[380px] md:h-[420px] lg:h-[460px] w-full overflow-hidden  cursor-pointer group col-span-1"
            >
              <motion.div
                className="relative w-full h-full"
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
              >
                <Image
                  src={rightCard.image}
                  alt={rightCard.title}
                  fill
                  sizes="(max-w-768px) 100vw, 25vw"
                  className="object-cover brightness-[0.85] transition-all duration-500 group-hover:brightness-[0.75]  group-hover:scale-105"
                />
              </motion.div>
              <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent">
                <p className="text-secound text-sm font-semibold mb-2">
                  {leftCard.promo_batch || ""}
                </p>
                <motion.h3 variants={textVariants} className="text-white text-xl font-bold tracking-wide mb-1 ">
                  {rightCard.title}
                </motion.h3>
                <motion.p variants={textVariants} className="text-gray-300 text-xs tracking-wider">
                  {rightCard.description || ""}
                </motion.p>

                {/* Reveal on Hover Button */}
                <motion.div variants={buttonHoverVariants} className="overflow-hidden">
                  <Link
                    href={rightCard.link || "#"}
                    className="inline-block bg-white text-gray-900 font-semibold text-xs tracking-widest px-6 py-2.5 transition-all duration-300 hover:bg-primary hover:text-white"
                  >
                    Shop Now
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </Container>
  );
};

export default Promotional;
