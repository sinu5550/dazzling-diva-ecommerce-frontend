'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Heart, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useCheckoutSession } from '@/hooks/useCheckoutSession';
import {
    extractVariantOptions,
    findMatchingVariant,
    getVariantImage,
    formatPrice,
    calculateDiscountVariantPrice
} from '@/lib/variantHelpers';

const getImageUrl = (img) => {
    if (!img) return 'https://res.cloudinary.com/dh34eqbhu/image/upload/v1747211252/ju2uf9y33y1bncwufrl7.png';
    if (typeof img === 'string') return img;
    if (typeof img === 'object') {
        return img.url || img.image || img.src || 'https://res.cloudinary.com/dh34eqbhu/image/upload/v1747211252/ju2uf9y33y1bncwufrl7.png';
    }
    return 'https://res.cloudinary.com/dh34eqbhu/image/upload/v1747211252/ju2uf9y33y1bncwufrl7.png';
};

const QuickViewModal = ({ product, isOpen, onClose, user = null }) => {
    const router = useRouter();
    const { addToCart } = useCart(user);
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist(user);
    const { createBuyNowSession } = useCheckoutSession();

    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState('');
    const [isCartLoading, setIsCartLoading] = useState(false);
    const [isBuyNowLoading, setIsBuyNowLoading] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);

    const isVariantProduct = product?.productType === 'variant';

    // Extract unique attribute options (e.g. Color, Size)
    const variantOptions = useMemo(() => {
        if (!product) return [];
        return extractVariantOptions(product);
    }, [product]);

    // Extract all product & variant images combined
    const allGalleryImages = useMemo(() => {
        if (!product) return [];
        const baseImages = (product.images || []).map(img => getImageUrl(img));
        const variantImages = (product.productVariants || [])
            .map(v => getImageUrl(v.image))
            .filter(Boolean);
        const combined = [...baseImages, ...variantImages];
        const filtered = combined.filter(img =>
            img &&
            img !== 'https://res.cloudinary.com/dh34eqbhu/image/upload/v1747211252/ju2uf9y33y1bncwufrl7.png' &&
            !img.includes('ju2uf9y33y1bncwufrl7.png')
        );
        return Array.from(new Set(filtered));
    }, [product]);

    // Initialize state when modal opens
    useEffect(() => {
        if (!product) return;

        const initialImg = product.images?.[0];
        setActiveImage(getImageUrl(initialImg));
        setQuantity(1);

        if (isVariantProduct && product.productVariants?.length > 0) {
            const defaultVariant = product.productVariants.find(v => v.isDefault) || product.productVariants[0];
            setSelectedVariant(defaultVariant);
            setSelectedAttributes(defaultVariant.attributes || {});
            if (defaultVariant.image) {
                setActiveImage(getImageUrl(defaultVariant.image));
            }
        } else {
            setSelectedVariant(null);
            setSelectedAttributes({});
        }
    }, [product, isVariantProduct, isOpen]);

    // Handle variant switching when attributes change
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

    // Add to Cart Action
    const handleAddToCart = async () => {
        if (!isAvailable || isCartLoading) return;
        setIsCartLoading(true);
        try {
            const resolvedImages = [];
            if (activeImage) resolvedImages.push(activeImage);
            if (selectedVariant?.image) {
                const varImg = getImageUrl(selectedVariant.image);
                if (varImg && !resolvedImages.includes(varImg)) resolvedImages.push(varImg);
            }
            if (Array.isArray(product.images)) {
                product.images.forEach(img => {
                    const imgUrl = getImageUrl(img);
                    if (imgUrl && !resolvedImages.includes(imgUrl)) resolvedImages.push(imgUrl);
                });
            }
            if (resolvedImages.length === 0) {
                resolvedImages.push('https://res.cloudinary.com/dh34eqbhu/image/upload/v1747211252/ju2uf9y33y1bncwufrl7.png');
            }

            const cartProduct = {
                id: product.id,
                productId: product.id,
                slug: product.slug,
                productName: product.productName,
                price: discountedPrice,
                originalPrice: originalPrice,
                images: resolvedImages,
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

    // Buy Now Action
    const handleBuyNow = async () => {
        if (!isAvailable || isBuyNowLoading) return;
        setIsBuyNowLoading(true);
        try {
            const resolvedImages = [];
            if (activeImage) resolvedImages.push(activeImage);
            if (selectedVariant?.image) {
                const varImg = getImageUrl(selectedVariant.image);
                if (varImg && !resolvedImages.includes(varImg)) resolvedImages.push(varImg);
            }
            if (Array.isArray(product.images)) {
                product.images.forEach(img => {
                    const imgUrl = getImageUrl(img);
                    if (imgUrl && !resolvedImages.includes(imgUrl)) resolvedImages.push(imgUrl);
                });
            }
            if (resolvedImages.length === 0) {
                resolvedImages.push('https://res.cloudinary.com/dh34eqbhu/image/upload/v1747211252/ju2uf9y33y1bncwufrl7.png');
            }

            const checkoutItem = {
                id: product.id,
                productId: product.id,
                slug: product.slug,
                productName: product.productName,
                name: product.productName,
                price: discountedPrice,
                originalPrice: originalPrice,
                images: resolvedImages,
                quantity: quantity,
                status: product.status,
                taxType: product.taxType,
                tax: product.tax,
                sku: sku,
                discountValue: discountValue,
                discountAmount: discountAmount,
                discountType: product.campaignInfo?.discountType || 'Percentage',
                type: product.campaignInfo ? 'discount' : 'regular',
                ...(product.campaignInfo && { campaignInfo: product.campaignInfo }),
                ...(isVariantProduct && selectedVariant && {
                    variantId: selectedVariant.id,
                    variantAttributes: selectedVariant.attributes,
                    productType: 'variant'
                })
            };

            createBuyNowSession(checkoutItem, product.campaignInfo ? 'discount' : 'regular');
            toast.success('Proceeding to checkout...', { icon: '🛒', duration: 1500 });
            onClose();
            router.push('/checkout');
        } catch (error) {
            console.error('Error in Buy Now:', error);
            toast.error('Failed to proceed with Buy Now');
        } finally {
            setIsBuyNowLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Card Box */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', duration: 0.45 }}
                className="relative bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] max-w-[940px] w-full max-h-[90vh] overflow-hidden border border-gray-100 z-10 font-outfit flex flex-col"
            >
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-black w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all cursor-pointer z-30"
                >
                    <X size={18} />
                </button>

                {/* Scrollable Content Container */}
                <div className="overflow-y-auto max-h-[90vh] p-5 md:p-7 flex flex-col md:flex-row gap-6 md:gap-8 scrollbar-thin">

                {/* Left Section: Gallery */}
                <div className="md:w-1/2 flex flex-col">
                    <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-gray-50 border border-gray-100/50 shadow-inner group/zoom">
                        {discountValue > 0 && (
                            <div className="absolute top-3 left-3 z-10">
                                <span className="bg-[#FF0000] text-white text-[11px] md:text-[12px] font-bold px-2.5 py-0.5 rounded-[4px] font-outfit uppercase tracking-wider">
                                    -{discountValue}%
                                </span>
                            </div>
                        )}
                        <Image
                            src={getImageUrl(activeImage)}
                            alt={product.productName}
                            fill
                            priority
                            sizes="(max-width: 768px) 100vw, 450px"
                            className="object-cover transition-transform duration-500 group-hover/zoom:scale-102"
                        />
                    </div>

                    {/* Thumbnail selection row - showing base & variant images */}
                    {allGalleryImages.length > 1 && (
                        <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1 max-w-full hide-scrollbar">
                            {allGalleryImages.map((resolvedImg, idx) => {
                                const resolvedActive = getImageUrl(activeImage);
                                const isSelected = resolvedActive === resolvedImg;
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setActiveImage(resolvedImg)}
                                        className={`relative w-14 h-16 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 border transition-all cursor-pointer ${
                                            isSelected ? 'border-[#5A0C3D] ring-2 ring-[#5A0C3D]/25 scale-105' : 'border-gray-200 hover:border-gray-400 opacity-85 hover:opacity-100'
                                        }`}
                                    >
                                        <Image
                                            src={resolvedImg}
                                            alt={`Gallery image ${idx + 1}`}
                                            fill
                                            sizes="56px"
                                            className="object-cover"
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right Section: Product Details */}
                <div className="md:w-1/2 flex flex-col justify-between py-1">
                    <div>
                        {/* Brand info */}
                        <span className="text-[10px] md:text-[11px] uppercase tracking-widest text-[#5A0C3D] font-outfit font-semibold opacity-85">
                            Dazzling Diva
                        </span>

                        <h2 className="text-[18px] md:text-[24px] font-bold font-outfit text-black leading-snug mt-1 tracking-wide">
                            {product.productName}
                        </h2>

                        {/* Prices */}
                        <div className="flex items-center gap-3 mt-3">
                            <span className="text-xl md:text-2xl font-bold font-outfit text-[#5A0C3D]">
                                BDT {formatPrice(discountedPrice)}
                            </span>
                            {discountValue > 0 && originalPrice !== discountedPrice && (
                                <span className="text-sm md:text-base text-gray-400 font-outfit line-through font-light">
                                    BDT {formatPrice(originalPrice)}
                                </span>
                            )}
                        </div>

                        {/* Availability Details */}
                        <div className="flex items-center gap-2 mt-3">
                            <span className={`inline-flex items-center text-[11px] md:text-[12px] font-medium px-2.5 py-0.5 rounded-[4px] font-outfit ${
                                isAvailable ? 'bg-[#E8F8F0] text-[#00B050]' : 'bg-red-50 text-red-600'
                            }`}>
                                {isAvailable ? `In Stock (${availableQuantity})` : 'Out of stock'}
                            </span>
                            {sku && (
                                <span className="text-[10px] text-gray-400 font-outfit uppercase tracking-widest border-l border-gray-200 pl-2">
                                    SKU: {sku}
                                </span>
                            )}
                        </div>

                        <div className="h-[1px] bg-gray-100/80 my-4" />

                        {/* Variant Attributes Selection */}
                        {isVariantProduct && variantOptions.map((opt) => {
                            const isColor = opt.attributeName.toLowerCase().includes('color');
                            
                            return (
                                <div key={opt.attributeName} className="mb-4">
                                    <h4 className="text-[11px] md:text-[12px] font-semibold font-outfit text-gray-400 uppercase tracking-widest">
                                        Select {opt.attributeName}
                                    </h4>
                                    
                                    {isColor ? (
                                        /* Colors: swatches with soft circular selection */
                                        <div className="flex flex-wrap gap-3 mt-2.5">
                                            {opt.values.map(val => {
                                                const isSelected = selectedAttributes[opt.attributeName] === val;
                                                return (
                                                    <div key={val} className="flex flex-col items-center group">
                                                        <button
                                                            onClick={() => handleAttributeSelect(opt.attributeName, val)}
                                                            className={`w-8 h-8 rounded-full border shadow-sm transition-all duration-300 cursor-pointer ${
                                                                isSelected 
                                                                    ? 'ring-2 ring-offset-2 ring-[#5A0C3D] scale-105' 
                                                                    : 'border-gray-200 hover:scale-105'
                                                            }`}
                                                            style={{ backgroundColor: val }}
                                                            title={val}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        /* Standard Sizes: box pills */
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {opt.values.map(val => {
                                                const isSelected = selectedAttributes[opt.attributeName] === val;
                                                return (
                                                    <button
                                                        key={val}
                                                        onClick={() => handleAttributeSelect(opt.attributeName, val)}
                                                        className={`h-9 px-4 border text-xs md:text-sm font-semibold flex items-center justify-center font-outfit transition-all duration-200 cursor-pointer rounded-[6px] ${
                                                            isSelected 
                                                                ? 'bg-black text-white border-black shadow-sm' 
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

                        {/* Quantity Increment/Decrement Selector */}
                        <div className="mb-5">
                            <h4 className="text-[11px] md:text-[12px] font-semibold font-outfit text-gray-400 uppercase tracking-widest mb-2">
                                Quantity
                            </h4>
                            <div className="flex items-center border border-gray-200 w-fit rounded-[6px] overflow-hidden bg-white shadow-sm">
                                <button
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 cursor-pointer text-gray-600 transition-colors"
                                >
                                    <Minus size={14} />
                                </button>
                                <span className="w-10 h-8 flex items-center justify-center text-xs md:text-sm font-bold font-outfit text-black border-x border-gray-200">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(q => Math.min(availableQuantity, q + 1))}
                                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 cursor-pointer text-gray-600 transition-colors"
                                    disabled={quantity >= availableQuantity}
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action buttons */}
                    <div className="mt-auto">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleAddToCart}
                                disabled={!isAvailable || isCartLoading}
                                className="flex-1 py-3.5 px-4 text-center border-2 border-[#5A0C3D] text-[#5A0C3D] hover:bg-[#5A0C3D] hover:text-white transition-all duration-300 cursor-pointer rounded-[8px] font-outfit font-semibold text-xs md:text-sm uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {isCartLoading ? 'Adding...' : 'Add to Cart'}
                            </button>
                            <button
                                onClick={handleBuyNow}
                                disabled={!isAvailable || isBuyNowLoading}
                                className="flex-1 py-3.5 px-4 text-center bg-[#5A0C3D] text-white hover:bg-[#450322] shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer rounded-[8px] font-outfit font-semibold text-xs md:text-sm uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {isBuyNowLoading ? 'Processing...' : 'Buy Now'}
                            </button>
                        </div>

                        {/* Add to Wishlist Link */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 border-t border-gray-100 pt-3">
                            <button
                                onClick={handleWishlistToggle}
                                disabled={isWishlistLoading}
                                className="flex items-center gap-1.5 text-xs md:text-sm text-gray-500 hover:text-[#5A0C3D] font-outfit cursor-pointer w-fit select-none transition-colors duration-200"
                            >
                                <Heart size={15} className={isWishlisted ? 'fill-rose-600 text-rose-600' : 'text-gray-400'} />
                                {isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
                            </button>

                            {/* View Full Details Link */}
                            <Link
                                href={`/discount-campaigns/${product.slug}`}
                                onClick={onClose}
                                className="text-xs font-semibold text-[#5A0C3D] hover:text-[#450322] flex items-center gap-1 font-outfit w-fit transition-colors mt-2 sm:mt-0"
                            >
                                View Full Details <ArrowRight size={14} className="mt-0.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
        </div>
    );
};

export default QuickViewModal;
