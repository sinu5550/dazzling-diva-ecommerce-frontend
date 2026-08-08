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
import Testimonials from "./sections/Testimonials";

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
    })),
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
  const [
    heroSliderRes,
    newProductRes,
    topSellingRes,
    midBannerRes,
    bentoGalleryRes,
    mainCategoriesRes,
    activeCampaignsRes,
    testimonialsRes,
  ] = await Promise.allSettled([
    apiClient("/api/hero-sliders"),
    apiClient("/api/product/new"),
    apiClient("/api/product/top-selling?limit=10"),
    apiClient("/api/mid-banner"),
    apiClient("/api/bento-gallery"),
    getMainCategories(),
    fetchActiveCampaigns(),
    apiClient("/api/testimonials"),
  ]);

  const heroSliderData =
    heroSliderRes.status === "fulfilled" ? heroSliderRes.value : [];
  const newProductData =
    newProductRes.status === "fulfilled"
      ? newProductRes.value
      : { data: { products: [] } };
  const topSellingProductData =
    topSellingRes.status === "fulfilled"
      ? topSellingRes.value
      : { data: { products: [] } };
  const midBannerData =
    midBannerRes.status === "fulfilled" ? midBannerRes.value : null;
  const bentoImageGalleryData =
    bentoGalleryRes.status === "fulfilled" ? bentoGalleryRes.value : [];
  const mainCategoriesData =
    mainCategoriesRes.status === "fulfilled" ? mainCategoriesRes.value : [];
  const rawCampaigns =
    activeCampaignsRes.status === "fulfilled" ? activeCampaignsRes.value : [];
  const campaignsData = Array.isArray(rawCampaigns)
    ? rawCampaigns
    : rawCampaigns?.data || rawCampaigns?.campaigns || [];

  const testimonialsData =
    testimonialsRes.status === "fulfilled" ? testimonialsRes.value : null;

  // Extract all categories into a flat array
  const allCategories = getAllCategories(mainCategoriesData);

  // Extract all products from active campaigns
  let allProductsFromCampaigns = campaignsData.flatMap(
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
      })) || [],
  );

  const appliesToAllCampaign = campaignsData.find((c) => c.appliesToAll);
  const activeCampaignInfo = appliesToAllCampaign
    ? {
        campaignId: appliesToAllCampaign.id,
        campaignName: appliesToAllCampaign.name,
        campaignType: appliesToAllCampaign.campaignType,
        discountType: appliesToAllCampaign.discountType,
        discountValue: parseFloat(appliesToAllCampaign.discountValue) || 0,
        maxDiscountAmount:
          parseFloat(appliesToAllCampaign.maxDiscountAmount) || null,
        appliesToAll: appliesToAllCampaign.appliesToAll,
        startAt: appliesToAllCampaign.startAt,
        endAt: appliesToAllCampaign.endAt,
        showCountdown: appliesToAllCampaign.showCountdown,
        badgeText: appliesToAllCampaign.badgeText,
        badgeColor: appliesToAllCampaign.badgeColor,
        priority: appliesToAllCampaign.priority,
      }
    : null;

  // If campaign has appliesToAll: true and no specific discountProducts are linked, attach campaignInfo to catalog products
  if (allProductsFromCampaigns.length === 0 && appliesToAllCampaign) {
    const catalogProducts =
      newProductData?.data?.products ||
      newProductData?.products ||
      (Array.isArray(newProductData) ? newProductData : []);

    if (catalogProducts.length > 0) {
      allProductsFromCampaigns = catalogProducts.map((product) => ({
        ...product,
        campaignInfo: product.campaignInfo || activeCampaignInfo,
      }));
    }
  }

  let processedNewProductData = newProductData;
  if (activeCampaignInfo) {
    const rawList =
      newProductData?.data?.products ||
      newProductData?.products ||
      (Array.isArray(newProductData) ? newProductData : []);
    if (rawList.length > 0) {
      const enrichedProducts = rawList.map((p) => ({
        ...p,
        campaignInfo: p.campaignInfo || activeCampaignInfo,
      }));

      processedNewProductData = newProductData?.data?.products
        ? { ...newProductData, data: { ...newProductData.data, products: enrichedProducts } }
        : enrichedProducts;
    }
  }

  return (
    <div className="space-y-4 bg-white text-gray-800">
      <HeroSlider heroSliderData={heroSliderData} />
      <ShopCategory data={allCategories} />
      {/* <MidBannerOne midBannerData={midBannerData} /> */}
      <DiscountProducts productData={allProductsFromCampaigns} />
      <HomeBento />
      <NewArrivalProducts newProductData={processedNewProductData} />
      {/* <Promotional promoData={promoData} /> */}
      <BentoImageGalleryOne bentoImageGalleryData={bentoImageGalleryData} />
      <TopSellingProducts topSellingProductData={topSellingProductData} />
      <Testimonials testimonialsData={testimonialsData} />
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
