// components/WishlistClient.js - FIXED handleDelete function
'use client';

import Image from "next/image";
import Link from "next/link";
import { Trash2, Heart, AlertCircle, Package } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";
import LoadingSpinner from "../ui/LoadingSpinner";
import { useWishlist } from "@/hooks/useWishlist";
import WishlistCartButton from "./WishlistCartButton";
import Swal from "sweetalert2";
import { FaShoppingBag } from "react-icons/fa";

const EmptyWishlist = () => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="relative">
            <Heart size={80} className="text-gray-300 mb-4" />
            <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-2">
                <Package size={20} className="text-white" />
            </div>
        </div>
        <h2 className="text-xl md:text-3xl font-semibold text-gray-700 mb-2 text-center font-philosopher">
            Your Wishlist is Empty
        </h2>
        <p className="text-gray-500 mb-6 text-center max-w-lg">
            Save your favorite items here and never lose track of what you love
        </p>
        <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-secound  text-white rounded font-bold hover:secound-hover transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
        >
            <FaShoppingBag />
            Start Shopping
        </Link>
    </div>
);

const StockBadge = ({ quantity, status }) => {
    const qty = Number(quantity) || 0;
    const isAvailable = qty > 0 && status === true;

    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1 ${isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}>
            {!isAvailable && <AlertCircle size={12} />}
            {isAvailable ? `In Stock (${qty})` : 'Out of Stock'}
        </span>
    );
};

const VariantBadge = ({ variantAttributes }) => {
    if (!variantAttributes || Object.keys(variantAttributes).length === 0) {
        return null;
    }

    return (
        <div className="mt-2 space-y-1">
            {Object.entries(variantAttributes).map(([key, value]) => (
                <span
                    key={key}
                    className="inline-block text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded mr-2 mb-1"
                >
                    {key}: {value}
                </span>
            ))}
        </div>
    );
};

const WishlistClient = ({ user = null }) => {

    const { wishlist, loading, removeFromWishlist, clearWishlist } = useWishlist(user);
    const [actionLoading, setActionLoading] = useState({});

    // FIXED: Properly handle variant product removal
    const handleDelete = async (productId, variantId = null) => {
        // Create a unique loading key that includes variantId if it exists
        const loadingKey = variantId ? `delete-${productId}-${variantId}` : `delete-${productId}`;
        setActionLoading(prev => ({ ...prev, [loadingKey]: true }));

        try {
            // Call removeFromWishlist with both productId and variantId
            await removeFromWishlist(productId, variantId);
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            toast.error('Failed to remove from wishlist');
        } finally {
            setActionLoading(prev => ({ ...prev, [loadingKey]: false }));
        }
    };

    const handleClearAll = async () => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This will permanently clear your entire wishlist!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, clear it!"
        });

        if (!result.isConfirmed) return;

        setActionLoading(prev => ({ ...prev, clearAll: true }));

        try {
            await clearWishlist();
            await Swal.fire({
                title: "Cleared!",
                text: "Your wishlist has been cleared.",
                icon: "success"
            });
            toast.success('Wishlist cleared');
        } catch (error) {
            console.error('Error clearing wishlist:', error)
            toast.error('Failed to clear wishlist');
        } finally {
            setActionLoading(prev => ({ ...prev, clearAll: false }));
        }
    };

    const formatPrice = (price) => {
        if (!price) return "৳0";
        return `৳${Number(price).toLocaleString("en-BD")}`;
    };

    const calculateDiscountPercentage = (originalPrice, discountPrice) => {
        if (!originalPrice || !discountPrice || originalPrice === discountPrice) {
            return null;
        }
        const discount = Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
        return discount > 0 ? discount : null;
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    if (wishlist.length === 0) {
        return <EmptyWishlist />;
    }

    return (
        <div className="min-h-screen py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 font-philosopher">
                            My Wishlist
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
                        </p>
                    </div>

                    {wishlist.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            disabled={actionLoading.clearAll}
                            className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50 transition-colors flex items-center gap-2"
                        >
                            <Trash2 size={18} />
                            {actionLoading.clearAll ? "Clearing..." : "Clear All"}
                        </button>
                    )}
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block bg-white hasib-rounded shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-amber-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                                    Product
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                                    Stock Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                            {wishlist.map((product) => {
                                const discountPercentage = calculateDiscountPercentage(product.price, product.discountPrice);
                                const isVariantProduct = product.productType === 'variant' || product.variantId;
                                // FIXED: Use proper loading key that includes variantId
                                const loadingKey = isVariantProduct ? `delete-${product.id}-${product.variantId}` : `delete-${product.id}`;
                                const isDeleteLoading = actionLoading[loadingKey];

                                // Format product for WishlistCartButton
                                const cartProduct = {
                                    id: product.id,
                                    variantId: product.variantId,
                                    slug: product.slug,
                                    productName: product.productName,
                                    price: product.price,
                                    discountPrice: product.discountPrice,
                                    images: product.images,
                                    quantity: product.quantity,
                                    status: product.status,
                                    sku: product.sku,
                                    tax: product.tax,
                                    taxType: product.taxType,
                                    discountValue: product.discountValue,
                                    discountType: product.discountType,
                                    ...(isVariantProduct && {
                                        variantId: product.variantId,
                                        variantAttributes: product.variantAttributes,
                                        productType: 'variant',
                                        variantSku: product.variantSku
                                    })
                                };

                                return (
                                    <tr key={product.wishlistId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <Link
                                                    href={`/product/${product.slug}`}
                                                    className="relative flex-shrink-0"
                                                >
                                                    <Image
                                                        src={product.images[0] || '/placeholder.png'}
                                                        alt={product.productName}
                                                        width={80}
                                                        height={80}
                                                        className="hasib-rounded object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                                        onError={(e) => {
                                                            e.target.src = '/placeholder.png';
                                                        }}
                                                    />
                                                    {discountPercentage && (
                                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                            -{discountPercentage}%
                                                        </span>
                                                    )}
                                                </Link>
                                                <div className="flex-1 min-w-0">
                                                    <Link
                                                        href={`/product/${product.slug}`}
                                                        className="font-medium text-gray-900 hover:text-secound transition-colors line-clamp-2"
                                                    >
                                                        {product.productName}
                                                    </Link>

                                                    {/* Variant Attributes */}
                                                    {product.variantAttributes && (
                                                        <VariantBadge variantAttributes={product.variantAttributes} />
                                                    )}

                                                    {product.sku && (
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            SKU: <span className="font-mono">{product.variantSku || product.sku}</span>
                                                            {product.variantSku && product.variantSku !== product.sku && (
                                                                <span className="text-xs text-blue-600 ml-2">(Variant)</span>
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-900 text-lg">
                                                    {formatPrice(product.discountPrice)}
                                                </span>
                                                {product.discountValue && product.price !== product.discountPrice && (
                                                    <span className="text-sm text-gray-500 line-through">
                                                        {formatPrice(product.price)}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <StockBadge
                                                quantity={product.quantity}
                                                status={product.status}
                                            />
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {/* WishlistCartButton Component */}
                                                <WishlistCartButton
                                                    product={cartProduct}
                                                    user={user}
                                                    onMoveComplete={(productId, variantId) => {
                                                        // This will trigger when move is complete
                                                        console.log('Product moved to cart:', productId, variantId);
                                                    }}
                                                />
                                                <button
                                                    onClick={() => handleDelete(product.id, product.variantId)}
                                                    disabled={isDeleteLoading}
                                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 hasib-rounded transition-colors disabled:opacity-50"
                                                    aria-label="Remove from wishlist"
                                                >
                                                    {isDeleteLoading ? (
                                                        <LoadingSpinner size="small" />
                                                    ) : (
                                                        <Trash2 size={20} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4">
                    {wishlist.map((product) => {
                        const discountPercentage = calculateDiscountPercentage(product.price, product.discountPrice);
                        const isVariantProduct = product.productType === 'variant' || product.variantId;
                        // FIXED: Use proper loading key that includes variantId
                        const loadingKey = isVariantProduct ? `delete-${product.id}-${product.variantId}` : `delete-${product.id}`;
                        const isDeleteLoading = actionLoading[loadingKey];

                        // Format product for WishlistCartButton
                        const cartProduct = {
                            id: product.id,
                            variantId: product.variantId,
                            slug: product.slug,
                            productName: product.productName,
                            price: product.price,
                            discountPrice: product.discountPrice,
                            images: product.images,
                            quantity: product.quantity,
                            status: product.status,
                            sku: product.sku,
                            tax: product.tax,
                            taxType: product.taxType,
                            discountValue: product.discountValue,
                            discountType: product.discountType,
                            ...(isVariantProduct && {
                                variantId: product.variantId,
                                variantAttributes: product.variantAttributes,
                                productType: 'variant',
                                variantSku: product.variantSku
                            })
                        };

                        return (
                            <div key={product.wishlistId} className="bg-white p-4 hasib-rounded shadow-md">
                                <div className="flex gap-4 mb-4">
                                    <Link
                                        href={`/product/${product.slug}`}
                                        className="relative flex-shrink-0"
                                    >
                                        <Image
                                            src={product.images[0] || '/placeholder.png'}
                                            alt={product.productName}
                                            width={100}
                                            height={100}
                                            className="hasib-rounded object-cover"
                                            onError={(e) => {
                                                e.target.src = '/placeholder.png';
                                            }}
                                        />
                                        {discountPercentage && (
                                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                -{discountPercentage}%
                                            </span>
                                        )}
                                    </Link>

                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/product/${product.slug}`}
                                            className="font-semibold text-gray-900 hover:text-secound block line-clamp-2"
                                        >
                                            {product.productName}
                                        </Link>

                                        {/* Variant Attributes for Mobile */}
                                        {product.variantAttributes && (
                                            <VariantBadge variantAttributes={product.variantAttributes} />
                                        )}

                                        {product.sku && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                SKU: <span className="font-mono">{product.variantSku || product.sku}</span>
                                                {product.variantSku && product.variantSku !== product.sku && (
                                                    <span className="text-xs text-blue-600 ml-2">(Variant)</span>
                                                )}
                                            </p>
                                        )}

                                        <div className="mt-2">
                                            <span className="font-bold text-lg">
                                                {formatPrice(product.discountPrice)}
                                            </span>
                                            {product.discountValue && product.price !== product.discountPrice && (
                                                <span className="text-sm text-gray-500 line-through ml-2">
                                                    {formatPrice(product.price)}
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-2">
                                            <StockBadge
                                                quantity={product.quantity}
                                                status={product.status}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {/* WishlistCartButton Component for Mobile */}
                                    <WishlistCartButton
                                        product={cartProduct}
                                        user={user}
                                        onMoveComplete={(productId, variantId) => {
                                            console.log('Product moved to cart:', productId, variantId);
                                        }}
                                    />

                                    <button
                                        onClick={() => handleDelete(product.id, product.variantId)}
                                        disabled={isDeleteLoading}
                                        className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 hasib-rounded transition-colors border border-gray-200 disabled:opacity-50"
                                        aria-label="Remove from wishlist"
                                    >
                                        {isDeleteLoading ? (
                                            <LoadingSpinner size="small" />
                                        ) : (
                                            <Trash2 size={20} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default WishlistClient;