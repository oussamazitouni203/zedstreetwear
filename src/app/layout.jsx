import { StoreProvider } from '../components/StoreProvider.jsx';
import AppChrome from '../components/AppChrome.jsx';
import '../styles.css';

export const metadata = {
  title: 'Zedstreetwear',
  description: 'Monochrome streetwear essentials — SS26 collection.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <AppChrome>{children}</AppChrome>
        </StoreProvider>
      </body>
    </html>
  );
}
