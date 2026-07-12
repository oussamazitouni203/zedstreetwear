import { NextResponse } from 'next/server';
import { searchProducts } from '../../../lib/storefront.js';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const q = req.nextUrl.searchParams.get('q') || '';
  const results = await searchProducts(q);
  return NextResponse.json({ results });
}
