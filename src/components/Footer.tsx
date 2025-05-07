import * as React from 'react';
import { FooterLink } from './ui/FooterLink';
import { FooterSection } from './ui/FooterSection';
import { LogoBadge } from './ui/LogoBadge';
import { VisuallyHidden } from './ui/VisuallyHidden';

const SHIPPING_PROVIDERS = [
  { name: "ViettelPost" },
  { name: "GHTK" },
  { name: "GHN" }
];

const PAYMENT_METHODS = [
  { name: "Visa" },
  { name: "MasterCard" },
  { name: "JCB" },
  { name: "QR Pay" },
  { name: "Momo" },
  { name: "ZaloPay" }
];

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white pt-12 pb-6" aria-labelledby="footer-heading">
      <VisuallyHidden asChild>
        <h2 id="footer-heading">Footer</h2>
      </VisuallyHidden>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <FooterSection title="G3 TECH">
            <address className="not-italic">
              <p className="text-gray-400 mb-4">
                <strong>ĐỊA CHỈ:</strong> 199/14B đường 3 tháng 2, phường 11, quận 10, Hồ Chí Minh (đối diện nhà hát Hòa Bình)
              </p>
              <p className="text-gray-400 mb-4">
                <strong>Thời gian làm việc:</strong><br />
                T2-T7: 9:00 - 20-00<br />
                CN: 9:00 - 14:00
              </p>
              <p className="text-gray-400 mb-4">
                <strong>HOTLINE:</strong> <a href="tel:0983410222" className="hover:text-white">0983 410 222</a><br />
                <strong>Email:</strong> <a href="mailto:contact@G3 TECH.vn" className="text-gray-400 hover:text-white">contact@G3 TECH.vn</a>
              </p>
            </address>
          </FooterSection>
          
          <nav aria-labelledby="footer-links">
            <FooterSection title="Liên kết nhanh" id="footer-links">
              <ul className="space-y-2">
                <li>
                  <FooterLink href="/product-category/action-cam">
                    Phụ kiện Action Cam
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="/product-category/lenses">
                    Ống kính – Kính lọc – Ống nhòm
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="/product-category/audio">
                    Tai nghe / Loa Bluetooth
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="/product-category/phone-stands">
                    Chân đế và kẹp điện thoại
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="/product-category/car-accessories">
                    Giá đỡ trên xe – Kệ để bàn
                  </FooterLink>
                </li>
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
            © G3 TECH 2023 Chịu trách nhiệm sản phẩm và nội dung.
          </p>
        </div>
      </div>
    </footer>
  );
} 