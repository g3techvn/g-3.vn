'use client';

import React from 'react';
import { Button } from './Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './Dialog';
import { Checkbox } from './Checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import { RadioGroup, RadioGroupItem } from './RadioGroup';
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastAction } from './Toast';

export function ContactForm() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [priority, setPriority] = React.useState('normal');
  const [newsletter, setNewsletter] = React.useState(false);
  const [showSuccessToast, setShowSuccessToast] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mô phỏng gửi form
    console.log({
      name,
      email,
      subject,
      message,
      priority,
      newsletter,
    });
    
    // Đóng dialog nếu đang mở
    setOpenDialog(false);
    
    // Hiển thị thông báo thành công
    setShowSuccessToast(true);
    
    // Reset form
    setName('');
    setEmail('');
    setMessage('');
    setSubject('');
    setPriority('normal');
    setNewsletter(false);
  };

  return (
    <ToastProvider>
      <div className="mx-auto p-4 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Chủ đề
              </label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger id="subject" className="w-full">
                  <SelectValue placeholder="Chọn chủ đề" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="support">Hỗ trợ kỹ thuật</SelectItem>
                  <SelectItem value="sales">Tư vấn mua hàng</SelectItem>
                  <SelectItem value="warranty">Bảo hành sản phẩm</SelectItem>
                  <SelectItem value="partner">Hợp tác kinh doanh</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mức độ ưu tiên
              </label>
              <RadioGroup value={priority} onValueChange={setPriority} className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <label htmlFor="low" className="text-sm">Thấp</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="normal" />
                  <label htmlFor="normal" className="text-sm">Bình thường</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <label htmlFor="high" className="text-sm">Cao</label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Nội dung
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="newsletter" 
                checked={newsletter}
                onCheckedChange={(checked) => setNewsletter(checked as boolean)}
              />
              <label
                htmlFor="newsletter"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Đăng ký nhận thông tin khuyến mãi qua email
              </label>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Button type="submit" size="lg">
              Gửi liên hệ
            </Button>
            
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="lg">
                  Xem chính sách
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Chính sách bảo mật thông tin</DialogTitle>
                  <DialogDescription>
                    Thông tin của quý khách sẽ được sử dụng để liên hệ và xử lý yêu cầu của quý khách. 
                    Chúng tôi cam kết không chia sẻ thông tin với bên thứ ba trừ khi có sự đồng ý từ quý khách.
                  </DialogDescription>
                </DialogHeader>
                <p className="py-4 text-sm text-gray-500">
                  Bằng việc gửi thông tin, quý khách đồng ý với các điều khoản bảo mật của chúng tôi.
                  Quý khách có thể hủy đăng ký nhận thông tin bất kỳ lúc nào bằng cách liên hệ với chúng tôi.
                </p>
                <DialogFooter>
                  <Button onClick={() => setOpenDialog(false)}>
                    Đã hiểu
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </form>
      </div>
      
      {showSuccessToast && (
        <Toast
          open={showSuccessToast}
          onOpenChange={setShowSuccessToast}
        >
          <ToastTitle>Gửi liên hệ thành công!</ToastTitle>
          <ToastDescription>
            Cảm ơn bạn đã liên hệ với chúng tôi. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
          </ToastDescription>
          <ToastAction altText="Đóng">Đóng</ToastAction>
        </Toast>
      )}
      <ToastViewport />
    </ToastProvider>
  );
} 