'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useStore } from './StoreProvider.jsx';
import ImageBox from './ImageBox.jsx';

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen, addItem, money } = useStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  // Focus the field when the overlay opens; reset the query when it closes.
  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 40);
      return () => clearTimeout(t);
    }
    setQuery('');
    setResults([]);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const onKey = e => e.key === 'Escape' && setSearchOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [searchOpen, setSearchOpen]);

  // Debounced DB-backed search.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    let active = true;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (active) setResults(data.results || []);
      } catch {
        if (active) setResults([]);
      }
    }, 200);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [query]);

  if (!searchOpen) return null;

  return (
    <div className="search-overlay" onMouseDown={() => setSearchOpen(false)}>
      <div className="search-panel" onMouseDown={e => e.stopPropagation()}>
        <div className="container search-panel__inner">
          <div className="search-bar">
            <svg className="search-bar__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              ref={inputRef}
              type="text"
              className="search-bar__input"
              placeholder="Search products…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button className="search-bar__close" aria-label="Close search" onClick={() => setSearchOpen(false)}>×</button>
          </div>

          {query.trim() && (
            <div className="search-results">
              {results.length === 0 ? (
                <p className="search-results__empty">No products match “{query.trim()}”.</p>
              ) : (
                results.map(p => (
                  <div key={p.id} className="search-result">
                    <Link
                      href={`/shop/${p.slug}`}
                      className="search-result__link"
                      onClick={() => setSearchOpen(false)}
                    >
                      <div className="search-result__media">
                        <ImageBox src={p.image} alt={p.name} label={p.name} />
                      </div>
                      <div className="search-result__info">
                        <p className="search-result__name">{p.name}</p>
                        <p className="search-result__meta">{p.category} · {money(p.price)}</p>
                      </div>
                    </Link>
                    <button className="search-result__add" onClick={() => addItem(p, p.sizes[0])}>Add</button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
