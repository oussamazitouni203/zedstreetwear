import AdminView from '../AdminView.jsx';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Orders — Admin' };

export default function OrdersAdminPage({ searchParams }) {
  return <AdminView view="orders" searchParams={searchParams} />;
}
