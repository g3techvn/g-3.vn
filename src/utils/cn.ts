import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Kết hợp clsx và tailwind-merge để tạo class names
 * Cho phép ghi đè các class tailwind mà không bị xung đột
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 