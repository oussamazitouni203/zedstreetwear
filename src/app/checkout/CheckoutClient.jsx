'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useStore } from '../../components/StoreProvider.jsx';
import ImageBox from '../../components/ImageBox.jsx';
import { createOrder, getShippingOptions } from './actions.js';
import { WILAYAS } from '../../lib/regions.js';

// Fallback rates used only when no shipping zones are configured in admin.
const FREE_SHIPPING_OVER = 100;
const SHIPPING_FLAT = 8;

// Custom, site-styled dropdown (native <select> menus can't be themed).
function StateDropdown({ value, onChange, options, invalid }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = e => {
      if (e.type === 'keydown' ? e.key === 'Escape' : !ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  return (
    <div className="state-select" ref={ref}>
      <button
        type="button"
        className={`state-select__trigger${open ? ' open' : ''}${value ? '' : ' placeholder'}${invalid ? ' invalid' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {value || 'Select a state'}
        <span className="state-select__chevron" />
      </button>
      {open && (
        <ul className="state-select__menu" role="listbox">
          {options.map(s => (
            <li key={s}>
              <button
                type="button"
                role="option"
                aria-selected={s === value}
                className={`state-select__option${s === value ? ' selected' : ''}`}
                onClick={() => {
                  onChange(s);
                  setOpen(false);
                }}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function CheckoutClient() {
  const { items, count, subtotal, clearCart } = useStore();
  const [order, setOrder] = useState(null);
  const [name, setName] = useState('');
  const [state, setState] = useState('');
  const [stateError, setStateError] = useState(false);
  const [placing, setPlacing] = useState(false);

  // Shipping options for the chosen wilaya (from admin-configured zones).
  const [shipData, setShipData] = useState(null); // { configured, options } | null
  const [shipMethodId, setShipMethodId] = useState('');
  const [loadingShip, setLoadingShip] = useState(false);

  useEffect(() => {
    if (!state || count === 0) {
      setShipData(null);
      return;
    }
    let cancelled = false;
    setLoadingShip(true);
    getShippingOptions({ region: state, subtotal, items: items.map(i => ({ id: i.id, qty: i.qty })) })
      .then(res => {
        if (cancelled) return;
        setShipData(res);
        const opts = res?.options || [];
        const cheapest = [...opts].sort((a, b) => a.cost - b.cost)[0];
        setShipMethodId(cheapest ? cheapest.id : '');
      })
      .catch(() => !cancelled && setShipData({ configured: false, options: [] }))
      .finally(() => !cancelled && setLoadingShip(false));
    return () => {
      cancelled = true;
    };
  }, [state, subtotal, count]); // eslint-disable-line react-hooks/exhaustive-deps

  const configured = shipData?.configured;
  const options = shipData?.options || [];
  const selected = options.find(o => o.id === shipMethodId) || null;

  // Resolve the shipping cost: unknown until a wilaya is chosen; admin zones win;
  // otherwise fall back to the legacy flat/free logic.
  let shipping = null;
  if (state) {
    if (configured) shipping = options.length ? (selected || options[0]).cost : null;
    else shipping = subtotal >= FREE_SHIPPING_OVER || subtotal === 0 ? 0 : SHIPPING_FLAT;
  }
  const noService = configured && options.length === 0;
  const total = subtotal + (shipping || 0);

  const placeOrder = async e => {
    e.preventDefault();
    if (!state) {
      setStateError(true);
      return;
    }
    if (noService) {
      alert('Sorry, we don’t ship to your area yet.');
      return;
    }
    const chosen = selected || options[0] || null;
    const shipCost = shipping == null ? 0 : shipping;
    setPlacing(true);
    try {
      const placed = await createOrder({
        items,
        total: subtotal + shipCost,
        customerName: name,
        shippingRegion: state,
        shippingMethod: chosen ? chosen.title : null,
        shippingCost: shipCost
      });
      setOrder(placed);
      clearCart();
    } catch (err) {
      alert(err?.message || 'Could not place the order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  // Confirmation screen.
  if (order) {
    return (
      <main className="checkout">
        <div className="container checkout__confirm">
          <p className="eyebrow">Order confirmed</p>
          <h1 className="checkout__confirm-title">Thank you.</h1>
          <p className="checkout__confirm-text">
            Your order <strong>{order.number}</strong> is in. A confirmation is on its way to your inbox.
          </p>
          <p className="checkout__confirm-total">Total charged — ${order.total}</p>
          <Link href="/shop" className="btn btn--black">Continue shopping</Link>
        </div>
      </main>
    );
  }

  // Empty-cart guard.
  if (count === 0) {
    return (
      <main className="checkout">
        <div className="container checkout__empty">
          <p className="eyebrow">Checkout</p>
          <h1 className="checkout__empty-title">Your cart is empty</h1>
          <p className="checkout__empty-text">Add a few pieces before heading to checkout.</p>
          <Link href="/shop" className="btn btn--black">Browse the shop</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout">
      <div className="container checkout__head">
        <p className="eyebrow">Almost there</p>
        <h1 className="checkout__title">Checkout</h1>
      </div>

      <form className="container checkout__grid" onSubmit={placeOrder}>
        <div className="checkout__form">
          <section className="checkout__section">
            <h2 className="checkout__section-title">Shipping details</h2>
            <div className="checkout__field">
              <label htmlFor="co-name">Full name</label>
              <input
                id="co-name"
                type="text"
                placeholder="Full name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div className="checkout__row">
              <div className="checkout__field">
                <label htmlFor="co-country">Country</label>
                <div className="checkout__locked" id="co-country" aria-disabled="true">
                  <span>Algeria</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Locked">
                    <rect x="4" y="11" width="16" height="10" rx="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                </div>
              </div>
              <div className="checkout__field">
                <label>State</label>
                <StateDropdown
                  value={state}
                  options={WILAYAS}
                  invalid={stateError}
                  onChange={v => {
                    setState(v);
                    setStateError(false);
                  }}
                />
                {stateError && <span className="checkout__error">Please select a state.</span>}
              </div>
            </div>
            <div className="checkout__field">
              <label htmlFor="co-phone">Phone number</label>
              <input id="co-phone" type="tel" placeholder="+213 ..." required />
            </div>
          </section>

          {state && configured && (
            <section className="checkout__section">
              <h2 className="checkout__section-title">Shipping method</h2>
              {loadingShip ? (
                <p className="checkout__ship-loading">Checking rates…</p>
              ) : options.length === 0 ? (
                <p className="checkout__error">Sorry, we don’t ship to {state} yet.</p>
              ) : (
                <div className="checkout__ship-methods">
                  {options.map(o => (
                    <label key={o.id} className={`checkout__ship-method${shipMethodId === o.id ? ' on' : ''}`}>
                      <input
                        type="radio"
                        name="shipmethod"
                        checked={shipMethodId === o.id}
                        onChange={() => setShipMethodId(o.id)}
                      />
                      <span className="checkout__ship-method__title">{o.title}</span>
                      <span className="checkout__ship-method__cost">{o.cost === 0 ? 'Free' : `$${o.cost}`}</span>
                    </label>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        <aside className="checkout__summary">
          <h2 className="checkout__section-title">
            Order summary <span className="checkout__summary-count">{count} {count === 1 ? 'item' : 'items'}</span>
          </h2>
          <div className="checkout__items">
            {items.map(item => (
              <div key={item.key} className="checkout-item">
                <div className="checkout-item__media">
                  <ImageBox src={item.image} alt={item.name} label={item.name} />
                </div>
                <div className="checkout-item__info">
                  <p className="checkout-item__name">{item.name}</p>
                  <p className="checkout-item__meta">{item.size === 'OS' ? 'One size' : `Size ${item.size}`}</p>
                  <p className="checkout-item__qty">Qty: {item.qty}</p>
                </div>
                <p className="checkout-item__price">${item.price * item.qty}</p>
              </div>
            ))}
          </div>

          <div className="checkout__totals">
            <div className="checkout__line">
              <span>Subtotal ({count} {count === 1 ? 'item' : 'items'})</span>
              <span>${subtotal}</span>
            </div>
            <div className="checkout__line">
              <span>Shipping</span>
              <span>{shipping == null ? '—' : shipping === 0 ? 'Free' : `$${shipping}`}</span>
            </div>
            <div className="checkout__line checkout__line--total">
              <span>Total</span>
              <span>${shipping == null ? subtotal : total}</span>
            </div>
          </div>

          <button type="submit" className="btn btn--black checkout__place" disabled={placing || loadingShip || noService}>
            {placing ? 'Placing order…' : noService ? 'Unavailable in your area' : 'Place order'}
          </button>
          <p className="checkout__disclaimer">This is a demo store — no payment is taken and no order is shipped.</p>
        </aside>
      </form>
    </main>
  );
}
