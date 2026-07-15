import { redirect, notFound } from 'next/navigation';
import { getCurrentSession } from '../../../../../lib/auth.js';
import { getAdminFormData } from '../../../queries.js';
import AdminShell from '../../../AdminShell.jsx';
import ProductForm from '../../ProductForm.jsx';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Edit product — Admin' };

export default async function EditProductPage({ params }) {
  const { id } = await params;

  const session = await getCurrentSession();
  if (!session || session.role !== 'ADMIN') {
    redirect(`/login?next=/admin/products/${id}/edit`);
  }

  const { categories, attributes, product, pendingCount } = await getAdminFormData(id);
  if (!product) notFound();

  return (
    <AdminShell adminName={session.name} pendingCount={pendingCount} active="products" title="Edit product">
      <ProductForm product={product} categories={categories} globalAttributes={attributes} />
    </AdminShell>
  );
}
