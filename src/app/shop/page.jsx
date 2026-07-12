import { Suspense } from 'react';
import ShopPageClient from './ShopPageClient.jsx';
import { getShopData } from '../../lib/storefront.js';

export const metadata = {
  title: 'Shop — Zedstreetwear'
};

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  const { products, categories } = await getShopData();
  return (
    <Suspense fallback={null}>
      <ShopPageClient products={products} categories={categories} />
    </Suspense>
  );
}
