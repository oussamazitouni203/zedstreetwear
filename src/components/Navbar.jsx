'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from './StoreProvider.jsx';

export default function Navbar() {
  const { count, setSearchOpen, setCartOpen } = useStore();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Transparent over the hero at the top; solid once scrolled. Re-checks on
  // route change (Next resets scroll to the top on navigation).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  // Close the mobile menu on route change.
  useEffect(() => setMenuOpen(false), [pathname]);

  // Lock scroll + close on Escape while the mobile menu is open.
  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = 'hidden';
    const onKey = e => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const transparent = isHome && !scrolled;

  return (
    <>
      <header className={`nav ${transparent ? 'nav--transparent' : 'nav--solid'}`}>
        <div className="container nav__inner">
          <button
            className="nav__burger"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <nav className="nav__links">
            <Link href="/">Home</Link>
            <Link href="/shop">Shop</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <Link href="/" className="nav__logo" aria-label="The Bespoke — home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="nav__logo-img" src="/image/upload/logo.jpg" alt="The Bespoke" />
          </Link>
          <div className="nav__links nav__links--right">
            <button className="nav__icon-btn" aria-label="Search" onClick={() => setSearchOpen(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
            <button className="nav__icon-btn nav__cart-btn" aria-label="Cart" onClick={() => setCartOpen(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              {count > 0 && <span className="nav__cart-count">{count}</span>}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu__top">
            <img className="nav__logo-img" src="/image/upload/logo.jpg" alt="The Bespoke" />
            <button className="mobile-menu__close" aria-label="Close menu" onClick={() => setMenuOpen(false)}>×</button>
          </div>
          <nav className="mobile-menu__links">
            <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
            <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
          </nav>
          <button
            className="mobile-menu__search"
            onClick={() => {
              setMenuOpen(false);
              setSearchOpen(true);
            }}
          >
            Search products
          </button>
        </div>
      )}
    </>
  );
}
