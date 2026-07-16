import Link from 'next/link';
import { useState } from 'react';
import BulkBar from './BulkBar.jsx';

const initials = name => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

export default function Users({ users, search, currentUserId, onDelete, onBulkDelete }) {
  const q = search.trim().toLowerCase();
  const filtered = users.filter(
    u => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  );

  // Your own account can't be selected for deletion.
  const selectable = filtered.filter(u => u.id !== currentUserId);
  const [selected, setSelected] = useState(() => new Set());
  const selectedIds = selectable.filter(u => selected.has(u.id)).map(u => u.id);
  const allSelected = selectable.length > 0 && selectedIds.length === selectable.length;

  const toggle = id =>
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(selectable.map(u => u.id)));
  const clear = () => setSelected(new Set());

  return (
    <div>
      <div className="adm-toolbar">
        <p className="count">{users.length} admin {users.length === 1 ? 'account' : 'accounts'}</p>
        <Link className="adm-btn" href="/admin/users/new">+ Add user</Link>
      </div>

      <BulkBar count={selectedIds.length} onClear={clear}>
        <button className="adm-btn adm-btn--danger" onClick={() => onBulkDelete(selectedIds)}>
          Delete selected
        </button>
      </BulkBar>

      <div className="adm-card">
        <div className="adm-table__head users-grid">
          <span className="sel-cell">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" />
          </span>
          <span /><span>Name</span><span>Email</span><span>Role</span>
          <span>Joined</span><span style={{ justifySelf: 'end' }}>Actions</span>
        </div>
        {filtered.map((u, i) => (
          <div key={u.id} className={`adm-table__row users-grid${selected.has(u.id) ? ' selected' : ''}`}>
            <span className="sel-cell">
              <input
                type="checkbox"
                checked={selected.has(u.id)}
                onChange={() => toggle(u.id)}
                disabled={u.id === currentUserId}
                aria-label={`Select ${u.name}`}
              />
            </span>
            <div className="customer-avatar">{initials(u.name)}</div>
            <span className="cell-primary" style={{ fontWeight: 500 }}>
              <span className="row-id">{i + 1}</span>
              {u.name}
              {u.id === currentUserId && <span className="you-badge">You</span>}
            </span>
            <span data-label="Email" style={{ color: '#666' }}>{u.email}</span>
            <span data-label="Role">Admin</span>
            <span data-label="Joined" style={{ color: '#999' }}>{u.joined}</span>
            <div className="row-actions">
              <Link className="adm-btn--small" href={`/admin/users/${u.id}/edit`}>Edit</Link>
              <button
                className="delete-btn"
                onClick={() => onDelete(u.id)}
                disabled={u.id === currentUserId}
                title={u.id === currentUserId ? "You can't delete your own account" : undefined}
                aria-label={`Delete ${u.name}`}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
