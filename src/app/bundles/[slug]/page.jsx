import { notFound } from 'next/navigation';
import { getBundle } from '../../../lib/storefront.js';
import BundleDetailClient from './BundleDetailClient.jsx';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const bundle = await getBundle(slug);
  return {
    title: bundle ? `${bundle.name} — Zedstreetwear` : 'Not found — Zedstreetwear'
  };
}

export default async function BundlePage({ params }) {
  const { slug } = await params;
  const bundle = await getBundle(slug);
  if (!bundle) notFound();

  return <BundleDetailClient bundle={bundle} />;
}
