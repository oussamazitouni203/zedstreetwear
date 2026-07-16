import { prisma } from '../../lib/prisma.js';
import { mapProduct, mapOrder, mapBundle, mapUser, mapCategory, mapAttribute, mapCoupon } from './_map.js';

// Data for the user (admin account) add/edit page.
export async function getUserFormData(id) {
  const [user, pendingCount] = await Promise.all([
    id ? prisma.user.findUnique({ where: { id } }) : null,
    prisma.order.count({ where: { status: 'PENDING', state: 'CURRENT' } })
  ]);
  return { user: user ? mapUser(user) : null, pendingCount };
}

// Data for the coupon add/edit page.
export async function getCouponFormData(id) {
  const [coupon, pendingCount] = await Promise.all([
    id ? prisma.coupon.findUnique({ where: { id } }) : null,
    prisma.order.count({ where: { status: 'PENDING', state: 'CURRENT' } })
  ]);
  return { coupon: coupon ? mapCoupon(coupon) : null, pendingCount };
}

// Data for the attribute add/edit page.
export async function getAttributeFormData(id) {
  const [attribute, pendingCount] = await Promise.all([
    id ? prisma.attribute.findUnique({ where: { id } }) : null,
    prisma.order.count({ where: { status: 'PENDING', state: 'CURRENT' } })
  ]);
  return { attribute: attribute ? mapAttribute(attribute) : null, pendingCount };
}

const categoryListArgs = {
  orderBy: { name: 'asc' },
  include: { parent: { select: { name: true } }, _count: { select: { products: true } } }
};

// Data for the product add/edit page: category options + (for edit) the product.
// `slug` identifies the product being edited (null when adding).
export async function getAdminFormData(slug) {
  const [categories, attributes, product, pendingCount] = await Promise.all([
    prisma.category.findMany(categoryListArgs),
    prisma.attribute.findMany({ orderBy: { name: 'asc' } }),
    slug
      ? prisma.product.findUnique({
          where: { slug },
          include: { categories: true, variations: { orderBy: { createdAt: 'asc' } } }
        })
      : null,
    prisma.order.count({ where: { status: 'PENDING', state: 'CURRENT' } })
  ]);
  return {
    categories: categories.map(mapCategory),
    attributes: attributes.map(mapAttribute),
    product: product ? mapProduct(product) : null,
    pendingCount
  };
}

// Data for the bundle add/edit page: all products (to pick from) + the bundle being edited.
export async function getBundleFormData(slug) {
  const [products, bundle, pendingCount] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, price: true } }),
    slug
      ? prisma.bundle.findUnique({ where: { slug }, include: { items: { include: { product: true } } } })
      : null,
    prisma.order.count({ where: { status: 'PENDING', state: 'CURRENT' } })
  ]);
  return {
    products: products.map(p => ({ id: p.id, name: p.name, price: p.price })),
    bundle: bundle ? mapBundle(bundle) : null,
    pendingCount
  };
}

// Data for the category add/edit page: all categories (for parent select) + the one being edited.
export async function getCategoryFormData(slug) {
  const [categories, category, pendingCount] = await Promise.all([
    prisma.category.findMany(categoryListArgs),
    slug ? prisma.category.findUnique({ where: { slug }, include: { parent: { select: { name: true } } } }) : null,
    prisma.order.count({ where: { status: 'PENDING', state: 'CURRENT' } })
  ]);
  return {
    categories: categories.map(mapCategory),
    category: category ? mapCategory(category) : null,
    pendingCount
  };
}

// Loads everything the admin dashboard needs, mapped to UI shapes.
// All orders across every bucket, mapped, newest first. Returned by order
// actions so the admin SPA can stay in sync (esp. after renumbering).
export async function listOrders() {
  const orders = await prisma.order.findMany({
    include: { user: true, items: true },
    orderBy: { seq: 'desc' }
  });
  return orders.map(mapOrder);
}

export async function getAdminData() {
  const [products, orders, bundles, users, categories, attributes, coupons, setting] = await Promise.all([
    prisma.product.findMany({ include: { categories: true }, orderBy: { createdAt: 'asc' } }),
    prisma.order.findMany({ include: { user: true, items: true }, orderBy: { seq: 'desc' } }),
    prisma.bundle.findMany({
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.user.findMany({ where: { role: 'ADMIN' }, orderBy: { createdAt: 'asc' } }),
    prisma.category.findMany(categoryListArgs),
    prisma.attribute.findMany({ orderBy: { name: 'asc' } }),
    prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.setting.findUnique({ where: { id: 'store' } })
  ]);

  return {
    products: products.map(mapProduct),
    orders: orders.map(mapOrder),
    bundles: bundles.map(mapBundle),
    users: users.map(mapUser),
    categories: categories.map(mapCategory),
    attributes: attributes.map(mapAttribute),
    coupons: coupons.map(mapCoupon),
    settings: setting?.data && typeof setting.data === 'object' ? setting.data : {}
  };
}
