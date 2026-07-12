'use client';

import { useRef } from 'react';
import Link from 'next/link';
import ImageBox from './ImageBox.jsx';

export default function Categories({ categories = [] }) {
  const railRef = useRef(null);
  const scroll = dir => railRef.current?.scrollBy({ left: dir * 340, behavior: 'smooth' });

  return (
    <section id="categories" className="categories">
      <div className="container section-head">
        <div>
          <p className="eyebrow eyebrow--dark">02 — Browse</p>
          <h2 className="section-title">Categories</h2>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="arrow-btn arrow-btn--dark" onClick={() => scroll(-1)} aria-label="Scroll left">←</button>
          <button className="arrow-btn arrow-btn--dark" onClick={() => scroll(1)} aria-label="Scroll right">→</button>
        </div>
      </div>
      <div ref={railRef} className="categories__rail">
        {categories.map(cat => (
          <Link key={cat.id} href={`/shop?cat=${cat.id}`} className="category-card">
            <ImageBox src={cat.image} alt={cat.name} label={`category — ${cat.name}`} dark />
            <div className="category-card__tint" />
            <div className="category-card__label">
              <p className="name">{cat.name}</p>
              <p className="count">{cat.count}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
