import AdminView from '../AdminView.jsx';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Analytics — Admin' };

export default function AnalyticsAdminPage({ searchParams }) {
  return <AdminView view="analytics" searchParams={searchParams} />;
}
