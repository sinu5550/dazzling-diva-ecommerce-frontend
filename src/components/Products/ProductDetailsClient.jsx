// components/Products/ProductDetailsClient.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaStar, FaRegStar, FaCheck } from 'react-icons/fa6';
import { MdOutlineAssignmentReturn, MdSupportAgent, MdLiveTv } from 'react-icons/md';
import ProductImageGallery from './ProductImageGallery';
import ProductTabs from './ProductTabs';
import ProductCard from './ProductCard';
import VariantSelector from './VariantSelector';
import WishlistButton from "../ui/WishlistButton";
import Container from "../Container/Container";
import toast from "react-hot-toast";
import LoadingSpinner from "../ui/LoadingSpinner";
import PaymentLogo from "../ui/PaymentLogo";
import { useCheckoutSession } from '@/hooks/useCheckoutSession';
import {
    calculateVariantPrice,
    getVariantImage,
    formatPrice,
    getDefaultVariant,
    findMatchingVariant
} from '@/lib/variantHelpers';

export default function ProductDetailsClient({ product, relatedProducts = [] }) {

    const router = useRouter();
    const { createBuyNowSession } = useCheckoutSession();

    const [user, setUser] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [buyNowLoading, setBuyNowLoading] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [isInCart, setIsInCart] = useState(false);
    const [displayImages, setDisplayImages] = useState(product.images || []);

    const isVariantProduct = product.productType === 'variant';

    // Check if selected combination is valid and available
    const isSelectedCombinationValid = () => {
        if (!isVariantProduct) return true;

        const matchingVariant = findMatchingVariant(product, selectedAttributes);
        return matchingVariant && matchingVariant.quantity > 0;
    };

    // Get the selected variant and its availability
    const getSelectedVariantStatus = () => {
        if (!isVariantProduct) return { exists: true, inStock: true };

        const matchingVariant = findMatchingVariant(product, selectedAttributes);
        return {
            exists: !!matchingVariant,
            inStock: matchingVariant ? matchingVariant.quantity > 0 : false,
            variant: matchingVariant
        };
    };

    // Set isClient on mount
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Load user from localStorage
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

    // Initialize default variant for variant products
    useEffect(() => {
        if (isVariantProduct) {
            const defaultVariant = getDefaultVariant(product);
            if (defaultVariant) {
                setSelectedVariant(defaultVariant);
                setSelectedAttributes(defaultVariant.attributes);
                updateDisplayImages(defaultVariant);
            }
        }
    }, [product, isVariantProduct]);

    // Check if product is in cart
    useEffect(() => {
        if (isClient && product?.id) {
            checkIfInCart();
        }
    }, [isClient, product?.id, selectedVariant]);

    const checkIfInCart = () => {
        try {
            const storedCart = localStorage.getItem('bd_plaza_cart');
            if (storedCart) {
                const cart = JSON.parse(storedCart);

                if (isVariantProduct && selectedVariant) {
                    const inCart = cart.some(item =>
                        item.productId === product.id &&
                        item.variantId === selectedVariant.id
                    );
                    setIsInCart(inCart);
                } else {
                    const inCart = cart.some(item => item.productId === product.id);
                    setIsInCart(inCart);
                }
            }
        } catch (error) {
            console.error('Error checking cart:', error);
        }
    };

    // Update display images when variant changes
    const updateDisplayImages = (variant) => {
        if (variant?.image) {
            setDisplayImages([variant.image, ...(product.images || [])]);
        } else {
            setDisplayImages(product.images || []);
        }
    };

    // Handle variant change from VariantSelector
    const handleVariantChange = (variant, attributes) => {
        setSelectedVariant(variant);
        setSelectedAttributes(attributes);

        if (variant) {
            updateDisplayImages(variant);
            // Reset quantity to 1 when changing variants
            setQuantity(1);
        }
    };

    // Calculate prices
    const { original: originalPrice, discounted: discountedPrice } = isVariantProduct
        ? calculateVariantPrice(selectedVariant, product)
        : calculateVariantPrice(null, product);

    // Get selected variant status
    const variantStatus = getSelectedVariantStatus();
    const canAddToCart = isVariantProduct
        ? variantStatus.exists && variantStatus.inStock && product.status
        : product.quantity > 0 && product.status;

    // Check availability for quantity selector
    const availableQuantity = isVariantProduct
        ? (selectedVariant?.quantity ?? 0)
        : product.quantity;

    const isAvailable = availableQuantity > 0 && product.status;

    // Validate variant selection before cart/buy actions
    const validateVariantSelection = () => {
        if (!isVariantProduct) return true;

        if (!variantStatus.exists) {
            toast.error('This combination is not available. Please select another combination.');
            return false;
        }

        if (!variantStatus.inStock) {
            toast.error('This variant is out of stock. Please select another option.');
            return false;
        }

        return true;
    };

    // Render star ratings
    const renderStars = (rating = 4) => {
        return (
            <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, index) => (
                    index < rating
                        ? <FaStar key={index} className="text-yellow-400 text-sm" />
                        : <FaRegStar key={index} className="text-gray-300 text-sm" />
                ))}
            </div>
        );
    };

    const handleQuantityChange = (type) => {
        if (type === 'increment' && quantity < availableQuantity && canAddToCart) {
            setQuantity(prev => prev + 1);
        } else if (type === 'decrement' && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    // Handle Buy Now
    const handleBuyNow = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!validateVariantSelection()) return;

        if (!canAddToCart) {
            toast.error("Product is not available for purchase");
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
                tax: product.tax,
                taxType: product.taxType,
                discountValue: product.discountValue,
                discountType: product.discountType,
                sku: isVariantProduct ? selectedVariant?.sku : product.sku,
                type: 'regular',
                isBundle: false,
                // Include variant details
                ...(isVariantProduct && selectedVariant && {
                    variantId: selectedVariant.id,
                    variantAttributes: selectedAttributes,
                    productType: 'variant'
                })
            };

            createBuyNowSession(checkoutItem, 'regular');

            toast.success('Proceeding to checkout...', {
                icon: '🛒',
                duration: 1500,
            });

            setTimeout(() => {
                router.push('/checkout');
            }, 500);

        } catch (error) {
            console.error("Error in Buy Now:", error);
            toast.error("Failed to proceed with Buy Now");
        } finally {
            setBuyNowLoading(false);
        }
    };

    // Handle Add to Cart
    const handleAddToCart = async () => {
        if (!validateVariantSelection()) return;

        if (!canAddToCart) {
            toast.error("Product is not available for purchase");
            return;
        }

        const cartProduct = {
            id: product.id,
            productId: product.id,
            slug: product.slug,
            sku: isVariantProduct ? selectedVariant?.sku : product.sku,
            productName: product.productName,
            name: product.productName,
            price: discountedPrice,
            originalPrice: originalPrice,
            images: displayImages,
            quantity: quantity,
            status: product.status,
            tax: product.tax,
            taxType: product.taxType,
            discountValue: product.discountValue,
            discountType: product.discountType,
            // Include variant details
            ...(isVariantProduct && selectedVariant && {
                variantId: selectedVariant.id,
                variantAttributes: selectedAttributes,
                productType: 'variant'
            })
        };

        try {
            const existingCartJSON = localStorage.getItem('bd_plaza_cart');
            let existingCart = existingCartJSON ? JSON.parse(existingCartJSON) : [];

            // For variant products, check variant ID match
            const existingProductIndex = isVariantProduct
                ? existingCart.findIndex(item =>
                    item.productId === product.id &&
                    item.variantId === selectedVariant?.id
                )
                : existingCart.findIndex(item => item.productId === product.id);

            if (existingProductIndex > -1) {
                existingCart[existingProductIndex].quantity += quantity;
            } else {
                existingCart.push(cartProduct);
            }

            localStorage.setItem('bd_plaza_cart', JSON.stringify(existingCart));

            const event = new CustomEvent('cartUpdated', {
                detail: {
                    items: existingCart,
                    count: existingCart.reduce((total, item) => total + (item.quantity || 1), 0)
                }
            });
            window.dispatchEvent(event);

            toast.success('Added to cart!', {
                icon: '🛒',
                duration: 2000,
            });

            setIsInCart(true);

        } catch (error) {
            console.error("Error adding to cart:", error);
            toast.error("Failed to add to cart");
        }
    };

    if (!isClient) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    return (
        <div className="bg-white my-8 lg:py-16  max-w-7xl mx-auto">
            <Container>
                {/* Breadcrumb */}
                <div className="hidden lg:flex">
                    <nav className="text-sm text-gray-600 mb-6 flex items-center gap-2 ">
                        <Link href="/" className="hover:text-primary">
                            Home
                        </Link>
                        <span>/</span>
                        <Link href={`/products/category/${product.subCategory?.category?.name}`} className="hover:text-primary">
                            {product.subCategory?.category?.name || 'Category'}
                        </Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">{product.productName}</span>
                    </nav>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20">
                    {/* Left Column - Image Gallery */}
                    <ProductImageGallery
                        images={displayImages}
                        productName={product.productName}
                    />

                    {/* Right Column - Product Details */}
                    <div className="space-y-4">
                        {/* Category Tag */}
                        <div className="text-sm text-gray-600">
                            {product.subCategory?.category?.name || ''}, {product.subCategory?.name || ''}
                        </div>

                        {/* Product Name */}
                        <h1 className="font-poppins text-xl lg:text-2xl font-medium text-gray-800 leading-tight">
                            {product.productName}
                        </h1>

                        {/* Buy Now Info */}
                        {/* <div className="bg-gradient-to-r from-secound/10 to-secound/5 border border-secound/20  px-3 py-2">
                            <div className="flex items-center gap-2">
                                <span>⭐</span>
                                <p className="text-xs md:text-sm text-secound">
                                    Earn loyalty points: 100 BDT = 1 point, 1 point = 1 BDT
                                </p>
                            </div>
                        </div> */}

                        {/* Price Section */}
                        <div className="py-4 border-t border-b border-gray-200 text-gray-700">
                            <div className="flex items-center gap-4 flex-wrap">
                                <span className="text-2xl md:text-3xl font-bold text-rose-600 flex items-center">
                                    BDT {formatPrice(discountedPrice)}
                                </span>
                                {product.discountValue > 0 && (
                                    <span className="text-md lg:text-xl text-gray-400 flex items-center line-through">
                                        BDT {formatPrice(originalPrice)}
                                    </span>
                                )}

                                {/* VAT/Tax Display */}
                                <div className="flex items-center gap-2">
                                    {product.taxType === 'inclusive' ? (
                                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded">
                                            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-[10px] lg:text-xs font-medium text-green-700">
                                                VAT Included
                                            </span>
                                        </div>
                                    ) : product.tax > 0 ? (
                                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 border border-purple-200 rounded">
                                            <svg className="w-3 h-3 text-secound" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                            <span className="text-xs font-medium text-secound">
                                                + {product.tax}% VAT
                                            </span>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        {/* Status Indicators */}
                        <div className="flex items-center gap-2">
                            {isVariantProduct ? (
                                variantStatus.exists ? (
                                    variantStatus.inStock ? (
                                        <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded font-medium">
                                            In Stock ({selectedVariant?.quantity})
                                        </span>
                                    ) : (
                                        <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded font-medium">
                                            Out of Stock
                                        </span>
                                    )
                                ) : (
                                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded font-medium">
                                        Combination Not Available
                                    </span>
                                )
                            ) : (
                                isAvailable ? (
                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded font-medium">
                                        In Stock ({availableQuantity})
                                    </span>
                                ) : (
                                    <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded font-medium">
                                        Out of Stock
                                    </span>
                                )
                            )}
                        </div>

                        {/* SKU Display */}
                        <div className="text-sm text-gray-600">
                            <span className="font-semibold">SKU:</span>{' '}
                            {isVariantProduct && selectedVariant
                                ? selectedVariant.sku
                                : product.sku || 'N/A'}
                        </div>

                        {/* Variant Selector - Only for variant products */}
                        {isVariantProduct && (
                            <div className="border-t border-b border-gray-200 py-6">
                                <VariantSelector
                                    product={product}
                                    onVariantChange={handleVariantChange}
                                />
                            </div>
                        )}

                        {/* Quantity and Actions */}
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 pt-4">
                            {/* Quantity Selector - Only show if combination is valid and in stock */}
                            {(!isVariantProduct || (variantStatus.exists && variantStatus.inStock)) && (
                                <div className="flex items-center border border-stone-300 ">
                                    <button
                                        onClick={() => handleQuantityChange('decrement')}
                                        className="px-4 py-2.5 hover:bg-gray-50 text-black transition-colors text-xl cursor-pointer"
                                        disabled={quantity <= 1 || !canAddToCart}
                                    >
                                        −
                                    </button>
                                    <span className="px-6 py-2.5 border-x border-stone-300 text-black min-w-[60px] text-center font-medium">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => handleQuantityChange('increment')}
                                        className="px-4 py-2.5 hover:bg-gray-50 text-black transition-colors text-xl cursor-pointer"
                                        disabled={quantity >= availableQuantity || !canAddToCart}
                                    >
                                        +
                                    </button>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex-1 w-full md:w-auto">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={!canAddToCart || isInCart}
                                        className={`bg-transparent hover:bg-primary border border-primary text-primary hover:text-white py-3 px-6  font-semibold flex items-center justify-center gap-2 transition-all duration-500 uppercase w-full 
                                            ${isInCart ? 'bg-green-100 text-green-600 border-green-600 hover:bg-green-200' : ''} 
                                            ${!canAddToCart ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                        `}
                                    >
                                        {isInCart ? (
                                            <>
                                                <FaCheck /> In Cart
                                            </>
                                        ) : (
                                            !variantStatus.exists ? "NOT AVAILABLE" :
                                                !variantStatus.inStock ? "OUT OF STOCK" :
                                                    "ADD TO CART"
                                        )}
                                    </button>

                                    <button
                                        onClick={handleBuyNow}
                                        disabled={!canAddToCart || buyNowLoading}
                                        className={`bg-primary hover:bg-primary-hover text-white py-3 px-8  font-semibold transition-all duration-500 uppercase w-full 
                                            ${!canAddToCart || buyNowLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                        `}
                                    >
                                        {buyNowLoading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Processing...
                                            </span>
                                        ) : (
                                            !variantStatus.exists ? "NOT AVAILABLE" :
                                                !variantStatus.inStock ? "OUT OF STOCK" :
                                                    "BUY NOW"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Wishlist Button */}
                        <div className="mt-4">
                            <WishlistButton
                                product={{
                                    ...product,
                                    images: displayImages,
                                    ...(isVariantProduct && selectedVariant && {
                                        variantId: selectedVariant.id,
                                        variantAttributes: selectedAttributes,
                                        variantSku: selectedVariant.sku,
                                        sku: selectedVariant.sku,
                                        price: selectedVariant.price || originalPrice,
                                        quantity: selectedVariant.quantity || 0
                                    })
                                }}
                                variant="withLabel"
                                user={user}
                                showLabel={true}
                            />
                        </div>

                        {/* Delivery Info */}
                        <div className="bg-gray-50  p-4 mt-6">
                            <p className="text-sm text-gray-700">
                                <span className="font-semibold">Est. Delivery between</span> 3 - 7 days
                            </p>
                        </div>

                        {/* Service Cards */}
                        <div className="grid grid-cols-3 gap-4 bg-yellow-50  p-6 mt-4">
                            <div className="text-center">
                                <MdOutlineAssignmentReturn className="text-3xl mx-auto mb-2 text-gray-700" />
                                <h5 className="text-xs font-semibold text-gray-900 mb-1">
                                    Return & Refund Policy
                                </h5>
                            </div>
                            <div className="text-center border-x border-yellow-200">
                                <MdSupportAgent className="text-3xl mx-auto mb-2 text-gray-700" />
                                <h5 className="text-xs font-semibold text-gray-900 mb-1">
                                    Assemble & Product Support
                                </h5>
                            </div>
                            <div className="text-center">
                                <MdLiveTv className="text-3xl mx-auto mb-2 text-gray-700" />
                                <h5 className="text-xs font-semibold text-gray-900 mb-1">
                                    Have Questions? Call Us
                                </h5>
                            </div>
                        </div>

                        {/* Product Meta */}
                        <div className="border-t border-gray-200 pt-4 space-y-2">
                            <p className="text-sm text-gray-600">
                                <span className="font-semibold">Categories:</span>{' '}
                                <Link href={`/category/${product.subCategory?.category?.mainCategory?.id}`} className="text-secound hover:underline">
                                    {product.subCategory?.category?.mainCategory?.name || 'Main Category'}
                                </Link>
                                {',  '}
                                <Link href={`/category/${product.subCategory?.category?.id}`} className="text-secound hover:underline">
                                    {product.subCategory?.category?.name || 'Category'}
                                </Link>
                                {',  '}
                                <Link href={`/products/${product.subCategory?.id}`} className="text-secound hover:underline">
                                    {product.subCategory?.name || 'Subcategory'}
                                </Link>
                            </p>
                        </div>

                        <PaymentLogo />
                    </div>
                </div>

                {/* Product Tabs */}
                <div className="mt-12">
                    <ProductTabs
                        product={product}
                        selectedVariant={selectedVariant}
                    />
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            You may also like
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((relatedProduct) => (
                                <ProductCard key={relatedProduct.id} product={relatedProduct} user={user} />
                            ))}
                        </div>
                    </div>
                )}
            </Container>
        </div>
    );
}