// hooks/useBundleCart.js
'use client';

import { useState, useEffect, useCallback } from 'react';

export const useBundleCart = (user = null) => {
    
    const [bundleCart, setBundleCart] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);

    const BUNDLE_CART_KEY = 'bd_plaza_bundle_cart';
    const BUNDLE_LAST_UPDATE_KEY = 'bundle_cart_last_update';

    // Emit bundle cart update event
    const emitBundleCartUpdate = useCallback((cart) => {
        const event = new CustomEvent('bundleCartUpdated', {
            detail: {
                count: cart.length,
                items: cart
            }
        });
        window.dispatchEvent(event);
    }, []);

    // Load from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem(BUNDLE_CART_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    console.log('Loading bundle cart from localStorage:', parsed);
                    setBundleCart(parsed);
                    emitBundleCartUpdate(parsed);
                }
            } catch (error) {
                console.error('Error loading bundle cart:', error);
                localStorage.removeItem(BUNDLE_CART_KEY);
            }
            setIsInitialized(true);
        }
    }, [emitBundleCartUpdate]);

    // Save to localStorage
    const saveToLocalStorage = useCallback((cart) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(BUNDLE_CART_KEY, JSON.stringify(cart));
            localStorage.setItem(BUNDLE_LAST_UPDATE_KEY, Date.now().toString());
            emitBundleCartUpdate(cart);
        }
    }, [emitBundleCartUpdate]);

    // Add bundle to cart
    const addBundleToCart = useCallback((bundle, options = {}) => {
        if (!bundle || !bundle.id) {
            console.error('Invalid bundle data');
            return false;
        }

        console.log('Adding bundle to cart:', bundle);

        setBundleCart(prev => {
            const existingIndex = prev.findIndex(item => item.id === bundle.id);

            if (existingIndex >= 0) {
                console.log('Bundle already in cart');
                return prev;
            }

            const newCart = [...prev, createBundleCartItem(bundle)];
            saveToLocalStorage(newCart);
            return newCart;
        });

        return true;
    }, [saveToLocalStorage]);

    // Create bundle cart item
    const createBundleCartItem = (bundle) => {
        return {
            id: bundle.id,
            name: bundle.name || 'Unnamed Bundle',
            slug: bundle.slug,
            image: bundle.image || '/images/bundle-placeholder.jpg',
            price: parseFloat(bundle.finalPrice || bundle.price || 0),
            quantity: 1,
            sku: bundle.sku || `BUNDLE-${bundle.id}`,
            type: 'bundle',
            isBundle: true,
            bundleItems: bundle.bundleItems || [],
            discountAmount: bundle.discountAmount || 0,
            totalSavings: bundle.totalSavings || 0,
            savingsPercentage: bundle.savingsPercentage || 0,
            originalPrice: parseFloat(bundle.price || bundle.finalPrice || 0),
            addedAt: new Date().toISOString()
        };
    };

    // Remove bundle from cart
    const removeBundleFromCart = useCallback((bundleId) => {
        console.log('Removing bundle from cart:', bundleId);
        setBundleCart(prev => {
            const newCart = prev.filter(item => item.id !== bundleId);
            saveToLocalStorage(newCart);
            return newCart;
        });
        return true;
    }, [saveToLocalStorage]);

    // Clear bundle cart
    const clearBundleCart = useCallback(() => {
        console.log('Clearing bundle cart');
        setBundleCart([]);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(BUNDLE_CART_KEY);
            localStorage.removeItem(BUNDLE_LAST_UPDATE_KEY);
            emitBundleCartUpdate([]);
        }
    }, [emitBundleCartUpdate]);

    // Get bundle cart total
    const getBundleCartTotal = useCallback(() => {
        return bundleCart.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);
    }, [bundleCart]);

    // Get bundle cart count
    const getBundleCartCount = useCallback(() => {
        return bundleCart.length;
    }, [bundleCart]);

    // Check if bundle is in cart
    const isBundleInCart = useCallback((bundleId) => {
        return bundleCart.some(item => item.id === bundleId);
    }, [bundleCart]);

    return {
        bundleCart,
        addBundleToCart,
        removeBundleFromCart,
        getBundleCartTotal,
        getBundleCartCount,
        clearBundleCart,
        isBundleInCart,
        isInitialized
    };
};