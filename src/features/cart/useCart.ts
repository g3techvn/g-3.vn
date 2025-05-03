import { useState, useEffect } from 'react';
import { 
  useQuery, 
  useMutation, 
  useQueryClient 
} from '@tanstack/react-query';
import { Product } from '@/types';

type CartItem = {
  productId: string;
  quantity: number;
  product: Product;
};

// Lưu giỏ hàng vào localStorage
const saveCart = (items: CartItem[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(items));
  }
};

// Đọc giỏ hàng từ localStorage
const loadCart = (): CartItem[] => {
  if (typeof window !== 'undefined') {
    try {
      const cart = localStorage.getItem('cart');
      return cart ? JSON.parse(cart) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  }
  return [];
};

export function useCart() {
  const queryClient = useQueryClient();
  const [isReady, setIsReady] = useState(false);

  // Đảm bảo chỉ load cart từ localStorage khi ở client-side
  useEffect(() => {
    setIsReady(true);
  }, []);

  // Query để lấy dữ liệu giỏ hàng
  const { data: cart = [] } = useQuery({
    queryKey: ['cart'],
    queryFn: loadCart,
    enabled: isReady,
    initialData: [],
  });

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = useMutation({
    mutationFn: async (params: { product: Product; quantity: number }) => {
      const { product, quantity } = params;
      const newCart = [...cart];
      const existingItemIndex = newCart.findIndex(
        (item) => item.productId === product.id
      );

      if (existingItemIndex >= 0) {
        // Đã có sản phẩm, tăng số lượng
        newCart[existingItemIndex].quantity += quantity;
      } else {
        // Chưa có sản phẩm, thêm mới
        newCart.push({
          productId: product.id,
          quantity,
          product,
        });
      }

      saveCart(newCart);
      return Promise.resolve(newCart);
    },
    onSuccess: (newCart) => {
      queryClient.setQueryData(['cart'], newCart);
    },
  });

  // Cập nhật số lượng sản phẩm
  const updateQuantity = useMutation({
    mutationFn: async (params: { productId: string; quantity: number }) => {
      const { productId, quantity } = params;
      const newCart = [...cart];
      const existingItemIndex = newCart.findIndex(
        (item) => item.productId === productId
      );

      if (existingItemIndex >= 0) {
        if (quantity <= 0) {
          // Nếu số lượng <= 0, xóa sản phẩm
          newCart.splice(existingItemIndex, 1);
        } else {
          // Cập nhật số lượng
          newCart[existingItemIndex].quantity = quantity;
        }
      }

      saveCart(newCart);
      return Promise.resolve(newCart);
    },
    onSuccess: (newCart) => {
      queryClient.setQueryData(['cart'], newCart);
    },
  });

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = useMutation({
    mutationFn: async (productId: string) => {
      const newCart = cart.filter((item) => item.productId !== productId);
      saveCart(newCart);
      return Promise.resolve(newCart);
    },
    onSuccess: (newCart) => {
      queryClient.setQueryData(['cart'], newCart);
    },
  });

  // Xóa toàn bộ giỏ hàng
  const clearCart = useMutation({
    mutationFn: async () => {
      saveCart([]);
      return Promise.resolve([]);
    },
    onSuccess: (emptyCart) => {
      queryClient.setQueryData(['cart'], emptyCart);
    },
  });

  // Tính tổng số sản phẩm
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  // Tính tổng tiền
  const totalPrice = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  return {
    cart,
    addToCart: (product: Product, quantity = 1) =>
      addToCart.mutate({ product, quantity }),
    updateQuantity: (productId: string, quantity: number) =>
      updateQuantity.mutate({ productId, quantity }),
    removeFromCart: (productId: string) => removeFromCart.mutate(productId),
    clearCart: () => clearCart.mutate(),
    totalItems,
    totalPrice,
    isLoading: addToCart.isPending || updateQuantity.isPending || removeFromCart.isPending || clearCart.isPending,
  };
} 