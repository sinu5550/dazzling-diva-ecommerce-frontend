import AllProductsClient from "@/components/Products/AllProductsClient";
import { apiClient } from "@/lib/apiClient";
import React from 'react';

export const metadata = {
    title: "New Arrival - Orbixontech",
    description: "Explore the latest new arrivals at Orbixontech. Discover trendy, premium-quality fashion collections designed for modern style, comfort, and elegance.",
};

const Page = async () => {

    const proudctData = await apiClient("/api/product/new");
    const newArrivalProducts = proudctData?.data.products || [];

    return (
        <AllProductsClient
            initialProducts={newArrivalProducts}
            title="New Arrivals"
            breadcrumbLabel="New Arrivals"
        />
    );
};

export default Page;