'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useStore } from './StoreProvider.jsx';
import ImageBox from './ImageBox.jsx';

export default function CartDrawer() {
  const { items, count, subtotal, money, cartOpen, setCartOpen, changeQty, removeItem } = useStore();

  useEffect(() => {
    if (!cartOpen) return;
    const onKey = e => e.key === 'Escape' && setCartOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [cartOpen, setCartOpen]);

  return (
    <>
      <div
        className={`cart-scrim${cartOpen ? ' open' : ''}`}
        onClick={() => setCartOpen(false)}
        aria-hidden={!cartOpen}
      />
      <aside className={`cart-drawer${cartOpen ? ' open' : ''}`} aria-hidden={!cartOpen} aria-label="Shopping cart">
        <div className="cart-drawer__head">
          <p className="cart-drawer__title">Cart{count > 0 ? ` (${count})` : ''}</p>
          <button className="cart-drawer__close" aria-label="Close cart" onClick={() => setCartOpen(false)}>×</button>
        </div>

        {items.length === 0 ? (
          <div className="cart-drawer__empty">
            <p>Your cart is empty.</p>
            <button className="btn btn--black" onClick={() => setCartOpen(false)}>Continue shopping</button>
          </div>
        ) : (
          <>
            <div className="cart-drawer__items">
              {items.map(item => (
                <div key={item.key} className="cart-item">
                  <div className="cart-item__media">
                    <ImageBox src={item.image} alt={item.name} label={item.name} />
                  </div>
                  <div className="cart-item__info">
                    <p className="cart-item__name">{item.name}</p>
                    <p className="cart-item__meta">{item.size === 'OS' ? 'One size' : `Size ${item.size}`}</p>
                    <div className="cart-item__qty">
                      <button aria-label="Decrease quantity" onClick={() => changeQty(item.key, -1)}>−</button>
                      <span>{item.qty}</span>
                      <button aria-label="Increase quantity" onClick={() => changeQty(item.key, 1)}>+</button>
                    </div>
                  </div>
                  <div className="cart-item__right">
                    <p className="cart-item__price">{money(item.price * item.qty)}</p>
                    <button className="cart-item__remove" onClick={() => removeItem(item.key)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-drawer__foot">
              <div className="cart-drawer__subtotal">
                <span>Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              <p className="cart-drawer__note">Shipping &amp; taxes calculated at checkout.</p>
              <Link href="/checkout" className="btn btn--black cart-drawer__checkout" onClick={() => setCartOpen(false)}>
                Checkout
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
