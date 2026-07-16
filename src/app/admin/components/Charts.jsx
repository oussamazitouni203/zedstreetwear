'use client';

import { useId } from 'react';

// Tiny dependency-free SVG charts, styled for the monochrome admin.
// Each scales uniformly to its container width (viewBox + width:100%).

const niceCeil = max => {
  if (max <= 5) return 5;
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  const n = max / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
};

const pickLabelIdx = (n, want = 7) => {
  if (n <= want) return Array.from({ length: n }, (_, i) => i);
  const step = (n - 1) / (want - 1);
  return Array.from({ length: want }, (_, i) => Math.round(i * step));
};

export function LineChart({ data, height = 220, format = v => v, accent = '#111', empty = 'No data' }) {
  const gid = 'lg' + useId().replace(/:/g, '');
  if (!data || data.length === 0) return <div className="chart-empty" style={{ height }}>{empty}</div>;
  const W = 640, H = height, padL = 52, padR = 14, padT = 14, padB = 30;
  const iw = W - padL - padR, ih = H - padT - padB;
  const max = niceCeil(Math.max(1, ...data.map(d => d.value)));
  const n = data.length;
  const x = i => padL + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw);
  const y = v => padT + ih - (v / max) * ih;
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ');
  const area = `${line} L${x(n - 1).toFixed(1)},${padT + ih} L${x(0).toFixed(1)},${padT + ih} Z`;
  const yTicks = [0, 0.25, 0.5, 0.75, 1];
  const labelIdx = new Set(pickLabelIdx(n));

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.16" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      {yTicks.map(t => {
        const yy = padT + ih - t * ih;
        return (
          <g key={t}>
            <line x1={padL} y1={yy} x2={W - padR} y2={yy} stroke="#eee" strokeWidth="1" />
            <text x={padL - 8} y={yy + 3} textAnchor="end" className="chart-axis">{format(Math.round(t * max))}</text>
          </g>
        );
      })}
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={accent} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
      {n <= 40 && data.map((d, i) => (
        <circle key={i} cx={x(i)} cy={y(d.value)} r="2.6" fill="#fff" stroke={accent} strokeWidth="1.6">
          <title>{d.label}: {format(d.value)}</title>
        </circle>
      ))}
      {data.map((d, i) => labelIdx.has(i) ? (
        <text key={i} x={x(i)} y={H - 10} textAnchor="middle" className="chart-axis">{d.label}</text>
      ) : null)}
    </svg>
  );
}

export function BarChart({ data, height = 220, format = v => v, accent = '#111', empty = 'No data' }) {
  if (!data || data.length === 0) return <div className="chart-empty" style={{ height }}>{empty}</div>;
  const W = 640, H = height, padL = 52, padR = 14, padT = 14, padB = 30;
  const iw = W - padL - padR, ih = H - padT - padB;
  const max = niceCeil(Math.max(1, ...data.map(d => d.value)));
  const n = data.length;
  const band = iw / n;
  const bw = Math.min(46, band * 0.62);
  const y = v => padT + ih - (v / max) * ih;
  const yTicks = [0, 0.25, 0.5, 0.75, 1];
  const labelIdx = new Set(pickLabelIdx(n, 12));

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img">
      {yTicks.map(t => {
        const yy = padT + ih - t * ih;
        return (
          <g key={t}>
            <line x1={padL} y1={yy} x2={W - padR} y2={yy} stroke="#eee" strokeWidth="1" />
            <text x={padL - 8} y={yy + 3} textAnchor="end" className="chart-axis">{format(Math.round(t * max))}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const cx = padL + band * i + band / 2;
        const h = ih - (y(d.value) - padT);
        return (
          <g key={i}>
            <rect x={cx - bw / 2} y={y(d.value)} width={bw} height={Math.max(0, h)} rx="3" fill={accent}>
              <title>{d.label}: {format(d.value)}</title>
            </rect>
            {labelIdx.has(i) && <text x={cx} y={H - 10} textAnchor="middle" className="chart-axis">{d.label}</text>}
          </g>
        );
      })}
    </svg>
  );
}

export function DonutChart({ data, size = 168, thickness = 26, empty = 'No data' }) {
  const total = (data || []).reduce((s, d) => s + d.value, 0);
  if (!data || total === 0) return <div className="chart-empty" style={{ height: size }}>{empty}</div>;
  const r = (size - thickness) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  let acc = 0;

  return (
    <div className="donut">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="donut__svg">
        <circle cx={c} cy={c} r={r} fill="none" stroke="#f0f0f0" strokeWidth={thickness} />
        {data.map((d, i) => {
          const frac = d.value / total;
          const dash = frac * circ;
          const el = (
            <circle
              key={i}
              cx={c} cy={c} r={r} fill="none"
              stroke={d.color} strokeWidth={thickness}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-acc * circ}
              transform={`rotate(-90 ${c} ${c})`}
            >
              <title>{d.label}: {d.value} ({Math.round(frac * 100)}%)</title>
            </circle>
          );
          acc += frac;
          return el;
        })}
        <text x={c} y={c - 2} textAnchor="middle" className="donut__total">{total}</text>
        <text x={c} y={c + 16} textAnchor="middle" className="donut__cap">total</text>
      </svg>
      <ul className="donut__legend">
        {data.map((d, i) => (
          <li key={i}>
            <span className="donut__dot" style={{ background: d.color }} />
            <span className="donut__label">{d.label}</span>
            <span className="donut__val">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
