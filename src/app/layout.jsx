import { StoreProvider } from '../components/StoreProvider.jsx';
import AppChrome from '../components/AppChrome.jsx';
import Preloader from '../components/Preloader.jsx';
import '../styles.css';

export const metadata = {
  title: 'The Bespoke',
  description: 'Monochrome streetwear essentials — SS26 collection.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Preloader />
        <StoreProvider>
          <AppChrome>{children}</AppChrome>
        </StoreProvider>
      </body>
    </html>
  );
}
