'use client'

import Container from "@/components/Container/Container";
import Link from "next/link";
import { useState } from "react";
import { apiClient } from "@/lib/apiClient";
import {
    Package,
    Truck,
    CheckCircle,
    XCircle,
    Calendar,
    Search,
    AlertCircle,
    ShoppingBag,
    MapPin,
    ChevronRight,
    ArrowRight,
    Loader2,
    Box,
    ClipboardList,
    Phone,
    Mail,
    Copy,
    Check,
    Home,
    CheckCheck
} from "lucide-react";

const TrackOrder = () => {
    const [orderNumber, setOrderNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [order, setOrder] = useState(null);
    const [copied, setCopied] = useState(false);

    const formatPrice = (price) => {
        if (!price && price !== 0) return '৳0';
        return `৳${Number(price).toLocaleString('en-BD')}`;
    };

    const handleTrackOrder = async (e) => {
        e.preventDefault();
        setError('');
        setOrder(null);

        const cleanInput = orderNumber.trim().replace(/^#/, '');

        if (!cleanInput) {
            setError('Please enter your Order ID');
            return;
        }

        try {
            setLoading(true);
            let foundOrder = null;

            // Strategy 1: Try track endpoint by order number
            try {
                const trackRes = await apiClient(`/api/order/track/${encodeURIComponent(cleanInput)}`);
                if (trackRes && (trackRes.data || trackRes.order || trackRes.orderNumber)) {
                    foundOrder = trackRes.data || trackRes.order || trackRes;
                }
            } catch (err) {
                console.log("[TrackOrder] Direct track endpoint failed, trying fallback list endpoints...");
            }

            // Strategy 2: Try order search endpoint by query
            if (!foundOrder) {
                try {
                    const queryRes = await apiClient(`/api/order?orderNumber=${encodeURIComponent(cleanInput)}`);
                    let list = [];
                    if (Array.isArray(queryRes)) list = queryRes;
                    else if (Array.isArray(queryRes?.data)) list = queryRes.data;
                    else if (Array.isArray(queryRes?.data?.items)) list = queryRes.data.items;
                    else if (Array.isArray(queryRes?.data?.orders)) list = queryRes.data.orders;
                    else if (queryRes?.data && typeof queryRes.data === 'object' && queryRes.data.orderNumber) {
                        foundOrder = queryRes.data;
                    }

                    if (!foundOrder && list.length > 0) {
                        foundOrder = list.find(
                            o => o.orderNumber?.toLowerCase() === cleanInput.toLowerCase() ||
                                 o.id?.toString() === cleanInput ||
                                 o.orderNumber?.toLowerCase() === `ord-${cleanInput.toLowerCase()}`
                        );
                    }
                } catch (err) {
                    console.log("[TrackOrder] Query endpoint failed, trying full list...");
                }
            }

            // Strategy 3: Try general /api/order list
            if (!foundOrder) {
                try {
                    const listRes = await apiClient('/api/order');
                    let allOrders = [];
                    if (Array.isArray(listRes)) {
                        allOrders = listRes;
                    } else if (listRes?.data) {
                        if (Array.isArray(listRes.data)) {
                            allOrders = listRes.data;
                        } else if (Array.isArray(listRes.data.items)) {
                            allOrders = listRes.data.items;
                        } else if (Array.isArray(listRes.data.orders)) {
                            allOrders = listRes.data.orders;
                        } else if (typeof listRes.data === 'object' && listRes.data.orderNumber) {
                            foundOrder = listRes.data;
                        }
                    }

                    if (!foundOrder && allOrders.length > 0) {
                        foundOrder = allOrders.find(
                            o => o.orderNumber?.toLowerCase() === cleanInput.toLowerCase() ||
                                 o.orderNumber?.toLowerCase() === `ord-${cleanInput.toLowerCase()}` ||
                                 o.id?.toString() === cleanInput
                        );
                    }
                } catch (err) {
                    console.log("[TrackOrder] General order list failed...");
                }
            }

            // Strategy 4: Try last_order from localStorage
            if (!foundOrder && typeof window !== 'undefined') {
                try {
                    const lastOrderStr = localStorage.getItem('last_order') || sessionStorage.getItem('last_order');
                    if (lastOrderStr) {
                        const lastOrder = JSON.parse(lastOrderStr);
                        if (lastOrder && (
                            lastOrder.orderNumber?.toLowerCase() === cleanInput.toLowerCase() ||
                            lastOrder.id?.toString() === cleanInput
                        )) {
                            foundOrder = lastOrder;
                        }
                    }
                } catch (e) {}
            }

            if (!foundOrder) {
                setError('Order not found. Please check your Order ID (e.g., ORD-202607-000007) and try again.');
                return;
            }

            setOrder(foundOrder);
        } catch (error) {
            console.error('Error tracking order:', error);
            setError('Failed to track order. Please check your Order ID and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Recent';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    const getAddressString = (addr) => {
        if (!addr) return 'Processing...';
        if (typeof addr === 'string') return addr;
        if (typeof addr === 'object') {
            const parts = [
                addr.recipientName,
                addr.address,
                addr.upazila,
                addr.district,
                addr.division,
                addr.postalCode
            ].filter(Boolean);
            return parts.length > 0 ? parts.join(', ') : 'Processing...';
        }
        return 'Processing...';
    };

    const getOrderTimeline = (status) => {
        const steps = [
            { key: 'Pending', label: 'Order Placed', detail: 'Your order has been placed successfully' },
            { key: 'Confirmed', label: 'Confirmed', detail: 'Payment has been verified and confirmed' },
            { key: 'Processing', label: 'Processing', detail: 'Your items are being prepared for dispatch' },
            { key: 'Shipped', label: 'Shipped', detail: 'Your package is in transit' },
            { key: 'Delivered', label: 'Delivered', detail: 'Package has been delivered to your address' },
        ];
        const statusOrder = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
        const currentIndex = statusOrder.indexOf(status) >= 0 ? statusOrder.indexOf(status) : 0;
        return steps.map((step, index) => ({
            ...step,
            completed: index <= currentIndex,
            active: index === currentIndex,
        }));
    };

    const timeline = order ? getOrderTimeline(order.status) : [];
    const completedSteps = timeline.filter(s => s.completed).length;
    const progressPercent = Math.max(((completedSteps - 1) / (timeline.length - 1)) * 100, 0);

    const StatusBadge = ({ status }) => {
        const styles = {
            Pending: 'bg-amber-50 text-amber-800 border border-amber-200',
            Confirmed: 'bg-blue-50 text-blue-800 border border-blue-200',
            Processing: 'bg-purple-50 text-purple-800 border border-purple-200',
            Shipped: 'bg-[#5A0C3D] text-white',
            Delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
            Cancelled: 'bg-red-50 text-red-600 border border-red-200',
        };
        return (
            <span className={`text-xs font-semibold tracking-wide px-3 py-1.5 rounded-full ${styles[status] || styles.Pending}`}>
                {status || 'Pending'}
            </span>
        );
    };

    const itemsList = order?.orderItems || order?.items || [];
    const orderTotal = order?.grandTotal || order?.totalAmount || order?.totalPrice || 0;

    return (
        <Container className="py-2 md:py-3 font-outfit">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 mt-1 mb-4 font-medium">
                <Link href="/" className="hover:text-gray-800 transition-colors flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5" /> Home
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-gray-800">Track Order</span>
            </nav>

            {/* ==================== SEARCH STATE ==================== */}
            {!order && (
                <div className="animate-fadeIn min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
                    <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#5A0C3D] mb-3">Order Status</p>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-3 leading-tight">
                        Track your order
                    </h1>
                    <p className="text-gray-500 text-sm md:text-base max-w-md mb-8 leading-relaxed font-light">
                        Enter your order number below to get real-time updates on your shipment.
                    </p>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl max-w-lg w-full text-xs sm:text-sm text-left shadow-xs">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Input Form */}
                    <form onSubmit={handleTrackOrder} className="w-full max-w-xl flex flex-col sm:flex-row shadow-sm border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:shadow-md focus-within:border-[#5A0C3D] transition-all">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="e.g. ORD-202607-000007"
                                value={orderNumber}
                                onChange={(e) => setOrderNumber(e.target.value)}
                                className="w-full h-12 sm:h-14 pl-11 pr-4 bg-transparent text-gray-800 placeholder:text-gray-400 focus:outline-none text-sm sm:text-base"
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="h-12 sm:h-14 px-7 bg-[#5A0C3D] hover:bg-[#450322] text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm uppercase tracking-wider whitespace-nowrap group"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Track Order <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
                        </button>
                    </form>

                    <p className="text-gray-400 text-xs mt-4">
                        You can find your order ID in your confirmation email or order history.
                    </p>
                </div>
            )}

            {/* ==================== RESULT STATE ==================== */}
            {order && (
                <div className="max-w-5xl mx-auto animate-fadeIn">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-6 mb-8">
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Order Details</h2>
                            <div className="flex items-center gap-3 mt-1.5">
                                <button onClick={() => handleCopy(order.orderNumber)} className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 hover:text-[#5A0C3D] transition-colors cursor-pointer font-mono font-medium">
                                    {order.orderNumber}
                                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                                </button>
                                <span className="text-gray-300">•</span>
                                <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-gray-400" /> {formatDate(order.orderDate || order.createdAt)}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <StatusBadge status={order.status} />
                            <button
                                onClick={() => { setOrder(null); setOrderNumber(''); setError(''); }}
                                className="text-xs font-bold text-[#5A0C3D] hover:underline transition-colors cursor-pointer"
                            >
                                New Search
                            </button>
                        </div>
                    </div>

                    {order.status === 'Cancelled' ? (
                        /* Cancelled State */
                        <div className="border border-red-100 bg-red-50/50 rounded-2xl p-8 sm:p-12 text-center">
                            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Order Cancelled</h3>
                            <p className="text-gray-600 text-sm max-w-md mx-auto mb-6">This order was cancelled. If you need assistance, please contact customer support.</p>
                            <div className="flex justify-center gap-3">
                                <Link href="/find-store" className="px-5 py-2.5 bg-[#5A0C3D] text-white text-xs font-bold uppercase rounded-lg hover:bg-[#450322] transition-colors">
                                    Contact Support
                                </Link>
                            </div>
                        </div>
                    ) : (
                        /* Active Order Layout */
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                            {/* Left: Tracking Log */}
                            <div className="lg:col-span-7">
                                {/* Desktop Stepper */}
                                <div className="hidden md:block mb-12">
                                    <div className="relative flex items-center justify-between">
                                        <div className="absolute top-4 left-[8%] right-[8%] h-0.5 bg-gray-200" />
                                        <div className="absolute top-4 left-[8%] h-0.5 bg-[#5A0C3D] transition-all duration-700 ease-out"
                                            style={{ width: `calc(${progressPercent}% * 0.84)` }}
                                        />

                                        {timeline.map((step, index) => (
                                            <div key={step.key} className="relative z-10 flex flex-col items-center w-[18%]">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                                    ${step.completed
                                                        ? 'bg-[#5A0C3D] border-[#5A0C3D] text-white'
                                                        : 'bg-white border-gray-300 text-gray-300'}
                                                    ${step.active ? 'ring-4 ring-[#5A0C3D]/20 scale-105' : ''}
                                                `}>
                                                    {step.completed ? <Check className="w-4 h-4" /> : <span className="text-xs font-medium">{index + 1}</span>}
                                                </div>
                                                <span className={`mt-2 text-[10px] font-bold tracking-wider uppercase ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                                                    {step.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Vertical Log */}
                                <div>
                                    <h3 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">Tracking Log</h3>
                                    <div className="space-y-0">
                                        {timeline.map((step, index) => (
                                            <div key={step.key} className="relative flex gap-4">
                                                {index < timeline.length - 1 && (
                                                    <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gray-200">
                                                        {step.completed && <div className="w-full h-full bg-[#5A0C3D]" />}
                                                    </div>
                                                )}

                                                <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors
                                                    ${step.completed ? 'bg-[#5A0C3D] border-[#5A0C3D] text-white' : 'bg-white border-gray-300 text-gray-300'}
                                                `}>
                                                    {step.completed ? <Check className="w-3.5 h-3.5" /> : <span className="text-[9px]">{index + 1}</span>}
                                                </div>

                                                <div className={`pb-8 ${index === timeline.length - 1 ? 'pb-0' : ''}`}>
                                                    <div className="flex items-center gap-2">
                                                        <p className={`text-xs sm:text-sm font-semibold ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                                                            {step.label}
                                                        </p>
                                                        {step.active && (
                                                            <span className="text-[9px] font-bold tracking-wider uppercase bg-[#5A0C3D] text-white px-2 py-0.5 rounded">
                                                                Current Status
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className={`text-xs mt-1 ${step.completed ? 'text-gray-600 font-light' : 'text-gray-300'}`}>
                                                        {step.detail}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Summary Sidebar */}
                            <div className="lg:col-span-5">
                                <div className="bg-gray-50 rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-2xs">
                                    <h3 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4 border-b border-gray-200 pb-3">Order Summary</h3>

                                    {/* Shipping Address */}
                                    <div className="flex items-start gap-3 mb-6 pb-6 border-b border-gray-200">
                                        <MapPin className="w-4 h-4 text-[#5A0C3D] mt-0.5 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">Shipping Address</p>
                                            <p className="text-xs sm:text-sm font-medium text-gray-800 leading-snug">
                                                {getAddressString(order.shippingInfo || order.shippingAddress)}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                                                {(order.shippingInfo?.phone || order.phone || order.shippingAddress?.phone) && (
                                                    <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-gray-400" />{order.shippingInfo?.phone || order.phone || order.shippingAddress?.phone}</span>
                                                )}
                                                {(order.shippingInfo?.email || order.email || order.userEmail) && (
                                                    <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-gray-400" />{order.shippingInfo?.email || order.email || order.userEmail}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items List */}
                                    <div className="mb-6 pb-6 border-b border-gray-200">
                                        <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-3">Items ({itemsList.length})</p>
                                        <div className="space-y-3">
                                            {itemsList.map((item, i) => (
                                                <div key={item.id || i} className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                        {(item.product?.images?.[0] || item.image || item.images?.[0]) ? (
                                                            <img src={item.product?.images?.[0] || item.image || item.images?.[0]} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <ShoppingBag className="w-4 h-4 text-gray-300" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold text-gray-800 truncate">{item.product?.productName || item.productName || item.name || 'Product'}</p>
                                                        <p className="text-[11px] text-gray-400">Qty: {item.quantity || 1}</p>
                                                    </div>
                                                    <p className="text-xs font-bold text-gray-900 tabular-nums">
                                                        {formatPrice((item.unitPrice || item.price || 0) * (item.quantity || 1))}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Total */}
                                    {orderTotal > 0 && (
                                        <div className="flex items-center justify-between mb-6">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Grand Total</span>
                                            <span className="text-xl font-bold text-[#5A0C3D]">{formatPrice(orderTotal)}</span>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="space-y-2.5">
                                        <Link
                                            href="/"
                                            className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-gray-800 text-xs font-bold rounded-xl hover:bg-gray-100 transition-colors uppercase tracking-wider"
                                        >
                                            Continue Shopping <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                        <button
                                            onClick={() => { setOrder(null); setOrderNumber(''); setError(''); }}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 text-gray-500 text-xs font-semibold hover:text-[#5A0C3D] transition-colors cursor-pointer"
                                        >
                                            Track Another Order
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Animations */}
            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out forwards;
                }
            `}</style>
        </Container>
    );
};

export default TrackOrder;
