import { NextResponse } from 'next/server';

// Instagram feed for the storefront. Uses the Instagram Graph API with a
// long-lived access token stored in env (INSTAGRAM_ACCESS_TOKEN).
//
// Setup: convert the IG account to Business/Creator, link a Facebook Page,
// create an app with the Instagram Graph API, and generate a long-lived token
// (valid ~60 days — refresh before expiry). Then set INSTAGRAM_ACCESS_TOKEN.
//
// Until a token is configured, this returns an empty list and the storefront
// falls back to placeholder tiles.

const TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const LIMIT = 8;
const FIELDS = 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp';

export async function GET() {
  if (!TOKEN) {
    return NextResponse.json({ posts: [], configured: false });
  }

  try {
    const url = `https://graph.instagram.com/me/media?fields=${FIELDS}&limit=${LIMIT}&access_token=${TOKEN}`;
    // Cache the upstream response for an hour so we never hammer IG's rate limit.
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      return NextResponse.json({ posts: [], configured: true, error: 'Instagram API error' });
    }

    const data = await res.json();
    const posts = (data.data || [])
      .map(m => ({
        id: m.id,
        image: m.media_type === 'VIDEO' ? m.thumbnail_url : m.media_url,
        permalink: m.permalink,
        caption: m.caption || ''
      }))
      .filter(p => p.image);

    return NextResponse.json({ posts, configured: true });
  } catch {
    return NextResponse.json({ posts: [], configured: true, error: 'Fetch failed' });
  }
}
