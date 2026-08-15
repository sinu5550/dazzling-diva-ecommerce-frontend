"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  getProductBySlug,
  getRelatedProducts,
  getDiscountProductBySlug,
} from "@/lib/products";
import ProductDetailsClient from "@/components/Products/ProductDetailsClient";
import DiscountProductDetailsClient from "@/components/DiscountProduct/DiscountProductDetailsClient";
import { RefreshCw, AlertTriangle, ArrowLeft } from "lucide-react";
import Container from "@/components/Container/Container";
import Link from "next/link";

const productDetailsCache = new Map();

export default function ProductDetailsLoader({ slug, type = "product" }) {
  const cacheKey = `${type}-${slug}`;
  const cachedEntry = productDetailsCache.get(cacheKey);

  const [data, setData] = useState(
    cachedEntry || { product: null, relatedProducts: [] },
  );
  const [status, setStatus] = useState({ loading: !cachedEntry, error: null });
  const loadedSlugRef = useRef(cachedEntry ? slug : null);

  const loadData = useCallback(async () => {
    if (loadedSlugRef.current === slug && productDetailsCache.has(cacheKey)) {
      return;
    }

    if (!productDetailsCache.has(cacheKey)) {
      setStatus({ loading: true, error: null });
    }

    try {
      const { apiClient } = await import("@/lib/apiClient");

      // 1. Fetch Product Data and Active Campaigns in parallel
      const [productRes, activeCampaignsRes] = await Promise.all([
        type === "campaign"
          ? getDiscountProductBySlug(slug)
          : getProductBySlug(slug),
        apiClient("/api/discount-campaign/active").catch(() => null),
      ]);

      let productData = productRes?.data || productRes?.product || productRes;
      if (
        !productData ||
        (!productData.id && !productData.productName && !productData.name)
      ) {
        throw new Error("Product not found");
      }

      // 2. Attach store-wide discount campaign if active
      const activeCampaigns = Array.isArray(activeCampaignsRes)
        ? activeCampaignsRes
        : activeCampaignsRes?.data || activeCampaignsRes?.campaigns || [];
      const appliesToAllCampaign = activeCampaigns.find((c) => c.appliesToAll);

      if (appliesToAllCampaign && !productData.campaignInfo) {
        productData = {
          ...productData,
          campaignInfo: {
            campaignId: appliesToAllCampaign.id,
            campaignName: appliesToAllCampaign.name,
            campaignType: appliesToAllCampaign.campaignType,
            discountType: appliesToAllCampaign.discountType,
            discountValue: parseFloat(appliesToAllCampaign.discountValue) || 0,
            maxDiscountAmount: appliesToAllCampaign.maxDiscountAmount
              ? parseFloat(appliesToAllCampaign.maxDiscountAmount)
              : null,
            appliesToAll: appliesToAllCampaign.appliesToAll,
            startAt: appliesToAllCampaign.startAt,
            endAt: appliesToAllCampaign.endAt,
            showCountdown: appliesToAllCampaign.showCountdown,
            badgeText: appliesToAllCampaign.badgeText,
            badgeColor: appliesToAllCampaign.badgeColor,
            priority: appliesToAllCampaign.priority || 0,
          },
        };
      }

      // 3. Fetch Related Products
      const catId =
        productData.categoryId ||
        productData.subCategory?.categoryId ||
        productData.subCategory?.category?.id;
      const mainCatId =
        productData.mainCategoryId ||
        productData.subCategory?.category?.mainCategoryId ||
        productData.subCategory?.category?.mainCategory?.id;

      let relatedData = [];
      try {
        relatedData = await getRelatedProducts(
          productData.subCategoryId,
          productData.id || productData.productId,
          8,
          catId,
          mainCatId,
        );
        if (appliesToAllCampaign && Array.isArray(relatedData)) {
          relatedData = relatedData.map((rp) => ({
            ...rp,
            campaignInfo: rp.campaignInfo || productData.campaignInfo,
          }));
        }
      } catch (relErr) {
        console.warn("Error fetching related products:", relErr);
      }

      const payload = {
        product: productData,
        relatedProducts: relatedData || [],
      };
      productDetailsCache.set(cacheKey, payload);
      setData(payload);
      loadedSlugRef.current = slug;
      setStatus({ loading: false, error: null });
    } catch (err) {
      console.error("Error loading product details:", err);
      setStatus({
        loading: false,
        error: err.message || "Failed to load product details",
      });
    }
  }, [slug, type, cacheKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (status.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-outfit px-4">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-xl p-8 text-center animate-fadeIn">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="text-red-500 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">
            {status.error === "Product not found"
              ? "We couldn't find the product you're looking for. It might have been removed or is currently unavailable."
              : "We encountered an error while fetching the product details. Please check your internet connection."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={loadData}
              className="px-6 py-3 bg-[#5A0C3D] hover:bg-[#4a0a32] text-white font-medium rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              <span>Retry Loading</span>
            </button>
            <Link
              href="/"
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status.loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        {/* Friendly Premium Message Overlay */}
        <div className="bg-[#5A0C3D]/5 border-b border-[#5A0C3D]/10 py-6 px-4 sticky top-[72px] z-40 backdrop-blur-md">
          <Container>
            <div className="flex items-center justify-center gap-3 max-w-2xl mx-auto">
              <p className="text-sm md:text-base font-medium text-[#5A0C3D] text-center font-outfit leading-relaxed">
                Awesome! You’ve chosen a beautiful product that everyone loves.
                We're getting it ready for you...
              </p>
            </div>
          </Container>
        </div>

        {/* Premium Details Skeleton Loader */}
        <Container className="py-8 md:py-12 font-outfit">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 animate-pulse">
            {/* Left Column: Image Gallery Skeleton */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-[4/5] w-full bg-gray-200 rounded-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
              </div>
              {/* Thumbnails */}
              <div className="flex gap-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Details Skeleton */}
            <div className="space-y-6">
              {/* Category & Brand */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded-md w-1/4" />
                <div className="h-8 bg-gray-200 rounded-lg w-3/4" />
              </div>

              {/* Ratings & Stock */}
              <div className="flex items-center gap-4">
                <div className="h-5 bg-gray-200 rounded-md w-1/3" />
                <div className="h-5 bg-gray-200 rounded-md w-1/4" />
              </div>

              {/* Price */}
              <div className="h-10 bg-gray-200 rounded-lg w-1/3" />

              <hr className="border-gray-200" />

              {/* Options/Variants */}
              <div className="space-y-3">
                <div className="h-5 bg-gray-200 rounded-md w-1/5" />
                <div className="flex gap-3">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="w-12 h-12 bg-gray-200 rounded-full"
                    />
                  ))}
                </div>
              </div>

              {/* Description Short */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded-md w-full" />
                <div className="h-4 bg-gray-200 rounded-md w-full" />
                <div className="h-4 bg-gray-200 rounded-md w-2/3" />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <div className="h-14 bg-gray-200 rounded-xl flex-1" />
                <div className="h-14 bg-gray-200 rounded-xl w-14" />
              </div>

              <hr className="border-gray-200" />

              {/* Details Lists */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded-md w-1/2" />
                <div className="h-4 bg-gray-200 rounded-md w-1/3" />
              </div>
            </div>
          </div>
        </Container>

        <style jsx>{`
          @keyframes shimmer {
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </div>
    );
  }

  // Fully Loaded Transition Component
  return (
    <div className="transition-opacity duration-500 ease-in-out opacity-100 animate-fadeIn">
      {type === "campaign" || data.product?.campaignInfo ? (
        <DiscountProductDetailsClient
          product={data.product}
          relatedProducts={data.relatedProducts}
        />
      ) : (
        <ProductDetailsClient
          product={data.product}
          relatedProducts={data.relatedProducts}
        />
      )}
    </div>
  );
}
