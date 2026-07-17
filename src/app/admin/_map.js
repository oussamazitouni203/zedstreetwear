// Pure helpers mapping Prisma records -> the shapes the admin UI already expects.
// No 'use server' / DB access here so both queries.js and actions.js can import it.

export const slugify = s =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const STATUS_TO_UI = {
  PENDING: 'Pending',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELED: 'Canceled',
  ABANDONED: 'Abandoned',
  RETURNED: 'Returned'
};

const UI_TO_STATUS = {
  Pending: 'PENDING',
  Shipped: 'SHIPPED',
  Delivered: 'DELIVERED',
  Canceled: 'CANCELED',
  Abandoned: 'ABANDONED',
  Returned: 'RETURNED'
};

export const ORDER_STATUSES = ['Pending', 'Shipped', 'Delivered', 'Canceled', 'Abandoned', 'Returned'];

export const uiStatus = s => STATUS_TO_UI[s] ?? s;
export const dbStatus = ui => UI_TO_STATUS[ui] ?? null;

const fmtDate = d =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const fmtJoined = d =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

const pad5 = n => String(n).padStart(5, '0');

export function mapProduct(p) {
  const cats = p.categories ?? [];
  return {
    id: p.id,
    number: p.num != null ? `PRD-${pad5(p.num)}` : '',
    name: p.name,
    slug: p.slug,
    shortDescription: p.shortDescription ?? '',
    description: p.description ?? '',
    price: p.price,
    promoPrice: p.promoPrice ?? null,
    type: p.type,
    categoryIds: cats.map(c => c.id),
    categories: cats.map(c => ({ id: c.id, name: c.name })),
    category: cats.map(c => c.name).join(', ') || '—',
    principalImage: p.principalImage ?? '',
    gallery: p.gallery ?? [],
    sizes: p.sizes ?? [],
    color: p.color ?? '',
    stock: p.stock,
    tag: p.tag ?? '',
    shippingClassId: p.shippingClassId ?? '',
    attributes: Array.isArray(p.attributes) ? p.attributes : [],
    additionalInfo: Array.isArray(p.additionalInfo) ? p.additionalInfo : [],
    variations: (p.variations ?? []).map(v => ({
      id: v.id,
      options: v.options ?? {},
      price: v.price,
      promoPrice: v.promoPrice ?? null,
      stock: v.stock
    }))
  };
}

export function mapOrder(o) {
  return {
    id: o.id, // cuid — used for keys + actions
    seq: o.seq,
    number: `ORD-${pad5(o.seq)}`, // human-facing
    customer: o.customerName ?? o.user?.name ?? 'Guest',
    email: o.customerEmail ?? o.user?.email ?? '',
    date: fmtDate(o.createdAt),
    createdAt: new Date(o.createdAt).toISOString(), // raw timestamp for analytics
    total: o.total,
    shippingRegion: o.shippingRegion ?? '',
    shippingMethod: o.shippingMethod ?? '',
    shippingCost: o.shippingCost ?? null,
    status: uiStatus(o.status),
    state: o.state, // CURRENT | ARCHIVED | TRASHED
    items: (o.items ?? []).map(i => ({
      id: i.id,
      name: i.name,
      price: i.price,
      quantity: i.quantity
    }))
  };
}

export function mapBundle(b) {
  const products = (b.items ?? []).map(i => i.product).filter(Boolean);
  return {
    id: b.id,
    name: b.name,
    slug: b.slug,
    image: b.image ?? '',
    items: products.map(p => p.name).join(' + ') || '—',
    productIds: products.map(p => p.id),
    base: products.reduce((sum, p) => sum + (p.price ?? 0), 0),
    discount: b.discount,
    active: b.active
  };
}

export function mapAttribute(a) {
  return {
    id: a.id,
    name: a.name,
    slug: a.slug,
    values: a.values ?? []
  };
}

export function mapCategory(c) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image ?? '',
    parentId: c.parentId ?? null,
    parentName: c.parent?.name ?? '',
    productCount: c._count?.products ?? 0
  };
}

const asDay = d => (d ? new Date(d).toISOString().slice(0, 10) : '');

// Derived lifecycle label used for the coupon status pill.
export function couponStatus(c) {
  if (!c.active) return 'Disabled';
  const now = Date.now();
  if (c.startsAt && new Date(c.startsAt).getTime() > now) return 'Scheduled';
  if (c.expiresAt && new Date(c.expiresAt).getTime() < now) return 'Expired';
  if (c.usageLimit != null && (c.usedCount ?? 0) >= c.usageLimit) return 'Used up';
  return 'Active';
}

export function mapCoupon(c) {
  return {
    id: c.id,
    code: c.code,
    type: c.type, // 'PERCENT' | 'FIXED'
    value: c.value,
    minSpend: c.minSpend ?? null,
    usageLimit: c.usageLimit ?? null,
    usedCount: c.usedCount ?? 0,
    startsAt: asDay(c.startsAt),
    expiresAt: asDay(c.expiresAt),
    active: c.active,
    status: couponStatus(c)
  };
}

const METHOD_LABELS = {
  FLAT_RATE: 'Flat rate',
  FREE_SHIPPING: 'Free shipping',
  LOCAL_PICKUP: 'Local pickup'
};

export const shippingMethodLabel = t => METHOD_LABELS[t] ?? t;

export function mapShippingMethod(m) {
  return {
    id: m.id,
    zoneId: m.zoneId,
    type: m.type,
    title: m.title || METHOD_LABELS[m.type] || 'Shipping',
    enabled: m.enabled,
    cost: m.cost ?? 0,
    minAmount: m.minAmount ?? null,
    requiresCoupon: !!m.requiresCoupon,
    classCosts: m.classCosts && typeof m.classCosts === 'object' ? m.classCosts : {},
    order: m.order ?? 0
  };
}

export function mapShippingZone(z) {
  const methods = (z.methods ?? []).map(mapShippingMethod).sort((a, b) => a.order - b.order);
  return {
    id: z.id,
    name: z.name,
    regions: z.regions ?? [],
    isDefault: !!z.isDefault,
    order: z.order ?? 0,
    methods
  };
}

export function mapShippingClass(c) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? '',
    productCount: c._count?.products ?? 0
  };
}

export function mapUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    joined: fmtJoined(u.createdAt)
  };
}

export function mapCustomer(u) {
  const orders = u.orders ?? [];
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    orders: orders.length,
    spent: orders.reduce((sum, o) => sum + (o.total ?? 0), 0),
    joined: fmtJoined(u.createdAt)
  };
}
