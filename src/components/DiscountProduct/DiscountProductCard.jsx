// components/DiscountProduct/DiscountProductCard.jsx - FIXED price range display
'use client'

import { useState, useEffect, useMemo } from 'react';
import Image from "next/image";
import Link from "next/link";
import { FaHeart, FaRegHeart, FaBangladeshiTakaSign } from "react-icons/fa6";
import { PiEyeLight, PiShareFatLight } from "react-icons/pi";
import { ShoppingCart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { toast } from "react-hot-toast";
import {
    extractVariantOptions,
    getDefaultVariant,
    calculateVariantPrice,
    getVariantImage,
    formatPrice
} from '@/lib/variantHelpers';
import ProductImage from '../ui/ProductImage';

const DiscountProductCard = ({
    product,
    user,
    onMouseEnter,
    onMouseLeave,
    isWishlistLoading,
    isCartLoading,
    onWishlistToggle,
    onCartToggle
}) => {
    const [selectedVariant, setSelectedVariant] = useState(null);
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist(user);
    const { addToCart, isInCart } = useCart(user);

    // Determine if product is variant type
    const isVariantProduct = product.productType === 'variant';

    // Initialize with default variant for variant products
    useEffect(() => {
        if (isVariantProduct) {
            const defaultVariant = getDefaultVariant(product);
            setSelectedVariant(defaultVariant);
        }
    }, [product, isVariantProduct]);

    // Get display image - prioritize variant image
    const getDisplayImage = () => {
        if (isVariantProduct && selectedVariant?.image) {
            return selectedVariant.image;
        }
        return product.images?.[0] || 'https://res.cloudinary.com/dh34eqbhu/image/upload/v1747211252/ju2uf9y33y1bncwufrl7.png';
    };

    // Get images array for cart/wishlist - include variant image
    const getImagesArray = () => {
        const images = [...(product.images || [])];

        // If variant has image, add it to the beginning
        if (isVariantProduct && selectedVariant?.image) {
            // Remove duplicate if variant image already exists in array
            const filteredImages = images.filter(img => img !== selectedVariant.image);
            return [selectedVariant.image, ...filteredImages];
        }

        return images;
    };

    const displayImage = getDisplayImage();
    const imagesArray = getImagesArray();

    // Calculate campaign discount price for a given price
    const calculateCampaignPrice = (basePrice) => {
        if (!product.campaignInfo || !basePrice) {
            return {
                originalPrice: basePrice || 0,
                discountedPrice: basePrice || 0,
                discountAmount: 0
            };
        }

        const discountValue = parseFloat(product.campaignInfo.discountValue) || 0;
        const maxDiscount = product.campaignInfo.maxDiscountAmount
            ? parseFloat(product.campaignInfo.maxDiscountAmount)
            : null;

        let discountAmount = 0;

        if (product.campaignInfo.discountType === 'Fixed') {
            discountAmount = Math.min(discountValue, basePrice);
        } else {
            // Percentage discount
            discountAmount = (basePrice * discountValue) / 100;
            if (maxDiscount && discountAmount > maxDiscount) {
                discountAmount = maxDiscount;
            }
        }

        const discountedPrice = Math.max(0, basePrice - discountAmount);

        return {
            originalPrice: basePrice,
            discountedPrice: Math.round(discountedPrice * 100) / 100,
            discountAmount: Math.round(discountAmount * 100) / 100
        };
    };

    // Get base price for the product (variant or regular)
    const getBasePrice = () => {
        if (isVariantProduct && selectedVariant) {
            return parseFloat(selectedVariant.price) || 0;
        }
        return parseFloat(product.price) || 0;
    };

    // Calculate variant price range with campaign discount
    const getVariantPriceRange = useMemo(() => {
        if (!isVariantProduct || !product.productVariants?.length) {
            return null;
        }

        const variants = product.productVariants;

        // Calculate discounted prices for all variants
        const variantPrices = variants.map(variant => {
            const basePrice = parseFloat(variant.price) || 0;
            const { discountedPrice } = calculateCampaignPrice(basePrice);
            return discountedPrice;
        });

        const minPrice = Math.min(...variantPrices);
        const maxPrice = Math.max(...variantPrices);

        return {
            variantCount: variants.length,
            minPrice,
            maxPrice,
            priceRange: minPrice === maxPrice
                ? `BDT ${formatPrice(minPrice)}`
                : `BDT ${formatPrice(minPrice)} - BDT ${formatPrice(maxPrice)}`,
            // Also get the selected variant's price for comparison
            selectedVariantPrice: selectedVariant ? calculateCampaignPrice(parseFloat(selectedVariant.price) || 0).discountedPrice : minPrice
        };
    }, [isVariantProduct, product.productVariants, selectedVariant, formatPrice]);

    // Calculate ORIGINAL variant price range (before discount)
    const getOriginalVariantPriceRange = useMemo(() => {
        if (!isVariantProduct || !product.productVariants?.length) {
            return null;
        }

        const variants = product.productVariants;
        const originalPrices = variants.map(variant => parseFloat(variant.price) || 0);
        const minOriginalPrice = Math.min(...originalPrices);
        const maxOriginalPrice = Math.max(...originalPrices);

        return {
            minOriginalPrice,
            maxOriginalPrice,
            originalPriceRange: minOriginalPrice === maxOriginalPrice
                ? `BDT ${formatPrice(minOriginalPrice)}`
                : `BDT ${formatPrice(minOriginalPrice)} - BDT ${formatPrice(maxOriginalPrice)}`
        };
    }, [isVariantProduct, product.productVariants, formatPrice]);

    // Get prices for selected variant or regular product
    const getCurrentPrices = () => {
        const basePrice = getBasePrice();
        return calculateCampaignPrice(basePrice);
    };

    const { originalPrice, discountedPrice, discountAmount } = getCurrentPrices();
    const discountValue = product.campaignInfo?.discountValue || 0;
    const isWishlisted = isInWishlist(product.id, isVariantProduct ? selectedVariant?.id : null);
    const inCart = isInCart(product.id, isVariantProduct ? selectedVariant?.id : null);

    // Check availability
    const availableQuantity = isVariantProduct
        ? (selectedVariant?.quantity ?? 0)
        : (product.quantity || 0);

    const isAvailable = availableQuantity > 0 && (product.status === true || product.status === "true");

    // Check if any variant is available for variant products
    const isAnyVariantAvailable = useMemo(() => {
        if (!isVariantProduct) return isAvailable;

        return product.productVariants?.some(variant => (variant.quantity || 0) > 0) || false;
    }, [isVariantProduct, product.productVariants, isAvailable]);

    // Handle wishlist
    const toggleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isWishlistLoading) return;
        onWishlistToggle(product.id, true);

        try {
            if (isWishlisted) {
                await removeFromWishlist(product.id, selectedVariant?.id);
            } else {
                const wishlistProduct = {
                    id: product.id,
                    slug: product.slug,
                    sku: isVariantProduct ? selectedVariant?.sku : product.sku,
                    productName: product.productName,
                    price: originalPrice,
                    discountPrice: discountedPrice,
                    quantity: availableQuantity,
                    images: imagesArray,
                    status: product.status,
                    subCategoryId: product.subCategoryId,
                    taxType: product.taxType,
                    tax: product.tax,
                    discountValue: discountValue,
                    discountAmount: discountAmount,
                    discountType: product.campaignInfo?.discountType || 'Percentage',
                    createdAt: product.createdAt,
                    // Include variant info if applicable
                    ...(isVariantProduct && selectedVariant && {
                        variantId: selectedVariant.id,
                        variantAttributes: selectedVariant.attributes,
                        productType: 'variant'
                    }),
                    // Include campaign info
                    ...(product.campaignInfo && {
                        campaignInfo: {
                            campaignId: product.campaignInfo.campaignId,
                            campaignName: product.campaignInfo.campaignName,
                            campaignType: product.campaignInfo.campaignType,
                            discountValue: product.campaignInfo.discountValue,
                            maxDiscountAmount: product.campaignInfo.maxDiscountAmount,
                            calculatedDiscount: discountAmount,
                            priority: product.campaignInfo.priority,
                            endAt: product.campaignInfo.endAt,
                            badgeText: product.campaignInfo.badgeText,
                            badgeColor: product.campaignInfo.badgeColor
                        }
                    })
                };
                await addToWishlist(wishlistProduct);
                toast.success('Added to wishlist');
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            toast.error('Failed to update wishlist');
        } finally {
            onWishlistToggle(product.id, false);
        }
    };

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isCartLoading || !isAvailable) return;
        onCartToggle(product.id, true);

        try {
            // Build cart product with all discount info
            const cartProduct = {
                id: product.id,
                productId: product.id,
                slug: product.slug,
                productName: product.productName,
                price: discountedPrice,
                originalPrice: originalPrice,
                images: imagesArray,
                quantity: 1,
                status: product.status,
                taxType: product.taxType,
                tax: product.tax,
                sku: isVariantProduct ? selectedVariant?.sku : product.sku,
                discountValue: discountValue,
                discountAmount: discountAmount,
                discountType: product.campaignInfo?.discountType || 'Percentage',
                // Include variant info
                ...(isVariantProduct && selectedVariant && {
                    variantId: selectedVariant.id,
                    variantAttributes: selectedVariant.attributes,
                    productType: 'variant'
                }),
                // Include campaign info
                ...(product.campaignInfo && {
                    campaignId: product.campaignInfo.campaignId,
                    campaignName: product.campaignInfo.campaignName,
                    campaignType: product.campaignInfo.campaignType,
                    maxDiscountAmount: product.campaignInfo.maxDiscountAmount,
                    isCampaignProduct: true
                })
            };

            const success = await addToCart(cartProduct, 1, isVariantProduct ? selectedVariant?.id : null);

            if (success) {
                toast.success('Added to cart!');
            } else {
                toast.error('Failed to add to cart');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add to cart');
        } finally {
            onCartToggle(product.id, false);
        }
    };

    const handleShare = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const shareUrl = `${window.location.origin}/discount-campaigns/${product.slug}`;
        const shareText = `Check out ${product.productName} at BDT ${formatPrice(discountedPrice)}!`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.productName,
                    text: shareText,
                    url: shareUrl,
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    copyToClipboard(shareUrl);
                }
            }
        } else {
            copyToClipboard(shareUrl);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success('Link copied to clipboard!');
        }).catch(() => {
            toast.error('Failed to copy link');
        });
    };

    return (
        <Link
            href={`/discount-campaigns/${product.slug}`}
            className="block h-full"
            prefetch={false}
        >
            <div
                className="overflow-hidden transition-all duration-300 flex flex-col relative group bg-white h-full"
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                {/* Action Icons */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                    <button
                        onClick={toggleWishlist}
                        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                        className="bg-white p-2 rounded-full shadow-md hover:shadow-lg hover:bg-rose-50 transition-all duration-300 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-110 cursor-pointer disabled:opacity-50"
                        style={{ transitionDelay: '0.1s' }}
                        disabled={isWishlistLoading}
                    >
                        {isWishlistLoading ? (
                            <span className="animate-spin inline-block w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full"></span>
                        ) : isWishlisted ? (
                            <FaHeart className="text-rose-600" size={16} />
                        ) : (
                            <FaRegHeart className="text-gray-600 hover:text-rose-600" size={16} />
                        )}
                    </button>

                    <Link href={`/discount-campaigns/${product.slug}`}>
                        <button
                            title="Quick view"
                            className="bg-white p-2 rounded-full shadow-md hover:shadow-lg hover:bg-blue-50 transition-all duration-300 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-110 cursor-pointer"
                            style={{ transitionDelay: '0.2s' }}
                        >
                            <PiEyeLight className="text-gray-600 hover:text-blue-600" size={18} />
                        </button>
                    </Link>

                    <button
                        onClick={handleAddToCart}
                        title={inCart ? "Already in cart" : (isAvailable ? "Add to Cart" : "Out of stock")}
                        className={`bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-110 cursor-pointer ${!isAvailable ? 'cursor-not-allowed hover:bg-gray-100' : 'hover:bg-green-50'}`}
                        style={{ transitionDelay: '0.3s' }}
                        disabled={!isAvailable || isCartLoading}
                    >
                        {isCartLoading ? (
                            <span className="animate-spin inline-block w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full"></span>
                        ) : (
                            <ShoppingCart
                                className={`transition-colors ${inCart ? 'text-green-600' : 'text-gray-600 hover:text-green-600'}`}
                                size={18}
                                fill={inCart ? 'currentColor' : 'none'}
                            />
                        )}
                    </button>

                    <button
                        onClick={handleShare}
                        title="Share product"
                        className="bg-white p-2 rounded-full shadow-md hover:shadow-lg hover:bg-purple-50 transition-all duration-300 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-110 cursor-pointer"
                        style={{ transitionDelay: '0.4s' }}
                    >
                        <PiShareFatLight className="text-gray-600 hover:text-purple-600" size={18} />
                    </button>
                </div>

                {/* Discount Badge */}
                {discountValue > 0 && (
                    <div className="absolute top-3 left-3 z-20">
                        <div className="bg-secound text-white text-xs font-bold px-2 py-1 ">
                            {product.campaignInfo?.badgeText || `-${discountValue}%`}
                        </div>
                    </div>
                )}

                {/* Product Image */}
                <ProductImage   
                    src={displayImage}
                    alt={product.productName}
                    isAvailable={isAvailable}
                />

                {/* Product Info */}
                <div className="p-4 flex flex-col flex-grow">
                     <h3 className="text-sm font-medium text-gray-800 mb-2  font-geist">
                        {product.productName}
                    </h3>
                    {/* Price Section */}
                    <div className="mt-auto">
                        {isVariantProduct && getVariantPriceRange && getOriginalVariantPriceRange ? (
                            // Show price range for variant products with campaign discount
                            <div className="flex gap-3 items-center">
                                {/* DISCOUNTED Price Range (after discount) */}
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-rose-600">
                                       {getVariantPriceRange.priceRange}
                                    </p>
                                </div>

                                <div>
                                    {/* ORIGINAL Price Range (before discount) - show as strikethrough */}
                                    {discountValue > 0 && getVariantPriceRange.minPrice !== getOriginalVariantPriceRange.minOriginalPrice && (
                                        <p className="text-sm text-gray-400 flex items-center line-through">
                                        {getOriginalVariantPriceRange.originalPriceRange}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // Show single price for non-variant products
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-rose-600 flex items-center">
                                      BDT  {formatPrice(discountedPrice)}
                                    </p>
                                    {discountValue > 0 && originalPrice !== discountedPrice && (
                                        <p className="text-sm text-gray-400 flex items-center line-through">
                                          BDT {formatPrice(originalPrice)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Stock Info */}
                        <div className="text-xs text-gray-500 mt-2">
                            {isVariantProduct ? (
                                <div className="space-y-1">
                                    <div className={`font-medium ${isAnyVariantAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                        {isAnyVariantAvailable
                                            ? `In Stock `
                                            : 'Out of stock'
                                        }
                                    </div>
                                </div>
                            ) : (
                                <span className={isAvailable ? 'text-green-600 font-medium' : 'text-red-600'}>
                                    {isAvailable ? 'In Stock' : 'Out of stock'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};



export default DiscountProductCard;