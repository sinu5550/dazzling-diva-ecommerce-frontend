import ShopCategory from "./sections/ShopCategory";
import TopPickSeason from "./sections/TopPickSeason";
import Promotional from "./sections/Promotional";
import { apiClient } from "@/lib/apiClient";
import DiscountProducts from "./sections/DiscountProducts";
import HomeBento from "./sections/HomeBento";
import Coupon from "./sections/Coupon";
import DelayedModal from "../ui/DelayedModal";
import HeroSlider from "../Hero/Slider";
import NewArrivalProducts from "./sections/NewArrivalProdcuts";
import { TopSellingProducts } from "./sections/TopSellingProducts";
import MidBannerTwo from "./sections/MidBannerTwo";
import MidBannerOne from "./sections/MidBannerOne";
import BentoImageGalleryTwo from "./sections/BentoImageGalleryTwo";
import BentoImageGalleryOne from "./sections/BentoImageGalleryOne";




// API main categories fetch
export async function getMainCategories() {
  try {
    return await apiClient("/api/main-categories");
  } catch (error) {
    console.error("Error fetching main categories:", error);
    return [];
  }
}

// Utility function to extract all categories from main categories
function getAllCategories(mainCategories) {
  if (!mainCategories || !Array.isArray(mainCategories)) {
    return [];
  }

  return mainCategories.flatMap((mainCat) =>
    (mainCat.categories || []).map((cat) => ({
      ...cat,
      mainCategoryName: mainCat.name,
      mainCategoryCode: mainCat.code,
      mainCategoryImage: mainCat.image,
    }))
  );
}

// API active campaigns fetch
export async function fetchActiveCampaigns() {
  try {
    return await apiClient("/api/discount-campaign/active", {
      revalidate: 60,
    });
  } catch (error) {
    console.error("Error fetching active campaigns:", error);
    return [];
  }
}

const Home = async () => {


  const topPickData = await apiClient("/api/top-picks");
  const promoData = await apiClient("/api/promos");
  const heroSliderData = await apiClient("/api/hero-sliders");
  const couponData = await apiClient("/api/coupon");
  const productData = await apiClient("/api/product");
  const newProductData = await apiClient("/api/product/new");
  const topSellingProductData = await apiClient("/api/product/top-selling?limit=10");
  const midBannerData = await apiClient("/api/mid-banner");
  const bentoImageGalleryData = await apiClient("/api/bento-gallery");


  const [mainCategories, activeCampaigns] = await Promise.allSettled([
    getMainCategories(),
    fetchActiveCampaigns(),
  ]);

  const mainCategoriesData =
    mainCategories.status === "fulfilled" ? mainCategories.value : [];
  const campaignsData =
    activeCampaigns.status === "fulfilled" ? activeCampaigns.value : [];

  // Extract all categories into a flat array
  const allCategories = getAllCategories(mainCategoriesData);

  // Extract all products from active campaigns
  const allProductsFromCampaigns = campaignsData.flatMap(
    (campaign) =>
      (campaign.discountProducts || []).map((dp) => ({
        ...dp.product,
        campaignInfo: {
          campaignId: campaign.id,
          campaignName: campaign.name,
          campaignType: campaign.campaignType,
          discountType: campaign.discountType,
          discountValue: parseFloat(campaign.discountValue) || 0,
          maxDiscountAmount: parseFloat(campaign.maxDiscountAmount) || null,
          appliesToAll: campaign.appliesToAll,
          startAt: campaign.startAt,
          endAt: campaign.endAt,
          showCountdown: campaign.showCountdown,
          badgeText: campaign.badgeText,
          badgeColor: campaign.badgeColor,
          priority: campaign.priority,
        },
      })) || []
  );

  return (
    <div className="space-y-10 bg-white text-gray-800">
      <HeroSlider heroSliderData={heroSliderData} />
      <ShopCategory data={allCategories} />
      {/* <MidBannerOne midBannerData={midBannerData} /> */}
      <DiscountProducts productData={allProductsFromCampaigns} />
      <HomeBento />
      <NewArrivalProducts newProductData={newProductData} />
      {/* <Promotional promoData={promoData} /> */}
      <BentoImageGalleryOne bentoImageGalleryData={bentoImageGalleryData} />
      <TopSellingProducts topSellingProductData={topSellingProductData} />
      <MidBannerTwo midBannerData={midBannerData} />
      {/* <BentoImageGalleryTwo bentoImageGalleryData={bentoImageGalleryData} /> */}
      {/* <TopPickSeason topPickData={topPickData} /> */}


      {/* <Coupon couponData={couponData} /> */}

      <div className="">
        <DelayedModal allProducts={allProductsFromCampaigns} />
      </div>
    </div>
  );
};

export default Home;
