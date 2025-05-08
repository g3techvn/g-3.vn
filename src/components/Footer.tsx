import * as React from 'react';
import { FooterLink } from './ui/FooterLink';
import { FooterSection } from './ui/FooterSection';
import { LogoBadge } from './ui/LogoBadge';
import { VisuallyHidden } from './ui/VisuallyHidden';
import { COMPANY_INFO, SHIPPING_PROVIDERS, PAYMENT_METHODS, QUICK_LINKS, SOCIAL_LINKS } from '../constants';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white" aria-labelledby="footer-heading">
      <VisuallyHidden asChild>
        <h2 id="footer-heading">Footer</h2>
      </VisuallyHidden>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-20 xl:grid xl:grid-cols-2 xl:gap-8">
          <div className="grid grid-cols-2 gap-8 xl:col-span-2">
            <div className="space-y-12 md:grid md:grid-cols-2 md:gap-8 md:space-y-0">
              <FooterSection title="Kết nối">
                <ul className="mt-6 space-y-6">
                  {SOCIAL_LINKS.map((link) => (
                    <li key={link.href} className="text-sm">
                      <FooterLink href={link.href}>
                        {link.name}
                      </FooterLink>
                    </li>
                  ))}
                </ul>
              </FooterSection>

              <FooterSection title="Thông tin hữu ích">
                <ul className="mt-6 space-y-6">
                  {QUICK_LINKS.map((link) => (
                    <li key={link.href} className="text-sm">
                      <FooterLink href={link.href}>
                        {link.name}
                      </FooterLink>
                    </li>
                  ))}
                </ul>
              </FooterSection>
            </div>

            <div className="space-y-12 md:grid md:grid-cols-2 md:gap-8 md:space-y-0">
              <FooterSection title="Đơn vị vận chuyển">
                <div className="flex space-x-4" aria-label="Đơn vị vận chuyển">
                  {SHIPPING_PROVIDERS.map((provider) => (
                    <LogoBadge 
                      key={provider.name} 
                      label={provider.name} 
                      className="w-20 h-10"
                    />
                  ))}
                </div>
              </FooterSection>

              <FooterSection title="Thanh toán">
                <div className="grid grid-cols-3 gap-2" aria-label="Phương thức thanh toán">
                  {PAYMENT_METHODS.map((method) => (
                    <LogoBadge 
                      key={method.name} 
                      label={method.name} 
                      className="w-full h-8"
                    />
                  ))}
                </div>
              </FooterSection>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 py-10">
          <p className="text-sm text-gray-400">Copyright &copy; {new Date().getFullYear()}</p>
          <p className="text-sm text-gray-400">
            {COMPANY_INFO.name}
          </p>
          <p className="text-sm text-gray-400">
            Địa chỉ: {COMPANY_INFO.address}
          </p>
        </div>
      </div>
    </footer>
  );
} 