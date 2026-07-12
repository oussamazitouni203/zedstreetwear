import { useEffect, useState } from 'react';
import { TAGS } from '../data.js';

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
  category: '',
  stock: 0,
  tag: '',
  sizes: '',
  color: '',
  principalImage: '',
  gallery: ''
};

export default function ProductDrawer({ product, categories = [], onSave, onClose }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (product) {
      setForm({
        ...EMPTY,
        ...product,
        promoPrice: product.promoPrice ?? '',
        // sizes stored as an array; edit it as a comma-separated list.
        sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes || '',
        // gallery is stored as an array; edit it as newline-separated text.
        gallery: Array.isArray(product.gallery) ? product.gallery.join('\n') : product.gallery || ''
      });
    } else {
      setForm({ ...EMPTY, category: categories[0] || '' });
    }
  }, [product, categories]);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const submit = () => {
    onSave({
      ...form,
      name: form.name.trim() || 'Untitled product',
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      promoPrice: form.promoPrice === '' ? null : Number(form.promoPrice)
    });
  };

  return (
    <div className="drawer-overlay">
      <div className="drawer-overlay__bg" onClick={onClose} />
      <div className="drawer">
        <div className="drawer__head">
          <h2>{product ? 'Edit product' : 'Add product'}</h2>
          <button className="drawer__close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="drawer__body">
          <label>
            Product name
            <input value={form.name} onChange={e => set('name', e.target.value)} autoFocus />
          </label>
          <p className="drawer__slug">Slug: <code>{slugify(form.name) || '—'}</code></p>

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

          <div className="drawer__row">
            <label>
              Type
              <select value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="simple">Simple</option>
                <option value="variable">Variable</option>
              </select>
            </label>
            <label>
              Category
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                {categories.length === 0 && <option value="">— none —</option>}
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="drawer__row">
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

          <div className="drawer__row">
            <label>
              Stock
              <input type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} />
            </label>
            <label>
              Tag
              <select value={form.tag} onChange={e => set('tag', e.target.value)}>
                {TAGS.map(t => <option key={t} value={t}>{t || 'None'}</option>)}
              </select>
            </label>
          </div>

          <div className="drawer__row">
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
              <input
                value={form.color}
                onChange={e => set('color', e.target.value)}
                placeholder="Black"
              />
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
        </div>
        <div className="drawer__foot">
          <button className="adm-btn" onClick={submit}>Save product</button>
          <button className="adm-btn adm-btn--ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
