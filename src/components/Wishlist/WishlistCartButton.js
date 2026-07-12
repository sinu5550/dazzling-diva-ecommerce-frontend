// components/wishlist/WishlistCartButton.js - Updated for variant support
'use client';

import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import toast from 'react-hot-toast';

const WishlistCartButton = ({
    product,
    user,
    onMoveComplete
}) => {
    const { addToCart, isInCart } = useCart(user);
    const { removeFromWishlist } = useWishlist(user);
    const [loading, setLoading] = useState(false);
    const [moved, setMoved] = useState(false);

    // Check if product is a variant
    const isVariantProduct = product.productType === 'variant' || product.variantId;

    // Check if already in cart with variantId for variant products
    const isAlreadyInCart = isInCart(product.id, product.variantId);

    const handleMoveToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (loading || moved || isAlreadyInCart) return;

        setLoading(true);
        try {
            // Prepare product for cart
            const cartProduct = {
                id: product.id,
                productId: product.id,
                slug: product.slug,
                productName: product.productName,
                price: product.discountPrice || product.price,
                originalPrice: product.price,
                images: product.images || [],
                quantity: product.quantity || 1,
                status: product.status,
                tax: product.tax,
                taxType: product.taxType,
                discountValue: product.discountValue,
                discountType: product.discountType,
                sku: product.sku,
                // Include variant info if applicable
                ...(isVariantProduct && {
                    variantId: product.variantId,
                    variantAttributes: product.variantAttributes,
                    productType: 'variant'
                })
            };

            // First add to cart
            const addedToCart = await addToCart(cartProduct, 1, product.variantId);

            if (addedToCart) {
                // Then remove from wishlist
                await removeFromWishlist(product.id, product.variantId);

                setMoved(true);
                toast.success("Moved to cart!");

                // Callback for parent component
                if (onMoveComplete) {
                    onMoveComplete(product.id, product.variantId);
                }
            } else {
                toast.error("Failed to add to cart");
            }
        } catch (error) {
            console.error("Error moving to cart:", error);
            toast.error("Failed to move to cart");
        } finally {
            setLoading(false);
        }
    };

    const isDisabled = product.quantity <= 0 || product.status === false || loading || moved || isAlreadyInCart;

    return (
        <button
            onClick={handleMoveToCart}
            disabled={isDisabled}
            className={`
                flex items-center justify-center gap-2 px-4 py-2 rounded transition-colors text-sm font-medium
                ${isDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : ''}
                ${moved || isAlreadyInCart ? 'bg-green-100 text-green-600 border border-green-600' : 'bg-primary text-black hover:bg-transparent border border-primary hover:text-primary-hover'}
            `}
            aria-label={moved || isAlreadyInCart ? "Already in cart" : "Move to cart"}
        >
            {loading ? (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></span>
            ) : moved || isAlreadyInCart ? (
                <>
                    <Check size={16} />
                    <span>In Cart</span>
                </>
            ) : (
                <>
                    <ShoppingCart size={16} />
                    <span>Move to Cart</span>
                </>
            )}
        </button>
    );
};

export default WishlistCartButton;