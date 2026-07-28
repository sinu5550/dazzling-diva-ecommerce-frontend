// components/Home/sections/Testimonials.jsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Container from "@/components/Container/Container";
import { Star, Quote } from "lucide-react";
import { testimonials as staticTestimonials } from "@/data/testimonials";
import { apiClient } from "@/lib/apiClient";

// Helper to extract array from any API response structure
const extractTestimonialsList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.testimonials)) return res.testimonials;
  if (Array.isArray(res.data?.testimonials)) return res.data.testimonials;
  if (Array.isArray(res.data?.data)) return res.data.data;
  return [];
};

// Helper to normalize backend payload fields (name, image, rating, description) into expected UI format
const normalizeTestimonial = (item, index) => {
  const name = item.name || item.author || item.customerName || "Verified Diva";
  
  const getInitials = (str) => {
    if (!str) return "VD";
    const parts = str.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return str.slice(0, 2).toUpperCase();
  };

  // Support image URL string or object with url property
  const rawImage = typeof item.image === 'object' && item.image?.url ? item.image.url : (item.image || item.avatar || item.avatarUrl);
  const isImageAvatar = typeof rawImage === 'string' && (rawImage.startsWith('http') || rawImage.startsWith('/') || rawImage.startsWith('data:'));

  const parsedRating = Number(item.rating);
  const rating = !isNaN(parsedRating) && parsedRating > 0 ? Math.min(5, Math.max(1, Math.round(parsedRating))) : 5;

  return {
    id: item.id || item._id || index + 1,
    name,
    role: item.role || item.designation || "Verified Buyer",
    rating,
    comment: item.description || item.comment || item.review || item.content || "",
    date: item.date || (item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ""),
    avatar: isImageAvatar ? rawImage : (typeof rawImage === 'string' && rawImage.length <= 4 ? rawImage : getInitials(name)),
    isImageAvatar
  };
};

export default function Testimonials({ testimonialsData }) {
  const [list, setList] = useState(() => {
    const extracted = extractTestimonialsList(testimonialsData);
    return extracted.length > 0 ? extracted.map(normalizeTestimonial) : [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.seedTestimonials = async () => {
        const { seedTestimonials } = await import('@/lib/testimonials');
        const sampleData = [
          {
            name: "Ayesha Rahman",
            image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
            rating: 5,
            description: "The dress fits beautifully and the material is extremely premium! Exceeded my expectations. Will definitely buy again."
          },
          {
            name: "Farhana Islam",
            image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300",
            rating: 5,
            description: "Excellent customer service and very fast delivery. The sizing guide was 100% accurate and the quality is outstanding."
          },
          {
            name: "Sadia Chowdhury",
            image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300",
            rating: 5,
            description: "Dazzling Diva never disappoints! Every purchase has this premium luxury feel. Highly recommend this brand."
          },
          {
            name: "Mariya Sultana",
            image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=300",
            rating: 5,
            description: "Love the collections! The design is very chic and perfect for both casual and formal occasions. Shipping was very secure."
          }
        ];
        console.log("[Testimonials] Seeding sample data using apiClient...");
        const results = await seedTestimonials(sampleData);
        console.log("[Testimonials] Seed results:", results);
        window.location.reload();
        return results;
      };
    }

    if (list.length > 0) return;

    apiClient("/api/testimonials")
      .then((res) => {
        const extracted = extractTestimonialsList(res);
        if (extracted.length > 0) {
          setList(extracted.map(normalizeTestimonial));
        }
      })
      .catch((err) => {
        console.warn("[Testimonials] Error fetching /api/testimonials:", err?.message || err);
      });
  }, [list.length]);

  // Use static fallback if API returned no data
  const rawActive = list.length > 0 ? list : staticTestimonials.map(normalizeTestimonial);

  // Duplicate items as needed to ensure smooth infinite marquee scroll
  let activeTestimonials = [...rawActive];
  while (activeTestimonials.length > 0 && activeTestimonials.length < 6) {
    activeTestimonials = [...activeTestimonials, ...rawActive];
  }

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
          {activeTestimonials.map((item, index) => (
            <div
              key={`set1-${item.id}-${index}`}
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
                <div className="w-10 h-10 rounded-full bg-[#5A0C3D]/10 flex items-center justify-center text-[#5A0C3D] text-sm font-semibold flex-shrink-0 select-none overflow-hidden">
                  {item.isImageAvatar ? (
                    <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    item.avatar
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
                    {item.name}
                  </h4>
                  <span className="text-[11px] font-medium text-[#5A0C3D] bg-[#5A0C3D]/5 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {item.role}
                  </span>
                </div>
                {item.date && (
                  <span className="ml-auto text-[10px] text-gray-400 whitespace-nowrap">
                    {item.date}
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Set 2 (Duplicates for seamless infinite loop) */}
          {activeTestimonials.map((item, index) => (
            <div
              key={`set2-${item.id}-${index}`}
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
                <div className="w-10 h-10 rounded-full bg-[#5A0C3D]/10 flex items-center justify-center text-[#5A0C3D] text-sm font-semibold flex-shrink-0 select-none overflow-hidden">
                  {item.isImageAvatar ? (
                    <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    item.avatar
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
                    {item.name}
                  </h4>
                  <span className="text-[11px] font-medium text-[#5A0C3D] bg-[#5A0C3D]/5 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {item.role}
                  </span>
                </div>
                {item.date && (
                  <span className="ml-auto text-[10px] text-gray-400 whitespace-nowrap">
                    {item.date}
                  </span>
                )}
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
