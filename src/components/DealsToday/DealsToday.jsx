'use client'

import Image from "next/image";
import React, { useEffect, useState } from "react";
import Container from "@/components/Container/Container";
import {
    FaBangladeshiTakaSign,
    FaHeart,
    FaEye,
    FaShare,
    FaStar,
    FaRegStar
} from "react-icons/fa6";
import { IoIosArrowForward } from "react-icons/io";
import CountdownTimer from "../Home/sections/CountdownTimer";
import Link from "next/link";

const DealsToday = () => {
    const [wishlist, setWishlist] = useState([]);
    const [flashDeals, setFlashDeals] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(100000);
    const [sortBy, setSortBy] = useState("latest");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const toggleWishlist = (id) => {
        setWishlist(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    // Fetch deals products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch('./dealsProducts.json');

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                const formattedData = data.map((item) => ({
                    ...item,
                    createdAt: item.createdAt || new Date().toISOString()
                }));

                setFlashDeals(formattedData);
                setFilteredProducts(formattedData);
            } catch (err) {
                console.error("Error fetching deals products:", err);
                setError("Failed to load products. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Filter and sort logic
    useEffect(() => {
        if (!flashDeals.length) return;

        let filtered = [...flashDeals];

        // Price filter
        filtered = filtered.filter(product => {
            const productPrice = product.price || 0;
            return productPrice >= minPrice && productPrice <= maxPrice;
        });

        // Sorting
        filtered.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return sortBy === 'latest'
                ? dateB.getTime() - dateA.getTime()
                : dateA.getTime() - dateB.getTime();
        });

        setFilteredProducts(filtered);
    }, [minPrice, maxPrice, sortBy, flashDeals]);

    // Render star ratings
    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            index < rating
                ? <FaStar key={index} className="text-yellow-500 text-sm" />
                : <FaRegStar key={index} className="text-gray-300 text-sm" />
        ));
    };

    // Price ranges for filter
    const priceRanges = [
        { label: '৳0 – ৳1000', min: 0, max: 1000 },
        { label: '৳1000 – ৳5000', min: 1000, max: 5000 },
        { label: '৳5000 – ৳10000', min: 5000, max: 10000 },
        { label: '৳10000 – ৳20000', min: 10000, max: 20000 },
        { label: '৳20000 – ৳30000', min: 20000, max: 30000 },
        { label: '৳30000 – ৳50000', min: 30000, max: 50000 },
        { label: '৳50000+', min: 50000, max: 1000000 }
    ];

    if (error) {
        return (
            <Container>
                <div className="flex flex-col items-center justify-center min-h-96">
                    <div className="text-red-500 text-lg mb-4">{error}</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-gray-700 mt-10 text-sm md:text-base">
                <Link href="/" className="hover:underline hover:text-teal-600 flex items-center gap-1">
                    Home <IoIosArrowForward />
                </Link>
                <p className="font-semibold ">Deals Today</p>
            </div>

            {/* Countdown Timer */}
            <div className="py-8 md:pb-12 flex justify-end">
                <CountdownTimer />
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-14 pb-12 text-gray-800">
                {/* Sidebar Filters */}
                <div className="w-full lg:w-72 space-y-6 font-poppins">
                    <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Filters</h3>

                    {/* Price Range */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Price Range</h4>
                        <div className="space-y-2">
                            {priceRanges.map((range) => (
                                <label key={range.label} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                                    <input
                                        type="radio"
                                        name="priceRange"
                                        checked={minPrice === range.min && maxPrice === range.max}
                                        onChange={() => {
                                            setMinPrice(range.min);
                                            setMaxPrice(range.max);
                                        }}
                                        className="mr-2 h-4 w-4 text-teal-600 focus:ring-teal-500"
                                    />
                                    <span className="text-sm text-gray-700">{range.label}</span>
                                </label>
                            ))}
                        </div>

                        {/* Custom Range Inputs */}
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Min Price</label>
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={minPrice || ''}
                                    onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
                                    className="w-full border border-stone-300 px-3 py-2 text-sm rounded focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Max Price</label>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={maxPrice === 1000000 ? '' : maxPrice}
                                    onChange={(e) => setMaxPrice(Number(e.target.value) || 1000000)}
                                    className="w-full border border-stone-300 px-3 py-2 text-sm rounded focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sort By */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Sort By</h4>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full p-2 border border-stone-300 rounded text-sm focus:ring-teal-500 focus:border-teal-500"
                        >
                            <option value="latest">Latest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>

                    {/* Reset Button */}
                    <button
                        onClick={() => {
                            setMinPrice(0);
                            setMaxPrice(1000000);
                            setSortBy("latest");
                        }}
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded text-sm transition-colors font-medium"
                    >
                        Clear All Filters
                    </button>
                </div>

                {/* Products Grid */}
                <div className="flex-1">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, index) => (
                                <div key={index} className="animate-pulse">
                                    <div className="bg-gray-200 h-60 diva-rounded"></div>
                                    <div className="mt-4 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No products found matching your filters.</p>
                            <button
                                onClick={() => {
                                    setMinPrice(0);
                                    setMaxPrice(1000000);
                                    setSortBy("latest");
                                }}
                                className="mt-4 bg-teal-600 hover:bg-teal-700 text-white py-2 px-6 rounded text-sm transition-colors"
                            >
                                Reset Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col relative group border border-gray-100 diva-rounded bg-white"
                                >
                                    {/* Hover Icons */}
                                    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                                        <button
                                            onClick={() => toggleWishlist(product.id)}
                                            className="bg-white p-2 rounded-full shadow-md hover:bg-rose-50 transition-all duration-300 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-110 cursor-pointer"
                                            style={{ transitionDelay: '0.1s' }}
                                            aria-label="Add to wishlist"
                                        >
                                            <FaHeart
                                                className={`${wishlist.includes(product.id) ? 'text-rose-600' : 'text-teal-600'} transition-colors duration-300`}
                                                size={16}
                                            />
                                        </button>
                                        <button
                                            className="bg-white p-2 rounded-full shadow-md hover:bg-blue-50 transition-all duration-300 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-110 cursor-pointer"
                                            style={{ transitionDelay: '0.2s' }}
                                            aria-label="Quick view"
                                        >
                                            <FaEye className="text-teal-600" size={16} />
                                        </button>
                                        <button
                                            className="bg-white p-2 rounded-full shadow-md hover:bg-green-50 transition-all duration-300 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-110 cursor-pointer"
                                            style={{ transitionDelay: '0.3s' }}
                                            aria-label="Share product"
                                        >
                                            <FaShare className="text-teal-600" size={16} />
                                        </button>
                                    </div>

                                    {/* Discount Badge */}
                                    <div className="relative bg-gray-50 rounded-t-lg">
                                        <div className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-bold px-2 py-1 rounded">
                                            -{product.discount}
                                        </div>
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            width={300}
                                            height={200}
                                            className="w-full h-60 object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-4 flex flex-col flex-grow">
                                        <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 transition-colors duration-300 group-hover:text-teal-700 h-12">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-primary font-bold text-lg flex items-center">
                                                <FaBangladeshiTakaSign className="inline mr-1" size={16} />
                                                {product.price.toLocaleString()}
                                            </span>
                                            <span className="text-gray-400 text-sm flex items-center line-through">
                                                <FaBangladeshiTakaSign className="inline mr-1" size={12} />
                                                {product.originalPrice.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 mt-auto">
                                            <div className="flex">
                                                {renderStars(product.rating)}
                                            </div>
                                            <span className="text-gray-500 text-xs ml-1">({product.reviews})</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Container>
    );
};

export default DealsToday;
