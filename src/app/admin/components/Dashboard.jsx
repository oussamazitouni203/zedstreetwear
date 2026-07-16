import { money } from '../data.js';
import { StatusPill } from './StatusPill.jsx';
import { Icon } from './Sidebar.jsx';

const DAY = 86400000;

// Every admin section, as a quick-access tile on the dashboard.
const SHORTCUTS = [
  { key: 'products', label: 'Products', icon: 'products', hint: 'Manage catalog items' },
  { key: 'categories', label: 'Categories', icon: 'categories', hint: 'Organize the catalog' },
  { key: 'attributes', label: 'Attributes', icon: 'attributes', hint: 'Sizes, colors & options' },
  { key: 'bundles', label: 'Bundles', icon: 'bundles', hint: 'Discounted product sets' },
  { key: 'orders', label: 'Orders', icon: 'orders', hint: 'Fulfil & track orders' },
  { key: 'returns', label: 'Returns', icon: 'returns', hint: 'Handle returned orders' },
  { key: 'coupons', label: 'Coupons', icon: 'coupons', hint: 'Discount codes' },
  { key: 'analytics', label: 'Analytics', icon: 'analytics', hint: 'Sales insights' },
  { key: 'banners', label: 'Banners', icon: 'banners', hint: 'Homepage content' },
  { key: 'users', label: 'Users', icon: 'users', hint: 'Admin accounts' },
  { key: 'settings', label: 'Settings', icon: 'settings', hint: 'Store configuration' }
];

// Turns a current/previous pair into a human "+12.4% vs last week" style delta.
const delta = (curr, prev) => {
  if (!prev) return { text: curr ? 'New this week' : 'No activity yet', muted: !curr };
  const change = Math.round(((curr - prev) / prev) * 1000) / 10;
  if (change === 0) return { text: 'Flat vs last week', muted: true };
  const up = change > 0;
  return { text: `${up ? '+' : '−'}${Math.abs(change)}% vs last week`, muted: !up };
};

// Orders that count toward revenue (exclude canceled / abandoned / returned).
const earns = o => o.status !== 'Canceled' && o.status !== 'Abandoned' && o.status !== 'Returned';

export default function Dashboard({
  orders = [],
  products = [],
  categories = [],
  attributes = [],
  bundles = [],
  coupons = [],
  users = [],
  onNavigate = () => {}
}) {
  const now = Date.now();
  const inWindow = (o, from, to) => {
    const t = new Date(o.createdAt).getTime();
    return t >= from && t < to;
  };

  const last7 = orders.filter(o => inWindow(o, now - 7 * DAY, now + DAY));
  const prev7 = orders.filter(o => inWindow(o, now - 14 * DAY, now - 7 * DAY));

  const revenueOf = list => list.filter(earns).reduce((sum, o) => sum + o.total, 0);
  const revenue7 = revenueOf(last7);
  const revenuePrev = revenueOf(prev7);

  const customers7 = new Set(last7.map(o => o.email || o.customer)).size;
  const customersPrev = new Set(prev7.map(o => o.email || o.customer)).size;

  const pending = orders.filter(o => o.status === 'Pending').length;

  const stats = [
    { label: 'Revenue (7d)', value: money(revenue7), ...delta(revenue7, revenuePrev) },
    { label: 'Orders (7d)', value: String(last7.length), ...delta(last7.length, prev7.length) },
    { label: 'New customers (7d)', value: String(customers7), ...delta(customers7, customersPrev) },
    {
      label: 'Pending orders',
      value: String(pending),
      text: pending ? `${pending} awaiting action` : 'All caught up',
      muted: pending === 0
    }
  ];

  // Best sellers, tallied from actual order line items.
  const tally = new Map();
  for (const o of orders) {
    if (!earns(o)) continue;
    for (const it of o.items ?? []) {
      const cur = tally.get(it.name) ?? { name: it.name, sold: 0, revenue: 0 };
      cur.sold += it.quantity;
      cur.revenue += it.price * it.quantity;
      tally.set(it.name, cur);
    }
  }
  const top = [...tally.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const maxRevenue = top[0]?.revenue || 1;

  const recent = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const counts = {
    products: products.length,
    categories: categories.length,
    attributes: attributes.length,
    bundles: bundles.length,
    orders: orders.length,
    returns: orders.filter(o => o.status === 'Returned').length,
    coupons: coupons.length,
    users: users.length
  };

  return (
    <div>
      <div className="adm-stats">
        {stats.map(s => (
          <div key={s.label} className="adm-stat">
            <p className="label">{s.label}</p>
            <p className="value">{s.value}</p>
            <p className="delta" style={{ color: s.muted ? '#999' : '#111' }}>{s.text}</p>
          </div>
        ))}
      </div>

      <div className="adm-shortcuts">
        {SHORTCUTS.map(s => (
          <button
            key={s.key}
            type="button"
            className="adm-shortcut"
            onClick={() => onNavigate(s.key)}
          >
            <span className="adm-shortcut__icon"><Icon name={s.icon} /></span>
            <span className="adm-shortcut__body">
              <span className="adm-shortcut__label">{s.label}</span>
              <span className="adm-shortcut__hint">{s.hint}</span>
            </span>
            {counts[s.key] != null && <span className="adm-shortcut__count num">{counts[s.key]}</span>}
          </button>
        ))}
      </div>

      <div className="adm-dash-grid">
        <div className="adm-card">
          <div className="adm-card__head">
            <h2>Recent orders</h2>
            <button className="adm-link-btn" onClick={() => onNavigate('orders')}>View all</button>
          </div>
          {recent.length === 0 ? (
            <p className="adm-dash-empty">No orders yet.</p>
          ) : (
            recent.map(o => (
              <div key={o.id} className="order-row adm-row">
                <span className="id num">{o.number}</span>
                <span className="customer">{o.customer}</span>
                <StatusPill status={o.status} />
                <span className="total num">{money(o.total)}</span>
              </div>
            ))
          )}
        </div>

        <div className="adm-card">
          <div className="adm-card__head">
            <h2>Top products</h2>
            <button className="adm-link-btn" onClick={() => onNavigate('products')}>Manage</button>
          </div>
          {top.length === 0 ? (
            <p className="adm-dash-empty">No sales to rank yet.</p>
          ) : (
            top.map(tp => (
              <div key={tp.name} className="top-product adm-row">
                <div>
                  <p className="name">{tp.name}</p>
                  <p className="sold">{tp.sold} sold</p>
                </div>
                <div className="top-product__right">
                  <div className="top-product__bar">
                    <div style={{ width: `${Math.max(6, (tp.revenue / maxRevenue) * 100)}%` }} />
                  </div>
                  <span className="revenue num">{money(tp.revenue)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
