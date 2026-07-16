import AdminView from '../AdminView.jsx';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Banners — Admin' };

export default function BannersAdminPage({ searchParams }) {
  return <AdminView view="banners" searchParams={searchParams} />;
}
