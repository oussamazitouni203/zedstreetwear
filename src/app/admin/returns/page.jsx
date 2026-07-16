import AdminView from '../AdminView.jsx';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Return Orders — Admin' };

export default function ReturnsAdminPage({ searchParams }) {
  return <AdminView view="returns" searchParams={searchParams} />;
}
