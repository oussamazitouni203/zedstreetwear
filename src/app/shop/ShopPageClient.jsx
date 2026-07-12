'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ImageBox from '../../components/ImageBox.jsx';
import { useStore } from '../../components/StoreProvider.jsx';

const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'newest', label: 'Newest' },
  { id: 'price-asc', label: 'Price: Low to high' },
  { id: 'price-desc', label: 'Price: High to low' }
];

const SIZES = ['S', 'M', 'L', 'XL', 'OS'];

const COLORS = [
  { id: 'Black', swatch: '#111' },
  { id: 'White', swatch: '#fff' },
  { id: 'Grey', swatch: '#9a9a9a' },
  { id: 'Off-white', swatch: '#ece9e2' }
];

const PRICES = [
  { id: 'under-50', label: 'Under $50', test: p => p.price < 50 },
  { id: '50-100', label: '$50 – $100', test: p => p.price >= 50 && p.price <= 100 },
  { id: 'over-100', label: 'Over $100', test: p => p.price > 100 }
];

const STATUSES = ['New', 'Best seller', 'Low stock', 'Restocked'];

const PER_PAGE = 9;

const EMPTY_FILTERS = { sizes: [], colors: [], prices: [], statuses: [] };

function sortProducts(list, sort) {
  const sorted = [...list];
  if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
  if (sort === 'newest') sorted.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.id - a.id);
  return sorted;
}

function matchesStatus(p, status) {
  return status === 'New' ? p.isNew : p.tag === status;
}

function FilterOption({ checked, onToggle, swatch, children }) {
  return (
    <button className={`filter-option${checked ? ' checked' : ''}`} onClick={onToggle} aria-pressed={checked}>
      {swatch ? (
        <span className="filter-option__swatch" style={{ background: swatch }} />
      ) : (
        <span className="filter-option__box" />
      )}
      {children}
    </button>
  );
}

export default function ShopPageClient({ products = [], categories = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useStore();
  const cat = searchParams.get('cat') || 'all';

  const [sort, setSort] = useState('featured');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false); // mobile only — sidebar is always visible on desktop
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);
  const sortRef = useRef(null);
  const topRef = useRef(null);

  useEffect(() => {
    if (!sortOpen) return;
    const close = e => {
      if (e.type === 'keydown' ? e.key === 'Escape' : !sortRef.current?.contains(e.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [sortOpen]);

  const activeCount =
    filters.sizes.length + filters.colors.length + filters.prices.length + filters.statuses.length;

  const toggleFilter = (group, value) =>
    setFilters(f => ({
      ...f,
      [group]: f[group].includes(value) ? f[group].filter(v => v !== value) : [...f[group], value]
    }));

  // Expand the selected category to include all its descendant categories,
  // so picking a parent shows products filed under its children too.
  const wantedSlugs = useMemo(() => {
    if (cat === 'all') return null;
    const set = new Set([cat]);
    let added = true;
    while (added) {
      added = false;
      for (const c of categories) {
        if (c.parent && set.has(c.parent) && !set.has(c.id)) {
          set.add(c.id);
          added = true;
        }
      }
    }
    return set;
  }, [cat, categories]);

  const shown = useMemo(() => {
    let list = wantedSlugs
      ? products.filter(p => p.categorySlugs.some(s => wantedSlugs.has(s)))
      : products;
    if (filters.sizes.length) list = list.filter(p => p.sizes.some(s => filters.sizes.includes(s)));
    if (filters.colors.length) list = list.filter(p => filters.colors.includes(p.color));
    if (filters.prices.length) {
      const ranges = PRICES.filter(r => filters.prices.includes(r.id));
      list = list.filter(p => ranges.some(r => r.test(p)));
    }
    if (filters.statuses.length) list = list.filter(p => filters.statuses.some(s => matchesStatus(p, s)));
    return sortProducts(list, sort);
  }, [products, wantedSlugs, sort, filters]);

  // Reset to the first page whenever the result set changes.
  useEffect(() => setPage(1), [cat, sort, filters]);

  const totalPages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = shown.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const goToPage = p => {
    setPage(p);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Update the URL without a full navigation / remount, so category switches stay instant
  // and the filtered view keeps a shareable link.
  const selectCat = id => {
    const url = id === 'all' ? '/shop' : `/shop?cat=${id}`;
    router.replace(url, { scroll: false });
  };

  const title = cat === 'all' ? 'Shop all' : categories.find(c => c.id === cat)?.name ?? 'Shop all';

  return (
    <main className="shop">
      <div ref={topRef} className="container shop__head">
        <p className="eyebrow">The catalog</p>
        <h1 className="shop__title">{title}</h1>
        <p className="shop__count">{shown.length} {shown.length === 1 ? 'product' : 'products'}</p>
      </div>

      <div className="container shop__toolbar">
        <div className="shop__filters">
          <button
            className={`filter-pill${cat === 'all' ? ' active' : ''}`}
            onClick={() => selectCat('all')}
          >
            All
          </button>
          {categories.filter(c => !c.parent).map(c => (
            <button
              key={c.id}
              className={`filter-pill${cat === c.id ? ' active' : ''}`}
              onClick={() => selectCat(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="shop__controls">
          <button
            className={`filter-toggle${filtersOpen || activeCount > 0 ? ' engaged' : ''}`}
            onClick={() => setFiltersOpen(o => !o)}
            aria-expanded={filtersOpen}
          >
            Filters{activeCount > 0 ? ` (${activeCount})` : ''}
            <span className="filter-toggle__sign">{filtersOpen ? '−' : '+'}</span>
          </button>
          <div className="shop__sort" ref={sortRef}>
            <button
              className={`sort-trigger${sortOpen ? ' open' : ''}`}
              onClick={() => setSortOpen(o => !o)}
              aria-haspopup="listbox"
              aria-expanded={sortOpen}
            >
              Sort: {SORTS.find(s => s.id === sort)?.label}
              <span className="sort-trigger__sign">{sortOpen ? '−' : '+'}</span>
            </button>
            {sortOpen && (
              <ul className="sort-menu" role="listbox">
                {SORTS.map(s => (
                  <li key={s.id}>
                    <button
                      className={`sort-menu__item${s.id === sort ? ' selected' : ''}`}
                      role="option"
                      aria-selected={s.id === sort}
                      onClick={() => {
                        setSort(s.id);
                        setSortOpen(false);
                      }}
                    >
                      {s.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="container shop__body">
        <aside className={`shop-sidebar${filtersOpen ? ' open' : ''}`}>
          <div className="shop-sidebar__head">
            <p>Filter by</p>
            {activeCount > 0 && (
              <button className="shop-sidebar__clear" onClick={() => setFilters(EMPTY_FILTERS)}>
                Clear all ×
              </button>
            )}
          </div>
          <div className="filter-group">
            <p className="filter-group__title">Size</p>
            {SIZES.map(s => (
              <FilterOption
                key={s}
                checked={filters.sizes.includes(s)}
                onToggle={() => toggleFilter('sizes', s)}
              >
                {s === 'OS' ? 'One size' : s}
              </FilterOption>
            ))}
          </div>
          <div className="filter-group">
            <p className="filter-group__title">Color</p>
            {COLORS.map(c => (
              <FilterOption
                key={c.id}
                checked={filters.colors.includes(c.id)}
                onToggle={() => toggleFilter('colors', c.id)}
                swatch={c.swatch}
              >
                {c.id}
              </FilterOption>
            ))}
          </div>
          <div className="filter-group">
            <p className="filter-group__title">Price</p>
            {PRICES.map(r => (
              <FilterOption
                key={r.id}
                checked={filters.prices.includes(r.id)}
                onToggle={() => toggleFilter('prices', r.id)}
              >
                {r.label}
              </FilterOption>
            ))}
          </div>
          <div className="filter-group">
            <p className="filter-group__title">Status</p>
            {STATUSES.map(s => (
              <FilterOption
                key={s}
                checked={filters.statuses.includes(s)}
                onToggle={() => toggleFilter('statuses', s)}
              >
                {s}
              </FilterOption>
            ))}
          </div>
        </aside>

        <div className="shop__results">
          {shown.length === 0 ? (
            <div className="shop__empty">
              <p>
                {activeCount > 0
                  ? 'No products match these filters. Try removing a few.'
                  : 'Nothing here yet. Check back after the next drop.'}
              </p>
            </div>
          ) : (
            <>
              <div className="shop__grid">
                {pageItems.map(p => (
                  <div key={p.id} className="shop-card">
                    <div className="shop-card__media">
                      <Link href={`/shop/${p.id}`} className="shop-card__link" aria-label={p.name}>
                        <ImageBox src={p.image} alt={p.name} label={`product — ${p.name}`} />
                      </Link>
                      {p.tag && <span className="shop-card__tag">{p.tag}</span>}
                      <button className="shop-card__add" onClick={() => addItem(p, p.sizes[0])}>Add to cart</button>
                    </div>
                    <Link href={`/shop/${p.id}`} className="shop-card__info">
                      <p className="name">{p.name}</p>
                      <p className="price">${p.price}</p>
                    </Link>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <nav className="pagination" aria-label="Pagination">
                  <button
                    className="pagination__arrow"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                  >
                    ←
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      className={`pagination__page${p === currentPage ? ' active' : ''}`}
                      onClick={() => goToPage(p)}
                      aria-current={p === currentPage ? 'page' : undefined}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    className="pagination__arrow"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                  >
                    →
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
