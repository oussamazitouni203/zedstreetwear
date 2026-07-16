import Link from 'next/link';
import { useState } from 'react';
import { money } from '../data.js';
import BulkBar from './BulkBar.jsx';

const PILL = {
  Active: 'pill pill--active',
  Scheduled: 'pill pill--scheduled',
  Expired: 'pill pill--expired',
  'Used up': 'pill pill--usedup',
  Disabled: 'pill pill--disabled'
};

const CouponPill = ({ status }) => <span className={PILL[status] ?? 'pill'}>{status}</span>;

const discountLabel = c => (c.type === 'PERCENT' ? `${c.value}%` : money(c.value));

export default function Coupons({ coupons, search, onDelete, onBulkDelete, onBulkActive }) {
  const q = search.trim().toLowerCase();
  const filtered = coupons.filter(c => !q || c.code.toLowerCase().includes(q));

  const [selected, setSelected] = useState(() => new Set());
  const selectedIds = filtered.filter(c => selected.has(c.id)).map(c => c.id);
  const allSelected = filtered.length > 0 && selectedIds.length === filtered.length;

  const toggle = id =>
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(filtered.map(c => c.id)));
  const clear = () => setSelected(new Set());

  return (
    <div>
      <div className="adm-toolbar">
        <p className="count">{coupons.length} {coupons.length === 1 ? 'coupon' : 'coupons'}</p>
        <Link className="adm-btn" href="/admin/coupons/new">+ Add coupon</Link>
      </div>

      <BulkBar count={selectedIds.length} onClear={clear}>
        <button className="adm-btn adm-btn--ghost" onClick={() => onBulkActive(selectedIds, true)}>Enable</button>
        <button className="adm-btn adm-btn--ghost" onClick={() => onBulkActive(selectedIds, false)}>Disable</button>
        <button className="adm-btn adm-btn--danger" onClick={() => onBulkDelete(selectedIds)}>Delete selected</button>
      </BulkBar>

      <div className="adm-card">
        <div className="adm-table__head coupons-grid">
          <span className="sel-cell">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" />
          </span>
          <span>Code</span><span>Discount</span><span>Min spend</span>
          <span>Usage</span><span>Expires</span><span>Status</span>
          <span style={{ justifySelf: 'end' }}>Actions</span>
        </div>
        {filtered.length === 0 ? (
          <div className="adm-empty">No coupons yet. Create your first discount code.</div>
        ) : (
          filtered.map((c, i) => (
            <div key={c.id} className={`adm-table__row coupons-grid${selected.has(c.id) ? ' selected' : ''}`}>
              <span className="sel-cell">
                <input
                  type="checkbox"
                  checked={selected.has(c.id)}
                  onChange={() => toggle(c.id)}
                  aria-label={`Select ${c.code}`}
                />
              </span>
              <span className="cell-primary">
                <span className="row-id">{i + 1}</span>
                <span className="coupon-code">{c.code}</span>
              </span>
              <span data-label="Discount" className="num" style={{ fontWeight: 600 }}>{discountLabel(c)}</span>
              <span data-label="Min spend" style={{ color: '#666' }}>
                {c.minSpend != null ? money(c.minSpend) : '—'}
              </span>
              <span data-label="Usage" className="num" style={{ color: '#666' }}>
                {c.usedCount} / {c.usageLimit != null ? c.usageLimit : '∞'}
              </span>
              <span data-label="Expires" style={{ color: '#666' }}>{c.expiresAt || '—'}</span>
              <span data-label="Status" className="cell-status"><CouponPill status={c.status} /></span>
              <div className="row-actions">
                <Link className="adm-btn--small" href={`/admin/coupons/${c.id}/edit`}>Edit</Link>
                <button className="delete-btn" onClick={() => onDelete(c.id)} aria-label={`Delete ${c.code}`}>✕</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
