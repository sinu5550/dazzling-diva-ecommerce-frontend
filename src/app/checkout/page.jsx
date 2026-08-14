// app/checkout/page.jsx - PUBLIC ACCESSIBLE CHECKOUT WITH GUEST SUPPORT & VARIANT DATA
"use client";

import Container from "@/components/Container/Container";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
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
import { useCartDrawer } from "@/context/CartDrawerContext";

export default function Checkout() {
  const router = useRouter();
  const { user } = useUser();
  const { openCartDrawer } = useCartDrawer();

  const {
    regularCart,
    bundleCart,
    getCombinedTotal,
    clearRegularCart,
    clearBundleCart,
    removeItem,
  } = useCartManager(user);

  const { checkoutSession, clearSession, isBuyNow, isLoaded } =
    useCheckoutSession();

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

  // Place Order handler ref to prevent re-render state loops
  const placeOrderRef = useRef(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      shipping: "dhaka-city",
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
          parseFloat(bundleItem.originalPrice || 0),
      );
      const discountRatio =
        originalBundlePrice > 0 ? finalBundlePrice / originalBundlePrice : 1;

      return bundleVAT * discountRatio * quantity;
    }

    return 0;
  }, []);

  // Fetch customer data for loyalty points & order placement (if user is logged in)
  const fetchCustomerData = useCallback(async () => {
    if (!user?.email) return null;

    try {
      const customerResult = await apiClient(
        `/api/customer/email/${encodeURIComponent(user.email)}`,
      );

      let data = null;
      if (customerResult && customerResult.success !== undefined) {
        data = customerResult.data;
      } else if (customerResult && customerResult.id) {
        data = customerResult;
      } else if (customerResult && customerResult.customer) {
        data = customerResult.customer;
      }

      if (data && data.id) {
        setCustomerData(data);
        return data;
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
          variantType: item.variantType,
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
        variantType: item.variantType,
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
      variantType: item.variantType,
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
          item.totalOriginalPrice || parseFloat(item.originalPrice || 0),
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

  // Fetch customer data on load if logged in
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

  // Handle removing item from checkout
  const handleRemoveItem = useCallback(
    async (itemToRemove) => {
      if (isBuyNow) {
        clearSession();
        setCheckoutItems([]);
        toast.success("Item removed from checkout");
        return;
      }

      const id = itemToRemove.productId || itemToRemove.id;
      const type = itemToRemove.isBundle ? "bundle" : "regular";
      const variantId = itemToRemove.variantId || null;

      await removeItem(id, type, variantId);

      setCheckoutItems((prev) =>
        prev.filter((item) => {
          if (itemToRemove.isBundle) {
            return item.id !== itemToRemove.id;
          }
          const itemRealId = item.productId || item.id;
          return !(
            (itemRealId === id) &&
            (item.variantId || null) === (variantId || null)
          );
        })
      );

      toast.success("Item removed from checkout");
    },
    [isBuyNow, clearSession, removeItem]
  );

  // Validate points before order submission
  const validatePointsRedemption = async (
    pointsToRedeem,
    orderSubtotal,
    couponDiscount,
  ) => {
    if (pointsToRedeem === 0) return { success: true };

    try {
      let currentCustomer = customerData;
      if (!currentCustomer || !currentCustomer.id) {
        currentCustomer = await fetchCustomerData();
      }

      if (!currentCustomer || !currentCustomer.id) {
        return {
          success: false,
          message: "Customer profile not found. Points redemption requires a registered account.",
        };
      }

      const response = await apiClient("/api/loyalty-points/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: currentCustomer.id,
          pointsToRedeem: pointsToRedeem,
          orderSubtotal: orderSubtotal,
          existingDiscounts: couponDiscount,
        }),
      });

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

      // Allow customerId from guest submission or logged-in user
      let customerId = data.customerId;
      if (!customerId) {
        let currentCustomer = customerData;
        if (!currentCustomer || !currentCustomer.id) {
          currentCustomer = await fetchCustomerData();
        }
        customerId = currentCustomer?.id;
      }

      if (!customerId) {
        toast.error("Customer information is required.");
        return;
      }

      if (!data.customerAddressId) {
        toast.error("Shipping address is required");
        return;
      }

      const shippingMethod = watch("shipping") || "dhaka-city";
      const shippingCost = 0; // Or calculate based on shippingMethod if applicable

      let subtotalBeforeDiscount = 0;
      let totalProductDiscount = 0;
      let totalVAT = 0;

      items.forEach((item) => {
        if (item.isBundle) {
          const bundlePrice = parseFloat(
            item.originalPrice || item.totalOriginalPrice || 0,
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
            item.originalPrice || item.price || 0,
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
          couponDiscountAmount,
        );

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
        const isVariant =
          item.productType === "variant" || item.variantId || item.variantAttributes;

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

        // Build variant attributes object & variantType string
        const variantAttrs = item.variantAttributes || item.attributes || null;
        let variantTypeStr =
          item.variantType || item.variantTitle || item.variantName || null;
        if (!variantTypeStr && variantAttrs && typeof variantAttrs === "object") {
          variantTypeStr = Object.entries(variantAttrs)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ");
        }

        const variantIdVal = item.variantId ? parseInt(item.variantId) : null;

        const baseItem = {
          productId: productId,
          sku: item.sku || item.variantSku || null,
          quantity: quantity,
          unitPrice: unitPrice,
          discount: totalDiscount,
          discountValue: parseFloat(item.discountValue || 0),
          discountType: item.discountType || "Percentage",
          tax: itemVAT,
          lineTotal: lineTotal,
          originalPrice: originalPrice,
          ...(variantIdVal && { variantId: variantIdVal, productVariantId: variantIdVal }),
          ...(variantAttrs && {
            variantAttributes: variantAttrs,
            attributes: variantAttrs,
            variantType: variantTypeStr || "",
          }),
          ...(item.campaignId && {
            campaignId: item.campaignId,
            campaignName: item.campaignName,
          }),
        };

        if (isVariant || variantIdVal || variantAttrs) {
          if (variantIdVal) {
            baseItem.variantId = variantIdVal;
            baseItem.productVariantId = variantIdVal;
          }
          baseItem.variantAttributes = variantAttrs || {};
          baseItem.attributes = variantAttrs || {};
          baseItem.variantType = variantTypeStr || "";
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
            item.originalPrice || item.totalOriginalPrice || 0,
          ),
          bundleItems: bundleItemDetails,
        };
      });

      let dueAmount = grandTotal;

      const orderPayload = {
        customerId: parseInt(customerId),
        shippingAddressId: parseInt(data.customerAddressId),
        paymentMethod:
          watch("payment") === "cod" ? "COD" : "OnlinePayment",
        totalAmount: Math.ceil(subtotalBeforeDiscount),
        discount: Math.ceil(totalProductDiscount),
        voucher_promo: Math.ceil(couponDiscountAmount),
        tax: Math.ceil(totalVAT),
        shippingCost: Math.ceil(shippingCost),
        grandTotal: Math.ceil(grandTotal),
        paidAmount: 0,
        dueAmount: Math.ceil(dueAmount),
        note:
          (watch("payment") === "bkash" || watch("payment") === "nagad")
            ? `[Payment Method: ${watch("payment") === "bkash" ? "bKash" : "Nagad"}] ${data.note || ""}`.trim()
            : data.note || "",
        status: "Pending",
        items: apiRegularItems,
        bundleItems: apiBundleItems,
        orderType: isBuyNow ? "buy_now" : "cart",
        couponCode: appliedCoupon?.code || null,
        couponDiscount: couponDiscountAmount || 0,
        pointsToRedeem: pointsToRedeem || 0,
        pointsDiscount: pointsDiscountAmount || 0,
        customerEmail: data.email || user?.email || customerData?.email || null,
        bundleVATDetails: bundleItems.map((item) => ({
          bundleId: item.id,
          name: item.name,
          totalVAT: item.totalVAT || calculateBundleVAT(item),
          originalPrice: parseFloat(
            item.originalPrice || item.totalOriginalPrice || 0,
          ),
          finalPrice: parseFloat(item.price || 0),
        })),
      };

      console.log("Order Payload:", JSON.stringify(orderPayload, null, 2));

      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "https://dazzling-diva-server.vercel.app").replace(/\/+$/, "");

      const orderRes = await fetch(`${apiUrl}/api/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      const response = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(response.message || "Failed to submit order");
      }

      let orderData = null;
      let successMessage = "Order placed successfully";

      if (response && response.id && response.orderNumber) {
        orderData = response;
      } else if (response && response.success === true) {
        orderData = response.data || response;
        successMessage = response.message || successMessage;
      } else if (response && response.data && (response.data.id || response.data.orderNumber)) {
        orderData = response.data;
        successMessage = response.message || successMessage;
      } else {
        orderData = response;
      }

      if (!orderData || !orderData.id) {
        throw new Error("Order created but missing order ID");
      }

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('last_order', JSON.stringify(orderData));
          sessionStorage.setItem('last_order', JSON.stringify(orderData));

          const existingOrders = JSON.parse(localStorage.getItem('guest_orders') || '[]');
          existingOrders.unshift(orderData);
          localStorage.setItem('guest_orders', JSON.stringify(existingOrders));
        } catch (e) {}
      }

      clearSession();

      if (!isBuyNow) {
        const regularItemsInOrder = regularItems.map((item) => ({
          id: item.productId || item.id,
          variantId: item.variantId,
        }));

        if (regularItemsInOrder.length > 0) {
          try {
            await Promise.all(
              regularItemsInOrder.map((item) => clearRegularCart(item.id, item.variantId))
            );
          } catch (e) {
            console.error("Failed to clear regular cart items:", e);
          }
        }

        const bundleItemsInOrder = bundleItems.map((item) => item.id);
        if (bundleItemsInOrder.length > 0) {
          try {
            clearBundleCart();
          } catch (e) {
            console.error("Failed to clear bundle cart:", e);
          }
        }
      }

      toast.success(`${successMessage}. Order #${orderData.orderNumber || orderData.id}`);
      router.push(`/track-order?orderId=${orderData.id}`);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <Container className="py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5A0C3D]"></div>
        </div>
      </Container>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <Container className="py-10 font-outfit">
        <div className="flex items-center gap-2 text-gray-700 mb-6 text-sm">
          <Link
            href="/"
            className="hover:underline hover:text-[#5A0C3D] flex items-center gap-1 transition"
          >
            Home <IoIosArrowForward />
          </Link>
          <p className="font-semibold text-gray-900">Checkout</p>
        </div>

        <div className="text-center min-h-[50vh] flex flex-col items-center justify-center">
          <FaShoppingBag className="text-7xl text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No items to checkout
          </h2>
          <p className="text-gray-600 mb-6">
            Add some products to your cart before checkout.
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-[#5A0C3D] text-white rounded-lg font-bold hover:bg-[#450322] transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <Container className="py-5 sm:py-8 md:py-10 pb-4 lg:pb-10 font-outfit text-gray-900">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-gray-700 text-xs md:text-sm mb-6">
          <Link
            href="/"
            className="hover:underline hover:text-[#5A0C3D] flex items-center gap-1 transition"
          >
            Home <IoIosArrowForward size={12} />
          </Link>
          <Link
            href="/cart"
            onClick={(e) => {
              if (window.innerWidth < 1024) {
                e.preventDefault();
                openCartDrawer();
              }
            }}
            className="hover:underline hover:text-[#5A0C3D] flex items-center gap-1 transition cursor-pointer"
          >
            Cart <IoIosArrowForward size={12} />
          </Link>
          <p className="font-semibold text-gray-900">Checkout</p>
        </div>

        <div className="max-w-7xl mx-auto text-gray-900">
          {/* Mobile View Sequential Order: 1. Your Order Products -> 2. Shipping Address -> 3. Order Summary & Place Order */}
          <div className="block lg:hidden space-y-6">
            {/* 1. Ordered Products List */}
            <OrderSummary
              cart={checkoutItems}
              getCartTotal={getCheckoutTotal}
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
              userEmail={user?.email}
              placeOrderRef={placeOrderRef}
              onRemoveItem={handleRemoveItem}
              renderOnly="products"
            />

            {/* 2. Shipping Address & Payment Form */}
            <BillingDetails
              user={user}
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
              handleSubmit={handleSubmit}
              onCheckoutSubmit={onCheckoutSubmit}
              loading={loading}
              setLoading={setLoading}
              totalAmount={getCheckoutTotal()}
              placeOrderRef={placeOrderRef}
            />

            {/* 3. Order Summary (Price Calculation & Place Order Button) */}
            <OrderSummary
              cart={checkoutItems}
              getCartTotal={getCheckoutTotal}
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
              userEmail={user?.email}
              placeOrderRef={placeOrderRef}
              onRemoveItem={handleRemoveItem}
              renderOnly="summary"
            />
          </div>

          {/* Desktop View (2-Column Standard Grid Layout) */}
          <div className="hidden lg:grid grid-cols-12 gap-8">
            {/* Left Column: Billing Details */}
            <div className="col-span-7">
              <BillingDetails
                user={user}
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
                handleSubmit={handleSubmit}
                onCheckoutSubmit={onCheckoutSubmit}
                loading={loading}
                setLoading={setLoading}
                totalAmount={getCheckoutTotal()}
                placeOrderRef={placeOrderRef}
              />
            </div>

            {/* Right Column: Complete Order Summary */}
            <div className="col-span-5">
              <OrderSummary
                cart={checkoutItems}
                getCartTotal={getCheckoutTotal}
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
                userEmail={user?.email}
                placeOrderRef={placeOrderRef}
                onRemoveItem={handleRemoveItem}
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
