// components/Checkout/OrderSummary.jsx - PRODUCTION READY

"use client";
import { apiClient } from "@/lib/apiClient";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";
import { FaBox, FaTag, FaShoppingBag, FaTrophy, FaCoins } from "react-icons/fa";
import { FiCheck, FiX } from "react-icons/fi";
import { SiVala } from "react-icons/si";
import { Trash2 } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const getItemImage = (item) => {
  const DEFAULT_IMG = 'https://res.cloudinary.com/dh34eqbhu/image/upload/v1747211252/ju2uf9y33y1bncwufrl7.png';
  if (!item) return DEFAULT_IMG;

  const rawImg = (Array.isArray(item.images) && item.images.length > 0) ? item.images[0] : item.image;
  if (!rawImg) return DEFAULT_IMG;

  if (typeof rawImg === 'string') {
    return rawImg.trim() !== '' ? rawImg : DEFAULT_IMG;
  }

  if (typeof rawImg === 'object') {
    return rawImg.url || rawImg.image || rawImg.src || DEFAULT_IMG;
  }

  return DEFAULT_IMG;
};

const OrderSummary = ({
  cart,
  getCartTotal,
  register,
  watch,
  loading,
  handleSubmit,
  onCheckoutSubmit,
  cartType = "mixed",
  isBuyNow = false,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon: externalAppliedCoupon,
  couponDiscount: externalCouponDiscount,
  onPointsApplied,
  onPointsRemoved,
  pointsToRedeem: externalPointsToRedeem,
  pointsDiscount: externalPointsDiscount,
  userEmail, // Pass user email to fetch correct customer ID
  placeOrderRef,
  onRemoveItem,
  renderOnly = null, // 'products' | 'summary' | null
}) => {
  const regularItems = cart.filter((item) => !item.isBundle);
  const bundleItems = cart.filter((item) => item.isBundle);

  // Terms & Conditions state (Checked by default)
  const [termsAgreed, setTermsAgreed] = useState(true);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");

  // IntersectionObserver for Place Order button docking
  const mainButtonRef = React.useRef(null);
  const [isMainButtonInView, setIsMainButtonInView] = useState(true);

  useEffect(() => {
    const target = mainButtonRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsMainButtonInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);
  const [appliedCoupon, setAppliedCoupon] = useState(externalAppliedCoupon);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Loyalty Points state
  const [loyaltyBalance, setLoyaltyBalance] = useState(null);
  const [pointsInput, setPointsInput] = useState("");
  const [pointsToRedeem, setPointsToRedeem] = useState(
    externalPointsToRedeem || 0
  );
  const [pointsError, setPointsError] = useState("");
  const [pointsSuccess, setPointsSuccess] = useState("");
  const [validatingPoints, setValidatingPoints] = useState(false);
  const [loadingLoyalty, setLoadingLoyalty] = useState(true);
  const [customerData, setCustomerData] = useState(null);

  // Sync with external states
  useEffect(() => {
    setAppliedCoupon(externalAppliedCoupon);
  }, [externalAppliedCoupon]);

  useEffect(() => {
    setPointsToRedeem(externalPointsToRedeem || 0);
  }, [externalPointsToRedeem]);

  // Format price function
  const formatPrice = useCallback((price) => {
    if (price === null || price === undefined) return "৳0";
    const priceNumber = parseFloat(price);
    if (isNaN(priceNumber)) return "৳0";
    const ceilPrice = Math.ceil(priceNumber);
    return `৳${ceilPrice.toLocaleString("en-BD", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  }, []);

  // Get correct customer ID from email
  const fetchCustomerData = useCallback(async () => {
    if (!userEmail) {
      console.log("No user email provided");
      return null;
    }

    try {
      const customerResult = await apiClient(
        `/api/customer/email/${encodeURIComponent(userEmail)}`
      );

      console.log("Customer API Response:", customerResult);

      let customerData = null;
      if (customerResult && customerResult.success !== undefined) {
        customerData = customerResult.data;
      } else if (customerResult && customerResult.id) {
        customerData = customerResult;
      }

      if (customerData && customerData.id) {
        console.log("Found customer ID:", customerData.id);
        setCustomerData(customerData);
        return customerData.id;
      } else {
        console.log("Customer profile not found for email:", userEmail);
        return null;
      }
    } catch (error) {
      console.error("Failed to fetch customer data:", error);
      return null;
    }
  }, [userEmail]);

  // Fetch loyalty balance with proper error handling
  const fetchLoyaltyBalance = useCallback(async () => {
    console.log("Fetching loyalty balance for email:", userEmail);

    if (!userEmail) {
      console.log("No email, skipping loyalty fetch");
      setLoadingLoyalty(false);
      setLoyaltyBalance({
        balance: 0,
        balanceInBDT: 0,
        minRedemption: 500,
        canRedeem: false,
        lifetimeEarned: 0,
        lifetimeRedeemed: 0,
      });
      return;
    }

    try {
      setLoadingLoyalty(true);

      // First get customer ID
      const numericCustomerId = await fetchCustomerData();

      if (!numericCustomerId) {
        console.log("No customer ID found, setting default loyalty data");
        setLoyaltyBalance({
          balance: 0,
          balanceInBDT: 0,
          minRedemption: 500,
          canRedeem: false,
          lifetimeEarned: 0,
          lifetimeRedeemed: 0,
        });
        return;
      }

      console.log("Fetching loyalty for customer ID:", numericCustomerId);

      // Try to fetch existing loyalty points
      try {
        const response = await apiClient(
          `/api/loyalty-points/balance/${numericCustomerId}`
        );

        console.log("Loyalty Balance API Response:", response);

        if (response && response.success === true && response.data) {
          setLoyaltyBalance(response.data);
        } else {
          // Try to initialize if not found
          await initializeLoyaltyAccount(numericCustomerId);
        }
      } catch (apiError) {
        console.log("Loyalty API error, trying initialization:", apiError);
        await initializeLoyaltyAccount(numericCustomerId);
      }
    } catch (error) {
      console.error("Failed to fetch loyalty balance:", error);
      setLoyaltyBalance({
        balance: 0,
        balanceInBDT: 0,
        minRedemption: 500,
        canRedeem: false,
        lifetimeEarned: 0,
        lifetimeRedeemed: 0,
      });
    } finally {
      setLoadingLoyalty(false);
    }
  }, [userEmail, fetchCustomerData]);

  // Initialize loyalty account
  const initializeLoyaltyAccount = async (customerId) => {
    try {
      console.log("Initializing loyalty for customer:", customerId);

      const initResponse = await apiClient("/api/loyalty-points/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: parseInt(customerId) }),
      });

      console.log("Initialize Response:", initResponse);

      if (initResponse && initResponse.success) {
        // Fetch after initialization
        const retryResponse = await apiClient(
          `/api/loyalty-points/balance/${customerId}`
        );

        if (retryResponse && retryResponse.success && retryResponse.data) {
          setLoyaltyBalance(retryResponse.data);
        } else {
          setLoyaltyBalance({
            balance: 0,
            balanceInBDT: 0,
            minRedemption: 500,
            canRedeem: false,
            lifetimeEarned: 0,
            lifetimeRedeemed: 0,
          });
        }
      } else {
        setLoyaltyBalance({
          balance: 0,
          balanceInBDT: 0,
          minRedemption: 500,
          canRedeem: false,
          lifetimeEarned: 0,
          lifetimeRedeemed: 0,
        });
      }
    } catch (initError) {
      console.error("Initialization failed:", initError);
      setLoyaltyBalance({
        balance: 0,
        balanceInBDT: 0,
        minRedemption: 500,
        canRedeem: false,
        lifetimeEarned: 0,
        lifetimeRedeemed: 0,
      });
    }
  };

  // Calculate totals
  const calculateTotals = useCallback(() => {
    let subtotalBeforeDiscount = 0;
    let totalProductDiscount = 0;
    let totalVAT = 0;

    cart.forEach((item) => {
      if (item.isBundle) {
        const bundlePrice = parseFloat(item.originalPrice || 0);
        const quantity = parseInt(item.quantity || 1);
        subtotalBeforeDiscount += bundlePrice * quantity;
        const bundleDiscount = parseFloat(item.discountAmount || 0);
        totalProductDiscount += bundleDiscount;

        if (item.totalVAT && parseFloat(item.totalVAT) > 0) {
          totalVAT += parseFloat(item.totalVAT) * quantity;
        } else if (item.bundleItems && Array.isArray(item.bundleItems)) {
          let bundleVAT = 0;
          item.bundleItems.forEach((bundleItem) => {
            const product = bundleItem.product || bundleItem;
            const itemQuantity = parseInt(bundleItem.quantity || 1);
            const pricePerItem = parseFloat(product.price || 0);

            if (
              product.taxType &&
              product.taxType.toLowerCase() === "exclusive" &&
              product.tax
            ) {
              const taxRate = parseFloat(product.tax || 0);
              const itemVAT = (pricePerItem * itemQuantity * taxRate) / 100;
              bundleVAT += itemVAT;
            }
          });

          const finalBundlePrice =
            bundlePrice - parseFloat(item.discountAmount || 0);
          const originalBundlePrice = parseFloat(
            item.totalOriginalPrice || bundlePrice
          );
          const discountRatio =
            originalBundlePrice > 0
              ? finalBundlePrice / originalBundlePrice
              : 1;

          totalVAT += bundleVAT * discountRatio * quantity;
        }
      } else {
        const quantity = parseInt(item.quantity || 1);
        const originalPrice = parseFloat(item.originalPrice || item.price || 0);
        const currentPrice = parseFloat(item.price || 0);

        subtotalBeforeDiscount += originalPrice * quantity;

        const productDiscount = (originalPrice - currentPrice) * quantity;
        const campaignDiscount =
          parseFloat(item.discountAmount || 0) * quantity;
        totalProductDiscount += productDiscount + campaignDiscount;

        const taxType = item.taxType ? item.taxType.toLowerCase() : "";
        if (taxType === "exclusive" && item.tax) {
          const taxRate = parseFloat(item.tax || 0);
          const finalPricePerUnit =
            currentPrice - parseFloat(item.discountAmount || 0);
          const itemVAT = (finalPricePerUnit * quantity * taxRate) / 100;
          totalVAT += itemVAT;
        }
      }
    });

    const subtotalAfterDiscount = subtotalBeforeDiscount - totalProductDiscount;
    const shippingCost = watch("shipping") === "outside" ? 0 : 0;

    // Calculate coupon discount
    const calculateCouponDiscount = () => {
      if (!appliedCoupon) return 0;
      let discount = 0;
      const discountValue = parseFloat(appliedCoupon.discountValue || 0);

      if (appliedCoupon.discountType === "Fixed") {
        discount = discountValue;
      } else if (appliedCoupon.discountType === "Percentage") {
        discount = (subtotalAfterDiscount * discountValue) / 100;
        if (appliedCoupon.maxDiscountAmount) {
          const maxDiscount = parseFloat(appliedCoupon.maxDiscountAmount);
          if (discount > maxDiscount) discount = maxDiscount;
        }
      }
      return Math.min(discount, subtotalAfterDiscount);
    };

    const couponDiscount = externalCouponDiscount || calculateCouponDiscount();
    const pointsDiscount = externalPointsDiscount || pointsToRedeem;

    const finalTotal = Math.max(
      0,
      subtotalAfterDiscount +
      totalVAT +
      shippingCost -
      couponDiscount -
      pointsDiscount
    );

    return {
      subtotalBeforeDiscount,
      totalProductDiscount,
      totalVAT,
      subtotalAfterDiscount,
      shippingCost,
      couponDiscount,
      pointsDiscount,
      finalTotal,
    };
  }, [
    cart,
    watch,
    appliedCoupon,
    externalCouponDiscount,
    externalPointsDiscount,
    pointsToRedeem,
  ]);

  const totals = calculateTotals();

  // Helper function to calculate individual bundle VAT
  const calculateBundleVAT = useCallback((bundleItem) => {
    const quantity = parseInt(bundleItem.quantity || 1);

    if (bundleItem.totalVAT && parseFloat(bundleItem.totalVAT) > 0) {
      return parseFloat(bundleItem.totalVAT) * quantity;
    }

    let bundleVAT = 0;
    if (bundleItem.bundleItems && Array.isArray(bundleItem.bundleItems)) {
      bundleItem.bundleItems.forEach((item) => {
        const product = item.product || item;
        const itemQuantity = parseInt(item.quantity || 1);
        const pricePerItem = parseFloat(product.price || 0);

        if (
          product.taxType &&
          product.taxType.toLowerCase() === "exclusive" &&
          product.tax
        ) {
          const taxRate = parseFloat(product.tax || 0);
          const itemVAT = (pricePerItem * itemQuantity * taxRate) / 100;
          bundleVAT += itemVAT;
        }
      });

      const finalBundlePrice = parseFloat(bundleItem.price || 0);
      const originalBundlePrice = parseFloat(
        bundleItem.totalOriginalPrice ||
        parseFloat(bundleItem.originalPrice || 0)
      );
      const discountRatio =
        originalBundlePrice > 0 ? finalBundlePrice / originalBundlePrice : 1;

      return bundleVAT * discountRatio * quantity;
    }

    return 0;
  }, []);

  // Render variant attributes
  const renderVariantAttributes = (item) => {
    if (
      !item.variantAttributes ||
      Object.keys(item.variantAttributes).length === 0
    ) {
      return null;
    }
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(item.variantAttributes).map(([key, value]) => (
          <span
            key={key}
            className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded"
          >
            {key}: {value}
          </span>
        ))}
      </div>
    );
  };

  // Render bundle items details
  const renderBundleItems = (bundle) => {
    if (!bundle.bundleItems || !Array.isArray(bundle.bundleItems)) return null;

    return (
      <div className="mt-2 space-y-1">
        <p className="text-xs font-medium text-gray-700">Includes:</p>
        {bundle.bundleItems.map((item, idx) => {
          const product = item.product || item;
          return (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <span className="text-gray-600">
                {product.productName || product.name}
                <span className="ml-1 text-gray-500">(x{item.quantity})</span>
                {product.taxType &&
                  product.taxType.toLowerCase() === "exclusive" &&
                  product.tax && (
                    <span className="ml-2 text-xs text-orange-600">
                      VAT: {product.tax}%
                    </span>
                  )}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Coupon handlers
  const getProductIds = () => {
    const productIds = [];
    regularItems.forEach((item) => {
      const id = item.productId || item.id;
      if (id) productIds.push(parseInt(id));
    });
    bundleItems.forEach((bundle) => {
      if (bundle.bundleItems) {
        bundle.bundleItems.forEach((item) => {
          const product = item.product || item;
          if (product.productId || product.id)
            productIds.push(parseInt(product.productId || product.id));
        });
      }
    });
    return [...new Set(productIds)];
  };

  const validateCoupon = async (code) => {
    try {
      const data = await apiClient("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          orderAmount: totals.subtotalAfterDiscount,
          productIds: getProductIds(),
          cartType: isBuyNow ? "buy_now" : "cart",
          itemsCount: cart.length,
        }),
      });

      const responseData = data.data || data;
      if (responseData.valid === false) {
        throw new Error(responseData.message || "Coupon is not valid");
      }
      if (data.success === false) {
        throw new Error(data.message || "Failed to validate coupon");
      }
      return responseData;
    } catch (error) {
      console.error("Coupon Validation Error:", error);
      throw error;
    }
  };

  const handleApplyCoupon = async () => {
    setCouponError("");
    setCouponSuccess("");

    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setValidatingCoupon(true);

    try {
      const couponData = await validateCoupon(couponCode);

      if (!couponData.valid) {
        throw new Error(couponData.message || "Invalid coupon");
      }

      const couponObj = {
        ...couponData.coupon,
        code: couponCode.trim().toUpperCase(),
      };

      const discount = parseFloat(couponData.discountAmount || 0);
      setAppliedCoupon(couponObj);

      if (onCouponApplied) {
        onCouponApplied(couponObj, discount);
      }

      setCouponSuccess(`Coupon applied! You saved ${formatPrice(discount)}`);
      setCouponCode("");
    } catch (error) {
      setCouponError(error.message || "Invalid coupon code");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess("");
    setCouponError("");

    if (onCouponRemoved) {
      onCouponRemoved();
    }
  };

  // Validate points redemption
  const validatePointsRedemption = async (points) => {
    if (points === 0) {
      setPointsError("");
      return true;
    }

    if (!customerData || !customerData.id) {
      setPointsError(
        "Customer information not found. Please complete your profile."
      );
      return false;
    }

    setValidatingPoints(true);
    setPointsError("");

    try {
      const response = await apiClient("/api/loyalty-points/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customerData.id,
          pointsToRedeem: points,
          orderSubtotal: totals.subtotalAfterDiscount,
          existingDiscounts: totals.couponDiscount,
        }),
      });

      console.log("Validate Points Response:", response);

      if (response && response.success === true) {
        return true;
      } else {
        const errorMsg = response?.message || "Invalid points redemption";
        setPointsError(errorMsg);

        if (response?.data?.maxRedeemable) {
          setPointsError(
            `${errorMsg}. Maximum redeemable: ${response.data.maxRedeemable} points`
          );
        }
        return false;
      }
    } catch (error) {
      console.error("Points validation error:", error);
      const errorMsg = error.message || "Failed to validate points";

      if (errorMsg.includes("Foreign key constraint")) {
        setPointsError(
          "Loyalty account not found. Please complete your profile first."
        );
      } else if (errorMsg.includes("Minimum")) {
        setPointsError(errorMsg);
      } else if (errorMsg.includes("balance")) {
        setPointsError("Insufficient points balance");
      } else {
        setPointsError("Unable to validate points at this time");
      }
      return false;
    } finally {
      setValidatingPoints(false);
    }
  };

  // Handle apply points
  const handleApplyPoints = async () => {
    setPointsError("");
    setPointsSuccess("");

    const points = parseInt(pointsInput);

    // Basic validation
    if (!points || points <= 0) {
      setPointsError("Please enter valid points amount");
      return;
    }

    if (!loyaltyBalance) {
      setPointsError("Unable to load loyalty balance");
      return;
    }

    // Use minRedemption from API response
    const minRedemption = loyaltyBalance.minRedemption || 500;

    if (points < minRedemption) {
      setPointsError(`Minimum ${minRedemption} points required to redeem`);
      return;
    }

    if (points > loyaltyBalance.balance) {
      setPointsError(
        `Insufficient points balance. Available: ${loyaltyBalance.balance} points`
      );
      return;
    }

    // Calculate maximum allowed points (cannot exceed order total after coupon)
    const maxAllowed = Math.min(
      loyaltyBalance.balance,
      Math.floor(totals.subtotalAfterDiscount - totals.couponDiscount)
    );

    if (points > maxAllowed) {
      setPointsError(`Maximum ${maxAllowed} points allowed for this order`);
      return;
    }

    const isValid = await validatePointsRedemption(points);

    if (isValid) {
      setPointsToRedeem(points);
      const discount = points; // 1 point = 1 BDT

      if (onPointsApplied) {
        onPointsApplied(points, discount);
      }

      setPointsSuccess(
        `${points} points applied! You'll save ${formatPrice(discount)}`
      );
      setPointsInput("");

      // Refresh balance to show updated amount
      fetchLoyaltyBalance();
    }
  };

  const handleRemovePoints = () => {
    setPointsToRedeem(0);
    setPointsSuccess("");
    setPointsError("");
    setPointsInput("");

    if (onPointsRemoved) {
      onPointsRemoved();
    }
  };

  const handleCouponKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApplyCoupon();
    }
  };

  const handlePointsKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApplyPoints();
    }
  };

  // Initialize loyalty points on mount (Disabled per requirements)
  /*
  useEffect(() => {
    fetchLoyaltyBalance();
  }, [fetchLoyaltyBalance]);
  */

  useEffect(() => {
    if (couponCode && couponError) {
      setCouponError("");
    }
  }, [couponCode, couponError]);

  useEffect(() => {
    if (pointsInput && pointsError) {
      setPointsError("");
    }
  }, [pointsInput, pointsError]);

  if (cart.length === 0) {
    return (
      <div className="sticky top-6">
        <h2 className="text-lg md:text-2xl font-semibold mb-6 text-gray-900">Your Order</h2>
        <div className="border border-stone-300 rounded p-6 bg-white shadow-sm">
          <div className="text-center py-8">
            <FaShoppingBag className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Your cart is empty</p>
          </div>
        </div>
      </div>
    );
  }

  const renderProductsSection = () => (
    <div className="order-1">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-900">Your Order</h2>
      <div className="border border-gray-100 rounded-xl p-4 sm:p-6 bg-white shadow-xs mb-6">
        {/* Products List - Flat list with subtle 1px border-t separation */}
        <div className="divide-y divide-gray-200">
          {regularItems.map((item, index) => {
            const quantity = parseInt(item.quantity || 1);
            const originalPrice = parseFloat(
              item.originalPrice || item.price || 0
            );
            const currentPrice = parseFloat(item.price || 0);

            const productDiscount = originalPrice - currentPrice;
            const campaignDiscount = parseFloat(item.discountAmount || 0);

            let itemVAT = 0;
            const taxType = item.taxType
              ? item.taxType.toLowerCase()
              : "";
            if (taxType === "exclusive" && item.tax) {
              const taxRate = parseFloat(item.tax || 0);
              const finalPrice = currentPrice - campaignDiscount;
              itemVAT = (finalPrice * quantity * taxRate) / 100;
            }

            return (
              <div
                key={`regular-${item.productId}-${item.variantId || index}`}
                className="bg-white py-3.5 first:pt-0 last:pb-0"
              >
                <div className="flex gap-3.5">
                  {/* Product Image */}
                  <div className="relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                    <Image
                      src={getItemImage(item)}
                      alt={item.productName || 'Product'}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-gray-900 text-xs sm:text-sm line-clamp-2 leading-snug">
                          {item.productName}
                        </h4>
                        {onRemoveItem && (
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50 cursor-pointer flex-shrink-0"
                            title="Remove item from checkout"
                            aria-label="Remove item"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                      {renderVariantAttributes(item)}
                      {item.campaignName && (
                        <span className="inline-block text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md font-medium mt-1">
                          {item.campaignName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-1.5 pt-1.5 text-xs">
                      <span className="text-gray-500 font-medium">Qty: <span className="text-gray-900 font-bold">{quantity}</span></span>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <span className="font-bold text-[#5A0C3D] text-xs sm:text-sm">
                          {formatPrice((currentPrice - campaignDiscount) * quantity + itemVAT)}
                        </span>
                        {(productDiscount > 0 || campaignDiscount > 0 || (originalPrice > 0 && originalPrice > currentPrice)) && (
                          <span className="text-[11px] text-gray-400 line-through">
                            {formatPrice(originalPrice * quantity)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {bundleItems.map((item, index) => {
            const quantity = parseInt(item.quantity || 1);
            const unitPrice = parseFloat(item.price);
            const originalPrice = parseFloat(item.originalPrice || item.totalOriginalPrice || item.price || 0);
            const discountAmount = parseFloat(item.discountAmount || 0);
            const bundleVAT = item.totalVAT || calculateBundleVAT(item);
            const lineTotal = unitPrice * quantity + bundleVAT;

            return (
              <div
                key={`bundle-${item.id}-${index}`}
                className="bg-white py-3.5 first:pt-0 last:pb-0"
              >
                <div className="flex gap-3.5">
                  <div className="relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                    <Image
                      src={getItemImage(item)}
                      alt={item.name || 'Bundle'}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-gray-900 text-xs sm:text-sm line-clamp-2 leading-snug">
                          {item.name}
                        </h4>
                        {onRemoveItem && (
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50 cursor-pointer flex-shrink-0"
                            title="Remove bundle from checkout"
                            aria-label="Remove item"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                      <span className="inline-block text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-md font-medium mt-1">
                        Bundle
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1.5 pt-1.5 text-xs">
                      <span className="text-gray-500 font-medium">Qty: <span className="text-gray-900 font-bold">{quantity}</span></span>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <span className="font-bold text-[#5A0C3D] text-xs sm:text-sm">{formatPrice(lineTotal)}</span>
                        {(originalPrice > unitPrice || discountAmount > 0) && (
                          <span className="text-[11px] text-gray-400 line-through">
                            {formatPrice(originalPrice * quantity)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderCalculationSection = () => (
    <div className="order-3">
      {/* Summary Section */}
      <div className="bg-white p-4 sm:p-5 rounded-xl space-y-3 border border-gray-100 shadow-xs">
        <h3 className="font-bold text-lg mb-3">Order Summary</h3>

        <div className="flex justify-between text-sm">
          <span>Sub Total</span>
          <span className="font-semibold">
            {formatPrice(totals.subtotalBeforeDiscount)}
          </span>
        </div>

        {totals.totalProductDiscount > 0 && (
          <div className="flex justify-between text-sm text-red-600">
            <span>Total Discount</span>
            <span className="font-semibold">
              -{formatPrice(totals.totalProductDiscount)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span>VAT</span>
          <span className="font-semibold">
            {totals.totalVAT > 0
              ? `+${formatPrice(totals.totalVAT)}`
              : "Included"}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Shipping Charge</span>
          <span className="font-semibold">
            {formatPrice(totals.shippingCost)}
          </span>
        </div>

        {totals.couponDiscount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Coupon Discount</span>
            <span className="font-semibold">
              -{formatPrice(totals.couponDiscount)}
            </span>
          </div>
        )}

        {totals.pointsDiscount > 0 && (
          <div className="flex justify-between text-sm text-purple-600">
            <span>Loyalty Points ({pointsToRedeem} pts)</span>
            <span className="font-semibold">
              -{formatPrice(totals.pointsDiscount)}
            </span>
          </div>
        )}

        <div className="border-t-2 border-stone-300 pt-3 mt-3 flex justify-between text-lg font-bold">
          <span>Grand Total</span>
          <span className="text-secound">
            {formatPrice(totals.finalTotal)}
          </span>
        </div>
      </div>

      {/* Terms & Conditions Agreement Checkbox */}
      <div className="mt-4 mb-8 lg:mb-0 flex items-start gap-2.5 px-1">
        <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs sm:text-sm text-gray-700 leading-snug">
          <div
            onClick={() => setTermsAgreed(!termsAgreed)}
            className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
              termsAgreed
                ? "bg-[#5A0C3D] border border-[#5A0C3D]"
                : "bg-white border border-gray-300 hover:border-[#5A0C3D]"
            }`}
          >
            {termsAgreed && <FiCheck className="text-white text-[12px] stroke-[3]" />}
          </div>
          <span className="text-[13px]">
            I have read and agree to the{" "}
            <Link
              href="/terms-and-conditions"
              target="_blank"
              className="text-[#5A0C3D] hover:underline font-medium "
            >
              Terms and Conditions
            </Link>
            ,{" "}
            <Link
              href="/privacy-policy"
              target="_blank"
              className="text-[#5A0C3D] hover:underline font-medium"
            >
              Privacy Policy
            </Link>{" "}
            &amp;{" "}
            <Link
              href="/refund-policy"
              target="_blank"
              className="text-[#5A0C3D] hover:underline font-medium"
            >
              Refund and Return Policy
            </Link>
            .
          </span>
        </label>
      </div>

      {/* Place Order Button - Desktop & Default */}
      <button
        ref={mainButtonRef}
        type="button"
        onClick={() => placeOrderRef?.current && placeOrderRef.current()}
        disabled={loading || !termsAgreed}
        className="w-full mt-6 py-3.5 bg-[#5A0C3D] hover:bg-[#450322] text-white rounded-[8px] font-bold text-base md:text-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider"
      >
        {loading ? "Processing..." : "Place Order"}
      </button>

      {/* Floating Place Order Action Button for Mobile - Visible ONLY when original button is NOT in view */}
      {!isMainButtonInView && (
        <div className="fixed bottom-4 left-0 right-0 px-4 z-[9999] lg:hidden">
          <button
            type="button"
            onClick={() => placeOrderRef?.current && placeOrderRef.current()}
            disabled={loading || !termsAgreed}
            className="w-full py-3.5 bg-[#5A0C3D] hover:bg-[#450322] text-white rounded-[8px] font-bold text-base transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider"
          >
            {loading ? "Processing..." : "Place Order"}
          </button>
        </div>
      )}
    </div>
  );

  if (renderOnly === 'products') {
    return renderProductsSection();
  }

  if (renderOnly === 'summary') {
    return renderCalculationSection();
  }

  return (
    <div className="sticky top-6 flex flex-col">
      {renderProductsSection()}
      {renderCalculationSection()}
    </div>
  );
};

export default OrderSummary;
