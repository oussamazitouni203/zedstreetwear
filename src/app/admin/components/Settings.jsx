'use client';

import { useState } from 'react';

// Declarative schema for the whole settings area. `def` sets the default value.
const SECTIONS = [
  {
    key: 'general', label: 'General', icon: 'store', sub: 'Store identity & details', group: 'Store',
    desc: 'Store identity and basic details.',
    fields: [
      { k: 'storeName', label: 'Store name', type: 'text', def: 'The Bespoke', ph: 'The Bespoke' },
      { k: 'tagline', label: 'Tagline', type: 'text', def: 'Monochrome streetwear.', ph: 'A short slogan' },
      { k: 'supportEmail', label: 'Support email', type: 'email', def: '', ph: 'hello@store.com' },
      { k: 'phone', label: 'Phone', type: 'text', def: '', ph: '+1 555 123 4567' },
      { k: 'address', label: 'Business address', type: 'textarea', def: '' },
      { k: 'currency', label: 'Currency', type: 'select', def: 'USD', options: ['USD', 'EUR', 'GBP', 'DZD', 'MAD'] },
      { k: 'weightUnit', label: 'Weight unit', type: 'select', def: 'kg', options: ['kg', 'g', 'lb', 'oz'] }
    ]
  },
  {
    key: 'social', label: 'Social media', icon: 'share', sub: 'Links shown on your site', group: 'Store',
    desc: 'Links to your social profiles, shown in the site footer. Leave a field blank to hide it.',
    fields: [
      { k: 'facebook', label: 'Facebook page URL', type: 'text', def: '', ph: 'https://facebook.com/yourpage' },
      { k: 'instagram', label: 'Instagram URL', type: 'text', def: '', ph: 'https://instagram.com/yourhandle' },
      { k: 'tiktok', label: 'TikTok URL', type: 'text', def: '', ph: 'https://tiktok.com/@yourhandle' },
      { k: 'whatsapp', label: 'WhatsApp number', type: 'text', def: '', ph: '+1 555 123 4567', help: 'Country code + number. Turns into a wa.me chat link.' }
    ]
  },
  {
    key: 'notifications', label: 'Notifications', icon: 'bell', sub: 'Order & stock alerts', group: 'Store',
    desc: 'When and how you and your customers are notified.',
    fields: [
      { k: 'adminEmail', label: 'Admin notification email', type: 'email', def: '' },
      { k: 'notifyNewOrder', label: 'Email me on new orders', type: 'toggle', def: true },
      { k: 'notifyShipped', label: 'Email customer when shipped', type: 'toggle', def: true },
      { k: 'notifyLowStock', label: 'Low-stock alerts', type: 'toggle', def: true },
      { k: 'orderConfirmations', label: 'Send order confirmations', type: 'toggle', def: true }
    ]
  },
  {
    key: 'security', label: 'Security', icon: 'shield', sub: 'Access & protection', group: 'Business',
    desc: 'Access and account protection.',
    fields: [
      { k: 'maintenanceMode', label: 'Maintenance mode (storefront offline)', type: 'toggle', def: false },
      { k: 'allowRegistration', label: 'Allow new admin sign-ups', type: 'toggle', def: false },
      { k: 'strongPasswords', label: 'Require strong passwords', type: 'toggle', def: true },
      { k: 'sessionDays', label: 'Session length (days)', type: 'number', def: 7 }
    ]
  },
  {
    key: 'seo', label: 'SEO & Analytics', icon: 'search', sub: 'Search & tracking', group: 'Business',
    desc: 'Search visibility and tracking.',
    fields: [
      { k: 'metaTitle', label: 'Default meta title', type: 'text', def: '' },
      { k: 'metaDescription', label: 'Default meta description', type: 'textarea', def: '' },
      { k: 'ogImage', label: 'Social share image URL', type: 'text', def: '' },
      { k: 'gaId', label: 'Google Analytics ID', type: 'text', def: '', ph: 'G-XXXXXXXXXX' },
      { k: 'pixelId', label: 'Meta Pixel ID', type: 'text', def: '' },
      { k: 'indexable', label: 'Allow search engines to index the store', type: 'toggle', def: true }
    ]
  },
  {
    key: 'integrations', label: 'Integrations', icon: 'plug', sub: 'Stripe, Instagram & more', group: 'Business',
    desc: 'Connect third-party services.',
    fields: [
      { k: 'instagramToken', label: 'Instagram access token', type: 'secret', def: '' },
      { k: 'stripePk', label: 'Stripe publishable key', type: 'text', def: '', ph: 'pk_live_…' },
      { k: 'stripeSk', label: 'Stripe secret key', type: 'secret', def: '', ph: 'sk_live_…' },
      { k: 'mailchimpKey', label: 'Mailchimp API key', type: 'secret', def: '' },
      { k: 'webhookUrl', label: 'Order webhook URL', type: 'text', def: '' }
    ]
  },
  {
    key: 'advanced', label: 'Advanced', icon: 'code', sub: 'Power-user options', group: 'Business',
    desc: 'Power-user options. Change with care.',
    fields: [
      { k: 'customCss', label: 'Custom CSS', type: 'textarea', def: '' },
      { k: 'headScripts', label: 'Custom <head> scripts', type: 'textarea', def: '' },
      { k: 'rateLimit', label: 'API rate limit (requests/min)', type: 'number', def: 60 }
    ]
  }
];

const defaultsFor = section => Object.fromEntries(section.fields.map(f => [f.k, f.def]));

// Merge saved values over defaults so every field always has a value.
function mergeAll(saved) {
  const out = {};
  for (const s of SECTIONS) out[s.key] = { ...defaultsFor(s), ...(saved?.[s.key] || {}) };
  return out;
}

// The current admin's own account — a per-user section, not part of the
// store-wide settings schema, so it has no `fields`/`desc`.
const ACCOUNT = { key: 'account', label: 'Account', icon: 'user', sub: 'Your profile & password', group: 'Personal' };

// Nav entries grouped by their `group`, preserving declaration order.
const NAV_GROUPS = [ACCOUNT, ...SECTIONS].reduce((acc, s) => {
  const g = acc.find(x => x.label === s.group) || (acc.push({ label: s.group, items: [] }), acc[acc.length - 1]);
  g.items.push(s);
  return acc;
}, []);

function SetIcon({ name }) {
  const p = {
    width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round'
  };
  switch (name) {
    case 'user':
      return <svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
    case 'store':
      return <svg {...p}><path d="M4.5 4h15l1.5 5H3Z" /><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" /><path d="M9 20v-5h6v5" /></svg>;
    case 'share':
      return <svg {...p}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.6" y1="10.5" x2="15.4" y2="6.5" /><line x1="8.6" y1="13.5" x2="15.4" y2="17.5" /></svg>;
    case 'bell':
      return <svg {...p}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>;
    case 'shield':
      return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>;
    case 'search':
      return <svg {...p}><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
    case 'plug':
      return <svg {...p}><path d="M9 2v6M15 2v6M7 8h10v2a5 5 0 0 1-10 0Z" /><line x1="12" y1="15" x2="12" y2="22" /></svg>;
    case 'code':
      return <svg {...p}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>;
    default:
      return null;
  }
}

function Switch({ checked, onChange }) {
  return (
    <label className="set-switch">
      <input type="checkbox" checked={!!checked} onChange={e => onChange(e.target.checked)} />
      <span className="set-switch__track" />
    </label>
  );
}

function Field({ field, value, onChange }) {
  if (field.type === 'toggle') {
    return (
      <div className="set-field set-field--toggle">
        <div>
          <label>{field.label}</label>
          {field.help && <p className="set-field__help">{field.help}</p>}
        </div>
        <Switch checked={value} onChange={onChange} />
      </div>
    );
  }
  return (
    <div className="set-field">
      <label>{field.label}</label>
      {field.type === 'textarea' ? (
        <textarea rows={4} value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={field.ph} />
      ) : field.type === 'select' ? (
        <select value={value ?? ''} onChange={e => onChange(e.target.value)}>
          {field.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'secret' ? 'password' : 'text'}
          value={value ?? ''}
          onChange={e => onChange(field.type === 'number' ? e.target.value : e.target.value)}
          placeholder={field.ph}
          autoComplete={field.type === 'secret' ? 'new-password' : 'off'}
        />
      )}
      {field.help && <p className="set-field__help">{field.help}</p>}
    </div>
  );
}

// Profile + password for the signed-in admin. Uses its own local state and
// action (onSave) rather than the store-wide settings schema.
function AccountPanel({ account = {}, onSave, busy }) {
  const [name, setName] = useState(account.name || '');
  const [email, setEmail] = useState(account.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);

  const dirty =
    name !== (account.name || '') ||
    email !== (account.email || '') ||
    newPassword.length > 0;

  const save = async () => {
    setError(null);
    if (!name.trim()) return setError('Name is required.');
    if (!email.includes('@')) return setError('Enter a valid email address.');
    if (newPassword) {
      if (!currentPassword) return setError('Enter your current password to set a new one.');
      if (newPassword.length < 6) return setError('New password must be at least 6 characters.');
      if (newPassword !== confirm) return setError('New passwords do not match.');
    }
    try {
      await onSave({ name: name.trim(), email: email.trim(), currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirm('');
    } catch (e) {
      setError(e?.message || 'Could not update your account.');
    }
  };

  return (
    <div className="set__panel">
      <h2>Account</h2>
      <p className="set__desc">Your personal profile and sign-in details.</p>

      <div className="set-field">
        <label>Name</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
      </div>
      <div className="set-field">
        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@store.com" autoComplete="off" />
      </div>

      <div className="set__divider" />
      <p className="set__grouphead">Change password</p>
      <p className="set-field__help" style={{ marginBottom: 16 }}>Leave blank to keep your current password.</p>

      <div className="set-field">
        <label>Current password</label>
        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} autoComplete="current-password" placeholder="••••••••" />
      </div>
      <div className="set-field">
        <label>New password</label>
        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoComplete="new-password" placeholder="At least 6 characters" />
      </div>
      <div className="set-field">
        <label>Confirm new password</label>
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" placeholder="Re-enter new password" />
      </div>

      {error && <p className="set__error">{error}</p>}

      <div className="set__foot">
        <button className="adm-btn" disabled={busy || !dirty} onClick={save}>
          {busy ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
        </button>
        {dirty && <span className="set__unsaved">Unsaved changes</span>}
      </div>
    </div>
  );
}

export default function Settings({ settings, account, onSave, onSaveAccount, onClearCache, busy }) {
  const [active, setActive] = useState('account');
  const [form, setForm] = useState(() => mergeAll(settings));
  const [saved, setSaved] = useState(() => mergeAll(settings));

  const section = SECTIONS.find(s => s.key === active);
  const setField = (k, v) => setForm(f => ({ ...f, [active]: { ...f[active], [k]: v } }));
  const dirty = JSON.stringify(form[active]) !== JSON.stringify(saved[active]);

  const save = async () => {
    // Coerce numeric fields before persisting.
    const values = { ...form[active] };
    for (const fld of section.fields) {
      if (fld.type === 'number') values[fld.k] = values[fld.k] === '' ? 0 : Number(values[fld.k]);
    }
    await onSave(active, values);
    setForm(f => ({ ...f, [active]: values }));
    setSaved(s => ({ ...s, [active]: values }));
  };

  return (
    <div className="set">
      <nav className="set__nav">
        {NAV_GROUPS.map(g => (
          <div className="set__nav-group" key={g.label}>
            <p className="set__nav-grouplabel">{g.label}</p>
            {g.items.map(s => (
              <button
                key={s.key}
                className={`set__nav-item${active === s.key ? ' active' : ''}`}
                onClick={() => setActive(s.key)}
              >
                <span className="set__nav-ic"><SetIcon name={s.icon} /></span>
                <span className="set__nav-body">
                  <span className="set__nav-label">{s.label}</span>
                  <span className="set__nav-sub">{s.sub}</span>
                </span>
                {JSON.stringify(form[s.key]) !== JSON.stringify(saved[s.key]) && <span className="set__dot" />}
                <svg className="set__nav-caret" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18" /></svg>
              </button>
            ))}
          </div>
        ))}
      </nav>
      <p className="set__swipe">Swipe for more →</p>

      {active === 'account' ? (
        <AccountPanel account={account} onSave={onSaveAccount} busy={busy} />
      ) : (
        <div className="set__panel">
          <h2>{section.label}</h2>
          <p className="set__desc">{section.desc}</p>

          {section.fields.map(f => (
            <Field key={f.k} field={f} value={form[active][f.k]} onChange={v => setField(f.k, v)} />
          ))}

          {active === 'advanced' && (
            <div className="set__danger">
              <div>
                <p className="set__danger-title">Clear storefront cache</p>
                <p className="set-field__help">Force the shop and home pages to rebuild with the latest data.</p>
              </div>
              <button className="adm-btn adm-btn--ghost" disabled={busy} onClick={onClearCache}>Clear cache</button>
            </div>
          )}

          <div className="set__foot">
            <button className="adm-btn" disabled={busy || !dirty} onClick={save}>
              {busy ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
            </button>
            {dirty && <span className="set__unsaved">Unsaved changes</span>}
          </div>
        </div>
      )}
    </div>
  );
}
