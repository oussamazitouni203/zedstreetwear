import Link from 'next/link';
import { useState } from 'react';
import BulkBar from './BulkBar.jsx';

export default function Attributes({ attributes, search, onDelete, onBulkDelete }) {
  const q = search.trim().toLowerCase();
  const filtered = attributes.filter(
    a => !q || a.name.toLowerCase().includes(q) || a.values.join(' ').toLowerCase().includes(q)
  );

  const [selected, setSelected] = useState(() => new Set());
  const selectedIds = filtered.filter(a => selected.has(a.id)).map(a => a.id);
  const allSelected = filtered.length > 0 && selectedIds.length === filtered.length;

  const toggle = id =>
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(filtered.map(a => a.id)));
  const clear = () => setSelected(new Set());

  return (
    <div>
      <div className="adm-toolbar">
        <p className="count">{attributes.length} attributes</p>
        <Link className="adm-btn" href="/admin/attributes/new">+ Add attribute</Link>
      </div>

      <BulkBar count={selectedIds.length} onClear={clear}>
        <button className="adm-btn adm-btn--danger" onClick={() => onBulkDelete(selectedIds)}>
          Delete selected
        </button>
      </BulkBar>

      <div className="adm-card">
        <div className="adm-table__head attributes-grid">
          <span className="sel-cell">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" />
          </span>
          <span>Name</span><span>Values</span><span>Slug</span>
          <span style={{ justifySelf: 'end' }}>Actions</span>
        </div>
        {filtered.map((a, i) => (
          <div key={a.id} className={`adm-table__row attributes-grid${selected.has(a.id) ? ' selected' : ''}`}>
            <span className="sel-cell">
              <input
                type="checkbox"
                checked={selected.has(a.id)}
                onChange={() => toggle(a.id)}
                aria-label={`Select ${a.name}`}
              />
            </span>
            <span className="cell-primary" style={{ fontWeight: 500 }}>
              <span className="row-id">{i + 1}</span>
              {a.name}
            </span>
            <span data-label="Values" className="attr-values">
              {a.values.map(v => <span key={v} className="attr-chip">{v}</span>)}
            </span>
            <span data-label="Slug" style={{ color: '#666' }}>{a.slug}</span>
            <div className="row-actions">
              <Link className="adm-btn--small" href={`/admin/attributes/${a.id}/edit`}>Edit</Link>
              <button className="delete-btn" onClick={() => onDelete(a.id)} aria-label={`Delete ${a.name}`}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
