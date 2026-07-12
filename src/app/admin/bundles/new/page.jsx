import { redirect } from 'next/navigation';
import { getCurrentSession } from '../../../../lib/auth.js';
import { getBundleFormData } from '../../queries.js';
import AdminShell from '../../AdminShell.jsx';
import BundleForm from '../BundleForm.jsx';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Add bundle — Admin' };

export default async function NewBundlePage() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'ADMIN') {
    redirect('/login?next=/admin/bundles/new');
  }

  const { products, pendingCount } = await getBundleFormData(null);
  return (
    <AdminShell adminName={session.name} pendingCount={pendingCount} active="bundles" title="Add bundle">
      <BundleForm products={products} />
    </AdminShell>
  );
}
