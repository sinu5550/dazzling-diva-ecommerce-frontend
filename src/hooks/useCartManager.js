// hooks/useCartManager.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCart } from './useCart';
import { useBundleCart } from './useBundleCart';

export const useCartManager = (user = null) => {
    const {
        cart: regularCart,
        clearCart: clearRegularCart,
        addToCart: addRegularToCart,
        removeFromCart: removeRegularFromCart,
        updateQuantity: updateRegularQuantity,
        getCartTotal: getRegularTotal,
        getCartCount: getRegularCount,
        loading: regularLoading,
        isInCart: isRegularInCart,
        getCartItem // Add this to get specific variant item
    } = useCart(user);

    const {
        bundleCart,
        clearBundleCart,
        addBundleToCart,
        removeBundleFromCart,
        getBundleCartTotal,
        getBundleCartCount,
        isBundleInCart,
        isInitialized: bundleInitialized
    } = useBundleCart(user);

    const [cartType, setCartType] = useState('empty');

    // Determine cart type
    useEffect(() => {
        const hasRegular = regularCart.length > 0;
        const hasBundle = bundleCart.length > 0;

        if (hasRegular && hasBundle) {
            setCartType('mixed');
        } else if (hasRegular) {
            setCartType('regular');
        } else if (hasBundle) {
            setCartType('bundle');
        } else {
            setCartType('empty');
        }
    }, [regularCart, bundleCart]);

    // Clear all carts
    const clearAllCarts = useCallback(async () => {
        try {
            await clearRegularCart();
            clearBundleCart();
            console.log('Cleared all carts');
            return true;
        } catch (error) {
            console.error('Error clearing all carts:', error);
            return false;
        }
    }, [clearRegularCart, clearBundleCart]);

    // Remove item from appropriate cart - FIXED for variant products
    const removeItem = useCallback(async (itemId, itemType, variantId = null) => {
        try {
            if (itemType === 'regular') {
                // For regular items, find if it's a variant product
                const itemToRemove = getCartItem(itemId, variantId);

                if (itemToRemove?.variantId) {
                    // If it's a variant product, remove using both productId and variantId
                    return await removeRegularFromCart(itemId, itemToRemove.variantId);
                } else {
                    // Regular non-variant product
                    return await removeRegularFromCart(itemId);
                }
            } else if (itemType === 'bundle') {
                return removeBundleFromCart(itemId);
            }
            return false;
        } catch (error) {
            console.error('Error removing item:', error);
            return false;
        }
    }, [removeRegularFromCart, removeBundleFromCart, getCartItem]);

    // Update quantity for regular products - FIXED for variant products
    const updateItemQuantity = useCallback(async (itemId, quantity, variantId = null) => {
        try {
            // For variant products, we need to pass the variantId
            const itemToUpdate = getCartItem(itemId, variantId);

            if (itemToUpdate?.variantId) {
                // Update variant product quantity
                return await updateRegularQuantity(itemId, quantity, itemToUpdate.variantId);
            } else {
                // Update regular product quantity
                return await updateRegularQuantity(itemId, quantity);
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            return false;
        }
    }, [updateRegularQuantity, getCartItem]);

    // Get all items combined
    const getAllCartItems = useCallback(() => {
        const regularItems = regularCart.map(item => ({
            ...item,
            type: 'regular',
            isBundle: false,
            id: item.productId || item.id,
            productName: item.productName || item.name,
            // Add variant info to ID for uniqueness
            uniqueId: item.variantId ? `${item.productId}-${item.variantId}` : item.productId || item.id
        }));

        const bundleItems = bundleCart.map(item => ({
            ...item,
            type: 'bundle',
            isBundle: true,
            productName: item.name,
            images: [item.image],
            id: item.id,
            uniqueId: item.id
        }));

        return [...regularItems, ...bundleItems];
    }, [regularCart, bundleCart]);

    // Get total combined price
    const getCombinedTotal = useCallback(() => {
        const regularTotal = getRegularTotal();
        const bundleTotal = getBundleCartTotal();
        return regularTotal + bundleTotal;
    }, [regularCart, bundleCart]);

    // Get total item count
    const getCombinedCount = useCallback(() => {
        const regularCount = getRegularCount();
        const bundleCount = getBundleCartCount();
        return regularCount + bundleCount;
    }, [regularCart, bundleCart]);

    // Check if any cart has items
    const hasItems = useCallback(() => {
        return regularCart.length > 0 || bundleCart.length > 0;
    }, [regularCart, bundleCart]);

    // Check if specific item is in cart
    const isItemInCart = useCallback((itemId, itemType, variantId = null) => {
        if (itemType === 'regular') {
            return isRegularInCart(itemId, variantId);
        } else if (itemType === 'bundle') {
            return isBundleInCart(itemId);
        }
        return false;
    }, [regularCart, bundleCart]);

    return {
        // State
        regularCart,
        bundleCart,
        cartType,
        loading: regularLoading,

        // Actions
        addToCart: addRegularToCart,
        addBundleToCart,
        removeItem,
        updateItemQuantity,
        clearRegularCart,
        clearBundleCart,
        clearAllCarts,

        // Getters
        getAllCartItems,
        getCombinedTotal,
        getCombinedCount,
        hasItems,
        isItemInCart,

        getRegularTotal,
        getBundleCartTotal,
        getRegularCount,
        getBundleCartCount,
        getCartItem
    };
};