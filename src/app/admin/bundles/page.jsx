import AdminView from '../AdminView.jsx';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Bundles — Admin' };

export default function BundlesAdminPage({ searchParams }) {
  return <AdminView view="bundles" searchParams={searchParams} />;
}
