'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from './Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './Dialog';
import { Checkbox } from './Checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import { RadioGroup, RadioGroupItem } from './RadioGroup';
import { useToast } from './Toast';

// Define the form schema with Zod
const contactFormSchema = z.object({
  name: z.string()
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
    .max(50, 'Họ và tên không được vượt quá 50 ký tự'),
  email: z.string()
    .email('Email không hợp lệ')
    .min(1, 'Email là bắt buộc'),
  phone: z.string()
    .min(10, 'Số điện thoại phải có ít nhất 10 số')
    .max(11, 'Số điện thoại không được vượt quá 11 số')
    .regex(/^[0-9]+$/, 'Số điện thoại chỉ được chứa số'),
  subject: z.string()
    .min(1, 'Vui lòng chọn chủ đề'),
  priority: z.enum(['low', 'normal', 'high'], {
    required_error: 'Vui lòng chọn mức độ ưu tiên',
  }),
  message: z.string()
    .min(10, 'Nội dung tin nhắn phải có ít nhất 10 ký tự')
    .max(1000, 'Nội dung tin nhắn không được vượt quá 1000 ký tự'),
  newsletter: z.boolean(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export function ContactForm() {
  const { showToast, ToastComponent } = useToast();
  const [openDialog, setOpenDialog] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      priority: 'normal',
      newsletter: false,
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      // TODO: Implement form submission logic
      console.log('Form submitted:', data);
      
      // Đóng dialog nếu đang mở
      setOpenDialog(false);
      
      // Hiển thị thông báo thành công
      showToast('Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất có thể.', 'success');
      
      // Reset form
      reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <>
      <div className="mx-auto p-4 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className="block w-full rounded-md border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                placeholder="Ví dụ: Nguyễn Văn A"
              />
              {errors.name && (
                <p className="mt-1.5 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className="block w-full rounded-md border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                placeholder="Ví dụ: nguyenvana@gmail.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                {...register('phone')}
                type="tel"
                id="phone"
                className="block w-full rounded-md border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                placeholder="Ví dụ: 0987654321"
              />
              {errors.phone && (
                <p className="mt-1.5 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-900 mb-2">
                Chủ đề <span className="text-red-500">*</span>
              </label>
              <Select
                value={watch('subject')}
                onValueChange={(value) => setValue('subject', value)}
              >
                <SelectTrigger id="subject" className="w-full py-2.5 px-4">
                  <SelectValue placeholder="Vui lòng chọn chủ đề liên hệ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="support">Hỗ trợ kỹ thuật</SelectItem>
                  <SelectItem value="sales">Tư vấn mua hàng</SelectItem>
                  <SelectItem value="warranty">Bảo hành sản phẩm</SelectItem>
                  <SelectItem value="partner">Hợp tác kinh doanh</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
              {errors.subject && (
                <p className="mt-1.5 text-sm text-red-600">{errors.subject.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Mức độ ưu tiên <span className="text-red-500">*</span>
              </label>
              <RadioGroup
                value={watch('priority')}
                onValueChange={(value) => setValue('priority', value as 'low' | 'normal' | 'high')}
                className="flex flex-col space-y-3"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="low" id="low" />
                  <label htmlFor="low" className="text-sm text-gray-700">Thấp</label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="normal" id="normal" />
                  <label htmlFor="normal" className="text-sm text-gray-700">Bình thường</label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="high" id="high" />
                  <label htmlFor="high" className="text-sm text-gray-700">Cao</label>
                </div>
              </RadioGroup>
              {errors.priority && (
                <p className="mt-1.5 text-sm text-red-600">{errors.priority.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">
                Nội dung <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('message')}
                id="message"
                rows={4}
                className="block w-full rounded-md border-0 py-2.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                placeholder="Vui lòng mô tả chi tiết vấn đề hoặc yêu cầu của bạn..."
              />
              {errors.message && (
                <p className="mt-1.5 text-sm text-red-600">{errors.message.message}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-3 pt-2">
              <Checkbox 
                id="newsletter" 
                checked={watch('newsletter')}
                onCheckedChange={(checked) => setValue('newsletter', checked as boolean)}
              />
              <label
                htmlFor="newsletter"
                className="text-sm text-gray-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Đăng ký nhận thông tin khuyến mãi qua email
              </label>
            </div>
          </div>
          
          <div className="flex space-x-4 pt-4">
            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
              {isSubmitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
            </Button>
            
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="lg" className="w-full sm:w-auto">
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
      
      <ToastComponent />
    </>
  );
} 