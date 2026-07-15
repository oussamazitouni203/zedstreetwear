'use client';

import { useState } from 'react';
import Link from 'next/link';
import Select from '../components/Select.jsx';

const keyOf = options =>
  Object.entries(options)
    .map(([k, v]) => `${k}:${v}`)
    .join('|');

function cartesian(attrs) {
  if (!attrs.length) return [];
  let combos = [{}];
  for (const a of attrs) {
    const next = [];
    for (const combo of combos) {
      for (const value of a.values) next.push({ ...combo, [a.name]: value });
    }
    combos = next;
  }
  return combos;
}

// Variable-product editor. Attributes are picked from the global, reusable
// attributes (Products → Attributes); you choose which of their values apply,
// then generate a variation per combination and set price / sale / stock.
export default function VariationsEditor({
  globalAttributes = [],
  attributes,
  variations,
  onAttributes,
  onVariations
}) {
  const usedNames = new Set(attributes.map(a => a.name));
  const available = globalAttributes.filter(g => !usedNames.has(g.name));

  const valuesFor = attr => {
    const g = globalAttributes.find(x => x.name === attr.name);
    return g ? g.values : attr.values;
  };

  const addAttribute = name => {
    const g = globalAttributes.find(x => x.name === name);
    if (!g) return;
    onAttributes([...attributes, { name: g.name, values: [...g.values] }]);
  };
  const removeAttribute = i => onAttributes(attributes.filter((_, idx) => idx !== i));
  const toggleValue = (i, val) =>
    onAttributes(
      attributes.map((a, idx) => {
        if (idx !== i) return a;
        const has = a.values.includes(val);
        return { ...a, values: has ? a.values.filter(v => v !== val) : [...a.values, val] };
      })
    );

  const parsed = attributes.filter(a => a.name && a.values.length);

  // Generate a row for every combination (merging any already-entered data).
  const generateAll = () => {
    const combos = cartesian(parsed);
    const existing = new Map(variations.map(v => [keyOf(v.options), v]));
    onVariations(
      combos.map(options => {
        const prev = existing.get(keyOf(options));
        return prev
          ? { ...prev, options }
          : { key: keyOf(options), options, price: '', promoPrice: '', stock: 0 };
      })
    );
  };

  // Add a single, specific variation the admin picks value-by-value.
  const [manual, setManual] = useState({});
  const manualReady = parsed.length > 0 && parsed.every(a => manual[a.name]);
  const addManual = () => {
    if (!manualReady) return;
    const options = {};
    parsed.forEach(a => { options[a.name] = manual[a.name]; });
    const k = keyOf(options);
    if (!variations.some(v => keyOf(v.options) === k)) {
      onVariations([...variations, { key: k, options, price: '', promoPrice: '', stock: 0 }]);
    }
    setManual({});
  };

  const setVar = (i, patch) =>
    onVariations(variations.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  const removeVar = i => onVariations(variations.filter((_, idx) => idx !== i));

  return (
    <div className="var-editor">
      <div className="adm-form__field">
        <p className="adm-form__label">Attributes</p>

        {globalAttributes.length === 0 ? (
          <p className="adm-form__hint">
            No global attributes yet. <Link href="/admin/attributes/new">Create one</Link> (e.g. Size, Color)
            first, then use it here.
          </p>
        ) : (
          <>
            {attributes.length === 0 && (
              <p className="adm-form__hint">Add an attribute, pick which values apply, then generate variations.</p>
            )}
            {attributes.map((a, i) => (
              <div key={a.name} className="var-attr-block">
                <div className="var-attr-block__head">
                  <span className="var-attr-block__name">{a.name}</span>
                  <button type="button" className="delete-btn" onClick={() => removeAttribute(i)} aria-label={`Remove ${a.name}`}>✕</button>
                </div>
                <div className="var-attr-block__values">
                  {valuesFor(a).map(val => (
                    <button
                      type="button"
                      key={val}
                      className={`val-chip${a.values.includes(val) ? ' active' : ''}`}
                      onClick={() => toggleValue(i, val)}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {available.length > 0 && (
              <div className="var-add-attr">
                <Select
                  value=""
                  placeholder="+ Add an attribute…"
                  options={available.map(g => ({ value: g.name, label: g.name }))}
                  onChange={addAttribute}
                />
              </div>
            )}
          </>
        )}

        {parsed.length > 0 && (
          <div className="var-gen">
            <div className="var-manual">
              <span className="var-manual__label">Add a specific variation</span>
              <div className="var-manual__picks">
                {parsed.map(attr => (
                  <Select
                    key={attr.name}
                    value={manual[attr.name] || ''}
                    placeholder={attr.name}
                    options={attr.values.map(v => ({ value: v, label: `${attr.name}: ${v}` }))}
                    onChange={val => setManual(m => ({ ...m, [attr.name]: val }))}
                  />
                ))}
                <button type="button" className="adm-btn--small" onClick={addManual} disabled={!manualReady}>
                  + Add variation
                </button>
              </div>
            </div>
            <div className="var-gen__or">or</div>
            <button type="button" className="adm-btn" onClick={generateAll}>Generate all variations</button>
          </div>
        )}
      </div>

      {variations.length > 0 && (
        <div className="adm-form__field">
          <p className="adm-form__label">Variations ({variations.length})</p>
          <div className="var-table">
            <div className="var-row var-row--head">
              <span>Variation</span><span>Price ($)</span><span>Sale ($)</span><span>Stock</span><span />
            </div>
            {variations.map((v, i) => (
              <div key={v.key || i} className="var-row">
                <span className="var-opts">{Object.values(v.options).join(' / ')}</span>
                <input type="number" min="0" value={v.price} onChange={e => setVar(i, { price: e.target.value })} placeholder="0" />
                <input type="number" min="0" value={v.promoPrice} onChange={e => setVar(i, { promoPrice: e.target.value })} placeholder="—" />
                <input type="number" min="0" value={v.stock} onChange={e => setVar(i, { stock: e.target.value })} placeholder="0" />
                <button type="button" className="delete-btn" onClick={() => removeVar(i)} aria-label="Remove variation">✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
