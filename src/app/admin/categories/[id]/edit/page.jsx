import { redirect, notFound } from 'next/navigation';
import { getCurrentSession } from '../../../../../lib/auth.js';
import { getCategoryFormData } from '../../../queries.js';
import AdminShell from '../../../AdminShell.jsx';
import CategoryForm from '../../CategoryForm.jsx';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Edit category — Admin' };

export default async function EditCategoryPage({ params }) {
  const { id } = await params;

  const session = await getCurrentSession();
  if (!session || session.role !== 'ADMIN') {
    redirect(`/login?next=/admin/categories/${id}/edit`);
  }

  const { categories, category, pendingCount } = await getCategoryFormData(id);
  if (!category) notFound();

  return (
    <AdminShell adminName={session.name} pendingCount={pendingCount} active="categories" title="Edit category">
      <CategoryForm category={category} categories={categories} />
    </AdminShell>
  );
}
