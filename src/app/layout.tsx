import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import StickyNavbar from '@/components/StickyNavbar';
import Providers from './providers';

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
          <div className="md:ml-[60px]">
            <Header />
            <main className="bg-gray-100 px-4 md:px-0">
              {children}
            </main>
            <Footer />
          </div>
          <StickyNavbar />
        </Providers>
      </body>
    </html>
  );
}
