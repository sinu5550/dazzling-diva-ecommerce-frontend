"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useUser } from "@/hooks/useUser";
import { apiClient } from "@/lib/apiClient";
import {
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

const OrderPage = () => {
  
  const { user, loading: userLoading } = useUser();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Fetch orders on component mount
  useEffect(() => {
    if (user?.email) {
      fetchOrders();
    }
  }, [user]);

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = orders;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.orderItems.some((item) =>
            item.product.productName
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          )
      );
    }

    // Filter by status
    if (statusFilter !== "All") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // First get customer ID
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

      // Fetch all orders
      const ordersResult = await apiClient("/api/order");

      let allOrders = [];
      if (ordersResult && ordersResult.success && ordersResult.data) {
        allOrders = ordersResult.data;
      } else if (Array.isArray(ordersResult)) {
        allOrders = ordersResult;
      }

      // Filter orders for this customer
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

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusConfig = {
      Pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: <Clock className="w-4 h-4" />,
        label: "Pending",
      },
      Confirmed: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        icon: <CheckCircle className="w-4 h-4" />,
        label: "Confirmed",
      },
      Processing: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        icon: <Package className="w-4 h-4" />,
        label: "Processing",
      },
      Shipped: {
        bg: "bg-indigo-100",
        text: "text-indigo-800",
        icon: <Truck className="w-4 h-4" />,
        label: "Shipped",
      },
      Delivered: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: <CheckCircle className="w-4 h-4" />,
        label: "Delivered",
      },
      Cancelled: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: <XCircle className="w-4 h-4" />,
        label: "Cancelled",
      },
    };

    const config = statusConfig[status] || statusConfig.Pending;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
      >
        {config.icon}
        {config.label}
      </span>
    );
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
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Toggle expanded order
  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (userLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-8 hasib-rounded shadow-lg max-w-md">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Sign In Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please sign in to view your orders
          </p>
          <Link
            href="/auth/login"
            className="inline-block px-6 py-3 bg-teal-600 text-white hasib-rounded font-medium hover:bg-teal-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8 hasib-rounded">
      <div className="container mx-auto px-4 max-w-7xl">
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
          <p>Orders</p>
        </div>
        {/* Header */}
        <div className="bg-white p-4 hasib-rounded shadow mb-5">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 font-philosopher">
            My Orders
          </h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white hasib-rounded shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by order number or product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 py-2 border border-gray-200 rounded focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-al"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="md:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 py-2 border border-gray-200 rounded focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-al"
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

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>

        {/* Orders List */}
        {error ? (
          <div className="bg-red-50 border border-red-200 hasib-rounded p-4 text-red-800">
            {error}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white hasib-rounded shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Orders Found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter !== "All"
                ? "Try adjusting your filters"
                : "You haven't placed any orders yet"}
            </p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-teal-600 text-white hasib-rounded font-medium hover:bg-teal-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white hasib-rounded shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                        #  {order.orderNumber}
                        </h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {formatDate(order.orderDate)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Package className="w-4 h-4" />
                          {order.orderItems.length}{" "}
                          {order.orderItems.length === 1 ? "Item" : "Items"}
                        </span>
                        <span className="font-semibold text-teal-600">
                          {formatPrice(order.grandTotal)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/my-account/orders/${order.id}`}
                        className="flex items-center gap-2 px-4 py-2 border border-teal-600 text-teal-600 hasib-rounded hover:bg-teal-50 transition-colors font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Link>
                      <button
                        onClick={() => toggleOrderExpand(order.id)}
                        className="p-2 hover:bg-gray-100 hasib-rounded transition-colors"
                      >
                        {expandedOrder === order.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Order Details */}
                {expandedOrder === order.id && (
                  <div className="p-6 bg-gray-50 space-y-6 ">
                    {/* Order Items */}
                    {/* <div>
                      <h4 className="font-semibold text-gray-900 mb-4">
                        Order Items
                      </h4>
                      <div className="space-y-3">
                        {order.orderItems.map((item) => (
                          <div
                            key={item.id}
                            className="bg-white p-4 hasib-rounded flex gap-4 shadow"
                          >
                            <div className="flex-shrink-0">
                              <div className="w-20 h-20 bg-gray-100 hasib-rounded overflow-hidden">
                                {item.product.images &&
                                item.product.images[0] ? (
                                  <Image
                                    src={item.product.images[0]}
                                    alt={item.product.productName}
                                    width={80}
                                    height={80}
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-8 h-8 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 mb-1">
                                {item.product.productName}
                              </h5>
                              <p className="text-sm text-gray-500 mb-2">
                                SKU: {item.sku || item.product.sku}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                  Qty: {item.quantity}
                                </span>
                                <div className="text-right">
                                  <p className="text-sm text-gray-600">
                                    {formatPrice(item.unitPrice)} ×{" "}
                                    {item.quantity}
                                  </p>
                                  <p className="font-semibold text-gray-900">
                                    {formatPrice(item.lineTotal)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div> */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Shipping Address */}
                      {order.shippingAddress && (
                        <div className="">
                          <h4 className="font-semibold text-gray-900 mb-4">
                            Shipping Address
                          </h4>
                          <div className="bg-white p-4 hasib-rounded shadow">
                            <div className="space-y-2">
                              <p className="font-medium text-gray-900">
                                {order.shippingAddress.recipientName}
                              </p>
                              <p className="text-gray-600 flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                                <span>
                                  {order.shippingAddress.address}
                                  <br />
                                  {order.shippingAddress.upazila},{" "}
                                  {order.shippingAddress.district}
                                  <br />
                                  {order.shippingAddress.division} -{" "}
                                  {order.shippingAddress.postalCode}
                                  <br />
                                  {order.shippingAddress.country}
                                </span>
                              </p>
                              <p className="text-gray-600 flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                {order.shippingAddress.phoneNumber}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Order Summary */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">
                          Order Summary
                        </h4>
                        <div className="bg-white p-4 hasib-rounded space-y-2 shadow">
                          <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>{formatPrice(order.totalAmount)}</span>
                          </div>
                          {parseFloat(order.discount) > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Discount</span>
                              <span>-{formatPrice(order.discount)}</span>
                            </div>
                          )}
                          {parseFloat(order.voucher_promo) > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Voucher Promo</span>
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
                          <div className="border-t pt-2 flex justify-between font-bold text-gray-900 text-lg">
                            <span>Total</span>
                            <span className="text-teal-600">
                              {formatPrice(order.grandTotal)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600 pt-2 border-t">
                            <span>Payment Method</span>
                            <span className="font-medium">
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
