'use client'

import { ArrowLeftIcon, XMarkIcon, UserIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, PencilSquareIcon, CreditCardIcon } from '@heroicons/react/24/outline'
import { useState, useEffect, useCallback } from 'react'
import { Drawer, Divider, Steps, Modal, Button, Table } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { useCart } from '@/context/CartContext'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Define types for location data
interface Ward {
  name: string;
  code: number;
  codename: string;
  division_type: string;
  district_code: number;
}

interface District {
  name: string;
  code: number;
  codename: string;
  division_type: string;
  province_code: number;
  wards?: Ward[];
}

interface Province {
  name: string;
  code: number;
  division_type: string;
  phone_code: number;
  codename: string;
  districts?: District[];
}

export default function Checkout({ 
  isOpen = false, 
  onClose, 
  closeAll 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  closeAll: () => void;
}) {
  const { cartItems, totalPrice } = useCart()
  
  // Location data states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Step form state
  const [currentStep, setCurrentStep] = useState(0);
  
  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState('cod');
  
  // Order details modal state
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
  
  // Debug onClose callback
  useEffect(() => {
    console.log("Checkout component received onClose callback:", onClose);
  }, [onClose]);
  
  // Alternative back button handler 
  const goBack = () => {
    console.log("Alternative back button handler called");
    onClose();
  };
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    note: '',
    // Added for API integration
    provinceCode: 0,
    districtCode: 0,
    wardCode: 0,
    // Payment information
    paymentMethod: 'cod'
  })

  // Fetch provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://provinces.open-api.vn/api/p/');
        if (!response.ok) {
          throw new Error('Failed to fetch provinces');
        }
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchProvinces();
    }
  }, [isOpen]);

  // Fetch districts when province changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!formData.provinceCode) {
        setDistricts([]);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`https://provinces.open-api.vn/api/p/${formData.provinceCode}?depth=2`);
        if (!response.ok) {
          throw new Error('Failed to fetch districts');
        }
        const data = await response.json();
        if (data.districts && Array.isArray(data.districts)) {
          setDistricts(data.districts);
        }
      } catch (error) {
        console.error('Error fetching districts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDistricts();
  }, [formData.provinceCode]);

  // Fetch wards when district changes
  useEffect(() => {
    const fetchWards = async () => {
      if (!formData.districtCode) {
        setWards([]);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`https://provinces.open-api.vn/api/d/${formData.districtCode}?depth=2`);
        if (!response.ok) {
          throw new Error('Failed to fetch wards');
        }
        const data = await response.json();
        if (data.wards && Array.isArray(data.wards)) {
          setWards(data.wards);
        }
      } catch (error) {
        console.error('Error fetching wards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWards();
  }, [formData.districtCode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle special cases for location selects
    if (name === 'provinceCode') {
      const provinceCode = parseInt(value, 10);
      const selectedProvince = provinces.find(p => p.code === provinceCode);
      
      setFormData(prev => ({
        ...prev,
        provinceCode,
        city: selectedProvince ? selectedProvince.name : '',
        // Reset district and ward when province changes
        districtCode: 0,
        district: '',
        wardCode: 0,
        ward: ''
      }));
    } else if (name === 'districtCode') {
      const districtCode = parseInt(value, 10);
      const selectedDistrict = districts.find(d => d.code === districtCode);
      
      setFormData(prev => ({ 
        ...prev,
        districtCode,
        district: selectedDistrict ? selectedDistrict.name : '',
        // Reset ward when district changes
        wardCode: 0,
        ward: ''
      }));
    } else if (name === 'wardCode') {
      const wardCode = parseInt(value, 10);
      const selectedWard = wards.find(w => w.code === wardCode);
      
      setFormData(prev => ({ 
        ...prev,
        wardCode,
        ward: selectedWard ? selectedWard.name : ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }

  // Add a handler for payment method change
  const handlePaymentMethodChange = (method: string) => {
    setFormData(prev => ({ ...prev, paymentMethod: method }));
    setPaymentMethod(method);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Validate form
    if (!isFormValid()) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    // Process checkout
    console.log('Checkout data:', formData)
    // Here you would typically call an API to process the order
    alert('Đặt hàng thành công!')
    // Close both drawers when order is complete
    closeAll();
  }

  // Form validation
  const isFormValid = () => {
    const baseValidation = !!(formData.fullName && formData.phone && formData.address && 
                formData.provinceCode && formData.districtCode && formData.wardCode);
    
    // For the final step, also check if payment method is selected
    if (currentStep === 2) {
      return baseValidation && !!formData.paymentMethod;
    }
    
    return baseValidation;
  }

  // Function to generate PDF from order data
  const generatePDF = () => {
    try {
      // Check if form is filled
      if (!isFormValid()) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      // Create new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        floatPrecision: 16 // For better accuracy in rendering
      });
      
      // Configure fonts
      doc.setFont("helvetica");
      
      // Add title
      doc.setFontSize(20);
      doc.text('ĐƠN HÀNG', 105, 15, { align: 'center' });
      
      // Set normal font size
      doc.setFontSize(12);
      
      // Add customer information section
      doc.text('THÔNG TIN KHÁCH HÀNG:', 14, 30);
      doc.text(`Họ tên: ${formData.fullName || ''}`, 14, 38);
      doc.text(`Số điện thoại: ${formData.phone || ''}`, 14, 46);
      doc.text(`Email: ${formData.email || 'Không có'}`, 14, 54);
      
      // Add address section
      doc.text('ĐỊA CHỈ GIAO HÀNG:', 14, 65);
      doc.text(`${formData.address || ''}`, 14, 73);
      
      const addressDetails = [
        formData.ward && `Phường/Xã: ${formData.ward}`,
        formData.district && `Quận/Huyện: ${formData.district}`,
        formData.city && `Tỉnh/Thành phố: ${formData.city}`
      ].filter(Boolean).join(', ');
      
      doc.text(addressDetails, 14, 81);
      
      // Add payment method
      doc.text('PHƯƠNG THỨC THANH TOÁN:', 14, 89);
      const paymentMethodText = formData.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' :
                               formData.paymentMethod === 'banking' ? 'Chuyển khoản ngân hàng' :
                               'Ví điện tử MoMo';
      doc.text(paymentMethodText, 14, 97);
      
      // Add note if provided
      let startYPosition = 105;
      if (formData.note) {
        doc.text('GHI CHÚ:', 14, startYPosition);
        doc.text(formData.note || '', 14, startYPosition + 8);
        startYPosition += 16;
      }

      // Get current date
      const today = new Date();
      const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
      doc.text(`Ngày đặt: ${dateStr}`, 14, startYPosition);
      startYPosition += 10;
      
      // Safely create table rows with proper formatting
      const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
      
      // Prepare table data with proper UTF-8 encoding
      const tableColumn = ["Sản phẩm", "Số lượng", "Đơn giá", "Thành tiền"];
      const tableRows = safeCartItems.map(item => {
        const name = item.name ? String(item.name) : '';
        const quantity = item.quantity ? String(item.quantity) : '1';
        const price = item.price ? `${item.price.toLocaleString('vi-VN')}₫` : '0₫';
        const total = `${((item.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')}₫`;
        
        return [name, quantity, price, total];
      });
      
      // If we have no items, add a placeholder row
      if (tableRows.length === 0) {
        tableRows.push(['Không có sản phẩm', '', '', '']);
      }

      try {
        // Import the autotable plugin
        import('jspdf-autotable').then(() => {
          try {
            // @ts-expect-error - jspdf-autotable doesn't have proper TypeScript definitions
            doc.autoTable({
              head: [tableColumn],
              body: tableRows,
              startY: startYPosition,
              theme: 'grid',
              styles: { 
                font: 'helvetica',
                fontSize: 10,
                cellPadding: 3,
                overflow: 'linebreak'
              },
              headStyles: { 
                fillColor: [220, 53, 69],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
              },
              columnStyles: {
                0: { cellWidth: 80 },
                1: { cellWidth: 25, halign: 'center' },
                2: { cellWidth: 35, halign: 'right' },
                3: { cellWidth: 35, halign: 'right' }
              },
              margin: { top: 10, right: 14, bottom: 10, left: 14 }
            });
            
            // Add total after the table
            const finalY = (doc as any).lastAutoTable?.finalY + 10 || startYPosition + 50;
            doc.text(`Tổng cộng: ${totalPrice.toLocaleString('vi-VN')}₫`, 195, finalY, { align: 'right' });
            
            // Save the PDF file
            try {
              const fileName = `don-hang-${Date.now()}.pdf`;
              doc.save(fileName);
            } catch (saveError) {
              console.error('Error saving PDF:', saveError);
              alert('Có lỗi khi lưu file PDF. Vui lòng thử lại sau.');
            }
          } catch (innerError) {
            console.error('Error creating table in PDF:', innerError);
            
            // Fallback to a simple version without table if autoTable fails
            createSimplePDF();
          }
        }).catch(importError => {
          console.error('Error importing jspdf-autotable:', importError);
          createSimplePDF();
        });
      } catch (tableError) {
        console.error('Error with autoTable setup:', tableError);
        createSimplePDF();
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Có lỗi khi tạo file PDF. Vui lòng thử lại sau.');
    }
  };
  
  // Fallback simple PDF without tables
  const createSimplePDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      doc.setFont("helvetica");
      doc.setFontSize(16);
      doc.text('ĐƠN HÀNG', 105, 15, { align: 'center' });
      
      doc.setFontSize(12);
      
      // Customer info
      doc.text('THÔNG TIN KHÁCH HÀNG:', 14, 30);
      doc.text(`Họ tên: ${formData.fullName || ''}`, 14, 38);
      doc.text(`Số điện thoại: ${formData.phone || ''}`, 14, 46);
      doc.text(`Email: ${formData.email || 'Không có'}`, 14, 54);
      
      // Address
      doc.text('ĐỊA CHỈ GIAO HÀNG:', 14, 65);
      doc.text(`${formData.address || ''}`, 14, 73);
      doc.text(`${formData.ward || ''}, ${formData.district || ''}, ${formData.city || ''}`, 14, 81);
      
      // Payment method
      doc.text('PHƯƠNG THỨC THANH TOÁN:', 14, 89);
      const paymentMethodText = formData.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' :
                               formData.paymentMethod === 'banking' ? 'Chuyển khoản ngân hàng' :
                               'Ví điện tử MoMo';
      doc.text(paymentMethodText, 14, 97);
      
      // Order items as simple text
      doc.text('CHI TIẾT ĐƠN HÀNG:', 14, 110);
      let yPos = 118;
      
      if (cartItems.length > 0) {
        cartItems.forEach((item, index) => {
          doc.text(`${index + 1}. ${item.name || 'Sản phẩm'} - ${item.quantity || 1} x ${(item.price || 0).toLocaleString('vi-VN')}₫ = ${((item.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')}₫`, 14, yPos);
          yPos += 8;
        });
      } else {
        doc.text('Không có sản phẩm', 14, yPos);
        yPos += 8;
      }
      
      // Total
      doc.text(`Tổng cộng: ${totalPrice.toLocaleString('vi-VN')}₫`, 14, yPos + 8);
      
      // Date
      const today = new Date();
      const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
      doc.text(`Ngày đặt: ${dateStr}`, 14, yPos + 16);
      
      // Save the PDF file
      const fileName = `don-hang-${Date.now()}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating simple PDF:', error);
      alert('Không thể tạo PDF. Vui lòng thử lại sau.');
    }
  };

  // Next step in form
  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Previous step in form
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Show order details modal
  const showOrderDetailsModal = () => {
    if (!isFormValid()) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    setIsOrderDetailsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsOrderDetailsModalOpen(false);
  };
  
  // Generate PDF from modal
  const generatePDFFromModal = () => {
    generatePDF();
    // Keep modal open so they can see it was successful
  };

  // Custom title component with back button and close button on the right
  const TitleWithButtons = (
    <div className="flex w-full justify-between items-center">
      <div className="flex items-center">
        <button
          type="button"
          onClick={goBack}
          className="mr-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center"
        >
          <ArrowLeftIcon aria-hidden="true" className="size-4 mr-1" />
          <span>Quay lại</span>
        </button>
        <span className="text-lg font-medium">Thông tin thanh toán</span>
      </div>
      <XMarkIcon 
        className="size-6 cursor-pointer text-gray-500 hover:text-gray-700"
        onClick={closeAll}
      />
    </div>
  );

  // Early return if not open
  if (!isOpen) return null;

  // Form steps
  const steps = [
    {
      title: 'Thông tin cá nhân',
      content: (
        <div className="space-y-4 pt-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <UserIcon className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-md font-medium text-gray-700">Thông tin cá nhân</h3>
            </div>
            <div className="mb-4">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                    placeholder="0912345678"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                    placeholder="example@gmail.com"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-right">
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      ),
    },
    {
      title: 'Địa chỉ giao hàng',
      content: (
        <div className="space-y-4 pt-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <MapPinIcon className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-md font-medium text-gray-700">Địa chỉ giao hàng</h3>
            </div>
            
            <div className="mb-4">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Địa chỉ chi tiết <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                placeholder="Số nhà, tên đường..."
              />
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="provinceCode" className="block text-sm font-medium text-gray-700">
                  Tỉnh/Thành phố <span className="text-red-500">*</span>
                </label>
                <select
                  id="provinceCode"
                  name="provinceCode"
                  value={formData.provinceCode || ''}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                >
                  <option value="">Chọn tỉnh/thành</option>
                  {provinces.map((province) => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="districtCode" className="block text-sm font-medium text-gray-700">
                    Quận/Huyện <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="districtCode"
                    name="districtCode"
                    value={formData.districtCode || ''}
                    onChange={handleChange}
                    required
                    disabled={!formData.provinceCode}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Chọn quận/huyện</option>
                    {districts.map((district) => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="wardCode" className="block text-sm font-medium text-gray-700">
                    Phường/Xã <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="wardCode"
                    name="wardCode"
                    value={formData.wardCode || ''}
                    onChange={handleChange}
                    required
                    disabled={!formData.districtCode}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Chọn phường/xã</option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.code}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="note" className="block text-sm font-medium text-gray-700 flex items-center">
                  <PencilSquareIcon className="h-4 w-4 mr-1" />
                  Ghi chú
                </label>
                <textarea
                  id="note"
                  name="note"
                  rows={2}
                  value={formData.note}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                  placeholder="Thông tin thêm về địa chỉ giao hàng..."
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Quay lại
            </button>
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      ),
    },
    {
      title: 'Phương thức thanh toán',
      content: (
        <div className="space-y-4 pt-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <CreditCardIcon className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-md font-medium text-gray-700">Phương thức thanh toán</h3>
            </div>
            
            <div className="space-y-3">
              <label 
                className={`block w-full p-3 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'cod' 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="payment-method"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => handlePaymentMethodChange('cod')}
                    className="mr-3 h-4 w-4 text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <p className="font-medium">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</p>
                  </div>
                </div>
              </label>
              
              <label 
                className={`block w-full p-3 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'banking' 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="payment-method"
                    value="banking"
                    checked={paymentMethod === 'banking'}
                    onChange={() => handlePaymentMethodChange('banking')}
                    className="mr-3 h-4 w-4 text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <p className="font-medium">Chuyển khoản ngân hàng</p>
                    <p className="text-sm text-gray-500">Chuyển khoản trước khi giao hàng</p>
                    {paymentMethod === 'banking' && (
                      <div className="mt-2 p-3 bg-white rounded border border-gray-200 text-sm">
                        <p className="font-medium">Thông tin chuyển khoản:</p>
                        <p>Ngân hàng: VPBank</p>
                        <p>Số tài khoản: 123456789</p>
                        <p>Chủ tài khoản: G3 TECH</p>
                        <p>Nội dung: [Họ tên] - [Số điện thoại]</p>
                      </div>
                    )}
                  </div>
                </div>
              </label>
              
              <label 
                className={`block w-full p-3 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'momo' 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="payment-method"
                    value="momo"
                    checked={paymentMethod === 'momo'}
                    onChange={() => handlePaymentMethodChange('momo')}
                    className="mr-3 h-4 w-4 text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <p className="font-medium">Ví điện tử MoMo</p>
                    <p className="text-sm text-gray-500">Thanh toán qua ví MoMo</p>
                  </div>
                </div>
              </label>
            </div>
          </div>
          
          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Quay lại
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Hoàn tất đơn hàng
            </button>
          </div>
        </div>
      ),
    },
  ];
  
  // Order details modal
  const OrderDetailsModal = () => {
    // Table columns for order items
    const columns = [
      {
        title: 'Sản phẩm',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Số lượng',
        dataIndex: 'quantity',
        key: 'quantity',
        align: 'center' as const,
      },
      {
        title: 'Đơn giá',
        dataIndex: 'price',
        key: 'price',
        align: 'right' as const,
        render: (price: number) => `${price.toLocaleString('vi-VN')}₫`,
      },
      {
        title: 'Thành tiền',
        key: 'total',
        align: 'right' as const,
        render: (record: {price: number, quantity: number}) => `${(record.price * record.quantity).toLocaleString('vi-VN')}₫`,
      },
    ];

    // Get proper payment method text
    const getPaymentMethodText = () => {
      switch(formData.paymentMethod) {
        case 'cod':
          return 'Thanh toán khi nhận hàng (COD)';
        case 'banking':
          return 'Chuyển khoản ngân hàng';
        case 'momo':
          return 'Ví điện tử MoMo';
        default:
          return 'Chưa chọn phương thức thanh toán';
      }
    };

    return (
      <Modal
        title="Chi tiết đơn hàng"
        open={isOrderDetailsModalOpen}
        onCancel={handleModalClose}
        width={700}
        footer={[
          <Button key="pdf" type="primary" onClick={generatePDFFromModal} style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}>
            Tải PDF
          </Button>,
          <Button key="close" onClick={handleModalClose}>
            Đóng
          </Button>,
        ]}
      >
        <div className="space-y-6">
          {/* Customer information */}
          <div>
            <h3 className="text-lg font-medium border-b pb-2 mb-3">Thông tin khách hàng</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Họ tên:</strong> {formData.fullName}</p>
                <p><strong>Số điện thoại:</strong> {formData.phone}</p>
                {formData.email && <p><strong>Email:</strong> {formData.email}</p>}
              </div>
              <div>
                <p><strong>Địa chỉ:</strong> {formData.address}</p>
                <p><strong>Khu vực:</strong> {formData.ward}, {formData.district}, {formData.city}</p>
                {formData.note && <p><strong>Ghi chú:</strong> {formData.note}</p>}
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div>
            <h3 className="text-lg font-medium border-b pb-2 mb-3">Phương thức thanh toán</h3>
            <p>{getPaymentMethodText()}</p>
            {formData.paymentMethod === 'banking' && (
              <div className="mt-2 p-3 bg-gray-50 rounded border text-sm">
                <p className="font-medium">Thông tin chuyển khoản:</p>
                <p>Ngân hàng: VPBank</p>
                <p>Số tài khoản: 123456789</p>
                <p>Chủ tài khoản: G3 TECH</p>
                <p>Nội dung: [Họ tên] - [Số điện thoại]</p>
              </div>
            )}
          </div>

          {/* Order items */}
          <div>
            <h3 className="text-lg font-medium border-b pb-2 mb-3">Sản phẩm</h3>
            <Table 
              dataSource={cartItems.map((item, index) => ({...item, key: index}))} 
              columns={columns} 
              pagination={false}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <strong>Tổng cộng</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <strong className="text-red-600">{totalPrice.toLocaleString('vi-VN')}₫</strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </div>

          {/* Order date */}
          <div className="text-right text-sm text-gray-500">
            Ngày đặt: {new Date().toLocaleDateString('vi-VN')}
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <Drawer
      title={TitleWithButtons}
      placement="right"
      onClose={closeAll}
      open={isOpen}
      width={384}
      className="checkout-drawer"
      closeIcon={null} // Hide default close icon
      mask={true}
      maskClosable={false}
      styles={{
        body: {
          paddingBottom: 80,
          overflow: 'auto',
          padding: '0 16px'
        },
        header: {
          padding: '16px 24px'
        },
        mask: { backgroundColor: 'transparent' } // Make mask transparent
      }}
      footer={
        <div className="border-t border-gray-200 px-4 py-4">
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Tóm tắt đơn hàng</h4>
            {cartItems.length > 0 ? (
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} x {item.quantity}</span>
                    <span>{(item.price * item.quantity).toLocaleString()}₫</span>
                  </div>
                ))}
                <Divider className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Tổng cộng</span>
                  <span className="text-red-600">{totalPrice.toLocaleString()}₫</span>
                </div>
                {formData.paymentMethod && currentStep === 2 && (
                  <div className="text-sm text-gray-600 mt-1">
                    Phương thức: {
                      formData.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' :
                      formData.paymentMethod === 'banking' ? 'Chuyển khoản ngân hàng' :
                      'Ví MoMo'
                    }
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Giỏ hàng trống</p>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={showOrderDetailsModal}
              disabled={!isFormValid()}
              className="flex-1 flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Chi tiết đơn
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={!isFormValid() || currentStep < 2}
              className="flex-1 flex items-center justify-center rounded-md border border-transparent bg-red-600 px-4 py-3 text-sm font-medium text-white shadow-xs hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Đặt hàng
            </button>
          </div>
        </div>
      }
    >
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex justify-center items-center z-10">
          <div className="flex flex-col items-center">
            <LoadingOutlined style={{ fontSize: 24, color: '#dc3545', marginBottom: 8 }} />
            <span className="text-gray-600">Đang tải dữ liệu...</span>
          </div>
        </div>
      )}
      
      <div className="py-4">
        <Steps
          current={currentStep}
          items={[
            {
              title: 'Thông tin',
            },
            {
              title: 'Địa chỉ',
            },
            {
              title: 'Thanh toán',
            }
          ]}
          className="custom-steps"
        />
      </div>
      
      <form className="checkout-form">
        {steps[currentStep].content}
      </form>
      
      {/* Order details modal */}
      <OrderDetailsModal />
    </Drawer>
  )
}
