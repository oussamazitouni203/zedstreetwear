'use client';

import { useState } from 'react';
import Link from 'next/link';
import ImageBox from '../../../components/ImageBox.jsx';
import { useStore } from '../../../components/StoreProvider.jsx';

export default function ProductDetailClient({ product, related }) {
  const { addItem, money } = useStore();
  const [size, setSize] = useState(product.sizes[0]);
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const [options, setOptions] = useState({}); // variable products: attr -> value

  const categoryName = product.categoryName || product.category;
  const oneSize = product.sizes.length === 1 && product.sizes[0] === 'OS';
  const images = product.images?.length ? product.images : [null];

  const isVariable = product.isVariable;
  const variations = product.variations;

  // The variation matching every currently-selected attribute value.
  const chosen = isVariable
    ? variations.find(v => product.attributes.every(a => v.options[a.name] === options[a.name]))
    : null;
  const displayPrice = isVariable ? (chosen ? chosen.price : product.fromPrice) : product.price;

  // A value is selectable only if some variation exists that combines it with
  // the values already chosen for the OTHER attributes.
  const isValueAvailable = (attrName, val) => {
    const constraint = { [attrName]: val };
    for (const a of product.attributes) {
      if (a.name !== attrName && options[a.name]) constraint[a.name] = options[a.name];
    }
    return variations.some(v => Object.entries(constraint).every(([k, x]) => v.options[k] === x));
  };

  // Select a value, then drop any other selection that no longer has a match.
  const selectValue = (attrName, val) => {
    setOptions(prev => {
      const next = { ...prev, [attrName]: val };
      for (const a of product.attributes) {
        if (a.name === attrName) continue;
        const other = next[a.name];
        if (other && !variations.some(v => v.options[attrName] === val && v.options[a.name] === other)) {
          delete next[a.name];
        }
      }
      return next;
    });
  };

  const handleAdd = () => {
    if (isVariable) {
      if (!chosen || !chosen.inStock) return;
      const label = product.attributes.map(a => options[a.name]).join(' / ');
      addItem({ id: product.id, name: product.name, price: chosen.price, image: product.image }, label, qty);
    } else {
      addItem(product, size, qty);
    }
  };

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
          <p className="pdp__price">
            {isVariable && !chosen ? `From ${money(product.fromPrice)}` : money(displayPrice)}
          </p>
          {product.summary && <p className="pdp__blurb">{product.summary}</p>}

          {isVariable ? (
            product.attributes.map(attr => (
              <div key={attr.name} className="pdp__row">
                <div className="pdp__row-head">
                  <span className="pdp__label">{attr.name}</span>
                </div>
                <div className="pdp__sizes">
                  {attr.values.map(val => {
                    const available = isValueAvailable(attr.name, val);
                    return (
                      <button
                        key={val}
                        className={`size-btn${options[attr.name] === val ? ' active' : ''}${available ? '' : ' unavailable'}`}
                        onClick={() => selectValue(attr.name, val)}
                        disabled={!available}
                        aria-pressed={options[attr.name] === val}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
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
          )}

          <div className="pdp__actions">
            <div className="pdp__qty" aria-label="Quantity">
              <button aria-label="Decrease quantity" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span>{qty}</span>
              <button aria-label="Increase quantity" onClick={() => setQty(q => q + 1)}>+</button>
            </div>
            <button
              className="btn btn--black pdp__add"
              onClick={handleAdd}
              disabled={isVariable && (!chosen || !chosen.inStock)}
            >
              {isVariable && !chosen
                ? 'Select options'
                : isVariable && !chosen.inStock
                ? 'Out of stock'
                : `Add to cart — ${money(displayPrice * qty)}`}
            </button>
          </div>

          {product.optionGroups.length > 0 && (
            <div className="pdp__section">
              <p className="pdp__label">Available options</p>
              <dl className="pdp__specs">
                {product.optionGroups.map(g => (
                  <div key={g.name} className="pdp__spec">
                    <dt>{g.name}</dt>
                    <dd>{g.values.join(', ')}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {product.additionalInfo.length > 0 && (
            <div className="pdp__section">
              <p className="pdp__label">Additional information</p>
              <dl className="pdp__specs">
                {product.additionalInfo.map(info => (
                  <div key={info.label} className="pdp__spec">
                    <dt>{info.label}</dt>
                    <dd>{info.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="container pdp__related">
          <h2 className="section-title pdp__related-title">You may also like</h2>
          <div className="pdp__related-grid">
            {related.map(p => (
              <Link key={p.id} href={`/shop/${p.slug}`} className="related-card">
                <div className="related-card__media">
                  <ImageBox src={p.image} alt={p.name} label={`product — ${p.name}`} />
                </div>
                <p className="related-card__name">{p.name}</p>
                <p className="related-card__price">{money(p.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
