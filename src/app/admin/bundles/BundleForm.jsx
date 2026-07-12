'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveBundle } from '../actions.js';
import { money } from '../data.js';
import MultiSelect from '../components/MultiSelect.jsx';
import '../admin.css';

const slugify = s =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export default function BundleForm({ bundle = null, products = [] }) {
  const router = useRouter();

  const [form, setForm] = useState(() => ({
    name: bundle?.name || '',
    image: bundle?.image || '',
    discount: bundle?.discount ?? 10,
    active: bundle ? bundle.active : true,
    productIds: Array.isArray(bundle?.productIds) ? bundle.productIds : []
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const base = products
    .filter(p => form.productIds.includes(p.id))
    .reduce((s, p) => s + p.price, 0);
  const price = Math.round(base * (1 - form.discount / 100));

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await saveBundle({
        id: bundle?.id,
        name: form.name.trim(),
        image: form.image.trim(),
        discount: Number(form.discount) || 0,
        active: form.active,
        productIds: form.productIds
      });
      router.refresh();
      router.push(`/admin?tab=bundles&notice=${bundle ? 'bundle-updated' : 'bundle-added'}`);
    } catch (err) {
      setError(err?.message || 'Could not save the bundle.');
      setSaving(false);
    }
  };

  return (
    <div className="adm-form-page">
      <Link href="/admin?tab=bundles" className="adm-form-page__back">← Back to bundles</Link>

      <form className="adm-form" onSubmit={submit}>
        <label>
          Bundle name
          <input value={form.name} onChange={e => set('name', e.target.value)} autoFocus />
        </label>
        <p className="adm-form__slug">Slug: <code>{slugify(form.name) || '—'}</code></p>

        <div className="adm-form__row">
          <label>
            Discount (%)
            <input
              type="number"
              min="0"
              max="50"
              value={form.discount}
              onChange={e => set('discount', e.target.value)}
            />
          </label>
          <label>
            Image (URL)
            <input value={form.image} onChange={e => set('image', e.target.value)} placeholder="https://…" />
          </label>
        </div>

        <label className="adm-check" style={{ alignSelf: 'flex-start' }}>
          <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} />
          <span>Active (visible on the storefront)</span>
        </label>

        <div className="adm-form__field">
          <p className="adm-form__label">Products in bundle</p>
          {products.length === 0 ? (
            <p className="adm-form__hint">
              No products yet. <Link href="/admin/products/new">Create one</Link>.
            </p>
          ) : (
            <MultiSelect
              placeholder="Add a product…"
              options={products.map(p => ({
                value: p.id,
                label: `${p.name} — ${money(p.price)}`,
                chipLabel: p.name
              }))}
              selected={form.productIds}
              onChange={ids => set('productIds', ids)}
            />
          )}
        </div>

        <div className="adm-bundle-preview">
          <span>Bundle price preview</span>
          <span>
            <strong className="num">{money(price)}</strong>
            {base > price && <s className="num" style={{ color: '#999', marginLeft: 8 }}>{money(base)}</s>}
          </span>
        </div>

        {error && <p className="adm-form__error">{error}</p>}

        <div className="adm-form__foot">
          <button type="submit" className="adm-btn" disabled={saving}>
            {saving ? 'Saving…' : 'Save bundle'}
          </button>
          <Link href="/admin?tab=bundles" className="adm-btn adm-btn--ghost">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
