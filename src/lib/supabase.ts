import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://static.g-3.vn';
const supabaseAnonKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc0NjU4Mjk2MCwiZXhwIjo0OTAyMjU2NTYwLCJyb2xlIjoiYW5vbiJ9.DvVf-ysuXFXycIAaIdSRx6NXw8A6g1FclqpuI_hdX3c';

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