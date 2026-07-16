import AdminView from '../AdminView.jsx';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Coupons — Admin' };

export default function CouponsAdminPage({ searchParams }) {
  return <AdminView view="coupons" searchParams={searchParams} />;
}
