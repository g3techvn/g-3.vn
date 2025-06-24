'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

// Import checkout components
import BuyerInfo from '@/components/store/BuyerInfo';
import PaymentMethodSelection from '@/components/store/PaymentMethodSelection';
import OrderSummary from '@/components/store/OrderSummary';
import VoucherInfo from '@/components/store/VoucherInfo';
import RewardPoints from '@/components/store/RewardPoints';
import ProductList from '@/components/store/ProductList';
import CollapsibleSection from '@/components/store/CollapsibleSection';
import ProfileDrawer from '@/components/store/ProfileDrawer';
import LocationSelector from '@/components/features/cart/LocationSelector';
import { Voucher } from '@/types/cart';

// Types
interface Order {
  id: string;
  user_id: string | null;
  full_name: string;
  phone: string;
  email?: string | null;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled';
  total_price: number;
  payment_method: string;
  address: string;
  note?: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  total_price: number;
  product_image?: string;
}

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  cityCode: number;
  district: string;
  districtCode: number;
  ward: string;
  wardCode: number;
  note: string;
  paymentMethod: string;
  voucher: string;
  rewardPoints: number;
  status: string;
  total_price: number;
  items: OrderItem[];
}

interface NewOrderItem {
  product_name: string;
  quantity: number;
  price: number;
  product_image?: string;
}

const ORDER_STATUSES = [
  { value: 'pending', label: 'Chờ xử lý', color: 'yellow' },
  { value: 'processing', label: 'Đang xử lý', color: 'blue' },
  { value: 'shipped', label: 'Đã gửi hàng', color: 'indigo' },
  { value: 'delivered', label: 'Đã giao hàng', color: 'green' },
  { value: 'canceled', label: 'Đã hủy', color: 'red' },
];

const PAYMENT_METHODS = [
  { value: 'cod', label: 'Thanh toán khi nhận hàng' },
  { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng' },
];

export function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Order items state
  const [newItem, setNewItem] = useState<NewOrderItem>({
    product_name: '',
    quantity: 1,
    price: 0,
    product_image: '',
  });
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    cityCode: 0,
    district: '',
    districtCode: 0,
    ward: '',
    wardCode: 0,
    note: '',
    paymentMethod: 'cod',
    voucher: '',
    rewardPoints: 0,
    status: 'pending',
    total_price: 0,
    items: [],
  });
  
  // Additional states for checkout-like functionality
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [useRewardPoints, setUseRewardPoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [rewardPointsData, setRewardPointsData] = useState({
    available: 0,
    pointValue: 1000,
    minPointsToRedeem: 100,
    maxPointsPerOrder: 500
  });
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 'cod',
      code: 'cod',
      name: 'Thanh toán khi nhận hàng',
      icon: 'cod',
      description: 'Thanh toán tiền mặt khi nhận hàng'
    },
    {
      id: 'bank_transfer',
      code: 'bank_transfer',
      name: 'Chuyển khoản ngân hàng',
      icon: 'bank',
      description: 'Chuyển khoản qua tài khoản ngân hàng'
    }
  ]);
  const [showPaymentDrawer, setShowPaymentDrawer] = useState(false);
  const [showVoucherDrawer, setShowVoucherDrawer] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Location selection state
  interface LocationSelection {
    provinceCode: number;
    provinceName: string;
    districtCode: number;
    districtName: string;
    wardCode: number;
    wardName: string;
  }
  
  const [selectedLocation, setSelectedLocation] = useState<LocationSelection>({
    provinceCode: 0,
    provinceName: '',
    districtCode: 0,
    districtName: '',
    wardCode: 0,
    wardName: ''
  });

  // Fetch orders
  const fetchOrders = async (page = 1, search = '', status = 'all') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(status !== 'all' && { status }),
      });

      const response = await fetch(`/api/admin/orders?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setOrders(data.orders || []);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        console.error('Error fetching orders:', data.error);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add item to order
  const addItem = () => {
    if (!newItem.product_name || newItem.quantity <= 0 || newItem.price <= 0) {
      alert('Vui lòng điền đầy đủ thông tin sản phẩm');
      return;
    }
    
    const item: OrderItem = {
      id: Date.now().toString(), // Temporary ID for new items
      order_id: '',
      product_id: Date.now(), // Temporary product_id
      product_name: newItem.product_name,
      quantity: newItem.quantity,
      price: newItem.price,
      total_price: newItem.quantity * newItem.price,
      product_image: newItem.product_image,
    };
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, item],
      total_price: prev.total_price + item.total_price,
    }));
    
    // Reset new item form
    setNewItem({
      product_name: '',
      quantity: 1,
      price: 0,
      product_image: '',
    });
  };
  
  // Remove item from order
  const removeItem = (itemId: string) => {
    const item = formData.items.find(i => i.id === itemId);
    if (item) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter(i => i.id !== itemId),
        total_price: prev.total_price - item.total_price,
      }));
    }
  };
  
  // Update item in order
  const updateItem = (itemId: string, updates: Partial<OrderItem>) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, ...updates };
          updatedItem.total_price = updatedItem.quantity * updatedItem.price;
          return updatedItem;
        }
        return item;
      }),
    }));
    
    // Recalculate total
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        total_price: prev.items.reduce((sum, item) => sum + item.total_price, 0),
      }));
    }, 0);
  };

  // Create order
  const createOrder = async () => {
    try {
      // Validate that order has items
      if (formData.items.length === 0) {
        alert('Vui lòng thêm ít nhất một sản phẩm vào đơn hàng');
        return;
      }

      // Create order data similar to checkout
      const orderData = {
        user_id: null, // Admin created order
        buyer_info: {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email
        },
        shipping_info: {
          address: formData.address,
          ward: formData.ward,
          district: formData.district,
          city: formData.city,
          note: formData.note
        },
        payment_method: formData.paymentMethod,
        cart_items: formData.items.map(item => ({
          id: item.product_id.toString(),
          name: item.product_name,
          price: item.price,
          quantity: item.quantity,
          image: item.product_image || ''
        })),
        total_price: formData.total_price,
        shipping_fee: 0,
        is_buy_now: false
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        await fetchOrders(currentPage, searchTerm, statusFilter);
        setIsModalOpen(false);
        resetForm();
      } else {
        console.error('Error creating order:', data.error);
        alert('Có lỗi xảy ra khi tạo đơn hàng: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Có lỗi xảy ra khi tạo đơn hàng');
    }
  };

  // Update order
  const updateOrder = async () => {
    if (!editingOrder) return;
    
    try {
      const response = await fetch(`/api/admin/orders/${editingOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        await fetchOrders(currentPage, searchTerm, statusFilter);
        setIsModalOpen(false);
        setEditingOrder(null);
        resetForm();
      } else {
        console.error('Error updating order:', data.error);
        alert('Có lỗi xảy ra khi cập nhật đơn hàng: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Có lỗi xảy ra khi cập nhật đơn hàng');
    }
  };

  // Delete order
  const deleteOrder = async (orderId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) return;
    
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchOrders(currentPage, searchTerm, statusFilter);
      } else {
        const data = await response.json();
        console.error('Error deleting order:', data.error);
        alert('Có lỗi xảy ra khi xóa đơn hàng: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Có lỗi xảy ra khi xóa đơn hàng');
    }
  };

  // Get order details
  const getOrderDetails = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`);
      const data = await response.json();
      
      if (response.ok) {
        setSelectedOrder(data.order);
        setIsDetailModalOpen(true);
      } else {
        console.error('Error fetching order details:', data.error);
        alert('Có lỗi xảy ra khi tải chi tiết đơn hàng: ' + data.error);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      alert('Có lỗi xảy ra khi tải chi tiết đơn hàng');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      cityCode: 0,
      district: '',
      districtCode: 0,
      ward: '',
      wardCode: 0,
      note: '',
      paymentMethod: 'cod',
      voucher: '',
      rewardPoints: 0,
      status: 'pending',
      total_price: 0,
      items: [],
    });
  };

  // Handle form input change
  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Open edit modal
  const openEditModal = (order: Order) => {
    setEditingOrder(order);
    setFormData({
      fullName: order.full_name,
      phone: order.phone,
      email: order.email || '',
      address: order.address,
      city: '',
      cityCode: 0,
      district: '',
      districtCode: 0,
      ward: '',
      wardCode: 0,
      note: order.note || '',
      paymentMethod: order.payment_method,
      voucher: '',
      rewardPoints: 0,
      status: order.status,
      total_price: order.total_price,
      items: order.order_items || [],
    });
    setIsModalOpen(true);
  };

  // Open create modal
  const openCreateModal = () => {
    setEditingOrder(null);
    resetForm();
    setIsModalOpen(true);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders(1, searchTerm, statusFilter);
  };

  // Handle filter change
  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
    fetchOrders(1, searchTerm, status);
  };

  // Get status badge color
  const getStatusBadgeVariant = (status: string): "default" | "success" | "warning" | "error" | "info" | undefined => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'shipped': return 'info';
      case 'delivered': return 'success';
      case 'canceled': return 'error';
      default: return 'default';
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    const statusConfig = ORDER_STATUSES.find(s => s.value === status);
    return statusConfig?.label || status;
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchOrders(page, searchTerm, statusFilter);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + '₫';
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Completion check functions (giống checkout)
  const isBuyerInfoCompleted = () => {
    return !!formData.fullName && !!formData.phone;
  };

  const isShippingInfoCompleted = () => {
    return !!formData.address && !!formData.city;
  };

  const isPaymentMethodCompleted = () => {
    return !!formData.paymentMethod;
  };

  // Handle form change (giống checkout)
  const handleFormChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Profile functions (placeholder)
  const openProfile = () => {
    setIsProfileOpen(true);
  };

  const closeProfile = () => {
    setIsProfileOpen(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header with search and filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, email, SĐT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent w-full"
                />
              </div>
              <Button type="submit" variant="outline" size="sm">
                Tìm kiếm
              </Button>
            </form>

            {/* Status filter */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">Tất cả trạng thái</option>
                {ORDER_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Add button */}
            <Button onClick={openCreateModal}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Thêm đơn hàng
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã đơn hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                      <span className="ml-2">Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(order.total_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => getOrderDetails(order.id)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(order)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteOrder(order.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Trang <span className="font-medium">{currentPage}</span> trong{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-r-none"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="rounded-none"
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-l-none"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Create/Edit Modal với layout checkout */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOrder ? 'Sửa đơn hàng' : 'Thêm đơn hàng mới'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-12 gap-8">
            {/* Left column - Forms giống checkout */}
            <div className="col-span-8 space-y-6">
              <CollapsibleSection
                title="Thông tin người mua"
                stepNumber={1}
                isCompleted={!!formData.fullName && !!formData.phone}
                defaultOpen={true}
              >
                <BuyerInfo
                  formData={{
                    fullName: formData.fullName,
                    phone: formData.phone,
                    email: formData.email
                  }}
                  setFormData={(info) => {
                    if (typeof info === 'function') {
                      setFormData(prev => {
                        const newBuyerInfo = info({
                          fullName: prev.fullName,
                          phone: prev.phone,
                          email: prev.email
                        });
                        return {
                          ...prev,
                          ...newBuyerInfo
                        };
                      });
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        ...info
                      }));
                    }
                  }}
                  showDrawer={false}
                  setShowDrawer={() => {}}
                />
              </CollapsibleSection>

              <CollapsibleSection
                title="Thông tin giao hàng"
                stepNumber={2}
                isCompleted={!!formData.address && !!formData.city}
                defaultOpen={true}
              >
                <LocationSelector
                  selectedProvinceCode={selectedLocation.provinceCode}
                  selectedDistrictCode={selectedLocation.districtCode}
                  selectedWardCode={selectedLocation.wardCode}
                  onProvinceChange={(code, name) => {
                    setSelectedLocation(prev => ({
                      ...prev,
                      provinceCode: code,
                      provinceName: name,
                      districtCode: 0,
                      districtName: '',
                      wardCode: 0,
                      wardName: ''
                    }));
                    setFormData(prev => ({
                      ...prev,
                      city: name,
                      cityCode: code,
                      district: '',
                      districtCode: 0,
                      ward: '',
                      wardCode: 0
                    }));
                  }}
                  onDistrictChange={(code, name) => {
                    setSelectedLocation(prev => ({
                      ...prev,
                      districtCode: code,
                      districtName: name,
                      wardCode: 0,
                      wardName: ''
                    }));
                    setFormData(prev => ({
                      ...prev,
                      district: name,
                      districtCode: code,
                      ward: '',
                      wardCode: 0
                    }));
                  }}
                  onWardChange={(code, name) => {
                    setSelectedLocation(prev => ({
                      ...prev,
                      wardCode: code,
                      wardName: name
                    }));
                    setFormData(prev => ({
                      ...prev,
                      ward: name,
                      wardCode: code
                    }));
                  }}
                />
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ chi tiết *
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Nhập số nhà, tên đường..."
                    required
                  />
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Ghi chú thêm về đơn hàng..."
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Phương thức thanh toán"
                stepNumber={3}
                isCompleted={!!formData.paymentMethod}
                defaultOpen={true}
              >
                <PaymentMethodSelection
                  showPaymentDrawer={showPaymentDrawer}
                  setShowPaymentDrawer={setShowPaymentDrawer}
                  selectedPayment={formData.paymentMethod}
                  setSelectedPayment={(method) => setFormData(prev => ({ ...prev, paymentMethod: method }))}
                  paymentMethods={paymentMethods}
                />
              </CollapsibleSection>

              <CollapsibleSection
                title="Trạng thái đơn hàng"
                stepNumber={4}
                isCompleted={!!formData.status}
                defaultOpen={true}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  >
                    {ORDER_STATUSES.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </CollapsibleSection>
            </div>

            {/* Right column - Product management và Order summary */}
            <div className="col-span-4">
              <div className="bg-white p-4 rounded-lg sticky top-4 space-y-6">
                {/* Add new item form */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Thêm sản phẩm</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Tên sản phẩm"
                      value={newItem.product_name}
                      onChange={(e) => setNewItem(prev => ({ ...prev, product_name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Số lượng"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        min="1"
                      />
                      <input
                        type="number"
                        placeholder="Giá"
                        value={newItem.price}
                        onChange={(e) => setNewItem(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                    <Button onClick={addItem} className="w-full">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Thêm sản phẩm
                    </Button>
                  </div>
                </div>

                {/* Product List giống checkout */}
                <ProductList
                  items={formData.items.map(item => ({
                    id: item.id,
                    name: item.product_name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.product_image || ''
                  }))}
                  loading={false}
                  onUpdateQuantity={(itemId, newQuantity) => {
                    updateItem(itemId, { quantity: newQuantity });
                  }}
                  onRemoveItem={(itemId) => {
                    removeItem(itemId);
                  }}
                  readOnly={false}
                />

                {/* Order Summary */}
                <OrderSummary
                  items={formData.items.map(item => ({
                    id: item.id,
                    name: item.product_name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.product_image || ''
                  }))}
                  selectedVoucher={selectedVoucher}
                  pointsToUse={useRewardPoints ? pointsToUse : 0}
                  totalPrice={formData.items.reduce((sum, item) => sum + item.total_price, 0)}
                />

                {/* Action buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={editingOrder ? updateOrder : createOrder}
                    className="w-full"
                    size="lg"
                    disabled={formData.items.length === 0}
                  >
                    {editingOrder ? 'Cập nhật đơn hàng' : 'Tạo đơn hàng'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full"
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            {selectedOrder && (
              <div className="flex items-center justify-between">
                <DialogTitle>
                  Chi tiết đơn hàng #{selectedOrder.id}
                </DialogTitle>
                <Badge variant={getStatusBadgeVariant(selectedOrder.status)}>
                  {getStatusLabel(selectedOrder.status)}
                </Badge>
              </div>
            )}
          </DialogHeader>
          
          {selectedOrder && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-3">Thông tin khách hàng</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Họ tên:</span> {selectedOrder.full_name}</p>
                    <p><span className="font-medium">Điện thoại:</span> {selectedOrder.phone}</p>
                    {selectedOrder.email && (
                      <p><span className="font-medium">Email:</span> {selectedOrder.email}</p>
                    )}
                    <p><span className="font-medium">Địa chỉ:</span> {selectedOrder.address}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Thông tin đơn hàng</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Tổng tiền:</span> {formatCurrency(selectedOrder.total_price)}</p>
                    <p><span className="font-medium">Thanh toán:</span> {PAYMENT_METHODS.find(p => p.value === selectedOrder.payment_method)?.label}</p>
                    <p><span className="font-medium">Ngày tạo:</span> {formatDate(selectedOrder.created_at)}</p>
                    <p><span className="font-medium">Cập nhật:</span> {formatDate(selectedOrder.updated_at)}</p>
                    {selectedOrder.note && (
                      <p><span className="font-medium">Ghi chú:</span> {selectedOrder.note}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Sản phẩm trong đơn hàng</h3>
                  <div className="space-y-3">
                    {selectedOrder.order_items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                        {item.product_image && (
                          <Image
                            src={item.product_image}
                            alt={item.product_name}
                            width={60}
                            height={60}
                            className="rounded object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product_name}</h4>
                          <p className="text-sm text-gray-600">
                            Số lượng: {item.quantity} × {formatCurrency(item.price)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(item.total_price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  Đóng
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Profile Drawer */}
      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={closeProfile}
      />
    </div>
  );
} 