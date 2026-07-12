'use client';

import { useState, useEffect } from 'react';
import { X, SlidersHorizontal, ChevronDown, Search } from 'lucide-react';
import ProductGrid from './ProductGrid';
import Container from "../Container/Container";
import SkeletonLoader from "../Skeleton/SkeletonLoader";

export default function ProductsPageClient({ initialProducts, subCategoryName, isLoading: initialLoading = false }) {

    const [products, setProducts] = useState(initialProducts);
    const [filteredProducts, setFilteredProducts] = useState(initialProducts);
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        sortBy: 'latest'
    });
    const [showFilters, setShowFilters] = useState(false);
    const [isLoading, setIsLoading] = useState(initialLoading);

    // Price ranges for filter - matching search component
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
            // Simulate loading time
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [initialLoading]);

    // Update products when initialProducts changes
    useEffect(() => {
        if (initialProducts.length === 0) {
            setIsLoading(false);
        }
        setProducts(initialProducts);
        setFilteredProducts(initialProducts);
    }, [initialProducts]);

    // Filter and sort logic
    useEffect(() => {
        if (!products.length) return;

        let filtered = [...products];

        // Price filter
        if (filters.minPrice || filters.maxPrice) {
            filtered = filtered.filter(product => {
                const productPrice = parseFloat(product.price);
                const min = filters.minPrice ? parseFloat(filters.minPrice) : 0;
                const max = filters.maxPrice ? parseFloat(filters.maxPrice) : 1000000;
                return productPrice >= min && productPrice <= max;
            });
        }

        // Sorting
        filtered.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return filters.sortBy === 'latest'
                ? dateB.getTime() - dateA.getTime()
                : dateA.getTime() - dateB.getTime();
        });

        setFilteredProducts(filtered);
    }, [filters, products]);

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

    // Get the active price range label
    const getActivePriceRangeLabel = () => {
        if (!filters.minPrice && !filters.maxPrice) return null;

        const activeRange = priceRanges.find(
            range => range.min.toString() === filters.minPrice && range.max.toString() === filters.maxPrice
        );

        if (activeRange) {
            return activeRange.label;
        }

        // Custom range
        return `৳${filters.minPrice || '0'} - ৳${filters.maxPrice || '∞'}`;
    };

    // Skeleton Loading
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

    return (
        <Container>
            <div className="py-12">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 font-philosopher">
                        {subCategoryName}
                    </h1>
                    <p className="text-gray-600">
                        Found {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                    </p>
                </div>

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

                    {/* Filters Sidebar - Applied Search Component Design */}
                    {(showFilters || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
                        <div className="lg:w-1/4 text-gray-800">
                            <div className="bg-white hasib-rounded border border-gray-200 p-6 sticky top-24">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-semibold flex items-center gap-2">
                                        <SlidersHorizontal size={18} />
                                        Filters
                                    </h2>
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
                                    >
                                        <X size={14} />
                                        Clear all
                                    </button>
                                </div>

                                {/* Price Range - Radio Buttons */}
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
                                                className="w-full p-2 border border-stone-300 rounded-md text-sm focus:border-amber-400 focus:ring-amber-400"
                                                min="0"
                                                step="100"
                                            />
                                            <span className="text-gray-500 text-sm">to</span>
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={filters.maxPrice}
                                                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                                                className="w-full p-2 border border-stone-300 rounded-md text-sm focus:border-amber-400 focus:ring-amber-400"
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
                                        className="w-full p-2 border border-stone-300 rounded-md text-sm focus:border-amber-400 focus:ring-amber-400"
                                    >
                                        <option value="latest">Latest First</option>
                                        <option value="oldest">Oldest First</option>
                                    </select>
                                </div>

                                {/* Reset Button */}
                                <button
                                    onClick={clearFilters}
                                    className="w-full mt-4 bg-primary hover:bg-primary-hover text-black py-2.5 px-4 rounded-md text-sm font-medium transition-colors"
                                >
                                    Reset All Filters
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Products Grid */}
                    <div className="lg:w-3/4">
                        {/* Active Filters */}
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

                        {/* Products Grid */}
                        {filteredProducts.length > 0 ? (
                            <>
                                <ProductGrid products={filteredProducts} />
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <Search size={48} className="mx-auto text-gray-300 mb-4" />
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
    );
}