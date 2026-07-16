'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import SearchOverlay from './SearchOverlay.jsx';
import CartDrawer from './CartDrawer.jsx';

export default function AppChrome({ children, social }) {
  const pathname = usePathname();
  const bare = pathname?.startsWith('/admin') || pathname?.startsWith('/login');

  if (bare) {
    return children;
  }

  const isHome = pathname === '/';

  return (
    <>
      <Navbar />
      <div className={`page-shell${isHome ? ' page-shell--flush' : ''}`}>{children}</div>
      <Footer social={social} />
      <SearchOverlay />
      <CartDrawer />
    </>
  );
}
