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

    // --- LOGIC REMAINS EXACTLY THE SAME ---
    const handleTrackOrder = async (e) => {
        e.preventDefault();
        setError('');
        setOrder(null);

        if (!orderNumber.trim()) {
            setError('Please enter your Order ID');
            return;
        }

        try {
            setLoading(true);
            const result = await apiClient('/api/order');
            let allOrders = [];
            if (result && result.success && result.data) {
                allOrders = result.data;
            } else if (Array.isArray(result)) {
                allOrders = result;
            }
            const foundOrder = allOrders.find(
                order => order.orderNumber.toLowerCase() === orderNumber.trim().toLowerCase()
            );
            if (!foundOrder) {
                setError('Order not found. Please check your Order ID and try again.');
                return;
            }
            setOrder(foundOrder);
        } catch (error) {
            console.error('Error tracking order:', error);
            setError('Failed to track order. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
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
        const currentIndex = statusOrder.indexOf(status);
        return steps.map((step, index) => ({
            ...step,
            completed: index <= currentIndex,
            active: index === currentIndex,
        }));
    };

    const timeline = order ? getOrderTimeline(order.status) : [];
    const completedSteps = timeline.filter(s => s.completed).length;
    const progressPercent = Math.max(((completedSteps - 1) / (timeline.length - 1)) * 100, 0);

    // Monochromatic Status Badges (World-class standard)
    const StatusBadge = ({ status }) => {
        const styles = {
            Pending: 'bg-gray-100 text-gray-700',
            Confirmed: 'bg-gray-100 text-gray-700',
            Processing: 'bg-gray-100 text-gray-700',
            Shipped: 'bg-gray-900 text-white',
            Delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
            Cancelled: 'bg-red-50 text-red-600 border border-red-200',
        };
        return (
            <span className={`text-xs font-semibold tracking-wide px-3 py-1.5 rounded-full ${styles[status] || styles.Pending}`}>
                {status}
            </span>
        );
    };

    return (
        <Container className="my-8 md:my-16">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 mt-6 md:mt-10 mb-12 font-medium">
                <Link href="/" className="hover:text-gray-800 transition-colors flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5" /> Home
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-gray-800">Track Order</span>
            </nav>

            {/* ==================== SEARCH STATE ==================== */}
            {!order && (
                <div className="animate-fadeIn min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                    {/* Minimalist Heading */}
                    <p className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-400 mb-6">Order Status</p>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium text-gray-800 tracking-tight mb-4 leading-tight">
                        Track your order
                    </h1>
                    <p className="text-gray-500 text-base md:text-lg max-w-md mb-12 leading-relaxed font-light">
                        Enter your order number below to get real-time updates on your shipment.
                    </p>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 px-5 py-3.5  max-w-lg w-full text-sm text-left">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Clean Input Group */}
                    <form onSubmit={handleTrackOrder} className="w-full max-w-xl flex flex-col sm:flex-row shadow-sm border border-gray-200 overflow-hidden bg-white focus-within:shadow-md focus-within:border-gray-300 transition-all">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="e.g. ORD-202512-000009"
                                value={orderNumber}
                                onChange={(e) => setOrderNumber(e.target.value)}
                                className="w-full h-14 pl-12 pr-4 bg-transparent text-gray-800 placeholder:text-gray-400 focus:outline-none text-base"
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="h-14 px-8 bg-primary hover:bg-secound text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 text-sm whitespace-nowrap group"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Track <ArrowRight className="w-4 h-4 group-hover:translate-x-3 transition-transform duration-500" /></>}
                        </button>
                    </form>

                    {/* Subtle Footer Text */}
                    <p className="text-gray-400 text-xs mt-5">
                        You can find this in your confirmation email or account dashboard.
                    </p>
                </div>
            )}

            {/* ==================== RESULT STATE ==================== */}
            {order && (
                <div className="max-w-5xl mx-auto animate-fadeIn">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-6 mb-10">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-medium text-gray-800 tracking-tight">Order Details</h2>
                            <div className="flex items-center gap-3 mt-2">
                                <button onClick={() => handleCopy(order.orderNumber)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors cursor-pointer font-mono">
                                    {order.orderNumber}
                                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                                <span className="text-gray-300">•</span>
                                <span className="text-sm text-gray-500 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" /> {formatDate(order.orderDate)}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <StatusBadge status={order.status} />
                            <button
                                onClick={() => { setOrder(null); setOrderNumber(''); setError(''); }}
                                className="text-xs font-medium text-gray-500 hover:text-gray-800 underline underline-offset-2 transition-colors cursor-pointer"
                            >
                                New Search
                            </button>
                        </div>
                    </div>

                    {order.status === 'Cancelled' ? (
                        /* Cancelled State */
                        <div className="border border-red-100 bg-red-50/50 rounded-2xl p-12 text-center">
                            <XCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
                            <h3 className="text-xl font-medium text-gray-800 mb-2">Order Cancelled</h3>
                            <p className="text-gray-500 text-sm max-w-md mx-auto mb-8">This order was cancelled. If this was a mistake, please reach out to our support team.</p>
                            <div className="flex justify-center gap-3">
                                <Link href="/contact" className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                                    Contact Support
                                </Link>
                            </div>
                        </div>
                    ) : (
                        /* Active Order Layout */
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                            {/* Left: Tracking Log */}
                            <div className="lg:col-span-7">
                                {/* Mono Stepper (Desktop) */}
                                <div className="hidden md:block mb-16">
                                    <div className="relative flex items-center justify-between">
                                        {/* Background Line */}
                                        <div className="absolute top-4 left-[8%] right-[8%] h-px bg-gray-200" />
                                        {/* Progress Line */}
                                        <div className="absolute top-4 left-[8%] h-px bg-gray-900 transition-all duration-700 ease-out"
                                            style={{ width: `calc(${progressPercent}% * 0.84)` }}
                                        />

                                        {timeline.map((step, index) => (
                                            <div key={step.key} className="relative z-10 flex flex-col items-center w-[16%]">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                                    ${step.completed
                                                        ? 'bg-gray-900 border-gray-900 text-white'
                                                        : 'bg-white border-gray-200 text-gray-300'}
                                                    ${step.active ? 'ring-[6px] ring-gray-100 scale-110' : ''}
                                                `}>
                                                    {step.completed ? <Check className="w-4 h-4" /> : <span className="text-xs font-medium">{index + 1}</span>}
                                                </div>
                                                <span className={`mt-3 text-[11px] font-medium tracking-wide uppercase ${step.completed ? 'text-gray-800' : 'text-gray-400'}`}>
                                                    {step.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Detailed Vertical Log */}
                                <div>
                                    <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-gray-400 mb-6">Tracking Log</h3>
                                    <div className="space-y-0">
                                        {timeline.map((step, index) => (
                                            <div key={step.key} className="relative flex gap-5">
                                                {/* Line */}
                                                {index < timeline.length - 1 && (
                                                    <div className="absolute left-[11px] top-7 bottom-0 w-px bg-gray-100">
                                                        {step.completed && <div className="w-full bg-gray-300" />}
                                                    </div>
                                                )}

                                                {/* Icon */}
                                                <div className={`relative z-10 w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors
                                                    ${step.completed ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-200 text-gray-300'}
                                                `}>
                                                    {step.completed ? <Check className="w-3 h-3" /> : <span className="text-[9px]">{index + 1}</span>}
                                                </div>

                                                {/* Content */}
                                                <div className={`pb-10 ${index === timeline.length - 1 ? 'pb-0' : ''}`}>
                                                    <div className="flex items-center gap-3">
                                                        <p className={`text-sm font-medium ${step.completed ? 'text-gray-800' : 'text-gray-400'}`}>
                                                            {step.label}
                                                        </p>
                                                        {step.active && (
                                                            <span className="text-[10px] font-bold tracking-wider uppercase bg-gray-900 text-white px-2 py-0.5 rounded">
                                                                Current
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className={`text-sm mt-1 ${step.completed ? 'text-gray-500' : 'text-gray-300'}`}>
                                                        {step.detail}
                                                    </p>
                                                    {step.active && order.status === 'Shipped' && (
                                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                                                <Truck className="w-3.5 h-3.5" /> Estimated Delivery
                                                            </div>
                                                            <p className="text-sm font-medium text-gray-800">In Transit - On Schedule</p>
                                                        </div>
                                                    )}
                                                    {step.active && order.status === 'Delivered' && (
                                                        <div className="mt-4 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100">
                                                            <div className="flex items-center gap-2 text-xs text-emerald-600 mb-1">
                                                                <CheckCheck className="w-3.5 h-3.5" /> Successfully Delivered
                                                            </div>
                                                            <p className="text-sm font-medium text-gray-800">Thank you for your purchase!</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Order Summary Sidebar */}
                            <div className="lg:col-span-5">
                                <div className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100">
                                    <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-gray-400 mb-6">Order Summary</h3>

                                    {/* Shipping Address */}
                                    <div className="flex items-start gap-3 mb-8 pb-8 border-b border-gray-200/50">
                                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-[11px] font-medium tracking-wider uppercase text-gray-400 mb-1">Shipping Address</p>
                                            <p className="text-sm font-medium text-gray-800 leading-snug">
                                                {order.shippingInfo?.address || order.shippingAddress || 'Processing...'}
                                            </p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                {order.shippingInfo?.phone || order.phone ? (
                                                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{order.shippingInfo?.phone || order.phone}</span>
                                                ) : null}
                                                {order.shippingInfo?.email || order.email || order.userEmail ? (
                                                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{order.shippingInfo?.email || order.email || order.userEmail}</span>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items List */}
                                    <div className="mb-8 pb-8 border-b border-gray-200/50">
                                        <p className="text-[11px] font-medium tracking-wider uppercase text-gray-400 mb-4">Items ({order.items?.length || 0})</p>
                                        <div className="space-y-4">
                                            {order.items && order.items.map((item, i) => (
                                                <div key={i} className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-lg bg-white border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                        {item.image ? (
                                                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <ShoppingBag className="w-5 h-5 text-gray-300" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-800 truncate">{item.name || item.productName || 'Item'}</p>
                                                        <p className="text-xs text-gray-400">Qty: {item.quantity || 1}</p>
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-800 tabular-nums">
                                                        ${item.price ? (item.price * (item.quantity || 1)).toFixed(2) : '0.00'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Total */}
                                    {order.totalPrice && (
                                        <div className="flex items-center justify-between mb-8">
                                            <span className="text-sm font-medium text-gray-500">Total</span>
                                            <span className="text-2xl font-medium text-gray-800 tracking-tight">${Number(order.totalPrice).toFixed(2)}</span>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="space-y-3">
                                        <Link
                                            href="/"
                                            className="w-full flex items-center justify-center gap-2 h-12 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Continue Shopping <ArrowRight className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => { setOrder(null); setOrderNumber(''); setError(''); }}
                                            className="w-full flex items-center justify-center gap-2 h-12 text-gray-500 text-sm font-medium hover:text-gray-800 transition-colors cursor-pointer"
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