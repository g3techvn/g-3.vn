'use client'

import Image from 'next/image'

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface PaymentMethodSelectionProps {
  showPaymentDrawer: boolean;
  setShowPaymentDrawer: (show: boolean) => void;
  selectedPayment: string;
  setSelectedPayment: (method: string) => void;
  paymentMethods: PaymentMethod[];
}

export default function PaymentMethodSelection({
  showPaymentDrawer,
  setShowPaymentDrawer,
  selectedPayment,
  setSelectedPayment,
  paymentMethods
}: PaymentMethodSelectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0 mr-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <div className="font-medium">Phương thức thanh toán</div>
        </div>
      </div>

      {!selectedPayment && (
        <div className="p-3 rounded-md bg-yellow-50 border border-yellow-200 mb-4">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-yellow-500 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <span className="text-sm font-medium text-yellow-700">Vui lòng chọn một phương thức thanh toán</span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`p-4 border rounded-md cursor-pointer ${
              selectedPayment === method.id ? 'border-red-500 bg-red-50' : 'border-gray-200'
            }`}
            onClick={() => setSelectedPayment(method.id)}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                {method.id === 'cod' && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.129-.504 1.125-1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                  </svg>
                )}
                {method.id === 'bank' && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                  </svg>
                )}

              </div>
              <div className="ml-3">
                <div className="font-medium text-gray-800">{method.name}</div>
                <div className="text-sm text-gray-500">{method.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="flex items-center text-gray-600 text-sm mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 text-blue-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        Hỗ trợ đầy đủ các phương thức thanh toán như:
      </p>
      <p className="text-yellow-600 font-medium mb-3">COD và chuyển khoản tài khoản ngân hàng</p>
      <p className="text-gray-500 text-xs mb-5">(*) Vui lòng chọn phương thức thanh toán trước khi đặt hàng</p>
      
      <p className="text-gray-500 text-xs">Bằng việc tiến hành đặt hàng, bạn đồng ý với điều kiện và điều khoản sử dụng của Công ty Cổ phần công nghệ G3</p>
    </div>
  )
} 