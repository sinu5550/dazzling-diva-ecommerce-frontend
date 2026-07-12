// components/DiscountProduct/DiscountProductClient.jsx
'use client'

import React, { useState, useEffect } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import Container from "../Container/Container";
import CountdownTimer from "../CountdownTimer/CountdownTimer";
import SkeletonLoader from "../Skeleton/SkeletonLoader";
import DiscountProductCard from "./DiscountProductCard";
import { getDefaultVariant } from '@/lib/variantHelpers';

const DiscountProductClient = ({ products = [], user = null, isLoading: initialLoading = false }) => {

    const [hoveredProductId, setHoveredProductId] = useState(null);
    const [isWishlistLoading, setIsWishlistLoading] = useState({});
    const [isCartLoading, setIsCartLoading] = useState({});
    const [nearestEndingCampaign, setNearestEndingCampaign] = useState(null);
    const [featuredCampaign, setFeaturedCampaign] = useState(null);
    const [campaignNames, setCampaignNames] = useState([]);

    // Filter states
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        sortBy: 'latest'
    });
    const [showFilters, setShowFilters] = useState(false);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(initialLoading);

    // Predefined price ranges
    const priceRanges = [
        { label: '৳0 – ৳1,000', min: 0, max: 1000 },
        { label: '৳1,000 – ৳5,000', min: 1000, max: 5000 },
        { label: '৳5,000 – ৳10,000', min: 5000, max: 10000 },
        { label: '৳10,000 – ৳20,000', min: 10000, max: 20000 },
        { label: '৳20,000 – ৳30,000', min: 20000, max: 30000 },
        { label: '৳30,000 – ৳50,000', min: 30000, max: 50000 },
        { label: '৳50,000+', min: 50000, max: 1000000 }
    ];

    // Simulate loading for skeleton
    useEffect(() => {
        if (initialLoading) {
            setIsLoading(true);
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [initialLoading]);

    useEffect(() => {
        if (products.length === 0) {
            setIsLoading(false);
            return;
        }

        const campaignMap = new Map();
        const allCampaigns = [];

        products.forEach((product) => {
            if (product.campaignInfo) {
                const campaignId = product.campaignInfo.campaignId;
                if (!campaignMap.has(campaignId)) {
                    const campaign = {
                        id: campaignId,
                        name: product.campaignInfo.campaignName,
                        type: product.campaignInfo.campaignType,
                        priority: product.campaignInfo.priority || 0,
                        endAt: product.campaignInfo.endAt,
                        showCountdown: product.campaignInfo.showCountdown,
                        discountValue: product.campaignInfo.discountValue
                    };
                    campaignMap.set(campaignId, campaign);
                    allCampaigns.push(campaign);
                }
            }
        });

        // Set unique campaign names
        const uniqueNames = Array.from(campaignMap.values())
            .map(c => c.name)
            .filter(name => name);
        setCampaignNames(uniqueNames);

        // Find featured campaign (highest priority)
        if (allCampaigns.length > 0) {
            const featured = allCampaigns.reduce((prev, current) =>
                (prev.priority > current.priority) ? prev : current
            );
            setFeaturedCampaign(featured);
        }

        // Find nearest ending campaign
        const campaignsWithEndDate = allCampaigns
            .filter(c => c.endAt && c.showCountdown)
            .map(c => ({ ...c, endAt: new Date(c.endAt) }))
            .sort((a, b) => a.endAt - b.endAt);

        if (campaignsWithEndDate.length > 0) {
            setNearestEndingCampaign(campaignsWithEndDate[0]);
        }
    }, [products]);

    // Filter and sort products with variant price support
    useEffect(() => {
        if (products.length === 0 || isLoading) return;

        const flashDealProducts = products.filter(product => {
            const campaignType = product.campaignInfo?.campaignType;
            const isFeatured = product.campaignInfo?.priority > 0;
            const isFlashDeal = campaignType === 'FlashDeal';
            return isFlashDeal || isFeatured;
        });

        let filtered = [...flashDealProducts];

        // Calculate discounted price for filtering (considering variants)
        filtered = filtered.map(product => {
            const isVariantProduct = product.productType === 'variant';
            let originalPrice, discountedPrice, discountAmount;

            if (isVariantProduct && product.productVariants && product.productVariants.length > 0) {
                // Use default variant price
                const defaultVariant = getDefaultVariant(product);
                const variantBasePrice = defaultVariant ? parseFloat(defaultVariant.price) : parseFloat(product.price);

                originalPrice = variantBasePrice;

                // Apply campaign discount
                const discountValue = product.campaignInfo?.discountValue || 0;
                const maxDiscount = product.campaignInfo?.maxDiscountAmount;

                if (product.campaignInfo?.discountType === 'Fixed') {
                    discountAmount = Math.min(discountValue, variantBasePrice);
                    discountedPrice = variantBasePrice - discountAmount;
                } else {
                    discountAmount = (variantBasePrice * discountValue) / 100;
                    if (maxDiscount && discountAmount > maxDiscount) {
                        discountAmount = maxDiscount;
                    }
                    discountedPrice = variantBasePrice - discountAmount;
                }
            } else {
                // Single product
                originalPrice = parseFloat(product.price) || 0;
                const discountValue = product.campaignInfo?.discountValue || 0;
                const maxDiscount = product.campaignInfo?.maxDiscountAmount;

                if (discountValue > 0) {
                    if (product.campaignInfo?.discountType === 'Fixed') {
                        discountAmount = Math.min(discountValue, originalPrice);
                        discountedPrice = originalPrice - discountAmount;
                    } else {
                        discountAmount = (originalPrice * discountValue) / 100;
                        if (maxDiscount && discountAmount > maxDiscount) {
                            discountAmount = maxDiscount;
                        }
                        discountedPrice = originalPrice - discountAmount;
                    }
                } else {
                    discountedPrice = originalPrice;
                    discountAmount = 0;
                }
            }

            return {
                ...product,
                discountedPrice: Math.round(discountedPrice * 100) / 100,
                originalPrice: originalPrice,
                discountAmount: Math.round(discountAmount * 100) / 100
            };
        });

        // Apply price filter
        if (filters.minPrice || filters.maxPrice) {
            const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : 0;
            const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : 1000000;

            filtered = filtered.filter(product => {
                return product.discountedPrice >= minPrice && product.discountedPrice <= maxPrice;
            });
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (filters.sortBy) {
                case 'price-low':
                    return a.discountedPrice - b.discountedPrice;
                case 'price-high':
                    return b.discountedPrice - a.discountedPrice;
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'latest':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        setFilteredProducts(filtered);
    }, [products, filters, isLoading]);

    const handlePriceRangeChange = (min, max) => {
        setFilters(prev => ({
            ...prev,
            minPrice: min.toString(),
            maxPrice: max.toString()
        }));
    };

    const clearPriceRange = () => {
        setFilters(prev => ({
            ...prev,
            minPrice: '',
            maxPrice: ''
        }));
    };

    const clearFilters = () => {
        setFilters({
            minPrice: '',
            maxPrice: '',
            sortBy: 'latest'
        });
    };

    const getMainCampaignName = () => {
        if (featuredCampaign?.name) return featuredCampaign.name;
        if (campaignNames.length === 1) return campaignNames[0];
        if (campaignNames.length > 1) return "Hot Deals";
        return "Flash Deals";
    };

    const getSubHeading = () => {
        if (campaignNames.length === 0) return "Limited time offers. Don't miss out!";
        if (campaignNames.length === 1) {
            const discountValue = filteredProducts[0]?.campaignInfo?.discountValue;
            if (discountValue) return `Up to ${discountValue}% OFF! Limited time offer.`;
            return "Exclusive deals. Shop now!";
        }
        return `${campaignNames.length} special offers running!`;
    };

    const displayedProducts = filteredProducts.slice(0, 10);

    // Get active price range label
    const getActivePriceRangeLabel = () => {
        if (!filters.minPrice && !filters.maxPrice) return null;

        const activeRange = priceRanges.find(
            range => range.min.toString() === filters.minPrice && range.max.toString() === filters.maxPrice
        );

        if (activeRange) {
            return activeRange.label;
        }

        return `৳${filters.minPrice || '0'} - ৳${filters.maxPrice || '∞'}`;
    };

    const gridCols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4";

    if (isLoading) {
        return (
            <section className="py-12 bg-white">
                <Container>
                    <div className="py-8">
                        <SkeletonLoader
                            type="productGridWithFilters"
                            count={10}
                            gridCols={gridCols}
                            gap="gap-4 md:gap-10"
                            withFilters={true}
                            withHeader={true}
                        />
                    </div>
                </Container>
            </section>
        );
    }

    if (filteredProducts.length === 0 && products.length > 0) {
        return (
            <section id="flash-deals" className="py-12 bg-white">
                <Container>
                    <div className="py-8">
                        <div className="text-center py-12">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">No products match your filters</h2>
                            <button
                                onClick={clearFilters}
                                className="px-6 py-3 bg-amber-500 text-white hasib-rounded hover:bg-amber-600 transition-colors font-medium"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>
                </Container>
            </section>
        );
    }

    if (displayedProducts.length === 0) return null;

    const mainCampaignName = getMainCampaignName();
    const subHeading = getSubHeading();

    return (
        <section id="flash-deals" className="py-12 bg-white">
            <Container>
                <div className="py-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <div className="text-center md:text-left mb-6 md:mb-0">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-3xl md:text-4xl lg:text-[42px] font-bold text-gray-800 font-philosopher">
                                    {mainCampaignName}
                                </h2>
                            </div>
                            <p className="text-gray-600 mt-2">{subHeading}</p>

                            {campaignNames.length > 1 && (
                                <div className="flex items-center gap-2 mt-3">
                                    <div className="flex -space-x-2">
                                        {campaignNames.slice(0, 3).map((name, index) => (
                                            <div
                                                key={index}
                                                className="w-6 h-6 rounded-full bg-teal-500 text-white text-xs flex items-center justify-center font-bold border-2 border-white"
                                                title={name}
                                            >
                                                {name.charAt(0)}
                                            </div>
                                        ))}
                                        {campaignNames.length > 3 && (
                                            <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-700 text-xs flex items-center justify-center font-bold border-2 border-white">
                                                +{campaignNames.length - 3}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {campaignNames.length} active campaigns
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-center md:items-end">
                            <div className="mb-4">
                                <span className="text-sm text-gray-600 block mb-2">Offer ends in:</span>
                                {nearestEndingCampaign ? (
                                    <div className="flex items-center gap-2">
                                        <CountdownTimer endDate={nearestEndingCampaign.endAt} />
                                    </div>
                                ) : (
                                    <div className="text-lg font-bold text-green-600">Ongoing</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Filters and Products Layout */}
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Mobile Filters Toggle */}
                        <div className="lg:hidden">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 hasib-rounded mb-4"
                            >
                                <span className="flex items-center gap-2 font-medium">
                                    <SlidersHorizontal size={18} />
                                    Filters
                                </span>
                                <ChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                            </button>
                        </div>

                        {/* Filters Sidebar */}
                        {(showFilters || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
                            <div className="lg:w-1/5 w-full text-gray-800">
                                <div className="bg-white hasib-rounded border border-gray-100 p-6 sticky top-24 shadow">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-lg font-semibold flex items-center gap-2">
                                            <SlidersHorizontal size={18} />
                                            Filters
                                        </h2>
                                        <button
                                            onClick={clearFilters}
                                            className="text-sm text-rose-500 hover:text-rose-700 flex items-center gap-1"
                                        >
                                            <X size={14} />
                                            Clear all
                                        </button>
                                    </div>

                                    {/* Price Range */}
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-semibold text-gray-700">Price Range</h3>
                                            {(filters.minPrice || filters.maxPrice) && (
                                                <button
                                                    onClick={clearPriceRange}
                                                    className="text-xs text-amber-600 hover:text-amber-700"
                                                >
                                                    Clear
                                                </button>
                                            )}
                                        </div>
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {priceRanges.map((range) => (
                                                <label
                                                    key={range.label}
                                                    className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="priceRange"
                                                        checked={
                                                            filters.minPrice === range.min.toString() &&
                                                            filters.maxPrice === range.max.toString()
                                                        }
                                                        onChange={() => handlePriceRangeChange(range.min, range.max)}
                                                        className="mr-3 h-4 w-4 text-amber-600 focus:ring-amber-500 border-stone-300"
                                                    />
                                                    <span className="text-sm text-gray-700 font-medium">
                                                        {range.label}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>

                                        {/* Custom Price Range */}
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <h4 className="text-xs font-semibold text-gray-600 mb-2">Custom Range</h4>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    placeholder="Min"
                                                    value={filters.minPrice}
                                                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                                                    className="w-full p-2 border border-stone-300 rounded text-sm focus:border-primary focus:ring-primary"
                                                    min="0"
                                                    step="100"
                                                />
                                                <span className="text-gray-500 text-sm">to</span>
                                                <input
                                                    type="number"
                                                    placeholder="Max"
                                                    value={filters.maxPrice}
                                                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                                                    className="w-full p-2 border border-stone-300 rounded text-sm focus:border-primary focus:ring-primary focus:ring-1"
                                                    min="0"
                                                    step="100"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sort By */}
                                    <div className="mb-6">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Sort By</h3>
                                        <select
                                            value={filters.sortBy}
                                            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                                            className="w-full p-2 border border-stone-300 rounded text-sm focus:border-primary focus:ring-primary"
                                        >
                                            <option value="price-low">Price: Low to High</option>
                                            <option value="price-high">Price: High to Low</option>
                                        </select>
                                    </div>

                                    {/* Reset Button */}
                                    <button
                                        onClick={clearFilters}
                                        className="w-full mt-4 bg-primary hover:bg-primary-hover text-white py-2.5 px-4 rounded text-sm font-medium transition-colors cursor-pointer"
                                    >
                                        Reset All Filters
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Products Grid */}
                        <div className="w-full lg:w-4/5">
                            {/* Active Filters Display */}
                            {(filters.minPrice || filters.maxPrice) && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {(filters.minPrice || filters.maxPrice) && (
                                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium">
                                            {getActivePriceRangeLabel()}
                                            <button
                                                onClick={clearPriceRange}
                                                className="hover:text-green-900 ml-1"
                                            >
                                                <X size={12} />
                                            </button>
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Products Count */}
                            <div className="mb-6">
                                <p className="text-gray-600">
                                    Showing {Math.min(10, filteredProducts.length)} of {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                                </p>
                            </div>

                            {/* Products Grid */}
                            <div className={`grid ${gridCols} gap-4 md:gap-6`}>
                                {displayedProducts.map((product) => (
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
                                        discountedPrice={product.discountedPrice}
                                        discountAmount={product.discountAmount}
                                        originalPrice={product.originalPrice}
                                    />
                                ))}
                            </div>

                            {/* No Results Message */}
                            {filteredProducts.length === 0 && (
                                <div className="text-center py-12">
                                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
                                    <p className="text-gray-600 mb-6">
                                        Try adjusting your filters
                                    </p>
                                    <button
                                        onClick={clearFilters}
                                        className="px-6 py-3 bg-amber-500 text-white hasib-rounded hover:bg-amber-600 transition-colors font-medium"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default DiscountProductClient;