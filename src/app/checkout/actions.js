'use server';

import { prisma } from '../../lib/prisma.js';
import { getCurrentSession } from '../../lib/auth.js';

const METHOD_LABELS = { FLAT_RATE: 'Flat rate', FREE_SHIPPING: 'Free shipping', LOCAL_PICKUP: 'Local pickup' };

// Compute the shipping methods available for a destination wilaya, WooCommerce-style:
// find the first zone that covers the region (else the fallback zone), then price
// each enabled method — flat rate adds per-shipping-class surcharges, free shipping
// respects its minimum-order requirement.
export async function getShippingOptions({ region, subtotal = 0, items = [] } = {}) {
  const zones = await prisma.shippingZone.findMany({
    include: { methods: { where: { enabled: true }, orderBy: { order: 'asc' } } },
    orderBy: { order: 'asc' }
  });
  if (zones.length === 0) return { configured: false, options: [] };

  const zone =
    zones.find(z => !z.isDefault && Array.isArray(z.regions) && z.regions.includes(region)) ||
    zones.find(z => z.isDefault) ||
    null;
  if (!zone) return { configured: true, options: [], zoneName: null };

  // Which shipping classes are present in the cart (for flat-rate surcharges)?
  const ids = (Array.isArray(items) ? items : []).map(i => i.id).filter(Boolean);
  let presentClasses = new Set();
  if (ids.length) {
    const rows = await prisma.product.findMany({ where: { id: { in: ids } }, select: { shippingClassId: true } });
    presentClasses = new Set(rows.map(r => r.shippingClassId).filter(Boolean));
  }

  const sub = Number(subtotal) || 0;
  const options = [];
  for (const m of zone.methods) {
    if (m.type === 'FREE_SHIPPING') {
      if (m.minAmount != null && sub < m.minAmount) continue; // minimum not met
      if (m.requiresCoupon) continue; // coupon-gated free shipping not offered here
      options.push({ id: m.id, type: m.type, title: m.title || METHOD_LABELS[m.type], cost: 0 });
      continue;
    }
    let cost = m.cost ?? 0;
    if (m.type === 'FLAT_RATE' && m.classCosts && typeof m.classCosts === 'object') {
      for (const classId of presentClasses) cost += Number(m.classCosts[classId]) || 0;
    }
    options.push({ id: m.id, type: m.type, title: m.title || METHOD_LABELS[m.type], cost: Math.max(0, cost) });
  }

  return { configured: true, zoneName: zone.name, options };
}

// Persist a real order from the cart. Links line items to products when the
// id still exists, snapshots name/price, and decrements stock best-effort.
export async function createOrder({ items, total, customerName, customerEmail, shippingRegion, shippingMethod, shippingCost }) {
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
      shippingRegion: String(shippingRegion || '').trim() || null,
      shippingMethod: String(shippingMethod || '').trim() || null,
      shippingCost: shippingCost == null || shippingCost === '' ? null : Number(shippingCost),
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

  return { number: `ORD-${String(order.seq).padStart(5, '0')}`, total: order.total };
}
