'use client';

import { useEffect, useRef, useState } from 'react';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const pad = n => String(n).padStart(2, '0');
const toISO = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
// Parse 'YYYY-MM-DD' as a *local* date (avoids the UTC off-by-one of new Date(str)).
const fromISO = s => {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};
const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export default function DatePicker({ value = '', onChange, placeholder = 'Select a date' }) {
  const selected = fromISO(value);
  const today = new Date();

  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => selected || today); // month currently shown
  const rootRef = useRef(null);

  // Keep the visible month in step with an externally changed value.
  useEffect(() => {
    if (selected) setView(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = e => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = e => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const gridStart = new Date(year, month, 1 - firstWeekday); // Sunday of the first visible row

  // 6 weeks × 7 days = a stable 42-cell grid.
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });

  const shiftMonth = delta => setView(new Date(year, month + delta, 1));
  const pick = d => {
    onChange?.(toISO(d));
    setOpen(false);
  };
  const label = selected ? `${MONTHS_SHORT[selected.getMonth()]} ${selected.getDate()}, ${selected.getFullYear()}` : '';

  return (
    <div className="dp" ref={rootRef}>
      <button
        type="button"
        className={`dp__field${selected ? '' : ' dp__field--empty'}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span>{label || placeholder}</span>
      </button>

      {open && (
        <div className="dp__pop" role="dialog" aria-label="Choose date">
          <div className="dp__head">
            <span className="dp__title">{MONTHS[month]} {year}</span>
            <div className="dp__nav">
              <button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month">‹</button>
              <button type="button" onClick={() => shiftMonth(1)} aria-label="Next month">›</button>
            </div>
          </div>

          <div className="dp__grid dp__weekdays">
            {WEEKDAYS.map(w => <span key={w} className="dp__wd">{w}</span>)}
          </div>

          <div className="dp__grid">
            {days.map((d, i) => {
              const other = d.getMonth() !== month;
              const cls = [
                'dp__day',
                other ? 'dp__day--muted' : '',
                sameDay(d, selected) ? 'dp__day--selected' : '',
                !sameDay(d, selected) && sameDay(d, today) ? 'dp__day--today' : ''
              ].join(' ').trim();
              return (
                <button key={i} type="button" className={cls} onClick={() => pick(d)}>
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          <div className="dp__foot">
            <button type="button" className="dp__link" onClick={() => { onChange?.(''); setOpen(false); }}>Clear</button>
            <button type="button" className="dp__link" onClick={() => pick(new Date())}>Today</button>
          </div>
        </div>
      )}
    </div>
  );
}
