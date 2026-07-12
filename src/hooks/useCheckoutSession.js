// hooks/useCheckoutSession.js
'use client';

import { useState, useEffect } from 'react';

const CHECKOUT_SESSION_KEY = 'bd_plaza_checkout_session';

export const useCheckoutSession = () => {
    const [checkoutSession, setCheckoutSession] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load session ONCE on mount
    useEffect(() => {
        if (typeof window !== 'undefined' && !isLoaded) {
            const saved = sessionStorage.getItem(CHECKOUT_SESSION_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setCheckoutSession(parsed);
                } catch (error) {
                    console.error('Error loading checkout session:', error);
                    sessionStorage.removeItem(CHECKOUT_SESSION_KEY);
                }
            }
            setIsLoaded(true);
        }
    }, [isLoaded]);

    const createBuyNowSession = (item, itemType) => {
        const session = {
            type: 'buy_now',
            itemType: itemType,
            item: item,
            createdAt: new Date().toISOString()
        };

        if (typeof window !== 'undefined') {
            sessionStorage.setItem(CHECKOUT_SESSION_KEY, JSON.stringify(session));
        }
        setCheckoutSession(session);
        return session;
    };

    const createCartCheckoutSession = (items) => {
        const session = {
            type: 'cart',
            items: items,
            createdAt: new Date().toISOString()
        };

        if (typeof window !== 'undefined') {
            sessionStorage.setItem(CHECKOUT_SESSION_KEY, JSON.stringify(session));
        }
        setCheckoutSession(session);
        return session;
    };

    const clearSession = () => {
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem(CHECKOUT_SESSION_KEY);
        }
        setCheckoutSession(null);
    };

    const getCheckoutItems = () => {
        if (!checkoutSession) return [];

        if (checkoutSession.type === 'buy_now') {
            return [checkoutSession.item];
        }

        return checkoutSession.items || [];
    };

    const getCheckoutTotal = () => {
        const items = getCheckoutItems();
        return items.reduce((total, item) => {
            const price = parseFloat(item.price || item.finalPrice || 0);
            const quantity = item.quantity || 1;
            return total + (price * quantity);
        }, 0);
    };

    return {
        checkoutSession,
        createBuyNowSession,
        createCartCheckoutSession,
        clearSession,
        getCheckoutItems,
        getCheckoutTotal,
        isBuyNow: checkoutSession?.type === 'buy_now',
        isCartCheckout: checkoutSession?.type === 'cart',
        isLoaded
    };
};