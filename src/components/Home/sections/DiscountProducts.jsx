//home  --> discount componet
'use client'

import Link from "next/link";
import React, { useState, useEffect, useMemo } from "react";
import Container from "@/components/Container/Container";
import DiscountProductCard from "@/components/DiscountProduct/DiscountProductCard";
import { ArrowRight } from "lucide-react";
import QuickViewModal from "@/components/Modal/QuickViewModal";


const DiscountProducts = ({ productData = [], isLoading, user = null }) => {

    const [hoveredProductId, setHoveredProductId] = useState(null);
    const [isWishlistLoading, setIsWishlistLoading] = useState({});
    const [isCartLoading, setIsCartLoading] = useState({});
    const [nearestEndingCampaign, setNearestEndingCampaign] = useState(null);
    const [featuredCampaign, setFeaturedCampaign] = useState(null);
    const [campaignNames, setCampaignNames] = useState([]);
    const [campaignTypeCounts, setCampaignTypeCounts] = useState({});

    // Quick View Modal State
    const [selectedQuickViewProduct, setSelectedQuickViewProduct] = useState(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    // Countdown Timer State
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    // Memoize the first 4 products to prevent unnecessary recalculations
    const products = useMemo(() => productData.slice(0, 4), [productData]);

    // Memoize the campaign analysis logic
    const { processedCampaigns, campaignStats } = useMemo(() => {
        if (products.length === 0) return {
            processedCampaigns: [],
            campaignStats: {
                typeCounts: {},
                totalProducts: 0
            }
        };

        const campaignMap = new Map();
        const allCampaigns = [];
        const typeCounts = {};

        products.forEach((product) => {
            if (product.campaignInfo) {
                const campaignId = product.campaignInfo.campaignId;
                const campaignType = product.campaignInfo.campaignType;

                // Count campaign types
                typeCounts[campaignType] = (typeCounts[campaignType] || 0) + 1;

                // Add to campaign map if not exists
                if (!campaignMap.has(campaignId)) {
                    const campaign = {
                        id: campaignId,
                        name: product.campaignInfo.campaignName,
                        type: campaignType,
                        priority: product.campaignInfo.priority || 0,
                        endAt: product.campaignInfo.endAt,
                        showCountdown: product.campaignInfo.showCountdown,
                        discountValue: product.campaignInfo.discountValue,
                        badgeText: product.campaignInfo.badgeText,
                        badgeColor: product.campaignInfo.badgeColor
                    };
                    campaignMap.set(campaignId, campaign);
                    allCampaigns.push(campaign);
                }
            }
        });

        return {
            processedCampaigns: allCampaigns,
            campaignStats: {
                typeCounts,
                totalProducts: products.length
            }
        };
    }, [products]);

    useEffect(() => {
        if (processedCampaigns.length === 0) {
            setCampaignNames([]);
            setCampaignTypeCounts({});
            setFeaturedCampaign(null);
            setNearestEndingCampaign(null);
            return;
        }

        // Set unique campaign names
        const uniqueNames = processedCampaigns
            .map(c => c.name)
            .filter(name => name);
        setCampaignNames(uniqueNames);

        // Set campaign type counts
        setCampaignTypeCounts(campaignStats.typeCounts);

        // Find featured campaign (highest priority)
        const featured = processedCampaigns.reduce((prev, current) =>
            (prev.priority > current.priority) ? prev : current
        );
        setFeaturedCampaign(featured);

        // Find nearest ending campaign
        const campaignsWithEndDate = processedCampaigns
            .filter(c => c.endAt && c.showCountdown)
            .map(c => ({ ...c, endAt: new Date(c.endAt) }))
            .sort((a, b) => a.endAt - b.endAt);

        if (campaignsWithEndDate.length > 0) {
            setNearestEndingCampaign(campaignsWithEndDate[0]);
        } else {
            setNearestEndingCampaign(null);
        }
    }, [processedCampaigns, campaignStats.typeCounts]);

    // Local Countdown Timer logic
    useEffect(() => {
        if (!nearestEndingCampaign?.endAt) return;

        const calculateTimeLeft = () => {
            const now = new Date();
            const targetDate = new Date(nearestEndingCampaign.endAt);
            const difference = targetDate - now;

            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                };
            }

            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [nearestEndingCampaign]);

    // Display all products with campaigns (no filtering based on type)
    const displayedProducts = useMemo(() => {
        return products.slice(0, 10);
    }, [products]);

    const getMainCampaignName = () => {
        if (featuredCampaign?.name) return featuredCampaign.name;
        if (campaignNames.length === 1) return campaignNames[0];

        // Get the most frequent campaign type
        const mostFrequentType = Object.entries(campaignTypeCounts)
            .sort((a, b) => b[1] - a[1])[0];

        if (mostFrequentType) {
            const [type] = mostFrequentType;
            const typeLabels = {
                FlashDeal: "Flash Deals",
                SeasonalSale: "Seasonal Sale",
                CategorySale: "Category Sale",
                BulkDiscount: "Bulk Discounts",
                ClearanceSale: "Clearance Sale",
                NewArrival: "New Arrivals",
                BrandPromo: "Brand Promotions",
                DealsToday: "Today's Deals",
                SpicialOffer: "Special Offers"
            };
            return typeLabels[type] || `${type.replace(/([A-Z])/g, ' $1').trim()} Deals`;
        }

        if (campaignNames.length > 1) return "Hot Deals";
        return "Special Offers";
    };

    if (displayedProducts.length === 0) return null;

    const mainCampaignName = getMainCampaignName();
    
    // Split the campaign name for display layout:
    // If the campaign name has two words (e.g. "Summer Sale"), show "Summer" normally, and "Sale" inside the Subtract SVG.
    const campaignWords = mainCampaignName.trim().split(/\s+/);
    const word1 = campaignWords[0] || "Flash";
    const word2 = campaignWords.slice(1).join(" ") || "Deals";

    const discountValue = nearestEndingCampaign?.discountValue || processedCampaigns[0]?.discountValue || 10;

    const formatNumber = (num) => {
        return num < 10 ? `0${num}` : num.toString();
    };

    if (isLoading) {
        return (
            <section id="discount-products" className="py-12 bg-white">
                <Container>
                    <div className="py-8">Loading...</div>
                </Container>
            </section>
        );
    }

    return (
        <section
            id="discount-products"
            className="bg-white"
        >
            {/* Banner Header: Fixed height, background image, overlay text, and timer styling */}
            <div
                className="relative w-full h-[320px] sm:h-[350px] md:h-[380px] lg:h-[400px] bg-[#5A0C3D] flex items-center overflow-hidden mb-12"
                style={{
                    backgroundImage: "url('/assects/flashdeals-banner.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat"
                }}
            >
                {/* Responsive overlay filter */}
                <div className="absolute inset-0 bg-black/10 md:bg-transparent z-0" />

                <div className="w-full h-full max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 relative z-10">
                    {/* Centered details column on the left */}
                    <div className="md:col-span-7 lg:col-span-6 flex flex-col items-center justify-center text-center space-y-4 px-4">
                        
                        {/* Title with word split and Subtract SVG container */}
                        <div className="flex flex-wrap items-center justify-center gap-2.5 md:gap-3.5 text-2xl sm:text-3xl md:text-[36px] lg:text-[48px] font-bold text-white uppercase font-outfit">
                            <span>{word1}</span>
                            <div className="relative w-[110px] h-[52px] md:w-[130px] md:h-[60px] flex items-center justify-center px-1">
                                <img src="/assects/Subtract.svg" className="absolute inset-0 w-full h-full object-contain" alt="" />
                                <span className="relative z-10 text-[32px] md:text-[48px] text-[#5A0C3D] font-instrument_serif italic normal-case font-normal -mt-0.5 leading-none select-none">
                                    {word2}
                                </span>
                            </div>
                            <span>Live Now</span>
                        </div>

                        {/* White block timer exactly like figma image 1 */}
                        <div className="flex items-center gap-1.5 md:gap-3 text-white py-1">
                            {/* Days */}
                            <div className="flex flex-col items-center">
                                <div className="w-[50px] h-[45px] md:w-[65px] md:h-[55px] bg-white rounded-none flex items-center justify-center text-lg md:text-3xl font-bold text-[#5A0C3D] font-outfit shadow-sm">
                                    {formatNumber(timeLeft.days)}
                                </div>
                                <span className="text-[10px] md:text-xs mt-1.5 opacity-90 tracking-wide font-outfit font-light">Days</span>
                            </div>
                            
                            <span className="text-xl md:text-2xl font-bold mb-5">:</span>

                            {/* Hours */}
                            <div className="flex flex-col items-center">
                                <div className="w-[50px] h-[45px] md:w-[65px] md:h-[55px] bg-white rounded-none flex items-center justify-center text-lg md:text-3xl font-bold text-[#5A0C3D] font-outfit shadow-sm">
                                    {formatNumber(timeLeft.hours)}
                                </div>
                                <span className="text-[10px] md:text-xs mt-1.5 opacity-90 tracking-wide font-outfit font-light">Hours</span>
                            </div>

                            <span className="text-xl md:text-2xl font-bold mb-5">:</span>

                            {/* Minutes */}
                            <div className="flex flex-col items-center">
                                <div className="w-[50px] h-[45px] md:w-[65px] md:h-[55px] bg-white rounded-none flex items-center justify-center text-lg md:text-3xl font-bold text-[#5A0C3D] font-outfit shadow-sm">
                                    {formatNumber(timeLeft.minutes)}
                                </div>
                                <span className="text-[10px] md:text-xs mt-1.5 opacity-90 tracking-wide font-outfit font-light">Minutes</span>
                            </div>

                            <span className="text-xl md:text-2xl font-bold mb-5">:</span>

                            {/* Seconds */}
                            <div className="flex flex-col items-center">
                                <div className="w-[50px] h-[45px] md:w-[65px] md:h-[55px] bg-white rounded-none flex items-center justify-center text-lg md:text-3xl font-bold text-[#5A0C3D] font-outfit shadow-sm">
                                    {formatNumber(timeLeft.seconds)}
                                </div>
                                <span className="text-[10px] md:text-xs mt-1.5 opacity-90 tracking-wide font-outfit font-light">Sec</span>
                            </div>
                        </div>

                        {/* UP TO X% OFF Text */}
                        <div className="text-sm sm:text-base md:text-lg font-outfit font-semibold text-white tracking-widest uppercase">
                            UP TO <span className="text-[#CCFF00] font-bold">{discountValue}%</span> OFF
                        </div>

                        {/* Description Text */}
                        <div className="flex flex-col items-center text-xs md:text-sm text-white/90 font-outfit tracking-wide leading-relaxed font-light">
                            <p>Because Every Woman Deserves To Shine.</p>
                            <p>Grab It Before It's Gone!</p>
                        </div>
                    </div>

                    {/* Right empty column so text won't cover the model background image */}
                    <div className="hidden md:block md:col-span-5 lg:col-span-6" />
                </div>
            </div>

            {/* Campaign product list grid under the banner */}
            <Container>
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg md:text-2xl font-outfit font-semibold text-gray-800">
                            Deals Products
                        </h3>
                        <Link
                            href="/discount-campaigns"
                            className="inline-flex items-center text-sm font-medium text-[#5A0C3D] hover:text-[#450322] hover:underline transition-colors group cursor-pointer font-outfit"
                        >
                            View All
                            <ArrowRight className="ml-1 transition-transform group-hover:translate-x-1" size={16} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {displayedProducts.map((product) => {
                            // Calculate prices similar to ProductCard
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
                                    key={`${product.id}-${product.campaignInfo?.campaignId}`}
                                    product={product}
                                    user={user}
                                    isHovered={hoveredProductId === product.id}
                                    onMouseEnter={() => setHoveredProductId(product.id)}
                                    onMouseLeave={() => setHoveredProductId(null)}
                                    isWishlistLoading={isWishlistLoading[product.id]}
                                    isCartLoading={isCartLoading[product.id]}
                                    onWishlistToggle={(productId, isLoading) =>
                                        setIsWishlistLoading(prev => ({ ...prev, [productId]: isLoading }))
                                    }
                                    onCartToggle={(productId, isLoading) =>
                                        setIsCartLoading(prev => ({ ...prev, [productId]: isLoading }))
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


export default DiscountProducts;
