'use client';

import { ContactForm } from '@/components/ui/ContactForm';
import { EnvelopeIcon, PhoneIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { FAQJsonLd } from '@/components/SEO/FAQJsonLd';
import { businessFAQs } from '@/lib/general-faqs';

// Thông tin liên hệ từ .env
const PHONE_NUMBER = process.env.NEXT_PUBLIC_PHONE_NUMBER || "0979983355";
const HOTLINE = process.env.NEXT_PUBLIC_HOTLINE || "+84979983355";
const EMAIL = process.env.NEXT_PUBLIC_EMAIL || "info@g3tech.vn";
const ZALO_LINK = process.env.NEXT_PUBLIC_ZALO_LINK || "https://zalo.me/0979983355";
const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "Công Ty Cổ phần Công nghệ g3 Việt Nam";
const COMPANY_ADDRESS = process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "Tầng 7, tòa nhà văn phòng Charmvit, 117 Trần Duy Hưng, Phường Trung Hoà, Quận Cầu Giấy, Thành phố Hà Nội.";
const SHOWROOM_LONG_BIEN = process.env.NEXT_PUBLIC_SHOWROOM_LONG_BIEN || "Số 4 ngách 12, ngõ 135 Nguyễn Văn Cừ, Long Biên, TP. Hà Nội";
const SHOWROOM_HAI_BA_TRUNG = process.env.NEXT_PUBLIC_SHOWROOM_HAI_BA_TRUNG || "Ngõ 128 Phố Vọng, Q. Hai Bà Trưng, TP. Hà Nội";
const SHOWROOM_HO_CHI_MINH = process.env.NEXT_PUBLIC_SHOWROOM_HO_CHI_MINH || "1/23 Huỳnh Lan Khanh, P2, Q.Tân Bình. TP.Hồ Chí Minh";
const WORKING_HOURS = process.env.NEXT_PUBLIC_WORKING_HOURS || "9:00 - 20:00";

export default function ContactPage() {
  return (
    <div className="bg-white">
      {/* FAQ Schema for SEO */}
      <FAQJsonLd faqs={businessFAQs} type="Question" />
      {/* Hero section */}
      <div className="relative bg-gradient-to-r rounded-t-lg from-red-500 to-red-600">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Liên hệ với chúng tôi</h1>
            <p className="mt-4 text-lg text-red-100">
              Chúng tôi luôn sẵn sàng hỗ trợ và giải đáp mọi thắc mắc của bạn. Hãy liên hệ với chúng tôi qua các kênh dưới đây.
            </p>
          </div>
        </div>
      </div>

      {/* Contact section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact information */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin liên hệ</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <PhoneIcon className="h-6 w-6 text-red-500" />
                </div>
                <div className="ml-3 text-base">
                  <p className="font-medium text-gray-900">Hotline</p>
                  <p className="mt-1 text-gray-600">
                    <a href={`tel:${HOTLINE}`} className="hover:text-red-500">{PHONE_NUMBER}</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <EnvelopeIcon className="h-6 w-6 text-red-500" />
                </div>
                <div className="ml-3 text-base">
                  <p className="font-medium text-gray-900">Email</p>
                  <p className="mt-1 text-gray-600">
                    <a href={`mailto:${EMAIL}`} className="hover:text-red-500">{EMAIL}</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <MapPinIcon className="h-6 w-6 text-red-500" />
                </div>
                <div className="ml-3 text-base">
                  <p className="font-medium text-gray-900">Trụ sở chính</p>
                  <p className="mt-1 text-gray-600">{COMPANY_NAME}</p>
                  <p className="mt-1 text-gray-600">{COMPANY_ADDRESS}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-red-500" />
                </div>
                <div className="ml-3 text-base">
                  <p className="font-medium text-gray-900">Giờ làm việc</p>
                  <p className="mt-1 text-gray-600">Hàng ngày: {WORKING_HOURS}</p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-6">Hệ thống showroom</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <MapPinIcon className="h-6 w-6 text-red-500" />
                </div>
                <div className="ml-3 text-base">
                  <p className="font-medium text-gray-900">Showroom Long Biên</p>
                  <p className="mt-1 text-gray-600">{SHOWROOM_LONG_BIEN}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <MapPinIcon className="h-6 w-6 text-red-500" />
                </div>
                <div className="ml-3 text-base">
                  <p className="font-medium text-gray-900">Showroom Hai Bà Trưng</p>
                  <p className="mt-1 text-gray-600">{SHOWROOM_HAI_BA_TRUNG}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <MapPinIcon className="h-6 w-6 text-red-500" />
                </div>
                <div className="ml-3 text-base">
                  <p className="font-medium text-gray-900">Showroom Hồ Chí Minh</p>
                  <p className="mt-1 text-gray-600">{SHOWROOM_HO_CHI_MINH}</p>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Kết nối với chúng tôi</h2>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-500 hover:text-gray-900">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-900">
                  <span className="sr-only">Youtube</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href={ZALO_LINK} className="text-gray-500 hover:text-gray-900">
                  <span className="sr-only">Zalo</span>
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.549 9.158c-.41.206-.41.821 0 1.027.411.205.821 0 1.027-.206.206-.205.206-.821 0-1.027-.206-.205-.821-.205-1.027.206zM9.293 9.158c-.411.206-.411.821 0 1.027.411.205.821 0 1.027-.206.206-.205.206-.821 0-1.027-.206-.205-.616-.205-1.027.206zM7.86 11.619c.205 0 .41-.41.41-.41a5.105 5.105 0 01.821-1.438c-.205 0-.616-.205-.821-.205-1.232.41-2.464 2.259-1.643 3.903-1.232-1.644-.41-3.493.411-4.724.41-.616 1.232-1.438 2.054-1.644-2.26.206-4.108 2.26-4.108 4.52 0 2.464 2.054 4.518 4.518 4.518 2.465 0 4.314-1.849 4.519-4.314h-2.054a2.646 2.646 0 01-2.26 1.644c-1.438.205-2.669-.822-2.669-2.26.205.205.616.41.822.41zM18.16 9.774c0-2.464-2.055-4.519-4.52-4.519-2.463 0-4.518 2.055-4.518 4.52 0 2.464 2.055 4.518 4.519 4.518 2.464 0 4.519-2.054 4.519-4.519zm-1.643 0a2.907 2.907 0 01-2.876 2.875 2.907 2.907 0 01-2.876-2.876 2.907 2.907 0 012.876-2.875 2.907 2.907 0 012.876 2.876z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div>
            <div className="rounded-lg bg-white p-8 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Gửi thông tin liên hệ</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>

      {/* Map section */}
      <div className="w-full h-[400px] mt-8">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.3846618329444!2d105.7941936750879!3d21.01633198062403!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab5f35785cb3%3A0xfa1883e1bd095d64!2zMTE3IFRy4bqnbiBEdXkgSMawbmcsIFRydW5nIEhvw6AsIEPhuqd1IEdp4bqleSwgSMOgIE7hu5lpLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1709801371090!5m2!1svi!2s"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
} 