'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <p className="footer__brand">The Bespoke</p>
          <p className="footer__blurb">Sign up for early access to drops, restocks and lookbooks. No noise.</p>
          <form className="footer__signup" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="Email address" required />
            <button type="submit">Join →</button>
          </form>
        </div>
        <div className="footer__col">
          <p className="footer__col-title">Shop</p>
          <Link href="/shop?cat=tees">Tees</Link>
          <Link href="/shop?cat=hoodies">Hoodies</Link>
          <Link href="/shop?cat=pants">Pants</Link>
          <Link href="/shop?cat=accessories">Accessories</Link>
        </div>
        <div className="footer__col">
          <p className="footer__col-title">Help</p>
          <a href="#">Shipping</a>
          <a href="#">Returns</a>
          <a href="#">Size guide</a>
          <Link href="/contact">Contact</Link>
        </div>
        <div className="footer__col">
          <p className="footer__col-title">Follow</p>
          <a href="#">Instagram</a>
          <a href="#">TikTok</a>
          <a href="#">X</a>
        </div>
      </div>
      <div className="container footer__legal">
        <span>© 2026 The Bespoke. All rights reserved.</span>
        <span>Privacy — Terms — <Link href="/admin">Admin</Link></span>
      </div>
    </footer>
  );
}
