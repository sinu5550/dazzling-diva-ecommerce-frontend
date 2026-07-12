import Container from "@/components/Container/Container";
import NewArrtivalClient from "@/components/NewArrival/NewArrivalProduct";
import { apiClient } from "@/lib/apiClient";
import Link from "next/link";
import React from 'react';

export const metadata = {
    title: "New Arrival - Orbixontech",
    description: "Explore the latest new arrivals at Orbixontech. Discover trendy, premium-quality fashion collections designed for modern style, comfort, and elegance.",
};

const Page = async () => {

    const proudctData = await apiClient("/api/product/new");
    const newArrivalProducts = proudctData?.data.products || [];


    return (
        <Container>
            <div className="flex gap-2 text-gray-700 mt-10 text-sm md:text-base">
                <Link href="/" className="hover:underline hover:text-primary">Home</Link> /
                <p className="font-semibold">New Arrival Products</p>
            </div>

            <NewArrtivalClient
                initialProducts={newArrivalProducts}
                isLoading={true}
            />
        </Container>
    );
};

export default Page;