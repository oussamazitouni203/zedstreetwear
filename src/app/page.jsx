import Hero from '../components/Hero.jsx';
import BestSellers from '../components/BestSellers.jsx';
import Categories from '../components/Categories.jsx';
import FeaturedDrop from '../components/FeaturedDrop.jsx';
import InstagramFeed from '../components/InstagramFeed.jsx';
import { getHomeData } from '../lib/storefront.js';
import {
  Marquee,
  NewArrivals,
  Bundles,
  Promo,
  UspBar
} from '../components/Sections.jsx';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { bestSellers, arrivals, categories, bundles } = await getHomeData();

  return (
    <>
      <Hero />
      <Marquee />
      <BestSellers items={bestSellers} />
      <Categories categories={categories} />
      <FeaturedDrop />
      <NewArrivals arrivals={arrivals} />
      <Bundles bundles={bundles} />
      <Promo />
      <InstagramFeed />
      <UspBar />
    </>
  );
}
