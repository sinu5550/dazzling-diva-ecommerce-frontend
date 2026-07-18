// hooks/useHeaderCounts.js
'use client';

import { useState, useEffect } from 'react';

// Event names
const WISHLIST_EVENTS = {
    UPDATED: 'wishlistUpdated',
    ITEM_ADDED: 'wishlistItemAdded',
    ITEM_REMOVED: 'wishlistItemRemoved'
};

const CART_EVENTS = {
    UPDATED: 'cartUpdated',
    ITEM_ADDED: 'cartItemAdded',
    ITEM_REMOVED: 'cartItemRemoved',
    QUANTITY_CHANGED: 'cartQuantityChanged'
};

const BUNDLE_CART_EVENTS = {
    UPDATED: 'bundleCartUpdated'
};

export const useHeaderCounts = (user = null) => {
    const [wishlistCount, setWishlistCount] = useState(0);
    const [cartCount, setCartCount] = useState(0);

    // Function to calculate total cart count (count unique products, not quantities)
    const calculateTotalCartCount = () => {
        let regularProductCount = 0;
        let bundleProductCount = 0;

        // Get regular cart count (number of unique products)
        try {
            const regularCart = localStorage.getItem('dazzling_diva_cart');
            if (regularCart) {
                const parsed = JSON.parse(regularCart);
                regularProductCount = parsed.length; 
            }
        } catch (error) {
            console.error('Error reading regular cart:', error);
        }

        // Get bundle cart count (number of unique bundles)
        try {
            const bundleCart = localStorage.getItem('dazzling_diva_bundle_cart');
            if (bundleCart) {
                const parsed = JSON.parse(bundleCart);
                bundleProductCount = parsed.length; // Count number of unique bundles
            }
        } catch (error) {
            console.error('Error reading bundle cart:', error);
        }

        return regularProductCount + bundleProductCount;
    };

    // Function to calculate wishlist count
    const calculateWishlistCount = () => {
        try {
            const wishlist = localStorage.getItem('dazzling_diva_wishlist');
            if (wishlist) {
                const parsed = JSON.parse(wishlist);
                return Array.isArray(parsed) ? parsed.length : 0;
            }
        } catch (error) {
            console.error('Error reading wishlist:', error);
        }
        return 0;
    };

    // Initialize counts on mount
    useEffect(() => {
        setCartCount(calculateTotalCartCount());
        setWishlistCount(calculateWishlistCount());
    }, []);

    // Listen for wishlist events
    useEffect(() => {
        const handleWishlistUpdate = (event) => {
            const newCount = event.detail?.items?.length || calculateWishlistCount();
            setWishlistCount(newCount);
        };

        const handleWishlistItemAdded = () => {
            setWishlistCount(calculateWishlistCount());
        };

        const handleWishlistItemRemoved = () => {
            setWishlistCount(calculateWishlistCount());
        };

        // Add wishlist event listeners
        window.addEventListener(WISHLIST_EVENTS.UPDATED, handleWishlistUpdate);
        window.addEventListener(WISHLIST_EVENTS.ITEM_ADDED, handleWishlistItemAdded);
        window.addEventListener(WISHLIST_EVENTS.ITEM_REMOVED, handleWishlistItemRemoved);

        // Cleanup
        return () => {
            window.removeEventListener(WISHLIST_EVENTS.UPDATED, handleWishlistUpdate);
            window.removeEventListener(WISHLIST_EVENTS.ITEM_ADDED, handleWishlistItemAdded);
            window.removeEventListener(WISHLIST_EVENTS.ITEM_REMOVED, handleWishlistItemRemoved);
        };
    }, []);

    // Listen for cart events (regular + bundle)
    useEffect(() => {
        const handleCartUpdate = () => {
            setCartCount(calculateTotalCartCount());
        };

        // Regular cart events
        window.addEventListener(CART_EVENTS.UPDATED, handleCartUpdate);
        window.addEventListener(CART_EVENTS.ITEM_ADDED, handleCartUpdate);
        window.addEventListener(CART_EVENTS.ITEM_REMOVED, handleCartUpdate);
        window.addEventListener(CART_EVENTS.QUANTITY_CHANGED, handleCartUpdate);

        // Bundle cart events
        window.addEventListener(BUNDLE_CART_EVENTS.UPDATED, handleCartUpdate);

        // Listen for storage changes (cross-tab updates)
        const handleStorageChange = (e) => {
            if (
                e.key === 'dazzling_diva_cart' ||
                e.key === 'dazzling_diva_bundle_cart' ||
                e.key === 'dazzling_diva_wishlist'
            ) {
                setCartCount(calculateTotalCartCount());
                setWishlistCount(calculateWishlistCount());
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Cleanup
        return () => {
            window.removeEventListener(CART_EVENTS.UPDATED, handleCartUpdate);
            window.removeEventListener(CART_EVENTS.ITEM_ADDED, handleCartUpdate);
            window.removeEventListener(CART_EVENTS.ITEM_REMOVED, handleCartUpdate);
            window.removeEventListener(CART_EVENTS.QUANTITY_CHANGED, handleCartUpdate);
            window.removeEventListener(BUNDLE_CART_EVENTS.UPDATED, handleCartUpdate);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return {
        wishlistCount,
        cartCount
    };
};