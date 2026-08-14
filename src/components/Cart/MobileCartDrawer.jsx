// components/Cart/MobileCartDrawer.jsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCartManager } from "@/hooks/useCartManager";
import { apiClient } from "@/lib/apiClient";
import {
  FaChevronLeft,
  FaChevronRight,
  FaArrowRight,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import { FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { getDefaultVariant, calculateVariantPrice, extractVariantOptions } from "@/lib/variantHelpers";
import QuickViewModal from "@/components/Modal/QuickViewModal";
import { useCheckoutSession } from "@/hooks/useCheckoutSession";

const DEFAULT_IMAGE =
  "https://res.cloudinary.com/dh34eqbhu/image/upload/v1747211252/ju2uf9y33y1bncwufrl7.png";

const getItemImage = (item) => {
  if (!item) return DEFAULT_IMAGE;
  const rawImg = Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : item.image;
  if (!rawImg) return DEFAULT_IMAGE;
  if (typeof rawImg === "string" && rawImg.trim() !== "") return rawImg;
  if (typeof rawImg === "object") return rawImg.url || rawImg.image || rawImg.src || DEFAULT_IMAGE;
  return DEFAULT_IMAGE;
};

export default function MobileCartDrawer({ isOpen = true, onClose }) {
  const router = useRouter();
  const {
    getAllCartItems,
    getCombinedTotal,
    removeItem,
    updateItemQuantity,
    addToCart,
    loading: cartLoading,
  } = useCartManager();

  const cartItems = getAllCartItems();
  const total = getCombinedTotal();

  // State for "You May Also Like" products
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [recIndex, setRecIndex] = useState(0);
  const [recLoading, setRecLoading] = useState(false);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const recScrollRef = useRef(null);

  // Fetch recommended products and active discount campaigns
  useEffect(() => {
    let isMounted = true;
    const fetchRecommendations = async () => {
      setRecLoading(true);
      try {
        const [res, campaignsRes] = await Promise.all([
          apiClient("/api/product/top-selling?limit=10"),
          apiClient("/api/discount-campaign/active").catch(() => null)
        ]);

        let products = res?.data || res?.products || (Array.isArray(res) ? res : []);
        
        const campaigns = Array.isArray(campaignsRes)
          ? campaignsRes
          : (campaignsRes?.data || campaignsRes?.campaigns || []);
        const appliesToAllCampaign = campaigns.find((c) => c.appliesToAll);

        if (appliesToAllCampaign && Array.isArray(products)) {
          const campaignInfo = {
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
          };

          products = products.map((p) => ({
            ...p,
            campaignInfo: p.campaignInfo || campaignInfo
          }));
        }

        if (isMounted && Array.isArray(products) && products.length > 0) {
          setRecommendedProducts(products);
        }
      } catch (err) {
        console.error("Error fetching recommended products:", err);
      } finally {
        if (isMounted) setRecLoading(false);
      }
    };
    fetchRecommendations();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter out products already in cart
  const availableRecommendations = recommendedProducts.filter(
    (prod) => !cartItems.some((item) => (item.productId || item.id) === (prod.id || prod._id))
  );

  const displayList = availableRecommendations.length > 0 ? availableRecommendations : recommendedProducts;

  // Auto-sliding interval for "You May Also Like"
  useEffect(() => {
    if (displayList.length <= 1) return;
    const interval = setInterval(() => {
      setRecIndex((prev) => (prev + 1) % displayList.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [displayList.length]);

  const handleNextRec = () => {
    if (displayList.length === 0) return;
    setRecIndex((prev) => (prev + 1) % displayList.length);
  };

  const handlePrevRec = () => {
    if (displayList.length === 0) return;
    setRecIndex((prev) => (prev - 1 + displayList.length) % displayList.length);
  };

  const formatPrice = (price) => {
    const num = parseFloat(price || 0);
    return `৳${num.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const handleQuantityChange = async (item, change) => {
    const itemId = item.productId || item.id;
    const variantId = item.variantId || null;
    const currentQty = parseInt(item.quantity || 1);
    const newQty = currentQty + change;

    if (newQty < 1) {
      await removeItem(itemId, item.isBundle ? "bundle" : "regular", variantId);
      toast.success("Item removed");
      return;
    }

    const key = variantId ? `${itemId}-${variantId}` : itemId;
    setUpdatingItems((prev) => new Set(prev).add(key));
    try {
      await updateItemQuantity(itemId, newQty, variantId);
    } catch (err) {
      toast.error("Failed to update quantity");
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const handleRemove = async (item) => {
    const itemId = item.productId || item.id;
    const variantId = item.variantId || null;
    const type = item.isBundle ? "bundle" : "regular";
    await removeItem(itemId, type, variantId);
    toast.success("Item removed");
  };

  const handleAddRecommendation = async (prod) => {
    try {
      const prodId = prod.id || prod._id;
      const isVariant = prod.productType === "variant";
      const defaultVariant = isVariant ? getDefaultVariant(prod) : null;
      
      const { original: originalPrice, discounted: discountedPrice } = isVariant
        ? calculateVariantPrice(defaultVariant, prod)
        : calculateVariantPrice(null, prod);

      const availableStock = isVariant
        ? (defaultVariant?.quantity ?? 0)
        : (prod.quantity ?? 0);

      const prodImages = isVariant && defaultVariant?.image
        ? [defaultVariant.image]
        : Array.isArray(prod.images) && prod.images.length > 0
          ? prod.images
          : prod.image ? [prod.image] : [];

      await addToCart(
        {
          id: prodId,
          productId: prodId,
          slug: prod.slug || '',
          sku: isVariant && defaultVariant ? defaultVariant.sku : (prod.sku || ''),
          productName: prod.title || prod.productName || prod.name || "Product",
          price: discountedPrice,
          originalPrice: originalPrice,
          discountValue: prod.campaignInfo?.discountValue || prod.discountValue || 0,
          images: prodImages,
          status: prod.status || 'active',
          taxType: prod.taxType || null,
          tax: prod.tax || null,
          stockQuantity: availableStock,
          ...(isVariant && defaultVariant && {
            variantId: defaultVariant.id,
            variantAttributes: defaultVariant.attributes,
            productType: 'variant'
          })
        },
        1,
        isVariant && defaultVariant ? defaultVariant.id : null
      );
      toast.success("Added to cart!");
    } catch (err) {
      console.error("Cart add error:", err);
      toast.error("Could not add item to cart");
    }
  };

  const { createCartCheckoutSession } = useCheckoutSession();

  const handleCheckoutClick = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Initialize checkout session from current cart items
    createCartCheckoutSession(cartItems);

    if (onClose) onClose();

    setTimeout(() => {
      router.push("/checkout");
    }, 100);
  };

  const currentRec = displayList[recIndex] || null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="mobile-cart-drawer-root" className="fixed inset-0 z-[99999] flex justify-end font-outfit">
          {/* Backdrop Overlay */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer Content Panel */}
          <motion.div
            key="drawer-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl z-10 overflow-hidden"
          >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
            <h2 className="text-sm sm:text-base font-bold tracking-wider text-gray-900 uppercase">
              SHOPPING CART
            </h2>
            <button
              onClick={onClose || (() => router.back())}
              className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
            >
              <span>Close</span>
              <FaArrowRight size={12} />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center py-8">
                <p className="text-gray-500 text-sm font-medium">Your shopping cart is empty.</p>
                <button
                  onClick={onClose || (() => router.push("/product"))}
                  className="mt-4 px-5 py-2 bg-[#5A0C3D] text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow-sm hover:bg-[#450322]"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cartItems.map((item, idx) => {
                const quantity = parseInt(item.quantity || 1);
                const unitPrice = parseFloat(item.price || 0);
                const lineTotal = unitPrice * quantity;
                const imgUrl = getItemImage(item);
                const itemKey = `${item.id || item.productId}-${item.variantId || idx}`;
                const isUpdating = updatingItems.has(itemKey);
                const stockLimit = item.stockQuantity != null ? parseInt(item.stockQuantity) : Infinity;
                const atStockLimit = isFinite(stockLimit) && stockLimit > 0 && quantity >= stockLimit;

                return (
                  <div
                    key={itemKey}
                    className="relative bg-white border border-gray-150 rounded-xl p-3 flex items-center gap-3 shadow-2xs hover:shadow-xs transition-shadow"
                  >
                    {/* Item Thumbnail */}
                    <div className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                      <Image
                        src={imgUrl}
                        alt={item.productName || item.name || "Product"}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0 pr-6">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                        {item.productName || item.name || "Product"}
                      </h4>

                      {/* Variant Attributes */}
                      {(item.variantAttributes || item.variantType) && (
                        <div className="mt-0.5 flex flex-wrap gap-1">
                          {typeof item.variantAttributes === 'object' && item.variantAttributes !== null ? (
                            Object.entries(item.variantAttributes).map(([key, value]) => (
                              <span
                                key={key}
                                className="inline-block text-[9px] bg-[#5A0C3D]/10 text-[#5A0C3D] px-1.5 py-0.5 rounded font-medium capitalize"
                              >
                                {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </span>
                            ))
                          ) : (
                            <span className="inline-block text-[9px] bg-[#5A0C3D]/10 text-[#5A0C3D] px-1.5 py-0.5 rounded font-medium">
                              {item.variantType || String(item.variantAttributes)}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-600">
                        {/* Quantity Pill Controls */}
                        <div className="flex items-center border border-gray-200 rounded-md bg-gray-50">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(item, -1)}
                            disabled={isUpdating}
                            className="px-2 py-1 text-gray-600 hover:text-black hover:bg-gray-200 rounded-l-md transition-colors disabled:opacity-40 cursor-pointer"
                          >
                            <FaMinus size={8} />
                          </button>
                          <span className="px-2.5 font-bold text-gray-900 text-xs">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => !atStockLimit && handleQuantityChange(item, 1)}
                            disabled={isUpdating || atStockLimit}
                            title={atStockLimit ? `Max stock: ${stockLimit}` : undefined}
                            className={`px-2 py-1 rounded-r-md transition-colors ${
                              atStockLimit
                                ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                                : 'text-gray-600 hover:text-black hover:bg-gray-200 cursor-pointer'
                            } disabled:opacity-40`}
                          >
                            <FaPlus size={8} />
                          </button>
                        </div>

                        {/* Price Calculation */}
                        <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">
                          × {formatPrice(unitPrice)} = <strong className="text-gray-900 font-bold">{formatPrice(lineTotal)}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Delete Icon Button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(item)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50 cursor-pointer"
                      title="Remove item"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Area: "You May Also Like" Carousel + Total & Checkout */}
          <div className="border-t border-gray-100 bg-gray-50/80 p-4 space-y-4">
            {/* "You May Also Like" Section */}
            {displayList.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                    You May Also Like
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (!recScrollRef.current) return;
                        const cardW = recScrollRef.current.querySelector('div')?.offsetWidth || 200;
                        recScrollRef.current.scrollBy({ left: -(cardW + 10), behavior: 'smooth' });
                      }}
                      className="w-6 h-6 rounded-full bg-[#5A0C3D] hover:bg-[#450930] text-white flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-2xs"
                      aria-label="Scroll left"
                    >
                      <FaChevronLeft size={10} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!recScrollRef.current) return;
                        const cardW = recScrollRef.current.querySelector('div')?.offsetWidth || 200;
                        recScrollRef.current.scrollBy({ left: cardW + 10, behavior: 'smooth' });
                      }}
                      className="w-6 h-6 rounded-full bg-[#5A0C3D] hover:bg-[#450930] text-white flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-2xs"
                      aria-label="Scroll right"
                    >
                      <FaChevronRight size={10} />
                    </button>
                  </div>
                </div>

                {/* Horizontal scroll: 1 full card + half of next visible */}
                <div ref={recScrollRef} className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-1" style={{ scrollbarWidth: 'none' }}>
                  {displayList.map((prod, idx) => {
                    const isVariant = prod.productType === "variant";
                    const defaultVariant = isVariant ? getDefaultVariant(prod) : null;
                    const { original: origPrice, discounted: salePrice } = isVariant
                      ? calculateVariantPrice(defaultVariant, prod)
                      : calculateVariantPrice(null, prod);

                    const hasDiscount = origPrice > salePrice;
                    const discountPct = hasDiscount && origPrice > 0
                      ? Math.round(((origPrice - salePrice) / origPrice) * 100)
                      : 0;

                    const prodName = prod.title || prod.productName || prod.name || "Product";
                    const prodSlug = prod.slug || prod.id || prod._id;
                    const cardImg = isVariant && defaultVariant?.image ? defaultVariant.image : getItemImage(prod);
                    return (
                      <div
                        key={prod.id || prod._id || idx}
                        className="flex-shrink-0 snap-start bg-white rounded-xl border border-gray-200 p-2.5 shadow-xs flex items-start gap-2.5"
                        style={{ width: 'calc(80% - 5px)' }}
                      >
                        {/* Thumbnail */}
                        <div className="relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 mt-0.5">
                          <Image
                            src={cardImg}
                            alt={prodName}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                          {hasDiscount && (
                            <div className="absolute top-0.5 left-0.5 bg-rose-600 text-white text-[8px] font-bold px-1 py-0.5 rounded leading-none">
                              -{discountPct}%
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/product/${prodSlug}`}
                            onClick={onClose}
                            className="text-[11px] font-semibold text-gray-900 line-clamp-2 hover:text-[#5A0C3D] hover:underline leading-tight block"
                          >
                            {prodName}
                          </Link>
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            <span className="text-[11px] md:text-[14px] font-outfit font-bold text-[#5A0C3D] whitespace-nowrap">
                              ৳{salePrice.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                            {hasDiscount && origPrice > 0 && (
                              <span className="text-[9px] md:text-[12px] font-outfit font-normal text-gray-400 line-through whitespace-nowrap">
                                ৳{origPrice.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                              </span>
                            )}
                          </div>
                          {/* Variant Options: 1 Row with 2 Columns */}
                          {isVariant && prod.productVariants?.length > 0 && (
                            <div className="grid grid-cols-2 gap-1 mt-1">
                              {extractVariantOptions(prod)
                                .filter(opt => opt.attributeName !== 'color' || !opt.values.some(v => String(v).startsWith('#')))
                                .slice(0, 2)
                                .map((opt) => {
                                  const cleanLabel = opt.attributeName.replace(/name$/i, '');
                                  const valList = opt.values.map(v => String(v).replace(/^#.*$/, '')).filter(Boolean);
                                  return (
                                    <div
                                      key={opt.attributeName}
                                      className="text-[9px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-medium truncate flex items-center gap-0.5"
                                      title={`${cleanLabel}: ${valList.join(', ')}`}
                                    >
                                      <span className="font-semibold text-gray-500 shrink-0 capitalize">{cleanLabel}:</span>
                                      <span className="truncate">{valList.slice(0, 2).join(', ')}{valList.length > 2 ? '..' : ''}</span>
                                    </div>
                                  );
                                })}
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              if (isVariant && prod.productVariants?.length > 1) {
                                setQuickViewProduct(prod);
                              } else {
                                handleAddRecommendation(prod);
                              }
                            }}
                            className="mt-1.5 px-2.5 py-1 bg-[#5A0C3D] hover:bg-[#450930] text-white text-[10px] font-bold rounded-md transition-transform active:scale-95 cursor-pointer shadow-2xs flex items-center gap-1"
                          >
                            <FaPlus size={7} /> {isVariant && prod.productVariants?.length > 1 ? 'Select' : 'Add'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 text-sm">
              <span className="font-semibold text-gray-700">Total:</span>
              <span className="font-extrabold text-base text-gray-900">
                {formatPrice(total)}
              </span>
            </div>

            {/* CHECKOUT Button */}
            <button
              type="button"
              onClick={handleCheckoutClick}
              disabled={cartItems.length === 0}
              className="w-full py-3.5 bg-[#5A0C3D] hover:bg-[#450930] active:bg-[#3a0728] text-white rounded-xl font-bold text-sm tracking-wider uppercase transition-all shadow-md active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              CHECKOUT
            </button>
          </div>
        </motion.div>
      </div>
      )}

      {/* Quick View Modal for choosing variants from recommendation card */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </AnimatePresence>
  );
}
