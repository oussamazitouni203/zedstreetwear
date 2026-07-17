'use client';

import { useState } from 'react';
import { CONTENT_DEFAULTS } from '../../../lib/content.js';
import DatePicker from './DatePicker.jsx';

const pad = n => String(n).padStart(2, '0');

// The countdown target is stored as ISO; the UI edits it as a local date
// (custom DatePicker, matching the rest of the admin) + a local time.
function isoToParts(iso) {
  if (!iso) return { date: '', time: '' };
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { date: '', time: '' };
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`
  };
}
function partsToIso(date, time) {
  if (!date) return '';
  const [y, m, dd] = date.split('-').map(Number);
  const [hh, mi] = (time || '00:00').split(':').map(Number);
  const d = new Date(y, (m || 1) - 1, dd || 1, hh || 0, mi || 0);
  return isNaN(d.getTime()) ? '' : d.toISOString();
}

function Field({ label, full, help, children }) {
  return (
    <label className={`cnt-field${full ? ' cnt-field--full' : ''}`}>
      <span>{label}</span>
      {children}
      {help && <small className="cnt-help">{help}</small>}
    </label>
  );
}

// One editable homepage section. `initial` seeds the form; Save sends the whole
// section object back through onSave(key, values).
function Card({ title, desc, sectionKey, initial, busy, onSave, render }) {
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = patch => setValues(v => ({ ...v, ...patch }));

  const save = async () => {
    setSaving(true);
    try {
      await onSave(sectionKey, values);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="adm-card cnt-card">
      <div className="cnt-card__head">
        <div>
          <h3>{title}</h3>
          <p>{desc}</p>
        </div>
      </div>
      {render(values, set)}
      <div className="cnt-foot">
        <button className="adm-btn" onClick={save} disabled={busy || saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}

export default function Content({ settings = {}, busy = false, onSave = () => {} }) {
  const s = settings || {};
  const seed = key => ({ ...CONTENT_DEFAULTS[key], ...(s[key] && typeof s[key] === 'object' ? s[key] : {}) });

  return (
    <div className="cnt">
      {/* Announcement bar */}
      <Card
        title="Announcement bar"
        desc="The scrolling ticker at the top of the homepage. Add one line per message."
        sectionKey="announcement"
        initial={{
          ...seed('announcement'),
          messages: Array.isArray(s.announcement?.messages) ? s.announcement.messages : CONTENT_DEFAULTS.announcement.messages
        }}
        busy={busy}
        onSave={onSave}
        render={(v, set) => (
          <>
            <label className="adm-form__check cnt-toggle">
              <input type="checkbox" checked={v.enabled !== false} onChange={e => set({ enabled: e.target.checked })} />
              <span>Show the announcement bar</span>
            </label>
            <div className="cnt-msgs">
              {v.messages.map((m, i) => (
                <div className="cnt-msg" key={i}>
                  <input
                    value={m}
                    placeholder="e.g. New stock coming"
                    onChange={e => set({ messages: v.messages.map((x, j) => (j === i ? e.target.value : x)) })}
                  />
                  <button
                    type="button"
                    className="delete-btn"
                    aria-label="Remove message"
                    onClick={() => set({ messages: v.messages.filter((_, j) => j !== i) })}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="cnt-add" onClick={() => set({ messages: [...v.messages, ''] })}>
              + Add message
            </button>
          </>
        )}
      />

      {/* Hero */}
      <Card
        title="Hero banner"
        desc="The large banner at the top of the homepage."
        sectionKey="hero"
        initial={seed('hero')}
        busy={busy}
        onSave={onSave}
        render={(v, set) => (
          <div className="cnt-grid">
            <Field label="Kicker"><input value={v.kicker || ''} onChange={e => set({ kicker: e.target.value })} placeholder="Spring / Summer 2026" /></Field>
            <Field label="Headline"><input value={v.title || ''} onChange={e => set({ title: e.target.value })} placeholder="Wear the street." /></Field>
            <Field label="Subtext" full><textarea value={v.sub || ''} onChange={e => set({ sub: e.target.value })} placeholder="Short supporting line" /></Field>
            <Field label="Primary button label"><input value={v.primaryLabel || ''} onChange={e => set({ primaryLabel: e.target.value })} placeholder="Shop the drop" /></Field>
            <Field label="Primary button link"><input value={v.primaryHref || ''} onChange={e => set({ primaryHref: e.target.value })} placeholder="/shop" /></Field>
            <Field label="Secondary button label"><input value={v.secondaryLabel || ''} onChange={e => set({ secondaryLabel: e.target.value })} placeholder="View bundles" /></Field>
            <Field label="Secondary button link"><input value={v.secondaryHref || ''} onChange={e => set({ secondaryHref: e.target.value })} placeholder="#bundles" /></Field>
            <Field label="Background image or video URL" full help="Paste an image or a video (.mp4/.webm) URL — videos autoplay muted on loop. Leave blank to keep the default video."><input value={v.image || ''} onChange={e => set({ image: e.target.value })} placeholder="https://…/hero.mp4 or .jpg" /></Field>
          </div>
        )}
      />

      {/* Promo */}
      <Card
        title="Promo banner"
        desc="The discount call-out band lower on the homepage."
        sectionKey="promo"
        initial={seed('promo')}
        busy={busy}
        onSave={onSave}
        render={(v, set) => (
          <div className="cnt-grid">
            <Field label="Eyebrow"><input value={v.eyebrow || ''} onChange={e => set({ eyebrow: e.target.value })} placeholder="First order?" /></Field>
            <Field label="Heading"><input value={v.heading || ''} onChange={e => set({ heading: e.target.value })} placeholder="Take 15% off with code" /></Field>
            <Field label="Code"><input value={v.code || ''} onChange={e => set({ code: e.target.value })} placeholder="ZED15" /></Field>
            <Field label="Button label"><input value={v.label || ''} onChange={e => set({ label: e.target.value })} placeholder="Shop now" /></Field>
            <Field label="Button link" full><input value={v.href || ''} onChange={e => set({ href: e.target.value })} placeholder="/shop" /></Field>
          </div>
        )}
      />

      {/* Featured drop */}
      <Card
        title="Featured drop"
        desc="The countdown section for an upcoming drop."
        sectionKey="drop"
        initial={seed('drop')}
        busy={busy}
        onSave={onSave}
        render={(v, set) => {
          const parts = isoToParts(v.target);
          return (
          <>
            <label className="adm-form__check cnt-toggle">
              <input type="checkbox" checked={v.enabled !== false} onChange={e => set({ enabled: e.target.checked })} />
              <span>Show the featured drop section</span>
            </label>
            <div className="cnt-grid">
              <Field label="Eyebrow"><input value={v.eyebrow || ''} onChange={e => set({ eyebrow: e.target.value })} placeholder="03 — Next drop" /></Field>
              <Field label="Title"><input value={v.title || ''} onChange={e => set({ title: e.target.value })} placeholder="Mono Pack — limited run" /></Field>
              <Field label="Description" full><textarea value={v.desc || ''} onChange={e => set({ desc: e.target.value })} placeholder="A couple of lines about the drop" /></Field>
              <Field label="Image URL"><input value={v.image || ''} onChange={e => set({ image: e.target.value })} placeholder="/image/upload/new-drop.jpg" /></Field>
              <Field label="Countdown target" help="Date & time the countdown ends. Leave blank for a rolling ~4.5 days ahead.">
                <div className="cnt-datetime">
                  <DatePicker value={parts.date} onChange={date => set({ target: partsToIso(date, parts.time) })} placeholder="Pick a date" />
                  <input
                    type="time"
                    className="cnt-time"
                    value={parts.time}
                    onChange={e => set({ target: partsToIso(parts.date, e.target.value) })}
                  />
                </div>
              </Field>
              <Field label="Button label"><input value={v.ctaLabel || ''} onChange={e => set({ ctaLabel: e.target.value })} placeholder="Notify me" /></Field>
              <Field label="Button link"><input value={v.ctaHref || ''} onChange={e => set({ ctaHref: e.target.value })} placeholder="#" /></Field>
            </div>
          </>
          );
        }}
      />
    </div>
  );
}
