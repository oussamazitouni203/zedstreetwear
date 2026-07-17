'use client';

import { useState } from 'react';
import { money } from '../data.js';
import ConfirmDialog from './ConfirmDialog.jsx';
import {
  saveShippingZone, deleteShippingZone,
  saveShippingMethod, deleteShippingMethod, toggleShippingMethod,
  saveShippingClass, deleteShippingClass
} from '../actions.js';

const TYPE_LABEL = { FLAT_RATE: 'Flat rate', FREE_SHIPPING: 'Free shipping', LOCAL_PICKUP: 'Local pickup' };

const methodSummary = m => {
  if (m.type === 'FREE_SHIPPING') {
    return m.minAmount != null ? `Free over ${money(m.minAmount)}` : 'Always free';
  }
  const extras = m.classCosts && Object.keys(m.classCosts).length ? ' + per-class' : '';
  return `${m.cost > 0 ? money(m.cost) : 'Free'}${extras}`;
};

// ---------- Zone add/edit ----------
function ZoneModal({ zone, wilayas, hasDefault, busy, onSave, onClose }) {
  const [name, setName] = useState(zone?.name || '');
  const [isDefault, setIsDefault] = useState(zone?.isDefault || false);
  const [regions, setRegions] = useState(() => new Set(zone?.regions || []));
  const [q, setQ] = useState('');

  const toggle = w =>
    setRegions(s => {
      const n = new Set(s);
      n.has(w) ? n.delete(w) : n.add(w);
      return n;
    });
  const filtered = wilayas.filter(w => w.toLowerCase().includes(q.trim().toLowerCase()));
  const canDefault = !hasDefault || zone?.isDefault;

  return (
    <div className="ship-modal-overlay" onMouseDown={onClose}>
      <div className="ship-modal" onMouseDown={e => e.stopPropagation()}>
        <div className="ship-modal__head">
          <h3>{zone ? 'Edit zone' : 'Add shipping zone'}</h3>
          <button className="ship-modal__x" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="ship-modal__body">
          <label className="adm-form__field">
            <span className="adm-form__label">Zone name</span>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Algiers & central" autoFocus />
          </label>

          {canDefault && (
            <label className="adm-form__check">
              <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} />
              <span>Fallback zone — covers every wilaya not in another zone (“Rest of Algeria”)</span>
            </label>
          )}

          {!isDefault && (
            <div className="adm-form__field">
              <span className="adm-form__label">Regions ({regions.size} selected)</span>
              <input
                className="ship-region-search"
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search wilayas…"
              />
              <div className="ship-region-grid">
                {filtered.map(w => (
                  <label key={w} className={`ship-region${regions.has(w) ? ' on' : ''}`}>
                    <input type="checkbox" checked={regions.has(w)} onChange={() => toggle(w)} />
                    <span>{w}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="ship-modal__foot">
          <button className="adm-btn adm-btn--ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button
            className="adm-btn"
            disabled={busy}
            onClick={() => onSave({ id: zone?.id, name, isDefault, regions: [...regions] })}
          >
            {busy ? 'Saving…' : 'Save zone'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Method add/edit ----------
function MethodModal({ method, zoneId, classes, busy, onSave, onClose }) {
  const [type, setType] = useState(method?.type || 'FLAT_RATE');
  const [title, setTitle] = useState(method?.title || '');
  const [cost, setCost] = useState(method?.cost ?? '');
  const [minAmount, setMinAmount] = useState(method?.minAmount ?? '');
  const [requiresCoupon, setRequiresCoupon] = useState(method?.requiresCoupon || false);
  const [classCosts, setClassCosts] = useState(() => ({ ...(method?.classCosts || {}) }));

  const setClassCost = (id, v) => setClassCosts(c => ({ ...c, [id]: v }));

  return (
    <div className="ship-modal-overlay" onMouseDown={onClose}>
      <div className="ship-modal" onMouseDown={e => e.stopPropagation()}>
        <div className="ship-modal__head">
          <h3>{method ? 'Edit method' : 'Add shipping method'}</h3>
          <button className="ship-modal__x" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="ship-modal__body">
          <div className="adm-form__field">
            <span className="adm-form__label">Method type</span>
            <div className="ship-seg">
              {['FLAT_RATE', 'FREE_SHIPPING', 'LOCAL_PICKUP'].map(t => (
                <button
                  key={t}
                  type="button"
                  className={`ship-seg__opt${type === t ? ' active' : ''}`}
                  onClick={() => setType(t)}
                >
                  {TYPE_LABEL[t]}
                </button>
              ))}
            </div>
          </div>

          <label className="adm-form__field">
            <span className="adm-form__label">Title shown to customer</span>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder={TYPE_LABEL[type]} />
          </label>

          {type !== 'FREE_SHIPPING' && (
            <label className="adm-form__field">
              <span className="adm-form__label">{type === 'LOCAL_PICKUP' ? 'Pickup fee ($)' : 'Cost ($)'}</span>
              <input type="number" min="0" step="0.01" value={cost} onChange={e => setCost(e.target.value)} placeholder="0.00" />
            </label>
          )}

          {type === 'FREE_SHIPPING' && (
            <>
              <label className="adm-form__field">
                <span className="adm-form__label">Minimum order subtotal ($)</span>
                <input type="number" min="0" step="0.01" value={minAmount} onChange={e => setMinAmount(e.target.value)} placeholder="No minimum" />
              </label>
              <label className="adm-form__check">
                <input type="checkbox" checked={requiresCoupon} onChange={e => setRequiresCoupon(e.target.checked)} />
                <span>Requires a free-shipping coupon</span>
              </label>
            </>
          )}

          {type === 'FLAT_RATE' && classes.length > 0 && (
            <div className="adm-form__field">
              <span className="adm-form__label">Per shipping-class surcharge ($)</span>
              <p className="adm-form__hint" style={{ marginTop: 0 }}>Added once per class present in the cart.</p>
              {classes.map(c => (
                <div key={c.id} className="ship-classcost">
                  <span>{c.name}</span>
                  <input
                    type="number"
                    step="0.01"
                    value={classCosts[c.id] ?? ''}
                    onChange={e => setClassCost(c.id, e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="ship-modal__foot">
          <button className="adm-btn adm-btn--ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button
            className="adm-btn"
            disabled={busy}
            onClick={() => onSave({ id: method?.id, zoneId, type, title, cost, minAmount, requiresCoupon, classCosts })}
          >
            {busy ? 'Saving…' : 'Save method'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Shipping class add/edit ----------
function ClassModal({ cls, busy, onSave, onClose }) {
  const [name, setName] = useState(cls?.name || '');
  const [description, setDescription] = useState(cls?.description || '');

  return (
    <div className="ship-modal-overlay" onMouseDown={onClose}>
      <div className="ship-modal ship-modal--sm" onMouseDown={e => e.stopPropagation()}>
        <div className="ship-modal__head">
          <h3>{cls ? 'Edit shipping class' : 'Add shipping class'}</h3>
          <button className="ship-modal__x" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="ship-modal__body">
          <label className="adm-form__field">
            <span className="adm-form__label">Name</span>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Bulky" autoFocus />
          </label>
          <label className="adm-form__field">
            <span className="adm-form__label">Description</span>
            <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional" />
          </label>
        </div>
        <div className="ship-modal__foot">
          <button className="adm-btn adm-btn--ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="adm-btn" disabled={busy} onClick={() => onSave({ id: cls?.id, name, description })}>
            {busy ? 'Saving…' : 'Save class'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Shipping({ zones: initialZones = [], classes: initialClasses = [], wilayas = [], showToast = () => {} }) {
  const [zones, setZones] = useState(initialZones);
  const [classes, setClasses] = useState(initialClasses);
  const [busy, setBusy] = useState(false);

  const [zoneModal, setZoneModal] = useState(null);   // { zone } | { zone: null }
  const [methodModal, setMethodModal] = useState(null); // { zoneId, method }
  const [classModal, setClassModal] = useState(null); // { cls } | { cls: null }
  const [confirm, setConfirm] = useState(null);
  const [openZones, setOpenZones] = useState(() => new Set()); // collapsed by default

  const toggleZone = id =>
    setOpenZones(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const hasDefault = zones.some(z => z.isDefault);

  const run = async (fn, okMsg) => {
    setBusy(true);
    try {
      const r = await fn();
      if (okMsg) showToast(okMsg);
      return r;
    } catch (e) {
      showToast(e?.message || 'Something went wrong.', 'error');
      throw e;
    } finally {
      setBusy(false);
    }
  };

  const upsertZone = z =>
    setZones(list => (list.some(x => x.id === z.id) ? list.map(x => (x.id === z.id ? z : x)) : [...list, z]));

  const saveZone = async values => {
    try {
      const z = await run(() => saveShippingZone(values), 'Zone saved.');
      upsertZone(z);
      setZoneModal(null);
    } catch {}
  };

  const removeZone = zone =>
    setConfirm({
      title: 'Delete zone',
      message: `Delete “${zone.name}” and its shipping methods? This can’t be undone.`,
      run: async () => {
        await run(() => deleteShippingZone(zone.id), 'Zone deleted.');
        setZones(list => list.filter(z => z.id !== zone.id));
      }
    });

  const saveMethod = async values => {
    try {
      const z = await run(() => saveShippingMethod(values), 'Method saved.');
      if (z) upsertZone(z);
      setMethodModal(null);
    } catch {}
  };

  const toggleMethod = async (zoneId, id) => {
    try {
      const z = await run(() => toggleShippingMethod(id));
      if (z) upsertZone(z);
    } catch {}
  };

  const removeMethod = (zoneId, method) =>
    setConfirm({
      title: 'Delete method',
      message: `Remove “${method.title}” from this zone?`,
      run: async () => {
        const z = await run(() => deleteShippingMethod(method.id), 'Method deleted.');
        if (z) upsertZone(z);
      }
    });

  const upsertClass = c =>
    setClasses(list => (list.some(x => x.id === c.id) ? list.map(x => (x.id === c.id ? c : x)) : [...list, c]));

  const saveClass = async values => {
    try {
      const c = await run(() => saveShippingClass(values), 'Shipping class saved.');
      upsertClass(c);
      setClassModal(null);
    } catch {}
  };

  const removeClass = cls =>
    setConfirm({
      title: 'Delete shipping class',
      message: `Delete “${cls.name}”? Products keep existing but lose this class.`,
      run: async () => {
        await run(() => deleteShippingClass(cls.id), 'Shipping class deleted.');
        setClasses(list => list.filter(c => c.id !== cls.id));
      }
    });

  return (
    <div className="ship">
      {/* Zones */}
      <div className="adm-toolbar">
        <div>
          <p className="count">{zones.length} {zones.length === 1 ? 'zone' : 'zones'}</p>
          <p className="ship-sub">Match a customer’s wilaya to a zone, then offer its methods at checkout.</p>
        </div>
        <button className="adm-btn" onClick={() => setZoneModal({ zone: null })}>+ Add zone</button>
      </div>

      {zones.length === 0 ? (
        <div className="adm-card"><div className="adm-empty">No shipping zones yet. Add a zone to start charging shipping.</div></div>
      ) : (
        zones.map(zone => {
          const open = openZones.has(zone.id);
          const count = zone.methods.length;
          return (
          <div key={zone.id} className={`adm-card ship-zone${open ? ' open' : ''}`}>
            <div className="ship-zone__head">
              <button
                type="button"
                className="ship-zone__toggle"
                aria-expanded={open}
                onClick={() => toggleZone(zone.id)}
              >
                <svg className="ship-zone__caret" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18" /></svg>
                <span className="ship-zone__title">
                  <span className="ship-zone__name">{zone.name}</span>
                  {zone.isDefault ? (
                    <span className="ship-tag">Fallback</span>
                  ) : (
                    <span className="ship-zone__regions">
                      {zone.regions.length === 0 ? 'No regions' : zone.regions.slice(0, 4).join(', ')}
                      {zone.regions.length > 4 ? ` +${zone.regions.length - 4} more` : ''}
                    </span>
                  )}
                </span>
                <span className={`ship-zone__count${count === 0 ? ' ship-zone__count--warn' : ''}`}>
                  {count} {count === 1 ? 'method' : 'methods'}
                </span>
              </button>
              <div className="ship-zone__actions">
                <button className="adm-btn--small" onClick={() => setZoneModal({ zone })}>Edit</button>
                <button className="delete-btn" onClick={() => removeZone(zone)} aria-label="Delete zone">✕</button>
              </div>
            </div>

            <div className={`ship-methods-collapse${open ? ' open' : ''}`}>
            <div className="ship-methods-collapse__inner">
            <div className="ship-methods">
              {zone.methods.length === 0 ? (
                <p className="ship-methods__empty">No methods yet — customers in this zone can’t check out until you add one.</p>
              ) : (
                zone.methods.map(m => (
                  <div key={m.id} className={`ship-method${m.enabled ? '' : ' off'}`}>
                    <label className="ship-switch" title={m.enabled ? 'Enabled' : 'Disabled'}>
                      <input type="checkbox" checked={m.enabled} onChange={() => toggleMethod(zone.id, m.id)} disabled={busy} />
                      <span className="ship-switch__track" />
                    </label>
                    <div className="ship-method__info">
                      <span className="ship-method__title">{m.title}</span>
                      <span className="ship-method__type">{TYPE_LABEL[m.type]}</span>
                    </div>
                    <span className="ship-method__cost num">{methodSummary(m)}</span>
                    <div className="ship-method__actions">
                      <button className="adm-btn--small" onClick={() => setMethodModal({ zoneId: zone.id, method: m })}>Edit</button>
                      <button className="delete-btn" onClick={() => removeMethod(zone.id, m)} aria-label="Delete method">✕</button>
                    </div>
                  </div>
                ))
              )}
              <button className="ship-add-method" onClick={() => setMethodModal({ zoneId: zone.id, method: null })}>
                + Add shipping method
              </button>
            </div>
            </div>
            </div>
          </div>
          );
        })
      )}

      {/* Shipping classes */}
      <div className="adm-toolbar ship-classes-head">
        <div>
          <p className="count">Shipping classes</p>
          <p className="ship-sub">Group products so flat-rate methods can charge a surcharge per class.</p>
        </div>
        <button className="adm-btn adm-btn--ghost" onClick={() => setClassModal({ cls: null })}>+ Add class</button>
      </div>

      <div className="adm-card">
        {classes.length === 0 ? (
          <div className="adm-empty">No shipping classes. Optional — use them for bulky or fragile items.</div>
        ) : (
          classes.map(c => (
            <div key={c.id} className="ship-class-row">
              <div>
                <span className="ship-class-row__name">{c.name}</span>
                {c.description && <span className="ship-class-row__desc">{c.description}</span>}
              </div>
              <span className="ship-class-row__count">{c.productCount} {c.productCount === 1 ? 'product' : 'products'}</span>
              <div className="ship-method__actions">
                <button className="adm-btn--small" onClick={() => setClassModal({ cls: c })}>Edit</button>
                <button className="delete-btn" onClick={() => removeClass(c)} aria-label="Delete class">✕</button>
              </div>
            </div>
          ))
        )}
      </div>

      {zoneModal && (
        <ZoneModal
          zone={zoneModal.zone}
          wilayas={wilayas}
          hasDefault={hasDefault}
          busy={busy}
          onSave={saveZone}
          onClose={() => setZoneModal(null)}
        />
      )}
      {methodModal && (
        <MethodModal
          method={methodModal.method}
          zoneId={methodModal.zoneId}
          classes={classes}
          busy={busy}
          onSave={saveMethod}
          onClose={() => setMethodModal(null)}
        />
      )}
      {classModal && (
        <ClassModal cls={classModal.cls} busy={busy} onSave={saveClass} onClose={() => setClassModal(null)} />
      )}
      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          busy={busy}
          onCancel={() => setConfirm(null)}
          onConfirm={async () => {
            await confirm.run();
            setConfirm(null);
          }}
        />
      )}
    </div>
  );
}
