import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import StickyNavbar from '@/components/StickyNavbar';
import MobileLayout from '@/components/mobile/MobileLayout';
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
          <div className="desktop-layout">
            <Header />
            <StickyNavbar />
            <main>{children}</main>
            <Footer />
          </div>
          <MobileLayout>{children}</MobileLayout>
        </Providers>
      </body>
    </html>
  );
}
