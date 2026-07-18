// components/DiscountProduct/DiscountProductDetailsClient.jsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaStar, FaRegStar, FaCheck, FaBangladeshiTakaSign } from 'react-icons/fa6';
import { MdOutlineAssignmentReturn, MdSupportAgent, MdLiveTv } from 'react-icons/md';
import toast from "react-hot-toast";
import { useCheckoutSession } from "@/hooks/useCheckoutSession";
import LoadingSpinner from "../ui/LoadingSpinner";
import Container from "../Container/Container";
import ProductImageGallery from "../Products/ProductImageGallery";
import VariantSelector from "../Products/VariantSelector";
import WishlistButton from "../ui/WishlistButton";
import PaymentLogo from "../ui/PaymentLogo";
import ProductTabs from "../Products/ProductTabs";
import CountdownTimer from "../CountdownTimer/CountdownTimer";
import {
    getDefaultVariant,
    calculateDiscountVariantPrice,
    formatPrice,
    getVariantImage
} from '@/lib/variantHelpers';

export default function DiscountProductDetailsClient({ product }) {
    const router = useRouter();
    const { createBuyNowSession } = useCheckoutSession();

    const [user, setUser] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [buyNowLoading, setBuyNowLoading] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [isInCart, setIsInCart] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [displayImages, setDisplayImages] = useState(product?.images || []);

    const isVariantProduct = useMemo(() => {
        return product?.productType === 'variant' ||
            (product?.productVariants && product.productVariants.length > 0);
    }, [product]);

    useEffect(() => {
        setIsClient(true);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (isClient) {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (error) {
                    console.error('Error parsing user:', error);
                }
            }
        }
    }, [isClient]);

    useEffect(() => {
        if (isVariantProduct && product?.productVariants) {
            const defaultVariant = getDefaultVariant(product);
            if (defaultVariant) {
                setSelectedVariant(defaultVariant);
                setSelectedAttributes(defaultVariant.attributes || {});
                updateDisplayImages(defaultVariant);
            }
        }
    }, [product, isVariantProduct]);

    useEffect(() => {
        if (isClient && product?.id) {
            checkIfInCart();
        }
    }, [isClient, product?.id, selectedVariant]);

    const checkIfInCart = () => {
        try {
            const storedCart = localStorage.getItem('dazzling_diva_cart');
            if (!storedCart) return;

            const cart = JSON.parse(storedCart);
            const inCart = isVariantProduct && selectedVariant
                ? cart.some(item => item.productId === product.id && item.variantId === selectedVariant.id)
                : cart.some(item => item.productId === product.id);

            setIsInCart(inCart);
        } catch (error) {
            console.error('Error checking cart:', error);
        }
    };

    const updateDisplayImages = (variant) => {
        if (variant?.image) {
            setDisplayImages([variant.image, ...(product.images || [])]);
        } else {
            setDisplayImages(product.images || []);
        }
    };

    const handleVariantChange = (variant, attributes) => {
        setSelectedVariant(variant);
        setSelectedAttributes(attributes);
        if (variant) {
            updateDisplayImages(variant);
            setQuantity(1);
        }
    };

    const priceInfo = useMemo(() => {
        const basePrice = isVariantProduct && selectedVariant
            ? parseFloat(selectedVariant.price)
            : parseFloat(product?.price) || 0;

        return calculateDiscountVariantPrice(basePrice, product?.campaignInfo);
    }, [product, selectedVariant, isVariantProduct]);

    const { originalPrice, discountedPrice, discountAmount, discountPercentage } = priceInfo;
    const hasCampaignDiscount = product?.campaignInfo && discountAmount > 0;
    const campaignInfo = product?.campaignInfo;

    const availableQuantity = isVariantProduct
        ? (selectedVariant?.quantity ?? 0)
        : (product?.quantity || 0);

    const isAvailable = availableQuantity > 0 && product?.status;

    const formatPriceWithIcon = (price) => (
        <span className="flex items-center">
            <FaBangladeshiTakaSign className="inline mr-1" size={16} />
            {formatPrice(price)}
        </span>
    );

    const renderStars = (rating = 4) => (
        <div className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, index) => (
                index < Math.floor(rating)
                    ? <FaStar key={index} className="text-yellow-400 text-sm" />
                    : <FaRegStar key={index} className="text-gray-300 text-sm" />
            ))}
            <span className="ml-2 text-sm text-gray-600">({rating})</span>
        </div>
    );

    const handleQuantityChange = (type) => {
        if (type === 'increment' && quantity < availableQuantity) {
            setQuantity(prev => prev + 1);
        } else if (type === 'decrement' && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const validateVariantSelection = () => {
        if (!isVariantProduct) return true;
        if (!selectedVariant) {
            toast.error('Please select all product options');
            return false;
        }
        if (selectedVariant.quantity === 0) {
            toast.error('Selected variant is out of stock');
            return false;
        }
        return true;
    };

    const handleBuyNow = async (e) => {
        e.preventDefault();
        if (!validateVariantSelection() || !isAvailable) {
            toast.error("Product is out of stock");
            return;
        }

        setBuyNowLoading(true);
        try {
            const checkoutItem = {
                id: product.id,
                productId: product.id,
                slug: product.slug,
                productName: product.productName,
                name: product.productName,
                price: discountedPrice,
                originalPrice: originalPrice,
                images: displayImages,
                quantity: quantity,
                status: product.status,
                taxType: product.taxType,
                tax: product.tax,
                sku: isVariantProduct ? selectedVariant?.sku : product.sku,
                type: 'discount',
                campaignInfo: campaignInfo,
                discountAmount: discountAmount,
                discountPercentage: discountPercentage,
                ...(isVariantProduct && selectedVariant && {
                    variantId: selectedVariant.id,
                    variantAttributes: selectedAttributes,
                    productType: 'variant'
                })
            };

            createBuyNowSession(checkoutItem, 'discount');
            toast.success('Proceeding to checkout...', { icon: '🛒', duration: 1500 });
            setTimeout(() => router.push('/checkout'), 500);
        } catch (error) {
            console.error("Buy Now Error:", error);
            toast.error("Failed to proceed with Buy Now");
        } finally {
            setBuyNowLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!validateVariantSelection() || !isAvailable) {
            toast.error("Product is out of stock");
            return;
        }

        const cartProduct = {
            id: product.id,
            productId: product.id,
            slug: product.slug,
            productName: product.productName,
            name: product.productName,
            price: discountedPrice,
            originalPrice: originalPrice,
            images: displayImages,
            quantity: quantity,
            status: product.status,
            taxType: product.taxType,
            tax: product.tax,
            sku: isVariantProduct ? selectedVariant?.sku : product.sku,
            type: 'discount',
            campaignInfo: campaignInfo,
            discountAmount: discountAmount,
            discountPercentage: discountPercentage,
            ...(isVariantProduct && selectedVariant && {
                variantId: selectedVariant.id,
                variantAttributes: selectedAttributes,
                productType: 'variant'
            })
        };
        try {
            const existingCartJSON = localStorage.getItem('dazzling_diva_cart');
            let existingCart = existingCartJSON ? JSON.parse(existingCartJSON) : [];

            const existingProductIndex = isVariantProduct
                ? existingCart.findIndex(item => item.productId === product.id && item.variantId === selectedVariant?.id)
                : existingCart.findIndex(item => item.productId === product.id);

            if (existingProductIndex > -1) {
                existingCart[existingProductIndex].quantity += quantity;
            } else {
                cartProduct.cartId = Date.now();
                existingCart.push(cartProduct);
            }

            localStorage.setItem('dazzling_diva_cart', JSON.stringify(existingCart));
            window.dispatchEvent(new CustomEvent('cartUpdated', {
                detail: {
                    items: existingCart,
                    count: existingCart.reduce((total, item) => total + (item.quantity || 1), 0)
                }
            }));

            toast.success('Added to cart!', { icon: '🛒', duration: 2000 });
            setIsInCart(true);
        } catch (error) {
            console.error("Add to cart error:", error);
            toast.error("Failed to add to cart");
        }
    };

    const getCampaignBadgeStyle = () => ({
        backgroundColor: campaignInfo?.badgeColor || '#FF0000',
        color: '#ffffff'
    });

    const getBadgeText = () => {
        if (campaignInfo?.badgeText) return campaignInfo.badgeText;
        if (campaignInfo?.discountType === 'Fixed') {
            return `৳${formatPrice(campaignInfo.discountValue)} OFF`;
        }
        return `-${discountPercentage}% OFF`;
    };

    if (isLoading || !isClient) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
                <p className="text-gray-600 mb-6">The product you are looking for does not exist.</p>
                <Link href="/discount-campaigns" className="bg-teal-600 text-white px-6 py-3 hasib-rounded hover:bg-teal-700 transition-colors">
                    Browse Discount Campaigns
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white py-16">
            <Container>
                {/* Breadcrumb */}
                <nav className="text-sm text-gray-600 mb-6 flex items-center gap-2">
                    <Link href="/" className="hover:text-teal-600">Home</Link>
                    <span>/</span>
                    <Link href="/discount-campaigns" className="hover:text-teal-600">Discount Campaigns</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">{product.productName}</span>
                </nav>

                {/* Campaign Banner */}
                {hasCampaignDiscount && campaignInfo && (
                    <div className="mb-6 p-4 hasib-rounded bg-gradient-to-r from-red-50 to-orange-50 border border-red-200">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="text-white text-sm font-bold px-3 py-1.5 rounded shadow" style={getCampaignBadgeStyle()}>
                                    {getBadgeText()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{campaignInfo.campaignName}</h3>
                                    <p className="text-sm text-gray-600">
                                        {campaignInfo.discountType === 'Fixed'
                                            ? `৳${formatPrice(campaignInfo.discountValue)} discount applied`
                                            : `${campaignInfo.discountValue}% discount applied`}
                                        {campaignInfo.maxDiscountAmount && ` (max ৳${formatPrice(campaignInfo.maxDiscountAmount)})`}
                                    </p>
                                </div>
                            </div>
                            {campaignInfo.endAt && campaignInfo.showCountdown && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Offer ends in:</span>
                                    <CountdownTimer endDate={new Date(campaignInfo.endAt)} />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Image Gallery */}
                    <ProductImageGallery
                        images={displayImages}
                        productName={product.productName}
                    />

                    {/* Right Column - Product Details */}
                    <div className="space-y-4">
                        {/* Category Tag */}
                        {product.subCategory && (
                            <div className="text-sm text-gray-600">
                                {product.subCategory.category?.name || ''}, {product.subCategory.name || ''}
                            </div>
                        )}

                        {/* Product Name */}
                        <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                            {product.productName}
                        </h1>

                        {/* Rating & Reviews */}
                        <div className="flex items-center gap-3">
                            {renderStars(4)}
                            <span className="text-sm text-gray-600">(0)</span>
                            <Link href="#reviews" className="text-sm text-blue-600 hover:underline">
                                Write a review
                            </Link>
                        </div>
                        {/* loyal point Info */}
                        <div className="bg-amber-50 border border-amber-200 hasib-rounded p-3">
                            <p className="text-sm text-amber-800">
                                <strong>Buy Now:</strong> Skip the cart and checkout instantly with this product only.
                            </p>
                        </div>

                        {/* Price Section */}
                        <div className="py-4 border-t border-b border-gray-200">
                            <div className="flex items-center gap-4 flex-wrap">
                                <span className="text-4xl font-bold text-rose-600">
                                    {formatPriceWithIcon(discountedPrice)}
                                </span>
                                {hasCampaignDiscount && originalPrice > discountedPrice && (
                                    <span className="text-xl text-gray-400 line-through">
                                        {formatPriceWithIcon(originalPrice)}
                                    </span>
                                )}
                                <div className="flex items-center gap-2">
                                    {isAvailable ? (
                                        <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded font-medium">
                                            In Stock ({availableQuantity})
                                        </span>
                                    ) : (
                                        <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded font-medium">
                                            Out of Stock
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* SKU Display */}
                        <div className="text-sm text-gray-600">
                            <span className="font-semibold">SKU:</span>{' '}
                            {isVariantProduct && selectedVariant ? selectedVariant.sku : product.sku || 'N/A'}
                        </div>

                        {/* Variant Selector */}
                        {isVariantProduct && product.productVariants && product.productVariants.length > 0 && (
                            <div className="border-t border-b border-gray-200 py-6">
                                <VariantSelector product={product} onVariantChange={handleVariantChange} />
                            </div>
                        )}

                        {/* Quantity and Actions */}
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 pt-4">
                            {/* Quantity Selector */}
                            <div className="flex items-center border border-stone-300 hasib-rounded">
                                <button
                                    onClick={() => handleQuantityChange('decrement')}
                                    className="px-4 py-2.5 hover:bg-gray-50 text-black transition-colors text-xl"
                                    disabled={quantity <= 1}
                                >
                                    −
                                </button>
                                <span className="px-6 py-2.5 border-x border-stone-300 text-black min-w-[60px] text-center font-medium">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => handleQuantityChange('increment')}
                                    className="px-4 py-2.5 hover:bg-gray-50 text-black transition-colors text-xl"
                                    disabled={quantity >= availableQuantity}
                                >
                                    +
                                </button>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex-1 w-full md:w-auto">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={!isAvailable || isInCart}
                                        className={`bg-transparent hover:bg-secound border border-secound text-secound hover:text-white py-3 px-6 hasib-rounded font-semibold flex items-center justify-center gap-2 transition-colors uppercase w-full ${isInCart ? 'bg-green-100 text-green-600 border-green-600 hover:bg-green-200' : ''} ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isInCart ? <><FaCheck /> In Cart</> : "ADD TO CART"}
                                    </button>

                                    <button
                                        onClick={handleBuyNow}
                                        disabled={!isAvailable || buyNowLoading}
                                        className={`bg-primary hover:bg-primary-hover text-black hover:text-white py-3 px-8 hasib-rounded font-semibold transition-colors uppercase w-full ${!isAvailable || buyNowLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {buyNowLoading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Processing...
                                            </span>
                                        ) : "Buy Now"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Campaign Savings Info */}
                        {hasCampaignDiscount && campaignInfo && (
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 shadow-sm">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
                                                <span className="text-white text-sm">🎉</span>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-md font-medium text-purple-700 mb-1">
                                                This product is part of{" "}
                                                <span className="font-medium text-purple-900 bg-purple-100 px-1.5 py-0.5 rounded">
                                                    "{campaignInfo.campaignName}"
                                                </span>{" "}
                                                campaign
                                            </p>
                                            {campaignInfo.endAt && (
                                                <div className="inline-flex items-center space-x-1.5 bg-yellow-50 border border-yellow-200 hasib-rounded px-3 py-1.5 mt-2">
                                                    <span className="text-yellow-600">⏰</span>
                                                    <span className="text-sm font-medium text-yellow-800">Limited time offer!</span>
                                                    <span className="text-xs text-yellow-600">
                                                        Ends {new Date(campaignInfo.endAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="md:border-l md:border-blue-200 md:pl-4">
                                        <div className="bg-white hasib-rounded p-3 border border-green-200 shadow-xs">
                                            <div className="text-center">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">You Save</p>
                                                <div className="flex items-center justify-center space-x-2">
                                                    <span className="text-2xl font-bold text-green-600">
                                                        {formatPriceWithIcon(discountAmount)}
                                                    </span>
                                                    <span className="bg-green-100 text-green-800 text-sm font-bold px-2 py-1 rounded-full">
                                                        {discountPercentage}% OFF
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Wishlist Button */}
                        <div className="mt-4">
                            <WishlistButton
                                product={{
                                    ...product,
                                    price: originalPrice,
                                    discountPrice: discountedPrice,
                                    discountValue: discountPercentage,
                                    campaignInfo: campaignInfo,
                                    ...(isVariantProduct && selectedVariant && {
                                        variantId: selectedVariant.id,
                                        variantAttributes: selectedAttributes
                                    })
                                }}
                                variant="withLabel"
                                user={user}
                                showLabel={true}
                            />
                        </div>

                        {/* Delivery Info */}
                        <div className="bg-gray-50 hasib-rounded p-4 mt-6">
                            <p className="text-sm text-gray-700">
                                <span className="font-semibold">Est. Delivery between</span> 10 - 14 days
                            </p>
                        </div>

                        {/* Service Cards */}
                        <div className="grid grid-cols-3 gap-4 bg-yellow-50 hasib-rounded p-6 mt-4">
                            <div className="text-center">
                                <MdOutlineAssignmentReturn className="text-3xl mx-auto mb-2 text-gray-700" />
                                <h5 className="text-xs font-semibold text-gray-900 mb-1">Return & Refund Policy</h5>
                            </div>
                            <div className="text-center border-x border-yellow-200">
                                <MdSupportAgent className="text-3xl mx-auto mb-2 text-gray-700" />
                                <h5 className="text-xs font-semibold text-gray-900 mb-1">Assemble & Product Support</h5>
                            </div>
                            <div className="text-center">
                                <MdLiveTv className="text-3xl mx-auto mb-2 text-gray-700" />
                                <h5 className="text-xs font-semibold text-gray-900 mb-1">Have Questions? Call Us</h5>
                            </div>
                        </div>

                        {/* Product Meta */}
                        <div className="border-t border-gray-200 pt-4 space-y-2">
                            {product.subCategory && (
                                <p className="text-sm text-gray-600">
                                    <span className="font-semibold">Categories:</span>{' '}
                                    {product.subCategory.category?.mainCategory && (
                                        <>
                                            <Link href={`/category/${product.subCategory.category.mainCategory.id}`} className="text-blue-600 hover:underline">
                                                {product.subCategory.category.mainCategory.name}
                                            </Link>
                                            {', '}
                                        </>
                                    )}
                                    {product.subCategory.category && (
                                        <>
                                            <Link href={`/category/${product.subCategory.category.id}`} className="text-blue-600 hover:underline">
                                                {product.subCategory.category.name}
                                            </Link>
                                            {', '}
                                        </>
                                    )}
                                    <Link href={`/products/${product.subCategory.id}`} className="text-blue-600 hover:underline">
                                        {product.subCategory.name}
                                    </Link>
                                </p>
                            )}
                        </div>

                        <PaymentLogo />
                    </div>
                </div>

                {/* Product Tabs */}
                <div className="mt-12">
                    <ProductTabs product={product} selectedVariant={selectedVariant} />
                </div>
            </Container>
        </div>
    );
}