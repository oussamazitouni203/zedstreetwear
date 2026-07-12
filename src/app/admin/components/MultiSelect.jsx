'use client';

import { useEffect, useRef, useState } from 'react';

// Custom multi picker: a styled dropdown to add, each pick shows as a chip.
export default function MultiSelect({ options, selected, onChange, placeholder = 'Select…', empty }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selectedSet = new Set(selected);
  const available = options.filter(o => !selectedSet.has(o.value));
  const byValue = Object.fromEntries(options.map(o => [o.value, o]));

  useEffect(() => {
    if (!open) return;
    const close = e => {
      if (e.type === 'keydown' ? e.key === 'Escape' : !ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  const add = v => onChange([...selected, v]);
  const remove = v => onChange(selected.filter(x => x !== v));
  const allSelected = available.length === 0;

  return (
    <div className="multiselect">
      <div className="ms-control" ref={ref}>
        <button
          type="button"
          className={`ms-trigger${open ? ' open' : ''} placeholder`}
          onClick={() => !allSelected && setOpen(o => !o)}
          disabled={allSelected}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span>{allSelected ? 'All selected' : placeholder}</span>
          <span className="ms-trigger__chevron" />
        </button>
        {open && !allSelected && (
          <ul className="ms-menu" role="listbox">
            {available.map(o => (
              <li key={o.value}>
                <button type="button" role="option" className="ms-option" onClick={() => add(o.value)}>
                  {o.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected.length > 0 ? (
        <div className="multiselect__chips">
          {selected.map(v => (
            <span key={v} className="chip">
              {byValue[v]?.chipLabel ?? byValue[v]?.label ?? v}
              <button type="button" onClick={() => remove(v)} aria-label="Remove">×</button>
            </span>
          ))}
        </div>
      ) : empty ? (
        <p className="adm-form__hint">{empty}</p>
      ) : null}
    </div>
  );
}
