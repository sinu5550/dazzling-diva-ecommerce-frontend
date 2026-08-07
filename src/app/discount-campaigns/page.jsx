// app/discount-campaigns/page.js
import React from "react";
import { apiClient } from "@/lib/apiClient";
import AllProductsClient from "@/components/Products/AllProductsClient";

// API active campaigns fetch
export async function fetchActiveCampaigns() {
  try {
    const response = await apiClient("/api/discount-campaign/active", {
      next: { revalidate: 60 },
    });
    return response || [];
  } catch (error) {
    console.error("Error fetching active campaigns:", error);
    return [];
  }
}

const DiscountCampaignsPage = async () => {
  const rawCampaigns = await fetchActiveCampaigns();
  const campaignsData = Array.isArray(rawCampaigns) 
    ? rawCampaigns 
    : (rawCampaigns?.data || rawCampaigns?.campaigns || []);

  // Fetch full product catalog if any campaign has appliesToAll: true
  const hasAppliesToAll = campaignsData.some(c => c.appliesToAll);
  let catalogProducts = [];

  if (hasAppliesToAll) {
    try {
      const productsRes = await apiClient("/api/product");
      catalogProducts = Array.isArray(productsRes)
        ? productsRes
        : (productsRes?.products || productsRes?.data?.products || productsRes?.data || []);
    } catch (err) {
      console.error("Error fetching full catalog for appliesToAll campaign:", err);
    }
  }

  // Extract all products from active campaigns with proper price calculation
  const allProductsFromCampaigns = campaignsData.flatMap((campaign) => {
    let items = campaign.discountProducts || campaign.products || [];

    // If campaign applies to all products and discountProducts array is empty, apply campaign to all catalog products
    if (campaign.appliesToAll && items.length === 0) {
      items = catalogProducts;
    }

    if (items.length === 0) {
      return [];
    }

    return items.map((dp) => {
      const product = dp.product || dp;
      if (!product || !product.id) return null;

      const originalPrice = parseFloat(product.price) || 0;
      const discountValue = parseFloat(campaign.discountValue) || 0;
      const maxDiscountAmount = campaign.maxDiscountAmount
        ? parseFloat(campaign.maxDiscountAmount)
        : null;

      // Calculate discounted price based on discount type
      let discountedPrice = originalPrice;
      let discountAmount = 0;

      if (campaign.discountType === "Fixed") {
        discountAmount = Math.min(discountValue, originalPrice);
        discountedPrice = originalPrice - discountAmount;
      } else {
        // Percentage discount
        discountAmount = (originalPrice * discountValue) / 100;

        // Apply max discount if specified
        if (maxDiscountAmount && discountAmount > maxDiscountAmount) {
          discountAmount = maxDiscountAmount;
        }

        discountedPrice = originalPrice - discountAmount;
      }

      return {
        ...product,
        originalPrice: originalPrice,
        discountedPrice: Math.max(0, discountedPrice),
        discountAmount: discountAmount,
        campaignInfo: {
          campaignId: campaign.id,
          campaignName: campaign.name,
          campaignType: campaign.campaignType,
          discountType: campaign.discountType,
          discountValue: discountValue,
          maxDiscountAmount: maxDiscountAmount,
          appliesToAll: campaign.appliesToAll,
          startAt: campaign.startAt,
          endAt: campaign.endAt,
          showCountdown: campaign.showCountdown,
          badgeText: campaign.badgeText,
          badgeColor: campaign.badgeColor,
          priority: campaign.priority || 0,
        },
      };
    }).filter(Boolean);
  });

  return (
    <AllProductsClient
      initialProducts={allProductsFromCampaigns}
      title="Special Offers"
      breadcrumbLabel="Offers"
      bannerSrc="/assects/flashdeals-banner.png"
      bannerType="campaign"
    />
  );
};

export default DiscountCampaignsPage;

// Metadata
export const metadata = {
  title: "Discount Products - Special Offers & Flash Deals",
  description:
    "Browse our exclusive discount campaigns and special offers. Limited time deals on quality products.",
};
