import AdminView from '../AdminView.jsx';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Shipping — Admin' };

export default function ShippingAdminPage({ searchParams }) {
  return <AdminView view="shipping" searchParams={searchParams} />;
}
