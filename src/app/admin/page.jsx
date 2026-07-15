import { redirect } from 'next/navigation';
import { getCurrentSession } from '../../lib/auth.js';
import { getAdminData } from './queries.js';
import AdminApp from './AdminApp.jsx';

export const dynamic = 'force-dynamic';

const TABS = ['dashboard', 'products', 'categories', 'attributes', 'orders', 'bundles', 'users'];

export default async function AdminPage({ searchParams }) {
  const session = await getCurrentSession();
  if (!session || session.role !== 'ADMIN') {
    redirect('/login?next=/admin');
  }

  const sp = await searchParams;
  const initialView = TABS.includes(sp?.tab) ? sp.tab : 'dashboard';
  const notice = typeof sp?.notice === 'string' ? sp.notice : null;

  const data = await getAdminData();

  return (
    <AdminApp
      initial={data}
      adminName={session.name}
      adminId={session.sub}
      initialView={initialView}
      notice={notice}
    />
  );
}
