// app/checkout/page.tsx - PRODUCTION READY

"use client";

import Container from "@/components/Container/Container";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { IoIosArrowForward } from "react-icons/io";
import { useCartManager } from "@/hooks/useCartManager";
import { useCheckoutSession } from "@/hooks/useCheckoutSession";
import BillingDetails from "@/components/Checkout/BillingDetails";
import { useUser } from "@/hooks/useUser";
import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import OrderSummary from "@/components/Checkout/OrderSummary";
import { FaShoppingBag } from "react-icons/fa";

export default function Checkout() {
  const router = useRouter();
  const { user } = useUser();

  const {
    regularCart,
    bundleCart,
    getCombinedTotal,
    clearRegularCart,
    clearBundleCart,
  } = useCartManager(user);

  const { checkoutSession, clearSession, isBuyNow, isLoaded } =useCheckoutSession();

  const [loading, setLoading] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [checkoutType, setCheckoutType] = useState("empty");

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Loyalty Points state
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [customerData, setCustomerData] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      shipping: "local",
      payment: "cod",
    },
  });

  // Helper function to calculate bundle VAT
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

  // Fetch customer data for loyalty points
  const fetchCustomerData = useCallback(async () => {
    if (!user?.email) return null;

    try {
      const customerResult = await apiClient(
        `/api/customer/email/${encodeURIComponent(user.email)}`
      );

      let customerData = null;
      if (customerResult && customerResult.success !== undefined) {
        customerData = customerResult.data;
      } else if (customerResult && customerResult.id) {
        customerData = customerResult;
      }

      if (customerData && customerData.id) {
        setCustomerData(customerData);
        return customerData;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch customer data:", error);
      return null;
    }
  }, [user]);

  const getCheckoutItems = useCallback(() => {
    if (!checkoutSession) return [];

    if (checkoutSession.type === "buy_now") {
      const item = checkoutSession.item;
      return [
        {
          ...item,
          variantId: item.variantId,
          variantAttributes: item.variantAttributes,
          productType: item.productType,
          discountAmount: parseFloat(item.discountAmount || 0),
          campaignId: item.campaignId,
          campaignName: item.campaignName,
          discountValue: parseFloat(item.discountValue || 0),
          discountType: item.discountType,
          tax: item.tax || 0,
          taxType: item.taxType || "inclusive",
        },
      ];
    }

    return (
      checkoutSession.items?.map((item) => ({
        ...item,
        variantId: item.variantId,
        variantAttributes: item.variantAttributes,
        productType: item.productType,
        discountAmount: parseFloat(item.discountAmount || 0),
        campaignId: item.campaignId,
        campaignName: item.campaignName,
        discountValue: parseFloat(item.discountValue || 0),
        discountType: item.discountType,
        tax: item.tax || 0,
        taxType: item.taxType || "inclusive",
      })) || []
    );
  }, [checkoutSession]);

  const getCheckoutTotal = useCallback(() => {
    const items = getCheckoutItems();
    return items.reduce((total, item) => {
      const price = parseFloat(item.price || 0);
      const quantity = item.quantity || 1;
      return total + price * quantity;
    }, 0);
  }, [getCheckoutItems]);

  const getAllCartItems = useCallback(() => {
    const regularItems = regularCart.map((item) => ({
      ...item,
      type: "regular",
      isBundle: false,
      id: item.productId || item.id,
      productName: item.productName || item.name,
      variantId: item.variantId,
      variantAttributes: item.variantAttributes,
      productType: item.productType,
      discountAmount: parseFloat(item.discountAmount || 0),
      discountValue: parseFloat(item.discountValue || 0),
      discountType: item.discountType,
      campaignId: item.campaignId,
      campaignName: item.campaignName,
      price: parseFloat(item.price || 0),
      originalPrice: parseFloat(item.originalPrice || item.price || 0),
      tax: parseFloat(item.tax || 0),
      taxType: item.taxType || "inclusive",
    }));

    const bundleItems = bundleCart.map((item) => {
      const bundleVAT = calculateBundleVAT(item);
      return {
        ...item,
        type: "bundle",
        isBundle: true,
        productName: item.name,
        images: [item.image],
        id: item.id,
        discountAmount: parseFloat(item.discountAmount || 0),
        price: parseFloat(item.price || 0),
        originalPrice: parseFloat(
          item.totalOriginalPrice || parseFloat(item.originalPrice || 0)
        ),
        tax: item.tax || 0,
        taxType: item.taxType || "inclusive",
        totalVAT: bundleVAT,
        bundleItems: item.bundleItems || [],
      };
    });

    return [...regularItems, ...bundleItems];
  }, [regularCart, bundleCart, calculateBundleVAT]);

  useEffect(() => {
    if (!isLoaded) return;

    let items = [];
    let type = "empty";

    if (isBuyNow) {
      items = getCheckoutItems();
      if (items.length > 0) {
        const item = items[0];
        type = item.isBundle ? "buy_now_bundle" : "buy_now_regular";
      }
    } else {
      items = getAllCartItems();
      const hasRegular = items.some((item) => !item.isBundle);
      const hasBundle = items.some((item) => item.isBundle);

      if (hasRegular && hasBundle) {
        type = "cart_mixed";
      } else if (hasBundle) {
        type = "cart_bundle";
      } else if (hasRegular) {
        type = "cart_regular";
      }
    }

    setCheckoutItems(items);
    setCheckoutType(type);
  }, [
    isLoaded,
    isBuyNow,
    regularCart,
    bundleCart,
    checkoutSession,
    getCheckoutItems,
    getAllCartItems,
  ]);

  // Fetch customer data on load
  useEffect(() => {
    if (user?.email) {
      fetchCustomerData();
    }
  }, [user, fetchCustomerData]);

  const handleCouponApplied = useCallback((coupon, discount) => {
    setAppliedCoupon(coupon);
    setCouponDiscount(discount);
  }, []);

  const handleCouponRemoved = useCallback(() => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
  }, []);

  // Handle loyalty points application
  const handlePointsApplied = useCallback((points, discount) => {
    setPointsToRedeem(points);
    setPointsDiscount(discount);
  }, []);

  // Handle loyalty points removal
  const handlePointsRemoved = useCallback(() => {
    setPointsToRedeem(0);
    setPointsDiscount(0);
  }, []);

  // Validate points before order submission
  const validatePointsRedemption = async (pointsToRedeem, orderSubtotal, couponDiscount) => {
    if (pointsToRedeem === 0) return { success: true };

    try {
      if (!customerData || !customerData.id) {
        return {
          success: false,
          message: "Customer profile not found. Please complete your profile.",
        };
      }

      const response = await apiClient("/api/loyalty-points/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customerData.id,
          pointsToRedeem: pointsToRedeem,
          orderSubtotal: orderSubtotal,
          existingDiscounts: couponDiscount,
        }),
      });

      console.log("Checkout Points Validation:", response);
      return response;
    } catch (error) {
      console.error("Points validation error:", error);
      return {
        success: false,
        message: error.message || "Failed to validate points",
      };
    }
  };

  const onCheckoutSubmit = async (data) => {
    try {
      setLoading(true);

      const items = checkoutItems;

      if (items.length === 0) {
        toast.error("No items to checkout");
        return;
      }

      if (!customerData || !customerData.id) {
        toast.error("Customer information is required. Please complete your profile.");
        return;
      }

      if (!data.customerAddressId) {
        toast.error("Shipping address is required");
        return;
      }

      const shippingMethod = watch("shipping") || "local";
      const shippingCost = shippingMethod === "local" ? 0 : 0;

      let subtotalBeforeDiscount = 0;
      let totalProductDiscount = 0;
      let totalVAT = 0;

      items.forEach((item) => {
        if (item.isBundle) {
          const bundlePrice = parseFloat(
            item.originalPrice || item.totalOriginalPrice || 0
          );
          const quantity = parseInt(item.quantity || 1);
          subtotalBeforeDiscount += bundlePrice * quantity;

          const bundleDiscount =
            parseFloat(item.discountAmount || 0) * quantity;
          totalProductDiscount += bundleDiscount;

          const bundleVAT = item.totalVAT || calculateBundleVAT(item);
          totalVAT += bundleVAT;
        } else {
          const quantity = parseInt(item.quantity || 1);
          const originalPrice = parseFloat(
            item.originalPrice || item.price || 0
          );
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

      const subtotalAfterDiscount =
        subtotalBeforeDiscount - totalProductDiscount;
      const couponDiscountAmount = couponDiscount || 0;
      const pointsDiscountAmount = pointsDiscount || 0;

      // Calculate grand total (ensure it's not negative)
      let grandTotal =
        subtotalAfterDiscount +
        totalVAT +
        shippingCost -
        couponDiscountAmount -
        pointsDiscountAmount;
      grandTotal = Math.max(0, grandTotal);

      // VALIDATE POINTS BEFORE ORDER CREATION
      if (pointsToRedeem > 0) {
        const validation = await validatePointsRedemption(
          pointsToRedeem,
          subtotalAfterDiscount,
          couponDiscountAmount
        );

        console.log("Validation Result:", validation);

        if (!validation || validation.success !== true) {
          toast.error(validation?.message || "Invalid points redemption");
          handlePointsRemoved();
          return;
        }
      }

      const regularItems = items.filter((item) => !item.isBundle);
      const bundleItems = items.filter((item) => item.isBundle);

      const apiRegularItems = regularItems.map((item) => {
        const productId = parseInt(item.productId || item.id);
        const quantity = parseInt(item.quantity || 1);
        const originalPrice = parseFloat(item.originalPrice || item.price || 0);
        const unitPrice = parseFloat(item.price);
        const isVariant = item.productType === "variant" || item.variantId;

        const productDiscount = originalPrice - unitPrice;
        const campaignDiscount = parseFloat(item.discountAmount || 0);
        const totalDiscount = (productDiscount + campaignDiscount) * quantity;

        let itemVAT = 0;
        const taxType = item.taxType ? item.taxType.toLowerCase() : "";
        if (taxType === "exclusive" && item.tax) {
          const taxRate = parseFloat(item.tax || 0);
          const finalPrice = unitPrice - campaignDiscount;
          itemVAT = (finalPrice * quantity * taxRate) / 100;
        }

        const finalPrice = unitPrice - campaignDiscount;
        const lineTotal = finalPrice * quantity + itemVAT;

        const baseItem = {
          productId: productId,
          sku: item.sku || null,
          quantity: quantity,
          unitPrice: unitPrice,
          discount: totalDiscount,
          discountValue: parseFloat(item.discountValue || 0),
          discountType: item.discountType || "Percentage",
          tax: itemVAT,
          lineTotal: lineTotal,
          originalPrice: originalPrice,
          ...(item.campaignId && {
            campaignId: item.campaignId,
            campaignName: item.campaignName,
          }),
        };

        if (isVariant && item.variantId) {
          baseItem.variantId = parseInt(item.variantId);
          baseItem.variantAttributes = item.variantAttributes || {};
          baseItem.productType = "variant";
        }

        return baseItem;
      });

      const apiBundleItems = bundleItems.map((item) => {
        const bundleId = parseInt(item.id);
        const quantity = parseInt(item.quantity || 1);
        const unitPrice = parseFloat(item.price);
        const discountAmount = parseFloat(item.discountAmount || 0);

        const bundleVAT = item.totalVAT || calculateBundleVAT(item);
        const lineTotal = unitPrice * quantity + bundleVAT;

        const bundleItemDetails = item.bundleItems
          ? item.bundleItems.map((bundleItem) => {
              const product = bundleItem.product || bundleItem;
              return {
                productId: product.id || product.productId,
                quantity: bundleItem.quantity || 1,
                productName: product.productName || product.name,
                price: parseFloat(product.price || 0),
                taxType: product.taxType || "inclusive",
                tax: product.tax || 0,
              };
            })
          : [];

        return {
          bundleId: bundleId,
          quantity: quantity,
          unitPrice: unitPrice,
          discount: discountAmount * quantity,
          tax: bundleVAT,
          lineTotal: lineTotal,
          sku: item.sku || null,
          name: item.name || item.productName,
          originalPrice: parseFloat(
            item.originalPrice || item.totalOriginalPrice || 0
          ),
          bundleItems: bundleItemDetails,
        };
      });

      // IMPORTANT: Ensure dueAmount is not negative after points discount
      let dueAmount = grandTotal; // Since paidAmount is 0 initially

      const orderPayload = {
        customerId: customerData.id,
        shippingAddressId: parseInt(data.customerAddressId),
        paymentMethod: watch("payment") === "cod" ? "COD" : "OnlinePayment",
        totalAmount: parseFloat(subtotalBeforeDiscount.toFixed(2)),
        discount: parseFloat(totalProductDiscount.toFixed(2)),
        voucher_promo: parseFloat(couponDiscountAmount.toFixed(2)),
        tax: parseFloat(totalVAT.toFixed(2)),
        shippingCost: parseFloat(shippingCost.toFixed(2)),
        grandTotal: parseFloat(grandTotal.toFixed(2)),
        paidAmount: 0,
        dueAmount: parseFloat(dueAmount.toFixed(2)),
        note: data.note || "",
        status: "Pending",
        items: apiRegularItems,
        bundleItems: apiBundleItems,
        orderType: isBuyNow ? "buy_now" : "cart",
        couponCode: appliedCoupon?.code || null,
        couponDiscount: couponDiscountAmount || 0,
        pointsToRedeem: pointsToRedeem || 0,
        pointsDiscount: pointsDiscountAmount || 0,
        bundleVATDetails: bundleItems.map((item) => ({
          bundleId: item.id,
          name: item.name,
          totalVAT: item.totalVAT || calculateBundleVAT(item),
          originalPrice: parseFloat(
            item.originalPrice || item.totalOriginalPrice || 0
          ),
          finalPrice: parseFloat(item.price || 0),
        })),
      };

      console.log("Order Payload:", JSON.stringify(orderPayload, null, 2));

      const response = await apiClient("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      let orderData = null;
      let successMessage = "Order placed successfully";

      if (response && response.id && response.orderNumber) {
        orderData = response;
      } else if (response && response.success === true) {
        orderData = response.data;
        successMessage = response.message || successMessage;
      } else if (response && response.data && response.data.id) {
        orderData = response.data;
        successMessage = response.message || successMessage;
      } else {
        throw new Error(
          response?.message || "Invalid response format from server"
        );
      }

      if (!orderData || !orderData.id) {
        throw new Error("Order created but missing order ID");
      }

      clearSession();

      if (!isBuyNow) {
        await clearRegularCart();
        clearBundleCart();
      }

      const totalSavings =
        totalProductDiscount + couponDiscountAmount + pointsDiscountAmount;

      await Swal.fire({
        icon: "success",
        title: "Order Placed Successfully!",
        html: `
                    <div class="text-left space-y-3 text-black">
                        <div class="space-y-2">
                            <h1 class="flex justify-center items-center font-philosopher text-center text-2xl font-medium text-gray-800">
                                Thank you for your purchase!
                            </h1>
                            <p class="flex justify-between">
                                <strong>Order Number:</strong> 
                                <span class="text-teal-600 font-mono text-xl">#${
                                  orderData.orderNumber || "N/A"
                                }</span>
                            </p>
                            <p class="flex justify-between">
                                <strong>Original Price:</strong> 
                                <span class="text-md">৳${subtotalBeforeDiscount.toFixed(
                                  2
                                )}</span>
                            </p>
                            ${
                              totalProductDiscount > 0
                                ? `
                                <p class="flex justify-between">
                                    <strong>Product Discount:</strong> 
                                    <span class="text-md">-৳${totalProductDiscount.toFixed(
                                      2
                                    )}</span>
                                </p>
                            `
                                : ""
                            }
                            ${
                              couponDiscountAmount > 0
                                ? `
                                <p class="flex justify-between text-green-600">
                                    <strong>Coupon (${
                                      appliedCoupon?.code
                                    }):</strong> 
                                    <span class="text-md">-৳${couponDiscountAmount.toFixed(
                                      2
                                    )}</span>
                                </p>
                            `
                                : ""
                            }
                            ${
                              pointsDiscountAmount > 0
                                ? `
                                <p class="flex justify-between text-purple-600">
                                    <strong>Loyalty Points (${pointsToRedeem} pts):</strong> 
                                    <span class="text-md">-৳${pointsDiscountAmount.toFixed(
                                      2
                                    )}</span>
                                </p>
                            `
                                : ""
                            }
                            ${
                              totalVAT > 0
                                ? `
                                <p class="flex justify-between text-gray-600">
                                    <strong>VAT:</strong> 
                                    <span class="text-md">+৳${totalVAT.toFixed(
                                      2
                                    )}</span>
                                </p>
                            `
                                : ""
                            }
                            ${
                              shippingCost > 0
                                ? `
                                <p class="flex justify-between text-gray-600">
                                    <strong>Shipping:</strong> 
                                    <span class="text-md">+৳${shippingCost.toFixed(
                                      2
                                    )}</span>
                                </p>
                            `
                                : ""
                            }
                            <p class="flex justify-between border-t-2 pt-2">
                                <strong class="text-lg">Grand Total:</strong> 
                                <span class="text-lg font-bold text-gray-800">৳${grandTotal.toFixed(
                                  2
                                )}</span>
                            </p>
                            <p class="flex justify-between">
                                <strong>Payment:</strong> 
                                <span>${orderData.paymentMethod || "COD"}</span>
                            </p>
                        </div>
                        ${
                          totalSavings > 0
                            ? `
                            <div class="mt-3 px-3 py-1 bg-gradient-to-r from-green-50 to-emerald-50 rounded border border-green-200">
                                <p class="text-green-700 font-medium text-center">
                                    🎉 You saved ৳${totalSavings.toFixed(2)}!
                                </p>
                            </div>
                        `
                            : ""
                        }
                        ${
                          pointsToRedeem > 0
                            ? `
                            <div class="mt-3 px-3 py-1 bg-gradient-to-r from-purple-50 to-purple-100 rounded border border-purple-200">
                                <p class="text-purple-700 font-medium text-center">
                                    💎 ${pointsToRedeem} loyalty points redeemed
                                </p>
                            </div>
                        `
                            : ""
                        }
                    </div>
                `,
        confirmButtonColor: "#F4D941",
        confirmButtonText: "Continue Shopping",
        width: "550px",
      });

      router.push(`/`);
    } catch (error) {
      console.error("Checkout Error:", error);

      // Handle specific loyalty errors
      if (
        error.message.includes("points") ||
        error.message.includes("loyalty") ||
        error.message.includes("balance") ||
        error.message.includes("Minimum") ||
        error.message.includes("Cannot redeem")
      ) {
        toast.error(error.message);
        handlePointsRemoved();
      } else if (error.message.includes("coupon")) {
        toast.error(error.message);
        handleCouponRemoved();
      } else if (error.message.includes("variant")) {
        toast.error("Variant product error. Please refresh and try again.");
      } else if (
        error.message.includes("stock") ||
        error.message.includes("quantity")
      ) {
        toast.error("Some items are out of stock. Please update your cart.");
      } else if (error.response?.status === 422) {
        toast.error("Please check your information and try again.");
      } else {
        toast.error(
          error.message || "Failed to place order. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <Container className="text-gray-800 py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </Container>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <Container>
        <div className="flex items-center gap-2 text-gray-700 mt-10 text-sm md:text-base">
          <Link
            href="/"
            className="hover:underline hover:text-teal-600 flex items-center gap-1"
          >
            Home <IoIosArrowForward />
          </Link>
          <Link
            href="/cart"
            className="hover:underline hover:text-teal-600 flex items-center gap-1"
          >
            Cart <IoIosArrowForward />
          </Link>
          <p className="font-semibold">Checkout</p>
        </div>

        <div className="text-center min-h-[70vh] items-center justify-center flex flex-col">
          <div className="mb-6">
            <FaShoppingBag className="text-7xl text-gray-300 mx-auto" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-semibold text-gray-700 mb-4 font-philosopher">
            No items to checkout
          </h2>
          <p className="text-gray-600 mb-6">
            Add some products to your cart before checkout.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-secound hover:bg-secound-hover text-white rounded font-bold hover:secound-hover transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
          >
            <FaShoppingBag />
            Start Shopping
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="text-gray-800">
      <div className="flex items-center gap-2 text-gray-700 mt-10 text-sm md:text-base">
        <Link
          href="/"
          className="hover:underline hover:text-teal-600 flex items-center gap-1"
        >
          Home <IoIosArrowForward />
        </Link>
        <Link
          href="/cart"
          className="hover:underline hover:text-teal-600 flex items-center gap-1"
        >
          Cart <IoIosArrowForward />
        </Link>
        <p className="font-semibold">Checkout</p>
      </div>

      <h2 className="text-center text-2xl lg:text-[40px] font-philosopher text-black mt-4">
        Checkout
      </h2>

      <div className="py-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-5 xl:gap-10 2xl:gap-20">
        <BillingDetails
          user={user}
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          handleSubmit={handleSubmit}
          onCheckoutSubmit={onCheckoutSubmit}
          loading={loading}
        />

        <OrderSummary
          cart={checkoutItems}
          getCartTotal={isBuyNow ? getCheckoutTotal : getCombinedTotal}
          register={register}
          watch={watch}
          loading={loading}
          handleSubmit={handleSubmit}
          onCheckoutSubmit={onCheckoutSubmit}
          cartType={checkoutType}
          isBuyNow={isBuyNow}
          onCouponApplied={handleCouponApplied}
          onCouponRemoved={handleCouponRemoved}
          appliedCoupon={appliedCoupon}
          couponDiscount={couponDiscount}
          onPointsApplied={handlePointsApplied}
          onPointsRemoved={handlePointsRemoved}
          pointsToRedeem={pointsToRedeem}
          pointsDiscount={pointsDiscount}
          userEmail={user?.email} // Pass email to fetch correct customer ID
        />
      </div>
    </Container>
  );
}