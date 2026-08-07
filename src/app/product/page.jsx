import React from 'react';
import AllProductsClient from '@/components/Products/AllProductsClient';
import { getProducts } from '@/lib/products';
import { apiClient } from '@/lib/apiClient';

export default async function ProductPage() {
    let products = [];
    try {
        const [response, campaignsRes] = await Promise.all([
            getProducts({}, 1, 24),
            apiClient('/api/discount-campaign/active').catch(() => [])
        ]);

        products = response?.products || response?.data?.products || [];
        const campaigns = Array.isArray(campaignsRes) ? campaignsRes : (campaignsRes?.data || campaignsRes?.campaigns || []);
        const activeCampaign = campaigns.find(c => c.appliesToAll);

        if (activeCampaign && products.length > 0) {
            const campaignInfo = {
                campaignId: activeCampaign.id,
                campaignName: activeCampaign.name,
                campaignType: activeCampaign.campaignType,
                discountType: activeCampaign.discountType,
                discountValue: parseFloat(activeCampaign.discountValue) || 0,
                maxDiscountAmount: activeCampaign.maxDiscountAmount
                    ? parseFloat(activeCampaign.maxDiscountAmount)
                    : null,
                appliesToAll: activeCampaign.appliesToAll,
                startAt: activeCampaign.startAt,
                endAt: activeCampaign.endAt,
                showCountdown: activeCampaign.showCountdown,
                badgeText: activeCampaign.badgeText,
                badgeColor: activeCampaign.badgeColor,
                priority: activeCampaign.priority || 0,
            };

            products = products.map(p => ({
                ...p,
                campaignInfo: p.campaignInfo || campaignInfo
            }));
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }

    return (
        <AllProductsClient initialProducts={products} fetchUrl="/api/product?page=1&limit=1000" />
    );
}
