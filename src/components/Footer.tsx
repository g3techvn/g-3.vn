import * as React from 'react';
import { FooterLink } from './ui/FooterLink';
import { FooterSection } from './ui/FooterSection';
import { LogoBadge } from './ui/LogoBadge';
import { VisuallyHidden } from './ui/VisuallyHidden';
import { COMPANY_INFO, CONTACT_INFO, SHIPPING_PROVIDERS, PAYMENT_METHODS, QUICK_LINKS } from '../constants';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white pt-12 pb-6" aria-labelledby="footer-heading">
      <VisuallyHidden asChild>
        <h2 id="footer-heading">Footer</h2>
      </VisuallyHidden>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <FooterSection title={COMPANY_INFO.name}>
            <address className="not-italic">
              <p className="text-gray-400 mb-4">
                <strong>ĐỊA CHỈ:</strong> {COMPANY_INFO.address}
              </p>
              <p className="text-gray-400 mb-4">
                <strong>Thời gian làm việc:</strong><br />
                {CONTACT_INFO.workingHours}
              </p>
              <p className="text-gray-400 mb-4">
                <strong>HOTLINE:</strong> <a href={`tel:${COMPANY_INFO.hotline}`} className="hover:text-white">{COMPANY_INFO.hotline}</a><br />
                <strong>Email:</strong> <a href={`mailto:${COMPANY_INFO.email}`} className="text-gray-400 hover:text-white">{COMPANY_INFO.email}</a>
              </p>
            </address>
          </FooterSection>
          
          <nav aria-labelledby="footer-links">
            <FooterSection title="Liên kết nhanh" id="footer-links">
              <ul className="space-y-2">
                {QUICK_LINKS.map((link) => (
                  <li key={link.href}>
                    <FooterLink href={link.href}>
                      {link.name}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </FooterSection>
          </nav>
          
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
            
            <h3 className="text-lg font-bold mt-6 mb-4">Bộ công thương</h3>
            <LogoBadge label="Bộ công thương" className="w-32 h-12" />
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
        
        <div className="border-t border-gray-700 mt-8 pt-6">
          <p className="text-center text-gray-400 text-sm">
            © {COMPANY_INFO.name} {new Date().getFullYear()} Chịu trách nhiệm sản phẩm và nội dung.
          </p>
        </div>
      </div>
    </footer>
  );
} 