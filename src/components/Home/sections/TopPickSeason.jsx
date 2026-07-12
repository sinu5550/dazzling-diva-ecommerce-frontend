'use client';

import Container from "@/components/Container/Container";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";

const TopPickSeason = ({ topPickData }) => {
  const data = topPickData?.data || [];

  // Grid entry animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.215, 0.610, 0.355, 1.000] } 
    },
  };

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
            Signature Selections
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl lg:text-[42px] font-bold text-gray-800  text-center tracking-wide"
          >
             Discover Timeless Elegance
          </motion.h2>
          <div className="h-[1px] w-12 bg-stone-400 mt-2" />
        </div>

        {/* Product Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-10 lg:gap-x-6 lg:gap-y-14"
        >
          {data.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              whileHover="hover" 
              className="group cursor-pointer rounded-none"
            >
              <Link href={item.link} className="block">
                {/* Image Container with Sharp Edges */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 rounded-none">
                  
                  {/* Subtle Darkening Overlay */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                  
                  {/* ANIMATED INNER LINE FRAME */}
                  <motion.div 
                    variants={{
                      hover: { scaleX: 0.94, scaleY: 0.94 }
                    }}
                    transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                    className="absolute inset-0 border border-white pointer-events-none z-20 scale-105 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />

                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                  />
                  
                  {/* Premium Text */}
                  <div className="absolute bottom-6 left-0 right-0 text-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-400 z-20">
                    <span className="text-[10px] text-white tracking-[0.2em] uppercase font-bold bg-primary hover:bg-secound px-4 py-2">
                      Quick View
                    </span>
                  </div>
                </div>

                {/* Typography details */}
                <div className="mt-4 overflow-hidden">
                  <motion.h4 
                    variants={{
                      hover: { y: -2 }
                    }}
                    transition={{ duration: 0.3 }}
                    className="text-xs lg:text-sm font-medium text-gray-800 tracking-wide line-clamp-1 uppercase"
                  >
                    {item.title}
                  </motion.h4>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
};

export default TopPickSeason;