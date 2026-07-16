import AdminView from '../AdminView.jsx';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Users — Admin' };

export default function UsersAdminPage({ searchParams }) {
  return <AdminView view="users" searchParams={searchParams} />;
}
