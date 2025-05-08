import Image from 'next/image';
import logo from '../../../assets/logo-gamiuk.png';
import header from '../../../assets/header-img.jpg';
import { COMPANY_INFO } from '../../../constants';

export const metadata = {
  title: `Chính sách đổi trả - ${COMPANY_INFO.name}`,
};

export default function ReturnPolicy() {
  return (
    <div className="bg-white px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-5xl text-base/7 text-gray-700">
        <p className="text-base/7 font-semibold text-green-700">Chính sách</p>
        <h1 className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
          Chính sách đổi trả - {COMPANY_INFO.name}
        </h1>

        <div className="mt-10 max-w-5xl">
          <p>
            Chỉ áp dụng cho sản phẩm chính, <strong className="font-semibold text-gray-900">KHÔNG ÁP DỤNG</strong> cho phụ kiện đi kèm sản phẩm chính
          </p>
          <ul role="list" className="mt-8 max-w-5xl space-y-8 text-gray-600">
            <li className="flex gap-x-3">
              <svg className="mt-1 h-5 w-5 flex-none text-green-700" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
              <div>
                <strong className="font-semibold text-gray-900">1. Đổi mới tức thì</strong>
                <p>Thay thế trực tiếp thành phần bị hư hỏng trên sản phẩm với linh kiện cùng loại, cùng màu sắc, v.v. Cụ thể:</p>
                
                <p><strong>1.1. Đổi sản phẩm mới nếu sản phẩm chính gặp lỗi:</strong></p>
                <ul className="list-disc pl-5">
                  <li>30 ngày đầu tiên kể từ ngày mua: Quý Khách hàng được miễn phí đổi trả</li>
                  <li>Sau 30 ngày đầu tới khi hết thời hạn bảo hành: {COMPANY_INFO.name} thu phí 10% giá trị hóa đơn trên mỗi tháng kể từ ngày mua sản phẩm (VD: Tháng thứ hai kể từ ngày mua thu phí 10%, tháng thứ ba phí thu 20%, v.v.)</li>
                </ul>
                <p><strong>Lưu ý:</strong> Nếu không có sản phẩm chính để đổi mới, Quý Khách hàng sẽ được áp dụng chính sách Bảo hành có cam kết hoặc hoàn tiền với mức phí giảm 50%.</p>
                
                <p><strong>1.2. Đổi phụ kiện có cùng công năng mà {COMPANY_INFO.name} đang kinh doanh nếu phụ kiện đi kèm sản phẩm chính gặp lỗi:</strong></p>
                <ul className="list-disc pl-5">
                  <li>Phụ kiện đi kèm được đổi miễn phí trong vòng 12 tháng kể từ ngày mua sản phẩm chính. Hàng đổi trả sẽ là sản phẩm có công năng tương tự đang được kinh doanh tại {COMPANY_INFO.name}.</li>
                </ul>
                <p><strong>Lưu ý:</strong> Nếu không có phụ kiện công năng tương đương hoặc Quý Khách hàng không hài lòng với cách xử lý này, {COMPANY_INFO.name} sẽ đưa sản phẩm tới TTBH để áp dụng chính sách bảo hành của hãng.</p>
                
                <p><strong>1.3. Lỗi phần mềm sẽ không được áp dụng đổi mới sản phẩm.</strong> Đội ngũ {COMPANY_INFO.name} / TTBH hợp lệ sẽ giải quyết lỗi phần mềm trên sản phẩm giúp Quý Khách hàng.</p>
                
                <p><strong>1.4. Trường hợp Quý Khách hàng muốn đổi sản phẩm nguyên kiện:</strong></p>
                <ul className="list-disc pl-5">
                  <li>Bên cạnh áp dụng mức phí đổi trả đã nêu tại Mục 2.1, Quý Khách hàng sẽ trả thêm phí lấy sản phẩm mới nguyên kiện tương đương 20% giá trị hóa đơn.</li>
                </ul>
                <p>Sản phẩm đổi trả phải giữ nguyên 100% hình thức ban đầu, đủ điều kiện bảo hành của hãng.</p>
                <p>Sản phẩm chỉ dùng cho mục đích sử dụng cá nhân, không sử dụng vì mục đích thương mại.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
} 