import BundleProductsClient from "@/components/BundleProducts/BundleProducts";
import { apiClient } from "@/lib/apiClient";


export const metadata = {
    title: "Bundle Products | Dazzling Diva",
    description: "View bundle products"
};


export default async function BundleProductsPage() {
    try {
        const response = await apiClient('/api/bundle-product');

        const productData = {
            data: response?.data || [],
            pagination: response?.pagination || {
                page: 1,
                limit: 10,
                total: 0,
                pages: 1
            }
        };

        // Pass productData directly, no isLoading needed from server
        return <BundleProductsClient initialProductData={productData} />;

    } catch (error) {
        console.error('Error fetching bundle products:', error);

        // Pass empty data on error
        return (
            <BundleProductsClient
                initialProductData={{
                    data: [],
                    pagination: { page: 1, limit: 10, total: 0, pages: 1 }
                }}
            />
        );
    }
}