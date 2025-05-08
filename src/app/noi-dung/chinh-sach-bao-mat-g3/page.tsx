import Image from 'next/image';
import logo from '../../../assets/logo-gamiuk.png';
import header from '../../../assets/header-img.jpg';
import { COMPANY_INFO } from '../../../constants';

export const metadata = {
  title: `Chính sách bảo mật - ${COMPANY_INFO.name}`,
};

export default function PrivacyPolicy() {
  return (
    <div className="bg-white px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-5xl text-base/7 text-gray-700">
        <p className="text-base/7 font-semibold text-green-700">Chính sách</p>
        <h1 className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
          Chính sách bảo mật - {COMPANY_INFO.name}
        </h1>

        <div className="mt-10 max-w-5xl">
          <p>Nhằm đảm bảo an toàn cho website và bảo mật thông tin cho Khách hàng, {COMPANY_INFO.name} đưa ra một số chính sách bảo mật thông tin cho Khách hàng (cá nhân & doanh nghiệp) khi mua hàng tại website {COMPANY_INFO.website}.</p>

          <p>Bảo vệ dữ liệu cá nhân của Khách hàng là vấn đề quan tâm hàng đầu của {COMPANY_INFO.name}. Chính sách bảo mật của {COMPANY_INFO.name} dành cho Khách hàng là việc thu thập thông tin cũng như tôn trọng quyền riêng tư cá nhân của Khách hàng và tất cả người dùng trên trang web của {COMPANY_INFO.name}. {COMPANY_INFO.name} sẽ hỗ trợ Khách hàng trước khi đưa ra quyết định liên quan đến cung cấp dữ liệu cá nhân cho chúng tôi.</p>

          <p>Chính sách bảo mật của {COMPANY_INFO.name} bao gồm những nội dung sau:</p>

          <h2 className="mt-6 text-2xl font-bold text-gray-900">1. Mục đích thu thập thông tin</h2>
          <p className="mt-4">Việc thu thập thông tin trên website {COMPANY_INFO.website} sẽ giúp chúng tôi:</p>
          <ul className="mt-2 list-disc list-inside">
            <li>Xử lý các vấn đề liên quan tới đơn hàng của Khách hàng, cụ thể: Xác nhận thanh toán và hỗ trợ dịch vụ.</li>
            <li>Cung cấp nhanh chóng tới Khách hàng các thông tin về chương trình Khuyến mãi, cụ thể: Giới thiệu về các sản phẩm, dịch vụ mới của {COMPANY_INFO.name}.</li>
            <li>Hỗ trợ giải quyết các vấn đề liên quan tới khiếu nại, góp ý từ phía Khách hàng, cụ thể: Chăm sóc khách hàng.</li>
            <li>Thu thập dữ liệu về hành trình khách hàng (lượt click, số lần xem trang, thời gian ở lại trang,...) nhằm thực hiện các hoạt động nghiên cứu, cải thiện và cung cấp tới Khách hàng trải nghiệm mua hàng tốt nhất.</li>
          </ul>

          <h2 className="mt-6 text-2xl font-bold text-gray-900">2. Phạm vi thu thập thông tin</h2>
          <p className="mt-4">Những thông tin Khách hàng cung cấp sẽ được lưu trữ tại cơ sở dữ liệu của {COMPANY_INFO.name}, điều này đồng nghĩa với việc Khách hàng đã hoàn toàn đồng ý và chấp thuận việc thông tin cá nhân Khách hàng cung cấp cho {COMPANY_INFO.name} sẽ được lưu trữ lại trên hệ thống.</p>
          <p className="mt-2">Những thông tin được thu thập bao gồm:</p>
          <ul className="mt-2 list-disc list-inside">
            <li>Họ và tên</li>
            <li>Số điện thoại</li>
            <li>Địa chỉ</li>
            <li>Email</li>
            <li>Thông tin đăng nhập tài khoản (Tên đăng nhập, Mật khẩu đăng nhập)</li>
          </ul>

          <h2 className="mt-6 text-2xl font-bold text-gray-900">3. Phạm vi sử dụng thông tin</h2>
          <p className="mt-4">{COMPANY_INFO.name} có thể sử dụng dữ liệu để tùy biến và cải tiến nhằm phục vụ Khách hàng tốt hơn. {COMPANY_INFO.name} không sử dụng thông tin của Khách hàng vào mục đích bất hợp pháp. {COMPANY_INFO.name} được quyền cung cấp thông tin của Khách hàng cho Bên Thứ Ba trong các trường hợp nhưng không giới hạn:</p>
          <ul className="mt-2 list-disc list-inside">
            <li>Được khách hàng chấp thuận.</li>
            <li>Dịch vụ của {COMPANY_INFO.name} cung cấp yêu cầu sự tương tác với Bên Thứ Ba hoặc do Bên Thứ Ba cung cấp. Bên Thứ Ba cam kết sẽ bảo mật thông tin cá nhân của Khách hàng.</li>
            <li>Theo yêu cầu của cơ quan có thẩm quyền và theo các quy định của pháp luật.</li>
          </ul>

          <h2 className="mt-6 text-2xl font-bold text-gray-900">4. Cam kết bảo mật thông tin cá nhân khách hàng</h2>
          <p className="mt-4">Những rủi ro liên quan đến vấn đề cung cấp dữ liệu cá nhân (dù là cung cấp trực tiếp, qua điện thoại, qua mạng internet hay qua các phương tiện kỹ thuật khác) và không có hệ thống kỹ thuật nào an toàn tuyệt đối hay chống được tất cả các "hacker" và "tamper" (người xâm nhập trái phép để lục lọi thông tin). {COMPANY_INFO.name} luôn nỗ lực tiến hành những biện pháp an ninh thích hợp đối với từng đặc tính của thông tin để ngăn chặn và giảm thiểu tối đa các rủi ro có thể khi Khách hàng sử dụng hệ thống {COMPANY_INFO.name}. Tuy nhiên, có thể có những nhân tố vượt ngoài tầm kiểm soát của {COMPANY_INFO.name} dẫn đến việc dữ liệu bị tiết lộ. Vì vậy, {COMPANY_INFO.name} không chịu trách nhiệm bảo đảm dữ liệu luôn được duy trì ở tình trạng hoàn hảo hoặc không bị tiết lộ.</p>
          <p className="mt-2">Mọi thông tin cá nhân của Khách hàng sẽ được {COMPANY_INFO.name} bảo mật, không tiết lộ ra ngoài. {COMPANY_INFO.name} không bán hay trao đổi những thông tin này với bất kỳ một Bên Thứ Ba nào khác, trừ trường hợp được quy định trong Điều khoản Dịch vụ này.</p>
          <p className="mt-2">Trong quá trình sử dụng dịch vụ, Khách hàng đồng ý nhận tất cả thông báo từ {COMPANY_INFO.name} liên quan tới dịch vụ qua thư điện tử hoặc điện thoại của Khách hàng.</p>
          <p className="mt-2">Các đường liên kết ngoài trang web của {COMPANY_INFO.name}: trang web của {COMPANY_INFO.name} có thể chứa các đường liên kết đến các trang web khác được đặt vào nhằm mục đích giới thiệu hoặc bổ sung thông tin liên quan để Khách hàng tham khảo. {COMPANY_INFO.name} không chịu trách nhiệm về nội dung hay các hành vi của bất kỳ trang web nào khác.</p>
          <p className="mt-2">Trường hợp Khách hàng nhận thấy thông tin cá nhân bị {COMPANY_INFO.name} sử dụng sai mục đích hoặc phạm vi như đã thông báo ở mục 1, 2 bên trên, Quý khách có thể liên hệ tổng đài {COMPANY_INFO.hotline}. {COMPANY_INFO.name} sẽ tiến hành xác minh và xử lý để đảm bảo quyền lợi của Khách hàng.</p>

          <h2 className="mt-6 text-2xl font-bold text-gray-900">5. Đơn vị thu thập và quản lý thông tin cá nhân</h2>
          <p className="mt-4">{COMPANY_INFO.name}</p>
          <p className="mt-2">Địa chỉ: {COMPANY_INFO.address}</p>
        </div>
      </div>
    </div>
  );
} 