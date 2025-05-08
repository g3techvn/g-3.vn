import * as React from 'react';
import { FooterLink } from '../ui/FooterLink';
import { FooterSection } from '../ui/FooterSection';
import { LogoBadge } from '../ui/LogoBadge';
import { VisuallyHidden } from '../ui/VisuallyHidden';
import CallBox from './CallBox';
import ZaloBox from './ZaloBox';
import BottomNav from './BottomNav';
import { COMPANY_INFO, SHIPPING_PROVIDERS, PAYMENT_METHODS, QUICK_LINKS, SOCIAL_LINKS, FEEDBACK_INFO } from '../../constants';

// Type declarations for environment variables
declare global {
  interface ImportMeta {
    env: {
      COMPANY_NAME: string;
      COMPANY_ADDRESS: string;
      PHONE_NUMBER: string;
      EMAIL: string;
      WORKING_HOURS: string;
    }
  }
}

// Constants
const sections = [
  {
    heading: "Doanh nghiệp",
    links: [
      { text: "Liên hệ", href: "/lien-he" },
      { text: "Về chúng tôi", href: "/ve-chung-toi" },
    ],
  },
  {
    heading: "Thông tin hữu ích",
    links: [
      {
        text: "Chính sách bảo hành",
        href: "/noi-dung/chinh-sach-bao-hanh-g3",
      },
      {
        text: "Chính sách đổi trả",
        href: "/noi-dung/chinh-sach-doi-tra-g3",
      },
      {
        text: "Chính sách vận chuyển",
        href: "/noi-dung/chinh-sach-van-chuyen-g3",
      },
      {
        text: "Chính sách bảo mật",
        href: "/noi-dung/chinh-sach-bao-mat-g3",
      },
      {
        text: "Chính sách thanh toán",
        href: "/noi-dung/chinh-sach-thanh-toan-g3",
      },
      {
        text: "Chính sách kiểm hàng",
        href: "/noi-dung/chinh-sach-kiem-hang-g3",
      },
    ],
  },
];

const socialLinks = [
  { 
    name: "Facebook", 
    href: "https://www.facebook.com/g3.vntech", 
    hoverColor: "text-blue-600",
    icon: `<path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" />`
  },
  { 
    name: "YouTube", 
    href: "https://www.youtube.com/@g3-tech", 
    hoverColor: "text-red-600",
    icon: `<path fill-rule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clip-rule="evenodd" />`
  },
  { 
    name: "TikTok", 
    href: "https://www.tiktok.com/@g3tech.vn", 
    hoverColor: "text-blue-400",
    icon: `<path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3V0Z" />`
  },
];

const products = [
  { text: "Ghế công thái học G3 Pro", href: "/ghe-cong-thai-hoc-g3" },
  { text: "Ghế công thái học E-Dra", href: "/ghe-cong-thai-hoc-edra" },
  { text: "Ghế công thái học Gami", href: "/ghe-cong-thai-hoc-gami" },
  { text: "Ghế công thái học Sihoo", href: "/ghe-cong-thai-hoc-sihoo" },
  { text: "Ghế công thái học Xiaomi", href: "/ghe-cong-thai-hoc-xiaomi" },
];



// Helper function to format phone number
function formatPhoneNumber(phoneNumber: string | number): string {
  const cleaned = ('' + phoneNumber).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{4})(\d{3})(\d{3})$/);
  
  if (match) {
    return match[1] + '.' + match[2] + '.' + match[3];
  }
  
  return phoneNumber.toString();
}

const formattedPhoneNumber = formatPhoneNumber(COMPANY_INFO.hotline);

export default function Footer() {
  // Define menu items for BottomNav
  const menuItems = [
    {
      href: '/',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      isImage: false,
      text: 'Trang chủ'
    },
    {
      href: '/danh-muc',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
      isImage: false,
      text: 'Danh mục'
    },
    {
      href: '/khuyen-mai',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      ),
      isImage: false,
      text: 'Khuyến mãi'
    },
    {
      href: '/lien-he',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      isImage: false,
      text: 'Nhắn tin'
    },
    {
      href: '/tai-khoan',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      isImage: false,
      text: 'Tài khoản'
    }
  ];

  return (
    <footer className="bg-white text-gray-800">
      <div className="container mx-auto py-8 md:py-12 px-4 sm:px-6 lg:px-0">
        {/* Footer content with responsive grid */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Thông tin liên hệ */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 md:mb-6 text-gray-900">Thông tin liên hệ</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="font-medium">{COMPANY_INFO.name}</span>
              </div>
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-gray-500 flex-shrink-0 hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm md:text-base">{COMPANY_INFO.address}</span>
              </div>
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href={`tel:${COMPANY_INFO.hotline}`} className="hover:text-red-600 transition-colors">{formattedPhoneNumber}</a>
              </div>
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${COMPANY_INFO.email}`} className="hover:text-red-600 transition-colors text-sm md:text-base break-all">{COMPANY_INFO.email}</a>
              </div>
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm md:text-base">Giờ làm việc: {COMPANY_INFO.workingHours}</span>
              </div>
            </div>
          </div>

          {/* Danh mục sản phẩm */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 md:mb-6 text-gray-900">Sản phẩm</h3>
            <ul className="space-y-2 md:space-y-3">
              {products.map((product) => (
                <li key={product.href}>
                  <a href={product.href} className="text-sm md:text-base hover:text-red-600 transition-colors">
                    {product.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Thông tin */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 md:mb-6 text-gray-900">Thông tin</h3>
            <ul className="space-y-2 md:space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm md:text-base hover:text-red-600 transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Kết nối */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 md:mb-6 text-gray-900">Kết nối với chúng tôi</h3>
            <div className="flex flex-wrap space-x-4 mb-6">
              {SOCIAL_LINKS.map((link) => (
                <a key={link.href} href={link.href} className="text-gray-500 hover:text-red-600">
                  <span className="sr-only">{link.name}</span>
                  <span className="text-sm font-medium">{link.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Accordion for Policies */}
        <div className="md:hidden mt-8 border-t border-gray-200 pt-6 px-2">
          <details className="group mb-5 border-b border-gray-100 pb-2">
            <summary className="flex justify-between items-center cursor-pointer list-none px-2 py-3 rounded-md hover:bg-gray-50 transition-colors duration-200">
              <span className="font-semibold text-gray-900">Thông tin liên hệ</span>
              <span className="transition-transform duration-300 ease-in-out group-open:rotate-180">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <div className="mt-3 pl-4 space-y-3 mx-2 overflow-hidden transition-all duration-300 ease-in-out">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="font-medium">{COMPANY_INFO.name}</span>
              </div>
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm">{COMPANY_INFO.address}</span>
              </div>
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href={`tel:${COMPANY_INFO.hotline}`} className="hover:text-red-600 transition-colors">{formattedPhoneNumber}</a>
              </div>
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${COMPANY_INFO.email}`} className="hover:text-red-600 transition-colors text-sm break-all">{COMPANY_INFO.email}</a>
              </div>
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Giờ làm việc: {COMPANY_INFO.workingHours}</span>
              </div>
            </div>
          </details>

          <details className="group mb-5 border-b border-gray-100 pb-2">
            <summary className="flex justify-between items-center cursor-pointer list-none px-2 py-3 rounded-md hover:bg-gray-50 transition-colors duration-200">
              <span className="font-semibold text-gray-900">Sản phẩm</span>
              <span className="transition-transform duration-300 ease-in-out group-open:rotate-180">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <div className="mt-3 pl-4 space-y-2 mx-2 overflow-hidden transition-all duration-300 ease-in-out">
              {products.map((product) => (
                <p key={product.href}><a href={product.href} className="text-sm hover:text-red-600 transition-colors">{product.text}</a></p>
              ))}
            </div>
          </details>

          <details className="group mb-5 border-b border-gray-100 pb-2">
            <summary className="flex justify-between items-center cursor-pointer list-none px-2 py-3 rounded-md hover:bg-gray-50 transition-colors duration-200">
              <span className="font-semibold text-gray-900">Chính sách & Điều khoản</span>
              <span className="transition-transform duration-300 ease-in-out group-open:rotate-180">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <div className="mt-3 pl-4 space-y-2 mx-2 overflow-hidden transition-all duration-300 ease-in-out">
              {QUICK_LINKS.map((link) => (
                <p key={link.href}><a href={link.href} className="text-sm hover:text-red-600 transition-colors">{link.name}</a></p>
              ))}
            </div>
          </details>

          <details className="group mb-5 border-b border-gray-100 pb-2">
            <summary className="flex justify-between items-center cursor-pointer list-none px-2 py-3 rounded-md hover:bg-gray-50 transition-colors duration-200">
              <span className="font-semibold text-gray-900">Kết nối với chúng tôi</span>
              <span className="transition-transform duration-300 ease-in-out group-open:rotate-180">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <div className="mt-3 pl-4 mx-2 overflow-hidden transition-all duration-300 ease-in-out">
              <div className="flex flex-wrap space-x-4 mb-2">
                {SOCIAL_LINKS.map((link) => (
                  <a key={link.href} href={link.href} className="text-gray-500 hover:text-red-600">
                    <span className="sr-only">{link.name}</span>
                    <span className="text-sm font-medium">{link.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </details>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 mt-8 md:mt-12 pt-6 md:pt-8">
          <p className="text-center text-gray-500 text-xs md:text-sm px-4">
            © {new Date().getFullYear()} {COMPANY_INFO.name}. Tất cả các quyền được bảo lưu.
          </p>
        </div>
      </div>

      {/* Fixed position call boxes */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-4">
        <CallBox />
        <ZaloBox />
      </div>

      {/* Bottom Navigation */}
      <BottomNav menuItems={menuItems} />
    </footer>
  );
} 