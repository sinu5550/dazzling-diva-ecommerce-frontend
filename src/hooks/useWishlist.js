// hooks/useWishlist.js - Updated for variant support
'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';
import toast from 'react-hot-toast';

// Event names for wishlist updates
const WISHLIST_EVENTS = {
    UPDATED: 'wishlistUpdated',
    ITEM_ADDED: 'wishlistItemAdded',
    ITEM_REMOVED: 'wishlistItemRemoved'
};

export const useWishlist = (user = null) => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    const isAuthenticated = !!user;
    const WISHLIST_STORAGE_KEY = 'dazzling_diva_wishlist';

    // Generate unique ID for variant products
    const getWishlistItemId = (productId, variantId = null) => {
        return variantId ? `${productId}-${variantId}` : productId;
    };

    // Normalize product data from API to ensure consistent structure
    const normalizeProductData = (product) => {
        // If product is already wrapped in a product object (from API)
        const productData = product.product || product;

        // Calculate discount price if discount exists
        let finalPrice = Number(productData.price) || 0;
        if (productData.discountValue && productData.discountType === 'Percentage') {
            const discountAmount = (finalPrice * productData.discountValue) / 100;
            finalPrice = finalPrice - discountAmount;
        }

        // Determine if it's a variant product
        const isVariant = productData.variantId || productData.variantAttributes;
        const wishlistId = getWishlistItemId(productData.id, productData.variantId);

        return {
            id: productData.id,
            wishlistId: wishlistId, // Unique ID for wishlist
            slug: productData.slug,
            sku: productData.sku,
            productName: productData.productName,
            price: Number(productData.price) || 0,
            discountPrice: finalPrice,
            quantity: Number(productData.quantity) || 0,
            images: productData.images || [],
            status: productData.status,
            subCategoryId: productData.subCategoryId,
            taxType: productData.taxType,
            tax: productData.tax,
            discountValue: productData.discountValue,
            discountType: productData.discountType,
            createdAt: productData.createdAt,
            // Variant specific fields
            ...(isVariant && {
                variantId: productData.variantId,
                variantAttributes: productData.variantAttributes,
                productType: 'variant',
                variantSku: productData.variantSku || productData.sku
            })
        };
    };

    // Emit event for wishlist changes
    const emitWishlistUpdate = (eventType, data = {}) => {
        const event = new CustomEvent(eventType, {
            detail: {
                count: wishlist.length,
                items: wishlist,
                ...data
            }
        });
        window.dispatchEvent(event);

        // Also update localStorage for cross-tab communication
        if (typeof window !== 'undefined') {
            localStorage.setItem('wishlist_last_update', Date.now().toString());
        }
    };

    // Load wishlist on mount
    useEffect(() => {
        loadWishlist();

        // Listen for storage events (cross-tab updates) and same-tab custom events
        const handleStorageChange = (e) => {
            if (e.key === 'wishlist_last_update') {
                loadWishlist();
            }
        };

        const handleWishlistUpdate = () => {
            loadWishlist();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener(WISHLIST_EVENTS.ITEM_ADDED, handleWishlistUpdate);
        window.addEventListener(WISHLIST_EVENTS.ITEM_REMOVED, handleWishlistUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener(WISHLIST_EVENTS.ITEM_ADDED, handleWishlistUpdate);
            window.removeEventListener(WISHLIST_EVENTS.ITEM_REMOVED, handleWishlistUpdate);
        };
    }, []);

    const loadWishlist = useCallback(async () => {
        setLoading(true);
        try {
            const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
            const localWishlist = stored ? JSON.parse(stored) : [];
            const normalizedData = localWishlist.map(normalizeProductData);

            setWishlist(normalizedData);
            emitWishlistUpdate(WISHLIST_EVENTS.UPDATED, { items: normalizedData });
        } catch (error) {
            console.warn('Error loading wishlist:', error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const formatProductForLocalStorage = (product) => {
        // Calculate discount price if discount exists
        let finalPrice = Number(product.price) || 0;
        if (product.discountValue && product.discountType === 'Percentage') {
            const discountAmount = (finalPrice * product.discountValue) / 100;
            finalPrice = finalPrice - discountAmount;
        }

        // Determine if it's a variant product
        const isVariant = product.variantId || product.variantAttributes;
        const wishlistId = getWishlistItemId(product.id, product.variantId);

        return {
            id: product.id,
            wishlistId: wishlistId, // Unique ID for wishlist
            slug: product.slug,
            sku: product.sku,
            productName: product.productName,
            price: Number(product.price) || 0,
            discountPrice: finalPrice,
            quantity: Number(product.quantity) || 0,
            images: product.images || [],
            status: product.status,
            subCategoryId: product.subCategoryId,
            tax: product.tax,
            discountValue: product.discountValue,
            discountType: product.discountType,
            addedAt: new Date().toISOString(),
            // Variant specific fields
            ...(isVariant && {
                variantId: product.variantId,
                variantAttributes: product.variantAttributes,
                productType: 'variant',
                variantSku: product.variantSku || product.sku
            })
        };
    };

    const addToWishlist = useCallback(async (product) => {
        try {
            // Generate unique wishlist ID
            const wishlistId = getWishlistItemId(product.id, product.variantId);

            const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
            const localWishlist = stored ? JSON.parse(stored) : [];

            const exists = localWishlist.some(item => item.wishlistId === wishlistId);
            if (exists) {
                toast.error('Already in wishlist');
                return false;
            }

            const newItem = formatProductForLocalStorage(product);
            const updatedWishlist = [newItem, ...localWishlist];

            localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updatedWishlist));
            const normalizedData = updatedWishlist.map(normalizeProductData);
            setWishlist(normalizedData);

            emitWishlistUpdate(WISHLIST_EVENTS.ITEM_ADDED, {
                product: newItem,
                items: normalizedData
            });
            toast.success('Added to wishlist');
            return true;
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            const message = error.message || 'Failed to add to wishlist';
            toast.error(message);
            return false;
        }
    }, []);

    // hooks/useWishlist.js - Add debugging logs to removeFromWishlist function
    const removeFromWishlist = useCallback(async (productId, variantId = null) => {
        try {
            const wishlistId = getWishlistItemId(productId, variantId)

            const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
            const localWishlist = stored ? JSON.parse(stored) : [];
            console.log('Local wishlist before removal:', localWishlist);

            const updatedWishlist = localWishlist.filter(item => item.wishlistId !== wishlistId);
            console.log('Local wishlist after removal:', updatedWishlist);

            localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updatedWishlist));
            const normalizedData = updatedWishlist.map(normalizeProductData);
            setWishlist(normalizedData);

            emitWishlistUpdate(WISHLIST_EVENTS.ITEM_REMOVED, {
                productId,
                variantId,
                items: normalizedData
            });
            return true;
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            const message = error.message || 'Failed to remove from wishlist';
            toast.error(message);
            return false;
        }
    }, []);

    const clearWishlist = useCallback(async () => {
        try {
            localStorage.removeItem(WISHLIST_STORAGE_KEY);
            setWishlist([]);
            emitWishlistUpdate(WISHLIST_EVENTS.UPDATED, { items: [] });
            toast.success('Wishlist cleared');
            return true;
        } catch (error) {
            console.error('Error clearing wishlist:', error);
            toast.error('Failed to clear wishlist');
            return false;
        }
    }, []);

    const isInWishlist = useCallback((productId, variantId = null) => {
        const wishlistId = getWishlistItemId(productId, variantId);
        return wishlist.some(item => item.wishlistId === wishlistId);
    }, [wishlist]);

    const getWishlistCount = useCallback(() => {
        return wishlist.length;
    }, [wishlist]);

    const toggleWishlist = useCallback(async (product) => {
        const inWishlist = isInWishlist(product.id, product.variantId);
        if (inWishlist) {
            return await removeFromWishlist(product.id, product.variantId);
        } else {
            return await addToWishlist(product);
        }
    }, [isInWishlist, addToWishlist, removeFromWishlist]);

    // Helper to find wishlist item
    const getWishlistItem = useCallback((productId, variantId = null) => {
        const wishlistId = getWishlistItemId(productId, variantId);
        return wishlist.find(item => item.wishlistId === wishlistId);
    }, [wishlist]);

    return {
        wishlist,
        loading,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        getWishlistCount,
        toggleWishlist,
        getWishlistItem,
        refreshWishlist: loadWishlist,
        wishlistCount: wishlist.length
    };
};