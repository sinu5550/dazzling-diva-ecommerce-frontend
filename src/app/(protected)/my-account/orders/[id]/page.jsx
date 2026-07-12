"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
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
  Share2,
  Truck,
  User,
  XCircle
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

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
    return <LoadingSpinner />;
  }

  return <OrderDetailsContent orderId={orderId} />;
};

// Main content component
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

      // Verify order belongs to current user
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

  // Get status configuration
  const getStatusConfig = (status) => {
    const statusConfigs = {
      Pending: {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-800",
        icon: <Clock className="w-6 h-6" />,
        label: "Order Pending",
        description: "Your order is awaiting confirmation",
      },
      Confirmed: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-800",
        icon: <CheckCircle className="w-6 h-6" />,
        label: "Order Confirmed",
        description: "Your order has been confirmed and is being prepared",
      },
      Processing: {
        bg: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-800",
        icon: <Package className="w-6 h-6" />,
        label: "Processing",
        description: "Your order is being processed and packed",
      },
      Shipped: {
        bg: "bg-indigo-50",
        border: "border-indigo-200",
        text: "text-indigo-800",
        icon: <Truck className="w-6 h-6" />,
        label: "Shipped",
        description: "Your order is on the way",
      },
      Delivered: {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-800",
        icon: <CheckCircle className="w-6 h-6" />,
        label: "Delivered",
        description: "Your order has been delivered",
      },
      Cancelled: {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-800",
        icon: <XCircle className="w-6 h-6" />,
        label: "Cancelled",
        description: "This order has been cancelled",
      },
    };

    return statusConfigs[status] || statusConfigs.Pending;
  };

  // Get order timeline
  const getOrderTimeline = (status) => {
    const steps = [
      {
        key: "Pending",
        label: "Order Placed",
        icon: <CheckCircle className="w-5 h-5" />,
      },
      {
        key: "Confirmed",
        label: "Confirmed",
        icon: <CheckCircle className="w-5 h-5" />,
      },
      {
        key: "Processing",
        label: "Processing",
        icon: <Package className="w-5 h-5" />,
      },
      { key: "Shipped", label: "Shipped", icon: <Truck className="w-5 h-5" /> },
      {
        key: "Delivered",
        label: "Delivered",
        icon: <CheckCircle className="w-5 h-5" />,
      },
    ];

    const statusOrder = [
      "Pending",
      "Confirmed",
      "Processing",
      "Shipped",
      "Delivered",
    ];
    const currentIndex = statusOrder.indexOf(status);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 2,
    }).format(price);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Order ${order.orderNumber}`,
          text: `Check out my order details`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      Swal.fire({
        icon: "success",
        title: "Link Copied!",
        text: "Order link copied to clipboard",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  if (userLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white hasib-rounded shadow-sm p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Error Loading Order
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/my-account/orders"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white hasib-rounded font-medium hover:bg-teal-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const statusConfig = getStatusConfig(order.status);
  const timeline = getOrderTimeline(order.status);

  return (
    <div className="min-h-screen bg-zinc-50 hasib-rounded py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link
            href="/"
            className="hover:text-teal-600 flex items-center gap-1"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/my-account" className="hover:text-teal-600">
            My Account
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/my-account/orders" className="hover:text-teal-600">
            Orders
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">{order.orderNumber}</span>
        </div>

        {/* Header */}
        <div className="bg-white hasib-rounded shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link
                  href="/my-account/orders"
                  className="p-2 hover:bg-gray-100 hasib-rounded transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order {order.orderNumber}
                </h1>
              </div>
              <p className="text-gray-600 flex items-center gap-2 ml-11">
                <Calendar className="w-4 h-4" />
                Placed on {formatDate(order.orderDate)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 border border-stone-300 text-gray-700 hasib-rounded hover:bg-gray-50 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>

          {/* Status Banner */}
          <div
            className={`${statusConfig.bg} ${statusConfig.border} border-2 hasib-rounded px-6 py-2`}
          >
            <div className="flex items-center gap-4">
              <div className={`${statusConfig.text}`}>{statusConfig.icon}</div>
              <div className="flex-1">
                <h3 className={`text-lg font-bold ${statusConfig.text}`}>
                  {statusConfig.label}
                </h3>
                <p className={`text-sm ${statusConfig.text} opacity-80`}>
                  {statusConfig.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Your existing code */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Timeline */}
            {order.status !== "Cancelled" && (
              <div className="bg-white hasib-rounded shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">
                  Order Progress
                </h2>
                <div className="relative">
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
                    <div
                      className="h-full bg-teal-600 transition-all duration-500"
                      style={{
                        width: `${((timeline.filter((s) => s.completed).length - 1) /
                            (timeline.length - 1)) *
                          100
                          }%`,
                      }}
                    />
                  </div>

                  <div className="relative flex justify-between">
                    {timeline.map((step) => (
                      <div
                        key={step.key}
                        className="flex flex-col items-center"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step.completed
                              ? "bg-teal-600 border-teal-600 text-white"
                              : "bg-white border-stone-300 text-gray-400"
                            } ${step.active ? "ring-4 ring-teal-100" : ""}`}
                        >
                          {step.icon}
                        </div>
                        <p
                          className={`mt-2 text-xs font-medium text-center ${step.completed ? "text-gray-900" : "text-gray-400"
                            }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Order Items - Keep your existing code exactly as is */}
            <div className="bg-white hasib-rounded shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Order Items ({order.orderItems.length})
              </h2>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 border border-gray-200 hasib-rounded hover:border-teal-200 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 bg-gray-100 hasib-rounded overflow-hidden">
                        {item.product.images && item.product.images[0] ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.productName}
                            width={96}
                            height={96}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-10 h-10 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.product.productName}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        SKU: {item.sku || item.product.sku}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            Unit Price: {formatPrice(item.unitPrice)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </p>

                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 line-through">
                            {formatPrice(
                              parseFloat(item.unitPrice) * item.quantity
                            )}
                          </p>
                          <p className="text-lg font-bold text-teal-600">
                            {formatPrice(item.lineTotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Note */}
            {order.note && (
              <div className="bg-white hasib-rounded shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Order Note
                </h2>
                <p className="text-gray-600 bg-gray-50 p-4 hasib-rounded">
                  {order.note}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - Keep your existing sidebar code */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white hasib-rounded shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
                {parseFloat(order.discount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">
                      - {formatPrice(order.discount)}
                    </span>
                  </div>
                )}
                {parseFloat(order.voucher_promo) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Voucher Promo</span>
                    <span className="font-medium">
                      - {formatPrice(order.voucher_promo)}
                    </span>
                  </div>
                )}
                {parseFloat(order.tax) > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span className="font-medium">
                      {formatPrice(order.tax)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium">
                    {formatPrice(order.shippingCost)}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-teal-600">
                    {formatPrice(order.grandTotal)}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method</span>
                    <span className="font-medium text-gray-900">
                      {order.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paid Amount</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(order.paidAmount)}
                    </span>
                  </div>
                  {parseFloat(order.dueAmount) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Due Amount</span>
                      <span className="font-medium text-red-600">
                        {formatPrice(order.dueAmount)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="bg-white hasib-rounded shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Shipping Address
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <User className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {order.shippingAddress.recipientName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.shippingAddress.type} Address
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-600">
                      <p>{order.shippingAddress.address}</p>
                      <p>
                        {order.shippingAddress.upazila},{" "}
                        {order.shippingAddress.district}
                      </p>
                      <p>
                        {order.shippingAddress.division} -{" "}
                        {order.shippingAddress.postalCode}
                      </p>
                      <p className="font-medium mt-1">
                        {order.shippingAddress.country}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress.phoneNumber}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Customer Information */}
            <div className="bg-white hasib-rounded shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Customer Code</p>
                  <p className="font-medium text-gray-900">
                    {order.customer.customerCode}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900">
                    {order.customer.fullName}
                  </p>
                </div>
                {order.customer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {order.customer.email}
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {order.customer.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 hasib-rounded shadow-sm p-6 border border-teal-100">
              <h3 className="font-bold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Have questions about your order? Our support team is here to
                help!
              </p>
              <Link
                href="/corporate-enquiries"
                className="inline-block w-full text-center px-4 py-2 bg-secound text-white rounded font-medium hover:bg-secound-hover transition-colors"
              >
                Contact Support
              </Link>
            </div>
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
