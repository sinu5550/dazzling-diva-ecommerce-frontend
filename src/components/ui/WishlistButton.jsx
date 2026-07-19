// components/WishlistButton.js - Updated for variant support
'use client';

import { Heart } from "lucide-react";
import { useState, useCallback } from "react";
import { useWishlist } from "@/hooks/useWishlist";


const WishlistButton = ({
    product,
    user = null,
    className = "",
    size = 20,
    showTooltip = false,
    variant = "default",
    showLabel = false
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        addToWishlist,
        removeFromWishlist,
        isInWishlist
    } = useWishlist(user);

    // Check if product is a variant product
    const isVariantProduct = product.productType === 'variant' || product.variantId;
    const inWishlist = isInWishlist(product.id, product.variantId);

    const handleToggle = useCallback(async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) return;

        setIsLoading(true);

        try {
            if (inWishlist) {
                await removeFromWishlist(product.id, product.variantId);
            } else {
                // Format product for wishlist - include variant info
                const wishlistProduct = {
                    id: product.id,
                    slug: product.slug,
                    sku: isVariantProduct ? (product.variantSku || product.sku) : product.sku,
                    productName: product.productName,
                    price: parseFloat(product.price) || 0,
                    discountPrice: parseFloat(product.discountPrice) || parseFloat(product.price) || 0,
                    quantity: product.quantity || 0,
                    images: product.images || [],
                    status: product.status,
                    subCategoryId: product.subCategoryId,
                    tax: product.tax,
                    taxType: product.taxType,
                    discountValue: product.discountValue,
                    discountType: product.discountType,
                    createdAt: product.createdAt,
                    // Include variant info if applicable
                    ...(isVariantProduct && {
                        variantId: product.variantId,
                        variantAttributes: product.variantAttributes,
                        variantSku: product.variantSku || product.sku,
                        productType: 'variant'
                    })
                };
                await addToWishlist(wishlistProduct);
            }
        } finally {
            setIsLoading(false);
        }
    }, [inWishlist, isLoading, product, addToWishlist, removeFromWishlist, isVariantProduct]);

    // Variant styles
    const variants = {
        default: {
            base: "p-2 rounded-full transition-all duration-200",
            active: "bg-red-100 text-red-600 hover:bg-red-200",
            inactive: "bg-gray-100 text-gray-600 hover:bg-gray-200"
        },
        minimal: {
            base: "p-1.5  transition-all duration-200",
            active: "text-red-600 hover:bg-red-50",
            inactive: "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
        },
        outline: {
            base: "p-2 rounded-full border-2 transition-all duration-200",
            active: "border-red-500 text-red-600 bg-red-50 hover:bg-red-100",
            inactive: "border-stone-300 text-gray-600 hover:border-gray-400"
        },
        ghost: {
            base: "p-2  transition-all duration-200",
            active: "text-red-600 hover:bg-red-50",
            inactive: "text-gray-500 hover:bg-gray-100"
        },
        withLabel: {
            base: "flex items-center gap-2 px-4 py-2 diva-rounded transition-all duration-200",
            active: "text-rose-600 hover:bg-rose-50 border border-rose-200",
            inactive: "text-gray-700 hover:text-rose-600 hover:bg-gray-50 border border-gray-100"
        }
    };

    const currentVariant = showLabel ? variants.withLabel : (variants[variant] || variants.default);

    // Combine class names properly
    const buttonClasses = [
        currentVariant.base,
        inWishlist ? currentVariant.active : currentVariant.inactive,
        isLoading && "opacity-50 cursor-not-allowed",
        className
    ].filter(Boolean).join(" ");

    const ariaLabel = inWishlist
        ? `Remove ${product.productName} from wishlist`
        : `Add ${product.productName} to wishlist`;

    const tooltipText = inWishlist ? "Remove from wishlist" : "Add to wishlist";

    // Show variant badge in tooltip if it's a variant
    const variantInfo = isVariantProduct && product.variantAttributes
        ? ` (${Object.values(product.variantAttributes).join(', ')})`
        : '';

    return (
        <div className="relative inline-block">
            <button
                onClick={handleToggle}
                disabled={isLoading}
                className={buttonClasses}
                aria-label={ariaLabel}
                title={showTooltip ? `${tooltipText}${variantInfo}` : undefined}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Heart
                    size={size}
                    fill={inWishlist ? "currentColor" : "none"}
                    className={[
                        "transition-transform duration-200",
                        isLoading && "animate-pulse",
                        isHovered && !isLoading && "scale-110",
                        showLabel && "flex-shrink-0"
                    ].filter(Boolean).join(" ")}
                    strokeWidth={2}
                />

                {/* Optional text label */}
                {showLabel && (
                    <span className="text-sm font-medium whitespace-nowrap">
                        {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                    </span>
                )}
            </button>

            {/* Tooltip (only show if not using label) */}
            {showTooltip && !showLabel && isHovered && !isLoading && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs  whitespace-nowrap z-50 pointer-events-none">
                    {tooltipText}
                    {isVariantProduct && product.variantAttributes && (
                        <div className="text-xs text-gray-300 mt-1">
                            {Object.entries(product.variantAttributes).map(([key, value]) => (
                                <div key={key}>{key}: {value}</div>
                            ))}
                        </div>
                    )}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-900"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WishlistButton;
