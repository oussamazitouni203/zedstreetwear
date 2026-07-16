'use client';

import Link from 'next/link';
import ImageBox from '../../../components/ImageBox.jsx';
import { useStore } from '../../../components/StoreProvider.jsx';

export default function BundleDetailClient({ bundle }) {
  const { addItem } = useStore();

  // Add every product in the bundle to the cart at its discounted unit price,
  // so the cart total reflects the bundle price.
  const addBundle = () => {
    bundle.products.forEach(p => {
      const discounted = Math.round(p.price * (1 - bundle.discount / 100));
      addItem({ ...p, price: discounted }, p.sizes?.[0] || 'OS', 1);
    });
  };

  return (
    <main className="pdp">
      <nav className="container pdp__breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/#bundles">Bundles</Link>
        <span>/</span>
        <span className="pdp__breadcrumb-current">{bundle.name}</span>
      </nav>

      <div className="container pdp__grid">
        <div className="pdp__media">
          <ImageBox src={bundle.image} alt={bundle.name} label={`bundle — ${bundle.name} flat lay`} />
          {bundle.discount > 0 && <span className="pdp__tag">Save {bundle.discount}%</span>}
        </div>

        <div className="pdp__info">
          <p className="pdp__category">Bundle · {bundle.products.length} pieces</p>
          <h1 className="pdp__title">{bundle.name}</h1>

          <div className="bundle-pdp__pricing">
            <span className="pdp__price">${bundle.price}</span>
            {bundle.save > 0 && <span className="bundle-pdp__was">${bundle.base}</span>}
            {bundle.save > 0 && (
              <span className="bundle-pdp__save">Save {bundle.discount}% · ${bundle.save}</span>
            )}
          </div>

          <p className="pdp__blurb">
            A curated set of {bundle.products.length} pieces{' '}
            {bundle.discount > 0 ? `at ${bundle.discount}% off the individual prices.` : 'from the SS26 range.'}
          </p>

          <div className="pdp__actions">
            <button className="btn btn--black pdp__add" onClick={addBundle} disabled={bundle.products.length === 0}>
              Add bundle to cart — ${bundle.price}
            </button>
          </div>

          <div className="bundle-pdp__included">
            <p className="pdp__label">What&apos;s included</p>
            <div className="bundle-pdp__items">
              {bundle.products.map(p => (
                <Link key={p.id} href={`/shop/${p.slug}`} className="related-card">
                  <div className="related-card__media">
                    <ImageBox src={p.image} alt={p.name} label={`product — ${p.name}`} />
                  </div>
                  <p className="related-card__name">{p.name}</p>
                  <p className="related-card__price">${p.price}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
