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
        window.addEventListener(WISHLIST_EVENTS.UPDATED, handleWishlistUpdate);
        window.addEventListener(WISHLIST_EVENTS.ITEM_ADDED, handleWishlistUpdate);
        window.addEventListener(WISHLIST_EVENTS.ITEM_REMOVED, handleWishlistUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener(WISHLIST_EVENTS.UPDATED, handleWishlistUpdate);
            window.removeEventListener(WISHLIST_EVENTS.ITEM_ADDED, handleWishlistUpdate);
            window.removeEventListener(WISHLIST_EVENTS.ITEM_REMOVED, handleWishlistUpdate);
        };
    }, []);

    const loadWishlist = useCallback(async () => {
        setLoading(true);
        try {
            if (isAuthenticated) {
                const response = await apiClient('/api/wishlist');
                const apiData = response.data || [];

                // If API returns wishlist items with product nested
                let normalizedData;
                if (apiData.length > 0 && apiData[0].product) {
                    normalizedData = apiData.map(item => normalizeProductData(item.product));
                } else {
                    normalizedData = apiData.map(normalizeProductData);
                }

                setWishlist(normalizedData);
                emitWishlistUpdate(WISHLIST_EVENTS.UPDATED, { items: normalizedData });
            } else {
                const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
                const localWishlist = stored ? JSON.parse(stored) : [];
                const normalizedData = localWishlist.map(normalizeProductData);

                setWishlist(normalizedData);
                emitWishlistUpdate(WISHLIST_EVENTS.UPDATED, { items: normalizedData });
            }
        } catch (error) {
            console.warn('Error loading wishlist (falling back to localStorage):', error.message);

            const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
            const localWishlist = stored ? JSON.parse(stored) : [];
            const normalizedData = localWishlist.map(normalizeProductData);

            setWishlist(normalizedData);
            emitWishlistUpdate(WISHLIST_EVENTS.UPDATED, { items: normalizedData });

            if (isAuthenticated) {
                toast.error('Failed to sync wishlist with server');
            }
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

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

            if (isAuthenticated) {
                const payload = {
                    productId: product.id,
                    ...(product.variantId && { variantId: product.variantId })
                };

                const response = await apiClient('/api/wishlist', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });

                // Handle different API response structures
                let productData;
                if (response.data?.product) {
                    productData = normalizeProductData(response.data.product);
                } else if (response.data) {
                    productData = normalizeProductData(response.data);
                } else {
                    productData = normalizeProductData(product);
                }

                setWishlist(prev => {
                    const exists = prev.some(item => item.wishlistId === wishlistId);
                    if (exists) {
                        toast.error('Already in wishlist');
                        return prev;
                    }
                    const newWishlist = [productData, ...prev];
                    emitWishlistUpdate(WISHLIST_EVENTS.ITEM_ADDED, {
                        product: productData,
                        items: newWishlist
                    });
                    return newWishlist;
                });
                toast.success('Added to wishlist');
                return true;
            } else {
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
            }
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            const message = error.response?.data?.message || 'Failed to add to wishlist';
            toast.error(message);
            return false;
        }
    }, [isAuthenticated]);

    // hooks/useWishlist.js - Add debugging logs to removeFromWishlist function
    const removeFromWishlist = useCallback(async (productId, variantId = null) => {
        try {
            const wishlistId = getWishlistItemId(productId, variantId)

            if (isAuthenticated) {
            
                await apiClient(`/api/wishlist/${productId}`, {
                    method: 'DELETE',
                    body: JSON.stringify({ variantId })
                });

                setWishlist(prev => {
                    console.log('Current wishlist before removal:', prev);
                    const newWishlist = prev.filter(item => item.wishlistId !== wishlistId);
                    console.log('New wishlist after removal:', newWishlist);

                    emitWishlistUpdate(WISHLIST_EVENTS.ITEM_REMOVED, {
                        productId,
                        variantId,
                        items: newWishlist
                    });
                    return newWishlist;
                });
             
            } else {
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
            }
            return true;
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            console.error('Error details:', {
                productId,
                variantId,
                errorMessage: error.message,
                errorResponse: error.response?.data
            });
            const message = error.response?.data?.message || 'Failed to remove from wishlist';
            toast.error(message);
            return false;
        }
    }, [isAuthenticated]);

    const clearWishlist = useCallback(async () => {
        try {
            if (isAuthenticated) {
                await apiClient('/api/wishlist', {
                    method: 'DELETE'
                });
                setWishlist([]);
                emitWishlistUpdate(WISHLIST_EVENTS.UPDATED, { items: [] });
                toast.success('Wishlist cleared');
            } else {
                localStorage.removeItem(WISHLIST_STORAGE_KEY);
                setWishlist([]);
                emitWishlistUpdate(WISHLIST_EVENTS.UPDATED, { items: [] });
                toast.success('Wishlist cleared');
            }
            return true;
        } catch (error) {
            console.error('Error clearing wishlist:', error);
            toast.error('Failed to clear wishlist');
            return false;
        }
    }, [isAuthenticated]);

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