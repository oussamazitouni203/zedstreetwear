import ShopPageClient from './ShopPageClient.jsx';
import { getShopData } from '../../lib/storefront.js';

export const metadata = {
  title: 'Shop — Zedstreetwear'
};

// Cache for 5 minutes; stale content is served instantly while revalidating.
// loading.jsx (same folder) acts as the streaming skeleton shown while this
// page is rendering — it fires immediately on both hard loads and navigations.
export const revalidate = 300;

export default async function ShopPage() {
  const { products, categories } = await getShopData();
  return <ShopPageClient products={products} categories={categories} />;
}
