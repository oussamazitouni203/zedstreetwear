import Link from 'next/link';

export default function Hero() {
  return (
    <section className="hero">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hero__bg" src="/image/upload/streetwearhero.gif" alt="" aria-hidden="true" />
      <div className="hero__scrim" />
      <div className="hero__content">
        <p className="hero__kicker">Spring / Summer 2026</p>
        <h1 className="hero__title">Wear the street.</h1>
        <p className="hero__sub">Monochrome essentials, cut clean. The new collection is live.</p>
        <div className="hero__ctas">
          <Link href="/shop" className="btn btn--white">Shop the drop</Link>
          <a href="#bundles" className="btn btn--outline-white">View bundles</a>
        </div>
      </div>
    </section>
  );
}
