'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import Container from "@/components/Container/Container";
import ProductCard from "@/components/Products/ProductCard";
import { apiClient } from "@/lib/apiClient";
import SkeletonLoader from "@/components/Skeleton/SkeletonLoader";

function SearchResultsContent() {

    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('q') || '';

    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        brands: [],
        categories: [],
        productType: 'all', // 'all', 'single', 'variant'
        sortBy: 'relevance'
    });
    const [availableBrands, setAvailableBrands] = useState([]);
    const [availableCategories, setAvailableCategories] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

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

    useEffect(() => {
        if (searchQuery) {
            fetchSearchResults();
        }
    }, [searchQuery, filters.sortBy, pagination.page, filters.minPrice, filters.maxPrice, filters.brands, filters.categories, filters.productType]);

    const fetchSearchResults = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                query: searchQuery,
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                sortBy: filters.sortBy,
                ...(filters.minPrice && { minPrice: filters.minPrice }),
                ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
                ...(filters.brands.length > 0 && { brandId: filters.brands[0].toString() }),
                ...(filters.categories.length > 0 && { categoryId: filters.categories[0].toString() }),
                ...(filters.productType !== 'all' && { productType: filters.productType })
            });

            const data = await apiClient(`/api/product/search/detailed?${params}`);

            // Handle both response formats
            let responseData;
            if (data.success !== undefined) {
                responseData = data.data;
            } else {
                responseData = data;
            }

            const productsData = responseData?.products || [];

            // Count variant and single products
            const variantCount = productsData.filter(p =>
                p.productType === 'variant' || (p.productVariants && p.productVariants.length > 0)
            ).length;
            const singleCount = productsData.length - variantCount;

            setProducts(productsData);
            setFilteredProducts(productsData);
            setPagination(responseData?.pagination || pagination);

            // Set available filters
            setAvailableBrands(responseData?.filters?.brands || []);
            setAvailableCategories(responseData?.filters?.categories || []);

            console.log(`Search: ${productsData.length} total (${singleCount} single, ${variantCount} variant)`);

        } catch (error) {
            console.error('Failed to fetch search results:', error);
            setProducts([]);
            setFilteredProducts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBrandToggle = (brandId) => {
        setFilters(prev => ({
            ...prev,
            brands: prev.brands.includes(brandId)
                ? prev.brands.filter(id => id !== brandId)
                : [brandId]
        }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleCategoryToggle = (categoryId) => {
        setFilters(prev => ({
            ...prev,
            categories: prev.categories.includes(categoryId)
                ? prev.categories.filter(id => id !== categoryId)
                : [categoryId]
        }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleProductTypeChange = (type) => {
        setFilters(prev => ({
            ...prev,
            productType: type
        }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handlePriceRangeChange = (min, max) => {
        setFilters(prev => ({
            ...prev,
            minPrice: min.toString(),
            maxPrice: max.toString()
        }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const clearPriceRange = () => {
        setFilters(prev => ({
            ...prev,
            minPrice: '',
            maxPrice: ''
        }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({
            minPrice: '',
            maxPrice: '',
            brands: [],
            categories: [],
            productType: 'all',
            sortBy: 'relevance'
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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

    // Count products by type
    const productTypeCounts = {
        all: filteredProducts.length,
        single: filteredProducts.filter(p =>
            p.productType === 'single' || (!p.productType && (!p.productVariants || p.productVariants.length === 0))
        ).length,
        variant: filteredProducts.filter(p =>
            p.productType === 'variant' || (p.productVariants && p.productVariants.length > 0)
        ).length
    };

    const gridCols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4";

    if (isLoading && pagination.page === 1) {
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
        <Container className="py-8">
            {/* Search Header */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 font-philosopher">
                    Search Results for "{searchQuery}"
                </h1>
                <div className="flex items-center gap-4 flex-wrap">
                    <p className="text-gray-600">
                        Found {pagination.total} {pagination.total === 1 ? 'product' : 'products'}
                    </p>
                    {productTypeCounts.variant > 0 && (
                        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            {productTypeCounts.variant} with multiple options
                        </span>
                    )}
                </div>
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

                {/* Filters Sidebar */}
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

                            {/* Product Type Filter */}
                            {productTypeCounts.variant > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Product Type</h3>
                                    <div className="space-y-2">
                                        <label className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="productType"
                                                    checked={filters.productType === 'all'}
                                                    onChange={() => handleProductTypeChange('all')}
                                                    className="text-amber-600 focus:ring-amber-500 border-stone-300"
                                                />
                                                <span className="text-sm text-gray-700">All Products</span>
                                            </div>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                {productTypeCounts.all}
                                            </span>
                                        </label>
                                        <label className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="productType"
                                                    checked={filters.productType === 'variant'}
                                                    onChange={() => handleProductTypeChange('variant')}
                                                    className="text-amber-600 focus:ring-amber-500 border-stone-300"
                                                />
                                                <span className="text-sm text-gray-700">Multiple Options</span>
                                            </div>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                {productTypeCounts.variant}
                                            </span>
                                        </label>
                                        <label className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="productType"
                                                    checked={filters.productType === 'single'}
                                                    onChange={() => handleProductTypeChange('single')}
                                                    className="text-amber-600 focus:ring-amber-500 border-stone-300"
                                                />
                                                <span className="text-sm text-gray-700">Single Option</span>
                                            </div>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                {productTypeCounts.single}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            )}

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
                                            className="w-full p-2 border border-stone-300 rounded-md text-sm focus:border-amber-400 focus:ring-amber-400"
                                        />
                                        <span className="text-gray-500 text-sm">to</span>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.maxPrice}
                                            onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                                            className="w-full p-2 border border-stone-300 rounded-md text-sm focus:border-amber-400 focus:ring-amber-400"
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
                                    <option value="relevance">Relevance</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="newest">Newest</option>
                                    <option value="popular">Most Popular</option>
                                </select>
                            </div>

                            {/* Brands */}
                            {availableBrands.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Brands</h3>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {availableBrands.map(brand => (
                                            <label key={brand.id} className="flex items-center justify-between gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.brands.includes(brand.id)}
                                                        onChange={() => handleBrandToggle(brand.id)}
                                                        className="rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                                                    />
                                                    <span className="text-sm text-gray-700">{brand.name}</span>
                                                </div>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                    {brand.searchCount || 0}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Categories */}
                            {availableCategories.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Categories</h3>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {availableCategories.map(category => (
                                            <label key={category.id} className="flex items-center justify-between gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.categories.includes(category.id)}
                                                        onChange={() => handleCategoryToggle(category.id)}
                                                        className="rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                                                    />
                                                    <span className="text-sm text-gray-700">{category.name}</span>
                                                </div>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                    {category.searchCount || 0}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                <div className="lg:w-3/4">
                    {/* Active Filters */}
                    {(filters.brands.length > 0 || filters.categories.length > 0 || filters.minPrice || filters.maxPrice || filters.productType !== 'all') && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {filters.productType !== 'all' && (
                                <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-sm font-medium">
                                    {filters.productType === 'variant' ? 'Multiple Options' : 'Single Option'}
                                    <button
                                        onClick={() => handleProductTypeChange('all')}
                                        className="hover:text-purple-900 ml-1"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            )}
                            {filters.brands.map(brandId => {
                                const brand = availableBrands.find(b => b.id === brandId);
                                return brand && (
                                    <span key={brand.id} className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-sm font-medium">
                                        Brand: {brand.name}
                                        <button
                                            onClick={() => handleBrandToggle(brand.id)}
                                            className="hover:text-amber-900 ml-1"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                );
                            })}
                            {filters.categories.map(categoryId => {
                                const category = availableCategories.find(c => c.id === categoryId);
                                return category && (
                                    <span key={category.id} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium">
                                        Category: {category.name}
                                        <button
                                            onClick={() => handleCategoryToggle(category.id)}
                                            className="hover:text-blue-900 ml-1"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                );
                            })}
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
                    {isLoading && pagination.page > 1 ? (
                        <SkeletonLoader
                            type="productGrid"
                            count={pagination.limit}
                            gridCols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                            gap="gap-6"
                        />
                    ) : filteredProducts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-12">
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className={`px-4 py-2 hasib-rounded border ${pagination.page === 1
                                            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'border-stone-300 text-gray-700 hover:border-amber-400 hover:text-amber-600'
                                            }`}
                                    >
                                        Previous
                                    </button>

                                    {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                                        let pageNum;
                                        if (pagination.totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (pagination.page <= 3) {
                                            pageNum = i + 1;
                                        } else if (pagination.page >= pagination.totalPages - 2) {
                                            pageNum = pagination.totalPages - 4 + i;
                                        } else {
                                            pageNum = pagination.page - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`px-4 py-2 hasib-rounded border ${pagination.page === pageNum
                                                    ? 'border-amber-400 bg-amber-50 text-amber-600'
                                                    : 'border-stone-300 text-gray-700 hover:border-amber-400 hover:text-amber-600'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page === pagination.totalPages}
                                        className={`px-4 py-2 hasib-rounded border ${pagination.page === pagination.totalPages
                                            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'border-stone-300 text-gray-700 hover:border-amber-400 hover:text-amber-600'
                                            }`}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    ) : !isLoading ? (
                        <div className="text-center py-12">
                            <Search size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
                            <p className="text-gray-600 mb-6">
                                Try adjusting your filters or search for something else
                            </p>
                            <button
                                onClick={clearFilters}
                                className="px-6 py-3 bg-secound text-white rounded hover:bg-secound-hover transition-colors font-medium cursor-pointer"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>
        </Container>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <Container>
                <section className="py-8 bg-white">
                    <div className="py-8">
                        <div className="mb-8">
                            <div className="h-8 w-64 bg-gray-200 rounded mb-2 animate-pulse"></div>
                            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                        </div>

                        <SkeletonLoader
                            type="productGridWithFilters"
                            count={12}
                            gridCols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                            gap="gap-6"
                            withFilters={true}
                            withHeader={true}
                        />
                    </div>
                </section>
            </Container>
        }>
            <SearchResultsContent />
        </Suspense>
    );
}