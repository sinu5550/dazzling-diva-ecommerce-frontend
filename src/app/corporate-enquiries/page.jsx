import CorporateEnquiries from "@/components/CorporateEnquiries/CorporateEnquiries";
import { apiClient } from "@/lib/apiClient";


const page = async () => {

    const contactData = await apiClient("/api/contact")
    return (
        <div>
            <CorporateEnquiries contactData={contactData} />
        </div>
    );
};

export default page;