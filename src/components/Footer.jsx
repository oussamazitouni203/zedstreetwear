'use client';

import Link from 'next/link';

// Ensure an admin-entered URL is absolute so the link doesn't resolve inside the site.
const ext = url => (/^https?:\/\//i.test(url) ? url : `https://${url}`);

function SocialIcon({ name }) {
  const p = { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'currentColor' };
  switch (name) {
    case 'facebook':
      return <svg {...p}><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z" /></svg>;
    case 'instagram':
      return <svg {...p} fill="none" stroke="currentColor" strokeWidth="1.9"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" /></svg>;
    case 'tiktok':
      return <svg {...p}><path d="M16.5 3c.3 2 1.6 3.6 3.5 4v2.6c-1.3 0-2.6-.4-3.6-1.1v5.9a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v2.7a2.9 2.9 0 1 0 2 2.8V3h2.8Z" /></svg>;
    case 'whatsapp':
      return <svg {...p}><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .3-3.4-.7-2.9-1.2-4.6-4.1-4.8-4.3-.1-.2-1.1-1.4-1.1-2.7s.7-1.9 1-2.1c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.2.1.4.1.6-.1l.7-.9c.2-.2.4-.2.6-.1l1.9.9c.2.1.4.2.5.3.1.3.1.6-.1 1.1Z" /></svg>;
    default:
      return null;
  }
}

export default function Footer({ social = {}, storeName = 'The Bespoke' }) {
  // Build the Follow list from configured links only; WhatsApp becomes a wa.me chat link.
  const wa = String(social.whatsapp || '').replace(/[^\d]/g, '');
  const links = [
    social.facebook && { name: 'facebook', label: 'Facebook', href: ext(social.facebook) },
    social.instagram && { name: 'instagram', label: 'Instagram', href: ext(social.instagram) },
    social.tiktok && { name: 'tiktok', label: 'TikTok', href: ext(social.tiktok) },
    wa && { name: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/${wa}` }
  ].filter(Boolean);

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <p className="footer__brand">{storeName}</p>
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
          {links.length === 0 ? (
            <span className="footer__muted">Coming soon</span>
          ) : (
            links.map(l => (
              <a key={l.name} href={l.href} target="_blank" rel="noopener noreferrer" className="footer__social">
                <SocialIcon name={l.name} />
                {l.label}
              </a>
            ))
          )}
        </div>
      </div>
      <div className="container footer__legal">
        <span>© {new Date().getFullYear()} {storeName}. All rights reserved.</span>
        <span>Privacy — Terms — <Link href="/admin">Admin</Link></span>
      </div>
    </footer>
  );
}
