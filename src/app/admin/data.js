// ============ ZEDSTREETWEAR ADMIN — seed data ============

export const seedProducts = [
  { id: 1, name: 'Oversized Logo Tee', category: 'Tees', price: 45, stock: 132, tag: 'Best seller' },
  { id: 2, name: 'Heavyweight Hoodie', category: 'Hoodies', price: 95, stock: 87, tag: 'Best seller' },
  { id: 3, name: 'Cargo Pant 2.0', category: 'Pants', price: 110, stock: 9, tag: 'Low stock' },
  { id: 4, name: 'Boxy Zip Jacket', category: 'Outerwear', price: 140, stock: 41, tag: 'Best seller' },
  { id: 5, name: 'Everyday Beanie', category: 'Accessories', price: 30, stock: 210, tag: 'Restocked' },
  { id: 6, name: 'Wide Denim', category: 'Pants', price: 120, stock: 64, tag: 'Best seller' },
  { id: 7, name: 'Graphic Tee — Static', category: 'Tees', price: 48, stock: 98, tag: 'New' },
  { id: 8, name: 'Half-Zip Fleece', category: 'Hoodies', price: 88, stock: 55, tag: 'New' }
];

export const seedOrders = [
  { id: '#1094', customer: 'Marcus Toure', date: 'Jul 9, 2026', total: 235, status: 'Pending' },
  { id: '#1093', customer: 'Lena Kovacs', date: 'Jul 9, 2026', total: 95, status: 'Pending' },
  { id: '#1092', customer: 'Dario Mancini', date: 'Jul 8, 2026', total: 168, status: 'Shipped' },
  { id: '#1091', customer: 'Aya Nakamura', date: 'Jul 8, 2026', total: 45, status: 'Shipped' },
  { id: '#1090', customer: 'Omar Haddad', date: 'Jul 7, 2026', total: 310, status: 'Delivered' },
  { id: '#1089', customer: 'Sofia Reyes', date: 'Jul 7, 2026', total: 120, status: 'Delivered' },
  { id: '#1088', customer: 'Jonas Weber', date: 'Jul 6, 2026', total: 78, status: 'Delivered' }
];

export const seedBundles = [
  { id: 1, name: 'The Starter', items: 'Oversized Logo Tee + Everyday Beanie + Canvas Tote', base: 113, discount: 15, active: true },
  { id: 2, name: 'The Uniform', items: 'Heavyweight Hoodie + Cargo Pant 2.0', base: 205, discount: 20, active: true },
  { id: 3, name: 'Full Fit', items: 'Boxy Zip Jacket + Graphic Tee + Wide Denim', base: 308, discount: 20, active: false }
];

export const seedCustomers = [
  { id: 1, name: 'Marcus Toure', email: 'marcus.t@gmail.com', orders: 6, spent: 640, joined: 'Jan 2026' },
  { id: 2, name: 'Lena Kovacs', email: 'lena.kv@gmail.com', orders: 4, spent: 385, joined: 'Feb 2026' },
  { id: 3, name: 'Dario Mancini', email: 'dario.m@gmail.com', orders: 8, spent: 912, joined: 'Nov 2025' },
  { id: 4, name: 'Aya Nakamura', email: 'aya.nk@gmail.com', orders: 2, spent: 90, joined: 'May 2026' },
  { id: 5, name: 'Omar Haddad', email: 'omar.hd@gmail.com', orders: 5, spent: 731, joined: 'Dec 2025' },
  { id: 6, name: 'Sofia Reyes', email: 'sofia.r@gmail.com', orders: 3, spent: 264, joined: 'Mar 2026' }
];

export const topProducts = [
  { name: 'Heavyweight Hoodie', sold: 214, revenue: 20330, barWidth: '100%' },
  { name: 'Oversized Logo Tee', sold: 312, revenue: 14040, barWidth: '69%' },
  { name: 'Cargo Pant 2.0', sold: 118, revenue: 12980, barWidth: '64%' },
  { name: 'Wide Denim', sold: 96, revenue: 11520, barWidth: '57%' }
];

export const CATEGORIES = ['Tees', 'Hoodies', 'Pants', 'Outerwear', 'Accessories'];
export const TAGS = ['', 'Best seller', 'Low stock', 'Restocked', 'New'];

export const money = n => '$' + n.toLocaleString();
