import Image from 'next/image';
import logo from '../../../assets/logo-gamiuk.png';
import header from '../../../assets/header-img.jpg';
import { COMPANY_INFO, PAYMENT_METHODS } from '../../../constants';

export const metadata = {
  title: `Chính sách thanh toán - ${COMPANY_INFO.name}`,
};

export default function PaymentPolicy() {
  return (
    <div className="bg-white px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-5xl text-base/7 text-gray-700">
        <p className="text-base/7 font-semibold text-green-700">Chính sách</p>
        <h1 className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
          Chính sách thanh toán - {COMPANY_INFO.name}
        </h1>

        <p className="mt-4">
          <strong>Lưu ý:</strong> {COMPANY_INFO.name} thu 2% phí thanh toán đối với Thẻ {PAYMENT_METHODS.filter(method => ['Visa', 'MasterCard'].includes(method.name)).map(method => method.name).join(', ')}.
        </p>

        <p className="mt-4">
          <strong>Thanh toán trực tuyến qua Cổng thanh toán VNPAY-QR</strong>
        </p>
        <p className="mt-4">
          Sau khi Quý khách lựa chọn hình thức thanh toán bằng Chuyển khoản QR, hệ thống sẽ hiển thị mã QR thanh toán. Quý khách tiến hành mở App ngân hàng, quét mã QR để hoàn tất việc đặt hàng.
        </p>
        <p className="mt-4">
          Ngoài ra, Quý khách cũng có thể chuyển khoản trực tiếp qua ngân hàng MB cho {COMPANY_INFO.name} theo thông tin:
        </p>
        <ul className="list-disc pl-5 mt-4">
          <li>Tên ngân hàng: MB - Ngân Hàng TMCP Quân Đội</li>
          <li>Chủ tài khoản: {COMPANY_INFO.name}</li>
          <li>Số tài khoản: </li>
          <li>Nội dung chuyển khoản: Tên khách hàng, Số điện thoại - Ví dụ: 'Nguyễn Văn A, 0912345678'</li>
        </ul>
        <p className="mt-4">
          <strong>Lưu ý:</strong> Quý khách hãy chọn Dịch vụ chuyển tiền 24/7 để giao dịch được hoàn thành nhanh chóng.
        </p>
        <p className="mt-4">
          Sau khi chuyển khoản thành công, Quý khách tiến hành nhấn nút 'Đã chuyển' trong màn hình thanh toán.
        </p>
        <p className="mt-4">
          Ngay sau khi nhận được xác nhận từ ngân hàng, {COMPANY_INFO.name} sẽ thông báo tới Quý khách và tiến hành giao hàng theo thời gian đã thống nhất.
        </p>

        <h2 className="mt-8 text-2xl font-semibold text-gray-900">III. Thanh toán quẹt thẻ ATM, {PAYMENT_METHODS.filter(method => ['Visa', 'MasterCard'].includes(method.name)).map(method => method.name).join(', ')}</h2>
        <p className="mt-4">
          <strong>Tại cửa hàng:</strong> Cà thẻ trực tiếp tại các chuỗi cửa hàng thuộc hệ thống {COMPANY_INFO.name}. Tất cả hệ thống cửa hàng {COMPANY_INFO.name} đều hỗ trợ quẹt thẻ ATM, {PAYMENT_METHODS.filter(method => ['Visa', 'MasterCard'].includes(method.name)).map(method => method.name).join(', ')}.
        </p>
        <p className="mt-4">
          <strong>Lưu ý:</strong> {COMPANY_INFO.name} thu 1% phí quẹt thẻ cho khách hàng đối với Thẻ {PAYMENT_METHODS.filter(method => ['Visa', 'MasterCard'].includes(method.name)).map(method => method.name).join(', ')}.
        </p>
        <p className="mt-4">
          <strong>Tại nhà/ nơi nhận hàng:</strong> Quý khách vui lòng yêu cầu trước để Chuyên viên bán hàng đem theo máy hỗ trợ thanh toán và quẹt thẻ.
        </p>

        <h2 className="mt-8 text-2xl font-semibold text-gray-900">IV. Quy định về hoàn trả tiền khi thanh toán trực tuyến trên {COMPANY_INFO.website}</h2>
        <p className="mt-4">
          Trong trường hợp Quý khách đã mua hàng và thanh toán trực tuyến thành công nhưng dư tiền, hoặc không lấy sản phẩm nữa. Quy trình hoàn tiền cho Quý khách sẽ được thực hiện như sau:
        </p>
        <p className="mt-4">
          <strong>Thẻ ATM nội địa</strong>
        </p>
        <p className="mt-4">
          Thời gian hoàn tiền: 7 - 10 ngày làm việc (không tính Thứ 7, Chủ Nhật và Ngày lễ)
        </p>
        <p className="mt-4">
          Hỗ trợ: Nếu qua 10 ngày mà Khách hàng không nhận được tiền, {COMPANY_INFO.name} sẽ hỗ trợ liên hệ ngân hàng giải quyết.
        </p>
        <p className="mt-4">
          Điều kiện: Đơn hàng thanh toán qua thẻ ATM nội địa
        </p>

        <p className="mt-4">
          <strong>Thẻ tín dụng</strong>
        </p>
        <p className="mt-4">
          Thời gian hoàn tiền: 7 - 15 ngày làm việc (không tính Thứ 7, Chủ Nhật và Ngày lễ)
        </p>
        <p className="mt-4">
          Hỗ trợ: Nếu qua 15 ngày mà Khách hàng không nhận được tiền, {COMPANY_INFO.name} sẽ hỗ trợ liên hệ ngân hàng giải quyết.
        </p>
        <p className="mt-4">
          Điều kiện: Đơn hàng thanh toán qua thẻ tín dụng/thẻ ghi nợ
        </p>

        <p className="mt-4">
          <strong>Chuyển khoản QR</strong>
        </p>
        <p className="mt-4">
          Thời gian hoàn tiền: 3 - 8 ngày làm việc (không tính Thứ 7, Chủ Nhật và Ngày lễ)
        </p>
        <p className="mt-4">
          Hỗ trợ: Nếu qua 10 ngày không nhận được tiền, Quý khách hãy chủ động liên hệ {COMPANY_INFO.name} để được hỗ trợ giải quyết.
        </p>
        <p className="mt-4">
          Điều kiện: Chuyển khoản QR
        </p>
      </div>
    </div>
  );
} 