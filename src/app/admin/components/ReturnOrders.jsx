import { useState } from 'react';
import { money } from '../data.js';
import { StatusPill } from './StatusPill.jsx';
import BulkBar from './BulkBar.jsx';

// Orders that came back to the store (status = Returned).
export default function ReturnOrders({ orders, search, onOpen, onBulkState, onBulkStatus }) {
  const [selected, setSelected] = useState(() => new Set());
  const q = search.trim().toLowerCase();

  const returned = orders
    .filter(o => o.status === 'Returned' && o.state !== 'TRASHED')
    .filter(o => !q || o.customer.toLowerCase().includes(q) || o.number.toLowerCase().includes(q));

  const selectedIds = returned.filter(o => selected.has(o.id)).map(o => o.id);
  const allSelected = returned.length > 0 && selectedIds.length === returned.length;

  const toggle = id =>
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(returned.map(o => o.id)));
  const clear = () => setSelected(new Set());

  return (
    <div>
      <div className="adm-toolbar">
        <p className="count">{returned.length} returned {returned.length === 1 ? 'order' : 'orders'}</p>
      </div>

      <BulkBar count={selectedIds.length} onClear={clear}>
        <button className="adm-btn adm-btn--ghost" onClick={() => onBulkStatus(selectedIds, 'Pending')}>Restore to orders</button>
        <button className="adm-btn adm-btn--ghost" onClick={() => onBulkState(selectedIds, 'ARCHIVED')}>Archive</button>
        <button className="adm-btn adm-btn--ghost" onClick={() => onBulkState(selectedIds, 'TRASHED')}>Move to trash</button>
      </BulkBar>

      <div className="adm-card">
        <div className="adm-table__head orders-grid">
          <span className="sel-cell">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" />
          </span>
          <span>Order</span><span>Customer</span><span>Date</span>
          <span>Total</span><span>Status</span><span />
        </div>
        {returned.length === 0 ? (
          <div className="adm-empty">No returned orders yet. Open an order and choose “Mark as returned”.</div>
        ) : (
          returned.map(o => (
            <div
              key={o.id}
              className={`adm-table__row orders-grid order-row-clickable${selected.has(o.id) ? ' selected' : ''}`}
              onClick={() => onOpen(o)}
              role="button"
              tabIndex={0}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOpen(o))}
            >
              <span className="sel-cell" onClick={e => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selected.has(o.id)}
                  onChange={() => toggle(o.id)}
                  aria-label={`Select ${o.number}`}
                />
              </span>
              <span className="cell-primary num">{o.number}</span>
              <span data-label="Customer" style={{ fontWeight: 500 }}>{o.customer}</span>
              <span data-label="Date" style={{ color: '#666' }}>{o.date}</span>
              <span data-label="Total" className="num" style={{ fontWeight: 600 }}>{money(o.total)}</span>
              <span data-label="Status" className="cell-status"><StatusPill status={o.status} /></span>
              <span className="cell-chevron" style={{ justifySelf: 'end', color: '#bbb' }}>›</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
