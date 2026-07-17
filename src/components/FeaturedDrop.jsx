'use client';

import { useEffect, useState } from 'react';
import { CONTENT_DEFAULTS } from '../lib/content.js';
import ImageBox from './ImageBox.jsx';

const pad = n => String(n).padStart(2, '0');

const PLACEHOLDER_CELLS = [
  { num: '--', unit: 'Days' },
  { num: '--', unit: 'Hours' },
  { num: '--', unit: 'Min' },
  { num: '--', unit: 'Sec' }
];

function cellsFor(now, target) {
  const left = Math.max(0, Math.floor((target - now) / 1000));
  return [
    { num: pad(Math.floor(left / 86400)), unit: 'Days' },
    { num: pad(Math.floor(left / 3600) % 24), unit: 'Hours' },
    { num: pad(Math.floor(left / 60) % 60), unit: 'Min' },
    { num: pad(left % 60), unit: 'Sec' }
  ];
}

export default function FeaturedDrop({ drop = CONTENT_DEFAULTS.drop, target }) {
  const d = { ...CONTENT_DEFAULTS.drop, ...(drop || {}) };
  // `target` is a fixed timestamp resolved on the server (avoids hydration drift).
  const targetMs = typeof target === 'number' ? target : Date.now();

  // Starts null so the server-rendered HTML matches the client's first paint;
  // the live countdown only kicks in after mount, which avoids a hydration
  // mismatch since Date.now() otherwise differs between server and client.
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (d.enabled === false) return null;

  const cells = now === null ? PLACEHOLDER_CELLS : cellsFor(now, targetMs);

  return (
    <section className="container drop">
      <div className="drop__grid">
        <div className="drop__media">
          <ImageBox src={d.image} alt={d.title} label="next drop — hero product shot" />
        </div>
        <div>
          {d.eyebrow && <p className="eyebrow">{d.eyebrow}</p>}
          <h2 className="drop__title">{d.title}</h2>
          {d.desc && <p className="drop__desc">{d.desc}</p>}
          <div className="countdown">
            {cells.map(c => (
              <div key={c.unit} className="countdown__cell">
                <p className="num">{c.num}</p>
                <p className="unit">{c.unit}</p>
              </div>
            ))}
          </div>
          {d.ctaLabel && <a href={d.ctaHref || '#'} className="btn btn--black">{d.ctaLabel}</a>}
        </div>
      </div>
    </section>
  );
}
