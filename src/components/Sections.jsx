import Link from 'next/link';
import { reviews } from '../data.js';
import ImageBox from './ImageBox.jsx';

export function Marquee() {
  const line =
    'New drop live\u00A0\u00A0•\u00A0\u00A0Free shipping over $100\u00A0\u00A0•\u00A0\u00A0Limited runs — no restocks\u00A0\u00A0•\u00A0\u00A0Zedstreetwear SS26\u00A0\u00A0•\u00A0\u00A0';
  return (
    <div className="marquee">
      <div className="marquee__track">
        <span>{line}</span>
        <span>{line}</span>
      </div>
    </div>
  );
}

export function Manifesto() {
  return (
    <section className="manifesto">
      <p className="eyebrow">The brand</p>
      <h2>No logos. No noise. Just cut, cloth and concrete.</h2>
    </section>
  );
}

export function NewArrivals({ arrivals = [] }) {
  return (
    <section className="container arrivals">
      <div className="section-head">
        <div>
          <p className="eyebrow">04 — Just landed</p>
          <h2 className="section-title">New arrivals</h2>
        </div>
        <Link href="/shop" className="text-link">View all</Link>
      </div>
      <div className="arrivals__grid">
        {arrivals.map(item => (
          <div key={item.id}>
            <div className="arrival-card__media">
              <ImageBox src={item.image} alt={item.name} label={`new arrival — ${item.name}`} />
            </div>
            <div className="arrival-card__info">
              <p className="name">{item.name}</p>
              <p className="price">{item.price}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Bundles({ bundles = [] }) {
  return (
    <section id="bundles" className="bundles">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow">05 — Pack it</p>
            <h2 className="section-title">Bundles</h2>
          </div>
          <p style={{ fontSize: 13, color: '#999', letterSpacing: '0.06em' }}>Save up to 20% on curated sets</p>
        </div>
        <div className="bundles__grid">
          {bundles.map(b => (
            <div key={b.id} className="bundle-card">
              <Link href={`/bundles/${b.slug}`} className="bundle-card__media">
                <ImageBox src={b.image} alt={b.name} label={`bundle — ${b.name} flat lay`} />
                <span className="bundle-card__save">{b.save}</span>
              </Link>
              <div className="bundle-card__body">
                <h3>{b.name}</h3>
                <p className="bundle-card__items">{b.items}</p>
                <div className="bundle-card__pricing">
                  <span className="price">{b.price}</span>
                  <span className="was">{b.was}</span>
                </div>
                <Link href={`/bundles/${b.slug}`} className="bundle-card__cta">View bundle</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Promo() {
  return (
    <section className="promo">
      <p className="eyebrow">First order?</p>
      <h2>
        Take 15% off with code <span className="code">ZED15</span>
      </h2>
      <Link href="/shop" className="btn btn--white">Shop now</Link>
    </section>
  );
}

export function Reviews() {
  return (
    <section className="reviews">
      <div className="container reviews__grid">
        {reviews.map(r => (
          <figure key={r.id} className="review">
            <p className="stars">★★★★★</p>
            <blockquote>“{r.quote}”</blockquote>
            <figcaption>{r.author}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function UspBar() {
  const items = [
    { title: 'Free shipping', sub: 'On all orders over $100' },
    { title: '30-day returns', sub: 'Unworn, no questions asked' },
    { title: 'Secure checkout', sub: 'All major cards accepted' }
  ];
  return (
    <section className="usp">
      <div className="container usp__grid">
        {items.map(i => (
          <div key={i.title} className="usp__item">
            <p className="title">{i.title}</p>
            <p className="sub">{i.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
