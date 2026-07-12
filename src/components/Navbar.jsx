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

  // Transparent over the hero at the top; solid once scrolled. Re-checks on
  // route change (Next resets scroll to the top on navigation).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  const transparent = isHome && !scrolled;

  return (
    <header className={`nav ${transparent ? 'nav--transparent' : 'nav--solid'}`}>
      <div className="container nav__inner">
        <nav className="nav__links">
          <Link href="/">Home</Link>
          <Link href="/shop">Shop</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <Link href="/" className="nav__logo">Zedstreetwear</Link>
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
  );
}
