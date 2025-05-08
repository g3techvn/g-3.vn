import Image from 'next/image';
import logo from '../../../assets/logo-gamiuk.png';
import header from '../../../assets/header-img.jpg';
import { COMPANY_INFO, SHIPPING_PROVIDERS } from '../../../constants';

export const metadata = {
  title: `Chính sách vận chuyển - ${COMPANY_INFO.name}`,
};

export default function ShippingPolicy() {
  return (
    <div className="bg-white px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-5xl text-base/7 text-gray-700">
        <p className="text-base/7 font-semibold text-green-700">Chính sách</p>
        <h1 className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
          Chính sách vận chuyển - {COMPANY_INFO.name}
        </h1>

        <div className="mt-10 max-w-5xl">
          <p>Để đảm bảo quá trình vận chuyển và giao nhận được diễn ra thuận lợi, {COMPANY_INFO.name} xin gửi tới Quý khách hàng Chính sách Vận chuyển như sau:</p>

          <h2 className="mt-6 text-2xl font-bold text-gray-900">Chính sách vận chuyển và giao nhận</h2>
          <p className="mt-4">{COMPANY_INFO.name} hỗ trợ vận chuyển toàn quốc dưới 2 hình thức:</p>
          
          <h3 className="mt-6 text-xl font-semibold text-gray-900">Giao hàng tận nơi, thanh toán khi nhận hàng (COD)</h3>
          <p className="mt-2">Đối với hình thức này, Quý khách sẽ cần thanh toán 100% phí vận chuyển phát sinh trong quá trình vận chuyển (Sẽ có thông báo trước khi gửi hàng) và thực hiện đặt cọc trước cho đơn hàng như sau:</p>
          <ul className="mt-2 list-disc list-inside">
            <li>Đối với đơn hàng dưới 10.000.000đ: Quý khách không cần đặt cọc</li>
            <li>Đối với đơn hàng từ 10.000.000đ trở lên: Quý khách sẽ cần đặt cọc theo hướng dẫn ở bước Thanh toán nếu đặt trên website hoặc theo hướng dẫn của Chuyên viên bán hàng nếu mua trực tiếp.</li>
          </ul>
          <p className="mt-2">{COMPANY_INFO.name} sẽ hỗ trợ Quý khách phí thu hộ và bảo hiểm đơn hàng.</p>
          <p className="mt-2">{COMPANY_INFO.name} có trách nhiệm hỗ trợ Quý khách trong toàn bộ quá trình vận chuyển cho tới khi Quý khách hàng nhận sản phẩm.</p>
          
          <h3 className="mt-6 text-xl font-semibold text-gray-900">Giao hàng tận nơi, thanh toán trước 100%</h3>
          <p className="mt-2">Đối với hình thức này, Quý khách sẽ được miễn phí vận chuyển phát sinh trong quá trình giao hàng.</p>
          <p className="mt-2">Quý khách vui lòng thanh toán trước 100% giá trị đơn hàng.</p>
          <p className="mt-2">{COMPANY_INFO.name} sẽ hỗ trợ Quý khách phí bảo hiểm đơn hàng.</p>
          <p className="mt-2">{COMPANY_INFO.name} có trách nhiệm hỗ trợ Quý khách trong toàn bộ quá trình vận chuyển cho tới khi Quý khách hàng nhận sản phẩm.</p>
          
          <h3 className="mt-6 text-xl font-semibold text-gray-900">Đối tác vận chuyển</h3>
          <h4 className="mt-4 text-lg font-semibold text-gray-900">Qua đơn vị chuyển phát</h4>
          <p className="mt-2">{COMPANY_INFO.name} hỗ trợ gửi hàng qua các đơn vị chuyển phát uy tín hàng đầu như: {SHIPPING_PROVIDERS.map(provider => provider.name).join(', ')}. {COMPANY_INFO.name} chịu trách nhiệm tới khi sản phẩm tới tay Quý Khách (Quý khách vui lòng kiểm tra sản phẩm khi nhận hàng).</p>
          <p className="mt-2">Trong trường hợp sản phẩm bị rơi vỡ, móp méo, trầy xước hoặc sản phẩm không đúng như thông tin ban đầu mà {COMPANY_INFO.name} cung cấp tới Quý khách, Quý khách vui lòng không nhận hàng và thông báo lại với {COMPANY_INFO.name}. {COMPANY_INFO.name} sẽ có trách nhiệm giải quyết với bên vận chuyển để không ảnh hưởng tới quyền lợi của Khách hàng. Trường hợp sau khi đã nhận hàng mà sản phẩm có phát sinh những vấn đề trên (rơi vỡ, móp méo, trầy xước… hoặc tác động vật lý từ môi trường) {COMPANY_INFO.name} sẽ không thể hỗ trợ Quý khách xử lý.</p>
          
          <h4 className="mt-4 text-lg font-semibold text-gray-900">Nhà xe</h4>
          <p className="mt-2">{COMPANY_INFO.name} không hỗ trợ vận chuyển qua nhà xe, trong trường hợp Quý khách yêu cầu vận chuyển qua nhà xe thì nhà xe phải do Quý khách chỉ định. Trong trường hợp phát sinh vấn đề trong quá trình vận chuyển, {COMPANY_INFO.name} không hỗ trợ xử lý.</p>
          
          <h4 className="mt-4 text-lg font-semibold text-gray-900">Ship nội thành Hà Nội và Hồ Chí Minh</h4>
          <p className="mt-2">{COMPANY_INFO.name} hỗ trợ vận chuyển nội thành Hà Nội và TP Hồ Chí Minh hoàn toàn miễn phí.</p>
          <p className="mt-2">Ship ngoại thành Hà Nội và TP Hồ Chí Minh: Nếu Quý khách thanh toán trước 100% sẽ được hỗ trợ miễn phí toàn bộ chi phí vận chuyển. Đối với các đơn hàng ở khu vực ngoại thành Hà Nội và TP Hồ Chí Minh, {COMPANY_INFO.name} hỗ trợ Quý khách giao hàng tại nhà có tính phí (5.000đ/1km).</p>
          
          <h3 className="mt-6 text-xl font-semibold text-gray-900">Thời gian vận chuyển</h3>
          <h4 className="mt-4 text-lg font-semibold text-gray-900">Đối với các đơn hàng nội thành Hà Nội và TP Hồ Chí Minh</h4>
          <p className="mt-2">{COMPANY_INFO.name} hỗ trợ giao hàng trong vòng 1h với những sản phẩm đang có sẵn hàng tại cửa hàng. Đối với những sản phẩm không sẵn hàng/không sẵn tại khu vực Quý khách cần giao hàng, {COMPANY_INFO.name} sẽ có thông báo tới Quý khách về thời gian giao hàng cụ thể.</p>
          
          <h4 className="mt-4 text-lg font-semibold text-gray-900">Đối với các đơn hàng ở các tỉnh</h4>
          <p className="mt-2">{COMPANY_INFO.name} giao hàng thông qua các đơn vị vận chuyển trên toàn quốc. Thời gian giao hàng thông thường từ 1-3 ngày tùy theo khu vực. Trong dịp lễ/tết, thời gian vận chuyển có thể bị trì hoãn, {COMPANY_INFO.name} sẽ thông báo cụ thể tới Quý khách sau khi gửi hàng.</p>
          
          <h4 className="mt-4 text-lg font-semibold text-gray-900">Đối với các đơn hàng ngoại thành Hà Nội và TP Hồ Chí Minh</h4>
          <p className="mt-2">Với những đơn hàng nằm ngoài khu vực nội thành, {COMPANY_INFO.name} hỗ trợ giao hàng trong ngày nếu Quý khách đặt trước 12h00 sáng. Đối với những đơn hàng đặt sau thời gian này, {COMPANY_INFO.name} sẽ chủ động liên hệ và hẹn lịch giao hàng cụ thể tới Quý khách hàng.</p>
        </div>
      </div>
    </div>
  );
} 