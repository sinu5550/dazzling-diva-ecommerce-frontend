'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Heart, ShoppingBag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import {
    extractVariantOptions,
    findMatchingVariant,
    getVariantImage,
    formatPrice,
    calculateDiscountVariantPrice
} from '@/lib/variantHelpers';

const QuickViewModal = ({ product, isOpen, onClose, user = null }) => {
    const { addToCart } = useCart(user);
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist(user);

    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState('');
    const [isCartLoading, setIsCartLoading] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);

    const isVariantProduct = product?.productType === 'variant';

    // Extract attributes (e.g. color, size)
    const variantOptions = useMemo(() => {
        if (!product) return [];
        return extractVariantOptions(product);
    }, [product]);

    // Set initial values
    useEffect(() => {
        if (!product) return;

        // Initialize active image
        setActiveImage(product.images?.[0] || 'https://res.cloudinary.com/dh34eqbhu/image/upload/v1747211252/ju2uf9y33y1bncwufrl7.png');
        setQuantity(1);

        // Initialize default variants/attributes
        if (isVariantProduct && product.productVariants?.length > 0) {
            const defaultVariant = product.productVariants.find(v => v.isDefault) || product.productVariants[0];
            setSelectedVariant(defaultVariant);
            setSelectedAttributes(defaultVariant.attributes || {});
            if (defaultVariant.image) {
                setActiveImage(defaultVariant.image);
            }
        } else {
            setSelectedVariant(null);
            setSelectedAttributes({});
        }
    }, [product, isVariantProduct]);

    // Update variant when attributes change
    useEffect(() => {
        if (!product || !isVariantProduct) return;

        const matching = findMatchingVariant(product, selectedAttributes);
        setSelectedVariant(matching);
        
        if (matching?.image) {
            setActiveImage(matching.image);
        }
    }, [selectedAttributes, product, isVariantProduct]);

    if (!isOpen || !product) return null;

    // Price Calculations
    const basePrice = isVariantProduct && selectedVariant 
        ? parseFloat(selectedVariant.price) || 0 
        : parseFloat(product.price) || 0;

    const { originalPrice, discountedPrice, discountAmount } = calculateDiscountVariantPrice(
        basePrice, 
        product.campaignInfo
    );

    const discountValue = product.campaignInfo?.discountValue || 0;

    // Stock details
    const availableQuantity = isVariantProduct
        ? (selectedVariant?.quantity ?? 0)
        : (product.quantity || 0);

    const isAvailable = availableQuantity > 0 && (product.status === true || product.status === "true");

    const sku = isVariantProduct && selectedVariant ? selectedVariant.sku : product.sku;

    // Handle attribute selection
    const handleAttributeSelect = (attributeName, value) => {
        setSelectedAttributes(prev => ({
            ...prev,
            [attributeName]: value
        }));
    };

    // Wishlist Toggle
    const isWishlisted = isInWishlist(product.id, selectedVariant?.id);
    const handleWishlistToggle = async () => {
        if (isWishlistLoading) return;
        setIsWishlistLoading(true);
        try {
            if (isWishlisted) {
                await removeFromWishlist(product.id, selectedVariant?.id);
                toast.success('Removed from wishlist');
            } else {
                const wishlistProduct = {
                    id: product.id,
                    slug: product.slug,
                    sku: sku,
                    productName: product.productName,
                    price: originalPrice,
                    discountPrice: discountedPrice,
                    quantity: availableQuantity,
                    images: product.images || [],
                    status: product.status,
                    subCategoryId: product.subCategoryId,
                    taxType: product.taxType,
                    tax: product.tax,
                    discountValue: discountValue,
                    discountAmount: discountAmount,
                    createdAt: product.createdAt,
                    ...(isVariantProduct && selectedVariant && {
                        variantId: selectedVariant.id,
                        variantAttributes: selectedVariant.attributes,
                        productType: 'variant'
                    }),
                    ...(product.campaignInfo && {
                        campaignInfo: {
                            campaignId: product.campaignInfo.campaignId,
                            campaignName: product.campaignInfo.campaignName,
                            campaignType: product.campaignInfo.campaignType,
                            discountValue: product.campaignInfo.discountValue,
                            maxDiscountAmount: product.campaignInfo.maxDiscountAmount,
                            calculatedDiscount: discountAmount
                        }
                    })
                };
                await addToWishlist(wishlistProduct);
                toast.success('Added to wishlist');
            }
        } catch (error) {
            console.error(error);
            toast.error('Wishlist action failed');
        } finally {
            setIsWishlistLoading(false);
        }
    };

    // Add to Cart
    const handleAddToCart = async () => {
        if (!isAvailable || isCartLoading) return;
        setIsCartLoading(true);
        try {
            const cartProduct = {
                id: product.id,
                productId: product.id,
                slug: product.slug,
                productName: product.productName,
                price: discountedPrice,
                originalPrice: originalPrice,
                images: product.images || [],
                quantity: quantity,
                status: product.status,
                taxType: product.taxType,
                tax: product.tax,
                sku: sku,
                discountValue: discountValue,
                discountAmount: discountAmount,
                discountType: product.campaignInfo?.discountType || 'Percentage',
                ...(isVariantProduct && selectedVariant && {
                    variantId: selectedVariant.id,
                    variantAttributes: selectedVariant.attributes,
                    productType: 'variant'
                })
            };
            const success = await addToCart(cartProduct, quantity, selectedVariant?.id);
            if (success) {
                toast.success('Added to cart!');
                onClose();
            } else {
                toast.error('Failed to add to cart');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error adding to cart');
        } finally {
            setIsCartLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fadeIn">
            {/* Modal Container */}
            <div className="relative bg-white rounded-[16px] md:rounded-[20px] shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto flex flex-col md:flex-row p-6 md:p-8 gap-6 md:gap-8 border border-gray-100">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-black w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer z-30"
                >
                    <X size={20} />
                </button>

                {/* Left Side: Product Images */}
                <div className="md:w-1/2 flex flex-col">
                    <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                        {discountValue > 0 && (
                            <div className="absolute top-3 left-3 z-10">
                                <span className="bg-[#FF0000] text-white text-[11px] md:text-[12px] font-bold px-2 py-0.5 rounded-[4px] font-outfit">
                                    -{discountValue}%
                                </span>
                            </div>
                        )}
                        <Image
                            src={activeImage}
                            alt={product.productName}
                            fill
                            priority
                            sizes="(max-width: 768px) 100vw, 400px"
                            className="object-cover"
                        />
                    </div>

                    {/* Thumbnail Row */}
                    {product.images && product.images.length > 1 && (
                        <div className="flex gap-2.5 mt-4 overflow-x-auto pb-1 max-w-full hide-scrollbar">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(img)}
                                    className={`relative w-16 h-20 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 border transition-all cursor-pointer ${
                                        activeImage === img ? 'border-[#5A0C3D] ring-1 ring-[#5A0C3D]' : 'border-gray-200 hover:border-gray-400'
                                    }`}
                                >
                                    <Image
                                        src={img}
                                        alt=""
                                        fill
                                        sizes="64px"
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Side: Product Details */}
                <div className="md:w-1/2 flex flex-col justify-start">
                    
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-outfit">
                        Dazzling Diva
                    </span>

                    <h2 className="text-lg md:text-[22px] font-bold font-outfit text-black tracking-wide leading-tight mt-1">
                        {product.productName}
                    </h2>

                    {/* Prices */}
                    <div className="flex items-baseline gap-3 mt-3">
                        <span className="text-xl md:text-2xl font-bold font-outfit text-[#FF0055]">
                            BDT {formatPrice(discountedPrice)}
                        </span>
                        {discountValue > 0 && originalPrice !== discountedPrice && (
                            <span className="text-sm md:text-base text-gray-400 font-outfit line-through font-light">
                                BDT {formatPrice(originalPrice)}
                            </span>
                        )}
                    </div>

                    {/* Stock Status */}
                    <div className="mt-3">
                        <span className={`inline-flex items-center text-[12px] font-medium px-2.5 py-0.5 rounded-[4px] font-outfit ${
                            isAvailable ? 'bg-[#E8F8F0] text-[#00B050]' : 'bg-red-50 text-red-600'
                        }`}>
                            {isAvailable ? `In Stock (${availableQuantity})` : 'Out of stock'}
                        </span>
                    </div>

                    {/* SKU */}
                    {sku && (
                        <p className="text-[11px] text-gray-400 font-outfit mt-2.5 uppercase tracking-wider">
                            SKU: <span className="text-gray-600 font-normal">{sku}</span>
                        </p>
                    )}

                    <div className="h-[1px] bg-gray-100 my-4" />

                    {/* Dynamic Variant Options (e.g. Color, Size) */}
                    {isVariantProduct && variantOptions.map((opt) => {
                        const isColor = opt.attributeName.toLowerCase().includes('color');
                        
                        return (
                            <div key={opt.attributeName} className="mb-4">
                                <h4 className="text-xs md:text-sm font-semibold font-outfit text-gray-800 uppercase tracking-wider">
                                    {opt.attributeName}
                                </h4>
                                
                                {isColor ? (
                                    /* Color Swatches matching 2nd image: Color block with a black line underneath if selected */
                                    <div className="flex flex-wrap gap-3 mt-2">
                                        {opt.values.map(val => {
                                            const isSelected = selectedAttributes[opt.attributeName] === val;
                                            return (
                                                <div key={val} className="flex flex-col items-center">
                                                    <button
                                                        onClick={() => handleAttributeSelect(opt.attributeName, val)}
                                                        className="w-8 h-8 rounded border border-gray-300 shadow-sm focus:outline-none transition-all cursor-pointer"
                                                        style={{ backgroundColor: val }}
                                                        title={val}
                                                    />
                                                    {isSelected && (
                                                        <div className="w-6 h-[2px] bg-black mt-1 rounded-full" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    /* Size buttons: black background when selected, white background with border otherwise */
                                    <div className="flex flex-wrap gap-2.5 mt-2">
                                        {opt.values.map(val => {
                                            const isSelected = selectedAttributes[opt.attributeName] === val;
                                            return (
                                                <button
                                                    key={val}
                                                    onClick={() => handleAttributeSelect(opt.attributeName, val)}
                                                    className={`w-10 h-10 border text-xs md:text-sm font-semibold flex items-center justify-center font-outfit transition-all cursor-pointer rounded-[4px] ${
                                                        isSelected 
                                                            ? 'bg-black text-white border-black' 
                                                            : 'bg-white text-gray-700 border-gray-200 hover:border-black'
                                                    }`}
                                                >
                                                    {val}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Quantity Selector */}
                    <div className="mb-6">
                        <h4 className="text-xs md:text-sm font-semibold font-outfit text-gray-800 uppercase tracking-wider mb-2">
                            Quantity
                        </h4>
                        <div className="flex items-center border border-gray-300 w-fit rounded-[4px] overflow-hidden bg-white">
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 cursor-pointer select-none text-lg font-light text-gray-600 active:bg-gray-100 transition-colors"
                            >
                                &minus;
                            </button>
                            <span className="w-12 h-9 flex items-center justify-center text-sm font-semibold font-outfit text-black border-x border-gray-300">
                                {quantity}
                            </span>
                            <button
                                onClick={() => setQuantity(q => Math.min(availableQuantity, q + 1))}
                                className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 cursor-pointer select-none text-lg font-light text-gray-600 active:bg-gray-100 transition-colors"
                                disabled={quantity >= availableQuantity}
                            >
                                &#43;
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleAddToCart}
                            disabled={!isAvailable || isCartLoading}
                            className="flex-1 py-3 px-4 text-center border border-[#5A0C3D] text-[#5A0C3D] hover:bg-[#5A0C3D]/5 transition-colors cursor-pointer rounded-[4px] font-outfit font-semibold text-sm uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isCartLoading ? 'Adding...' : 'Add to Cart'}
                        </button>
                        <button
                            disabled={!isAvailable}
                            className="flex-1 py-3 px-4 text-center bg-[#5A0C3D] text-white hover:bg-[#450322] transition-colors cursor-pointer rounded-[4px] font-outfit font-semibold text-sm uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Buy Now
                        </button>
                    </div>

                    {/* Add to Wishlist Link */}
                    <button
                        onClick={handleWishlistToggle}
                        disabled={isWishlistLoading}
                        className="flex items-center justify-center sm:justify-start gap-2 text-xs md:text-sm text-gray-600 hover:text-black mt-4 font-outfit cursor-pointer w-fit select-none"
                    >
                        <Heart size={16} className={isWishlisted ? 'fill-rose-600 text-rose-600' : 'text-gray-500'} />
                        {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                    </button>

                    <div className="h-[1px] bg-gray-100 my-4" />

                    {/* Description */}
                    <div className="text-xs md:text-sm text-gray-500 font-outfit">
                        <p>{product.description || 'No description available.'}</p>
                    </div>

                    {/* View Full Details Link */}
                    <Link
                        href={`/discount-campaigns/${product.slug}`}
                        onClick={onClose}
                        className="text-xs md:text-sm font-medium text-[#5A0C3D] hover:text-[#450322] hover:underline mt-4 flex items-center gap-1 font-outfit w-fit"
                    >
                        View Full Details &rarr;
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default QuickViewModal;
