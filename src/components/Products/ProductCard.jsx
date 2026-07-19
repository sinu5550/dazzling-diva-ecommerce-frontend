// components/Products/ProductCard.jsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaRegHeart, FaHeart, FaBangladeshiTakaSign } from 'react-icons/fa6';
import { PiEyeLight, PiShareFatLight } from 'react-icons/pi';
import { ShoppingCart } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import toast from 'react-hot-toast';
import {
    extractVariantOptions,
    getDefaultVariant,
    calculateVariantPrice,
    getVariantImage,
    formatPrice
} from '@/lib/variantHelpers';
import ProductImage from '../ui/ProductImage';


export default function ProductCard({ product, user = null }) {

    const [isHovered, setIsHovered] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
    const [isCartLoading, setIsCartLoading] = useState(false);

    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist(user);
    const { addToCart, isInCart } = useCart(user);

    // Initialize with default variant for variant products
    useEffect(() => {
        if (product.productType === 'variant') {
            const defaultVariant = getDefaultVariant(product);
            setSelectedVariant(defaultVariant);
        }
    }, [product]);

    // Determine if product is variant type
    const isVariantProduct = product.productType === 'variant';

    // Get variant options for quick preview
    const variantOptions = isVariantProduct ? extractVariantOptions(product) : [];

    // Calculate prices based on selected variant or base product
    const { original: originalPrice, discounted: discountedPrice } = isVariantProduct
        ? calculateVariantPrice(selectedVariant, product)
        : calculateVariantPrice(null, product);

    // Get display image
    const displayImage = isVariantProduct
        ? getVariantImage(selectedVariant, product)
        : (product.images?.[0] || '');

    // Check availability
    const availableQuantity = isVariantProduct
        ? (selectedVariant?.quantity ?? 0)
        : product.quantity;

    const isAvailable = availableQuantity > 0 && product.status;

    // Create images array for cart - FIXED: Include all product images
    const cartImages = product.images && product.images.length > 0
        ? product.images
        : [displayImage].filter(img => img); // Fallback to display image if no images array

    const isWishlisted = isInWishlist(product.id);

    // Check if specific variant is in cart for variant products
    const inCart = isInCart(product.id, isVariantProduct ? selectedVariant?.id : null);

    // Helper function to calculate variant product price range stats - FIXED: Added useCallback
    const getVariantStats = useCallback((product) => {
        if (product.productType !== "variant" || !product.productVariants?.length) {
            return null;
        }

        const variants = product.productVariants;
        const totalStock = variants.reduce((sum, v) => sum + (v.quantity || 0), 0);
        const discountValue = product.discountValue || 0;

        const originalPrices = variants.map(v => parseFloat(v.price));
        const minOriginalPrice = Math.min(...originalPrices);
        const maxOriginalPrice = Math.max(...originalPrices);

        const discountedPrices = variants.map(v => {
            const base = parseFloat(v.price);
            return discountValue > 0 ? base - (base * discountValue / 100) : base;
        });
        const minDiscountedPrice = Math.min(...discountedPrices);
        const maxDiscountedPrice = Math.max(...discountedPrices);

        return {
            variantCount: variants.length,
            totalStock,
            minPrice: minDiscountedPrice,
            maxPrice: maxDiscountedPrice,
            priceRange: minDiscountedPrice === maxDiscountedPrice 
                ? `৳${formatPrice(minDiscountedPrice)}` 
                : `৳${formatPrice(minDiscountedPrice)} - ৳${formatPrice(maxDiscountedPrice)}`,
            originalPriceRange: minOriginalPrice === maxOriginalPrice
                ? `৳${formatPrice(minOriginalPrice)}`
                : `৳${formatPrice(minOriginalPrice)} - ৳${formatPrice(maxOriginalPrice)}`,
            hasDiscount: discountValue > 0
        };
    }, []);

    // Calculate variant stats using useMemo for performance
    const variantStats = useMemo(() => {
        return getVariantStats(product);
    }, [product, getVariantStats]);

    // Wishlist handler
    const toggleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isWishlistLoading) return;
        setIsWishlistLoading(true);

        try {
            if (isWishlisted) {
                await removeFromWishlist(product.id);
            } else {
                const wishlistProduct = {
                    id: product.id,
                    slug: product.slug,
                    sku: isVariantProduct ? selectedVariant?.sku : product.sku,
                    productName: product.productName,
                    price: originalPrice,
                    discountPrice: discountedPrice,
                    quantity: isVariantProduct ? selectedVariant?.quantity : product.quantity,
                    images: cartImages,
                    status: product.status,
                    subCategoryId: product.subCategoryId,
                    tax: product.tax,
                    taxType: product.taxType,
                    discountValue: product.discountValue,
                    discountType: product.discountType,
                    createdAt: product.createdAt,
                    // Include variant info if applicable
                    ...(isVariantProduct && selectedVariant && {
                        variantId: selectedVariant.id,
                        variantAttributes: selectedVariant.attributes
                    })
                };
                await addToWishlist(wishlistProduct);
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
        } finally {
            setIsWishlistLoading(false);
        }
    };

    // Cart handler - FIXED: Properly pass images array
    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isCartLoading || !isAvailable) return;
        setIsCartLoading(true);

        try {
            // Build cart item with same structure as ProductDetailsClient
            const cartProduct = {
                id: product.id,
                productId: product.id,
                slug: product.slug,
                sku: isVariantProduct ? selectedVariant?.sku : product.sku,
                productName: product.productName,
                name: product.productName, // Added for consistency
                price: discountedPrice,
                originalPrice: originalPrice,
                images: cartImages, // FIXED: Use proper images array
                quantity: 1, // Default quantity in product card
                status: product.status,
                tax: product.tax,
                taxType: product.taxType,
                discountValue: product.discountValue,
                discountType: product.discountType,
                // Include variant details - IMPORTANT for variant products
                ...(isVariantProduct && selectedVariant && {
                    variantId: selectedVariant.id,
                    variantAttributes: selectedVariant.attributes,
                    productType: 'variant'
                })
            };

            await addToCart(cartProduct, 1, isVariantProduct ? selectedVariant?.id : null);

            toast.success('Added to cart!', {
                icon: '🛒',
                duration: 2000,
            });

        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add to cart');
        } finally {
            setIsCartLoading(false);
        }
    };

    const handleShare = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (navigator.share) {
            navigator.share({
                title: product.productName,
                text: product.productName,
                url: `/product/${product.slug}`,
            });
        } else {
            navigator.clipboard.writeText(`${window.location.origin}/product/${product.slug}`);
            toast.success('Link copied to clipboard!');
        }
    };

    return (
        <Link href={`/product/${product.slug}`}>
            <div
                className="overflow-hidden transition-all duration-300 flex flex-col relative group bg-white h-full"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
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

                    <button
                        title="Quick view"
                        className="bg-white p-2 rounded-full shadow-md hover:shadow-lg hover:bg-blue-50 transition-all duration-300 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-110 cursor-pointer"
                        style={{ transitionDelay: '0.2s' }}
                    >
                        <PiEyeLight className="text-gray-600 hover:text-blue-600" size={18} />
                    </button>

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
                        className="bg-white p-2 rounded-full shadow-md hover:shadow-lg hover:bg-purple-50 transition-all duration-300 transform hover:scale-110 cursor-pointer opacity-100 translate-y-0 lg:opacity-0 lg:translate-y-2 lg:group-hover:translate-y-0 lg:group-hover:opacity-100"
                        style={{ transitionDelay: '0.4s' }}
                    >
                        <PiShareFatLight className="text-gray-600 hover:text-purple-600" size={18} />
                    </button>
                </div>

                {/* Discount Badge */}
                {product.discountValue > 0 && (
                    <div className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-bold px-2 py-1 rounded z-10">
                        -{product.discountValue}%
                    </div>
                )}

                {/* Product Image */}
                <div className="relative diva-rounded flex-shrink-0 ">
                    {/* Product Image */}
                    <ProductImage
                        src={displayImage}
                        alt={product.productName}
                        isAvailable={isAvailable}
                    />

                    {/* Out of Stock Overlay */}
                    {!isAvailable && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center rounded-t-lg">
                            <span className="bg-white text-red-600 font-bold px-4 py-2 rounded text-sm">
                                Out of Stock
                            </span>
                        </div>
                    )}
                </div>

                {/* Product Info - Flex column with margin-top auto to push price to bottom */}
                <div className="mt-3 flex flex-col flex-grow">
                    {/* Product Name - Takes available space but doesn't push beyond */}
                    <h3 className="text-sm font-medium text-gray-800 mb-2  font-geist">
                        {product.productName}
                    </h3>

                    {/* Spacer that pushes price to bottom - this ensures price always at bottom */}
                    <div className="flex-grow"></div>

                    {/* Price Section - Always at bottom */}
                    <div className="mt-auto">
                        {isVariantProduct && variantStats ? (
                            // Show price range for variant products
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-gray-800 font-bold text-sm">
                                    {variantStats.priceRange}
                                </span>
                                {variantStats.hasDiscount && (
                                    <span className="text-gray-400 text-xs line-through font-normal">
                                        {variantStats.originalPriceRange}
                                    </span>
                                )}
                            </div>
                        ) : (
                            // Show single price for non-variant products
                            <div className="flex items-center gap-3">
                                <span className="text-gray-800 font-bold text-sm flex items-center">
                                    <FaBangladeshiTakaSign className="inline mr-1" size={16} />
                                    {formatPrice(discountedPrice)}
                                </span>
                                {product.discountValue > 0 && (
                                    <span className="text-gray-400 text-sm line-through flex items-center font-normal">
                                        <FaBangladeshiTakaSign className="inline mr-1" size={12} />
                                        {formatPrice(originalPrice)}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
