import './globals.css';
import { Geist } from 'next/font/google';
import Header from './components/Header';
import { CartProvider } from './context/CartContext';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata = {
  title: 'Tiendita',
  description: 'E-commerce con Next.js, Laravel y Stripe',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={geist.variable}>
      <body className="min-h-screen bg-background font-sans text-ink antialiased">
        <CartProvider>
          <Header />
          <div className="mx-auto max-w-6xl px-4 sm:px-6">{children}</div>
          <footer className="mt-16 border-t border-line bg-white">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p>© {new Date().getFullYear()} Tiendita · Tu supermercado en línea</p>
              <p>
                Fotos de{' '}
                <a href="https://unsplash.com" target="_blank" rel="noreferrer" className="underline hover:text-ink">
                  Unsplash
                </a>
              </p>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
