'use client';

import { useState } from 'react';
import Link from 'next/link';
import ImageBox from '../../../components/ImageBox.jsx';
import { useStore } from '../../../components/StoreProvider.jsx';

export default function ProductDetailClient({ product, related }) {
  const { addItem } = useStore();
  const [size, setSize] = useState(product.sizes[0]);
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);

  const categoryName = product.categoryName || product.category;
  const specs = product.specs;
  const oneSize = product.sizes.length === 1 && product.sizes[0] === 'OS';
  const images = product.images?.length ? product.images : [null];

  return (
    <main className="pdp">
      <nav className="container pdp__breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/shop">Shop</Link>
        <span>/</span>
        <Link href={`/shop?cat=${product.category}`}>{categoryName}</Link>
        <span>/</span>
        <span className="pdp__breadcrumb-current">{product.name}</span>
      </nav>

      <div className="container pdp__grid">
        <div className="pdp__gallery">
          <div className="pdp__media">
            <ImageBox src={images[active]} alt={product.name} label={`product — ${product.name}`} />
            {product.tag && <span className="pdp__tag">{product.tag}</span>}
          </div>
          {images.length > 1 && (
            <div className="pdp__thumbs">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  className={`pdp__thumb${i === active ? ' active' : ''}`}
                  onClick={() => setActive(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-pressed={i === active}
                >
                  <ImageBox src={img} alt={`${product.name} — view ${i + 1}`} label="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pdp__info">
          <p className="pdp__category">{categoryName}</p>
          <h1 className="pdp__title">{product.name}</h1>
          <p className="pdp__price">${product.price}</p>
          <p className="pdp__blurb">{product.description}</p>

          <div className="pdp__row">
            <div className="pdp__row-head">
              <span className="pdp__label">{oneSize ? 'Size' : 'Select size'}</span>
            </div>
            <div className="pdp__sizes">
              {product.sizes.map(s => (
                <button
                  key={s}
                  className={`size-btn${s === size ? ' active' : ''}`}
                  onClick={() => setSize(s)}
                  aria-pressed={s === size}
                >
                  {s === 'OS' ? 'One size' : s}
                </button>
              ))}
            </div>
          </div>

          <div className="pdp__actions">
            <div className="pdp__qty" aria-label="Quantity">
              <button aria-label="Decrease quantity" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span>{qty}</span>
              <button aria-label="Increase quantity" onClick={() => setQty(q => q + 1)}>+</button>
            </div>
            <button className="btn btn--black pdp__add" onClick={() => addItem(product, size, qty)}>
              Add to cart — ${product.price * qty}
            </button>
          </div>

          <dl className="pdp__specs">
            {specs.map(s => (
              <div key={s.label} className="pdp__spec">
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container pdp__related">
          <h2 className="section-title pdp__related-title">You may also like</h2>
          <div className="pdp__related-grid">
            {related.map(p => (
              <Link key={p.id} href={`/shop/${p.id}`} className="related-card">
                <div className="related-card__media">
                  <ImageBox src={p.image} alt={p.name} label={`product — ${p.name}`} />
                </div>
                <p className="related-card__name">{p.name}</p>
                <p className="related-card__price">${p.price}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
