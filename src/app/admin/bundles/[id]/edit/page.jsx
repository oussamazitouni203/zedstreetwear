import { redirect, notFound } from 'next/navigation';
import { getCurrentSession } from '../../../../../lib/auth.js';
import { getBundleFormData } from '../../../queries.js';
import AdminShell from '../../../AdminShell.jsx';
import BundleForm from '../../BundleForm.jsx';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Edit bundle — Admin' };

export default async function EditBundlePage({ params }) {
  const { id } = await params;

  const session = await getCurrentSession();
  if (!session || session.role !== 'ADMIN') {
    redirect(`/login?next=/admin/bundles/${id}/edit`);
  }

  const { products, bundle, pendingCount } = await getBundleFormData(id);
  if (!bundle) notFound();

  return (
    <AdminShell adminName={session.name} pendingCount={pendingCount} active="bundles" title="Edit bundle">
      <BundleForm bundle={bundle} products={products} />
    </AdminShell>
  );
}
