import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import StickyNavbar from '@/components/StickyNavbar';
import MobileLayout from '@/components/mobile/MobileLayout';
import CartLayout from '@/components/layout/CartLayout';
import Providers from './providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'G3 TECH - Phụ kiện chính hãng',
  description: 'Cung cấp phụ kiện điện thoại, action cam và thiết bị điện tử chính hãng',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <Providers>
          <CartLayout>
            <div className="desktop-layout bg-gray-100">
              <div className="pl-16">
                <Header />
              </div>
              <StickyNavbar />
              <main className="pl-16">{children}</main>
              <div className="pl-16">
                <Footer />
              </div>
            </div>
            <MobileLayout>{children}</MobileLayout>
          </CartLayout>
          <Toaster
            toastOptions={{
              className: '',
              style: {
                background: '#fff',
                color: '#333',
                padding: '16px',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                fontSize: '14px',
                fontWeight: '500',
                maxWidth: '300px',
                border: 'none',
              },
            }}
            position="top-right"
            reverseOrder={false}
            gutter={8}
            containerStyle={{
              top: 20,
              right: 20,
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
