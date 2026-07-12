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
  ABANDONED: 'Abandoned'
};

const UI_TO_STATUS = {
  Pending: 'PENDING',
  Shipped: 'SHIPPED',
  Delivered: 'DELIVERED',
  Canceled: 'CANCELED',
  Abandoned: 'ABANDONED'
};

export const ORDER_STATUSES = ['Pending', 'Shipped', 'Delivered', 'Canceled', 'Abandoned'];

export const uiStatus = s => STATUS_TO_UI[s] ?? s;
export const dbStatus = ui => UI_TO_STATUS[ui] ?? null;

const fmtDate = d =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const fmtJoined = d =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

export function mapProduct(p) {
  const cats = p.categories ?? [];
  return {
    id: p.id,
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
    tag: p.tag ?? ''
  };
}

export function mapOrder(o) {
  return {
    id: o.id, // cuid — used for keys + actions
    seq: o.seq,
    number: `#${o.seq}`, // human-facing
    customer: o.customerName ?? o.user?.name ?? 'Guest',
    email: o.customerEmail ?? o.user?.email ?? '',
    date: fmtDate(o.createdAt),
    total: o.total,
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
