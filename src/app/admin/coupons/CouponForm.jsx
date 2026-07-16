'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveCoupon } from '../actions.js';
import DatePicker from '../components/DatePicker.jsx';
import '../admin.css';

export default function CouponForm({ coupon = null }) {
  const router = useRouter();
  const isEdit = Boolean(coupon);

  const [form, setForm] = useState({
    code: coupon?.code || '',
    type: coupon?.type || 'PERCENT',
    value: coupon?.value ?? '',
    minSpend: coupon?.minSpend ?? '',
    usageLimit: coupon?.usageLimit ?? '',
    startsAt: coupon?.startsAt || '',
    expiresAt: coupon?.expiresAt || '',
    active: coupon ? coupon.active : true
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await saveCoupon({
        id: coupon?.id,
        code: form.code,
        type: form.type,
        value: form.value,
        minSpend: form.minSpend,
        usageLimit: form.usageLimit,
        startsAt: form.startsAt,
        expiresAt: form.expiresAt,
        active: form.active
      });
      router.refresh();
      router.push(`/admin/coupons?notice=${isEdit ? 'coupon-updated' : 'coupon-added'}`);
    } catch (err) {
      setError(err?.message || 'Could not save the coupon.');
      setSaving(false);
    }
  };

  return (
    <div className="adm-form-page">
      <Link href="/admin/coupons" className="adm-form-page__back">← Back to coupons</Link>

      <form className="adm-form" onSubmit={submit}>
        <label>
          Coupon code
          <input
            value={form.code}
            onChange={e => set('code', e.target.value.toUpperCase())}
            placeholder="SUMMER20"
            autoFocus
          />
        </label>

        <div className="adm-form__field">
          <p className="adm-form__label">Discount type</p>
          <div className="adm-seg" role="tablist" aria-label="Discount type">
            <button
              type="button"
              role="tab"
              aria-selected={form.type === 'PERCENT'}
              className={`adm-seg__opt${form.type === 'PERCENT' ? ' active' : ''}`}
              onClick={() => set('type', 'PERCENT')}
            >
              <span className="adm-seg__mark">%</span>
              <span className="adm-seg__text"><strong>Percentage</strong><em>e.g. 20% off</em></span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={form.type === 'FIXED'}
              className={`adm-seg__opt${form.type === 'FIXED' ? ' active' : ''}`}
              onClick={() => set('type', 'FIXED')}
            >
              <span className="adm-seg__mark">$</span>
              <span className="adm-seg__text"><strong>Fixed amount</strong><em>e.g. $10 off</em></span>
            </button>
          </div>
        </div>

        <div className="adm-form__row">
          <label>
            {form.type === 'PERCENT' ? 'Discount (%)' : 'Amount off ($)'}
            <input
              type="number"
              min="0"
              step={form.type === 'PERCENT' ? '1' : '0.01'}
              value={form.value}
              onChange={e => set('value', e.target.value)}
              placeholder={form.type === 'PERCENT' ? '20' : '10'}
            />
          </label>
          <label>
            Minimum spend ($)
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.minSpend}
              onChange={e => set('minSpend', e.target.value)}
              placeholder="No minimum"
            />
          </label>
        </div>

        <div className="adm-form__row">
          <label>
            Usage limit
            <input
              type="number"
              min="1"
              step="1"
              value={form.usageLimit}
              onChange={e => set('usageLimit', e.target.value)}
              placeholder="Unlimited"
            />
          </label>
          <span className="adm-form__spacer" aria-hidden="true" />
        </div>

        <div className="adm-form__row">
          <div className="adm-form__field">
            <p className="adm-form__label">Start date</p>
            <DatePicker value={form.startsAt} onChange={v => set('startsAt', v)} placeholder="No start date" />
          </div>
          <div className="adm-form__field">
            <p className="adm-form__label">Expiry date</p>
            <DatePicker value={form.expiresAt} onChange={v => set('expiresAt', v)} placeholder="No expiry date" />
          </div>
        </div>

        <label className="adm-form__check">
          <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} />
          <span>Active — customers can use this coupon at checkout</span>
        </label>

        <p className="adm-form__hint">
          Leave minimum spend, usage limit or dates blank for no restriction.
        </p>

        {error && <p className="adm-form__error">{error}</p>}

        <div className="adm-form__foot">
          <button type="submit" className="adm-btn" disabled={saving}>
            {saving ? 'Saving…' : 'Save coupon'}
          </button>
          <Link href="/admin/coupons" className="adm-btn adm-btn--ghost">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
