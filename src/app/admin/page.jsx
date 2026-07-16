import { redirect } from 'next/navigation';
import AdminView from './AdminView.jsx';

export const dynamic = 'force-dynamic';

const SECTIONS = [
  'products', 'categories', 'attributes', 'bundles',
  'orders', 'returns', 'coupons', 'analytics', 'banners', 'users', 'settings'
];

export default async function AdminPage({ searchParams }) {
  const sp = await searchParams;
  // Keep old ?tab= links working by redirecting them to the real route.
  if (sp?.tab && SECTIONS.includes(sp.tab)) redirect(`/admin/${sp.tab}`);
  return <AdminView view="dashboard" searchParams={searchParams} />;
}
