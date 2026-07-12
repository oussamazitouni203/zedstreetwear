// Shown instantly during navigation to /shop while the product data loads,
// so the click feels immediate instead of hanging on the DB round-trip.
export default function ShopLoading() {
  return (
    <main className="shop">
      <div className="container shop__head">
        <p className="eyebrow">The catalog</p>
        <h1 className="shop__title">Shop</h1>
        <p className="shop__count">Loading…</p>
      </div>

      <div className="container shop__body">
        <div className="shop__results" style={{ gridColumn: '1 / -1' }}>
          <div className="shop__grid">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="shop-card">
                <div className="shop-card__media skeleton" />
                <div className="shop-card__info">
                  <div className="skel-line" />
                  <div className="skel-line skel-line--sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
