'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveProduct } from '../actions.js';
import { TAGS } from '../data.js';
import MultiSelect from '../components/MultiSelect.jsx';
import Select from '../components/Select.jsx';
import VariationsEditor from './VariationsEditor.jsx';
import '../admin.css';

const keyOf = options =>
  Object.entries(options || {})
    .map(([k, v]) => `${k}:${v}`)
    .join('|');

const slugify = s =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const EMPTY = {
  name: '',
  shortDescription: '',
  additionalInfo: [],
  price: 0,
  promoPrice: '',
  type: 'simple',
  categoryIds: [],
  stock: 0,
  tag: '',
  shippingClassId: '',
  sizes: '',
  color: '',
  principalImage: '',
  gallery: ''
};

export default function ProductForm({ product = null, categories = [], globalAttributes = [], shippingClasses = [] }) {
  const router = useRouter();

  const [form, setForm] = useState(() =>
    product
      ? {
          ...EMPTY,
          ...product,
          promoPrice: product.promoPrice ?? '',
          categoryIds: Array.isArray(product.categoryIds) ? product.categoryIds : [],
          sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes || '',
          gallery: Array.isArray(product.gallery) ? product.gallery.join('\n') : product.gallery || '',
          additionalInfo: Array.isArray(product.additionalInfo) ? product.additionalInfo : [],
          attributes: (product.attributes || []).map(a => ({
            name: a.name,
            values: a.values || []
          })),
          variations: (product.variations || []).map(v => ({
            key: keyOf(v.options),
            options: v.options,
            price: v.price,
            promoPrice: v.promoPrice ?? '',
            stock: v.stock
          }))
        }
      : { ...EMPTY, attributes: [], variations: [] }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  // Additional information — repeatable label/value rows.
  const addInfoRow = () => set('additionalInfo', [...form.additionalInfo, { label: '', value: '' }]);
  const setInfoRow = (i, patch) =>
    set('additionalInfo', form.additionalInfo.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const removeInfoRow = i => set('additionalInfo', form.additionalInfo.filter((_, idx) => idx !== i));

  // Flatten categories into a parent → child ordered list with a depth for indentation.
  const categoryTree = (() => {
    const out = [];
    const walk = (parentId, depth) => {
      categories
        .filter(c => (c.parentId || null) === parentId)
        .forEach(c => {
          out.push({ ...c, depth });
          walk(c.id, depth + 1);
        });
    };
    walk(null, 0);
    categories.forEach(c => {
      if (!out.some(o => o.id === c.id)) out.push({ ...c, depth: 0 });
    });
    return out;
  })();

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await saveProduct({
        ...form,
        id: product?.id,
        name: form.name.trim() || 'Untitled product',
        price: Number(form.price) || 0,
        stock: Number(form.stock) || 0,
        promoPrice: form.promoPrice === '' ? null : Number(form.promoPrice),
        additionalInfo: form.additionalInfo
          .map(r => ({ label: (r.label || '').trim(), value: (r.value || '').trim() }))
          .filter(r => r.label && r.value),
        attributes: form.attributes.map(a => ({
          name: a.name.trim(),
          values: (a.values || []).map(s => String(s).trim()).filter(Boolean)
        })),
        variations: form.variations.map(v => ({
          options: v.options,
          price: Number(v.price) || 0,
          promoPrice: v.promoPrice === '' ? null : Number(v.promoPrice),
          stock: Number(v.stock) || 0
        }))
      });
      router.refresh(); // bust the router cache so the list shows the change
      router.push(`/admin/products?notice=${product ? 'product-updated' : 'product-added'}`);
    } catch (err) {
      setError(err?.message || 'Could not save the product.');
      setSaving(false);
    }
  };

  return (
    <div className="adm-form-page">
      <Link href="/admin/products" className="adm-form-page__back">← Back to products</Link>

      <form className="adm-form" onSubmit={submit}>
          <label>
            Product name
            <input value={form.name} onChange={e => set('name', e.target.value)} autoFocus />
          </label>
          <p className="adm-form__slug">Slug: <code>{slugify(form.name) || '—'}</code></p>

          <label>
            Short description
            <input
              value={form.shortDescription}
              onChange={e => set('shortDescription', e.target.value)}
              placeholder="One-line summary — shown under the title"
            />
          </label>
          <div className="adm-form__field">
            <p className="adm-form__label">Additional information</p>
            {form.additionalInfo.map((row, i) => (
              <div key={i} className="info-row">
                <input
                  placeholder="Label (e.g. Material)"
                  value={row.label}
                  onChange={e => setInfoRow(i, { label: e.target.value })}
                />
                <input
                  placeholder="Value (e.g. 100% heavyweight cotton)"
                  value={row.value}
                  onChange={e => setInfoRow(i, { value: e.target.value })}
                />
                <button type="button" className="delete-btn" onClick={() => removeInfoRow(i)} aria-label="Remove">✕</button>
              </div>
            ))}
            <div>
              <button type="button" className="adm-btn--small" onClick={addInfoRow}>+ Add info</button>
            </div>
            <p className="adm-form__hint">Shown on the product page below the available options (e.g. Material, Fit, Care).</p>
          </div>

          <div className="adm-form__field">
            <p className="adm-form__label">Type</p>
            <Select
              value={form.type}
              onChange={v => set('type', v)}
              options={[
                { value: 'simple', label: 'Simple' },
                { value: 'variable', label: 'Variable' }
              ]}
            />
          </div>

          <div className="adm-form__field">
            <p className="adm-form__label">Categories</p>
            {categoryTree.length === 0 ? (
              <p className="adm-form__hint">
                No categories yet. <Link href="/admin/categories/new">Create one</Link>.
              </p>
            ) : (
              <MultiSelect
                placeholder="Add a category…"
                options={categoryTree.map(c => ({
                  value: c.id,
                  label: (c.depth ? '— '.repeat(c.depth) : '') + c.name,
                  chipLabel: c.name
                }))}
                selected={form.categoryIds}
                onChange={ids => set('categoryIds', ids)}
              />
            )}
          </div>

          <div className="adm-form__field">
            <p className="adm-form__label">Tag</p>
            <Select
              value={form.tag}
              onChange={v => set('tag', v)}
              options={TAGS.map(t => ({ value: t, label: t || 'None' }))}
            />
          </div>

          <div className="adm-form__field">
            <p className="adm-form__label">Shipping class</p>
            <Select
              value={form.shippingClassId || ''}
              onChange={v => set('shippingClassId', v)}
              options={[{ value: '', label: 'No shipping class' }, ...shippingClasses.map(c => ({ value: c.id, label: c.name }))]}
            />
          </div>

          {/* Product data — differs by type, like WooCommerce */}
          <div className="adm-form__section">
            <p className="adm-form__section-title">
              {form.type === 'variable' ? 'Variable product data' : 'Simple product data'}
            </p>

            {form.type === 'simple' ? (
              <>
                <div className="adm-form__row">
                  <label>
                    Price ($)
                    <input type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} />
                  </label>
                  <label>
                    Promo price ($)
                    <input
                      type="number"
                      min="0"
                      value={form.promoPrice}
                      onChange={e => set('promoPrice', e.target.value)}
                      placeholder="optional"
                    />
                  </label>
                </div>
                <div className="adm-form__row">
                  <label>
                    Stock
                    <input type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} />
                  </label>
                  <label>
                    Color
                    <input value={form.color} onChange={e => set('color', e.target.value)} placeholder="Black" />
                  </label>
                </div>
                <label>
                  Sizes (comma-separated)
                  <input
                    value={form.sizes}
                    onChange={e => set('sizes', e.target.value)}
                    placeholder="S, M, L, XL  ·  or  OS"
                  />
                </label>
              </>
            ) : (
              <VariationsEditor
                globalAttributes={globalAttributes}
                attributes={form.attributes}
                variations={form.variations}
                onAttributes={a => set('attributes', a)}
                onVariations={v => set('variations', v)}
              />
            )}
          </div>

          <label>
            Principal image (URL)
            <input
              value={form.principalImage}
              onChange={e => set('principalImage', e.target.value)}
              placeholder="https://…"
            />
          </label>
          <label>
            Image gallery (one URL per line)
            <textarea
              rows={3}
              value={form.gallery}
              onChange={e => set('gallery', e.target.value)}
              placeholder={'https://…\nhttps://…'}
            />
          </label>

          {error && <p className="adm-form__error">{error}</p>}

          <div className="adm-form__foot">
            <button type="submit" className="adm-btn" disabled={saving}>
              {saving ? 'Saving…' : 'Save product'}
            </button>
            <Link href="/admin/products" className="adm-btn adm-btn--ghost">Cancel</Link>
          </div>
      </form>
    </div>
  );
}
