"use client";

import { useUser } from "@/hooks/useUser";
import { apiClient } from "@/lib/apiClient";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  Home,
  Mail,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
  XCircle
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Skeleton Loader for Order details page
const OrderDetailsSkeleton = () => {
  return (
    <div className="w-full bg-white rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-6 text-gray-800 animate-pulse font-outfit border border-gray-100 space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-12 h-4 bg-gray-200 rounded-[4px]" />
        <div className="w-4 h-4 bg-gray-200 rounded-full" />
        <div className="w-20 h-4 bg-gray-200 rounded-[4px]" />
        <div className="w-4 h-4 bg-gray-200 rounded-full" />
        <div className="w-16 h-4 bg-gray-200 rounded-[4px]" />
      </div>

      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-5">
        <div className="space-y-2">
          <div className="w-16 h-4 bg-gray-150 rounded-[4px]" />
          <div className="w-44 h-7 bg-gray-200 rounded-[6px]" />
        </div>
        <div className="w-32 h-10 bg-gray-150 rounded-[6px]" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-44 bg-gray-100 rounded-[12px]" />
          <div className="h-64 bg-gray-100 rounded-[12px]" />
        </div>
        <div className="space-y-6">
          <div className="h-48 bg-gray-100 rounded-[12px]" />
          <div className="h-48 bg-gray-100 rounded-[12px]" />
        </div>
      </div>
    </div>
  );
};

const OrderDetailsPage = ({ params }) => {
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      setOrderId(resolvedParams.id);
    };
    unwrapParams();
  }, [params]);

  if (!orderId) {
    return <OrderDetailsSkeleton />;
  }

  return <OrderDetailsContent orderId={orderId} />;
};

const OrderDetailsContent = ({ orderId }) => {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (orderId && user) {
      fetchOrderDetails();
    }
  }, [orderId, user]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await apiClient(`/api/order/${orderId}`);

      let orderData = null;
      if (result && result.success && result.data) {
        orderData = result.data;
      } else if (result && result.id) {
        orderData = result;
      }

      if (!orderData) {
        throw new Error("Order not found");
      }

      const customerResult = await apiClient(
        `/api/customer/email/${encodeURIComponent(user.email)}`
      );
      let customerData = null;

      if (customerResult && customerResult.success !== undefined) {
        customerData = customerResult.data;
      } else if (customerResult && customerResult.id) {
        customerData = customerResult;
      }

      if (customerData && orderData.customerId !== customerData.id) {
        throw new Error("Unauthorized access to this order");
      }

      setOrder(orderData);
    } catch (error) {
      console.error("Error fetching order:", error);
      setError(error.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const statusConfigs = {
      Pending: {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-800",
        icon: <Clock className="w-5 h-5 text-yellow-600" />,
        label: "Order Pending",
        description: "Your order is awaiting confirmation",
      },
      Confirmed: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-800",
        icon: <CheckCircle className="w-5 h-5 text-blue-600" />,
        label: "Order Confirmed",
        description: "Your order has been confirmed and is being prepared",
      },
      Processing: {
        bg: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-800",
        icon: <Package className="w-5 h-5 text-purple-600" />,
        label: "Processing",
        description: "Your order is being processed and packed",
      },
      Shipped: {
        bg: "bg-indigo-50",
        border: "border-indigo-200",
        text: "text-indigo-800",
        icon: <Truck className="w-5 h-5 text-indigo-600" />,
        label: "Shipped",
        description: "Your order is on the way",
      },
      Delivered: {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-800",
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
        label: "Delivered",
        description: "Your order has been delivered",
      },
      Cancelled: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-800",
        icon: <XCircle className="w-5 h-5 text-red-600" />,
        label: "Cancelled",
        description: "This order has been cancelled",
      },
    };

    return statusConfigs[status] || statusConfigs.Pending;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (userLoading || loading) {
    return <OrderDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="w-full bg-white rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-8 text-center border border-gray-100 font-outfit">
        <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-4 animate-pulse" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Error Details</h2>
        <p className="text-sm text-gray-500 mb-6">{error}</p>
        <button
          onClick={() => router.push("/my-account/orders")}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#5A0C3D] hover:bg-[#4a0a32] text-white rounded-[6px] text-sm font-semibold uppercase transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </button>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);

  return (
    <div className="w-full bg-white rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-6 text-gray-800 font-outfit border border-gray-100 print-area">
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-600 no-print">
          <Link href="/" className="hover:text-[#5A0C3D] flex items-center gap-1 transition-colors duration-200">
            <Home className="w-4 h-4" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link href="/my-account" className="hover:text-[#5A0C3D] transition-colors duration-200">
            My Account
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link href="/my-account/orders" className="hover:text-[#5A0C3D] transition-colors duration-200">
            Orders
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-medium">#{order.orderNumber}</span>
        </div>

        {/* Back Link */}
        <div className="no-print">
          <button
            onClick={() => router.push("/my-account/orders")}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#5A0C3D] font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Orders
          </button>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-5 gap-4">
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Order Details</span>
            <h1 className="text-xl md:text-2xl font-bold text-gray-950">
              Order #{order.orderNumber}
            </h1>
          </div>
          <div className="flex items-center gap-3 no-print">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-[6px] text-xs font-bold transition-all uppercase cursor-pointer"
            >
              <FileText className="w-4 h-4" /> Print Invoice
            </button>
          </div>
        </div>

        {/* Status Alert Banner */}
        <div className={`p-4 rounded-[12px] border ${statusConfig.bg} ${statusConfig.border} flex items-start gap-3.5`}>
          <div className="mt-0.5">{statusConfig.icon}</div>
          <div>
            <h3 className={`font-bold text-sm ${statusConfig.text}`}>
              {statusConfig.label}
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">
              {statusConfig.description} on {formatDate(order.updatedAt || order.orderDate)}
            </p>
          </div>
        </div>

        {/* Return Notice */}
        <div className="bg-[#5A0C3D]/5 border border-[#5A0C3D]/10 rounded-[12px] p-4 text-xs text-gray-700 flex items-start gap-2.5 no-print">
          <AlertCircle className="w-4 h-4 text-[#5A0C3D] mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold text-gray-900">Need to Return a Product?</p>
            <p className="mt-0.5 text-gray-600">Please note that there is no direct return option on the website. To request a return, please contact our support team at <a href="tel:+8801768179927" className="font-bold underline text-[#5A0C3D] hover:text-[#4a0a32]">+8801768179927</a>.</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Columns - Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[12px] border border-gray-150 p-5 space-y-4">
              <h2 className="text-base font-bold text-gray-950 flex items-center gap-2 border-b border-gray-50 pb-3">
                <Package className="w-4.5 h-4.5 text-[#5A0C3D]" />
                Order Items ({order.orderItems?.length || 0})
              </h2>

              <div className="divide-y divide-gray-100">
                {order.orderItems?.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-[8px] overflow-hidden border border-gray-100 flex-shrink-0">
                      {item.product?.images?.[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.productName}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm truncate">
                        {item.product?.productName}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        SKU: {item.sku || item.product?.sku || "N/A"}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                          Qty: {item.quantity}
                        </span>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {formatPrice(item.unitPrice)} × {item.quantity}
                          </p>
                          <p className="text-sm font-bold text-gray-900 mt-0.5">
                            {formatPrice(item.lineTotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Summary & Addresses */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-[12px] border border-gray-150 p-5 space-y-4">
              <h2 className="text-base font-bold text-gray-950 border-b border-gray-50 pb-3">
                Order Summary
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
                {parseFloat(order.discount) > 0 && (
                  <div className="flex justify-between text-[#137333] font-semibold">
                    <span>Discount</span>
                    <span>- {formatPrice(order.discount)}</span>
                  </div>
                )}
                {parseFloat(order.voucher_promo) > 0 && (
                  <div className="flex justify-between text-[#137333] font-semibold">
                    <span>Voucher Promo</span>
                    <span>- {formatPrice(order.voucher_promo)}</span>
                  </div>
                )}
                {parseFloat(order.tax) > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>{formatPrice(order.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{formatPrice(order.shippingCost)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3.5 flex justify-between text-base font-bold text-gray-950">
                  <span>Grand Total</span>
                  <span className="text-[#5A0C3D]">
                    {formatPrice(order.grandTotal)}
                  </span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="border-t border-gray-150 pt-4 mt-4">
                <h3 className="text-sm font-bold text-gray-950 mb-3 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  Payment Details
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method</span>
                    <span className="font-semibold text-gray-900">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paid Amount</span>
                    <span className="font-semibold text-gray-900">{formatPrice(order.paidAmount)}</span>
                  </div>
                  {parseFloat(order.dueAmount) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Due Amount</span>
                      <span className="font-semibold text-red-600">{formatPrice(order.dueAmount)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="bg-white rounded-[12px] border border-gray-150 p-5 space-y-4">
                <h2 className="text-base font-bold text-gray-950 flex items-center gap-1.5 border-b border-gray-50 pb-3">
                  <Truck className="w-4.5 h-4.5 text-gray-500" />
                  Shipping Address
                </h2>
                <div className="space-y-2.5 text-xs text-gray-700">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-gray-950">
                        {order.shippingAddress.recipientName}
                      </p>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">
                        {order.shippingAddress.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="text-gray-600 leading-relaxed">
                      <p className="font-semibold text-gray-800">{order.shippingAddress.address}</p>
                      <p>{order.shippingAddress.upazila}, {order.shippingAddress.district}</p>
                      <p>{order.shippingAddress.division} - {order.shippingAddress.postalCode}</p>
                      <p className="font-bold text-[#5A0C3D] mt-0.5">{order.shippingAddress.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <p className="text-gray-650 font-semibold">{order.shippingAddress.phoneNumber}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area,
          .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderDetailsPage;
