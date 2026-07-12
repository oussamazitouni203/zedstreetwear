import { money } from '../data.js';

export default function Customers({ customers, search }) {
  const q = search.trim().toLowerCase();
  const filtered = customers.filter(
    c => !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
  );

  const initials = name => name.split(' ').map(w => w[0]).join('');

  return (
    <div className="adm-card">
      <div className="adm-table__head customers-grid">
        <span /><span>Customer</span><span>Email</span>
        <span>Orders</span><span>Spent</span><span>Joined</span>
      </div>
      {filtered.map(c => (
        <div key={c.id} className="adm-table__row customers-grid">
          <div className="customer-avatar">{initials(c.name)}</div>
          <span style={{ fontWeight: 500 }}>{c.name}</span>
          <span style={{ color: '#666' }}>{c.email}</span>
          <span className="num">{c.orders}</span>
          <span className="num" style={{ fontWeight: 600 }}>{money(c.spent)}</span>
          <span style={{ color: '#999' }}>{c.joined}</span>
        </div>
      ))}
    </div>
  );
}
