'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { formatMoney } from '../lib/currency.js';

const StoreContext = createContext(null);
const STORAGE_KEY = 'zed-cart';

export function StoreProvider({ children, currency = 'USD' }) {
  const [items, setItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load persisted cart once on mount (client only, avoids SSR mismatch).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  // Lock body scroll while an overlay is open.
  useEffect(() => {
    const open = cartOpen || searchOpen;
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [cartOpen, searchOpen]);

  const addItem = useCallback((product, size = 'OS', qty = 1) => {
    const key = `${product.id}-${size}`;
    setItems(prev => {
      const found = prev.find(i => i.key === key);
      if (found) return prev.map(i => (i.key === key ? { ...i, qty: i.qty + qty } : i));
      return [
        ...prev,
        { key, id: product.id, name: product.name, price: product.price, size, image: product.image, qty }
      ];
    });
    setSearchOpen(false);
    setCartOpen(true);
  }, []);

  const changeQty = useCallback((key, delta) => {
    setItems(prev =>
      prev
        .map(i => (i.key === key ? { ...i, qty: i.qty + delta } : i))
        .filter(i => i.qty > 0)
    );
  }, []);

  const removeItem = useCallback(key => setItems(prev => prev.filter(i => i.key !== key)), []);
  const clearCart = useCallback(() => setItems([]), []);

  const count = items.reduce((n, i) => n + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  // Currency-aware price formatter, shared by every storefront client component.
  const money = useCallback(n => formatMoney(n, currency), [currency]);

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      currency,
      money,
      cartOpen,
      searchOpen,
      setCartOpen,
      setSearchOpen,
      addItem,
      changeQty,
      removeItem,
      clearCart
    }),
    [items, count, subtotal, currency, money, cartOpen, searchOpen, addItem, changeQty, removeItem, clearCart]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
}
