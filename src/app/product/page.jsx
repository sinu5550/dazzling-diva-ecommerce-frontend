import React from 'react';
import AllProductsClient from '@/components/Products/AllProductsClient';
import { getProducts } from '@/lib/products';

export default async function ProductPage() {
    let products = [];
    try {
        const response = await getProducts({}, 1, 24);
        products = response?.products || response?.data?.products || [];
    } catch (error) {
        console.error('Error fetching products:', error);
    }

    return (
        <AllProductsClient initialProducts={products} fetchUrl="/api/product?page=1&limit=1000" />
    );
}