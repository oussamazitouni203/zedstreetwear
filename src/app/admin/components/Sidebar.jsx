'use client';

import Link from 'next/link';
import { useState } from 'react';
import { logout } from '../../login/actions.js';

const VIEWS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'products', label: 'Products' },
  { key: 'categories', label: 'Categories' },
  { key: 'attributes', label: 'Attributes' },
  { key: 'orders', label: 'Orders' },
  { key: 'bundles', label: 'Bundles' },
  { key: 'users', label: 'Users' }
];

// Quick-access tabs shown in the phone bottom bar (plus a Menu button).
const QUICK = ['products', 'orders', 'users'];

const hrefFor = key => (key === 'dashboard' ? '/admin' : `/admin?tab=${key}`);

function Icon({ name }) {
  const p = {
    width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round'
  };
  switch (name) {
    case 'dashboard':
      return <svg {...p}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>;
    case 'products':
      return <svg {...p}><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 3 12V4a1 1 0 0 1 1-1h8a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.6Z" /><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" /></svg>;
    case 'categories':
      return <svg {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /></svg>;
    case 'attributes':
      return <svg {...p}><line x1="4" y1="7" x2="20" y2="7" /><circle cx="9" cy="7" r="2.2" /><line x1="4" y1="17" x2="20" y2="17" /><circle cx="15" cy="17" r="2.2" /></svg>;
    case 'orders':
      return <svg {...p}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>;
    case 'bundles':
      return <svg {...p}><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z" /><path d="M12 12 4 7.5M12 12l8-4.5M12 12v9" /></svg>;
    case 'users':
      return <svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
    case 'menu':
      return <svg {...p}><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
    default:
      return null;
  }
}

export default function Sidebar({ view, onNavigate, pendingCount, adminName }) {
  const [sheet, setSheet] = useState(false);

  const badge = key =>
    key === 'orders' && pendingCount > 0 ? <span className="badge">{pendingCount}</span> : null;

  // Renders a nav target as a button (SPA) or a link (sub-route pages).
  const navItem = (key, className, children) =>
    onNavigate ? (
      <button
        key={key}
        type="button"
        className={className}
        onClick={() => {
          onNavigate(key);
          setSheet(false);
        }}
      >
        {children}
      </button>
    ) : (
      <Link key={key} href={hrefFor(key)} className={className} onClick={() => setSheet(false)}>
        {children}
      </Link>
    );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar__brand">
          <p className="name">The Bespoke</p>
          <p className="sub">Admin</p>
        </div>
        <nav className="adm-sidebar__nav">
          {VIEWS.map(v =>
            navItem(v.key, view === v.key ? 'active' : '', (
              <>
                <span>{v.label}</span>
                {badge(v.key)}
              </>
            ))
          )}
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

      {/* Phone bottom nav */}
      <nav className="adm-mobilenav">
        {QUICK.map(key => {
          const v = VIEWS.find(x => x.key === key);
          return navItem(key, `adm-mobilenav__item${view === key ? ' active' : ''}`, (
            <>
              <span className="adm-mobilenav__icon"><Icon name={key} />{badge(key)}</span>
              <span className="adm-mobilenav__label">{v.label}</span>
            </>
          ));
        })}
        <button type="button" className="adm-mobilenav__item" onClick={() => setSheet(true)}>
          <span className="adm-mobilenav__icon"><Icon name="menu" /></span>
          <span className="adm-mobilenav__label">Menu</span>
        </button>
      </nav>

      {/* Full menu sheet */}
      {sheet && (
        <div className="adm-sheet" onClick={() => setSheet(false)}>
          <div className="adm-sheet__panel" onClick={e => e.stopPropagation()}>
            <div className="adm-sheet__head">
              <div>
                <p className="adm-sheet__brand">The Bespoke</p>
                <p className="adm-sheet__sub">{adminName || 'Admin'}</p>
              </div>
              <button className="adm-sheet__close" aria-label="Close menu" onClick={() => setSheet(false)}>×</button>
            </div>
            <nav className="adm-sheet__nav">
              {VIEWS.map(v =>
                navItem(v.key, `adm-sheet__item${view === v.key ? ' active' : ''}`, (
                  <>
                    <Icon name={v.key} />
                    <span>{v.label}</span>
                    {badge(v.key)}
                  </>
                ))
              )}
            </nav>
            <div className="adm-sheet__foot">
              <a href="/" className="adm-sheet__link">View site ↗</a>
              <form action={logout}>
                <button type="submit" className="adm-sheet__logout">Log out</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
