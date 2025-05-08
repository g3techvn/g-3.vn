import Image from 'next/image';
import logo from '../../../assets/logo-gamiuk.png';
import header from '../../../assets/header-img.jpg';
import { COMPANY_INFO } from '../../../constants';

export const metadata = {
  title: `Chính sách bảo hành - ${COMPANY_INFO.name}`,
};

export default function WarrantyPolicy() {
  return (
    <div className="bg-white px-6 py-32 lg:px-8">
      <div className="mx-auto max-w-5xl text-base/7 text-gray-700">
        <p className="text-base/7 font-semibold text-green-700">Chính sách</p>
        <h1 className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
          Chính sách bảo hành - {COMPANY_INFO.name}
        </h1>

        <div className="mt-10 max-w-2xl">
          <p>
            Chỉ áp dụng cho sản phẩm chính, KHÔNG ÁP DỤNG cho phụ kiện đi kèm sản phẩm chính
          </p>
          <ul role="list" className="mt-8 max-w-xl space-y-8 text-gray-600">
            <li className="flex gap-x-3">
              <svg className="mt-1 h-5 w-5 flex-none text-green-700" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
              </svg>
              <span>
                <strong className="font-semibold text-gray-900">Đổi mới</strong> trong <strong className="font-semibold text-gray-900">15 ngày đầu</strong> nếu có lỗi từ nhà sản xuất.
              </span>
            </li>
            <li className="flex gap-x-3">
              <svg className="mt-1 h-5 w-5 flex-none text-green-700" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
              </svg>
              <span>
                Bảo hành trong vòng <strong className="font-semibold text-gray-900">15 ngày</strong> (từ ngày {COMPANY_INFO.name} nhận sản phẩm ở trạng thái lỗi đến ngày liên hệ khách hàng nhận sản phẩm đã bảo hành).
              </span>
            </li>
            <li className="flex gap-x-3">
              <svg className="mt-1 h-5 w-5 flex-none text-green-700" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
              </svg>
              <span>
                Nếu {COMPANY_INFO.name} vi phạm cam kết nêu trên (tổng thời gian bảo hành vượt quá 15 ngày, phải bảo hành lại sản phẩm trong 30 ngày kể từ lần bảo hành trước), Quý Khách hàng được <strong className="font-semibold text-gray-900">áp dụng phương thức Đổi mới</strong> tức thì hoặc <strong className="font-semibold text-gray-900">Hoàn tiền với mức phí giảm 50%.</strong>
              </span>
            </li>
          </ul>
          <p className="mt-8">
            *Từ tháng thứ 13 trở đi không áp dụng bảo hành cam kết, chỉ áp dụng bảo hành của hãng (nếu có)
          </p>
          <p className="mt-8">
            <strong className="font-semibold text-gray-900">Điều kiện áp dụng:</strong> Sản phẩm đủ điều kiện bảo hành của hãng
          </p>
        </div>
      </div>
    </div>
  );
} 