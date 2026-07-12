import Link from 'next/link';

const VIEWS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'products', label: 'Products' },
  { key: 'categories', label: 'Categories' },
  { key: 'orders', label: 'Orders' },
  { key: 'bundles', label: 'Bundles' },
  { key: 'users', label: 'Users' }
];

const hrefFor = key => (key === 'dashboard' ? '/admin' : `/admin?tab=${key}`);

// Two modes:
//  - SPA (inside AdminApp): pass `onNavigate` -> buttons switch view in place.
//  - Link (inside sub-route pages): omit `onNavigate` -> nav items are links.
export default function Sidebar({ view, onNavigate, pendingCount, adminName }) {
  return (
    <aside className="adm-sidebar">
      <div className="adm-sidebar__brand">
        <p className="name">The Bespoke</p>
        <p className="sub">Admin</p>
      </div>
      <nav className="adm-sidebar__nav">
        {VIEWS.map(v => {
          const active = view === v.key ? 'active' : '';
          const badge =
            v.key === 'orders' && pendingCount > 0 ? <span className="badge">{pendingCount}</span> : null;
          return onNavigate ? (
            <button key={v.key} className={active} onClick={() => onNavigate(v.key)}>
              <span>{v.label}</span>
              {badge}
            </button>
          ) : (
            <Link key={v.key} href={hrefFor(v.key)} className={active}>
              <span>{v.label}</span>
              {badge}
            </Link>
          );
        })}
      </nav>
      <div className="adm-sidebar__user">
        <div className="adm-sidebar__avatar">
          {(adminName || 'Z').split(' ').map(w => w[0]).join('').slice(0, 2)}
        </div>
        <div>
          <p className="name">{adminName || 'Admin'}</p>
          <p className="role">Owner</p>
        </div>
      </div>
    </aside>
  );
}
