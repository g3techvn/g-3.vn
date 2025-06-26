import '../styles/globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/layout/header/Header';
import StickyNavbar from '@/components/layout/header/StickyNavbar';
import MobileLayout from '@/components/mobile/MobileLayout';
import CartLayout from '@/components/layout/CartLayout';
import Providers from './providers';
import Script from 'next/script';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { defaultMetadata } from './metadata';
import Footer from '@/components/layout/footer/Footer';
import { OrganizationJsonLd } from '@/components/SEO/OrganizationJsonLd';
import { LocalBusinessJsonLd } from '@/components/SEO/LocalBusinessJsonLd';
import { SocialMetaTags } from '@/components/SEO/SocialMetaTags';
import { COMPANY_INFO, SOCIAL_LINKS } from '@/constants';
import { CartProvider } from '@/context/CartContext'
// import { BuyNowProvider } from '@/context/BuyNowContext' - Temporarily commented out

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
  weight: ['400', '500', '600', '700'],
  adjustFontFallback: true
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff'
};

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full">
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.g-3.vn" crossOrigin="anonymous" />
        
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="G3 Store" />
        <link rel="apple-touch-icon" href="/icons/apple-icon-180.png" />
        
        {/* Add Google Analytics */}
        <GoogleAnalytics />
        
        {/* Social Media Meta Tags */}
        <SocialMetaTags />
        
        {/* Schema metadata will be rendered in body */}
      </head>
      <body className={`${inter.className} h-full`}>
        <CartProvider>
          {/* <BuyNowProvider> - Temporarily commented out to fix crash */}
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
            </Providers>
          {/* </BuyNowProvider> */}
        </CartProvider>
        
        {/* SEO Schema */}
        <OrganizationJsonLd 
          contact={{
            phone: COMPANY_INFO.hotline,
            email: COMPANY_INFO.email,
            address: COMPANY_INFO.address
          }}
          social={SOCIAL_LINKS.reduce((acc, link) => ({
            ...acc,
            [link.name.toLowerCase()]: link.href
          }), {})}
        />
        <LocalBusinessJsonLd includeReviews={true} />
        
        {/* Register Service Worker */}
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('Service Worker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('Service Worker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
