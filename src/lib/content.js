// Editable homepage content. Defaults mirror the original hardcoded copy so the
// storefront looks identical until an admin changes something. Stored in the
// Setting singleton JSON under the keys below and edited from Admin → Content.

export const CONTENT_DEFAULTS = {
  announcement: {
    enabled: true,
    // The scrolling ticker messages, e.g. "New stock coming".
    messages: [
      'New drop live',
      'Free shipping available',
      'Limited runs — no restocks',
      'The Bespoke SS26'
    ]
  },
  hero: {
    kicker: 'Spring / Summer 2026',
    title: 'Wear the street.',
    sub: 'Monochrome essentials, cut clean. The new collection is live.',
    primaryLabel: 'Shop the drop',
    primaryHref: '/shop',
    secondaryLabel: 'View bundles',
    secondaryHref: '#bundles',
    // Optional background image URL; when set it replaces the default video.
    image: ''
  },
  promo: {
    eyebrow: 'First order?',
    heading: 'Take 15% off with code',
    code: 'ZED15',
    label: 'Shop now',
    href: '/shop'
  },
  drop: {
    enabled: true,
    eyebrow: '03 — Next drop',
    title: 'Mono Pack — limited run',
    desc: "Five pieces. One palette. Each run is capped and never restocked — once it's gone, it's gone.",
    image: '/image/upload/new-drop.jpg',
    // ISO datetime the countdown targets. Empty = a rolling ~4.5 days ahead.
    target: '',
    ctaLabel: 'Notify me',
    ctaHref: '#'
  }
};

// Merge saved settings over the defaults so missing keys always have a value.
export function mergeContent(settings = {}) {
  const s = settings && typeof settings === 'object' ? settings : {};
  const pick = key => ({ ...CONTENT_DEFAULTS[key], ...(s[key] && typeof s[key] === 'object' ? s[key] : {}) });
  const announcement = pick('announcement');
  // Guard the messages array (a saved value could be malformed).
  announcement.messages = Array.isArray(announcement.messages)
    ? announcement.messages.filter(m => typeof m === 'string' && m.trim())
    : CONTENT_DEFAULTS.announcement.messages;
  return { announcement, hero: pick('hero'), promo: pick('promo'), drop: pick('drop') };
}

// True when a media URL points at a video file (so it can be rendered as a
// looping <video> background instead of an <img>).
export function isVideoUrl(url) {
  return typeof url === 'string' && /\.(mp4|webm|ogg|ogv|mov|m4v)(\?|#|$)/i.test(url.trim());
}

// Resolve the drop's countdown target to a concrete timestamp (ms). Done on the
// server so the client counts down to a fixed value (no hydration mismatch).
export function resolveDropTarget(drop) {
  const t = drop?.target ? new Date(drop.target).getTime() : NaN;
  if (Number.isFinite(t)) return t;
  return Date.now() + (4 * 24 * 3600 + 12 * 3600 + 30 * 60) * 1000;
}
