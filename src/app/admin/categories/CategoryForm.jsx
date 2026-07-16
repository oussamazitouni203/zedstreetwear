'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveCategory } from '../actions.js';
import Select from '../components/Select.jsx';
import '../admin.css';

const slugify = s =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export default function CategoryForm({ category = null, categories = [] }) {
  const router = useRouter();

  const [form, setForm] = useState(() => ({
    name: category?.name || '',
    image: category?.image || '',
    parentId: category?.parentId || ''
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  // Exclude self from the parent options (server also blocks descendant cycles).
  const parentOptions = categories.filter(c => c.id !== category?.id);

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await saveCategory({
        id: category?.id,
        name: form.name.trim(),
        image: form.image.trim(),
        parentId: form.parentId || null
      });
      router.refresh();
      router.push(`/admin/categories?notice=${category ? 'category-updated' : 'category-added'}`);
    } catch (err) {
      setError(err?.message || 'Could not save the category.');
      setSaving(false);
    }
  };

  return (
    <div className="adm-form-page">
      <Link href="/admin/categories" className="adm-form-page__back">← Back to categories</Link>

      <form className="adm-form" onSubmit={submit}>
        <label>
          Category name
          <input value={form.name} onChange={e => set('name', e.target.value)} autoFocus />
        </label>
        <p className="adm-form__slug">Slug: <code>{slugify(form.name) || '—'}</code></p>

        <div className="adm-form__field">
          <p className="adm-form__label">Parent category</p>
          <Select
            value={form.parentId}
            onChange={v => set('parentId', v)}
            placeholder="— none (top level) —"
            options={[
              { value: '', label: '— none (top level) —' },
              ...parentOptions.map(c => ({ value: c.id, label: c.name }))
            ]}
          />
        </div>

        <label>
          Image (URL)
          <input
            value={form.image}
            onChange={e => set('image', e.target.value)}
            placeholder="https://…"
          />
        </label>

        {error && <p className="adm-form__error">{error}</p>}

        <div className="adm-form__foot">
          <button type="submit" className="adm-btn" disabled={saving}>
            {saving ? 'Saving…' : 'Save category'}
          </button>
          <Link href="/admin/categories" className="adm-btn adm-btn--ghost">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
