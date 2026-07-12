

import BundleProductDetails from "@/components/BundleProducts/BundleProductDetails";
import { apiClient } from "@/lib/apiClient";
import { notFound } from "next/navigation";

export default async function BundleDetailsPage(props) {
    //  params is ASYNC in Next.js 16
    const params = await props.params;
    const slug = params?.slug;

    if (!slug) {
        notFound();
    }

    console.log("Bundle slug:", slug);

    const bundleData = await apiClient(`/api/bundle-product/${slug}`);


    return <BundleProductDetails bundle={bundleData} />;
}
