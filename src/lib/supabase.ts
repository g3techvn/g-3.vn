import { createClient } from '@supabase/supabase-js';

// Lấy URL và key từ biến môi trường
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Kiểm tra biến môi trường
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
  );
}

// Tạo client cho server components/API routes
export const createServerClient = () => {
  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        fetch: (url, options = {}) => {
          return fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              'User-Agent': 'g3-vn-app',
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${supabaseAnonKey}`,
            },
          });
        },
      },
    });
  } catch (error) {
    console.error('Error creating Supabase server client:', error);
    throw error;
  }
};

// Singleton browser client instance
let browserClient: ReturnType<typeof createClient> | null = null;

// Tạo client cho client components (browser)
export const createBrowserClient = () => {
  if (typeof window !== 'undefined') {
    // Only create the client once in the browser environment
    if (!browserClient) {
      try {
        browserClient = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            storageKey: 'supabase-auth',
          },
          global: {
            fetch: (url, options = {}) => {
              return fetch(url, {
                ...options,
                headers: {
                  ...options.headers,
                  'User-Agent': 'g3-vn-app',
                },
              }).catch((error) => {
                console.error('Network error:', error);
                throw new Error('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.');
              });
            },
          },
        });
      } catch (error) {
        console.error('Error creating Supabase browser client:', error);
        throw new Error('Lỗi khởi tạo kết nối. Vui lòng tải lại trang.');
      }
    }
    return browserClient;
  }
  
  // For SSR, create a new instance that won't be persisted
  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (error) {
    console.error('Error creating Supabase SSR client:', error);
    throw error;
  }
}; 