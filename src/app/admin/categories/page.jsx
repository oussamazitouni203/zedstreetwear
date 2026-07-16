import AdminView from '../AdminView.jsx';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Categories — Admin' };

export default function CategoriesAdminPage({ searchParams }) {
  return <AdminView view="categories" searchParams={searchParams} />;
}
