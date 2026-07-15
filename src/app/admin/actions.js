'use server';

import { revalidateTag } from 'next/cache';
import { prisma } from '../../lib/prisma.js';
import { getCurrentSession, hashPassword } from '../../lib/auth.js';
import { mapProduct, mapBundle, mapCategory, mapUser, mapAttribute, dbStatus, slugify } from './_map.js';
import { listOrders } from './queries.js';

const bundleInclude = { items: { include: { product: true } } };

// Bust the cached storefront (shop/home) so admin edits appear right away.
function revalidateStore() {
  revalidateTag('storefront');
}

async function requireAdmin() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Not authorized.');
  }
  return session;
}

async function uniqueProductSlug(base, ignoreId) {
  const root = base || 'product';
  let slug = root;
  let n = 1;
  // Loop until we find a slug not taken by a different product.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    slug = `${root}-${++n}`;
  }
}

async function uniqueCategorySlug(base, ignoreId) {
  const root = base || 'category';
  let slug = root;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    slug = `${root}-${++n}`;
  }
}

// Collect a category's descendant ids (to prevent choosing one as its parent).
async function descendantIds(rootId) {
  const all = await prisma.category.findMany({ select: { id: true, parentId: true } });
  const childrenOf = id => all.filter(c => c.parentId === id).map(c => c.id);
  const out = new Set();
  const stack = [rootId];
  while (stack.length) {
    for (const child of childrenOf(stack.pop())) {
      if (!out.has(child)) {
        out.add(child);
        stack.push(child);
      }
    }
  }
  return out;
}

function normalizeGallery(gallery) {
  if (Array.isArray(gallery)) return gallery.map(s => String(s).trim()).filter(Boolean);
  return String(gallery || '')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);
}

function normalizeSizes(sizes) {
  if (Array.isArray(sizes)) return sizes.map(s => String(s).trim().toUpperCase()).filter(Boolean);
  return String(sizes || '')
    .split(',')
    .map(s => s.trim().toUpperCase())
    .filter(Boolean);
}

// ---------- Products ----------

export async function saveProduct(input) {
  await requireAdmin();
  revalidateStore();

  const categoryIds = Array.isArray(input.categoryIds) ? input.categoryIds.filter(Boolean) : [];

  const name = String(input.name || '').trim() || 'Untitled product';
  const isVariable = input.type === 'variable';

  // Normalize attributes + variations for variable products.
  const attributes = isVariable ? normalizeAttributes(input.attributes) : [];
  const variations = isVariable ? normalizeVariations(input.variations) : [];

  const additionalInfo = (Array.isArray(input.additionalInfo) ? input.additionalInfo : [])
    .map(r => ({ label: String(r?.label || '').trim(), value: String(r?.value || '').trim() }))
    .filter(r => r.label && r.value);

  const promoRaw = input.promoPrice;
  const data = {
    name,
    shortDescription: String(input.shortDescription || '').trim() || null,
    type: isVariable ? 'variable' : 'simple',
    principalImage: String(input.principalImage || '').trim() || null,
    gallery: normalizeGallery(input.gallery),
    tag: String(input.tag || '').trim() || null,
    attributes: isVariable ? attributes : null,
    additionalInfo
  };

  if (isVariable) {
    // Product-level price/stock derive from the variations (min price, summed stock).
    const effective = variations.map(v => v.promoPrice ?? v.price);
    data.price = effective.length ? Math.min(...effective) : 0;
    data.promoPrice = null;
    data.stock = variations.reduce((s, v) => s + v.stock, 0);
    data.sizes = [];
    data.color = null;
  } else {
    data.price = Number(input.price) || 0;
    data.promoPrice = promoRaw === '' || promoRaw == null ? null : Number(promoRaw);
    data.stock = Number(input.stock) || 0;
    data.sizes = normalizeSizes(input.sizes);
    data.color = String(input.color || '').trim() || null;
  }

  let product;
  if (input.id) {
    data.slug = await uniqueProductSlug(slugify(name), input.id);
    data.categories = { set: categoryIds.map(id => ({ id })) };
    // Replace variations wholesale (simplest correct approach for the editor).
    data.variations = {
      deleteMany: {},
      create: variations.map(v => ({ options: v.options, price: v.price, promoPrice: v.promoPrice, stock: v.stock }))
    };
    product = await prisma.product.update({
      where: { id: input.id },
      data,
      include: { categories: true, variations: true }
    });
  } else {
    data.slug = await uniqueProductSlug(slugify(name));
    data.categories = { connect: categoryIds.map(id => ({ id })) };
    data.variations = {
      create: variations.map(v => ({ options: v.options, price: v.price, promoPrice: v.promoPrice, stock: v.stock }))
    };
    product = await prisma.product.create({ data, include: { categories: true, variations: true } });
  }
  return mapProduct(product);
}

// [{ name, values: [] }] with trimmed, de-duped values.
function normalizeAttributes(attrs) {
  if (!Array.isArray(attrs)) return [];
  return attrs
    .map(a => ({
      name: String(a?.name || '').trim(),
      values: (Array.isArray(a?.values) ? a.values : String(a?.values || '').split(','))
        .map(v => String(v).trim())
        .filter(Boolean)
    }))
    .filter(a => a.name && a.values.length);
}

function normalizeVariations(vars) {
  if (!Array.isArray(vars)) return [];
  return vars
    .filter(v => v && v.options && Object.keys(v.options).length)
    .map(v => ({
      options: v.options,
      price: Number(v.price) || 0,
      promoPrice: v.promoPrice === '' || v.promoPrice == null ? null : Number(v.promoPrice),
      stock: Number(v.stock) || 0
    }));
}

export async function deleteProduct(id) {
  await requireAdmin();
  revalidateStore();
  await prisma.product.delete({ where: { id } });
  return { id };
}

export async function deleteProducts(ids) {
  await requireAdmin();
  revalidateStore();
  const list = Array.isArray(ids) ? ids : [];
  await prisma.product.deleteMany({ where: { id: { in: list } } });
  return { ids: list };
}

// ---------- Orders ----------
// Order mutations return the full order list so the SPA stays consistent
// (important after permanent delete renumbers the whole sequence).

export async function setOrderStatus(id, uiStatusValue) {
  await requireAdmin();
  const status = dbStatus(uiStatusValue);
  if (!status) throw new Error('Invalid status.');
  await prisma.order.update({ where: { id }, data: { status } });
  return listOrders();
}

export async function setOrderState(id, state) {
  await requireAdmin();
  if (!['CURRENT', 'ARCHIVED', 'TRASHED'].includes(state)) throw new Error('Invalid state.');
  await prisma.order.update({ where: { id }, data: { state } });
  return listOrders();
}

// Permanently remove a trashed order and close the gap: every order with a
// higher seq is decremented by 1 so numbering stays contiguous.
export async function deleteOrderForever(id) {
  await requireAdmin();
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new Error('Order not found.');
  if (order.state !== 'TRASHED') throw new Error('Only trashed orders can be permanently deleted.');

  await prisma.$transaction(async tx => {
    await tx.order.delete({ where: { id } });
    // Decrement ascending so each new seq value is free when we set it.
    const higher = await tx.order.findMany({
      where: { seq: { gt: order.seq } },
      orderBy: { seq: 'asc' },
      select: { id: true, seq: true }
    });
    for (const o of higher) {
      await tx.order.update({ where: { id: o.id }, data: { seq: o.seq - 1 } });
    }
  });

  return listOrders();
}

// ---------- Bundles ----------

export async function setOrdersState(ids, state) {
  await requireAdmin();
  if (!['CURRENT', 'ARCHIVED', 'TRASHED'].includes(state)) throw new Error('Invalid state.');
  const list = Array.isArray(ids) ? ids : [];
  await prisma.order.updateMany({ where: { id: { in: list } }, data: { state } });
  return listOrders();
}

// Permanently delete several trashed orders at once, then close every gap so
// numbering stays contiguous (same result as deleting them one by one).
export async function deleteOrdersForever(ids) {
  await requireAdmin();
  const list = Array.isArray(ids) ? ids : [];
  const targets = await prisma.order.findMany({
    where: { id: { in: list }, state: 'TRASHED' },
    select: { id: true, seq: true }
  });
  if (targets.length === 0) return listOrders();
  const delSeqs = targets.map(t => t.seq);

  await prisma.$transaction(async tx => {
    await tx.order.deleteMany({ where: { id: { in: targets.map(t => t.id) } } });
    const remaining = await tx.order.findMany({ orderBy: { seq: 'asc' }, select: { id: true, seq: true } });
    for (const o of remaining) {
      const shift = delSeqs.filter(s => s < o.seq).length;
      if (shift > 0) await tx.order.update({ where: { id: o.id }, data: { seq: o.seq - shift } });
    }
  });

  return listOrders();
}

export async function toggleBundle(id) {
  await requireAdmin();
  revalidateStore();
  const bundle = await prisma.bundle.findUnique({ where: { id } });
  if (!bundle) throw new Error('Bundle not found.');
  const updated = await prisma.bundle.update({
    where: { id },
    data: { active: !bundle.active },
    include: { items: { include: { product: true } } }
  });
  return mapBundle(updated);
}

export async function changeBundleDiscount(id, delta) {
  await requireAdmin();
  revalidateStore();
  const bundle = await prisma.bundle.findUnique({ where: { id } });
  if (!bundle) throw new Error('Bundle not found.');
  const discount = Math.min(50, Math.max(0, bundle.discount + delta));
  const updated = await prisma.bundle.update({
    where: { id },
    data: { discount },
    include: bundleInclude
  });
  return mapBundle(updated);
}

async function uniqueBundleSlug(base, ignoreId) {
  const root = base || 'bundle';
  let slug = root;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.bundle.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    slug = `${root}-${++n}`;
  }
}

export async function saveBundle(input) {
  await requireAdmin();
  revalidateStore();

  const name = String(input.name || '').trim();
  if (!name) throw new Error('Bundle name is required.');

  const productIds = Array.isArray(input.productIds) ? input.productIds.filter(Boolean) : [];
  const discount = Math.min(50, Math.max(0, Number(input.discount) || 0));
  const data = {
    name,
    image: String(input.image || '').trim() || null,
    discount,
    active: Boolean(input.active)
  };

  let bundle;
  if (input.id) {
    data.slug = await uniqueBundleSlug(slugify(name), input.id);
    data.items = { deleteMany: {}, create: productIds.map(pid => ({ productId: pid })) };
    bundle = await prisma.bundle.update({ where: { id: input.id }, data, include: bundleInclude });
  } else {
    data.slug = await uniqueBundleSlug(slugify(name));
    data.items = { create: productIds.map(pid => ({ productId: pid })) };
    bundle = await prisma.bundle.create({ data, include: bundleInclude });
  }
  return mapBundle(bundle);
}

export async function deleteBundle(id) {
  await requireAdmin();
  revalidateStore();
  await prisma.bundle.delete({ where: { id } });
  return { id };
}

export async function deleteBundles(ids) {
  await requireAdmin();
  revalidateStore();
  const list = Array.isArray(ids) ? ids : [];
  await prisma.bundle.deleteMany({ where: { id: { in: list } } });
  return { ids: list };
}

export async function setBundlesActive(ids, active) {
  await requireAdmin();
  revalidateStore();
  const list = Array.isArray(ids) ? ids : [];
  await prisma.bundle.updateMany({ where: { id: { in: list } }, data: { active: Boolean(active) } });
  return { ids: list, active: Boolean(active) };
}

// ---------- Users (admin accounts) ----------

export async function saveUser(input) {
  await requireAdmin();

  const name = String(input.name || '').trim();
  const email = String(input.email || '').trim().toLowerCase();
  const password = String(input.password || '');
  if (!name) throw new Error('Name is required.');
  if (!email || !email.includes('@')) throw new Error('A valid email is required.');

  const clash = await prisma.user.findUnique({ where: { email } });
  if (clash && clash.id !== input.id) throw new Error('That email is already in use.');

  if (input.id) {
    const data = { name, email };
    if (password) {
      if (password.length < 6) throw new Error('Password must be at least 6 characters.');
      data.password = await hashPassword(password);
    }
    const user = await prisma.user.update({ where: { id: input.id }, data });
    return mapUser(user);
  }

  if (password.length < 6) throw new Error('Password must be at least 6 characters.');
  const user = await prisma.user.create({
    data: { name, email, password: await hashPassword(password), role: 'ADMIN' }
  });
  return mapUser(user);
}

export async function deleteUser(id) {
  const session = await requireAdmin();
  if (id === session.sub) throw new Error('You can’t delete your own account.');
  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
  if (adminCount <= 1) throw new Error('You can’t delete the last admin.');
  await prisma.user.delete({ where: { id } });
  return { id };
}

// ---------- Attributes (global, reusable) ----------

async function uniqueAttributeSlug(base, ignoreId) {
  const root = base || 'attribute';
  let slug = root;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.attribute.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    slug = `${root}-${++n}`;
  }
}

export async function saveAttribute(input) {
  await requireAdmin();
  const name = String(input.name || '').trim();
  if (!name) throw new Error('Attribute name is required.');

  const raw = Array.isArray(input.values) ? input.values : String(input.values || '').split(',');
  const seen = new Set();
  const values = [];
  for (const v of raw.map(x => String(x).trim()).filter(Boolean)) {
    const k = v.toLowerCase();
    if (!seen.has(k)) { seen.add(k); values.push(v); }
  }
  if (values.length === 0) throw new Error('Add at least one value.');

  const clash = await prisma.attribute.findFirst({ where: { name } });
  if (clash && clash.id !== input.id) throw new Error('An attribute with that name already exists.');

  const data = { name, values };
  let attribute;
  if (input.id) {
    data.slug = await uniqueAttributeSlug(slugify(name), input.id);
    attribute = await prisma.attribute.update({ where: { id: input.id }, data });
  } else {
    data.slug = await uniqueAttributeSlug(slugify(name));
    attribute = await prisma.attribute.create({ data });
  }
  return mapAttribute(attribute);
}

export async function deleteAttribute(id) {
  await requireAdmin();
  await prisma.attribute.delete({ where: { id } });
  return { id };
}

export async function deleteAttributes(ids) {
  await requireAdmin();
  const list = Array.isArray(ids) ? ids : [];
  await prisma.attribute.deleteMany({ where: { id: { in: list } } });
  return { ids: list };
}

export async function deleteUsers(ids) {
  const session = await requireAdmin();
  const list = Array.isArray(ids) ? ids : [];
  // Never delete yourself, and always leave at least one admin.
  const targets = list.filter(id => id !== session.sub);
  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
  if (adminCount - targets.length < 1) {
    throw new Error('You must keep at least one admin account.');
  }
  await prisma.user.deleteMany({ where: { id: { in: targets } } });
  return { ids: targets, skippedSelf: targets.length !== list.length };
}

// ---------- Categories ----------

export async function saveCategory(input) {
  await requireAdmin();
  revalidateStore();

  const name = String(input.name || '').trim();
  if (!name) throw new Error('Category name is required.');

  let parentId = input.parentId || null;
  // Guard against cycles: a category can't be its own parent or a descendant's.
  if (input.id && parentId) {
    if (parentId === input.id) throw new Error('A category cannot be its own parent.');
    const descendants = await descendantIds(input.id);
    if (descendants.has(parentId)) throw new Error('Cannot set a subcategory as the parent.');
  }

  const data = {
    name,
    image: String(input.image || '').trim() || null,
    parentId
  };

  let category;
  if (input.id) {
    data.slug = await uniqueCategorySlug(slugify(name), input.id);
    category = await prisma.category.update({
      where: { id: input.id },
      data,
      include: { parent: { select: { name: true } }, _count: { select: { products: true } } }
    });
  } else {
    data.slug = await uniqueCategorySlug(slugify(name));
    category = await prisma.category.create({
      data,
      include: { parent: { select: { name: true } }, _count: { select: { products: true } } }
    });
  }
  return mapCategory(category);
}

export async function deleteCategory(id) {
  await requireAdmin();
  revalidateStore();
  // Children have their parentId nulled (onDelete: SetNull); product links
  // (m2m) are removed automatically. So deletion is always safe.
  await prisma.category.delete({ where: { id } });
  return { id };
}

export async function deleteCategories(ids) {
  await requireAdmin();
  revalidateStore();
  const list = Array.isArray(ids) ? ids : [];
  await prisma.category.deleteMany({ where: { id: { in: list } } });
  return { ids: list };
}
