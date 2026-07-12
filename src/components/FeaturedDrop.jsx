'use client';

import { useEffect, useState } from 'react';
import { DROP_TARGET } from '../data.js';
import ImageBox from './ImageBox.jsx';

const pad = n => String(n).padStart(2, '0');

const PLACEHOLDER_CELLS = [
  { num: '--', unit: 'Days' },
  { num: '--', unit: 'Hours' },
  { num: '--', unit: 'Min' },
  { num: '--', unit: 'Sec' }
];

function cellsFor(now) {
  const left = Math.max(0, Math.floor((DROP_TARGET - now) / 1000));
  return [
    { num: pad(Math.floor(left / 86400)), unit: 'Days' },
    { num: pad(Math.floor(left / 3600) % 24), unit: 'Hours' },
    { num: pad(Math.floor(left / 60) % 60), unit: 'Min' },
    { num: pad(left % 60), unit: 'Sec' }
  ];
}

export default function FeaturedDrop() {
  // Starts null so the server-rendered HTML matches the client's first paint;
  // the live countdown only kicks in after mount, which avoids a hydration
  // mismatch since Date.now() otherwise differs between server and client.
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const cells = now === null ? PLACEHOLDER_CELLS : cellsFor(now);

  return (
    <section className="container drop">
      <div className="drop__grid">
        <div className="drop__media">
          <ImageBox src="/image/upload/new-drop.jpg" alt="Next drop — Mono Pack" label="next drop — hero product shot" />
        </div>
        <div>
          <p className="eyebrow">03 — Next drop</p>
          <h2 className="drop__title">Mono Pack — limited run</h2>
          <p className="drop__desc">
            Five pieces. One palette. Each run is capped and never restocked — once it's gone, it's gone.
          </p>
          <div className="countdown">
            {cells.map(c => (
              <div key={c.unit} className="countdown__cell">
                <p className="num">{c.num}</p>
                <p className="unit">{c.unit}</p>
              </div>
            ))}
          </div>
          <a href="#" className="btn btn--black">Notify me</a>
        </div>
      </div>
    </section>
  );
}
