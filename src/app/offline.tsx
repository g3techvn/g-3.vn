import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <svg
          className="mx-auto h-16 w-16 text-red-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Bạn đang ngoại tuyến</h1>
        <p className="mt-2 text-gray-600">
          Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn và thử lại.
        </p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-block rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 transition duration-150"
          >
            Thử lại
          </Link>
        </div>
      </div>
    </div>
  );
} 