import OurStore from "@/components/OurStore/OurStore";
import { apiClient } from "@/lib/apiClient";
;
export const metadata = {
    title: "Our Store | Dazzling Diva",
    description:
        "Discover Dazzling Diva store locations, premium fashion collections, modern lifestyle products, and an elevated shopping experience designed for style and comfort.",
};

const page = async () => {

    const storeData = await apiClient("/api/our-store")

    return (
        <div>
            <OurStore storeData={storeData} />
        </div>
    );
};

export default page;