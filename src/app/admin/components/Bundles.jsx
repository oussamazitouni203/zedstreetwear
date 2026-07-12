import Link from 'next/link';
import { useState } from 'react';
import { money } from '../data.js';
import BulkBar from './BulkBar.jsx';

export default function Bundles({ bundles, onToggle, onDiscount, onDelete, onBulkDelete, onBulkActive }) {
  const [selected, setSelected] = useState(() => new Set());
  const selectedIds = bundles.filter(b => selected.has(b.id)).map(b => b.id);
  const allSelected = bundles.length > 0 && selectedIds.length === bundles.length;

  const toggleSel = id =>
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(bundles.map(b => b.id)));
  const clear = () => setSelected(new Set());

  return (
    <div>
      <div className="adm-toolbar">
        <p className="count">
          {bundles.length} bundles
          {bundles.length > 0 && (
            <button className="adm-linkish" onClick={toggleAll}>
              {allSelected ? ' · Deselect all' : ' · Select all'}
            </button>
          )}
        </p>
        <Link className="adm-btn" href="/admin/bundles/new">+ Add bundle</Link>
      </div>

      <BulkBar count={selectedIds.length} onClear={clear}>
        <button className="adm-btn adm-btn--ghost" onClick={() => onBulkActive(selectedIds, true)}>Activate</button>
        <button className="adm-btn adm-btn--ghost" onClick={() => onBulkActive(selectedIds, false)}>Deactivate</button>
        <button className="adm-btn adm-btn--danger" onClick={() => onBulkDelete(selectedIds)}>Delete selected</button>
      </BulkBar>

      <div className="bundles-admin">
        {bundles.map(b => {
          const price = Math.round(b.base * (1 - b.discount / 100));
          return (
            <div key={b.id} className={`bundle-admin-card${b.active ? '' : ' inactive'}${selected.has(b.id) ? ' selected' : ''}`}>
              <label className="bundle-admin-card__select">
                <input type="checkbox" checked={selected.has(b.id)} onChange={() => toggleSel(b.id)} aria-label={`Select ${b.name}`} />
              </label>
              <div className="bundle-admin-card__top">
                <div>
                  <h3>{b.name}</h3>
                  <p className="items">{b.items}</p>
                </div>
                <button
                  className={`bundle-toggle${b.active ? ' active' : ''}`}
                  onClick={() => onToggle(b.id)}
                >
                  {b.active ? 'Active' : 'Inactive'}
                </button>
              </div>
              <div className="bundle-admin-card__bottom">
                <div>
                  <p className="field-label">Discount</p>
                  <div className="discount-stepper">
                    <button onClick={() => onDiscount(b.id, -5)} aria-label="Decrease discount">−</button>
                    <span className="pct num">{b.discount}%</span>
                    <button onClick={() => onDiscount(b.id, 5)} aria-label="Increase discount">+</button>
                  </div>
                </div>
                <div className="bundle-price">
                  <p className="field-label">Bundle price</p>
                  <p className="current num">{money(price)}</p>
                  <p className="was">{money(b.base)}</p>
                </div>
              </div>
              <div className="bundle-admin-card__actions">
                <Link className="adm-btn--small" href={`/admin/bundles/${b.id}/edit`}>Edit</Link>
                <button className="delete-btn" onClick={() => onDelete(b.id)} aria-label={`Delete ${b.name}`}>✕</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
