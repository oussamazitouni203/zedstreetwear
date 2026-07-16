'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ImageBox from './ImageBox.jsx';

const AUTOPLAY_MS = 3500;

function useVisible() {
  const [visible, setVisible] = useState(3);
  useEffect(() => {
    const update = () => setVisible(window.innerWidth <= 640 ? 1 : window.innerWidth <= 1024 ? 2 : 3);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return visible;
}

export default function BestSellers({ items = [] }) {
  const bestSellers = items;
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef(null);
  const visible = useVisible();
  const maxSlide = Math.max(0, bestSellers.length - visible);

  // Clamp slide when visible count changes (e.g. on resize)
  useEffect(() => {
    setSlide(s => Math.min(s, maxSlide));
  }, [maxSlide]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setSlide(s => (s >= maxSlide ? 0 : s + 1));
    }, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, maxSlide]);

  const advance = dir =>
    setSlide(s => {
      const next = s + dir;
      if (next > maxSlide) return 0;
      if (next < 0) return maxSlide;
      return next;
    });

  const offset = () => {
    const track = trackRef.current;
    if (!track || !track.children.length) return 0;
    return -slide * (track.children[0].offsetWidth + 24);
  };

  return (
    <section id="shop" className="container" style={{ paddingTop: '96px', paddingBottom: '80px' }}>
      <div className="section-head">
        <div>
          <p className="eyebrow">01 — Most wanted</p>
          <h2 className="section-title">Best sellers</h2>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="arrow-btn" onClick={() => advance(-1)} aria-label="Previous">←</button>
          <button className="arrow-btn" onClick={() => advance(1)} aria-label="Next">→</button>
        </div>
      </div>

      <div
        className="slider-viewport"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div ref={trackRef} className="slider-track" style={{ transform: `translateX(${offset()}px)` }}>
          {bestSellers.map(p => (
            <div key={p.id} className="product-card">
              <Link href={`/shop/${p.slug}`} className="product-card__media" style={{ display: 'block' }}>
                <ImageBox src={p.image} alt={p.name} label={`product — ${p.name}`} />
                <span className="product-card__tag">{p.tag}</span>
                <div className="product-card__reveal">
                  <p className="name">{p.name}</p>
                  <p className="price">{p.price}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="slider-dots">
        {Array.from({ length: maxSlide + 1 }, (_, i) => (
          <button
            key={i}
            className={i === slide ? 'active' : ''}
            onClick={() => setSlide(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

