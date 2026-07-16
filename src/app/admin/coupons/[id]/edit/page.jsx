import { redirect, notFound } from 'next/navigation';
import { getCurrentSession } from '../../../../../lib/auth.js';
import { getCouponFormData } from '../../../queries.js';
import AdminShell from '../../../AdminShell.jsx';
import CouponForm from '../../CouponForm.jsx';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Edit coupon — Admin' };

export default async function EditCouponPage({ params }) {
  const { id } = await params;

  const session = await getCurrentSession();
  if (!session || session.role !== 'ADMIN') {
    redirect(`/login?next=/admin/coupons/${id}/edit`);
  }

  const { coupon, pendingCount } = await getCouponFormData(id);
  if (!coupon) notFound();

  return (
    <AdminShell adminName={session.name} pendingCount={pendingCount} active="coupons" title="Edit coupon">
      <CouponForm coupon={coupon} />
    </AdminShell>
  );
}
