import { notFound } from 'next/navigation';
import { getProduct, getRelated } from '../../../lib/storefront.js';
import ProductDetailClient from './ProductDetailClient.jsx';

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  return {
    title: product ? `${product.name} — The Bespoke` : 'Not found — The Bespoke'
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const related = await getRelated(product, 4);

  return <ProductDetailClient product={product} related={related} />;
}
