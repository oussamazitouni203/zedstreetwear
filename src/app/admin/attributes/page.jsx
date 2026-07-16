import AdminView from '../AdminView.jsx';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Attributes — Admin' };

export default function AttributesAdminPage({ searchParams }) {
  return <AdminView view="attributes" searchParams={searchParams} />;
}
