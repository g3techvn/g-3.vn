import { z } from 'zod';

// Validation schema cho thông tin người mua
export const BuyerInfoSchema = z.object({
  fullName: z.string()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(50, 'Họ tên không được vượt quá 50 ký tự')
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, 'Họ tên chỉ được chứa chữ cái và dấu cách'),
  phone: z.string()
    .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ').optional(),
});

// Validation schema cho thông tin giao hàng
export const ShippingInfoSchema = z.object({
  address: z.string()
    .min(10, 'Địa chỉ phải có ít nhất 10 ký tự')
    .max(200, 'Địa chỉ không được vượt quá 200 ký tự'),
  ward: z.string().min(1, 'Vui lòng chọn phường/xã'),
  district: z.string().min(1, 'Vui lòng chọn quận/huyện'),
  city: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố'),
  notes: z.string().max(500, 'Ghi chú không được vượt quá 500 ký tự').optional(),
});

// Validation schema cho cart item
export const CartItemSchema = z.object({
  id: z.string().min(1, 'ID sản phẩm không được để trống'),
  name: z.string().min(1, 'Tên sản phẩm không được để trống'),
  price: z.number().positive('Giá sản phẩm phải lớn hơn 0'),
  quantity: z.number()
    .int('Số lượng phải là số nguyên')
    .min(1, 'Số lượng phải ít nhất là 1')
    .max(100, 'Số lượng không được vượt quá 100'),
  image: z.string().url('URL hình ảnh không hợp lệ').optional(),
  variant: z.object({
    id: z.number(),
    color: z.string().optional(),
    size: z.string().optional(),
    gac_chan: z.boolean().optional(),
  }).optional(),
});

// Validation schema cho voucher
export const VoucherSchema = z.object({
  code: z.string().min(1, 'Mã voucher không được để trống'),
  discountAmount: z.number()
    .min(0, 'Số tiền giảm giá không thể âm')
    .max(10000000, 'Số tiền giảm giá quá lớn'),
  discountType: z.enum(['fixed', 'percentage'], {
    errorMap: () => ({ message: 'Loại giảm giá không hợp lệ' })
  }),
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
  voucher: VoucherSchema.nullable(),
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
  sector_id: z.string().optional(),
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