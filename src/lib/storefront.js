// Server-side data access for the public storefront. Returns data already
// shaped the way the existing storefront components expect it.
import { prisma } from './prisma.js';
import { unstable_cache } from 'next/cache';

// Material / fit copy keyed by category slug (used on the product page).
const MATERIAL = {
  tees: '100% combed heavyweight cotton',
  hoodies: 'Brushed-back cotton fleece, 400gsm',
  pants: 'Structured cotton-twill blend',
  outerwear: 'Weather-resistant technical shell',
  accessories: 'Premium mid-weight knit'
};
const FIT = {
  tees: 'Boxy, oversized — size down for a regular fit',
  hoodies: 'Relaxed with dropped shoulders',
  pants: 'Wide, relaxed leg with a mid rise',
  outerwear: 'Roomy layering fit',
  accessories: 'One size, fits most'
};

const money = n => '$' + Math.round(n).toLocaleString();

// Prisma product (with `categories` included) -> storefront card shape.
function toCard(p) {
  const cats = p.categories ?? [];
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    categorySlugs: cats.map(c => c.slug),
    categoryNames: cats.map(c => c.name),
    category: cats[0]?.slug ?? '', // primary — used for breadcrumb / related
    categoryName: cats[0]?.name ?? '',
    price: p.price,
    promoPrice: p.promoPrice ?? null,
    tag: p.tag ?? null,
    isNew: p.tag === 'New',
    sizes: p.sizes?.length ? p.sizes : ['OS'],
    color: p.color ?? '',
    image: p.principalImage || null
  };
}

function specsFor(card) {
  return [
    { label: 'Material', value: MATERIAL[card.category] ?? 'Premium fabrication' },
    { label: 'Fit', value: FIT[card.category] ?? 'Regular fit' },
    { label: 'Color', value: card.color || '—' },
    { label: 'Care', value: 'Machine wash cold, hang dry' }
  ];
}

async function categoriesWithCounts() {
  const cats = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } }, parent: { select: { slug: true } } }
  });
  return cats.map(c => ({
    id: c.slug,
    slug: c.slug,
    name: c.name,
    parent: c.parent?.slug ?? null,
    count: `${c._count.products} ${c._count.products === 1 ? 'item' : 'items'}`,
    image: c.image || null
  }));
}

// ---------- Shop page ----------

// Cached: the shop catalog changes only when admin edits products/categories,
// which busts the 'storefront' tag. Otherwise served from cache (no DB hit).
export const getShopData = unstable_cache(
  async () => {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({ include: { categories: true }, orderBy: { createdAt: 'desc' } }),
      categoriesWithCounts()
    ]);
    return { products: products.map(toCard), categories };
  },
  ['shop-data'],
  { revalidate: 300, tags: ['storefront'] }
);

// ---------- Product detail ----------

export const getProduct = unstable_cache(
  async (id) => {
    const p = await prisma.product.findUnique({
      where: { id },
      include: { categories: true, variations: { orderBy: { createdAt: 'asc' } } }
    });
    if (!p) return null;
    const card = toCard(p);
    const images = [...new Set([p.principalImage, ...(p.gallery || [])].filter(Boolean))];

    const variations = (p.variations || []).map(v => ({
      id: v.id,
      options: v.options || {},
      price: v.promoPrice ?? v.price, // effective price
      fullPrice: v.price,
      promoPrice: v.promoPrice ?? null,
      inStock: v.stock > 0
    }));
    const attributes = Array.isArray(p.attributes) ? p.attributes : [];
    const isVariable = p.type === 'variable' && variations.length > 0;
    const fromPrice = isVariable ? Math.min(...variations.map(v => v.price)) : card.price;

    // "Available options" shown on the product page. For variable products the
    // values come from the actual variations; for simple ones, from sizes/color.
    let optionGroups = [];
    if (isVariable) {
      const map = {};
      for (const v of variations) {
        for (const [name, val] of Object.entries(v.options)) {
          if (!map[name]) map[name] = [];
          if (!map[name].includes(val)) map[name].push(val);
        }
      }
      optionGroups = Object.entries(map).map(([name, values]) => ({ name, values }));
    } else {
      if (p.sizes?.length) optionGroups.push({ name: 'Size', values: p.sizes });
      if (p.color) optionGroups.push({ name: 'Color', values: [p.color] });
    }

    return {
      ...card,
      type: p.type,
      isVariable,
      attributes,
      variations,
      fromPrice,
      images,
      optionGroups,
      summary: p.shortDescription || '',
      additionalInfo: Array.isArray(p.additionalInfo) ? p.additionalInfo : []
    };
  },
  ['product'],
  { revalidate: 300, tags: ['storefront'] }
);

export const getRelated = unstable_cache(
  async (product, limit = 4) => {
    const slugs = product.categorySlugs ?? [];
    if (slugs.length === 0) return [];
    const items = await prisma.product.findMany({
      where: {
        categories: { some: { slug: { in: slugs } } },
        NOT: { id: product.id }
      },
      include: { categories: true },
      take: limit
    });
    return items.map(toCard);
  },
  ['related'],
  { revalidate: 300, tags: ['storefront'] }
);

export async function getProductIds() {
  const rows = await prisma.product.findMany({ select: { id: true } });
  return rows.map(r => r.id);
}

// ---------- Home page ----------

export const getHomeData = unstable_cache(
  async () => {
  const [bestSellersRaw, arrivalsRaw, allCategories, bundlesRaw] = await Promise.all([
    prisma.product.findMany({
      where: { tag: 'Best seller' },
      include: { categories: true },
      take: 6,
      orderBy: { createdAt: 'asc' }
    }),
    prisma.product.findMany({
      where: { tag: 'New' },
      include: { categories: true },
      take: 4,
      orderBy: { createdAt: 'desc' }
    }),
    categoriesWithCounts(),
    prisma.bundle.findMany({
      where: { active: true },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'asc' },
      take: 3
    })
  ]);

  const bestSellers = bestSellersRaw.map(p => {
    const c = toCard(p);
    return { id: c.id, name: c.name, category: c.categoryName, price: money(c.price), tag: c.tag, image: c.image };
  });

  const arrivals = arrivalsRaw.map(p => {
    const c = toCard(p);
    return { id: c.id, name: c.name, price: money(c.price), image: c.image };
  });

  const bundles = bundlesRaw.map(b => {
    const products = b.items.map(i => i.product).filter(Boolean);
    const base = products.reduce((sum, p) => sum + p.price, 0);
    const price = Math.round(base * (1 - b.discount / 100));
    return {
      id: b.id,
      slug: b.slug,
      name: b.name,
      items: products.map(p => p.name).join(' + ') || '—',
      price: money(price),
      was: money(base),
      save: `Save ${b.discount}%`,
      image: b.image || null
    };
  });

  // Home shows top-level categories only.
  const categories = allCategories.filter(c => !c.parent);

  return { bestSellers, arrivals, categories, bundles };
  },
  ['home-data'],
  { revalidate: 300, tags: ['storefront'] }
);

// ---------- Bundle detail ----------

export async function getBundle(slug) {
  const b = await prisma.bundle.findUnique({
    where: { slug },
    include: { items: { include: { product: { include: { categories: true } } } } }
  });
  if (!b || !b.active) return null;

  const products = b.items.map(i => i.product).filter(Boolean).map(toCard);
  const base = products.reduce((sum, p) => sum + p.price, 0);
  const price = Math.round(base * (1 - b.discount / 100));

  return {
    id: b.id,
    slug: b.slug,
    name: b.name,
    image: b.image || null,
    discount: b.discount,
    base,
    price,
    save: base - price,
    products
  };
}

// ---------- Search ----------

export async function searchProducts(query) {
  const q = String(query || '').trim();
  if (!q) return [];
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { categories: { some: { name: { contains: q, mode: 'insensitive' } } } }
      ]
    },
    include: { categories: true },
    take: 6
  });
  return products.map(p => {
    const c = toCard(p);
    return { id: c.id, name: c.name, category: c.categoryName, price: c.price, image: c.image, sizes: c.sizes };
  });
}
