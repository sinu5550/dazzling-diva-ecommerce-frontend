'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AllProductsClient from '@/components/Products/AllProductsClient';
import { apiClient } from '@/lib/apiClient';

function SearchResultsContent() {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('q') || '';
    const [initialProducts, setInitialProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!searchQuery) return;
        const fetchInitial = async () => {
            setLoading(true);
            try {
                const response = await apiClient(`/api/product/search/detailed?query=${encodeURIComponent(searchQuery)}&page=1&limit=24`);
                const products = response?.products || response?.data?.products || response || [];
                setInitialProducts(products);
            } catch (error) {
                console.error("Error fetching initial search products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitial();
    }, [searchQuery]);

    const fetchUrl = `/api/product/search/detailed?query=${encodeURIComponent(searchQuery)}&page=1&limit=1000`;

    if (loading) {
        return (
            <div className="py-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#5A0C3D] border-t-transparent"></div>
            </div>
        );
    }

    return (
        <AllProductsClient
            initialProducts={initialProducts}
            fetchUrl={fetchUrl}
            title={`Search Results for "${searchQuery}"`}
            breadcrumbLabel={`Search: ${searchQuery}`}
        />
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="py-20 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#5A0C3D] border-t-transparent"></div>
            </div>
        }>
            <SearchResultsContent />
        </Suspense>
    );
}