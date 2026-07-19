// hooks/useCart.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';
import toast from 'react-hot-toast';

const CART_EVENTS = {
    UPDATED: 'cartUpdated',
    ITEM_ADDED: 'cartItemAdded',
    ITEM_REMOVED: 'cartItemRemoved',
    QUANTITY_CHANGED: 'cartQuantityChanged'
};

export const useCart = (user = null) => {
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    const isAuthenticated = !!user;
    const CART_STORAGE_KEY = 'dazzling_diva_cart';

    // Get cart count
    const getCartCount = useCallback(() => {
        return cart.reduce((total, item) => total + (item.quantity || 1), 0);
    }, [cart]);

    // Get cart total
    const getCartTotal = useCallback(() => {
        return cart.reduce((total, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = item.quantity || 1;
            return total + (price * quantity);
        }, 0);
    }, [cart]);

    // Emit event for cart changes
    const emitCartUpdate = useCallback((eventType, data = {}) => {
        const currentCart = data.items || cart;
        const event = new CustomEvent(eventType, {
            detail: {
                count: currentCart.reduce((total, item) => total + (item.quantity || 1), 0),
                total: currentCart.reduce((total, item) => {
                    const price = parseFloat(item.price) || 0;
                    const quantity = item.quantity || 1;
                    return total + (price * quantity);
                }, 0),
                items: currentCart,
                ...data
            }
        });
        window.dispatchEvent(event);

        if (typeof window !== 'undefined') {
            localStorage.setItem('cart_last_update', Date.now().toString());
        }
    }, [cart]);

    // Load cart
    const loadCart = useCallback(async () => {
        setLoading(true);
        try {
            const stored = localStorage.getItem(CART_STORAGE_KEY);
            const localCart = stored ? JSON.parse(stored) : [];
            setCart(localCart);
        } catch (error) {
            console.warn('Error loading cart:', error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load cart on mount
    useEffect(() => {
        loadCart();
    }, []);

    // Listen for storage changes
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'cart_last_update') {
                loadCart();
            }
        };

        const handleCartUpdate = (e) => {
            loadCart();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener(CART_EVENTS.UPDATED, handleCartUpdate);
        window.addEventListener(CART_EVENTS.ITEM_ADDED, handleCartUpdate);
        window.addEventListener(CART_EVENTS.ITEM_REMOVED, handleCartUpdate);
        window.addEventListener(CART_EVENTS.QUANTITY_CHANGED, handleCartUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener(CART_EVENTS.UPDATED, handleCartUpdate);
            window.removeEventListener(CART_EVENTS.ITEM_ADDED, handleCartUpdate);
            window.removeEventListener(CART_EVENTS.ITEM_REMOVED, handleCartUpdate);
            window.removeEventListener(CART_EVENTS.QUANTITY_CHANGED, handleCartUpdate);
        };
    }, [loadCart]);

    // Helper to find cart item
    const findCartItem = useCallback((cartItems, productId, variantId = null) => {
        return cartItems.findIndex(item => {
            if (variantId && item.variantId) {
                // For variant products, match both productId and variantId
                return item.productId === productId && item.variantId === variantId;
            } else if (variantId === null && item.variantId) {
                // If looking for non-variant but item has variant, don't match
                return false;
            } else {
                // Check for regular product
                return item.productId === productId && !item.variantId;
            }
        });
    }, []);

    // Add to cart with variant support - FIXED IMAGES ISSUE
    const addToCart = useCallback(async (product, quantity = 1, variantId = null) => {
        try {
            const stored = localStorage.getItem(CART_STORAGE_KEY);
            const localCart = stored ? JSON.parse(stored) : [];

            // Use variantId if provided, otherwise use product.variantId
            const targetVariantId = variantId || product.variantId;

            const existingIndex = findCartItem(localCart, product.id, targetVariantId);

            // FIX: Ensure images are properly handled
            let imagesArray = [];

            if (Array.isArray(product.images)) {
                imagesArray = product.images;
            } else if (product.images) {
                // If images is a single string, convert to array
                imagesArray = [product.images];
            } else if (product.image) {
                // Fallback to image property if images doesn't exist
                imagesArray = [product.image];
            } else {
                // Default empty array
                imagesArray = [];
            }

            const cartItem = {
                id: product.id,
                productId: product.id,
                slug: product.slug,
                productName: product.productName || product.name,
                name: product.productName || product.name,
                price: product.price || 0,
                originalPrice: product.originalPrice || product.price || 0,
                images: imagesArray, // Fixed: Always array
                quantity: quantity,
                status: product.status,
                tax: product.tax,
                taxType: product.taxType,
                discountValue: product.discountValue,
                discountType: product.discountType,
                sku: product.sku,
                // Include variant details
                ...(targetVariantId && {
                    variantId: targetVariantId,
                    variantAttributes: product.variantAttributes,
                    productType: 'variant'
                }),
                // Include additional properties if they exist
                ...(product.type && { type: product.type }),
                ...(product.isBundle && { isBundle: product.isBundle })
            };

            if (existingIndex > -1) {
                // Update quantity if item already exists
                localCart[existingIndex].quantity += quantity;
            } else {
                // Add new item
                localCart.push(cartItem);
            }

            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(localCart));
            setCart(localCart);

            // Emit event with new cart
            emitCartUpdate(CART_EVENTS.ITEM_ADDED, {
                product: cartItem,
                quantity,
                items: localCart
            });

            return true;
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add to cart');
            return false;
        }
    }, [emitCartUpdate, findCartItem]);

    // Remove from cart with variant support
    const removeFromCart = useCallback(async (productId, variantId = null) => {
        try {
            const stored = localStorage.getItem(CART_STORAGE_KEY);
            const localCart = stored ? JSON.parse(stored) : [];

            const updatedCart = localCart.filter(item => {
                if (variantId && item.variantId) {
                    // Remove specific variant
                    return !(item.productId === productId && item.variantId === variantId);
                } else if (variantId === null && item.variantId) {
                    // Keep variants if we're removing non-variant product
                    return true;
                } else {
                    // Remove non-variant product
                    return item.productId !== productId;
                }
            });

            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart));
            setCart(updatedCart);

            emitCartUpdate(CART_EVENTS.ITEM_REMOVED, {
                productId,
                variantId,
                items: updatedCart
            });

            toast.success('Removed from cart');
            return true;
        } catch (error) {
            console.error('Error removing from cart:', error);
            toast.error('Failed to remove from cart');
            return false;
        }
    }, [emitCartUpdate]);

    // Update quantity with variant support
    const updateQuantity = useCallback(async (productId, quantity, variantId = null) => {
        if (quantity < 1) {
            return removeFromCart(productId, variantId);
        }

        try {
            const stored = localStorage.getItem(CART_STORAGE_KEY);
            const localCart = stored ? JSON.parse(stored) : [];
            const itemIndex = findCartItem(localCart, productId, variantId);

            if (itemIndex > -1) {
                localCart[itemIndex].quantity = quantity;
                localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(localCart));
                setCart(localCart);

                emitCartUpdate(CART_EVENTS.QUANTITY_CHANGED, {
                    productId,
                    variantId,
                    quantity,
                    items: localCart
                });
            }
            return true;
        } catch (error) {
            console.error('Error updating quantity:', error);
            toast.error('Failed to update quantity');
            return false;
        }
    }, [removeFromCart, emitCartUpdate, findCartItem]);

    // Clear cart
    const clearCart = useCallback(async () => {
        try {
            if (typeof window !== 'undefined') {
                localStorage.removeItem(CART_STORAGE_KEY);
            }

            setCart([]);
            emitCartUpdate(CART_EVENTS.UPDATED, { items: [] });
            toast.success('Cart cleared');

            return true;
        } catch (error) {
            console.error('Error clearing cart:', error);

            if (typeof window !== 'undefined') {
                localStorage.removeItem(CART_STORAGE_KEY);
            }
            setCart([]);
            emitCartUpdate(CART_EVENTS.UPDATED, { items: [] });

            toast.success('Cart cleared');
            return false;
        }
    }, [emitCartUpdate]);

    // Check if item is in cart with variant support
    const isInCart = useCallback((productId, variantId = null) => {
        if (!productId) return false;

        return cart.some(item => {
            if (variantId && item.variantId) {
                // Check for specific variant
                return item.productId === productId && item.variantId === variantId;
            } else if (variantId === null && item.variantId) {
                // If looking for non-variant but item has variant, don't match
                return false;
            } else {
                // Check for regular product
                return item.productId === productId && !item.variantId;
            }
        });
    }, [cart]);

    // Get item from cart
    const getCartItem = useCallback((productId, variantId = null) => {
        return cart.find(item => {
            if (variantId && item.variantId) {
                return item.productId === productId && item.variantId === variantId;
            } else if (variantId === null) {
                return item.productId === productId && !item.variantId;
            }
            return false;
        });
    }, [cart]);

    return {
        cart,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartCount,
        getCartTotal,
        isInCart,
        getCartItem,
        refreshCart: loadCart
    };
};