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

// Tạo client cho client components (browser)
export const createBrowserClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'supabase-auth',
    },
  });
}; 