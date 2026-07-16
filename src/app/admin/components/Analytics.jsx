'use client';

import { useEffect, useMemo, useState } from 'react';
import { LineChart, BarChart, DonutChart } from './Charts.jsx';
import DatePicker from './DatePicker.jsx';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const LOW_STOCK = 5;

// Orders that count toward revenue: placed and not cancelled/returned/trashed.
const REVENUE_STATUSES = new Set(['Pending', 'Shipped', 'Delivered']);
const isRevenue = o => o.state !== 'TRASHED' && REVENUE_STATUSES.has(o.status);

const STATUS_COLOR = {
  Pending: '#e0a72a', Shipped: '#3f6fd6', Delivered: '#111',
  Canceled: '#d1493f', Abandoned: '#bbb', Returned: '#7c53d6'
};

const money = n => '$' + Math.round(n).toLocaleString();
const compact = n => (n >= 1000 ? '$' + (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k' : '$' + Math.round(n));
const plainCompact = n => (n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n));

// ---- date helpers (all local time) ----
const startOfDay = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const startOfHour = d => { const x = new Date(d); x.setMinutes(0, 0, 0); return x; };
const startOfWeek = d => { const x = startOfDay(d); x.setDate(x.getDate() - x.getDay()); return x; };
const startOfMonth = d => new Date(d.getFullYear(), d.getMonth(), 1);
const startOfYear = d => new Date(d.getFullYear(), 0, 1);
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const endOfDay = d => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };

const keyOf = (d, unit) => {
  const y = d.getFullYear(), m = d.getMonth(), day = d.getDate();
  if (unit === 'hour') return `${y}-${m}-${day}-${d.getHours()}`;
  if (unit === 'day' || unit === 'week') return `${y}-${m}-${day}`;
  if (unit === 'month') return `${y}-${m}`;
  return `${y}`;
};
const labelOf = (d, unit) => {
  if (unit === 'hour') { const h = d.getHours(); return h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`; }
  if (unit === 'day' || unit === 'week') return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
  if (unit === 'month') return `${MONTHS_SHORT[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
  return String(d.getFullYear());
};
const stepStart = (from, unit) =>
  unit === 'hour' ? startOfHour(from) : unit === 'week' ? startOfWeek(from)
    : unit === 'month' ? startOfMonth(from) : unit === 'year' ? startOfYear(from) : startOfDay(from);
const step = (d, unit) => {
  if (unit === 'hour') d.setHours(d.getHours() + 1);
  else if (unit === 'week') d.setDate(d.getDate() + 7);
  else if (unit === 'month') d.setMonth(d.getMonth() + 1);
  else if (unit === 'year') d.setFullYear(d.getFullYear() + 1);
  else d.setDate(d.getDate() + 1);
};

// Build aligned buckets between from..to and fold matching orders into them.
function series(orders, from, to, unit) {
  const buckets = [];
  const d = stepStart(from, unit);
  let guard = 0;
  while (d <= to && guard++ < 2000) { buckets.push({ key: keyOf(d, unit), label: labelOf(d, unit) }); step(d, unit); }
  const map = new Map(buckets.map(b => [b.key, { rev: 0, count: 0 }]));
  for (const o of orders) {
    if (!isRevenue(o)) continue;
    const dt = new Date(o.createdAt);
    if (dt < from || dt > to) continue;
    const k = keyOf(unit === 'week' ? startOfWeek(dt) : dt, unit);
    const cell = map.get(k);
    if (cell) { cell.rev += o.total; cell.count += 1; }
  }
  return buckets.map(b => ({ label: b.label, rev: map.get(b.key).rev, count: map.get(b.key).count }));
}

const RANGES = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: '3m', label: 'Last 3 months' },
  { key: 'year', label: 'This year' },
  { key: 'custom', label: 'Custom range' }
];

function resolveRange(key, now, cFrom, cTo) {
  const to = now;
  if (key === 'today') return { from: startOfDay(now), to };
  if (key === '7d') return { from: startOfDay(addDays(now, -6)), to };
  if (key === '30d') return { from: startOfDay(addDays(now, -29)), to };
  if (key === '3m') return { from: startOfDay(addMonths(now, -3)), to };
  if (key === 'year') return { from: startOfYear(now), to };
  if (key === 'custom' && cFrom && cTo) {
    const [fy, fm, fd] = cFrom.split('-').map(Number);
    const [ty, tm, td] = cTo.split('-').map(Number);
    return { from: startOfDay(new Date(fy, fm - 1, fd)), to: endOfDay(new Date(ty, tm - 1, td)) };
  }
  return { from: startOfDay(addDays(now, -29)), to };
}

const spanUnit = (from, to) => {
  const days = (to - from) / 86400000;
  if (days <= 2) return 'hour';
  if (days <= 92) return 'day';
  return 'month';
};

function Stat({ label, value, sub }) {
  return (
    <div className="an-stat">
      <p className="an-stat__label">{label}</p>
      <p className="an-stat__value">{value}</p>
      {sub && <p className="an-stat__sub">{sub}</p>}
    </div>
  );
}

function Card({ title, subtitle, children, className = '' }) {
  return (
    <section className={`an-card ${className}`}>
      <div className="an-card__head">
        <h3>{title}</h3>
        {subtitle && <span className="an-card__sub">{subtitle}</span>}
      </div>
      {children}
    </section>
  );
}

function RankTable({ rows, empty }) {
  if (!rows.length) return <div className="an-empty">{empty}</div>;
  return (
    <table className="an-table">
      <thead><tr><th>Product</th><th className="num">Sold</th><th className="num">Revenue</th></tr></thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td>{r.name}</td>
            <td className="num">{r.sold}</td>
            <td className="num">{money(r.revenue)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Analytics({ orders = [], products = [], coupons = [] }) {
  // Analytics is entirely time-relative (new Date()), which the server and client
  // compute at different instants. Render a static skeleton until mounted so the
  // first client paint matches the SSR HTML, then swap in the real charts.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const now = useMemo(() => new Date(), [ready]);
  const [rangeKey, setRangeKey] = useState('30d');
  const [cFrom, setCFrom] = useState('');
  const [cTo, setCTo] = useState('');
  const [trend, setTrend] = useState('monthly');

  // ---- fixed revenue cards (independent of the filter) ----
  const cards = useMemo(() => {
    const sums = { today: 0, week: 0, month: 0, year: 0 };
    const d0 = startOfDay(now), w0 = startOfWeek(now), m0 = startOfMonth(now), y0 = startOfYear(now);
    for (const o of orders) {
      if (!isRevenue(o)) continue;
      const dt = new Date(o.createdAt);
      if (dt >= d0) sums.today += o.total;
      if (dt >= w0) sums.week += o.total;
      if (dt >= m0) sums.month += o.total;
      if (dt >= y0) sums.year += o.total;
    }
    return sums;
  }, [orders, now]);

  const range = resolveRange(rangeKey, now, cFrom, cTo);
  const unit = spanUnit(range.from, range.to);

  // ---- range-scoped aggregates ----
  const scoped = useMemo(() => {
    const inRange = orders.filter(o => {
      const dt = new Date(o.createdAt);
      return o.state !== 'TRASHED' && dt >= range.from && dt <= range.to;
    });
    const revOrders = inRange.filter(isRevenue);
    const revenue = revOrders.reduce((s, o) => s + o.total, 0);
    const itemsSold = revOrders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.quantity, 0), 0);

    const salesByName = {};
    for (const o of revOrders) {
      for (const it of o.items) {
        const k = it.name || 'Unknown';
        (salesByName[k] ||= { name: k, sold: 0, revenue: 0 });
        salesByName[k].sold += it.quantity;
        salesByName[k].revenue += it.price * it.quantity;
      }
    }
    const best = Object.values(salesByName).sort((a, b) => b.sold - a.sold).slice(0, 8);
    const worst = products
      .map(p => ({ name: p.name, sold: salesByName[p.name]?.sold || 0, revenue: salesByName[p.name]?.revenue || 0 }))
      .sort((a, b) => a.sold - b.sold || a.revenue - b.revenue)
      .slice(0, 8);

    const statusCounts = {};
    for (const o of inRange) statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    const statusData = Object.keys(STATUS_COLOR)
      .filter(s => statusCounts[s])
      .map(s => ({ label: s, value: statusCounts[s], color: STATUS_COLOR[s] }));

    const s = series(orders, range.from, range.to, unit);
    return {
      revenue, orders: revOrders.length, aov: revOrders.length ? revenue / revOrders.length : 0,
      itemsSold, best, worst, statusData,
      rev: s.map(b => ({ label: b.label, value: b.rev })),
      count: s.map(b => ({ label: b.label, value: b.count }))
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, products, rangeKey, cFrom, cTo]);

  // ---- monthly comparison (last 12 months, fixed) ----
  const monthly = useMemo(
    () => series(orders, startOfMonth(addMonths(now, -11)), now, 'month').map(b => ({ label: b.label, value: b.rev })),
    [orders, now]
  );

  // ---- trend explorer ----
  const trendData = useMemo(() => {
    const cfg = {
      daily: { from: startOfDay(addDays(now, -29)), unit: 'day' },
      weekly: { from: startOfWeek(addDays(now, -7 * 11)), unit: 'week' },
      monthly: { from: startOfMonth(addMonths(now, -11)), unit: 'month' },
      yearly: { from: startOfYear(new Date(now.getFullYear() - 4, 0, 1)), unit: 'year' }
    }[trend];
    return series(orders, cfg.from, now, cfg.unit).map(b => ({ label: b.label, value: b.rev }));
  }, [orders, trend, now]);

  // ---- stock (not time-based) ----
  const stock = useMemo(() => {
    const out = products.filter(p => (p.stock ?? 0) <= 0);
    const low = products.filter(p => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= LOW_STOCK).sort((a, b) => a.stock - b.stock);
    const high = [...products].sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0)).slice(0, 8);
    const units = products.reduce((s, p) => s + (p.stock ?? 0), 0);
    return { out, low, high, units };
  }, [products]);

  // ---- coupons ----
  const couponStats = useMemo(() => {
    const redemptions = coupons.reduce((s, c) => s + (c.usedCount || 0), 0);
    const active = coupons.filter(c => c.active).length;
    const mostUsed = [...coupons].sort((a, b) => (b.usedCount || 0) - (a.usedCount || 0))[0];
    // Only fixed-amount coupons yield a knowable discount without order linkage.
    const fixedDiscount = coupons
      .filter(c => c.type === 'FIXED')
      .reduce((s, c) => s + (c.value || 0) * (c.usedCount || 0), 0);
    return { redemptions, active, mostUsed, fixedDiscount };
  }, [coupons]);

  if (!ready) {
    return (
      <div className="an">
        <div className="an-stats an-stats--4">
          {['Revenue today', 'Revenue this week', 'Revenue this month', 'Revenue this year'].map(l => (
            <Stat key={l} label={l} value="—" />
          ))}
        </div>
        <div className="an-grid">
          {['Revenue over time', 'Orders over time'].map(t => (
            <Card key={t} title={t} className="an-card--wide"><div className="chart-empty" style={{ height: 220 }}>Loading…</div></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="an">
      {/* Revenue cards */}
      <div className="an-stats an-stats--4">
        <Stat label="Revenue today" value={money(cards.today)} />
        <Stat label="Revenue this week" value={money(cards.week)} />
        <Stat label="Revenue this month" value={money(cards.month)} />
        <Stat label="Revenue this year" value={money(cards.year)} />
      </div>

      {/* Filter bar */}
      <div className="an-filter">
        <div className="an-filter__ranges">
          {RANGES.map(r => (
            <button key={r.key} className={`an-chip${rangeKey === r.key ? ' active' : ''}`} onClick={() => setRangeKey(r.key)}>
              {r.label}
            </button>
          ))}
        </div>
        {rangeKey === 'custom' && (
          <div className="an-filter__custom">
            <DatePicker value={cFrom} onChange={setCFrom} placeholder="From" />
            <span className="an-filter__dash">–</span>
            <DatePicker value={cTo} onChange={setCTo} placeholder="To" />
          </div>
        )}
      </div>

      {/* Range summary */}
      <div className="an-stats an-stats--4">
        <Stat label="Revenue" value={money(scoped.revenue)} sub="selected range" />
        <Stat label="Orders" value={scoped.orders} sub="selected range" />
        <Stat label="Avg. order value" value={money(scoped.aov)} sub="selected range" />
        <Stat label="Items sold" value={scoped.itemsSold} sub="selected range" />
      </div>

      <div className="an-grid">
        <Card title="Revenue over time" subtitle={`by ${unit}`} className="an-card--wide">
          <LineChart data={scoped.rev} format={compact} />
        </Card>
        <Card title="Orders over time" subtitle={`by ${unit}`} className="an-card--wide">
          <BarChart data={scoped.count} format={plainCompact} />
        </Card>

        <Card title="Monthly revenue comparison" subtitle="last 12 months">
          <BarChart data={monthly} format={compact} />
        </Card>
        <Card title="Order status distribution" subtitle="selected range">
          <DonutChart data={scoped.statusData} />
        </Card>

        <Card title="Best sellers" subtitle="selected range">
          <RankTable rows={scoped.best} empty="No sales in this range." />
        </Card>
        <Card title="Worst sellers" subtitle="fewest sold — candidates to drop">
          <RankTable rows={scoped.worst} empty="No products yet." />
        </Card>
      </div>

      {/* Trends */}
      <Card
        title="Sales trend"
        subtitle="revenue"
        className="an-card--wide"
      >
        <div className="an-toggle">
          {['daily', 'weekly', 'monthly', 'yearly'].map(t => (
            <button key={t} className={`an-chip${trend === t ? ' active' : ''}`} onClick={() => setTrend(t)}>
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <LineChart data={trendData} format={compact} />
      </Card>

      {/* Stock */}
      <div className="an-stats an-stats--3">
        <Stat label="Out of stock" value={stock.out.length} sub="products at 0" />
        <Stat label="Low stock" value={stock.low.length} sub={`≤ ${LOW_STOCK} left`} />
        <Stat label="Total units in stock" value={stock.units.toLocaleString()} />
      </div>
      <div className="an-grid">
        <Card title="Low stock" subtitle={`≤ ${LOW_STOCK} left`}>
          <StockTable rows={stock.low} empty="Nothing running low." />
        </Card>
        <Card title="Out of stock">
          <StockTable rows={stock.out} empty="Everything is in stock." />
        </Card>
        <Card title="Highest stock">
          <StockTable rows={stock.high} empty="No products yet." />
        </Card>
      </div>

      {/* Coupons & payment */}
      <div className="an-grid">
        <Card title="Coupon usage">
          <div className="an-stats an-stats--2 an-stats--flush">
            <Stat label="Total redemptions" value={couponStats.redemptions} />
            <Stat label="Active coupons" value={couponStats.active} />
          </div>
          <div className="an-line">
            <span>Most used</span>
            <strong>{couponStats.mostUsed?.usedCount ? `${couponStats.mostUsed.code} (${couponStats.mostUsed.usedCount})` : '—'}</strong>
          </div>
          <div className="an-line">
            <span>Fixed-amount discount given</span>
            <strong>{money(couponStats.fixedDiscount)}</strong>
          </div>
          <p className="an-note">Percentage-coupon revenue impact needs checkout tracking (order ⇄ coupon link).</p>
        </Card>
        <Card title="Revenue by payment method">
          <div className="an-empty an-empty--tall">
            Payment method isn’t recorded on orders yet.
            <span>Add a <code>paymentMethod</code> field to start tracking this.</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StockTable({ rows, empty }) {
  if (!rows.length) return <div className="an-empty">{empty}</div>;
  return (
    <table className="an-table">
      <thead><tr><th>Product</th><th className="num">Stock</th></tr></thead>
      <tbody>
        {rows.map(p => (
          <tr key={p.id}>
            <td>{p.name}</td>
            <td className="num">
              <span className={`an-stock${p.stock <= 0 ? ' an-stock--out' : p.stock <= LOW_STOCK ? ' an-stock--low' : ''}`}>
                {p.stock ?? 0}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
