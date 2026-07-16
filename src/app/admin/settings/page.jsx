import AdminView from '../AdminView.jsx';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Settings — Admin' };

export default function SettingsAdminPage({ searchParams }) {
  return <AdminView view="settings" searchParams={searchParams} />;
}
