import { useState } from 'react';
import { money } from '../data.js';
import { StatusPill } from './StatusPill.jsx';
import BulkBar from './BulkBar.jsx';

const BUCKETS = [
  { key: 'CURRENT', label: 'Current' },
  { key: 'ARCHIVED', label: 'Archived' },
  { key: 'TRASHED', label: 'Trashed' }
];

const STATUS_FILTERS = ['All', 'Pending', 'Shipped', 'Delivered', 'Canceled', 'Abandoned'];

export default function Orders({ orders, search, onOpen, onBulkState, onBulkDelete }) {
  const [bucket, setBucket] = useState('CURRENT');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(() => new Set());
  const q = search.trim().toLowerCase();

  const countFor = key => orders.filter(o => o.state === key).length;

  const filtered = orders
    .filter(o => o.state === bucket)
    .filter(o => filter === 'All' || o.status === filter)
    .filter(o => !q || o.customer.toLowerCase().includes(q) || o.number.toLowerCase().includes(q));

  const selectedIds = filtered.filter(o => selected.has(o.id)).map(o => o.id);
  const allSelected = filtered.length > 0 && selectedIds.length === filtered.length;

  const toggle = id =>
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(filtered.map(o => o.id)));
  const clear = () => setSelected(new Set());

  const switchBucket = key => {
    setBucket(key);
    setSelected(new Set());
  };

  return (
    <div>
      <div className="order-buckets">
        {BUCKETS.map(b => (
          <button
            key={b.key}
            className={`bucket-tab${bucket === b.key ? ' active' : ''}`}
            onClick={() => switchBucket(b.key)}
          >
            {b.label}
            <span className="bucket-tab__count">{countFor(b.key)}</span>
          </button>
        ))}
      </div>

      <div className="order-filters">
        {STATUS_FILTERS.map(f => (
          <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      <BulkBar count={selectedIds.length} onClear={clear}>
        {bucket === 'CURRENT' && (
          <>
            <button className="adm-btn adm-btn--ghost" onClick={() => onBulkState(selectedIds, 'ARCHIVED')}>Archive</button>
            <button className="adm-btn adm-btn--ghost" onClick={() => onBulkState(selectedIds, 'TRASHED')}>Move to trash</button>
          </>
        )}
        {bucket === 'ARCHIVED' && (
          <>
            <button className="adm-btn adm-btn--ghost" onClick={() => onBulkState(selectedIds, 'CURRENT')}>Restore</button>
            <button className="adm-btn adm-btn--ghost" onClick={() => onBulkState(selectedIds, 'TRASHED')}>Move to trash</button>
          </>
        )}
        {bucket === 'TRASHED' && (
          <>
            <button className="adm-btn adm-btn--ghost" onClick={() => onBulkState(selectedIds, 'CURRENT')}>Restore</button>
            <button className="adm-btn adm-btn--danger" onClick={() => onBulkDelete(selectedIds)}>Delete permanently</button>
          </>
        )}
      </BulkBar>

      <div className="adm-card">
        <div className="adm-table__head orders-grid">
          <span className="sel-cell">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" />
          </span>
          <span>Order</span><span>Customer</span><span>Date</span>
          <span>Total</span><span>Status</span><span />
        </div>
        {filtered.length === 0 ? (
          <div className="adm-empty">No orders here.</div>
        ) : (
          filtered.map(o => (
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
