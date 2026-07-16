'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveAttribute } from '../actions.js';
import '../admin.css';

const slugify = s =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export default function AttributeForm({ attribute = null }) {
  const router = useRouter();
  const [name, setName] = useState(attribute?.name || '');
  const [values, setValues] = useState(attribute?.values || []);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addValues = raw => {
    const parts = String(raw).split(',').map(s => s.trim()).filter(Boolean);
    if (!parts.length) return;
    setValues(v => {
      const seen = new Set(v.map(x => x.toLowerCase()));
      const next = [...v];
      for (const p of parts) {
        if (!seen.has(p.toLowerCase())) { seen.add(p.toLowerCase()); next.push(p); }
      }
      return next;
    });
    setDraft('');
  };
  const removeValue = i => setValues(v => v.filter((_, idx) => idx !== i));

  const onKey = e => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addValues(draft);
    } else if (e.key === 'Backspace' && !draft && values.length) {
      removeValue(values.length - 1);
    }
  };

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const finalValues = draft.trim()
        ? [...values, ...draft.split(',').map(s => s.trim()).filter(Boolean)]
        : values;
      await saveAttribute({ id: attribute?.id, name: name.trim(), values: finalValues });
      router.refresh();
      router.push(`/admin/attributes?notice=${attribute ? 'attribute-updated' : 'attribute-added'}`);
    } catch (err) {
      setError(err?.message || 'Could not save the attribute.');
      setSaving(false);
    }
  };

  return (
    <div className="adm-form-page">
      <Link href="/admin/attributes" className="adm-form-page__back">← Back to attributes</Link>

      <form className="adm-form" onSubmit={submit}>
        <label>
          Attribute name
          <input value={name} onChange={e => setName(e.target.value)} autoFocus placeholder="e.g. Size" />
        </label>
        <p className="adm-form__slug">Slug: <code>{slugify(name) || '—'}</code></p>

        <div className="adm-form__field">
          <p className="adm-form__label">Values</p>
          <div className="chip-input">
            {values.map((v, i) => (
              <span key={`${v}-${i}`} className="chip">
                {v}
                <button type="button" onClick={() => removeValue(i)} aria-label={`Remove ${v}`}>×</button>
              </span>
            ))}
            <input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={onKey}
              onBlur={() => addValues(draft)}
              placeholder={values.length ? 'Add another…' : 'Type a value, Enter to add'}
            />
          </div>
          <p className="adm-form__hint">Press Enter or comma to add each value (e.g. S, M, L, XL).</p>
        </div>

        {error && <p className="adm-form__error">{error}</p>}

        <div className="adm-form__foot">
          <button type="submit" className="adm-btn" disabled={saving}>
            {saving ? 'Saving…' : 'Save attribute'}
          </button>
          <Link href="/admin/attributes" className="adm-btn adm-btn--ghost">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
