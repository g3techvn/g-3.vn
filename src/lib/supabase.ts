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
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

// Singleton browser client instance
let browserClient: ReturnType<typeof createClient> | null = null;

// Tạo client cho client components (browser)
export const createBrowserClient = () => {
  if (typeof window !== 'undefined') {
    // Only create the client once in the browser environment
    if (!browserClient) {
      browserClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storageKey: 'supabase-auth',
        },
      });
    }
    return browserClient;
  }
  
  // For SSR, create a new instance that won't be persisted
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}; 