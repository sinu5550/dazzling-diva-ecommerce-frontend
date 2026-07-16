'use client';

import Image from 'next/image';
import Link from "next/link";
import { FaLongArrowAltRight } from 'react-icons/fa';

const MidBannerTwo = ({ midBannerData }) => {

    const banner = midBannerData?.find(card => card.category === 'threePices');

    if (!banner) return null;

    return (
        <div className="grid grid-cols-1 gap-4 h-full mt-5 w-full">
            <div className="relative group flex-1 overflow-hidden transition-all duration-300">
                <Image
                    src={banner.image}
                    alt={banner.title}
                    width={2000}
                    height={800}
                    className="transition-transform duration-700 group-hover:scale-105 w-full h-[250px] sm:h-[300px] md:h-[350px]  object-cover"
                    loading='lazy'
                />

                {/* Gradient Overlay (Centered Bottom Optimized) */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#5A0C3D]/85 via-[#5A0C3D]/40 to-[#5A0C3D]/10"></div>

                {/* Content (Center aligned at the bottom) */}
                <div className="absolute inset-0 flex flex-col justify-end items-center text-center p-6 md:p-10 lg:p-12">
                    <div className="flex flex-col items-center justify-center space-y-3 max-w-2xl mx-auto mb-8">
                        <h2 className="text-xl md:text-2xl lg:text-[34px] font-bold font-outfit leading-tight text-white drop-shadow-lg">
                            {banner.title}
                        </h2>
                        {banner.sub_title && (
                            <p className="text-xs md:text-sm text-white/80 leading-relaxed max-w-md drop-shadow-md">
                                {banner.sub_title}
                            </p>
                        )}

                        {banner.link && (
                            <div className="pt-2">
                                <Link
                                    href={banner.link}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs md:text-sm font-semibold border border-white bg-white text-gray-900 rounded-full transition-all duration-300 hover:bg-[#5A0C3D] hover:border-[#5A0C3D] hover:text-white cursor-pointer select-none active:scale-95 shadow-sm"
                                >
                                    Shop Now
                                    <FaLongArrowAltRight size={14} className="mt-0.5" />
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

export default MidBannerTwo;