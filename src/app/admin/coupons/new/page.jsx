import { redirect } from 'next/navigation';
import { getCurrentSession } from '../../../../lib/auth.js';
import { getCouponFormData } from '../../queries.js';
import AdminShell from '../../AdminShell.jsx';
import CouponForm from '../CouponForm.jsx';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Add coupon — Admin' };

export default async function NewCouponPage() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'ADMIN') {
    redirect('/login?next=/admin/coupons/new');
  }

  const { pendingCount } = await getCouponFormData(null);
  return (
    <AdminShell adminName={session.name} pendingCount={pendingCount} active="coupons" title="Add coupon">
      <CouponForm />
    </AdminShell>
  );
}
