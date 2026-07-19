'use client'

import React, { useEffect, useState, useMemo } from 'react';
import Container from "../Container/Container";
import Link from "next/link";
import Image from "next/image";
import banner from '../../../public/assects/bundleBG.png';
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import SkeletonLoader from "../Skeleton/SkeletonLoader";
import { SlidersHorizontal, X } from "lucide-react";


const BundleProductsClient = ({ initialProductData }) => {
    const [bProduct, setBProduct] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(100000);
    const [sortBy, setSortBy] = useState("latest");
    const [category, setCategory] = useState("all");
    const [bundleType, setBundleType] = useState("all");

    // Initialize with initialProductData
    useEffect(() => {
        if (initialProductData?.data && Array.isArray(initialProductData.data)) {
            setBProduct(initialProductData.data);
            setFilteredProducts(initialProductData.data);
            setIsLoading(false);
        } else {
            // If no data, still stop loading
            setIsLoading(false);
        }
    }, [initialProductData]);

    // Calculate total original price from bundle
    const getTotalOriginalPrice = (bundle) => {
        return parseFloat(bundle.totalOriginalPrice) || 0;
    };

    // Get unique categories from bundle items
    const getBundleCategories = (bundle) => {
        if (!bundle.bundleItems || !Array.isArray(bundle.bundleItems)) return [];
        return bundle.bundleItems.map(item =>
            item.product?.productName?.split(' ')[0] || 'Uncategorized'
        );
    };

    // Filter and sort logic
    useEffect(() => {
        if (!bProduct.length) {
            setFilteredProducts([]);
            return;
        }

        let filtered = [...bProduct];

        // Price filter - using finalPrice
        filtered = filtered.filter(item => {
            const finalPrice = parseFloat(item.finalPrice) || 0;
            return finalPrice >= minPrice && finalPrice <= maxPrice;
        });

        // Category filter - based on product names in bundle
        if (category !== "all") {
            filtered = filtered.filter(item => {
                const categories = getBundleCategories(item);
                return categories.some(cat =>
                    cat.toLowerCase().includes(category.toLowerCase())
                );
            });
        }

        // Bundle type filter - using discountType
        if (bundleType !== "all") {
            filtered = filtered.filter(item => item.discountType === bundleType);
        }

        // Sorting
        filtered.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);

            switch (sortBy) {
                case 'latest':
                    return dateB.getTime() - dateA.getTime();
                case 'oldest':
                    return dateA.getTime() - dateB.getTime();
                case 'price-low-high':
                    return (parseFloat(a.finalPrice) || 0) - (parseFloat(b.finalPrice) || 0);
                case 'price-high-low':
                    return (parseFloat(b.finalPrice) || 0) - (parseFloat(a.finalPrice) || 0);
                case 'savings':
                    return (parseFloat(b.totalSavings) || 0) - (parseFloat(a.totalSavings) || 0);
                default:
                    return 0;
            }
        });

        setFilteredProducts(filtered);
    }, [minPrice, maxPrice, sortBy, category, bundleType, bProduct]);

    // Get all unique categories from all bundles
    const getAllCategories = useMemo(() => {
        if (isLoading || !bProduct.length) return [];
        const allCategories = new Set();
        bProduct.forEach(bundle => {
            if (bundle.bundleItems && Array.isArray(bundle.bundleItems)) {
                bundle.bundleItems.forEach(item => {
                    const category = item.product?.productName?.split(' ')[0] || 'Furniture';
                    allCategories.add(category);
                });
            }
        });
        return Array.from(allCategories);
    }, [bProduct, isLoading]);

    // Get all unique bundle types
    const getAllBundleTypes = useMemo(() => {
        if (isLoading || !bProduct.length) return [];
        const types = bProduct
            .map(bundle => bundle.discountType)
            .filter(Boolean);
        return [...new Set(types)];
    }, [bProduct, isLoading]);

    // Reset all filters
    const resetFilters = () => {
        setMinPrice(0);
        setMaxPrice(100000);
        setCategory("all");
        setBundleType("all");
        setSortBy("latest");
    };

    const gridCols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4";

    if (isLoading) {
        return (
            <section className="py-12 bg-white">
                <Container>
                    {/* Banner Skeleton */}
                    <div className="w-full h-[200px] bg-gray-300 diva-rounded mb-8 animate-pulse"></div>
                    <div className="py-8">
                        <SkeletonLoader
                            type="productGridWithFilters"
                            count={8}
                            gridCols={gridCols}
                            gap="gap-4 md:gap-10"
                            withFilters={true}
                        />
                    </div>
                </Container>
            </section>
        );
    }

    // Also show skeleton if no products after loading is done
    if (!isLoading && bProduct.length === 0) {
        return (
            <Container className="my-16 text-gray-800">

                {/* Banner */}
                <Image
                    src={banner}
                    alt="bundle products"
                    className="w-full h-[200px] object-cover diva-rounded mb-8"
                    priority
                />

                {/* Breadcrumb */}
                <div className="flex gap-2 text-gray-700 mt-4 text-sm md:text-base">
                    <Link href="/" className="hover:underline hover:text-teal-600">
                        Home
                    </Link>
                    /
                    <p className="font-semibold">Bundle Products</p>
                </div>

                <div className="mt-10 text-center py-16">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-semibold mb-2">No bundles available</h3>
                    <p className="text-gray-600 mb-4">
                        Currently there are no bundle products available.
                    </p>
                    <Link href="/">
                        <button className="bg-primary hover:bg-primary-hover text-gray-900 hover:text-white px-6 py-2 diva-rounded transition-colors">
                            Back to Home
                        </button>
                    </Link>
                </div>
            </Container>
        );
    }

    return (
        <Container className="my-5 md:my-16 text-gray-800">
            {/* Banner */}
            <Image
                src={banner}
                alt="bundle products"
                className="w-full h-[200px] object-cover diva-rounded mb-8"
                priority
            />

            {/* Breadcrumb */}
            <div className="flex gap-2 text-gray-700 mt-4 text-sm md:text-base">
                <Link href="/" className="hover:underline hover:text-teal-600">
                    Home
                </Link>
                /
                <p className="font-semibold">Bundle Products</p>
            </div>

            <div className="mt-10 flex gap-10 flex-col lg:flex-row">
                {/* Sidebar Filters */}
                <div className="w-full lg:w-1/5 space-y-6 font-poppins bg-white diva-rounded border border-gray-200 p-6 lg:sticky top-24">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <SlidersHorizontal size={18} />
                            Filters
                        </h2>
                        <button
                            onClick={resetFilters}
                            className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
                        >
                            <X size={14} />
                            Clear all
                        </button>
                    </div>

                    {/* Price Range */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-5">Price Range</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {[
                                { label: '৳0 – ৳1,000', min: 0, max: 1000 },
                                { label: '৳1,000 – ৳5,000', min: 1000, max: 5000 },
                                { label: '৳5,000 – ৳10,000', min: 5000, max: 10000 },
                                { label: '৳10,000 – ৳20,000', min: 10000, max: 20000 },
                                { label: '৳20,000 – ৳30,000', min: 20000, max: 30000 },
                                { label: '৳30,000 – ৳50,000', min: 30000, max: 50000 },
                                { label: '৳50,000+', min: 50000, max: 1000000 }
                            ].map((range) => (
                                <label
                                    key={range.label}
                                    className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                                    <input
                                        type="radio"
                                        name="priceRange"
                                        checked={minPrice === range.min && maxPrice === range.max}
                                        onChange={() => {
                                            setMinPrice(range.min);
                                            setMaxPrice(range.max);
                                        }}
                                        className="mr-2 h-4 w-4 text-teal-600"
                                    />
                                    <span className="text-sm text-gray-700 font-medium">
                                        {range.label}
                                    </span>
                                </label>
                            ))}
                        </div>

                        {/* Custom Range */}
                        <div className="mt-8 grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs text-gray-500">Min Price</label>
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={minPrice || ''}
                                    onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
                                    className="w-full p-2 border border-stone-300 rounded text-sm focus:border-primary focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Max Price</label>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={maxPrice === 1000000 ? '' : maxPrice}
                                    onChange={(e) => setMaxPrice(Number(e.target.value) || 1000000)}
                                    className="w-full p-2 border border-stone-300 rounded text-sm focus:border-primary focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Product Type</h4>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full p-2 border border-stone-300 rounded text-sm focus:border-primary focus:ring-primary"
                            disabled={isLoading || getAllCategories.length === 0}
                        >
                            <option value="all">All Types</option>
                            {getAllCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Bundle Type Filter */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Discount Type</h4>
                        <select
                            value={bundleType}
                            onChange={(e) => setBundleType(e.target.value)}
                            className="w-full p-2 border border-stone-300 rounded text-sm focus:border-primary focus:ring-primary"
                            disabled={isLoading || getAllBundleTypes.length === 0}
                        >
                            <option value="all">All Types</option>
                            {getAllBundleTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sort By */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Sort By</h4>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full p-2 border border-stone-300 rounded text-sm focus:border-primary focus:ring-primary"
                        >
                            <option value="latest">Latest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="price-low-high">Price: Low to High</option>
                            <option value="price-high-low">Price: High to Low</option>
                            <option value="savings">Highest Savings</option>
                        </select>
                    </div>

                    {/* Reset Button */}
                    <button
                        onClick={resetFilters}
                        className="mt-4 w-full bg-primary hover:bg-primary-hover text-black py-2 rounded text-sm transition-colors"
                        disabled={isLoading}
                    >
                        Clear All Filters
                    </button>
                </div>

                {/* Product Grid */}
                <div className="flex-1 w-full lg:w-4/5">
                    {/* Active Filters */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {(minPrice > 0 || maxPrice < 100000) && (
                            <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm">
                                Price: ৳{minPrice.toLocaleString()} - ৳{maxPrice.toLocaleString()}
                            </span>
                        )}
                        {category !== "all" && (
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                Type: {category}
                            </span>
                        )}
                        {bundleType !== "all" && (
                            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                                Discount: {bundleType}
                            </span>
                        )}
                    </div>

                    {/* Results Count */}
                    <div className="mb-6">
                        <p className="text-gray-600">
                            Showing {filteredProducts.length} of {bProduct.length} {bProduct.length === 1 ? 'bundle' : 'bundles'}
                        </p>
                    </div>

                    <div className={`grid ${gridCols} gap-6`}>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((bundle) => {
                                const totalOriginalPrice = getTotalOriginalPrice(bundle);
                                const finalPrice = parseFloat(bundle.finalPrice) || 0;
                                const savings = parseFloat(bundle.totalSavings) || 0;
                                const savingsPercentage = parseFloat(bundle.savingsPercentage) || 0;

                                return (
                                    <div
                                        key={bundle.id}
                                        className="rounded shadow-md overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-2 border border-gray-100"
                                    >
                                        {/* Bundle Image */}
                                        <div className="relative">
                                            <Image
                                                src={bundle.image}
                                                alt={bundle.name}
                                                width={400}
                                                height={250}
                                                className="w-full h-48 object-cover"
                                            />
                                            {/* Savings Badge */}
                                            {savingsPercentage > 0 && (
                                                <div className="absolute top-3 right-3 bg-pink-600 text-white px-2 py-1 rounded-full text-sm font-bold">
                                                    Save ৳{savings.toLocaleString()}
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4">
                                            {/* Bundle Name and Description */}
                                            <h3 className="text-lg font-bold text-gray-800 mb-1">
                                                {bundle.name}
                                            </h3>

                                            {/* Pricing */}
                                            <div className="mt-3 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-500 text-sm line-through">
                                                        ৳{totalOriginalPrice.toLocaleString()}
                                                    </span>
                                                    <span className="text-red-600 font-bold text-xl flex items-center">
                                                        <FaBangladeshiTakaSign className="mr-1" size={16} />
                                                        {finalPrice.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <Link href={`/bundle-products/${bundle.slug || bundle.id}`}>
                                                <button className="mt-4 w-full bg-primary hover:bg-primary-hover text-gray-900 hover:text-white font-semibold py-3 px-4 rounded transition-all duration-700 cursor-pointer transform font-urbanist">
                                                    View Bundle Details
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full text-center py-16 text-gray-500">
                                <div className="text-6xl mb-4">📦</div>
                                <h3 className="text-xl font-semibold mb-2">No bundles found</h3>
                                <p className="text-gray-600 mb-4">
                                    No bundle products match your current filters.
                                </p>
                                <button
                                    onClick={resetFilters}
                                    className="bg-secound hover:bg-secound-hover text-white px-6 py-2 diva-rounded transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default BundleProductsClient;
