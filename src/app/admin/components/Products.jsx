import Link from 'next/link';
import { useState } from 'react';
import { money } from '../data.js';
import BulkBar from './BulkBar.jsx';

export default function Products({ products, search, onDelete, onBulkDelete }) {
  const q = search.trim().toLowerCase();
  const filtered = products.filter(
    p => !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  );

  const [selected, setSelected] = useState(() => new Set());
  const selectedIds = filtered.filter(p => selected.has(p.id)).map(p => p.id);
  const allSelected = filtered.length > 0 && selectedIds.length === filtered.length;

  const toggle = id =>
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(filtered.map(p => p.id)));
  const clear = () => setSelected(new Set());

  return (
    <div>
      <div className="adm-toolbar">
        <p className="count">{products.length} products</p>
        <Link className="adm-btn" href="/admin/products/new">+ Add product</Link>
      </div>

      <BulkBar count={selectedIds.length} onClear={clear}>
        <button className="adm-btn adm-btn--danger" onClick={() => onBulkDelete(selectedIds)}>
          Delete selected
        </button>
      </BulkBar>

      <div className="adm-card">
        <div className="adm-table__head products-grid">
          <span className="sel-cell">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" />
          </span>
          <span /><span>Product</span><span>Category</span><span>Price</span>
          <span>Stock</span><span>Tag</span><span style={{ justifySelf: 'end' }}>Actions</span>
        </div>
        {filtered.map(p => (
          <div key={p.id} className={`adm-table__row products-grid${selected.has(p.id) ? ' selected' : ''}`}>
            <span className="sel-cell">
              <input
                type="checkbox"
                checked={selected.has(p.id)}
                onChange={() => toggle(p.id)}
                aria-label={`Select ${p.name}`}
              />
            </span>
            <div className="thumb">{p.principalImage ? <img src={p.principalImage} alt="" /> : null}</div>
            <span className="cell-primary" style={{ fontWeight: 500 }}>{p.name}</span>
            <span data-label="Category" style={{ color: '#666' }}>{p.category}</span>
            <span data-label="Price" className="num">{money(p.price)}</span>
            <span data-label="Stock" className={`num${p.stock < 20 ? ' stock-low' : ''}`}>{p.stock}</span>
            <span data-label="Tag" className="tag-cell">{p.tag}</span>
            <div className="row-actions">
              <Link className="adm-btn--small" href={`/admin/products/${p.id}/edit`}>Edit</Link>
              <button className="delete-btn" onClick={() => onDelete(p.id)} aria-label={`Delete ${p.name}`}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
