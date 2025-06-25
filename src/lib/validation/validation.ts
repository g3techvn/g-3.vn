import { z } from 'zod';

// Validation schema cho thông tin người mua
export const BuyerInfoSchema = z.object({
  fullName: z.string()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(50, 'Họ tên không được vượt quá 50 ký tự')
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, 'Họ tên chỉ được chứa chữ cái và dấu cách'),
  phone: z.string()
    .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không hợp lệ (VD: 0901234567 hoặc +84901234567)'),
  email: z.union([
    z.string().email('Email không hợp lệ'),
    z.string().length(0)
  ]).optional().transform(val => val === '' ? undefined : val),
});

// Validation schema cho thông tin giao hàng
export const ShippingInfoSchema = z.object({
  address: z.string()
    .min(5, 'Địa chỉ phải có ít nhất 5 ký tự') // Reduced from 10 to 5
    .max(200, 'Địa chỉ không được vượt quá 200 ký tự'),
  ward: z.string().min(1, 'Vui lòng chọn phường/xã'),
  district: z.string().min(1, 'Vui lòng chọn quận/huyện'),
  city: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố'),
  note: z.string().optional().transform(val => val === '' ? undefined : val),
});

// Validation schema for cart item
export const CartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(100, 'Quantity cannot exceed 100'),
  product: z.object({
    id: z.string().min(1, 'Product ID is required'),
    name: z.string().min(1, 'Product name is required'),
    price: z.number().positive('Product price must be greater than 0'),
    original_price: z.number().optional(),
    image: z.string().optional(),
    variant: z.object({
      id: z.number(),
      color: z.string().nullable().optional(),
      size: z.string().nullable().optional(),
      gac_chan: z.boolean().nullable().optional(),
      price: z.number().optional(),
      original_price: z.number().optional(),
      image_url: z.string().optional(),
    }).optional()
  })
});

// Validation schema cho voucher - made more flexible
export const VoucherSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  code: z.string().min(1, 'Mã voucher không được để trống'),
  title: z.string().optional(),
  description: z.string().optional(),
  discountAmount: z.number()
    .min(0, 'Số tiền giảm giá không thể âm')
    .max(10000000, 'Số tiền giảm giá quá lớn'),
  discountType: z.enum(['fixed', 'percentage'], {
    errorMap: () => ({ message: 'Loại giảm giá không hợp lệ' })
  }).optional().default('fixed'),
  minOrderValue: z.number().optional(),
  expiryDate: z.string().optional(),
}).optional();

// Validation schema cho orders
export const CreateOrderSchema = z.object({
  user_id: z.string().nullable().optional(),
  buyer_info: BuyerInfoSchema,
  shipping_info: ShippingInfoSchema,
  payment_method: z.enum(['cod', 'bank_transfer'], {
    errorMap: () => ({ message: 'Phương thức thanh toán không hợp lệ' })
  }),
  cart_items: z.array(CartItemSchema)
    .min(1, 'Giỏ hàng không được để trống')
    .max(50, 'Giỏ hàng không được vượt quá 50 sản phẩm'),
  voucher: VoucherSchema.nullable().optional(),
  reward_points: z.number()
    .int('Điểm thưởng phải là số nguyên')
    .min(0, 'Điểm thưởng không thể âm')
    .max(1000000, 'Điểm thưởng quá lớn')
    .optional()
    .default(0),
  total_price: z.number()
    .positive('Tổng tiền phải lớn hơn 0')
    .max(1000000000, 'Tổng tiền quá lớn'),
  shipping_fee: z.number()
    .min(0, 'Phí giao hàng không thể âm')
    .max(1000000, 'Phí giao hàng quá lớn')
    .optional()
    .default(0),
});

// Validation schema cho query parameters
export const ProductQuerySchema = z.object({
  category_id: z.string().optional(),
  brand_id: z.string().optional(),
  sort: z.enum(['price:asc', 'price:desc', 'name:asc', 'name:desc', 'created_at:asc', 'created_at:desc'])
    .optional(),
  page: z.coerce.number()
    .int('Page phải là số nguyên')
    .min(1, 'Page phải lớn hơn 0')
    .max(1000, 'Page không được vượt quá 1000')
    .optional()
    .default(1),
  limit: z.coerce.number()
    .int('Limit phải là số nguyên')
    .min(1, 'Limit phải lớn hơn 0')
    .max(100, 'Limit không được vượt quá 100')
    .optional()
    .default(20),
});

// Helper function để validate request body
export function validateRequestBody<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
      };
    }
    return {
      success: false,
      errors: ['Dữ liệu không hợp lệ'],
    };
  }
}

// Helper function để validate query parameters
export function validateQueryParams<T>(schema: z.ZodSchema<T>, params: URLSearchParams): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  try {
    const paramsObject = Object.fromEntries(params.entries());
    const validatedData = schema.parse(paramsObject);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
      };
    }
    return {
      success: false,
      errors: ['Query parameters không hợp lệ'],
    };
  }
}

// Validation schema cho user registration
export const UserRegistrationSchema = z.object({
  email: z.string()
    .email('Email không hợp lệ')
    .min(1, 'Email không được để trống'),
  password: z.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số'),
  full_name: z.string()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(50, 'Họ tên không được vượt quá 50 ký tự')
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, 'Họ tên chỉ được chứa chữ cái và dấu cách'),
  phone: z.string()
    .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không hợp lệ (VD: 0901234567 hoặc +84901234567)')
    .min(1, 'Số điện thoại là bắt buộc')
}); 