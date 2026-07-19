// components/Checkout/OrderSummary.jsx - PRODUCTION READY

"use client";
import { apiClient } from "@/lib/apiClient";
import Image from "next/image";
import React, { useState, useEffect, useCallback } from "react";
import { FaBox, FaTag, FaShoppingBag, FaTrophy, FaCoins } from "react-icons/fa";
import { FiCheck, FiX } from "react-icons/fi";
import { SiVala } from "react-icons/si";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

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
}) => {
  const regularItems = cart.filter((item) => !item.isBundle);
  const bundleItems = cart.filter((item) => item.isBundle);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
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
    return `৳${priceNumber.toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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

  // Initialize loyalty points on mount
  useEffect(() => {
    fetchLoyaltyBalance();
  }, [fetchLoyaltyBalance]);

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
        <h2 className="text-2xl font-semibold mb-6">Your Order</h2>
        <div className="border border-stone-300 rounded p-6 bg-white shadow-sm">
          <div className="text-center py-8">
            <FaShoppingBag className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Your cart is empty</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-6">
      <h2 className="text-2xl font-semibold mb-6">Your Order</h2>
      <div className="border border-gray-200 rounded p-6 bg-white shadow-sm">
        {/* Product Table */}
        <div className="mb-6 overflow-x-auto">
          {regularItems.length > 0 && (
            <table className="w-full border-collapse rounded text-sm">
              <thead>
                <tr className="bg-neutral-100">
                  <th className="p-3 text-left border border-stone-200 font-semibold">
                    Image
                  </th>
                  <th className="p-3 text-left border border-stone-200 font-semibold">
                    Product Info
                  </th>
                  <th className="p-3 text-right border border-stone-200 font-semibold">
                    Unit Price
                  </th>
                  <th className="p-3 text-right border border-stone-200 font-semibold">
                    Discount
                  </th>
                  <th className="p-3 text-right border border-stone-200 font-semibold">
                    VAT/TAX
                  </th>
                  <th className="p-3 text-right border border-stone-200 font-semibold">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {regularItems.map((item, index) => {
                  const quantity = parseInt(item.quantity || 1);
                  const originalPrice = parseFloat(
                    item.originalPrice || item.price || 0
                  );
                  const currentPrice = parseFloat(item.price || 0);

                  const productDiscount = originalPrice - currentPrice;
                  const campaignDiscount = parseFloat(item.discountAmount || 0);
                  const totalItemDiscount =
                    (productDiscount + campaignDiscount) * quantity;

                  let itemVAT = 0;
                  const taxType = item.taxType
                    ? item.taxType.toLowerCase()
                    : "";
                  if (taxType === "exclusive" && item.tax) {
                    const taxRate = parseFloat(item.tax || 0);
                    const finalPrice = currentPrice - campaignDiscount;
                    itemVAT = (finalPrice * quantity * taxRate) / 100;
                  }

                  const lineTotal =
                    (currentPrice - campaignDiscount) * quantity + itemVAT;

                  return (
                    <tr
                      key={`regular-${item.productId}-${item.variantId || index
                        }`}
                      className="border-b"
                    >
                      <td className="p-3 border border-stone-200">
                        <div className="relative w-16 h-16">
                          <Image
                            src={item.images?.[0]}
                            alt={item.productName}
                            width={400}
                            height={400}
                            className="w-full h-full object-cover rounded"
                            style={{ width: 'auto', height: 'auto' }}
                          />
                          {item.variantId && (
                            <div className="absolute -top-1 -right-1 bg-sky-500 text-white text-[10px] p-1 rounded-full">
                              <SiVala />
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-3 border border-stone-200">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {item.productName}
                          </h4>
                          {renderVariantAttributes(item)}
                          {item.campaignName && (
                            <div className="text-xs text-purple-600 font-medium mt-1">
                              {item.campaignName}
                            </div>
                          )}
                          <div className="text-xs text-gray-600 mt-1">
                            Qty: {quantity}
                          </div>
                        </div>
                      </td>

                      <td className="p-3 border border-stone-200 text-right">
                        <div className="font-medium">
                          {formatPrice(originalPrice)}
                        </div>
                      </td>

                      <td className="p-3 border border-stone-200 text-right">
                        {totalItemDiscount > 0 ? (
                          <div className="font-medium text-red-600">
                            {formatPrice(totalItemDiscount)}
                          </div>
                        ) : (
                          <div className="text-gray-400">-</div>
                        )}
                      </td>
                      <td className="p-3 border border-stone-200 text-right">
                        {itemVAT > 0 ? (
                          <div className="font-medium">
                            {formatPrice(itemVAT)}
                          </div>
                        ) : (
                          <div className="text-gray-600">Included</div>
                        )}
                      </td>

                      <td className="p-3 border border-stone-200 text-right">
                        <div className="font-bold text-gray-900">
                          {formatPrice(lineTotal)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Bundle Items */}
          {bundleItems.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FaBox className="text-secound" />
                Bundles ({bundleItems.length})
              </h3>
              <table className="w-full border-collapse rounded text-sm mt-2">
                <thead>
                  <tr className="bg-secound/5">
                    <th className="p-3 text-left border border-secound/20 font-semibold">
                      Image
                    </th>
                    <th className="p-3 text-left border border-secound/20 font-semibold">
                      Bundle Info
                    </th>
                    <th className="p-3 text-right border border-secound/20 font-semibold">
                      Original Price
                    </th>
                    <th className="p-3 text-right border border-secound/20 font-semibold">
                      Discount
                    </th>
                    <th className="p-3 text-right border border-secound/20 font-semibold">
                      VAT/TAX
                    </th>
                    <th className="p-3 text-right border border-secound/20 font-semibold">
                      Final Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bundleItems.map((item, index) => {
                    const quantity = parseInt(item.quantity || 1);
                    const originalPrice = parseFloat(
                      item.originalPrice || item.totalOriginalPrice || 0
                    );
                    const finalPrice = parseFloat(
                      item.price || item.finalPrice || 0
                    );
                    const discountAmount = parseFloat(item.discountAmount || 0);
                    const bundleVAT = calculateBundleVAT(item);

                    return (
                      <tr
                        key={`bundle-${item.id || index}`}
                        className="border-b"
                      >
                        <td className="p-3 border border-secound/20">
                          <div className="relative w-16 h-16">
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={400}
                              height={400}
                              className="w-full h-full object-cover rounded"
                              style={{ width: 'auto', height: 'auto' }}
                            />
                            <div className="absolute -top-1 -right-1 bg-secound text-white text-[10px] p-1 rounded-full">
                              <FaBox />
                            </div>
                          </div>
                        </td>

                        <td className="p-3 border border-secound/20">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {item.name}
                            </h4>
                            {renderBundleItems(item)}
                            <div className="text-xs text-gray-600 mt-1">
                              Qty: {quantity}
                            </div>
                            {item.discountValue && (
                              <div className="text-xs text-red-600 font-medium mt-1">
                                Bundle Discount: {item.discountValue}%
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="p-3 border border-secound/20 text-right">
                          <div className="font-medium">
                            {formatPrice(originalPrice)}
                          </div>
                        </td>

                        <td className="p-3 border border-secound/20 text-right">
                          {discountAmount > 0 ? (
                            <div className="font-medium text-red-600">
                              -{formatPrice(discountAmount)}
                            </div>
                          ) : (
                            <div className="text-gray-400">-</div>
                          )}
                        </td>

                        <td className="p-3 border border-secound/20 text-right">
                          {bundleVAT > 0 ? (
                            <div className="font-medium">
                              {formatPrice(bundleVAT / quantity)}
                            </div>
                          ) : (
                            <div className="text-gray-600">Included</div>
                          )}
                        </td>

                        <td className="p-3 border border-secound/20 text-right">
                          <div className="font-bold text-secound-hover">
                            {formatPrice(finalPrice)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Loyalty Points Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FaTrophy className="text-purple-600" />
            <h3 className="font-medium">Loyalty Points</h3>
            {loyaltyBalance?.balance > 0 && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                {loyaltyBalance.balance} points available
              </span>
            )}
          </div>

          {loadingLoyalty ? (
            <div className="bg-gray-50 border border-gray-200 rounded p-4">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                <span className="text-gray-600">Loading loyalty points...</span>
              </div>
            </div>
          ) : loyaltyBalance ? (
            <>
              {loyaltyBalance.balance > 0 ? (
                <>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 diva-rounded p-4 mb-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <FaCoins className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Available Balance
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-purple-700">
                            {loyaltyBalance.balance.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-600">points</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ≈{" "}
                          {formatPrice(
                            loyaltyBalance.balanceInBDT ||
                            loyaltyBalance.balance
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">
                          Redemption Status
                        </div>
                        {loyaltyBalance.canRedeem ? (
                          <div className="text-green-600 font-medium text-sm">
                            ✓ Ready to redeem!
                          </div>
                        ) : (
                          <div className="text-amber-600 text-sm">
                            Need{" "}
                            {loyaltyBalance.minRedemption -
                              loyaltyBalance.balance}{" "}
                            more points
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          Minimum: {loyaltyBalance.minRedemption} points
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Only show input if user has minimum points */}
                  {loyaltyBalance.balance >= loyaltyBalance.minRedemption && (
                    <div className="space-y-3">
                      {pointsToRedeem > 0 ? (
                        <div className="bg-green-50 border border-green-200 rounded p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 text-green-700">
                                <FiCheck className="w-5 h-5" />
                                <span className="font-medium">
                                  Points Applied: {pointsToRedeem} points
                                </span>
                              </div>
                              <p className="text-sm text-green-600 mt-1">
                                Savings: {formatPrice(pointsDiscount)}
                              </p>
                            </div>
                            <button
                              onClick={handleRemovePoints}
                              className="text-red-500 hover:text-red-700"
                              disabled={loading}
                            >
                              <FiX className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              min={loyaltyBalance.minRedemption}
                              max={Math.min(
                                loyaltyBalance.balance,
                                Math.floor(
                                  totals.subtotalAfterDiscount -
                                  totals.couponDiscount
                                )
                              )}
                              value={pointsInput}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || "";
                                const maxAllowed = Math.min(
                                  loyaltyBalance.balance,
                                  Math.floor(
                                    totals.subtotalAfterDiscount -
                                    totals.couponDiscount
                                  )
                                );

                                if (
                                  value === "" ||
                                  (value <= maxAllowed &&
                                    value >= loyaltyBalance.minRedemption)
                                ) {
                                  setPointsInput(value);
                                  setPointsError("");
                                } else if (value > maxAllowed) {
                                  setPointsInput(maxAllowed);
                                  setPointsError(
                                    `Maximum ${maxAllowed} points allowed for this order`
                                  );
                                }
                              }}
                              onKeyPress={handlePointsKeyPress}
                              placeholder={`Enter points (min ${loyaltyBalance.minRedemption})`}
                              className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                              disabled={validatingPoints || loading}
                            />
                            <button
                              onClick={handleApplyPoints}
                              disabled={
                                validatingPoints ||
                                loading ||
                                !pointsInput ||
                                parseInt(pointsInput) <
                                loyaltyBalance.minRedemption ||
                                parseInt(pointsInput) > loyaltyBalance.balance
                              }
                              className="bg-purple-600 text-white px-6 py-3 rounded font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                              {validatingPoints ? (
                                <span className="flex items-center gap-2">
                                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                  Checking...
                                </span>
                              ) : (
                                "Apply"
                              )}
                            </button>
                          </div>

                          {pointsError && (
                            <div className="bg-red-50 border border-red-200 rounded p-3">
                              <p className="text-red-600 text-sm">
                                {pointsError}
                              </p>
                            </div>
                          )}

                          {pointsSuccess && (
                            <div className="bg-green-50 border border-green-200 rounded p-3">
                              <p className="text-green-600 text-sm">
                                {pointsSuccess}
                              </p>
                            </div>
                          )}

                          <p className="text-xs text-gray-600">
                            💡 1 point = ৳1. Maximum redeemable:{" "}
                            {Math.min(
                              loyaltyBalance.balance,
                              Math.floor(
                                totals.subtotalAfterDiscount -
                                totals.couponDiscount
                              )
                            )}{" "}
                            points
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded p-4">
                  <p className="text-gray-600 text-center">
                    You don't have any loyalty points yet
                  </p>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Earn points on orders ≥ ৳10,000 (1 point per ৳1,000 spent)
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded p-4">
              <p className="text-gray-600">Loyalty points not available</p>
            </div>
          )}
        </div>

        {/* Coupon Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FaTag className="text-purple-600" />
            <h3 className="font-medium">Apply Coupon</h3>
          </div>
          {appliedCoupon ? (
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-green-700">
                    <FiCheck className="w-5 h-5" />
                    <span className="font-medium">
                      Coupon Applied: {appliedCoupon.code}
                    </span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Savings: {formatPrice(totals.couponDiscount)}
                  </p>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-red-500 hover:text-red-700"
                  disabled={loading}
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyPress={handleCouponKeyPress}
                  placeholder="Enter coupon code"
                  className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all"
                  disabled={validatingCoupon || loading}
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={validatingCoupon || loading || !couponCode.trim()}
                  className="bg-primary text-black px-6 py-3 rounded font-medium hover:bg-primary-hover disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {validatingCoupon ? "Checking..." : "Apply"}
                </button>
              </div>
              {couponError && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-red-600 text-sm">{couponError}</p>
                </div>
              )}
              {couponSuccess && (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-green-600 text-sm">{couponSuccess}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Summary Section */}
        <div className="bg-white p-4 rounded space-y-3 border border-gray-200 shadow">
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
      </div>
    </div>
  );
};

export default OrderSummary;
