import { StoreProvider } from '../components/StoreProvider.jsx';
import AppChrome from '../components/AppChrome.jsx';
import Preloader from '../components/Preloader.jsx';
import { getStoreSettings } from '../lib/storefront.js';
import { resolveCurrency } from '../lib/currency.js';
import '../styles.css';

// Title/description come from General settings (store name & tagline).
export async function generateMetadata() {
  const settings = await getStoreSettings();
  const g = settings.general || {};
  const name = g.storeName || 'The Bespoke';
  return {
    title: { default: name, template: `%s — ${name}` },
    description: g.tagline || 'Monochrome streetwear essentials — SS26 collection.'
  };
}

export default async function RootLayout({ children }) {
  const settings = await getStoreSettings();
  const social = settings.social || {};
  const currency = resolveCurrency(settings);
  const storeName = settings.general?.storeName || 'The Bespoke';

  return (
    <html lang="en">
      <body>
        <Preloader />
        <StoreProvider currency={currency}>
          <AppChrome social={social} storeName={storeName}>{children}</AppChrome>
        </StoreProvider>
      </body>
    </html>
  );
}
