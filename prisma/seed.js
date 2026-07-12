// ============ ZEDSTREETWEAR — database seed ============
// Run with: npm run db:seed  (after `npm run db:migrate`)
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const slugify = s =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const CATEGORIES = ['Tees', 'Hoodies', 'Pants', 'Outerwear', 'Accessories'];

const PRODUCTS = [
  { name: 'Oversized Logo Tee', category: 'Tees', price: 45, promoPrice: 39, stock: 132, tag: 'Best seller', sizes: ['S', 'M', 'L', 'XL'], color: 'Black' },
  { name: 'Heavyweight Hoodie', category: 'Hoodies', price: 95, stock: 87, tag: 'Best seller', sizes: ['S', 'M', 'L', 'XL'], color: 'Black' },
  { name: 'Cargo Pant 2.0', category: 'Pants', price: 110, stock: 9, tag: 'Low stock', sizes: ['M', 'L', 'XL'], color: 'Grey' },
  { name: 'Boxy Zip Jacket', category: 'Outerwear', price: 140, stock: 41, tag: 'Best seller', sizes: ['S', 'M', 'L'], color: 'Black' },
  { name: 'Everyday Beanie', category: 'Accessories', price: 30, stock: 210, tag: 'Restocked', sizes: ['OS'], color: 'Black' },
  { name: 'Wide Denim', category: 'Pants', price: 120, stock: 64, tag: 'Best seller', sizes: ['S', 'M', 'L', 'XL'], color: 'Grey' },
  { name: 'Graphic Tee — Static', category: 'Tees', price: 48, stock: 98, tag: 'New', sizes: ['S', 'M', 'L', 'XL'], color: 'White' },
  { name: 'Half-Zip Fleece', category: 'Hoodies', price: 88, stock: 55, tag: 'New', sizes: ['S', 'M', 'L'], color: 'Grey' }
];

// Admin accounts (the only kind of account the app has). Password: admin1234.
const ADMINS = [
  { name: 'Store Admin', email: 'admin@zedstreetwear.com' },
  { name: 'Nadia Merabet', email: 'nadia@zedstreetwear.com' }
];

// Guest customers are NOT accounts — their name/email is snapshotted on the order.
const CUSTOMER_EMAIL = {
  'Marcus Toure': 'marcus.t@gmail.com',
  'Lena Kovacs': 'lena.kv@gmail.com',
  'Dario Mancini': 'dario.m@gmail.com',
  'Aya Nakamura': 'aya.nk@gmail.com',
  'Omar Haddad': 'omar.hd@gmail.com',
  'Sofia Reyes': 'sofia.r@gmail.com'
};

const ORDERS = [
  { seq: 1094, customer: 'Marcus Toure', total: 235, status: 'PENDING', state: 'CURRENT' },
  { seq: 1093, customer: 'Lena Kovacs', total: 95, status: 'PENDING', state: 'CURRENT' },
  { seq: 1092, customer: 'Dario Mancini', total: 168, status: 'SHIPPED', state: 'CURRENT' },
  { seq: 1091, customer: 'Aya Nakamura', total: 45, status: 'SHIPPED', state: 'CURRENT' },
  { seq: 1090, customer: 'Omar Haddad', total: 310, status: 'DELIVERED', state: 'CURRENT' },
  { seq: 1089, customer: 'Sofia Reyes', total: 120, status: 'CANCELED', state: 'CURRENT' },
  { seq: 1088, customer: 'Marcus Toure', total: 78, status: 'ABANDONED', state: 'CURRENT' }
];

const BUNDLES = [
  { name: 'The Starter', discount: 15, active: true, items: ['Oversized Logo Tee', 'Everyday Beanie'] },
  { name: 'The Uniform', discount: 20, active: true, items: ['Heavyweight Hoodie', 'Cargo Pant 2.0'] },
  { name: 'Full Fit', discount: 20, active: false, items: ['Boxy Zip Jacket', 'Graphic Tee — Static', 'Wide Denim'] }
];

async function main() {
  console.log('Seeding database…');

  // --- Admin users (the only accounts) ---
  const adminPassword = await bcrypt.hash('admin1234', 10);
  for (const a of ADMINS) {
    await prisma.user.upsert({
      where: { email: a.email },
      update: {},
      create: { name: a.name, email: a.email, password: adminPassword, role: 'ADMIN' }
    });
  }

  // --- Categories ---
  const catByName = {};
  for (const name of CATEGORIES) {
    const cat = await prisma.category.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name) }
    });
    catByName[name] = cat;
  }

  // --- Products ---
  const prodByName = {};
  for (const p of PRODUCTS) {
    const catId = catByName[p.category]?.id;
    const prod = await prisma.product.upsert({
      where: { slug: slugify(p.name) },
      // Backfill sizes/color + category link on existing rows.
      update: {
        sizes: p.sizes,
        color: p.color,
        categories: catId ? { set: [{ id: catId }] } : { set: [] }
      },
      create: {
        name: p.name,
        slug: slugify(p.name),
        shortDescription: `${p.name} — SS26 essential.`,
        description: `The ${p.name} from the ZEDSTREETWEAR SS26 collection. Monochrome, heavyweight, built to last.`,
        price: p.price,
        promoPrice: p.promoPrice ?? null,
        type: 'simple',
        categories: catId ? { connect: [{ id: catId }] } : undefined,
        principalImage: null,
        gallery: [],
        sizes: p.sizes,
        color: p.color,
        stock: p.stock,
        tag: p.tag ?? null
      }
    });
    prodByName[p.name] = prod;
  }

  // --- Orders (+ one snapshot item each) ---
  for (const o of ORDERS) {
    const existing = await prisma.order.findUnique({ where: { seq: o.seq } });
    if (existing) continue;
    await prisma.order.create({
      data: {
        seq: o.seq,
        customerName: o.customer,
        customerEmail: CUSTOMER_EMAIL[o.customer] ?? null,
        total: o.total,
        status: o.status,
        state: o.state ?? 'CURRENT',
        items: {
          create: [{ name: 'Order total', price: o.total, quantity: 1 }]
        }
      }
    });
  }

  // --- Bundles ---
  for (const b of BUNDLES) {
    const slug = slugify(b.name);
    const existing = await prisma.bundle.findUnique({ where: { slug } });
    if (existing) continue;
    await prisma.bundle.create({
      data: {
        name: b.name,
        slug,
        discount: b.discount,
        active: b.active,
        items: {
          create: b.items
            .map(n => prodByName[n]?.id)
            .filter(Boolean)
            .map(productId => ({ productId }))
        }
      }
    });
  }

  console.log('Seed complete.');
  console.log('  Admin logins (password admin1234):');
  for (const a of ADMINS) console.log(`    ${a.email}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
