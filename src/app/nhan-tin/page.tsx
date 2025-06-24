'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/features/auth/AuthProvider';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import LoginModal from '@/components/features/auth/LoginModal';

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

interface Consultant {
  name: string;
  title: string;
  phone?: string;
  isBot: boolean;
}

const CHAT_SESSION_KEY = 'g3_chat_session';
const SESSION_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export default function MessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [inputMessage, setInputMessage] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [showConsultantMenu, setShowConsultantMenu] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant>({
    name: 'Ms. Thuý',
    title: 'Tư vấn viên',
    phone: '0979983355',
    isBot: false
  });
  const menuRef = useRef<HTMLDivElement>(null);
  
  const consultants = [
    { name: 'Ms. Thuý', title: 'Tư vấn viên', phone: '0979983355', isBot: false },
    { name: 'Ms. Thuỷ', title: 'Chuyên gia ghế công thái học', phone: '0979983355', isBot: false },
    { name: 'Mr. Đạt', title: 'Tư vấn sản phẩm cao cấp', phone: '0979983355', isBot: false },
    { name: 'G3-Tech Assistant', title: 'Tư vấn viên tự động', isBot: true }
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
    if (inputMessage.trim() === '' || !userInfo) {
      if (!userInfo) {
        setShowInfoModal(true); // Show info modal if trying to send without user info
      }
      return;
    }
    
    // Prevent duplicate submissions by disabling the input temporarily
    const message = inputMessage;
    setInputMessage('');
    
    // Format time manually to avoid hydration errors
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    const newMessage: Message = {
      id: Date.now(), // Use timestamp for more reliable IDs
      sender: userInfo.name || 'Bạn',
      content: message,
      timestamp: timeString,
      isRead: true,
    };
    
    // Use functional update to ensure we have the latest state
    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages, newMessage];
      
      // Handle bot auto-response if G3 BOT is the selected consultant
      if (selectedConsultant.name === 'G3 BOT') {
        setTimeout(() => {
          // Get bot response based on user's message
          const botResponse = getBotResponse(message, userInfo?.name || '');
          
          // Format time for bot response with slight delay
          const responseNow = new Date();
          const responseHours = responseNow.getHours().toString().padStart(2, '0');
          const responseMinutes = responseNow.getMinutes().toString().padStart(2, '0');
          const responseTime = `${responseHours}:${responseMinutes}`;
          
          const botMessage: Message = {
            id: Date.now() + 100, // Ensure unique ID
            sender: 'G3 BOT',
            content: botResponse,
            timestamp: responseTime,
            isRead: true,
          };
          
          // Add bot response to messages
          setMessages(currentMessages => {
            const messagesWithBotResponse = [...currentMessages, botMessage];
            
            // Update the session with the new messages including bot response
            const session: ChatSession = {
              messages: messagesWithBotResponse,
              userInfo,
              expiry: Date.now() + SESSION_DURATION
            };
            localStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(session));
            
            return messagesWithBotResponse;
          });
        }, 1000); // Slight delay for natural feel
      }
      
      // Save to session inside the update function to ensure we're using the latest state
      setTimeout(() => {
        const session: ChatSession = {
          messages: updatedMessages,
          userInfo,
          expiry: Date.now() + SESSION_DURATION
        };
        localStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(session));
      }, 0);
      
      return updatedMessages;
    });
  };

  // Function to generate bot responses based on user input
  const getBotResponse = (userMessage: string, userName: string): string => {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    // Check for greetings
    if (/xin chào|chào|hello|hi|hey|hola/i.test(lowerCaseMessage)) {
      return `Chào ${userName}! Tôi có thể giúp gì cho bạn?`;
    }
    
    // Check for specific product inquiries
    if (/ghế|ghe|chair/i.test(lowerCaseMessage)) {
      return 'Chúng tôi có nhiều loại ghế công thái học từ các thương hiệu nổi tiếng như Herman Miller, Steelcase, và Humanscale. Ghế công thái học giúp giảm đau lưng, cải thiện tư thế và tăng năng suất làm việc. Bạn muốn tìm hiểu thêm về mẫu ghế nào?';
    }
    
    if (/bàn|ban|desk|table/i.test(lowerCaseMessage)) {
      return 'G3 Tech cung cấp các loại bàn điều chỉnh độ cao giúp bạn linh hoạt làm việc ở tư thế đứng hoặc ngồi. Điều này rất tốt cho sức khỏe và năng suất. Chúng tôi có các mẫu từ thương hiệu FlexiSpot, Uplift và Jarvis với nhiều kích thước và mức giá khác nhau.';
    }
    
    if (/màn hình|man hinh|monitor|screen/i.test(lowerCaseMessage)) {
      return 'Chúng tôi có các loại màn hình công thái học và giá đỡ màn hình đa năng giúp bạn điều chỉnh vị trí màn hình phù hợp với tầm nhìn, giảm mỏi cổ và mắt. Các thương hiệu phổ biến gồm Dell, LG UltraWide và Samsung với nhiều kích thước từ 24" đến 49".';
    }
    
    if (/phụ kiện|phu kien|accessory|accessories/i.test(lowerCaseMessage)) {
      return 'G3 Tech cung cấp nhiều phụ kiện văn phòng như kê chân, đệm lưng, bàn phím cơ học, chuột công thái học và các giải pháp quản lý cáp giúp không gian làm việc của bạn gọn gàng và thoải mái hơn.';
    }
    
    if (/giá|gia|price|cost/i.test(lowerCaseMessage)) {
      return 'Chúng tôi có sản phẩm ở nhiều mức giá khác nhau phù hợp với ngân sách của bạn. Ghế công thái học từ 3 triệu đến 30 triệu, bàn điều chỉnh độ cao từ 5 triệu đến 20 triệu, và màn hình từ 4 triệu đến 25 triệu. Bạn quan tâm đến sản phẩm nào để tôi có thể cung cấp thông tin chi tiết hơn?';
    }
    
    if (/1/i.test(lowerCaseMessage)) {
      return 'Ghế công thái học là sự lựa chọn tuyệt vời! Chúng tôi có các mẫu phổ biến như Herman Miller Aeron, Steelcase Gesture và Humanscale Freedom. Ghế công thái học được thiết kế để hỗ trợ cột sống, giảm áp lực lên lưng và cổ, đồng thời thúc đẩy tư thế ngồi lành mạnh. Bạn quan tâm đến mức giá nào?';
    }
    
    if (/2/i.test(lowerCaseMessage)) {
      return 'Bàn điều chỉnh độ cao là lựa chọn thông minh! Chúng cho phép bạn thay đổi linh hoạt giữa ngồi và đứng, giúp tăng cường lưu thông máu và giảm các vấn đề sức khỏe liên quan đến ngồi quá lâu. Chúng tôi có các mẫu điều chỉnh bằng điện với bộ nhớ vị trí và khả năng chịu tải từ 70kg đến 150kg.';
    }
    
    if (/3/i.test(lowerCaseMessage)) {
      return 'Màn hình và giá đỡ là quan trọng cho góc nhìn tối ưu! Chúng tôi cung cấp màn hình cong, màn hình ultra-wide và giá đỡ màn hình đa năng giúp điều chỉnh độ cao, góc nghiêng và xoay, giúp giảm căng thẳng cho cổ và mắt. Màn hình của chúng tôi đều có công nghệ chống chói và bảo vệ mắt.';
    }
    
    if (/4/i.test(lowerCaseMessage)) {
      return 'Phụ kiện văn phòng giúp hoàn thiện không gian làm việc! Chúng tôi có bàn phím cơ học (tốt cho cổ tay), chuột công thái học (giảm hội chứng ống cổ tay), kê chân (cải thiện tư thế), đệm lưng (hỗ trợ thêm), đèn bàn, tai nghe chống ồn và nhiều phụ kiện khác. Bạn cần phụ kiện cụ thể nào?';
    }
    
    if (/cảm ơn|cam on|thank|thanks/i.test(lowerCaseMessage)) {
      return `Không có gì ${userName} ơi! Rất vui được hỗ trợ bạn. Nếu còn câu hỏi nào khác, cứ tự nhiên hỏi nhé.`;
    }
    
    // Default response if no pattern matches
    return 'Cảm ơn bạn đã nhắn tin. Bạn có thể cho tôi biết thêm bạn đang tìm kiếm sản phẩm hay dịch vụ nào, hoặc chọn một trong các mục sau:\n1. Ghế công thái học\n2. Bàn điều chỉnh độ cao\n3. Màn hình và giá đỡ\n4. Phụ kiện văn phòng';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputMessage.trim() !== '') {
      e.preventDefault(); // Prevent default Enter behavior
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
      
      // Create welcome messages but don't add them all at once
      const initialMessages = createWelcomeMessages(selectedConsultant, nameInput);
      
      // Add messages with delay
      setMessages([initialMessages[0]]); // Add first message immediately
      
      // Add remaining messages with delay
      initialMessages.slice(1).forEach((message, index) => {
        setTimeout(() => {
          setMessages(prev => [...prev, message]);
          
          // After each message is added, update the session in localStorage
          const session: ChatSession = {
            messages: [...initialMessages.slice(0, index + 2)], // Just use the known messages up to this point
            userInfo: newUserInfo,
            expiry: Date.now() + SESSION_DURATION
          };
          localStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(session));
        }, 3000 * (index + 1)); // 3 seconds delay between messages
      });
      
      // Save initial session with just the first message
      const session: ChatSession = {
        messages: [initialMessages[0]],
        userInfo: newUserInfo,
        expiry: Date.now() + SESSION_DURATION
      };
      localStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(session));
    }
  };

  // Function to create welcome messages for the selected consultant
  const createWelcomeMessages = (consultant: typeof selectedConsultant, userName: string) => {
    // Format time manually to avoid hydration errors
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    // Special messages for the bot consultant
    if (consultant.name === 'G3 BOT') {
      const welcomeMessage: Message = {
        id: 1,
        sender: consultant.name,
        content: `Xin chào ${userName}! Tôi là G3 BOT, trợ lý ảo hỗ trợ tư vấn tự động 24/7.`,
        timestamp: timeString,
        isRead: true,
      };
      
      const supportMessage: Message = {
        id: 2,
        sender: consultant.name,
        content: 'Tôi có thể giúp bạn tìm hiểu về các sản phẩm công thái học của G3 Tech. Bạn có thể hỏi tôi về ghế, bàn điều chỉnh độ cao, màn hình, phụ kiện hoặc bất kỳ sản phẩm nào khác.',
        timestamp: timeString,
        isRead: true,
      };
      
      const optionsMessage: Message = {
        id: 3,
        sender: consultant.name,
        content: 'Bạn đang quan tâm đến sản phẩm nào sau đây?\n1. Ghế công thái học\n2. Bàn điều chỉnh độ cao\n3. Màn hình và giá đỡ\n4. Phụ kiện văn phòng',
        timestamp: timeString,
        isRead: true,
      };
      
      return [welcomeMessage, supportMessage, optionsMessage];
    }
    
    // Regular messages for human consultants
    const welcomeMessage: Message = {
      id: 1,
      sender: consultant.name,
      content: `Xin chào ${userName}! Tôi là ${consultant.name}, ${consultant.title.toLowerCase()}. Rất vui được hỗ trợ bạn.`,
      timestamp: timeString,
      isRead: true,
    };
    
    const supportMessage: Message = {
      id: 2,
      sender: consultant.name,
      content: 'G3 Tech chuyên cung cấp các sản phẩm công thái học cao cấp như ghế, bàn, màn hình và phụ kiện văn phòng. Bạn cần tư vấn về sản phẩm nào?',
      timestamp: timeString,
      isRead: true,
    };
    
    return [welcomeMessage, supportMessage];
  };

  // Check if user already entered info in session storage or localStorage
  useEffect(() => {
    // Move state initialization to client-side only
    const initClientState = () => {
      // First check if user is logged in
      if (user) {
        setUserInfo({
          name: user.fullName || user.email?.split('@')[0] || 'Bạn',
          phone: '' // Since phone is not available in User type
        });
        setShowInfoModal(false);
        return;
      }

      // If not logged in, try to load from localStorage (for the 1-hour session)
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

      // If no saved info and not logged in, show the info modal
      if (!user && !savedSession && !savedInfo) {
        setShowInfoModal(true);
        setUserInfo(null); // Reset user info when logged out
        setMessages([]); // Clear messages when logged out
      }
    };
    
    initClientState();
  }, [user]); // Added user as dependency

  // Add effect to handle logout
  useEffect(() => {
    if (!user) {
      // Clear chat session when user logs out
      localStorage.removeItem(CHAT_SESSION_KEY);
      sessionStorage.removeItem('chatUserInfo');
      setUserInfo(null);
      setMessages([]);
      setShowInfoModal(true);
    }
  }, [user]);

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
      // ✅ Kiểm tra page visibility trước khi update
      if (document.hidden) return;
      
      const session = loadChatSession();
      if (session) {
        session.expiry = Date.now() + SESSION_DURATION;
        localStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(session));
      }
    }, 10 * 60 * 1000); // ✅ Tăng từ 5 phút lên 10 phút để giảm CPU usage
    
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
            onClick={() => router.push('/')}
            className="flex items-center justify-center w-10 h-10 text-red-500 hover:text-red-600"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="absolute left-0 right-0 top-0 h-14 flex flex-col justify-center pl-16 pointer-events-none">
            <span className="font-bold text-lg text-red-600 tracking-wide pointer-events-none text-left">
              {isClient ? selectedConsultant.name : 'Tư vấn viên'}
            </span>
            <span className="text-sm text-gray-600 tracking-wide pointer-events-none text-left">
              {isClient ? selectedConsultant.title : ''}
            </span>
          </div>
          
          {/* Call and Menu buttons */}
          {isClient && (
            <div className="relative ml-auto z-10 flex items-center">
              {/* Call button - hide for bot */}
              {!selectedConsultant.isBot && (
                <a 
                  href={`tel:${selectedConsultant.phone}`}
                  className="flex items-center justify-center w-10 h-10 text-green-600 hover:text-green-700 mr-1"
                  aria-label={`Gọi ${selectedConsultant.name}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </a>
              )}
              
              {/* Menu button */}
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
                className={`fixed inset-y-0 right-0 z-[9999] w-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
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
                          if (selectedConsultant.name !== consultant.name && userInfo) {
                            // Create new welcome messages for the new consultant
                            const newMessages = createWelcomeMessages(consultant, userInfo.name);
                            
                            // ✅ Batch message updates thay vì individual setTimeout
                            setMessages([newMessages[0]]); // Show first message immediately
                            
                            // ✅ Single timeout thay vì multiple timeouts
                            if (newMessages.length > 1) {
                              let messageIndex = 1;
                              const addNextMessage = () => {
                                if (messageIndex < newMessages.length) {
                                  setMessages(prev => [...prev, newMessages[messageIndex]]);
                                  messageIndex++;
                                  
                                  // ✅ Schedule next message
                                  if (messageIndex < newMessages.length) {
                                    setTimeout(addNextMessage, 3000);
                                  } else {
                                    // ✅ Single localStorage write khi hoàn thành
                                    const session = loadChatSession();
                                    if (session) {
                                      session.messages = newMessages;
                                      session.expiry = Date.now() + SESSION_DURATION;
                                      localStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(session));
                                    }
                                  }
                                }
                              };
                              
                              setTimeout(addNextMessage, 3000);
                            }
                            
                            // ✅ Update session với first message only
                            const session = loadChatSession();
                            if (session) {
                              session.messages = [newMessages[0]];
                              session.expiry = Date.now() + SESSION_DURATION;
                              localStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(session));
                            }
                          }
                          
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
            className="w-[90%] max-w-md p-6 rounded-xl animate-fadeIn overflow-hidden relative"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            {/* Close button */}
            <button 
              onClick={() => router.push('/')}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 p-2 z-10"
              aria-label="Đóng"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 className="text-xl font-bold mb-4 text-center bg-gradient-to-r from-red-600 to-red-400 text-transparent bg-clip-text">Thông tin liên hệ</h2>
            <p className="text-gray-600 mb-6 text-center">Vui lòng cung cấp thông tin để chúng tôi có thể hỗ trợ bạn tốt hơn</p>
            
            <div className="space-y-5">
              {/* Login button */}
              <button
                onClick={() => {
                  setShowInfoModal(false);
                  setShowLoginModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Đăng nhập để chat
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">hoặc</span>
                </div>
              </div>

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

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          setShowInfoModal(true);
        }}
        onOpenRegister={() => {
          setShowLoginModal(false);
          // Thêm xử lý mở modal đăng ký nếu cần
        }}
      />

      <div className="flex flex-col h-screen bg-[url('/images/chat-partten.svg')] bg-repeat">
        {/* Space for header */}
        <div className="h-14"></div>
        
        {/* Chat area with scrollable messages */}
        <div className="flex-1 overflow-y-auto pb-24">
          <div className="container mx-auto px-4 py-2">
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isUserMessage = message.sender === userInfo?.name || message.sender === 'Bạn';
                return (
                  <Card 
                    key={message.id} 
                    data-message-id={message.id}
                    className={`
                      ${isUserMessage ? 'ml-auto bg-gradient-to-r from-red-500 to-red-600 text-white' : 'mr-auto bg-white'} 
                      max-w-[80%] rounded-3xl shadow-sm border-0 relative 
                      ${isUserMessage ? 'rounded-br-sm' : 'rounded-bl-sm'}
                      animate-messageIn
                    `}
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      transform: 'translateY(0)'
                    }}
                  >
                    <CardContent className={`p-3 ${isUserMessage ? 'text-white' : ''}`}>
                      <div className="flex items-start gap-3">
                        {!isUserMessage && (
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-red-600 font-bold text-sm">
                            {message.sender === 'G3 BOT' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            ) : (
                              message.sender.charAt(0)
                            )}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-medium text-sm ${isUserMessage ? 'text-white/90' : 'text-gray-900'}`}>
                              {message.sender}
                            </span>
                            <span className={`text-xs ${isUserMessage ? 'text-white/70' : 'text-gray-500'}`}>
                              {message.timestamp}
                            </span>
                          </div>
                          <p className={`text-sm ${isUserMessage ? 'text-white/95' : 'text-gray-700'}`}>
                            {message.content}
                          </p>
                        </div>
                        {!message.isRead && (
                          <div className="w-2 h-2 rounded-full bg-red-500 mt-1"></div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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
                className="flex-1 rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-400 transition-all"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!userInfo}
              />
              <button 
                className={`bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-3 rounded-2xl transition-all ${userInfo ? 'hover:opacity-90 transform hover:scale-[0.99] active:scale-[0.97]' : 'opacity-50 cursor-not-allowed'}`}
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
        
        @keyframes messageIn {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-messageIn {
          animation: messageIn 0.3s ease-out forwards;
        }

        /* Add glass effect styles */
        .glass-effect {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </>
  );
} 