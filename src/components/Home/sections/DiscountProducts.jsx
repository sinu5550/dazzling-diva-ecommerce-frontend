//home  --> discount componet
'use client'

import Link from "next/link";
import React, { useState, useEffect, useMemo } from "react";
import Container from "@/components/Container/Container";
import CountdownTimer from "@/components/CountdownTimer/CountdownTimer";
import DiscountProductCard from "@/components/DiscountProduct/DiscountProductCard";
import { ArrowRight } from "lucide-react";


const DiscountProducts = ({ productData = [], isLoading, user = null }) => {

    const [hoveredProductId, setHoveredProductId] = useState(null);
    const [isWishlistLoading, setIsWishlistLoading] = useState({});
    const [isCartLoading, setIsCartLoading] = useState({});
    const [nearestEndingCampaign, setNearestEndingCampaign] = useState(null);
    const [featuredCampaign, setFeaturedCampaign] = useState(null);
    const [campaignNames, setCampaignNames] = useState([]);
    const [campaignTypeCounts, setCampaignTypeCounts] = useState({});

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

    const getSubHeading = () => {
        if (campaignNames.length === 0) return "Limited time offers. Don't miss out!";

        if (campaignNames.length === 1) {
            const discountValue = processedCampaigns[0]?.discountValue;
            if (discountValue) return `Up to ${discountValue}% OFF! Limited time offer.`;
            return "Exclusive deals. Shop now!";
        }

        // Create a descriptive subheading based on campaign types
        const typeDescriptions = Object.entries(campaignTypeCounts)
            .map(([type, count]) => {
                const typeLabels = {
                    FlashDeal: "Flash Deals",
                    SeasonalSale: "Seasonal Sales",
                    CategorySale: "Category Sales",
                    BulkDiscount: "Bulk Discounts",
                    ClearanceSale: "Clearance Items",
                    NewArrival: "New Arrivals",
                    BrandPromo: "Brand Promotions",
                    DealsToday: "Today's Deals",
                    SpicialOffer: "Special Offers"
                };
                return `${count} ${typeLabels[type] || type}`;
            })
            .join(", ");

        return `${typeDescriptions} available!`;
    };

    if (displayedProducts.length === 0) return null;

    const mainCampaignName = getMainCampaignName();
    const subHeading = getSubHeading();


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
            className=" bg-white">
            <Container>
                <div>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-10">
                        <div className="text-center md:text-left mb-6 md:mb-0">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-3xl md:text-4xl lg:text-[42px] font-bold text-gray-800 font-philosopher">
                                    {mainCampaignName}
                                </h2>

                                {featuredCampaign?.badgeText && (
                                    <span
                                        className="text-sm font-bold px-3 py-1.5 rounded"
                                        style={{
                                            backgroundColor: featuredCampaign.badgeColor || '#dc2626',
                                            color: '#ffffff'
                                        }}
                                    >
                                        {featuredCampaign.badgeText}
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-600 mt-2">{subHeading}</p>
                        </div>

                        <div className="flex flex-col items-center md:items-end">
                            <div className="mb-4">
                                {nearestEndingCampaign ? (
                                    <div className="flex flex-col items-center md:items-end">
                                        <div className="flex items-center gap-2">
                                            <CountdownTimer endDate={nearestEndingCampaign.endAt} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center md:items-end">
                                        <span className="text-sm text-gray-500 mb-1">Status</span>
                                        <div className="text-lg font-bold text-green-600">Ongoing</div>
                                    </div>
                                )}
                            </div>

                            <Link
                                href="/discount-campaigns"
                                className="hidden lg:inline-flex items-center text-sm font-medium text-secound hover:text-secound-hover hover:underline transition-colors group cursor-pointer"
                            >
                                View All
                                <ArrowRight className="ml-1 transition-transform group-hover:translate-x-1" size={16} />
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-10 xl:gap-6">
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
                                />
                            );
                        })}
                    </div>
                </div>
            </Container>
        </section>
    );
};


export default DiscountProducts;