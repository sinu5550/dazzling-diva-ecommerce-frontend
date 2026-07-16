// components/Home/sections/Testimonials.jsx
"use client";

import { motion } from "framer-motion";
import Container from "@/components/Container/Container";
import { Star, Quote } from "lucide-react";
import { testimonials } from "@/data/testimonials";

export default function Testimonials() {
  // Only show the top 3 testimonials
  const activeTestimonials = testimonials.slice(0, 3);

  return (
    <section className="py-6 bg-white font-outfit overflow-hidden">
      <Container>
        {/* Heading */}
        <div className="flex flex-col items-center mb-8 space-y-2 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[18px] text-black font-normal font-outfit"
          >
            Diva Diaries
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl lg:text-[48px] font-normal text-black text-center font-outfit uppercase leading-tight"
          >
            What our lovely divas <br />are saying about us.
          </motion.h2>
          <div className="h-[1px] w-12 bg-stone-400 mt-2" />
        </div>
      </Container>

      {/* CSS Styles for Infinite Seamless Marquee */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes testimonial-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 12px)); }
        }
        .animate-testimonial-marquee {
          animation: testimonial-marquee 25s linear infinite;
        }
        .testimonial-marquee-wrapper:hover .animate-testimonial-marquee {
          animation-play-state: paused;
        }
      `}} />

      {/* Infinite Horizontal Auto-Scroll Container */}
      <div className="relative w-full overflow-hidden mt-8 select-none py-2 testimonial-marquee-wrapper">
        <div className="flex gap-6 w-max animate-testimonial-marquee px-4">
          
          {/* Set 1 */}
          {activeTestimonials.map((item) => (
            <div
              key={`set1-${item.id}`}
              className="w-[300px] sm:w-[380px] bg-white rounded-2xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden flex-shrink-0"
            >
              <Quote className="absolute right-4 top-4 w-12 h-12 text-[#5A0C3D]/5 pointer-events-none" />
              <div>
                <div className="flex items-center gap-0.5 mb-4 text-[#FDDA06]">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                  {[...Array(5 - item.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-gray-200" />
                  ))}
                </div>
                <p className="text-[14px] leading-relaxed text-gray-600 italic mb-6">
                  "{item.comment}"
                </p>
              </div>
              <div className="flex items-center gap-3.5 pt-4 mt-auto">
                <div className="w-10 h-10 rounded-full bg-[#5A0C3D]/10 flex items-center justify-center text-[#5A0C3D] text-sm font-semibold flex-shrink-0 select-none">
                  {item.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
                    {item.name}
                  </h4>
                  <span className="text-[11px] font-medium text-[#5A0C3D] bg-[#5A0C3D]/5 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {item.role}
                  </span>
                </div>
                <span className="ml-auto text-[10px] text-gray-400 whitespace-nowrap">
                  {item.date}
                </span>
              </div>
            </div>
          ))}

          {/* Set 2 (Duplicates for seamless infinite loop) */}
          {activeTestimonials.map((item) => (
            <div
              key={`set2-${item.id}`}
              className="w-[300px] sm:w-[380px] bg-white rounded-2xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative overflow-hidden flex-shrink-0"
            >
              <Quote className="absolute right-4 top-4 w-12 h-12 text-[#5A0C3D]/5 pointer-events-none" />
              <div>
                <div className="flex items-center gap-0.5 mb-4 text-[#FDDA06]">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                  {[...Array(5 - item.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-gray-200" />
                  ))}
                </div>
                <p className="text-[14px] leading-relaxed text-gray-600 italic mb-6">
                  "{item.comment}"
                </p>
              </div>
              <div className="flex items-center gap-3.5 pt-4 mt-auto">
                <div className="w-10 h-10 rounded-full bg-[#5A0C3D]/10 flex items-center justify-center text-[#5A0C3D] text-sm font-semibold flex-shrink-0 select-none">
                  {item.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
                    {item.name}
                  </h4>
                  <span className="text-[11px] font-medium text-[#5A0C3D] bg-[#5A0C3D]/5 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {item.role}
                  </span>
                </div>
                <span className="ml-auto text-[10px] text-gray-400 whitespace-nowrap">
                  {item.date}
                </span>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
