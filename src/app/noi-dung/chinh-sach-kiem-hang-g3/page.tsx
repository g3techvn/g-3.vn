import Image from 'next/image';
import logo from '../../../assets/logo-gamiuk.png';
import header from '../../../assets/header-img.jpg';
import { COMPANY_INFO } from '../../../constants';

export const metadata = {
  title: `Chính sách kiểm hàng - ${COMPANY_INFO.name}`,
};

export default function ProductInspectionPolicy() {
  return (
    <div className="bg-white px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-5xl text-base/7 text-gray-700">
        <p className="text-base/7 font-semibold text-green-700">Chính sách</p>
        <h1 className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
          Chính sách kiểm hàng - {COMPANY_INFO.name}
        </h1>

        <div className="mt-10 max-w-5xl">
          <h2 className="mt-6 text-2xl font-bold text-gray-900">Thời điểm kiểm hàng</h2>
          <p className="mt-4">{COMPANY_INFO.name} chấp nhận cho khách hàng đồng kiểm với nhân viên giao hàng tại thời điểm nhận hàng. Không hỗ trợ thử hàng.</p>
          <p className="mt-2">Sau khi nhận hàng, khách hàng kiểm lại phát hiện sai có thể liên lạc với bộ phận chăm sóc khách hàng để được hỗ trợ đổi trả.</p>
          <p className="mt-2 font-semibold">Lưu ý: Quý khách vui lòng quay video lúc mở hàng để đối chiếu khi cần thiết.</p>

          <h2 className="mt-6 text-2xl font-bold text-gray-900">Phạm vi kiểm tra hàng hóa</h2>
          <p className="mt-4">Khách hàng được kiểm tra các sản phẩm thực nhận, đối chiếu, so sánh các sản phẩm nhận được với sản phẩm đã đặt trên đơn sau khi nhân viên {COMPANY_INFO.name} xác nhận đơn hàng theo các tiêu chí: ảnh mẫu, mã sản phẩm, kích thước, màu sắc, chất liệu,...</p>
          <p className="mt-2">Khi kiểm tra hàng hóa, khách hàng chỉ kiểm tra bên ngoài chứ không mở lên sử dụng.</p>
          <p className="mt-2">Tuyệt đối không bóc, mở các hộp sản phẩm có tem niêm phong, tem đảm bảo.</p>
          <p className="mt-2">Không được cào lấy mã các sản phẩm có tích điểm, đổi quà.</p>
          <p className="mt-2 font-semibold">Lưu ý: Với những sản phẩm nguyên seal sẽ phải thanh toán với Shiper (nếu có COD) mới được bóc mở.</p>

          <h2 className="mt-6 text-2xl font-bold text-gray-900">Các bước xử lý khi hàng hóa nhận được không như đơn đặt hàng</h2>
          <p className="mt-4">Khi quý khách đồng kiểm, sản phẩm nhận được không như sản phẩm khách đặt trên đơn hàng. Xin hãy liên hệ với hotline {COMPANY_INFO.hotline} để được gặp bộ phận chăm sóc khách hàng xác nhận lại đơn hàng.</p>
          <p className="mt-2">Trường hợp {COMPANY_INFO.name} đóng sai đơn hàng theo yêu cầu của khách, khách có thể không nhận hàng, không thanh toán. Trong trường hợp đơn hàng đã thanh toán, khách hàng có thể yêu cầu gửi lại đơn mới hoặc không, {COMPANY_INFO.name} sẽ hoàn lại tiền cho quý khách trong thời gian sớm nhất.</p>
          <p className="mt-2">Trường hợp {COMPANY_INFO.name} đóng hàng đúng theo đơn hàng, nhưng khách hàng thay đổi nhu cầu, khách hàng có thể yêu cầu đổi trả và áp dụng chính sách đổi trả hàng hóa. Trường hợp này khách hàng sẽ phải thanh toán chi phí giao hàng (nếu có).</p>

          <h2 className="mt-6 text-2xl font-bold text-gray-900">Các kênh thông tin tiếp nhận khiếu nại của khách hàng</h2>
          <p className="mt-4">Hotline: {COMPANY_INFO.hotline}</p>
        </div>
      </div>
    </div>
  );
} 