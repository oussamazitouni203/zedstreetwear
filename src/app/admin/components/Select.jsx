'use client';

import { useEffect, useRef, useState } from 'react';

// Custom single-select dropdown (fully styled menu, coherent with the site).
export default function Select({ value, onChange, options, placeholder = 'Select…' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

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

  const current = options.find(o => o.value === value);

  return (
    <div className="ms-control" ref={ref}>
      <button
        type="button"
        className={`ms-trigger${open ? ' open' : ''}${current ? '' : ' placeholder'}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{current ? current.label : placeholder}</span>
        <span className="ms-trigger__chevron" />
      </button>
      {open && (
        <ul className="ms-menu" role="listbox">
          {options.map(o => (
            <li key={o.value}>
              <button
                type="button"
                role="option"
                aria-selected={o.value === value}
                className={`ms-option${o.value === value ? ' selected' : ''}`}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
