import { StoreProvider } from '../components/StoreProvider.jsx';
import AppChrome from '../components/AppChrome.jsx';
import Preloader from '../components/Preloader.jsx';
import { getStoreSettings } from '../lib/storefront.js';
import '../styles.css';

export const metadata = {
  title: 'The Bespoke',
  description: 'Monochrome streetwear essentials — SS26 collection.'
};

export default async function RootLayout({ children }) {
  const settings = await getStoreSettings();
  const social = settings.social || {};

  return (
    <html lang="en">
      <body>
        <Preloader />
        <StoreProvider>
          <AppChrome social={social}>{children}</AppChrome>
        </StoreProvider>
      </body>
    </html>
  );
}
