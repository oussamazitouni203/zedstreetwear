import { redirect } from 'next/navigation';
import { getCurrentSession } from '../../../../lib/auth.js';
import { getAdminFormData } from '../../queries.js';
import AdminShell from '../../AdminShell.jsx';
import ProductForm from '../ProductForm.jsx';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Add product — Admin' };

export default async function NewProductPage() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'ADMIN') {
    redirect('/login?next=/admin/products/new');
  }

  const { categories, attributes, shippingClasses, pendingCount } = await getAdminFormData(null);
  return (
    <AdminShell adminName={session.name} pendingCount={pendingCount} active="products" title="Add product">
      <ProductForm categories={categories} globalAttributes={attributes} shippingClasses={shippingClasses} />
    </AdminShell>
  );
}
