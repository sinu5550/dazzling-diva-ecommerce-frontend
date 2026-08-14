// context/CartDrawerContext.jsx
'use client';

import React, { createContext, useContext, useState } from 'react';
import MobileCartDrawer from '@/components/Cart/MobileCartDrawer';

const CartDrawerContext = createContext({
  isCartDrawerOpen: false,
  openCartDrawer: () => {},
  closeCartDrawer: () => {},
});

export function CartDrawerProvider({ children }) {
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  const openCartDrawer = () => setIsCartDrawerOpen(true);
  const closeCartDrawer = () => setIsCartDrawerOpen(false);

  return (
    <CartDrawerContext.Provider
      value={{ isCartDrawerOpen, openCartDrawer, closeCartDrawer }}
    >
      {children}
      <MobileCartDrawer
        isOpen={isCartDrawerOpen}
        onClose={closeCartDrawer}
      />
    </CartDrawerContext.Provider>
  );
}

export function useCartDrawer() {
  return useContext(CartDrawerContext);
}
