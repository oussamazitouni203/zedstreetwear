'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveUser } from '../actions.js';
import '../admin.css';

export default function UserForm({ user = null }) {
  const router = useRouter();
  const isEdit = Boolean(user);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await saveUser({
        id: user?.id,
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password
      });
      router.refresh();
      router.push(`/admin?tab=users&notice=${isEdit ? 'user-updated' : 'user-added'}`);
    } catch (err) {
      setError(err?.message || 'Could not save the user.');
      setSaving(false);
    }
  };

  return (
    <div className="adm-form-page">
      <Link href="/admin?tab=users" className="adm-form-page__back">← Back to users</Link>

      <form className="adm-form" onSubmit={submit}>
        <label>
          Name
          <input value={form.name} onChange={e => set('name', e.target.value)} autoFocus />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} />
        </label>
        <label>
          {isEdit ? 'New password' : 'Password'}
          <input
            type="password"
            value={form.password}
            onChange={e => set('password', e.target.value)}
            placeholder={isEdit ? 'Leave blank to keep current password' : 'At least 6 characters'}
            autoComplete="new-password"
          />
        </label>
        <p className="adm-form__hint">All users created here are administrators.</p>

        {error && <p className="adm-form__error">{error}</p>}

        <div className="adm-form__foot">
          <button type="submit" className="adm-btn" disabled={saving}>
            {saving ? 'Saving…' : 'Save user'}
          </button>
          <Link href="/admin?tab=users" className="adm-btn adm-btn--ghost">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
