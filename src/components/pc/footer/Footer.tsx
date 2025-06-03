import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CallBox from './CallBox';
import ZaloBox from './ZaloBox';
import { COMPANY_INFO, SOCIAL_LINKS } from '../../../constants';

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

const products = [
  { text: "Ghế công thái học G3 Tech", href: "/brands/g3tech" },
  { text: "Ghế công thái học Gami", href: "/brands/gami" },
  { text: "Ghế công thái học Sihoo", href: "/brands/sihoo" },
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
  return (
    <footer className="bg-white text-gray-800">
      <div className="container mx-auto py-8 md:py-12 px-4 sm:px-6 lg:px-0">
        {/* Footer content with 4 main columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          {/* Cột 1: Logo + Social + Hotline */}
          <div className="flex flex-col gap-6">
            {/* Logo */}
            <div className="mb-2">
              <img src="/images/logo-g3.svg" alt="Logo" className="h-12 w-auto" />
            </div>
            {/* Social icons */}
            <div className="flex gap-4 mb-2">
              <Link href={SOCIAL_LINKS[1].href} aria-label="Facebook" className="text-gray-600 hover:text-red-600" target="_blank" rel="noopener noreferrer">
                <div className="rounded-full border-2 border-gray-300 p-1">
                  <Image src="/images/icon/facebook-round-color-icon.svg" alt="Facebook" width={24} height={24} className="h-6 w-6" />
                </div>
              </Link>
            
              <Link href={SOCIAL_LINKS[2].href} aria-label="Tiktok" className="text-gray-600 hover:text-red-600" target="_blank" rel="noopener noreferrer">
                <div className="rounded-full border-2 border-gray-300 p-1">
                  <Image src="/images/icon/tiktok-circle.svg" alt="Tiktok" width={24} height={24} className="h-6 w-6" />   
                </div>
              </Link>
             
              <Link href={SOCIAL_LINKS[3].href} aria-label="Youtube" className="text-gray-600 hover:text-red-600" target="_blank" rel="noopener noreferrer">
                <div className="rounded-full border-2 border-gray-300 p-1">
                  <Image src="/images/icon/youtube-music-icon.svg" alt="Youtube" width={24} height={24} className="h-6 w-6" />   
                </div>
              </Link>

              <Link href={SOCIAL_LINKS[0].href} aria-label="Shopee" className="text-gray-600 hover:text-red-600" target="_blank" rel="noopener noreferrer">
                <div className="rounded-full border-2 border-gray-300 p-1">
                  <Image src="/images/icon/shopee-icon.svg" alt="Shopee" width={24} height={24} className="h-6 w-6" />
                </div>
              </Link>
            </div>
           
          </div>

          {/* Cột 2: Địa chỉ cửa hàng */}
          <div className="space-y-4">
            <div className="space-y-4">
              <div>
                <div className="font-bold">Hotline</div>
                <div className="flex items-start gap-2 mt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${COMPANY_INFO.hotline}`} className="text-sm text-black hover:text-red-600 transition-colors">{formattedPhoneNumber}</a>
                </div>
              </div>
              <div>
                <div className="font-bold">Cửa hàng Hà Nội</div>
                <div className="flex items-start gap-2 mt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm">Số 128 Phố Vọng, Phương Liệt, Thanh Xuân, Hà Nội (<a href="#" className="text-blue-600 underline">Chỉ đường</a>)</span>
                </div>
                <div className="flex items-start gap-2 mt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm">Số 4 ngách 12 ngõ 135 Nguyễn Văn Cừ, Ngọc Lâm, Long Biên, Hà Nội (<a href="#" className="text-blue-600 underline">Chỉ đường</a>)</span>
                </div>
              </div>
              <div>
                <div className="font-bold">Cửa hàng TP. HCM</div>
                <div className="flex items-start gap-2 mt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm">Số 1/23 Huỳnh Lan Khanh, Phường 2, Tân Bình, TP.HCM (<a href="#" className="text-blue-600 underline">Chỉ đường</a>)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cột 3: Thông tin hữu ích */}
          <div>
            <h3 className="text-lg font-semibold mb-4 md:mb-6 text-gray-900">Thông tin hữu ích</h3>
            <ul className="space-y-2 md:space-y-3">
              {sections[1].links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm md:text-base hover:text-red-600 transition-colors">
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 4: Phản hồi, góp ý */}
          <div className="flex flex-col items-center md:items-end justify-between h-full">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Phản hồi, góp ý</h3>
              <p className="text-gray-600 mb-4 max-w-xs text-sm">Đội ngũ Kiểm Soát Chất Lượng của chúng tôi sẵn sàng lắng nghe quý khách.</p>
              <a href="#" className="inline-flex items-center px-6 py-3 bg-black text-white rounded-full font-semibold text-lg shadow hover:bg-gray-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 12H8m8 0a8 8 0 11-16 0 8 8 0 0116 0z" />
                </svg>
                Gửi phản hồi
              </a>
            </div>
          </div>
        </div>

        {/* Copyright & company info */}
        <div className="border-t border-gray-200 mt-8 md:mt-12 pt-6 md:pt-8">
          <div className="flex flex-col   gap-2 ">
            <p className="text-left text-gray-500 text-sm px-0">
              © G3TECH {new Date().getFullYear()} <br />
              {COMPANY_INFO.name} - GPĐKKD: 0110907369 do sở KH & ĐT TP Hà Nội cấp ngày 04/12/2024 <br />
              Địa chỉ: Tầng 7, Tòa nhà Charmvit, số 117 Trần Duy Hưng, Phường Trung Hoà, Quận Cầu Giấy,Hà Nội
            </p>
            <div className="flex gap-2 mt-2 md:mt-0">
             <img src="/images/dmca_protected.png" alt="DMCA" className="h-6" />
             <img src="/images/bo-cong-thuong.png" alt="Đã thông báo" className="h-6" />
            
            </div>
          </div>
        </div>
      </div>

      {/* Fixed position call boxes */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-4">
        <CallBox />
        <ZaloBox />
      </div>
    </footer>
  );
} 