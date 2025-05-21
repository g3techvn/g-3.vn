'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/features/auth/AuthProvider';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface UserInfo {
  name: string;
  phone: string;
}

interface ChatSession {
  messages: Message[];
  userInfo: UserInfo | null;
  expiry: number; // Unix timestamp in milliseconds
}

const CHAT_SESSION_KEY = 'g3_chat_session';
const SESSION_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export default function MessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [inputMessage, setInputMessage] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [showConsultantMenu, setShowConsultantMenu] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState({
    name: 'Ms. Thuý',
    title: 'Tư vấn viên'
  });
  const menuRef = useRef<HTMLDivElement>(null);
  
  const consultants = [
    { name: 'Ms. Thuý', title: 'Tư vấn viên' },
    { name: 'Mr. Hùng', title: 'Chuyên gia ghế công thái học' },
    { name: 'Ms. Lan', title: 'Chuyên gia bàn điều chỉnh độ cao' },
    { name: 'Mr. Đạt', title: 'Tư vấn sản phẩm cao cấp' }
  ];

  // Save chat session to localStorage
  const saveChatSession = () => {
    if (!userInfo) return;
    
    const session: ChatSession = {
      messages,
      userInfo,
      expiry: Date.now() + SESSION_DURATION
    };
    
    localStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(session));
  };
  
  // Load chat session from localStorage
  const loadChatSession = (): ChatSession | null => {
    try {
      const sessionData = localStorage.getItem(CHAT_SESSION_KEY);
      if (!sessionData) return null;
      
      const session: ChatSession = JSON.parse(sessionData);
      
      // Check if session has expired
      if (session.expiry < Date.now()) {
        localStorage.removeItem(CHAT_SESSION_KEY);
        return null;
      }
      
      return session;
    } catch (error) {
      console.error('Failed to load chat session:', error);
      return null;
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    // TODO: Implement social login
    console.log(`Logging in with ${provider}`);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;
    
    // Format time manually to avoid hydration errors
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    const newMessage: Message = {
      id: messages.length + 1,
      sender: userInfo?.name || 'Bạn',
      content: inputMessage,
      timestamp: timeString,
      isRead: true,
    };
    
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    
    // Save updated messages to session
    setTimeout(() => saveChatSession(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const validateUserInfo = () => {
    let isValid = true;
    let nameErrorText = '';
    let phoneErrorText = '';
    
    if (!nameInput.trim()) {
      nameErrorText = 'Vui lòng nhập tên của bạn';
      isValid = false;
    }
    
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneInput.trim()) {
      phoneErrorText = 'Vui lòng nhập số điện thoại';
      isValid = false;
    } else if (!phoneRegex.test(phoneInput)) {
      phoneErrorText = 'Số điện thoại không hợp lệ';
      isValid = false;
    }
    
    // Set the error states
    setNameError(nameErrorText);
    setPhoneError(phoneErrorText);
    
    return isValid;
  };

  const handleSubmitUserInfo = () => {
    if (validateUserInfo()) {
      const newUserInfo = { name: nameInput, phone: phoneInput };
      setUserInfo(newUserInfo);
      setShowInfoModal(false);
      
      // Format time manually to avoid hydration errors
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      
      // Add welcome and support messages
      const welcomeMessage: Message = {
        id: 1,
        sender: 'G3 Tech',
        content: `Xin chào ${nameInput}! Chúng tôi rất vui được hỗ trợ bạn.`,
        timestamp: timeString,
        isRead: true,
      };
      
      const supportMessage: Message = {
        id: 2,
        sender: 'G3 Tech',
        content: 'G3 Tech chuyên cung cấp các sản phẩm công thái học cao cấp như ghế, bàn, màn hình và phụ kiện văn phòng. Bạn cần tư vấn về sản phẩm nào?',
        timestamp: timeString,
        isRead: true,
      };
      
      const initialMessages = [welcomeMessage, supportMessage];
      setMessages(initialMessages);
      
      // Save initial session
      setTimeout(() => {
        const session: ChatSession = {
          messages: initialMessages,
          userInfo: newUserInfo,
          expiry: Date.now() + SESSION_DURATION
        };
        localStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(session));
      }, 0);
    }
  };

  // Check if user already entered info in session storage or localStorage
  useEffect(() => {
    // Move state initialization to client-side only
    const initClientState = () => {
      // First try to load from localStorage (for the 1-hour session)
      const savedSession = loadChatSession();
      if (savedSession && savedSession.userInfo) {
        setUserInfo(savedSession.userInfo);
        setMessages(savedSession.messages || []);
        setShowInfoModal(false);
        return;
      }
      
      // Fallback to session storage (for backward compatibility)
      const savedInfo = sessionStorage.getItem('chatUserInfo');
      if (savedInfo) {
        try {
          const parsedInfo = JSON.parse(savedInfo);
          setUserInfo(parsedInfo);
          setShowInfoModal(false);
        } catch (e) {
          console.error('Failed to parse saved user info', e);
        }
      }
    };
    
    initClientState();
  }, []);

  // Save user info to session storage when it changes (backward compatibility)
  useEffect(() => {
    if (userInfo) {
      sessionStorage.setItem('chatUserInfo', JSON.stringify(userInfo));
    }
  }, [userInfo]);
  
  // Auto-extend session expiry while active
  useEffect(() => {
    if (!userInfo) return;
    
    const intervalId = setInterval(() => {
      const session = loadChatSession();
      if (session) {
        session.expiry = Date.now() + SESSION_DURATION;
        localStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(session));
      }
    }, 5 * 60 * 1000); // Update every 5 minutes
    
    return () => clearInterval(intervalId);
  }, [userInfo]);

  // Close drawer when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Only handle outside clicks when menu is open
      if (!showConsultantMenu) return;
      
      // Check if the click was outside the menu
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && 
          !(event.target as Element).closest('button[data-drawer-trigger="true"]')) {
        console.log('Closing menu from outside click');
        setShowConsultantMenu(false);
      }
    }
    
    // Add event listener when the component mounts
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showConsultantMenu]); // Re-run effect when showConsultantMenu changes

  // Handle keyboard events for the drawer
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && showConsultantMenu) {
        setShowConsultantMenu(false);
      }
    }
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showConsultantMenu]);

  // Client-side only rendering for certain elements
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {/* Mobile Header with Back Button */}
      <div className="fixed top-0 left-0 right-0 z-[9998] bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center h-14 px-4 relative">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-10 h-10 text-red-500 hover:text-red-600"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="absolute left-0 right-0 top-0 h-14 flex items-center justify-center pointer-events-none">
            <span className="font-bold text-lg text-red-600 tracking-wide pointer-events-none">
              {isClient ? `${selectedConsultant.name} - ${selectedConsultant.title}` : 'Tư vấn viên'}
            </span>
          </div>
          
          {/* Context menu button */}
          {isClient && (
            <div className="relative ml-auto z-10">
              <button 
                onClick={() => setShowConsultantMenu(!showConsultantMenu)}
                data-drawer-trigger="true"
                className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-red-500"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              
              {/* Consultant selection drawer - client-side only */}
              <div 
                className={`fixed inset-y-0 right-0 z-[9999] w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
                  showConsultantMenu ? 'translate-x-0' : 'translate-x-full'
                }`}
                ref={menuRef}
              >
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-800">Chọn tư vấn viên</h3>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowConsultantMenu(false);
                      }}
                      className="text-gray-500 hover:text-red-500 p-2"
                      aria-label="Đóng"
                    >
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="overflow-y-auto flex-1 p-2">
                    {consultants.map((consultant, index) => (
                      <button
                        key={index}
                        className={`w-full mb-2 px-4 py-3 text-left transition-colors rounded-lg ${
                          selectedConsultant.name === consultant.name 
                            ? 'bg-red-50 text-red-600 border border-red-200' 
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                        onClick={() => {
                          setSelectedConsultant(consultant);
                          setShowConsultantMenu(false);
                        }}
                      >
                        <div className="font-medium text-base">{consultant.name}</div>
                        <div className="text-sm mt-0.5">{consultant.title}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Backdrop overlay */}
              {showConsultantMenu && (
                <div 
                  className="fixed inset-0 bg-black bg-opacity-25 z-[9997] backdrop-blur-sm"
                  onClick={() => setShowConsultantMenu(false)} 
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* User Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div 
            className="w-[90%] max-w-md p-6 rounded-xl animate-fadeIn overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <h2 className="text-xl font-bold mb-4 text-center bg-gradient-to-r from-red-600 to-red-400 text-transparent bg-clip-text">Thông tin liên hệ</h2>
            <p className="text-gray-600 mb-6 text-center">Vui lòng cung cấp thông tin để chúng tôi có thể hỗ trợ bạn tốt hơn</p>
            
            <div className="space-y-5">
              <div className="group">
                <label className="block text-gray-700 text-sm font-medium mb-2 transition-all group-focus-within:text-red-500">Họ và tên</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input 
                    type="text" 
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full pl-10 px-4 py-3 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-400 transition-all"
                    placeholder="Nhập họ và tên của bạn"
                  />
                </div>
                {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
              </div>
              
              <div className="group">
                <label className="block text-gray-700 text-sm font-medium mb-2 transition-all group-focus-within:text-red-500">Số điện thoại</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input 
                    type="tel" 
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full pl-10 px-4 py-3 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-400 transition-all"
                    placeholder="Nhập số điện thoại của bạn"
                  />
                </div>
                {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
              </div>
            </div>
            
            <button 
              onClick={handleSubmitUserInfo}
              className="w-full mt-8 bg-gradient-to-r from-red-600 to-red-500 text-white py-3 rounded-lg hover:opacity-90 transition-all transform hover:scale-[0.99] active:scale-[0.97]"
            >
              Bắt đầu chat
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col h-screen bg-[url('/images/chat-partten.svg')] bg-repeat">
        {/* Space for header */}
        <div className="h-14"></div>
        
        {/* Chat area with scrollable messages */}
        <div className="flex-1 overflow-y-auto pb-24">
          <div className="container mx-auto px-4 py-2">
            <div className="space-y-4">
              {messages.map((message) => (
                <Card key={message.id} className={`${message.sender === userInfo?.name || message.sender === 'Bạn' ? 'ml-auto' : 'mr-auto'} max-w-[80%]`}>
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
          </div>
        </div>

        {/* Input area fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-[9999] shadow-lg">
          <div className="container mx-auto max-w-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-400"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!userInfo}
              />
              <button 
                className={`bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-lg transition-all ${userInfo ? 'hover:opacity-90 transform hover:scale-[0.99]' : 'opacity-50 cursor-not-allowed'}`}
                onClick={handleSendMessage}
                disabled={!userInfo}
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </>
  );
} 