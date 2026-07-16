import AdminView from '../AdminView.jsx';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Products — Admin' };

export default function ProductsAdminPage({ searchParams }) {
  return <AdminView view="products" searchParams={searchParams} />;
}
