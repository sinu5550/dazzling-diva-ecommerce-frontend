'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { CartIcon } from '@/components/svg';
import toast from 'react-hot-toast';

import {
    getDefaultVariant,
    calculateVariantPrice,
    formatPrice
} from '@/lib/variantHelpers';

export default function NewProductCard({ product, user = null, onOpenQuickView }) {
    const [isHovered, setIsHovered] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [isCartLoading, setIsCartLoading] = useState(false);

    const { addToCart } = useCart(user);

    const isVariantProduct = product.productType === 'variant';

    // Initialize variant selection
    useEffect(() => {
        if (isVariantProduct) {
            setSelectedVariant(getDefaultVariant(product));
        }
    }, [product, isVariantProduct]);

    // Calculate prices
    const { original: originalPrice, discounted: discountedPrice } = useMemo(() => {
        return isVariantProduct
            ? calculateVariantPrice(selectedVariant, product)
            : calculateVariantPrice(null, product);
    }, [isVariantProduct, selectedVariant, product]);

    // Get display image
    const displayImage = useMemo(() => {
        return isVariantProduct
            ? (selectedVariant?.image || product.images?.[0] || '')
            : (product.images?.[0] || '');
    }, [isVariantProduct, selectedVariant, product]);

    // Extract all unique images from main product and variants to find a hover/alternative image
    const allUniqueImages = useMemo(() => {
        const images = [];
        if (product.images) {
            product.images.forEach(img => {
                if (img && !images.includes(img)) images.push(img);
            });
        }
        if (product.productVariants) {
            product.productVariants.forEach(v => {
                if (v.image && !images.includes(v.image)) images.push(v.image);
            });
        }
        return images;
    }, [product]);

    const hoverImg = allUniqueImages.find(img => img !== displayImage) || allUniqueImages[1] || null;

    // Check availability
    const availableQuantity = isVariantProduct
        ? (selectedVariant?.quantity ?? 0)
        : product.quantity;

    const isAvailable = availableQuantity > 0 && (product.status === true || product.status === "true");

    // Get images for cart
    const cartImages = product.images?.length > 0
        ? product.images
        : [displayImage];

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

    return (
        <Link 
            href={`/product/${product.slug}`}
            className="block group/card"
        >
            <div
                className="relative w-full aspect-[2/3]  overflow-hidden bg-gray-100 border border-gray-100 shadow-sm"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Badges Container (top-left) */}
                <div className="absolute top-3 left-3 z-30 flex flex-col gap-1.5 pointer-events-none">
                    {(product.newArrival || product.new || product.isNew || product.newProduct) && (
                        <div className="bg-[#5A0C3D] text-white text-[10px] md:text-[11px] font-bold px-2 py-0.5  uppercase tracking-wider shadow-sm w-fit">
                            New
                        </div>
                    )}
                    {product.discountValue > 0 && (
                        <div className="bg-rose-600 text-white text-[10px] md:text-[11px] font-bold px-2 py-0.5  shadow-sm w-fit">
                            -{product.discountValue}%
                        </div>
                    )}
                </div>

                {/* Product Images (Cross-Fade Hover Effect) */}
                <div className="w-full h-full relative">
                    {/* Default Image */}
                    <Image
                        src={displayImage || 'https://res.cloudinary.com/dh34eqbhu/image/upload/v1747211252/ju2uf9y33y1bncwufrl7.png'}
                        alt={product.productName}
                        fill
                        priority
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className={`object-cover transition-all duration-700 group-hover/card:scale-103 ${hoverImg && isHovered ? 'opacity-0' : 'opacity-100'}`}
                    />
                    
                    {/* Hover Image */}
                    {hoverImg && (
                        <Image
                            src={hoverImg}
                            alt={product.productName}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            className={`object-cover absolute inset-0 transition-all duration-700 group-hover/card:scale-103 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                        />
                    )}
                </div>

                {/* White Details Banner Overlay at the Bottom */}
                <div className="absolute bottom-3 left-3 right-3 bg-white p-3  flex items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.08)] z-20 border border-gray-100/50">
                    <div className="flex flex-col items-start min-w-0 pr-2">
                        <span className="text-[12px] md:text-[14px] font-outfit font-regular text-black line-clamp-1 group-hover/card:text-[#5A0C3D] transition-colors duration-200">
                            {product.productName}
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className="text-[12px] md:text-[14px] font-outfit font-bold text-[#5A0C3D]">
                                {variantPriceRange ? variantPriceRange : `BDT ${formatPrice(discountedPrice)}`}
                            </span>
                            {!variantPriceRange && product.discountValue > 0 && (
                                <span className="text-[10px] md:text-[12px] font-outfit font-normal text-gray-400 line-through">
                                    BDT {formatPrice(originalPrice)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Circular Cart Button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onOpenQuickView && onOpenQuickView(product);
                        }}
                        className="w-8 h-8 md:w-9 md:h-9 bg-white rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#5A0C3D] hover:border-[#5A0C3D] text-black hover:text-white active:scale-95 transition-all flex-shrink-0 cursor-pointer select-none"
                    >
                        <CartIcon className="w-4.5 h-4.5 text-current" />
                    </button>
                </div>
            </div>
        </Link>
    );
}