/**
 * API client cho ứng dụng
 * Tập trung hóa các API calls để sử dụng với React Query
 */

// Định nghĩa các URL endpoints
const API_ENDPOINTS = {
  CATEGORIES: '/api/categories',
  NEW_PRODUCTS: '/api/new-products',
  FEATURED_PRODUCTS: '/api/featured-products',
  BLOG_POSTS: '/api/blog-posts',
  CAROUSEL: '/api/carousel',
  PRODUCT_TABS: '/api/product-tabs',
  COMBO_PRODUCTS: '/api/combo-products',
  PRODUCTS: '/api/products',
};

// Client để gọi API
class ApiClient {
  async get(url: string) {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching from ${url}:`, error);
      throw error;
    }
  }

  async post(url: string, data: Record<string, unknown>) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error posting to ${url}:`, error);
      throw error;
    }
  }
}

// Export instance để sử dụng
export const apiClient = new ApiClient();
export { API_ENDPOINTS }; 