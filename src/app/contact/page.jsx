const SOCIALS = [
  { name: 'Instagram', href: '#', icon: InstagramIcon },
  { name: 'TikTok', href: '#', icon: TikTokIcon },
  { name: 'X', href: '#', icon: XIcon }
];

function InstagramIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l10-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="16" cy="16" r="3" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="4" y1="4" x2="20" y2="20" />
      <line x1="20" y1="4" x2="4" y2="20" />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <main className="contact-page">
      <section className="contact-hero">
        <div className="container">
          <p className="eyebrow">Get in touch</p>
          <h1 className="section-title contact-hero__title">Contact Us</h1>
          <p className="contact-hero__sub">
            Questions about an order, sizing, or a wholesale inquiry? Reach us directly below, or find us on socials.
          </p>
        </div>
      </section>

      <section className="container contact-details">
        <div className="contact-detail">
          <p className="contact-detail__label">Email</p>
          <a href="mailto:hello@thebespoke.com" className="contact-detail__value contact-detail__link">
            hello@thebespoke.com
          </a>
        </div>
        <div className="contact-detail">
          <p className="contact-detail__label">Response time</p>
          <p className="contact-detail__value">1–2 business days</p>
        </div>
        <div className="contact-detail">
          <p className="contact-detail__label">Hours</p>
          <p className="contact-detail__value">Mon – Fri, 9am – 6pm EST</p>
        </div>
      </section>

      <section className="contact-socials">
        <div className="container contact-socials__inner">
          <p className="eyebrow eyebrow--dark">Follow along</p>
          <h2 className="section-title contact-socials__title">@thebespoke</h2>
          <div className="contact-socials__grid">
            {SOCIALS.map(({ name, href, icon: Icon }) => (
              <a key={name} href={href} className="social-card">
                <span className="social-card__icon"><Icon /></span>
                <span className="social-card__name">{name}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="container contact-faq-section">
        <p className="eyebrow">Quick answers</p>
        <h2 className="section-title contact-faq-section__title">FAQ</h2>
        <div className="contact-faq">
          <details>
            <summary>Where do you ship?</summary>
            <p>We ship worldwide. Free shipping on orders over $150.</p>
          </details>
          <details>
            <summary>How long does delivery take?</summary>
            <p>US: 3–5 business days. International: 7–14 business days.</p>
          </details>
          <details>
            <summary>Can I return or exchange?</summary>
            <p>Yes — unworn items in original packaging within 30 days. See our returns page.</p>
          </details>
        </div>
      </section>
    </main>
  );
}
