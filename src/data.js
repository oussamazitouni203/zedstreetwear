// Replace `image` values with real photo paths (e.g. /images/tee.jpg)

export const bestSellers = [
  { id: 1, name: 'Oversized Logo Tee', category: 'Tees', price: '$45', tag: 'Best seller', image: null },
  { id: 2, name: 'Heavyweight Hoodie', category: 'Hoodies', price: '$95', tag: 'Best seller', image: null },
  { id: 3, name: 'Cargo Pant 2.0', category: 'Pants', price: '$110', tag: 'Low stock', image: null },
  { id: 4, name: 'Boxy Zip Jacket', category: 'Outerwear', price: '$140', tag: 'Best seller', image: null },
  { id: 5, name: 'Everyday Beanie', category: 'Accessories', price: '$30', tag: 'Restocked', image: null },
  { id: 6, name: 'Wide Denim', category: 'Pants', price: '$120', tag: 'Best seller', image: null }
];

export const categories = [
  { id: 'tees', name: 'Tees', count: '4 items', image: null },
  { id: 'hoodies', name: 'Hoodies', count: '3 items', image: null },
  { id: 'pants', name: 'Pants', count: '4 items', image: null },
  { id: 'outerwear', name: 'Outerwear', count: '3 items', image: null },
  { id: 'accessories', name: 'Accessories', count: '4 items', image: null }
];

// Full catalog for the shop page. `price` is numeric so it can be sorted/filtered.
// `sizes` uses OS for one-size items.
export const products = [
  { id: 1, name: 'Oversized Logo Tee', category: 'tees', price: 45, tag: 'Best seller', isNew: false, sizes: ['S', 'M', 'L', 'XL'], color: 'Black', image: null },
  { id: 2, name: 'Heavyweight Hoodie', category: 'hoodies', price: 95, tag: 'Best seller', isNew: false, sizes: ['S', 'M', 'L', 'XL'], color: 'Black', image: null },
  { id: 3, name: 'Cargo Pant 2.0', category: 'pants', price: 110, tag: 'Low stock', isNew: false, sizes: ['M', 'L', 'XL'], color: 'Grey', image: null },
  { id: 4, name: 'Boxy Zip Jacket', category: 'outerwear', price: 140, tag: 'Best seller', isNew: false, sizes: ['S', 'M', 'L'], color: 'Black', image: null },
  { id: 5, name: 'Everyday Beanie', category: 'accessories', price: 30, tag: 'Restocked', isNew: false, sizes: ['OS'], color: 'Black', image: null },
  { id: 6, name: 'Wide Denim', category: 'pants', price: 120, tag: 'Best seller', isNew: false, sizes: ['S', 'M', 'L', 'XL'], color: 'Grey', image: null },
  { id: 7, name: 'Graphic Tee — Static', category: 'tees', price: 48, tag: 'New', isNew: true, sizes: ['S', 'M', 'L', 'XL'], color: 'White', image: null },
  { id: 8, name: 'Half-Zip Fleece', category: 'hoodies', price: 88, tag: 'New', isNew: true, sizes: ['S', 'M', 'L'], color: 'Grey', image: null },
  { id: 9, name: 'Nylon Track Pant', category: 'pants', price: 98, tag: 'New', isNew: true, sizes: ['S', 'M', 'L', 'XL'], color: 'Black', image: null },
  { id: 10, name: 'Canvas Tote', category: 'accessories', price: 35, tag: 'New', isNew: true, sizes: ['OS'], color: 'Off-white', image: null },
  { id: 11, name: 'Pocket Tee 2-Pack', category: 'tees', price: 60, tag: null, isNew: false, sizes: ['S', 'M', 'L', 'XL'], color: 'White', image: null },
  { id: 12, name: 'Washed Crewneck', category: 'hoodies', price: 75, tag: null, isNew: false, sizes: ['S', 'M', 'L', 'XL'], color: 'Grey', image: null },
  { id: 13, name: 'Puffer Vest', category: 'outerwear', price: 130, tag: null, isNew: true, sizes: ['M', 'L', 'XL'], color: 'Black', image: null },
  { id: 14, name: 'Coach Jacket', category: 'outerwear', price: 115, tag: null, isNew: false, sizes: ['S', 'M', 'L', 'XL'], color: 'Black', image: null },
  { id: 15, name: 'Ribbed Balaclava', category: 'accessories', price: 28, tag: 'Low stock', isNew: false, sizes: ['OS'], color: 'Grey', image: null },
  { id: 16, name: 'Wide Chino', category: 'pants', price: 105, tag: null, isNew: true, sizes: ['S', 'M', 'L'], color: 'Off-white', image: null },
  { id: 17, name: 'Longsleeve Thermal', category: 'tees', price: 55, tag: null, isNew: false, sizes: ['S', 'M', 'L', 'XL'], color: 'Off-white', image: null },
  { id: 18, name: 'Cap — Tonal', category: 'accessories', price: 32, tag: null, isNew: false, sizes: ['OS'], color: 'White', image: null }
];

// Per-product marketing copy for the detail page. Falls back to a generated
// line (see productBlurb) for any id not listed here.
export const productInfo = {
  1: 'A boxy, dropped-shoulder tee cut from heavyweight cotton that holds its shape wash after wash. The everyday base layer, done properly.',
  2: 'Our flagship fleece — brushed inside, structured outside. Ribbed cuffs and a double-lined hood give it real weight and drape.',
  3: 'A rebuilt take on the utility pant: articulated knees, roomy cargo pockets and a tapered ankle that keeps the silhouette clean.',
  4: 'A cropped, boxy zip jacket with a stand collar. Layers over a hoodie, sits sharp on its own.',
  5: 'A tight-knit ribbed beanie in a mid-weight yarn. Sits high or folds deep — your call.',
  6: 'Rigid wide-leg denim with a mid rise and a full break. Broken in over time, never out of rotation.',
  7: 'Washed-out graphic tee with a faded static print, screen-printed to crack and age with wear.',
  8: 'A half-zip fleece that splits the difference between a crew and a hoodie. Brushed loopback, funnel neck.',
  9: 'Lightweight nylon track pant with a tapered leg, zip cuffs and a hidden drawcord. Built to move.',
  10: 'A heavy canvas tote with reinforced straps and a boxed base. Carries a lot, folds flat when it doesn’t.',
  11: 'Two heavyweight pocket tees, one price. The reliable white-tee foundation in a proper weight.',
  12: 'A pigment-washed crewneck with a lived-in hand-feel from the first wear. Relaxed through the body.',
  13: 'An insulated puffer vest with a high collar and matte shell. Core warmth without the bulk on your arms.',
  14: 'The classic coach jacket, reworked with a heavier shell and snap front. Wind-ready, endlessly layerable.',
  15: 'A ribbed knit balaclava that doubles as a neck gaiter. Full coverage when the temperature drops.',
  16: 'A wide-leg chino with a clean drape and a mid rise. Tailored enough to dress up, roomy enough to relax.',
  17: 'A waffle-knit thermal longsleeve with a slim, layer-ready fit and thumbholes at the cuff.',
  18: 'A tonal six-panel cap with an unstructured crown and a curved brim broken in from day one.'
};

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

export function productBlurb(product) {
  return (
    productInfo[product.id] ||
    `A ${product.color.toLowerCase()} ${product.name.toLowerCase()} from the SS26 range — cut clean, built to last.`
  );
}

export function productSpecs(product) {
  return [
    { label: 'Material', value: MATERIAL[product.category] },
    { label: 'Fit', value: FIT[product.category] },
    { label: 'Color', value: product.color },
    { label: 'Care', value: 'Machine wash cold, hang dry' }
  ];
}

export const arrivals = [
  { id: 1, name: 'Graphic Tee — Static', price: '$48', image: null },
  { id: 2, name: 'Half-Zip Fleece', price: '$88', image: null },
  { id: 3, name: 'Nylon Track Pant', price: '$98', image: null },
  { id: 4, name: 'Canvas Tote', price: '$35', image: null }
];

export const bundles = [
  { id: 1, name: 'The Starter', items: 'Oversized Logo Tee + Everyday Beanie + Canvas Tote', price: '$95', was: '$113', save: 'Save 15%', image: null },
  { id: 2, name: 'The Uniform', items: 'Heavyweight Hoodie + Cargo Pant 2.0', price: '$165', was: '$205', save: 'Save 20%', image: null },
  { id: 3, name: 'Full Fit', items: 'Boxy Zip Jacket + Graphic Tee + Wide Denim', price: '$248', was: '$308', save: 'Save 20%', image: null }
];

export const reviews = [
  { id: 1, quote: 'The hoodie weight is unreal. Heaviest fleece I own and it still drapes right.', author: 'Marcus T. — Verified buyer' },
  { id: 2, quote: 'Sizing is true, shipping was fast, and the cargo 2.0 is my new daily.', author: 'Lena K. — Verified buyer' },
  { id: 3, quote: 'Finally a brand that does monochrome without being boring. Zero regrets.', author: 'Dario M. — Verified buyer' }
];

// Countdown target: 4 days 12h 30m from first load. Replace with a fixed
// drop date in production, e.g. new Date('2026-08-01T18:00:00Z').getTime()
export const DROP_TARGET = Date.now() + (4 * 24 * 3600 + 12 * 3600 + 30 * 60) * 1000;
