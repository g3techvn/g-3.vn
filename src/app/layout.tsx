import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/pc/header/Header';
import StickyNavbar from '@/components/pc/header/StickyNavbar';
import MobileLayout from '@/components/mobile/MobileLayout';
import CartLayout from '@/components/layout/CartLayout';
import Providers from './providers';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { defaultMetadata } from './metadata';
import Footer from '@/components/pc/footer/Footer';
import WebVitalsTracker from '@/components/WebVitalsTracker';
import { OrganizationJsonLd } from '@/components/SEO/OrganizationJsonLd';
import { COMPANY_INFO, SOCIAL_LINKS } from '@/constants';

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
        
        {/* Organization Schema for SEO */}
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
      </head>
      <body className={`${inter.className} h-full`}>
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
        
        {/* Web Vitals Tracking */}
        <WebVitalsTracker />
        
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
