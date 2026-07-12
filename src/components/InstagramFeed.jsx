'use client';

import { useEffect, useState } from 'react';
import ImageBox from './ImageBox.jsx';

const HANDLE = 'thebespoke';
const PLACEHOLDERS = [1, 2, 3, 4, 5, 6];

export default function InstagramFeed() {
  const [posts, setPosts] = useState(null); // null = loading, [] = none/not configured

  useEffect(() => {
    let active = true;
    fetch('/api/instagram')
      .then(r => r.json())
      .then(d => active && setPosts(Array.isArray(d.posts) ? d.posts : []))
      .catch(() => active && setPosts([]));
    return () => {
      active = false;
    };
  }, []);

  const hasPosts = posts && posts.length > 0;

  return (
    <section className="container instagram">
      <div className="instagram__head">
        <h2>@{HANDLE}</h2>
        <a
          href={`https://instagram.com/${HANDLE}`}
          target="_blank"
          rel="noreferrer"
          className="text-link"
        >
          Follow us
        </a>
      </div>
      <div className="instagram__grid">
        {hasPosts
          ? posts.map(post => (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noreferrer"
                className="instagram__tile"
              >
                <ImageBox src={post.image} alt={post.caption?.slice(0, 80) || 'Instagram post'} label="IG post" />
              </a>
            ))
          : PLACEHOLDERS.map(i => (
              <div key={i} className="instagram__tile">
                <ImageBox label={`IG post ${i}`} />
              </div>
            ))}
      </div>
    </section>
  );
}
