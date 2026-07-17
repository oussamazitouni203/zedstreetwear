import Link from 'next/link';
import { CONTENT_DEFAULTS, isVideoUrl } from '../lib/content.js';

const DEFAULT_HERO_VIDEO = '/image/upload/6565261-uhd_4096_2160_25fps.mp4';

export default function Hero({ hero = CONTENT_DEFAULTS.hero }) {
  const h = { ...CONTENT_DEFAULTS.hero, ...(hero || {}) };
  // Background: a custom video URL, a custom image URL, or the default video.
  const videoSrc = !h.image ? DEFAULT_HERO_VIDEO : isVideoUrl(h.image) ? h.image : null;
  return (
    <section className="hero">
      {videoSrc ? (
        <video
          className="hero__bg"
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
      ) : (
        <img className="hero__bg" src={h.image} alt="" aria-hidden="true" />
      )}
      <div className="hero__scrim" />
      <div className="hero__content">
        {h.kicker && <p className="hero__kicker">{h.kicker}</p>}
        <h1 className="hero__title">{h.title}</h1>
        {h.sub && <p className="hero__sub">{h.sub}</p>}
        <div className="hero__ctas">
          {h.primaryLabel && (
            <Link href={h.primaryHref || '/shop'} className="btn btn--white">{h.primaryLabel}</Link>
          )}
          {h.secondaryLabel && (
            <a href={h.secondaryHref || '#'} className="btn btn--outline-white">{h.secondaryLabel}</a>
          )}
        </div>
      </div>
    </section>
  );
}
