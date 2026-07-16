import { redirect } from 'next/navigation';
import { getCurrentSession } from '../../lib/auth.js';
import { getAdminData } from './queries.js';
import AdminApp from './AdminApp.jsx';

// Shared server entry for every admin section route (/admin, /admin/orders, …).
// Each route renders this with its own `view`; AdminApp shows that section.
export default async function AdminView({ view, searchParams }) {
  const session = await getCurrentSession();
  if (!session || session.role !== 'ADMIN') {
    redirect(`/login?next=/admin${view === 'dashboard' ? '' : '/' + view}`);
  }

  const sp = searchParams ? await searchParams : null;
  const notice = typeof sp?.notice === 'string' ? sp.notice : null;

  const data = await getAdminData();

  return (
    <AdminApp
      initial={data}
      adminName={session.name}
      adminEmail={session.email}
      adminId={session.sub}
      initialView={view}
      notice={notice}
    />
  );
}
