import Hero from '../components/Hero.jsx';
import BestSellers from '../components/BestSellers.jsx';
import Categories from '../components/Categories.jsx';
import FeaturedDrop from '../components/FeaturedDrop.jsx';
import InstagramFeed from '../components/InstagramFeed.jsx';
import { getHomeData, getStoreSettings } from '../lib/storefront.js';
import { mergeContent, resolveDropTarget } from '../lib/content.js';
import { resolveCurrency } from '../lib/currency.js';
import {
  Marquee,
  NewArrivals,
  Bundles,
  Promo,
  UspBar
} from '../components/Sections.jsx';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const settings = await getStoreSettings();
  const currency = resolveCurrency(settings);
  const { bestSellers, arrivals, categories, bundles } = await getHomeData(currency);
  const content = mergeContent(settings);
  const dropTarget = resolveDropTarget(content.drop);

  return (
    <>
      <Hero hero={content.hero} />
      <Marquee announcement={content.announcement} />
      <BestSellers items={bestSellers} />
      <Categories categories={categories} />
      <FeaturedDrop drop={content.drop} target={dropTarget} />
      <NewArrivals arrivals={arrivals} />
      <Bundles bundles={bundles} />
      <Promo promo={content.promo} />
      <InstagramFeed />
      <UspBar />
    </>
  );
}
