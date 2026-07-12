import { redirect } from 'next/navigation';
import { getCurrentSession } from '../../../../lib/auth.js';
import { getUserFormData } from '../../queries.js';
import AdminShell from '../../AdminShell.jsx';
import UserForm from '../UserForm.jsx';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Add user — Admin' };

export default async function NewUserPage() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'ADMIN') {
    redirect('/login?next=/admin/users/new');
  }

  const { pendingCount } = await getUserFormData(null);
  return (
    <AdminShell adminName={session.name} pendingCount={pendingCount} active="users" title="Add user">
      <UserForm />
    </AdminShell>
  );
}
