import dayjs from 'dayjs';
import isString from 'lodash/isString';
import isEmpty from 'lodash/isEmpty';

/**
 * Format giá tiền sang dạng VND
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Format ngày giờ theo định dạng Việt Nam
 */
export const formatDate = (date: string | Date, format = 'DD/MM/YYYY'): string => {
  return dayjs(date).format(format);
};

/**
 * Cắt ngắn text nếu quá dài
 */
export const truncateText = (text: string, maxLength = 100): string => {
  if (!isString(text) || isEmpty(text)) return '';
  
  if (text.length <= maxLength) return text;
  
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Tạo slug từ text
 */
export const slugify = (text: string): string => {
  if (!isString(text) || isEmpty(text)) return '';
  
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
}; 