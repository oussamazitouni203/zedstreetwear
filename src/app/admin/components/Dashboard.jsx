import { money, topProducts } from '../data.js';
import { StatusPill } from './StatusPill.jsx';

export default function Dashboard({ orders, onViewOrders }) {
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const uniqueCustomers = new Set(orders.map(o => o.customer)).size;
  const stats = [
    { label: 'Revenue (7d)', value: money(revenue), delta: '+12.4% vs last week', muted: false },
    { label: 'Orders (7d)', value: String(orders.length), delta: '+8.1% vs last week', muted: false },
    { label: 'Customers', value: String(uniqueCustomers), delta: '+3.2% vs last week', muted: false },
    { label: 'Conversion', value: '2.8%', delta: '−0.3% vs last week', muted: true }
  ];

  return (
    <div>
      <div className="adm-stats">
        {stats.map(s => (
          <div key={s.label} className="adm-stat">
            <p className="label">{s.label}</p>
            <p className="value">{s.value}</p>
            <p className="delta" style={{ color: s.muted ? '#999' : '#111' }}>{s.delta}</p>
          </div>
        ))}
      </div>

      <div className="adm-dash-grid">
        <div className="adm-card">
          <div className="adm-card__head">
            <h2>Recent orders</h2>
            <button className="adm-link-btn" onClick={onViewOrders}>View all</button>
          </div>
          {orders.slice(0, 5).map(o => (
            <div key={o.id} className="order-row adm-row">
              <span className="id num">{o.number}</span>
              <span className="customer">{o.customer}</span>
              <StatusPill status={o.status} />
              <span className="total num">{money(o.total)}</span>
            </div>
          ))}
        </div>

        <div className="adm-card">
          <div className="adm-card__head">
            <h2>Top products</h2>
          </div>
          {topProducts.map(tp => (
            <div key={tp.name} className="top-product adm-row">
              <div>
                <p className="name">{tp.name}</p>
                <p className="sold">{tp.sold} sold</p>
              </div>
              <div className="top-product__right">
                <div className="top-product__bar"><div style={{ width: tp.barWidth }} /></div>
                <span className="revenue num">{money(tp.revenue)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
