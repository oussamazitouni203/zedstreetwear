import { redirect, notFound } from 'next/navigation';
import { getCurrentSession } from '../../../../../lib/auth.js';
import { getAttributeFormData } from '../../../queries.js';
import AdminShell from '../../../AdminShell.jsx';
import AttributeForm from '../../AttributeForm.jsx';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Edit attribute — Admin' };

export default async function EditAttributePage({ params }) {
  const { id } = await params;

  const session = await getCurrentSession();
  if (!session || session.role !== 'ADMIN') {
    redirect(`/login?next=/admin/attributes/${id}/edit`);
  }

  const { attribute, pendingCount } = await getAttributeFormData(id);
  if (!attribute) notFound();

  return (
    <AdminShell adminName={session.name} pendingCount={pendingCount} active="attributes" title="Edit attribute">
      <AttributeForm attribute={attribute} />
    </AdminShell>
  );
}
