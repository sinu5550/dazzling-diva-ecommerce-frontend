// app/discount-campaigns/page.js
import React from 'react';
import { apiClient } from "@/lib/apiClient";
import DiscountProductClient from "@/components/DiscountProduct/DiscountProductClient";

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

    const campaignsData = await fetchActiveCampaigns();

    // Extract all products from active campaigns with proper price calculation
    const allProductsFromCampaigns = campaignsData.flatMap(campaign => {
        if (!campaign.discountProducts || campaign.discountProducts.length === 0) {
            return [];
        }

        return campaign.discountProducts.map(dp => {
            const product = dp.product;
            const originalPrice = parseFloat(product.price) || 0;
            const discountValue = parseFloat(campaign.discountValue) || 0;
            const maxDiscountAmount = campaign.maxDiscountAmount
                ? parseFloat(campaign.maxDiscountAmount)
                : null;

            // Calculate discounted price based on discount type
            let discountedPrice = originalPrice;
            let discountAmount = 0;

            if (campaign.discountType === 'Fixed') {
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
                    priority: campaign.priority || 0
                }
            };
        });
    });

    return (
        <div className="space-y-10 lg:space-y-28">
            <DiscountProductClient
                products={allProductsFromCampaigns}
                isLoading={true} />
        </div>
    );
};

export default DiscountCampaignsPage;

// Metadata
export const metadata = {
    title: 'Discount Products - Special Offers & Flash Deals',
    description: 'Browse our exclusive discount campaigns and special offers. Limited time deals on quality products.',
};