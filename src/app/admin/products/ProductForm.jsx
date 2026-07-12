'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveProduct } from '../actions.js';
import { TAGS } from '../data.js';
import MultiSelect from '../components/MultiSelect.jsx';
import Select from '../components/Select.jsx';
import '../admin.css';

const slugify = s =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const EMPTY = {
  name: '',
  shortDescription: '',
  description: '',
  price: 0,
  promoPrice: '',
  type: 'simple',
  categoryIds: [],
  stock: 0,
  tag: '',
  sizes: '',
  color: '',
  principalImage: '',
  gallery: ''
};

export default function ProductForm({ product = null, categories = [] }) {
  const router = useRouter();

  const [form, setForm] = useState(() =>
    product
      ? {
          ...EMPTY,
          ...product,
          promoPrice: product.promoPrice ?? '',
          categoryIds: Array.isArray(product.categoryIds) ? product.categoryIds : [],
          sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes || '',
          gallery: Array.isArray(product.gallery) ? product.gallery.join('\n') : product.gallery || ''
        }
      : { ...EMPTY }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

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
        promoPrice: form.promoPrice === '' ? null : Number(form.promoPrice)
      });
      router.refresh(); // bust the router cache so the list shows the change
      router.push(`/admin?tab=products&notice=${product ? 'product-updated' : 'product-added'}`);
    } catch (err) {
      setError(err?.message || 'Could not save the product.');
      setSaving(false);
    }
  };

  return (
    <div className="adm-form-page">
      <Link href="/admin?tab=products" className="adm-form-page__back">← Back to products</Link>

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
              placeholder="One-line summary"
            />
          </label>
          <label>
            Description
            <textarea
              rows={4}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Full product description"
            />
          </label>

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
            <div className="adm-form__field">
              <p className="adm-form__label">Tag</p>
              <Select
                value={form.tag}
                onChange={v => set('tag', v)}
                options={TAGS.map(t => ({ value: t, label: t || 'None' }))}
              />
            </div>
          </div>

          <div className="adm-form__row">
            <label>
              Sizes (comma-separated)
              <input
                value={form.sizes}
                onChange={e => set('sizes', e.target.value)}
                placeholder="S, M, L, XL  ·  or  OS"
              />
            </label>
            <label>
              Color
              <input value={form.color} onChange={e => set('color', e.target.value)} placeholder="Black" />
            </label>
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
            <Link href="/admin?tab=products" className="adm-btn adm-btn--ghost">Cancel</Link>
          </div>
      </form>
    </div>
  );
}
