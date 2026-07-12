'use client';

import { useEffect, useState } from 'react';

// Dark full-screen preloader shown on the first page load: the circular logo
// with a spinning ring around it. Fades out once the page has loaded.
export default function Preloader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const finish = () => setTimeout(() => setDone(true), 400);
    if (document.readyState === 'complete') {
      finish();
    } else {
      window.addEventListener('load', finish);
    }
    // Safety net so it never gets stuck.
    const fallback = setTimeout(() => setDone(true), 5000);
    return () => {
      window.removeEventListener('load', finish);
      clearTimeout(fallback);
    };
  }, []);

  return (
    <div className={`preloader${done ? ' preloader--done' : ''}`} aria-hidden={done}>
      <div className="preloader__ring">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="preloader__logo" src="/image/upload/logo.jpg" alt="" />
      </div>
    </div>
  );
}
