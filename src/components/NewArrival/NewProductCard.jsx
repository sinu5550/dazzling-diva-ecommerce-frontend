// components/NewProductCard.jsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FaRegHeart, FaHeart, FaBangladeshiTakaSign } from 'react-icons/fa6';
import { PiShareFatLight } from 'react-icons/pi';
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
import ProductImage from "../ui/ProductImage";

export default function NewProductCard({ product, user = null }) {
    const [isHovered, setIsHovered] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
    const [isCartLoading, setIsCartLoading] = useState(false);
    const [isNewProduct, setIsNewProduct] = useState(false);

    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist(user);
    const { addToCart, isInCart } = useCart(user);

    // Check if product is new (within 30 days)
    useEffect(() => {
        if (product.createdAt) {
            const productDate = new Date(product.createdAt);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            setIsNewProduct(productDate >= thirtyDaysAgo);
        }
    }, [product.createdAt]);

    // Initialize variant selection
    useEffect(() => {
        if (product.productType === 'variant') {
            setSelectedVariant(getDefaultVariant(product));
        }
    }, [product]);

    const isVariantProduct = product.productType === 'variant';

    // Calculate prices
    const { original: originalPrice, discounted: discountedPrice } = useMemo(() => {
        return isVariantProduct
            ? calculateVariantPrice(selectedVariant, product)
            : calculateVariantPrice(null, product);
    }, [isVariantProduct, selectedVariant, product]);

    // Get display image
    const displayImage = useMemo(() => {
        return isVariantProduct
            ? getVariantImage(selectedVariant, product)
            : (product.images?.[0] || '');
    }, [isVariantProduct, selectedVariant, product]);

    // Check availability
    const availableQuantity = isVariantProduct
        ? (selectedVariant?.quantity ?? 0)
        : product.quantity;

    const isAvailable = availableQuantity > 0 && product.status;

    // Get images for cart
    const cartImages = product.images?.length > 0
        ? product.images
        : [displayImage];

    const isWishlisted = isInWishlist(product.id);
    const inCart = isInCart(product.id, isVariantProduct ? selectedVariant?.id : null);

    // Get variant price range
    const variantPriceRange = useMemo(() => {
        if (!isVariantProduct || !product.productVariants?.length) return null;

        const prices = product.productVariants.map(v => parseFloat(v.price));
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        if (minPrice === maxPrice) {
            return `BDT ${formatPrice(minPrice)}`;
        }
        return `BDT ${formatPrice(minPrice)} - BDT ${formatPrice(maxPrice)}`;
    }, [isVariantProduct, product]);

    // Wishlist handler
    const toggleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isWishlistLoading) return;

        setIsWishlistLoading(true);
        try {
            if (isWishlisted) {
                await removeFromWishlist(product.id);
                toast.success('Removed from wishlist');
            } else {
                const wishlistProduct = {
                    id: product.id,
                    slug: product.slug,
                    sku: isVariantProduct ? selectedVariant?.sku : product.sku,
                    productName: product.productName,
                    price: originalPrice,
                    discountPrice: discountedPrice,
                    quantity: availableQuantity,
                    images: cartImages,
                    status: product.status,
                    ...(isVariantProduct && selectedVariant && {
                        variantId: selectedVariant.id,
                        variantAttributes: selectedVariant.attributes
                    })
                };
                await addToWishlist(wishlistProduct);
                toast.success('Added to wishlist');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setIsWishlistLoading(false);
        }
    };

    // Cart handler
    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isCartLoading || !isAvailable) return;

        setIsCartLoading(true);
        try {
            const cartProduct = {
                id: product.id,
                productId: product.id,
                slug: product.slug,
                sku: isVariantProduct ? selectedVariant?.sku : product.sku,
                productName: product.productName,
                name: product.productName,
                price: discountedPrice,
                originalPrice: originalPrice,
                images: cartImages,
                quantity: 1,
                status: product.status,
                tax: product.tax,
                taxType: product.taxType,
                discountValue: product.discountValue,
                discountType: product.discountType,
                ...(isVariantProduct && selectedVariant && {
                    variantId: selectedVariant.id,
                    variantAttributes: selectedVariant.attributes,
                    productType: 'variant'
                })
            };

            await addToCart(cartProduct, 1, isVariantProduct ? selectedVariant?.id : null);
            toast.success('Added to cart!');
        } catch (error) {
            toast.error('Failed to add to cart');
        } finally {
            setIsCartLoading(false);
        }
    };

    // Share handler
    const handleShare = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const url = `${window.location.origin}/product/${product.slug}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.productName,
                    text: `Check out ${product.productName}`,
                    url: url,
                });
            } catch (error) {
                if (error.name !== 'AbortError') {
                    await copyToClipboard(url);
                }
            }
        } else {
            await copyToClipboard(url);
        }
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Link copied!');
        } catch (error) {
            toast.error('Failed to copy');
        }
    };

    return (
        <Link href={`/product/${product.slug}`}>
            <div
                className="group relative bg-white  transition-all duration-300 overflow-hidden"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* New Badge */}
                {isNewProduct && (
                    <div className="absolute top-3 left-3 z-20">
                        <div className="bg-secound text-white text-xs font-bold px-2 py-1 ">
                            NEW
                        </div>
                    </div>
                )}

                {/* Discount Badge */}
                {product.discountValue > 0 && !isNewProduct && (
                    <div className="absolute top-3 left-3 z-20">
                        <div className="bg-secound text-white text-xs font-bold px-2 py-1 ">
                            -{product.discountValue}%
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
                    <button
                        onClick={toggleWishlist}
                        className="bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                        disabled={isWishlistLoading}
                    >
                        {isWishlistLoading ? (
                            <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                        ) : isWishlisted ? (
                            <FaHeart className="text-rose-500" size={16} />
                        ) : (
                            <FaRegHeart className="text-gray-600" size={16} />
                        )}
                    </button>

                    <button
                        onClick={handleAddToCart}
                        disabled={!isAvailable || isCartLoading}
                        className="bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                    >
                        {isCartLoading ? (
                            <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <ShoppingCart
                                size={16}
                                className={inCart ? "text-green-500" : "text-gray-600"}
                                fill={inCart ? "currentColor" : "none"}
                            />
                        )}
                    </button>

                    <button
                        onClick={handleShare}
                        className="bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                    >
                        <PiShareFatLight size={16} className="text-gray-600" />
                    </button>
                </div>

                {/* Product Image */}
                <ProductImage
                    src={displayImage}
                    alt={product.productName}
                    isAvailable={isAvailable}
                />

                {/* Product Info */}
                <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-800 mb-2  font-geist">
                        {product.productName}
                    </h3>

                    {/* Price */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {variantPriceRange ? (
                            <span className="text-gray-800 font-bold text-sm">
                                {variantPriceRange}
                            </span>
                        ) : (
                            <>
                                <span className="text-gray-800 font-bold text-sm flex items-center">
                                   BDT  {formatPrice(discountedPrice)}
                                </span>

                                {product.discountValue > 0 && (
                                    <span className="text-gray-400 text-sm line-through flex items-center font-normal">
                                      BDT  {formatPrice(originalPrice)}
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}