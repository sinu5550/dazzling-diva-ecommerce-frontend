'use client';

import Image from 'next/image';
import Link from "next/link";
import { FaLongArrowAltRight } from 'react-icons/fa';

const MidBannerOne = ({ midBannerData }) => {

  const banner = midBannerData?.find(card => card.category === 'saree');

  if (!banner) return null;

  return (
    <div className="grid grid-cols-1 gap-4 h-full mt-5 w-full">
      <div className="relative group flex-1 overflow-hidden transition-all duration-300">
        <Image
          src={banner.image}
          alt={banner.title}
          width={2000}
          height={800}
          className="transition-transform duration-700 group-hover:scale-105 w-full h-[300px] md:h-[400px] lg:h-[500px] xl:h-[600px] 2xl:h-[700px]"
          loading='lazy'
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/40 to-black/70"></div>

        {/* Bottom Fade */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent"></div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-10 lg:p-14">
          <div className="mb-[5%] lg:mr-[7%] ml-auto space-y-3 md:space-y-4 max-w-xl text-center">

            <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-5xl font-bold hasib_dev leading-tight mb-4 text-white drop-shadow-lg">
              {banner.title}
            </h2>

            {/* Decorative Line */}
            <div className="w-32 h-1 bg-white/80 rounded-full my-5 mx-auto"></div>

            {banner.sub_title && (
              <p className="text-base md:text-lg text-white/90 leading-relaxed max-w-md mx-auto drop-shadow-md">
                {banner.sub_title}
              </p>
            )}

            {banner.link && (
              <div className="pt-3 flex justify-center">
                <Link
                  href={banner.link}
                  className="mt-2 inline-flex items-center gap-2.5 px-7 py-2.5 lg:py-3 text-sm font-semibold border border-white bg-white text-gray-900 transition-all duration-300 hover:bg-transparent hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] cursor-pointer"
                >
                  Shop Now
                  <FaLongArrowAltRight size={16} />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Subtle Border Glow */}
        <div className="absolute inset-0 border border-white/10 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default MidBannerOne;
