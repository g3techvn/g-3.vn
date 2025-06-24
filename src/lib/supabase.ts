import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Lấy URL và key từ biến môi trường
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Kiểm tra biến môi trường
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
  );
}

// Singleton browser client instance
let browserClient: SupabaseClient<Database> | null = null;

// Custom storage interface with event handling
interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

// Event to handle auth state changes
const AUTH_CHANGE_EVENT = 'supabase-auth-change';

// Create a custom event dispatcher
const dispatchAuthEvent = (type: 'SIGNED_IN' | 'SIGNED_OUT') => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent(AUTH_CHANGE_EVENT, { detail: { type } });
    window.dispatchEvent(event);
  }
};

// Tạo client cho server components/API routes
export const createServerClient = () => {
  try {
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  } catch (error) {
    console.error('Error creating Supabase server client:', error);
    throw error;
  }
};

// Tạo client cho server components/API routes với service role (admin)
export const createServerAdminClient = () => {
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  try {
    return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  } catch (error) {
    console.error('Error creating Supabase admin client:', error);
    throw error;
  }
};

// Create client for client components (browser)
export const createBrowserClient = () => {
  if (typeof window !== 'undefined') {
    // Only create the client once in the browser environment
    if (!browserClient) {
      try {
        const customStorage: StorageAdapter = {
          getItem: (key: string) => {
            try {
              const item = localStorage.getItem(key);
              return item;
            } catch (error) {
              console.error('Error getting auth item:', error);
              return null;
            }
          },
          setItem: (key: string, value: string) => {
            try {
              localStorage.setItem(key, value);
              // Dispatch event when setting auth token
              if (key === 'sb-auth-token') {
                dispatchAuthEvent('SIGNED_IN');
              }
            } catch (error) {
              console.error('Error setting auth item:', error);
            }
          },
          removeItem: (key: string) => {
            try {
              localStorage.removeItem(key);
              // Dispatch event when removing auth token
              if (key === 'sb-auth-token') {
                dispatchAuthEvent('SIGNED_OUT');
              }
            } catch (error) {
              console.error('Error removing auth item:', error);
            }
          }
        };

        const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            storageKey: 'sb-auth-token',
            storage: customStorage,
            detectSessionInUrl: true,
            flowType: 'pkce'
          }
        });

        // Listen for auth state changes
        client.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN') {
            dispatchAuthEvent('SIGNED_IN');
          } else if (event === 'SIGNED_OUT') {
            dispatchAuthEvent('SIGNED_OUT');
          }
        });

        // Handle storage changes from other tabs
        window.addEventListener('storage', (event) => {
          if (event.key === 'sb-auth-token') {
            if (!event.newValue) {
              dispatchAuthEvent('SIGNED_OUT');
            } else if (event.oldValue !== event.newValue) {
              dispatchAuthEvent('SIGNED_IN');
            }
          }
        });

        browserClient = client;
      } catch (error) {
        console.error('Error creating Supabase browser client:', error);
        throw new Error('Lỗi khởi tạo kết nối. Vui lòng tải lại trang.');
      }
    }
    return browserClient;
  }
  
  // For SSR, create a new instance that won't be persisted
  try {
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  } catch (error) {
    console.error('Error creating Supabase SSR client:', error);
    throw error;
  }
}; 