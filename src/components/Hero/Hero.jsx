'use client';

import Image from 'next/image';
import HeroSlider from './Slider';
import ShipingProcess from "../Home/sections/ShipingProcess";
import Link from "next/link";

const Hero = ({ heroSliderData, cardData }) => {


    const topRightCard1 = cardData.find(card => card.category === 'top-right-card1');
    const topRightCard2 = cardData.find(card => card.category === 'top-right-card2');
    const bottomCard1 = cardData.find(card => card.category === 'bottom-card1');
    const bottomCard2 = cardData.find(card => card.category === 'bottom-card2');
    const bottomCard3 = cardData.find(card => card.category === 'bottom-card3');

    return (
        <div className="grid grid-cols-1 gap-4 h-full mt-5">
            {/* Top Section */}
            <div className="lg:flex gap-1 h-full min-h-[800px] w-full">
                {/* Slider */}
                <div className="h-64 lg:h-full overflow-hidden lg:w-[55%]">
                    <HeroSlider heroSliderData={heroSliderData} />
                </div>

                {/* Right Cards */}
                <div className="flex flex-col h-96 lg:h-full gap-[1px] lg:w-[45%]">
                    {/* Top Right Card 1 */}
                    {topRightCard1 && (
                        <div className="relative group flex-1 overflow-hidden transition-all duration-300">
                            <Image
                                src={topRightCard1.image}
                                alt={topRightCard1.title}
                                fill
                                unoptimized
                                className="transition-transform duration-700 group-hover:scale-110"
                                l
                            />
                            <div className="absolute inset-0 flex flex-col justify-end p-6 text-gray-800">
                                <div className="mb-[5%]  lg:ml-[7%] space-y-3">
                                    <p className="text-sm opacity-90">{topRightCard1.sub_title}</p>
                                    <h2 className="text-xl lg:text-2xl xl:text-3xl w-4/5 font-bold font-philosopher leading-tight mb-5">
                                        {topRightCard1.title}
                                    </h2>
                                    <Link
                                        href={topRightCard1.link}
                                        className="mt-2 bg-white text-gray-900 px-5 py-1.5 lg:py-2.5  text-sm font-semibold transition-all duration-300 hover:bg-transparent  border border-white hover:border-gray-800 cursor-pointer">
                                        Shop Now
                                    </Link >
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Top Right Card 2 */}
                    {topRightCard2 && (
                        <div className="relative group flex-1 overflow-hidden transition-all duration-300">
                            <Image
                                src={topRightCard2.image}
                                alt={topRightCard2.title}
                                fill
                                unoptimized
                                className="transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                                <div className="mb-[5%] lg:ml-[7%]  space-y-3">
                                    <p className="text-sm opacity-90">{topRightCard2.sub_title}</p>
                                    <h2 className="text-xl lg:text-2xl xl:text-3xl w-4/5 font-bold font-philosopher leading-tight mb-5">
                                        {topRightCard2.title}
                                    </h2>
                                    <Link
                                        href={topRightCard2.link}
                                        className="mt-2 bg-white text-gray-900 px-5 py-1.5 lg:py-2.5 rounded-md text-sm font-semibold transition-all duration-300 hover:bg-transparent hover:text-white border border-white cursor-pointer">
                                        Shop Now
                                    </Link >
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[60vh] lg:h-[30vh] min-h-[300px]">
                {/* Left Bottom Card */}
                <div className="h-full">
                    {bottomCard1 && (
                        <div className="relative group h-full overflow-hidden transition-all duration-300">
                            <Image
                                src={bottomCard1.image}
                                alt={bottomCard1.title}
                                fill
                                unoptimized
                                className="transition-transform duration-700 group-hover:scale-105" // Fixed typo
                            />
                            <div className="absolute inset-0 flex flex-col justify-end p-6 text-gray-800">
                                <div className="mb-10 lg:ml-[13%] space-y-3">
                                    <p className="text-sm lg:text-md">{bottomCard1.sub_title}</p>
                                    <h2 className="text-2xl lg:text-3xl xl:text-4xl w-3/5 font-bold font-philosopher leading-tight mb-5">
                                        {bottomCard1.title}
                                    </h2>
                                    <Link
                                        href={bottomCard1.link}
                                        className="mt-2 bg-white text-gray-900 px-6 py-1.5 lg:py-3 rounded-md text-sm font-semibold transition-all duration-300 hover:bg-transparent border border-white hover:border-gray-800 cursor-pointer">
                                        Shop Now
                                    </Link >
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side: Two Cards */}
                <div className="grid grid-cols-2 gap-4 h-full">
                    {/* Bottom Card 2 */}
                    <div className="h-full">
                        {bottomCard2 && (
                            <div className="relative group h-full overflow-hidden transition-all duration-300">
                                <Image
                                    src={bottomCard2.image}
                                    alt={bottomCard2.title}
                                    fill
                                    unoptimized
                                    className="transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 flex flex-col justify-start items-center p-5 text-white text-center space-y-1">
                                    <p className="text-sm lg:text-md opacity-90 px-2">{bottomCard2.sub_title}</p>
                                    <h2 className="text-2xl lg:text-4xl font-bold font-philosopher">{bottomCard2.title}</h2>
                                    <Link
                                        href={bottomCard2.link}
                                        className="text-sm font-semibold text-gray-100 underline hover:text-white transition cursor-pointer">
                                        Shop Now
                                    </Link >
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Card 3 */}
                    <div className="h-full">
                        {bottomCard3 && (
                            <div className="relative group h-full overflow-hidden transition-all duration-300">
                                <Image
                                    src={bottomCard3.image}
                                    alt={bottomCard3.title}
                                    fill
                                    unoptimized
                                    className="transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 flex flex-col justify-end items-center p-5 text-white text-center space-y-1">
                                    <p className="text-sm lg:text-md text-gray-900">{bottomCard3.sub_title}</p>
                                    <h2 className="text-2xl lg:text-4xl font-bold font-philosopher text-gray-900">{bottomCard3.title}</h2>
                                    <Link
                                        href={bottomCard3.link}
                                        className="text-sm font-semibold text-gray-900 underline hover:text-gray-700 transition cursor-pointer">
                                        Shop Now
                                    </Link >
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ShipingProcess />
        </div>
    );
};

export default Hero;
