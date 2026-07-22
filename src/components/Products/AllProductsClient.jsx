'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, SlidersHorizontal, Grid, List, ChevronDown, Check } from 'lucide-react';
import ProductCard from './ProductCard';
import Container from '../Container/Container';
import Image from 'next/image';
import { formatPrice } from '@/lib/variantHelpers';
import Link from 'next/link';
import DiscountProductCard from '../DiscountProduct/DiscountProductCard';
import QuickViewModal from '../Modal/QuickViewModal';
import { useUser } from '@/hooks/useUser';

export default function AllProductsClient({ 
    initialProducts, 
    title = "All Products", 
    breadcrumbLabel = "All Products", 
    bannerSrc = "/assects/AllProductbanner.jpg",
    bannerType = "default", // 'default' | 'campaign'
    fetchUrl
}) {
    const { user } = useUser();
    const [products, setProducts] = useState(initialProducts || []);
    const [filteredProducts, setFilteredProducts] = useState(initialProducts || []);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [showDrawer, setShowDrawer] = useState(false);

    useEffect(() => {
        if (!fetchUrl) return;

        const fetchFullCatalog = async () => {
            try {
                const { apiClient } = await import('@/lib/apiClient');
                const response = await apiClient(fetchUrl);
                const fullProducts = response?.products || response?.data?.products || response || [];
                if (fullProducts && Array.isArray(fullProducts) && fullProducts.length > 0) {
                    setProducts(fullProducts);
                }
            } catch (error) {
                console.error("[AllProductsClient] Error fetching full catalog:", error);
            }
        };

        fetchFullCatalog();
    }, [fetchUrl]);

    // Countdown Timer logic for campaign banner
    const nearestEndingCampaign = useMemo(() => {
        if (bannerType !== 'campaign') return null;
        const campaigns = products
            .map(p => p.campaignInfo)
            .filter(Boolean)
            .filter(c => c.endAt);
        if (campaigns.length === 0) return null;
        // Sort by end date ascending
        return campaigns.sort((a, b) => new Date(a.endAt) - new Date(b.endAt))[0];
    }, [products, bannerType]);

    const calculateTimeLeft = (endDateStr) => {
        if (!endDateStr) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        const difference = +new Date(endDateStr) - +new Date();
        let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        if (bannerType !== 'campaign' || !nearestEndingCampaign?.endAt) return;

        setTimeLeft(calculateTimeLeft(nearestEndingCampaign.endAt));

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(nearestEndingCampaign.endAt));
        }, 1000);

        return () => clearInterval(timer);
    }, [nearestEndingCampaign, bannerType]);

    const formatNumber = (num) => num < 10 ? `0${num}` : num.toString();

    // Split campaign name for display
    const campaignWords = (nearestEndingCampaign?.campaignName || "Summer Sale").trim().split(/\s+/);
    const word1 = campaignWords[0] || "Summer";
    const word2 = campaignWords.slice(1).join(" ") || "Sale";

    // Quick View & Card Loading States
    const [wishlistLoading, setWishlistLoading] = useState({});
    const [cartLoading, setCartLoading] = useState({});
    const [selectedQuickViewProduct, setSelectedQuickViewProduct] = useState(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    // Filters State
    const [selectedMainCategory, setSelectedMainCategory] = useState('All');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedSubCategory, setSelectedSubCategory] = useState('All');
    const [selectedBrand, setSelectedBrand] = useState('All');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [sortBy, setSortBy] = useState('latest'); // 'latest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'
    const [topSellingOnly, setTopSellingOnly] = useState(false);
    const [inStockOnly, setInStockOnly] = useState(false);

    // Collapsible Sections State
    const [expandedSections, setExpandedSections] = useState({
        mainCategory: true,
        category: false,
        subcategory: false,
        brands: false,
        priceRange: false,
        other: false
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Lazy Loading States
    const [visibleProductsCount, setVisibleProductsCount] = useState(20);
    const loaderRef = useRef(null);

    // Extract unique categories and brands dynamically
    const mainCategories = useMemo(() => {
        const list = products.map(p => p.subCategory?.category?.mainCategory?.name).filter(Boolean);
        return ['All', ...Array.from(new Set(list))];
    }, [products]);

    const categories = useMemo(() => {
        let filtered = products;
        if (selectedMainCategory !== 'All') {
            filtered = filtered.filter(p => p.subCategory?.category?.mainCategory?.name === selectedMainCategory);
        }
        const list = filtered.map(p => p.subCategory?.category?.name).filter(Boolean);
        return ['All', ...Array.from(new Set(list))];
    }, [products, selectedMainCategory]);

    const subCategories = useMemo(() => {
        let filtered = products;
        if (selectedMainCategory !== 'All') {
            filtered = filtered.filter(p => p.subCategory?.category?.mainCategory?.name === selectedMainCategory);
        }
        if (selectedCategory !== 'All') {
            filtered = filtered.filter(p => p.subCategory?.category?.name === selectedCategory);
        }
        const list = filtered.map(p => p.subCategory?.name).filter(Boolean);
        return ['All', ...Array.from(new Set(list))];
    }, [products, selectedMainCategory, selectedCategory]);

    const brands = useMemo(() => {
        const list = products.map(p => p.brand?.name).filter(Boolean);
        return ['All', ...Array.from(new Set(list))];
    }, [products]);

    // Slice products for lazy loading
    const displayedProducts = useMemo(() => {
        return filteredProducts.slice(0, visibleProductsCount);
    }, [filteredProducts, visibleProductsCount]);

    // Setup IntersectionObserver for Infinite Scroll
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setTimeout(() => {
                    setVisibleProductsCount(prev => Math.min(prev + 20, filteredProducts.length));
                }, 400);
            }
        }, { threshold: 0.1 });

        const currentLoader = loaderRef.current;
        if (currentLoader) {
            observer.observe(currentLoader);
        }

        return () => {
            if (currentLoader) {
                observer.unobserve(currentLoader);
            }
        };
    }, [filteredProducts.length]);

    // Reset pagination when filter selections change
    useEffect(() => {
        setVisibleProductsCount(20);
    }, [selectedMainCategory, selectedCategory, selectedSubCategory, selectedBrand, priceRange, sortBy, topSellingOnly, inStockOnly]);

    // Apply filtering and sorting
    useEffect(() => {
        let result = [...products];

        // 1. Main Category Filter
        if (selectedMainCategory !== 'All') {
            result = result.filter(p => p.subCategory?.category?.mainCategory?.name === selectedMainCategory);
        }

        // 2. Category Filter
        if (selectedCategory !== 'All') {
            result = result.filter(p => p.subCategory?.category?.name === selectedCategory);
        }

        // 3. Subcategory Filter
        if (selectedSubCategory !== 'All') {
            result = result.filter(p => p.subCategory?.name === selectedSubCategory);
        }

        // 4. Brand Filter
        if (selectedBrand !== 'All') {
            result = result.filter(p => p.brand?.name === selectedBrand);
        }

        // 5. Price Filter
        if (priceRange.min !== '') {
            result = result.filter(p => parseFloat(p.price) >= parseFloat(priceRange.min));
        }
        if (priceRange.max !== '') {
            result = result.filter(p => parseFloat(p.price) <= parseFloat(priceRange.max));
        }

        // 6. Top Selling Filter
        if (topSellingOnly) {
            result = result.filter(p => p.sellingType?.toLowerCase().includes('top') || p.sellingType?.toLowerCase().includes('best') || p.isTopSelling);
        }

        // 7. In Stock Filter
        if (inStockOnly) {
            result = result.filter(p => p.quantity > 0 && p.status);
        }

        // 8. Sorting
        result.sort((a, b) => {
            const priceA = parseFloat(a.discountValue > 0 ? a.price - (a.price * a.discountValue / 100) : a.price);
            const priceB = parseFloat(b.discountValue > 0 ? b.price - (b.price * b.discountValue / 100) : b.price);

            switch (sortBy) {
                case 'price-asc':
                    return priceA - priceB;
                case 'price-desc':
                    return priceB - priceA;
                case 'name-asc':
                    return a.productName.localeCompare(b.productName);
                case 'name-desc':
                    return b.productName.localeCompare(a.productName);
                case 'latest':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        setFilteredProducts(result);
    }, [products, selectedMainCategory, selectedCategory, selectedSubCategory, selectedBrand, priceRange, sortBy, topSellingOnly, inStockOnly]);

    const clearAllFilters = () => {
        setSelectedMainCategory('All');
        setSelectedCategory('All');
        setSelectedSubCategory('All');
        setSelectedBrand('All');
        setPriceRange({ min: '', max: '' });
        setSortBy('latest');
        setTopSellingOnly(false);
        setInStockOnly(false);
    };

    return (
        <div className="bg-gray-50/50 min-h-screen pb-16 font-outfit">

            {/* Page Header and Breadcrumbs Container */}
            <Container className="pt-[20px] md:pt-[20px] lg:pt-[20px]">
                {/* Breadcrumbs */}
                <nav className="text-xs md:text-sm text-gray-500 mb-6 flex flex-wrap items-center gap-1.5 md:gap-2 font-medium">
                    <Link href="/" className="hover:text-[#5A0C3D] transition-colors">
                        Home
                    </Link>
                    <span className="text-gray-300">/</span>
                    <span className="text-gray-800 font-semibold font-outfit ">
                        {breadcrumbLabel}
                    </span>
                </nav>

                {/* Page Header Banner */}
                {bannerType === 'campaign' && nearestEndingCampaign ? (
                    <div 
                        className="relative w-full min-h-[260px] md:min-h-[300px] bg-[#5A0C3D] flex items-center overflow-hidden rounded-xl shadow-sm mb-6"
                        style={{
                            backgroundImage: `url('${bannerSrc}')`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat"
                        }}
                    >
                        <div className="absolute inset-0 bg-black/10 md:bg-transparent z-0" />
                        <div className="w-full h-full max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 relative z-10 py-6">
                            <div className="md:col-span-7 lg:col-span-6 flex flex-col items-center justify-center text-center space-y-4 px-4">
                                {/* Title with word split and Subtract SVG container */}
                                <div className="flex flex-wrap items-center justify-center gap-2.5 md:gap-3.5 text-2xl sm:text-3xl md:text-[36px] lg:text-[40px] font-bold text-white uppercase font-outfit">
                                    <span>{word1}</span>
                                    <div className="relative w-[110px] h-[52px] md:w-[130px] md:h-[60px] flex items-center justify-center px-1">
                                        <img src="/assects/Subtract.svg" className="absolute inset-0 w-full h-full object-contain" alt="" />
                                        <span className="relative z-10 text-[32px] md:text-[48px] text-[#5A0C3D] font-instrument_serif italic normal-case font-normal -mt-0.5 leading-none select-none">
                                            {word2}
                                        </span>
                                    </div>
                                    <span>Live Now</span>
                                </div>

                                {/* White block timer */}
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
                                    UP TO <span className="text-[#CCFF00] font-bold">{nearestEndingCampaign.discountValue}%</span> OFF
                                </div>

                                {/* Description Text */}
                                <div className="flex flex-col items-center text-xs md:text-sm text-white/90 font-outfit tracking-wide leading-relaxed font-light">
                                    <p>Because Every Woman Deserves To Shine.</p>
                                    <p>Grab It Before It's Gone!</p>
                                </div>
                            </div>
                            <div className="hidden md:block md:col-span-5 lg:col-span-6" />
                        </div>
                    </div>
                ) : (
                    <div className="relative w-full h-[200px] md:h-[280px] bg-stone-900 overflow-hidden rounded-xl shadow-sm mb-6">
                        <Image
                            src={bannerSrc}
                            alt={title}
                            fill
                            priority
                            sizes="100vw"
                            className="object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <h1 className="font-outfit text-white text-3xl md:text-5xl font-bold tracking-wide uppercase drop-shadow-md">
                                {title}
                            </h1>
                        </div>
                    </div>
                )}
            </Container>

            {/* Filter Bar Controls */}
            <Container className="pb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-gray-200/80 p-4 rounded-2xl shadow-xs mb-8">

                    {/* Left: Filter Toggle & Total Items */}
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                        <button
                            onClick={() => setShowDrawer(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#5A0C3D] hover:bg-[#4a0a32] text-white font-medium rounded-xl shadow-md transition-all active:scale-95 cursor-pointer animate-fadeIn"
                        >
                            <SlidersHorizontal size={16} />
                            <span>Filter Products</span>
                        </button>
                        <span className="text-sm font-medium text-gray-500">
                            Showing <strong className="text-gray-800">{filteredProducts.length}</strong> Products
                        </span>
                    </div>

                    {/* Right: Sort & Grid/List View Toggles */}
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Sort by:</span>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 pl-3 pr-10 rounded-xl text-sm font-medium focus:outline-none focus:border-[#5A0C3D] cursor-pointer"
                                >
                                    <option value="latest">Latest First</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                    <option value="name-asc">Name: A to Z</option>
                                    <option value="name-desc">Name: Z to A</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>
                        </div>

                        {/* View Grid/List Icons */}
                        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50 p-0.5">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-white text-[#5A0C3D] shadow-xs' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                title="Grid View"
                            >
                                <Grid size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-white text-[#5A0C3D] shadow-xs' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                title="List View"
                            >
                                <List size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Product Layout */}
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl p-8 animate-fadeIn">
                        <SlidersHorizontal className="w-16 h-16 mx-auto text-gray-300 mb-4 animate-pulse" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No products found</h3>
                        <p className="text-gray-500 mb-6">
                            No items match your selected filters. Try clearing filters or setting a wider price range.
                        </p>
                        <button
                            onClick={clearAllFilters}
                            className="px-6 py-3 bg-[#5A0C3D] text-white font-medium rounded-xl shadow-md hover:bg-[#4a0a32] active:scale-95 transition-all cursor-pointer"
                        >
                            Reset All Filters
                        </button>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-fadeIn">
                        {displayedProducts.map((product) => (
                            <DiscountProductCard
                                key={product.id}
                                product={product}
                                user={user}
                                isWishlistLoading={wishlistLoading[product.id] || false}
                                isCartLoading={cartLoading[product.id] || false}
                                onWishlistToggle={(productId, isLoading) =>
                                    setWishlistLoading(prev => ({ ...prev, [productId]: isLoading }))
                                }
                                onCartToggle={(productId, isLoading) =>
                                    setCartLoading(prev => ({ ...prev, [productId]: isLoading }))
                                }
                                onOpenQuickView={(prod) => {
                                    setSelectedQuickViewProduct(prod);
                                    setIsQuickViewOpen(true);
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    /* List Layout */
                    <div className="space-y-4 animate-fadeIn">
                        {displayedProducts.map((product) => {
                            const discountedPrice = product.discountValue > 0
                                ? product.price - (product.price * product.discountValue / 100)
                                : product.price;

                            return (
                                <div
                                    key={product.id}
                                    className="flex flex-col sm:flex-row gap-6 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300"
                                >
                                    {/* Image Column */}
                                    <Link
                                        href={`/product/${product.slug}`}
                                        className="relative w-full sm:w-48 h-60 sm:h-auto aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 block"
                                    >
                                        <Image
                                            src={product.images?.[0] || 'https://res.cloudinary.com/dh34eqbhu/image/upload/v1747211252/ju2uf9y33y1bncwufrl7.png'}
                                            alt={product.productName}
                                            fill
                                            sizes="(max-width: 640px) 100vw, 200px"
                                            className="object-cover"
                                        />
                                        {product.discountValue > 0 && (
                                            <div className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                                -{product.discountValue}%
                                            </div>
                                        )}
                                    </Link>

                                    {/* Content Column */}
                                    <div className="flex flex-col justify-between flex-grow py-1">
                                        <div className="space-y-2">
                                            <Link href={`/product/${product.slug}`} className="block">
                                                <h3 className="text-lg font-bold text-gray-800 hover:text-[#5A0C3D] transition-colors line-clamp-1">
                                                    {product.productName}
                                                </h3>
                                            </Link>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                                    {product.brand?.name || 'No Brand'}
                                                </span>
                                                <span className="text-xs font-semibold px-2 py-0.5 bg-[#5A0C3D]/5 text-[#5A0C3D] rounded">
                                                    {product.category?.name || product.subCategory?.category?.name || 'Uncategorized'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed pt-1">
                                                {product.description?.replace(/<[^>]*>/g, '') || 'No description available for this premium timepiece collection item.'}
                                            </p>
                                        </div>

                                        {/* Bottom Row: Price & Details Link */}
                                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-xl font-bold text-gray-800">
                                                    ৳{formatPrice(discountedPrice)}
                                                </span>
                                                {product.discountValue > 0 && (
                                                    <span className="text-xs text-gray-400 line-through">
                                                        ৳{formatPrice(product.price)}
                                                    </span>
                                                )}
                                            </div>
                                            <Link
                                                href={`/product/${product.slug}`}
                                                className="px-4 py-2 bg-gray-50 hover:bg-[#5A0C3D] text-gray-700 hover:text-white rounded-lg text-sm font-semibold transition-colors duration-200"
                                            >
                                                View Product
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                {/* Infinite Scroll Trigger */}
                {visibleProductsCount < filteredProducts.length && (
                    <div ref={loaderRef} className="py-8 flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#5A0C3D] border-t-transparent"></div>
                    </div>
                )}
            </Container>

            {/* Left Side Filter Drawer */}
            <div
                className={`fixed inset-0 z-[100] transition-opacity duration-300 ${showDrawer ? 'opacity-100 visible pointer-events-auto bg-black/40' : 'opacity-0 invisible pointer-events-none'
                    }`}
                onClick={() => setShowDrawer(false)}
            >
                <div
                    className={`absolute top-0 left-0 w-80 max-w-[85%] h-full bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-out ${showDrawer ? 'translate-x-0' : '-translate-x-full'
                        }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Drawer Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <SlidersHorizontal size={18} />
                            <span>Filter Options</span>
                        </h2>
                        <button
                            onClick={() => setShowDrawer(false)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Drawer Content */}
                    <div className="flex-grow overflow-y-auto px-6 py-4 space-y-6">

                        {/* 1. Main Category Filter */}
                        <div className="space-y-3">
                            <button
                                onClick={() => toggleSection('mainCategory')}
                                className="flex items-center justify-between w-full py-2 font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 cursor-pointer"
                            >
                                <span>Main Category</span>
                                <ChevronDown size={16} className={`transition-transform duration-200 ${expandedSections.mainCategory ? 'rotate-180' : ''}`} />
                            </button>
                            {expandedSections.mainCategory && (
                                <div className="space-y-1 pt-1 max-h-48 overflow-y-auto">
                                    {mainCategories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => {
                                                setSelectedMainCategory(cat);
                                                setSelectedCategory('All');
                                                setSelectedSubCategory('All');
                                            }}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-colors ${selectedMainCategory === cat
                                                ? 'bg-[#5A0C3D]/5 text-[#5A0C3D] font-semibold'
                                                : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <span>{cat}</span>
                                            {selectedMainCategory === cat && <Check size={14} />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 2. Category Filter */}
                        <div className="space-y-3">
                            <button
                                onClick={() => toggleSection('category')}
                                className="flex items-center justify-between w-full py-2 font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 cursor-pointer"
                            >
                                <span>Category</span>
                                <ChevronDown size={16} className={`transition-transform duration-200 ${expandedSections.category ? 'rotate-180' : ''}`} />
                            </button>
                            {expandedSections.category && (
                                <div className="space-y-1 pt-1 max-h-48 overflow-y-auto">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => {
                                                setSelectedCategory(cat);
                                                setSelectedSubCategory('All');
                                            }}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-colors ${selectedCategory === cat
                                                ? 'bg-[#5A0C3D]/5 text-[#5A0C3D] font-semibold'
                                                : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <span>{cat}</span>
                                            {selectedCategory === cat && <Check size={14} />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 3. Subcategory Filter */}
                        <div className="space-y-3">
                            <button
                                onClick={() => toggleSection('subcategory')}
                                className="flex items-center justify-between w-full py-2 font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 cursor-pointer"
                            >
                                <span>Subcategory</span>
                                <ChevronDown size={16} className={`transition-transform duration-200 ${expandedSections.subcategory ? 'rotate-180' : ''}`} />
                            </button>
                            {expandedSections.subcategory && (
                                <div className="space-y-1 pt-1 max-h-48 overflow-y-auto">
                                    {subCategories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedSubCategory(cat)}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-colors ${selectedSubCategory === cat
                                                ? 'bg-[#5A0C3D]/5 text-[#5A0C3D] font-semibold'
                                                : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <span>{cat}</span>
                                            {selectedSubCategory === cat && <Check size={14} />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 4. Brand Filter */}
                        <div className="space-y-3">
                            <button
                                onClick={() => toggleSection('brands')}
                                className="flex items-center justify-between w-full py-2 font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 cursor-pointer"
                            >
                                <span>Brand</span>
                                <ChevronDown size={16} className={`transition-transform duration-200 ${expandedSections.brands ? 'rotate-180' : ''}`} />
                            </button>
                            {expandedSections.brands && (
                                <div className="space-y-1 pt-1 max-h-48 overflow-y-auto">
                                    {brands.map(brand => (
                                        <button
                                            key={brand}
                                            onClick={() => setSelectedBrand(brand)}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-colors ${selectedBrand === brand
                                                ? 'bg-[#5A0C3D]/5 text-[#5A0C3D] font-semibold'
                                                : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <span>{brand}</span>
                                            {selectedBrand === brand && <Check size={14} />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 5. Price Filter */}
                        <div className="space-y-3">
                            <button
                                onClick={() => toggleSection('priceRange')}
                                className="flex items-center justify-between w-full py-2 font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 cursor-pointer"
                            >
                                <span>Price (৳)</span>
                                <ChevronDown size={16} className={`transition-transform duration-200 ${expandedSections.priceRange ? 'rotate-180' : ''}`} />
                            </button>
                            {expandedSections.priceRange && (
                                <div className="flex gap-2 pt-1">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={priceRange.min}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5A0C3D] focus:ring-1 focus:ring-[#5A0C3D]"
                                        min="0"
                                    />
                                    <span className="text-gray-400 self-center">-</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={priceRange.max}
                                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5A0C3D] focus:ring-1 focus:ring-[#5A0C3D]"
                                        min="0"
                                    />
                                </div>
                            )}
                        </div>

                        {/* 6. Other Filters (Top Selling & Availability) */}
                        <div className="space-y-3">
                            <button
                                onClick={() => toggleSection('other')}
                                className="flex items-center justify-between w-full py-2 font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 cursor-pointer"
                            >
                                <span>Availability & Badges</span>
                                <ChevronDown size={16} className={`transition-transform duration-200 ${expandedSections.other ? 'rotate-180' : ''}`} />
                            </button>
                            {expandedSections.other && (
                                <div className="space-y-3 pt-2">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={topSellingOnly}
                                            onChange={(e) => setTopSellingOnly(e.target.checked)}
                                            className="w-4 h-4 text-[#5A0C3D] border-gray-300 rounded focus:ring-[#5A0C3D]"
                                        />
                                        <span className="text-sm text-gray-600 font-medium select-none">Top Selling Only</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={inStockOnly}
                                            onChange={(e) => setInStockOnly(e.target.checked)}
                                            className="w-4 h-4 text-[#5A0C3D] border-gray-300 rounded focus:ring-[#5A0C3D]"
                                        />
                                        <span className="text-sm text-gray-600 font-medium select-none">In Stock Only</span>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Drawer Footer */}
                    <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
                        <button
                            onClick={clearAllFilters}
                            className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors text-sm cursor-pointer text-center"
                        >
                            Reset
                        </button>
                        <button
                            onClick={() => setShowDrawer(false)}
                            className="flex-1 py-2.5 bg-[#5A0C3D] text-white font-semibold rounded-xl hover:bg-[#4a0a32] transition-colors text-sm cursor-pointer text-center"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>

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
        </div>
    );
}
