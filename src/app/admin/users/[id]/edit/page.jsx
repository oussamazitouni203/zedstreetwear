import { redirect, notFound } from 'next/navigation';
import { getCurrentSession } from '../../../../../lib/auth.js';
import { getUserFormData } from '../../../queries.js';
import AdminShell from '../../../AdminShell.jsx';
import UserForm from '../../UserForm.jsx';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Edit user — Admin' };

export default async function EditUserPage({ params }) {
  const { id } = await params;

  const session = await getCurrentSession();
  if (!session || session.role !== 'ADMIN') {
    redirect(`/login?next=/admin/users/${id}/edit`);
  }

  const { user, pendingCount } = await getUserFormData(id);
  if (!user) notFound();

  return (
    <AdminShell adminName={session.name} pendingCount={pendingCount} active="users" title="Edit user">
      <UserForm user={user} />
    </AdminShell>
  );
}
