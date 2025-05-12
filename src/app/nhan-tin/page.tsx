'use client';

import MobileHomeHeader from '@/components/mobile/MobileHomeHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/features/auth/AuthProvider';
import { useState } from 'react';

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'G3 Tech',
      content: 'Chào bạn, chúng tôi có thể giúp gì cho bạn?',
      timestamp: '10:30',
      isRead: true,
    },
    {
      id: 2,
      sender: 'Bạn',
      content: 'Tôi đang tìm hiểu về ghế công thái học, bạn có thể tư vấn giúp không?',
      timestamp: '10:31',
      isRead: true,
    },
    {
      id: 3,
      sender: 'G3 Tech',
      content: 'Vâng, chúng tôi có nhiều mẫu ghế công thái học từ các thương hiệu nổi tiếng như Herman Miller, Steelcase, và Humanscale. Bạn đang quan tâm đến dòng ghế nào?',
      timestamp: '10:32',
      isRead: true,
    },
    {
      id: 4,
      sender: 'Bạn',
      content: 'Tôi đang tìm ghế cho nhân viên văn phòng, ngồi làm việc 8 tiếng mỗi ngày. Bạn có gợi ý gì không?',
      timestamp: '10:33',
      isRead: true,
    },
    {
      id: 5,
      sender: 'G3 Tech',
      content: 'Với nhu cầu ngồi lâu, chúng tôi khuyên bạn nên chọn dòng ghế có tính năng hỗ trợ lưng tốt như Herman Miller Aeron hoặc Steelcase Leap. Cả hai đều có khả năng điều chỉnh nhiều tư thế và hỗ trợ tốt cho cột sống. Bạn muốn tìm hiểu thêm về model nào?',
      timestamp: '10:34',
      isRead: false,
    }
  ]);

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    // TODO: Implement social login
    console.log(`Logging in with ${provider}`);
  };

  return (
    <>
      <MobileHomeHeader />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Nhắn tin</h1>
        
        <div className={`space-y-4 ${!user ? 'blur-[2px]' : ''}`}>
          {messages.map((message) => (
            <Card key={message.id} className={`${message.sender === 'Bạn' ? 'ml-auto' : 'mr-auto'} max-w-[80%]`}>
              <CardContent>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-900">{message.sender}</span>
                      <span className="text-xs text-gray-500">{message.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-700">{message.content}</p>
                  </div>
                  {!message.isRead && (
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1"></div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className={`fixed bottom-0 left-0 right-0 bg-white border-t p-4 ${!user ? 'blur-[2px]' : ''}`}>
          <div className="container mx-auto max-w-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                Gửi
              </button>
            </div>
          </div>
        </div>

        {!user && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4 text-center">Đăng nhập để chat</h2>
              
              {/* Social Login Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => handleSocialLogin('google')}
                  className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Đăng nhập bằng Google
                </button>
                <button
                  onClick={() => handleSocialLogin('facebook')}
                  className="w-full flex items-center justify-center gap-2 bg-[#1877F2] text-white py-2 px-4 rounded-lg hover:bg-[#166FE5] transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Đăng nhập bằng Facebook
                </button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Hoặc đăng nhập bằng</span>
                </div>
              </div>

              <form className="space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Nhập số điện thoại của bạn"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    id="password"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Nhập mật khẩu"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Đăng nhập
                </button>
                <div className="text-center text-sm text-gray-600">
                  <a href="#" className="hover:text-red-500">Quên mật khẩu?</a>
                  <span className="mx-2">|</span>
                  <a href="#" className="hover:text-red-500">Đăng ký tài khoản</a>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 