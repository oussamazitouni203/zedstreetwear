import Link from 'next/link';
import { useState } from 'react';
import BulkBar from './BulkBar.jsx';

export default function Categories({ categories, search, onDelete, onBulkDelete }) {
  const q = search.trim().toLowerCase();
  const filtered = categories.filter(
    c => !q || c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
  );

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
        <p className="count">{categories.length} categories</p>
        <Link className="adm-btn" href="/admin/categories/new">+ Add category</Link>
      </div>

      <BulkBar count={selectedIds.length} onClear={clear}>
        <button className="adm-btn adm-btn--danger" onClick={() => onBulkDelete(selectedIds)}>
          Delete selected
        </button>
      </BulkBar>

      <div className="adm-card">
        <div className="adm-table__head categories-admin-grid">
          <span className="sel-cell">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" />
          </span>
          <span /><span>Name</span><span>Slug</span><span>Parent</span>
          <span>Products</span><span style={{ justifySelf: 'end' }}>Actions</span>
        </div>
        {filtered.map(c => (
          <div key={c.id} className={`adm-table__row categories-admin-grid${selected.has(c.id) ? ' selected' : ''}`}>
            <span className="sel-cell">
              <input
                type="checkbox"
                checked={selected.has(c.id)}
                onChange={() => toggle(c.id)}
                aria-label={`Select ${c.name}`}
              />
            </span>
            <div className="thumb">
              {c.image ? <img src={c.image} alt="" /> : null}
            </div>
            <span className="cell-primary" style={{ fontWeight: 500 }}>{c.name}</span>
            <span data-label="Slug" style={{ color: '#666' }}>{c.slug}</span>
            <span data-label="Parent" style={{ color: c.parentName ? '#111' : '#bbb' }}>{c.parentName || '—'}</span>
            <span data-label="Products" className="num">{c.productCount}</span>
            <div className="row-actions">
              <Link className="adm-btn--small" href={`/admin/categories/${c.id}/edit`}>Edit</Link>
              <button className="delete-btn" onClick={() => onDelete(c.id)} aria-label={`Delete ${c.name}`}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
