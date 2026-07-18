"use client";

import { useUser } from "@/hooks/useUser";
import { apiClient } from "@/lib/apiClient";
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    Clock,
    Eye,
    Filter,
    Home,
    MapPin,
    Package,
    Phone,
    Search,
    ShoppingBag,
    Truck,
    XCircle
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Skeleton Loader for Order list page
const OrdersSkeleton = () => {
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

      {/* Header bar */}
      <div className="bg-gray-50 p-4 border border-gray-100 rounded-[12px] space-y-2">
        <div className="w-36 h-7 bg-gray-200 rounded-[6px]" />
        <div className="w-48 h-4 bg-gray-150 rounded-[4px]" />
      </div>

      {/* Filters */}
      <div className="bg-gray-50/50 border border-gray-100 rounded-[12px] p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 h-11 bg-white border border-gray-200 rounded-[6px]" />
        <div className="md:w-64 h-11 bg-white border border-gray-200 rounded-[6px]" />
      </div>

      {/* Order Cards */}
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-[12px] p-6 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-24 h-5 bg-gray-200 rounded-[4px]" />
                  <div className="w-20 h-6 bg-gray-150 rounded-full" />
                </div>
                <div className="flex gap-4">
                  <div className="w-28 h-4 bg-gray-150 rounded-[4px]" />
                  <div className="w-16 h-4 bg-gray-150 rounded-[4px]" />
                  <div className="w-20 h-4 bg-gray-200 rounded-[4px]" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 h-10 bg-gray-200 rounded-[6px]" />
                <div className="w-8 h-8 bg-gray-150 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const OrderPage = () => {
  const { user, loading: userLoading } = useUser();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (user?.email) {
      fetchOrders();
    } else if (!userLoading && !user) {
      setLoading(false);
    }
  }, [user, userLoading]);

  useEffect(() => {
    let filtered = orders;

    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.orderItems?.some((item) =>
            item.product?.productName
              ?.toLowerCase()
              ?.includes(searchQuery.toLowerCase())
          )
      );
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const customerResult = await apiClient(
        `/api/customer/email/${encodeURIComponent(user.email)}`
      );

      let customerData = null;
      if (customerResult && customerResult.success !== undefined) {
        customerData = customerResult.data;
      } else if (customerResult && customerResult.id) {
        customerData = customerResult;
      }

      if (!customerData || !customerData.id) {
        setError("Customer profile not found");
        setLoading(false);
        return;
      }

      const ordersResult = await apiClient("/api/order");

      let allOrders = [];
      if (ordersResult && ordersResult.success && ordersResult.data) {
        allOrders = ordersResult.data;
      } else if (Array.isArray(ordersResult)) {
        allOrders = ordersResult;
      }

      const customerOrders = allOrders.filter(
        (order) => order.customerId === customerData.id
      );

      setOrders(customerOrders);
      setFilteredOrders(customerOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Pending: {
        bg: "bg-yellow-50 text-yellow-800 border-yellow-200/50",
        icon: <Clock className="w-3.5 h-3.5" />,
        label: "Pending",
      },
      Confirmed: {
        bg: "bg-blue-50 text-blue-800 border-blue-200/50",
        icon: <CheckCircle className="w-3.5 h-3.5" />,
        label: "Confirmed",
      },
      Processing: {
        bg: "bg-purple-50 text-purple-800 border-purple-200/50",
        icon: <Package className="w-3.5 h-3.5" />,
        label: "Processing",
      },
      Shipped: {
        bg: "bg-indigo-50 text-indigo-800 border-indigo-200/50",
        icon: <Truck className="w-3.5 h-3.5" />,
        label: "Shipped",
      },
      Delivered: {
        bg: "bg-green-50 text-green-800 border-green-200/50",
        icon: <CheckCircle className="w-3.5 h-3.5" />,
        label: "Delivered",
      },
      Cancelled: {
        bg: "bg-red-50 text-red-800 border-red-200/50",
        icon: <XCircle className="w-3.5 h-3.5" />,
        label: "Cancelled",
      },
    };

    const config = statusConfig[status] || statusConfig.Pending;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg}`}
      >
        {config.icon}
        {config.label}
      </span>
    );
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
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (userLoading || loading) {
    return <OrdersSkeleton />;
  }

  if (!user) {
    return (
      <div className="w-full bg-white rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-12 text-center border border-gray-100 font-outfit">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Sign In Required
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Please sign in to view your order history
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-2.5 bg-[#5A0C3D] hover:bg-[#4a0a32] text-white rounded-[6px] text-sm font-semibold transition-colors duration-200 uppercase tracking-wide"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-6 text-gray-800 font-outfit border border-gray-100">
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-[#5A0C3D] flex items-center gap-1 transition-colors duration-200">
            <Home className="w-4 h-4" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link href="/my-account" className="hover:text-[#5A0C3D] transition-colors duration-200">
            My Account
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-medium">Orders</span>
        </div>

        {/* Header */}
        <div className="bg-[#5A0C3D]/5 p-4 rounded-[12px] border border-[#5A0C3D]/10">
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            My Orders
          </h1>
          <p className="text-xs text-gray-500 font-medium">Track and manage your order history</p>
        </div>

        {/* Return Notice */}
        <div className="bg-[#5A0C3D]/5 border border-[#5A0C3D]/10 rounded-[12px] p-4 text-xs text-gray-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#5A0C3D] mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold text-gray-900">Return Information</p>
            <p className="mt-0.5 text-gray-600">Please note that there is no direct return option on the website. If you wish to return a product, please contact us directly at <a href="tel:+8801768179927" className="font-bold underline text-[#5A0C3D] hover:text-[#4a0a32]">+8801768179927</a>.</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-50/50 rounded-[12px] border border-gray-100 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by order number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-[6px] text-sm text-gray-900 placeholder-gray-450 focus:outline-none focus:ring-1 focus:ring-[#5A0C3D] focus:border-[#5A0C3D] transition-colors"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="md:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-[6px] text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#5A0C3D] focus:border-[#5A0C3D] transition-colors appearance-none"
                >
                  <option value="All">All Orders</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-500 font-medium">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>

        {/* Orders List */}
        {error ? (
          <div className="bg-red-50 border border-red-150 text-red-700 text-sm rounded-[6px] p-4 font-semibold">
            {error}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-[12px] border border-gray-100 p-12 text-center">
            <Package className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              No Orders Found
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {searchQuery || statusFilter !== "All"
                ? "Try adjusting your search query or status filter"
                : "You haven't placed any orders yet"}
            </p>
            <Link
              href="/product"
              className="inline-block px-6 py-2.5 bg-[#5A0C3D] hover:bg-[#4a0a32] text-white rounded-[6px] text-sm font-semibold transition-colors uppercase tracking-wide cursor-pointer"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-[12px] border border-gray-150/80 overflow-hidden shadow-xs hover:border-[#5A0C3D]/30 transition-all duration-200"
              >
                {/* Order Header */}
                <div className="p-5 border-b border-gray-100 bg-gray-50/20">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3.5 mb-2">
                        <h3 className="text-base font-bold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {formatDate(order.orderDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-3.5 h-3.5 text-gray-400" />
                          {order.orderItems?.length || 0}{" "}
                          {(order.orderItems?.length || 0) === 1 ? "Item" : "Items"}
                        </span>
                        <span className="font-bold text-[#5A0C3D]">
                          {formatPrice(order.grandTotal)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/my-account/orders/${order.id}`}
                        className="flex items-center gap-1 px-4 py-2 border border-[#5A0C3D] text-[#5A0C3D] hover:bg-[#5A0C3D]/5 rounded-[6px] transition-colors text-xs font-bold uppercase tracking-wider"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Details
                      </Link>
                      <button
                        onClick={() => toggleOrderExpand(order.id)}
                        className="p-1.5 hover:bg-gray-100 rounded-[6px] border border-gray-200 transition-colors cursor-pointer"
                      >
                        {expandedOrder === order.id ? (
                          <ChevronUp className="w-4 h-4 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Order Details */}
                {expandedOrder === order.id && (
                  <div className="p-5 bg-gray-50/50 space-y-5 border-t border-gray-100">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Shipping Address */}
                      {order.shippingAddress && (
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 mb-2.5">
                            Shipping Details
                          </h4>
                          <div className="bg-white p-4 rounded-[12px] border border-gray-150 space-y-2 text-xs text-gray-700">
                            <p className="font-bold text-gray-900 text-sm">
                              {order.shippingAddress.recipientName}
                            </p>
                            <p className="flex items-start gap-1.5 text-gray-600">
                              <MapPin className="w-3.5 h-3.5 mt-0.5 text-gray-400 flex-shrink-0" />
                              <span>
                                {order.shippingAddress.address}, {order.shippingAddress.upazila}, {order.shippingAddress.district}, {order.shippingAddress.division} - {order.shippingAddress.postalCode}
                              </span>
                            </p>
                            <p className="flex items-center gap-1.5 text-gray-600">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              {order.shippingAddress.phoneNumber}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Order Summary */}
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-2.5">
                          Amount Details
                        </h4>
                        <div className="bg-white p-4 rounded-[12px] border border-gray-150 space-y-2 text-xs">
                          <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>{formatPrice(order.totalAmount)}</span>
                          </div>
                          {parseFloat(order.discount) > 0 && (
                            <div className="flex justify-between text-green-600 font-semibold">
                              <span>Discount</span>
                              <span>-{formatPrice(order.discount)}</span>
                            </div>
                          )}
                          {parseFloat(order.voucher_promo) > 0 && (
                            <div className="flex justify-between text-green-600 font-semibold">
                              <span>Voucher Discount</span>
                              <span>-{formatPrice(order.voucher_promo)}</span>
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
                          <div className="border-t pt-2.5 flex justify-between font-bold text-gray-900 text-sm">
                            <span>Grand Total</span>
                            <span className="text-[#5A0C3D]">
                              {formatPrice(order.grandTotal)}
                            </span>
                          </div>
                          <div className="flex justify-between text-[11px] text-gray-500 pt-2 border-t mt-1">
                            <span>Payment Method</span>
                            <span className="font-bold text-gray-700">
                              {order.paymentMethod}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPage;
