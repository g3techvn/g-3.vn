"use client";
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { ArrowRight, User, ShoppingBag, Gift, ShoppingCart, Facebook, Youtube, Cake } from 'lucide-react';
import Image from 'next/image';

export default function RewardsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto py-8">
        <div className="bg-[#f9fafb] rounded-2xl p-8 flex items-center justify-between">
          <div className="space-y-4">
            <div className="text-[#F2994A] uppercase tracking-wider text-sm font-medium">G3-TECH REWARDS</div>
                          <h1 className="text-4xl font-bold">
                Tích điểm đổi quà, mua sắm<br />
                thêm vui
              </h1>
              <div className="flex gap-4">
                <Button className="bg-black text-white rounded-full hover:bg-neutral-800">
                  Đăng nhập <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" className="rounded-full border-2 border-black hover:bg-black hover:text-white">
                  Bạn chưa có tài khoản? Đăng ký
                </Button>
              </div>
          </div>
          <div className="relative">
            <Image
              src="/images/rewards-hero.png"
              alt="Rewards illustration"
              width={300}
              height={300}
              className="w-[300px] h-auto"
            />
          </div>
        </div>
      </section>

      {/* Section: Hướng dẫn tham gia chương trình Rewards */}
      <section className="container mx-auto  py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-left mb-4">Đổi điểm nhận quà, dễ hơn &quot;ăn kẹo&quot;</h2>
          <p className="text-left text-gray-600 mb-12">Nhận phần thưởng chỉ trong vài bước đơn giản.</p>
          <div className="grid grid-cols-3 gap-6">
            {/* Bước 1 */}
            <div className="bg-white rounded-xl p-6 flex items-start gap-6">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#f2994a]/10">
                  <User className="w-6 h-6 text-[#F2994A]" />
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">1. Đăng ký - nhận ngay <span className="text-[#F2994A]">500 điểm</span></h3>
                <p className="text-gray-600">Đăng ký tài khoản bằng số điện thoại hoặc email</p>
                <p className="text-gray-500 text-sm mt-2">*Code sẽ được gửi về số điện thoại/email mỗi lần đăng nhập thay vì ghi nhớ mật khẩu</p>
              </div>
            </div>
            {/* Bước 2 */}
            <div className="bg-white rounded-xl p-6 flex items-start gap-6">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#27ae60]/10">
                  <ShoppingBag className="w-6 h-6 text-[#27ae60]" />
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">2. Tích điểm</h3>
                <p className="text-gray-600">Mỗi 100,000đ chi tiêu, tương ứng với 100 điểm tích lũy.</p>
                <p className="text-gray-500 text-sm mt-2">*Điểm thưởng này trên CHỈ áp dụng cho việc mua hàng tại G3-Tech.vn</p>
              </div>
            </div>
            {/* Bước 3 */}
            <div className="bg-white rounded-xl p-6 flex items-start gap-6">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#6c63ff]/10">
                  <Gift className="w-6 h-6 text-[#6c63ff]" />
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">3. Đổi quà</h3>
                <p className="text-gray-600">Người dùng nhanh chóng đổi voucher và quà tặng để tận hưởng trải nghiệm mua sắm và tiết kiệm của thú vị, cùng với nhiều ưu đãi đặc biệt đang chờ đón!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Cách nhận điểm thưởng */}
      <section className="container mx-auto py-16 bg-[#f9fafb]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Chỉ vài bước &ndash; Nhận hơn 2000 điểm thưởng!</h2>
          <p className="text-center text-gray-600 mb-12">Theo dõi Fanpage, đăng ký Youtube, nhập sinh nhật &ndash; mỗi click nhận ngay 500 điểm.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-xl p-6 flex flex-col items-center text-center">
              <div className="mb-4">
                <ShoppingCart className="w-12 h-12 text-gray-800" />
              </div>
              <h3 className="font-semibold mb-2">Tặng điểm cho mỗi 100k</h3>
              <p className="text-gray-500 text-sm">Kiếm 100 điểm cho mỗi 100,000đ chi tiêu</p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl p-6 flex flex-col items-center text-center">
              <div className="mb-4">
                <Facebook className="w-12 h-12 text-gray-800" />
              </div>
              <h3 className="font-semibold mb-2">Theo dõi Fanpage</h3>
              <p className="text-gray-500 text-sm">Kiếm được 500 điểm</p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl p-6 flex flex-col items-center text-center">
              <div className="mb-4">
                <Youtube className="w-12 h-12 text-gray-800" />
              </div>
              <h3 className="font-semibold mb-2">Vào & Đăng ký kênh Youtube</h3>
              <p className="text-gray-500 text-sm">Kiếm được 500 điểm</p>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-xl p-6 flex flex-col items-center text-center">
              <div className="mb-4">
                <Cake className="w-12 h-12 text-gray-800" />
              </div>
              <h3 className="font-semibold mb-2">Nhập ngày sinh nhật</h3>
              <p className="text-gray-500 text-sm">Kiếm được 500 điểm</p>
            </div>
          </div>
        </div>
      </section>

      {/* Hạng thành viên section */}
      <section className="container mx-auto py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-4">
            <p className="text-gray-600 mb-2">Điểm quà về</p>
            <h2 className="text-4xl font-bold">Hạng thành viên và Đặc quyền</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
            {/* Bronze Card */}
            <div className="bg-[#FDF7F2] rounded-xl p-6">
              <Image src="https://jjraznkvgfsgqrqvlcwo.supabase.co/storage/v1/object/public/g3tech/reward/card/bronze.svg?t=2025-06-07T04%3A55%3A17.811Z" alt="Bronze" width={488} height={260} className="w-full h-auto mb-4" />
              <h3 className="font-semibold mb-4">Hạng Bronze</h3>
              <ul className="space-y-2 text-sm">
                <li>• Hạn mức: 500 điểm</li>
                <li>• Miễn phí giao hàng đơn hàng đầu tiên từ 500,000đ</li>
                <li>• Quà tặng chào đón trị giá 50,000đ</li>
              </ul>
            </div>

            {/* Silver Card */}
            <div className="bg-[#F9FAFB] rounded-xl p-6">
              <Image src="https://jjraznkvgfsgqrqvlcwo.supabase.co/storage/v1/object/public/g3tech/reward/card/silver.svg?t=2025-06-07T04%3A55%3A33.086Z" alt="Silver" width={488} height={260} className="w-full h-auto mb-4" />
              <h3 className="font-semibold mb-4">Hạng Silver</h3>
              <ul className="space-y-2 text-sm">
                <li>• Hạn mức: 10,000 điểm</li>
                <li>• Tặng gấy dán G3-TECH Velcro tape</li>
                <li>• Miễn phí 2 lần chuyển đơn hàng đầu tiên từ 500,000đ trở lên</li>
                <li>• Quà tặng chào đón hạng trị giá 100,000đ</li>
                <li>• Tặng 1000 điểm sau x3</li>
              </ul>
            </div>

            {/* Gold Card */}
            <div className="bg-[#FDF7F2] rounded-xl p-6">
              <Image src="https://jjraznkvgfsgqrqvlcwo.supabase.co/storage/v1/object/public/g3tech/reward/card/gold.svg?t=2025-06-07T04%3A55%3A38.214Z" alt="Gold" width={488} height={260} className="w-full h-auto mb-4" />
              <h3 className="font-semibold mb-4">Hạng Gold</h3>
              <ul className="space-y-2 text-sm">
                <li>• Hạn mức: 20,000 điểm</li>
                <li>• Tặng chai xịt vệ sinh G3-TECH Cleaning kit</li>
                <li>• Miễn phí 3 lần chuyển đơn hàng đầu tiên từ 500,000đ trở lên</li>
                <li>• Quà tặng chào đón hạng trị giá 250,000đ</li>
                <li>• Tặng 2000 điểm sau x3</li>
              </ul>
            </div>

            {/* Titan Card */}
            <div className="rounded-xl p-6">
              <Image src="https://jjraznkvgfsgqrqvlcwo.supabase.co/storage/v1/object/public/g3tech/reward/card/titan.svg" alt="Titan" width={488} height={260} className="w-full h-auto mb-4" />
              <h3 className="font-semibold mb-4">Hạng Titan</h3>
              <ul className="space-y-2 text-sm">
                <li>• Hạn mức: 30,000 điểm</li>
                <li>• Tặng bàng lót chuột G3-TECH XTD</li>
                <li>• Miễn phí vận chuyển cho tất cả đơn hàng không giới hạn trong số đơn trong năm</li>
                <li>• Quà tặng chào đón hạng đặc biệt</li>
                <li>• Tặng 5000 điểm sau x3</li>
                <li>• Ưu tiên trải nghiệm sản phẩm</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Voucher Section */}
      <section className="container mx-auto py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Voucher ngập tràn, quà bất tận</h2>
          <p className="text-center text-gray-600 mb-12">
            Hàng loạt ưu đãi đặc biệt đang chờ đón bạn! Đừng bỏ lỡ cơ hội sở hữu những voucher giảm giá hấp dẫn, quà tặng giá trị và freeship cho các đơn hàng của bạn.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Voucher 1 */}
            <div className="bg-[#f9fafb] rounded-xl p-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Dây đeo cườm G3-TECH Velcro</h3>
                <p className="text-gray-500">5,000 điểm</p>
              </div>
              <ArrowRight className="h-6 w-6" />
            </div>

            {/* Voucher 2 */}
            <div className="bg-[#f9fafb] rounded-xl p-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Chai xịt vệ sinh bàn</h3>
                <p className="text-gray-500">8,000 điểm</p>
              </div>
              <ArrowRight className="h-6 w-6" />
            </div>

            {/* Voucher 3 */}
            <div className="bg-[#f9fafb] rounded-xl p-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Giảm 50k tiền vận chuyển</h3>
                <p className="text-gray-500">4,000 điểm</p>
              </div>
              <ArrowRight className="h-6 w-6" />
            </div>

            {/* Voucher 4 */}
            <div className="bg-[#f9fafb] rounded-xl p-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Giảm 100k phí vận chuyển</h3>
                <p className="text-gray-500">8,000 điểm</p>
              </div>
              <ArrowRight className="h-6 w-6" />
            </div>

            {/* Gift Vouchers */}
            <div className="bg-[#f9fafb] rounded-xl p-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Code giảm 50k</h3>
                <p className="text-gray-500">Giảm giá 50,000đ cho đơn 1,000 điểm</p>
              </div>
              <ArrowRight className="h-6 w-6" />
            </div>

            <div className="bg-[#f9fafb] rounded-xl p-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Code giảm 100k</h3>
                <p className="text-gray-500">Giảm giá 100,000đ cho 2,000 điểm</p>
              </div>
              <ArrowRight className="h-6 w-6" />
            </div>

            <div className="bg-[#f9fafb] rounded-xl p-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Code giảm 300k</h3>
                <p className="text-gray-500">Giảm giá 300,000đ cho 5,000 điểm</p>
              </div>
              <ArrowRight className="h-6 w-6" />
            </div>

            <div className="bg-[#f9fafb] rounded-xl p-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Code giảm 500k</h3>
                <p className="text-gray-500">Giảm giá 500,000đ cho 8,000 điểm</p>
              </div>
              <ArrowRight className="h-6 w-6" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
