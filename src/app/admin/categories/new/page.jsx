import { redirect } from 'next/navigation';
import { getCurrentSession } from '../../../../lib/auth.js';
import { getCategoryFormData } from '../../queries.js';
import AdminShell from '../../AdminShell.jsx';
import CategoryForm from '../CategoryForm.jsx';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Add category — Admin' };

export default async function NewCategoryPage() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'ADMIN') {
    redirect('/login?next=/admin/categories/new');
  }

  const { categories, pendingCount } = await getCategoryFormData(null);
  return (
    <AdminShell adminName={session.name} pendingCount={pendingCount} active="categories" title="Add category">
      <CategoryForm categories={categories} />
    </AdminShell>
  );
}
