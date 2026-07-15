import { redirect } from 'next/navigation';
import { getCurrentSession } from '../../../../lib/auth.js';
import { getAttributeFormData } from '../../queries.js';
import AdminShell from '../../AdminShell.jsx';
import AttributeForm from '../AttributeForm.jsx';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Add attribute — Admin' };

export default async function NewAttributePage() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'ADMIN') {
    redirect('/login?next=/admin/attributes/new');
  }

  const { pendingCount } = await getAttributeFormData(null);
  return (
    <AdminShell adminName={session.name} pendingCount={pendingCount} active="attributes" title="Add attribute">
      <AttributeForm />
    </AdminShell>
  );
}
