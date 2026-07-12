'use server';

import { prisma } from '../../lib/prisma.js';
import { getCurrentSession } from '../../lib/auth.js';

// Persist a real order from the cart. Links line items to products when the
// id still exists, snapshots name/price, and decrements stock best-effort.
export async function createOrder({ items, total, customerName, customerEmail }) {
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) {
    throw new Error('Cart is empty.');
  }

  const session = await getCurrentSession();

  // Which cart ids correspond to real products right now?
  const ids = list.map(i => i.id).filter(Boolean);
  const existing = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: { id: true }
  });
  const valid = new Set(existing.map(p => p.id));

  const max = await prisma.order.aggregate({ _max: { seq: true } });
  const seq = (max._max.seq ?? 1000) + 1;

  const order = await prisma.order.create({
    data: {
      seq,
      customerName: String(customerName || '').trim() || null,
      customerEmail: String(customerEmail || '').trim() || null,
      total: Number(total) || 0,
      status: 'PENDING',
      state: 'CURRENT',
      userId: session?.sub ?? null,
      items: {
        create: list.map(i => ({
          name: i.name,
          price: Number(i.price) || 0,
          quantity: Number(i.qty) || 1,
          productId: valid.has(i.id) ? i.id : null
        }))
      }
    }
  });

  // Best-effort stock decrement (won't fail the order if it errors).
  await Promise.all(
    list
      .filter(i => valid.has(i.id))
      .map(i =>
        prisma.product
          .update({ where: { id: i.id }, data: { stock: { decrement: Number(i.qty) || 1 } } })
          .catch(() => null)
      )
  );

  return { number: `#${order.seq}`, total: order.total };
}
