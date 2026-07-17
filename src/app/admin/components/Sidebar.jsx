'use client';

import Link from 'next/link';
import { useState } from 'react';
import { logout } from '../../login/actions.js';

// Grouped admin navigation.
const NAV = [
  { type: 'item', key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  {
    type: 'group',
    label: 'Catalog',
    icon: 'catalog',
    items: [
      { key: 'products', label: 'Products' },
      { key: 'categories', label: 'Categories' },
      { key: 'attributes', label: 'Attributes' },
      { key: 'bundles', label: 'Bundles' }
    ]
  },
  {
    type: 'group',
    label: 'Sales',
    icon: 'sales',
    items: [
      { key: 'orders', label: 'Orders' },
      { key: 'returns', label: 'Return Orders' },
      { key: 'coupons', label: 'Coupons' },
      { key: 'shipping', label: 'Shipping' }
    ]
  },
  { type: 'item', key: 'analytics', label: 'Analytics', icon: 'analytics' },
  {
    type: 'group',
    label: 'Content',
    icon: 'content',
    items: [{ key: 'banners', label: 'Banners' }]
  },
  { type: 'item', key: 'users', label: 'Users', icon: 'users' },
  { type: 'item', key: 'settings', label: 'Settings', icon: 'settings' }
];

// Quick-access tabs shown in the phone bottom bar (plus a Menu button).
const QUICK = ['products', 'orders', 'users'];

const hrefFor = key => (key === 'dashboard' ? '/admin' : `/admin/${key}`);

export function Icon({ name }) {
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
    case 'analytics':
      return <svg {...p}><line x1="4" y1="20" x2="4" y2="10" /><line x1="10" y1="20" x2="10" y2="4" /><line x1="16" y1="20" x2="16" y2="13" /><line x1="21" y1="20" x2="3" y2="20" /></svg>;
    case 'settings':
      return <svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4.6 15H4a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 5.4 8L5.3 8a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 11 4.6V4a2 2 0 1 1 4 0v.1A1.6 1.6 0 0 0 17 5.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.6H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" /></svg>;
    case 'catalog':
      return <svg {...p}><path d="M2 4h6a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H2Z" /><path d="M22 4h-6a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5H22Z" /></svg>;
    case 'sales':
      return <svg {...p}><circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none" /><circle cx="18" cy="20" r="1.4" fill="currentColor" stroke="none" /><path d="M2 3h2.2l2.3 12.2a1.6 1.6 0 0 0 1.6 1.3h9a1.6 1.6 0 0 0 1.6-1.3L21 7H6" /></svg>;
    case 'content':
      return <svg {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.6" /><path d="m5 18 4.5-4.5a1.5 1.5 0 0 1 2 0L20 18" /></svg>;
    case 'returns':
      return <svg {...p}><path d="M3 7v5h5" /><path d="M3.5 12a8.5 8.5 0 1 1 2.5 6" /></svg>;
    case 'coupons':
      return <svg {...p}><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4Z" /><line x1="14" y1="7" x2="14" y2="17" strokeDasharray="1.5 3" /></svg>;
    case 'banners':
      return <svg {...p}><line x1="5" y1="21" x2="5" y2="4" /><path d="M5 4h13l-2.5 3.5L18 11H5Z" /></svg>;
    case 'shipping':
      return <svg {...p}><path d="M1 3h14v13H1z" /><path d="M15 8h4l3 3v5h-7z" /><circle cx="6" cy="18.5" r="1.8" /><circle cx="18" cy="18.5" r="1.8" /></svg>;
    case 'menu':
      return <svg {...p}><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
    default:
      return null;
  }
}

const GROUP_LABELS = NAV.filter(e => e.type === 'group').map(e => e.label);

export default function Sidebar({ view, onNavigate, pendingCount, adminName }) {
  const [sheet, setSheet] = useState(false);
  // All groups start expanded; each can be collapsed independently.
  const [openGroups, setOpenGroups] = useState(() => new Set(GROUP_LABELS));

  const toggleGroup = label =>
    setOpenGroups(s => {
      const n = new Set(s);
      n.has(label) ? n.delete(label) : n.add(label);
      return n;
    });

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

  // Grouped navigation used by both the sidebar and the mobile sheet.
  const renderNav = (itemClass, subClass, groupClass, groupLabelClass, withIcons) =>
    NAV.map(entry =>
      entry.type === 'item'
        ? navItem(entry.key, `${itemClass}${view === entry.key ? ' active' : ''}`, (
            <>
              <Icon name={entry.icon} />
              <span className="adm-nav-item__label">{entry.label}</span>
              {badge(entry.key)}
            </>
          ))
        : (() => {
            const open = openGroups.has(entry.label);
            const groupBadge = !open && entry.items.some(it => it.key === 'orders') ? badge('orders') : null;
            return (
              <div key={entry.label} className={groupClass}>
                <button
                  type="button"
                  className={`${groupLabelClass}${open ? ' open' : ''}`}
                  aria-expanded={open}
                  onClick={() => toggleGroup(entry.label)}
                >
                  <Icon name={entry.icon} />
                  <span className="adm-nav-item__label">{entry.label}</span>
                  {groupBadge}
                  <svg className="adm-nav-caret" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                <div className={`adm-nav-collapse${open ? ' open' : ''}`}>
                  <div className="adm-nav-collapse__inner">
                    {entry.items.map(it =>
                      navItem(it.key, `${subClass}${view === it.key ? ' active' : ''}`, (
                        <>
                          {withIcons && <Icon name={it.key} />}
                          <span className="adm-nav-item__label">{it.label}</span>
                          {badge(it.key)}
                        </>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })()
    );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar__brand">
          <p className="name">The Bespoke</p>
          <p className="sub">Admin</p>
        </div>
        <div className="adm-sidebar__scroll">
          <nav className="adm-sidebar__nav">
            {renderNav('adm-nav-item', 'adm-nav-item adm-nav-item--sub', 'adm-nav-group', 'adm-nav-group__label', true)}
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
        </div>
      </aside>

      {/* Phone bottom nav */}
      <nav className="adm-mobilenav">
        {QUICK.map(key =>
          navItem(key, `adm-mobilenav__item${view === key ? ' active' : ''}`, (
            <>
              <span className="adm-mobilenav__icon"><Icon name={key} />{badge(key)}</span>
              <span className="adm-mobilenav__label">
                {key === 'products' ? 'Products' : key === 'orders' ? 'Orders' : 'Users'}
              </span>
            </>
          ))
        )}
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
              {renderNav('adm-sheet__item', 'adm-sheet__item adm-sheet__item--sub', 'adm-sheet__group', 'adm-sheet__group-label', true)}
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
