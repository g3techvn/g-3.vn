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

// Singleton browser client instance with error tracking
let browserClient: SupabaseClient<Database> | null = null;
let lastError: Error | null = null;
let initializationAttempts = 0;
const MAX_INIT_ATTEMPTS = 3;

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
    console.log('🏗️ Creating Supabase server client...');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          'User-Agent': 'G3-Furniture-Server/1.0'
        },
        fetch: async (url, options) => {
          const maxRetries = 3;
          let lastError = null;

          for (let i = 0; i < maxRetries; i++) {
            try {
              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

              const response = await fetch(url, { 
                ...options,
                signal: controller.signal
              });

              clearTimeout(timeout);

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response;
            } catch (error) {
              console.error(`Server client attempt ${i + 1} failed:`, error);
              lastError = error;
              
              if (error instanceof Error && error.name === 'AbortError') {
                console.log('Request timed out, retrying...');
              }

              // Wait before retrying (exponential backoff)
              if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
              }
            }
          }
          throw lastError;
        }
      }
    });
  } catch (error) {
    console.error('❌ Error creating Supabase server client:', error);
    throw new Error(`Supabase server connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Clear browser client on critical errors
const clearBrowserClient = () => {
  browserClient = null;
  initializationAttempts = 0;
  lastError = null;
};

// Create client for client components (browser)
export const createBrowserClient = () => {
  if (typeof window !== 'undefined') {
    // Check if we have a working client
    if (browserClient) {
      return browserClient;
    }

    // Check if we've exceeded retry attempts
    if (initializationAttempts >= MAX_INIT_ATTEMPTS) {
      console.error('❌ Max initialization attempts reached');
      throw new Error('Failed to initialize authentication after multiple attempts');
    }

    initializationAttempts++;
    console.log(`📍 Attempting to create browser client (attempt ${initializationAttempts}/${MAX_INIT_ATTEMPTS})`);

    try {
      // Verify environment variables
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase credentials');
      }

      // Add SSL verification bypass for development
      const fetchConfig: RequestInit = {};
      if (process.env.NODE_ENV === 'development') {
        const https = require('https');
        fetchConfig.agent = new https.Agent({
          rejectUnauthorized: false
        });
      }

      // Custom storage implementation with fallback
      const customStorage = {
        getItem: (key: string): string | null => {
          try {
            // First try localStorage
            const value = localStorage.getItem(key);
            if (value) return value;

            // Try sessionStorage as fallback
            const sessionValue = sessionStorage.getItem(key);
            if (sessionValue) {
              // Copy to localStorage if possible
              try {
                localStorage.setItem(key, sessionValue);
              } catch (e) {
                console.warn('Failed to copy to localStorage:', e);
              }
              return sessionValue;
            }

            return null;
          } catch (error) {
            console.error('Storage read error:', error);
            return null;
          }
        },
        setItem: (key: string, value: string): void => {
          try {
            localStorage.setItem(key, value);
          } catch (error) {
            console.error('localStorage write failed, trying sessionStorage:', error);
            try {
              sessionStorage.setItem(key, value);
            } catch (fallbackError) {
              console.error('All storage mechanisms failed:', fallbackError);
              throw new Error('No available storage mechanism');
            }
          }
        },
        removeItem: (key: string): void => {
          try {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
          } catch (error) {
            console.error('Storage removal error:', error);
          }
        }
      };

      const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
          flowType: 'pkce',
          storage: customStorage,
          debug: process.env.NODE_ENV === 'development'
        },
        global: {
          fetch: async (url, options) => {
            const maxRetries = 3;
            let lastError = null;

            for (let i = 0; i < maxRetries; i++) {
              try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

                const response = await fetch(url, { 
                  ...options, 
                  ...fetchConfig,
                  signal: controller.signal
                });

                clearTimeout(timeout);

                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response;
              } catch (error) {
                console.error(`Attempt ${i + 1} failed:`, error);
                lastError = error;
                
                if (error instanceof Error && error.name === 'AbortError') {
                  console.log('Request timed out, retrying...');
                }

                // Wait before retrying (exponential backoff)
                if (i < maxRetries - 1) {
                  await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
                }
              }
            }
            throw lastError;
          }
        }
      });

      // Test the client
      client.auth.getSession().catch(error => {
        console.error('Initial session check failed:', error);
        clearBrowserClient();
        throw error;
      });

      // Listen for auth state changes
      client.auth.onAuthStateChange((event, session) => {
        console.log('🔄 Auth state changed:', event, session ? 'with session' : 'no session');
        
        if (event === 'SIGNED_IN') {
          dispatchAuthEvent('SIGNED_IN');
        } else if (event === 'SIGNED_OUT') {
          dispatchAuthEvent('SIGNED_OUT');
          // Clear client on sign out to force re-initialization
          clearBrowserClient();
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed successfully');
        } else if (event === 'USER_UPDATED') {
          // Force client re-initialization on user changes
          clearBrowserClient();
        }
      });

      browserClient = client;
      lastError = null;
      console.log('✅ Browser client created successfully');
      return browserClient;

    } catch (error) {
      console.error('❌ Error creating browser client:', error);
      lastError = error instanceof Error ? error : new Error(String(error));
      clearBrowserClient();
      throw new Error('Lỗi khởi tạo kết nối. Vui lòng tải lại trang.');
    }
  }
  
  // For SSR, create a new instance that won't be persisted
  try {
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: true,
        detectSessionInUrl: false
      }
    });
  } catch (error) {
    console.error('Error creating Supabase SSR client:', error);
    throw error;
  }
};

// Create user_profiles table if it doesn't exist
const createUserProfilesTable = async (supabase: any) => {
  const { error } = await supabase.rpc('create_user_profiles_if_not_exists');
  if (error) {
    console.error('Error creating user_profiles table:', error);
    throw error;
  }
};

// Create the stored procedure in Supabase
const createStoredProcedure = async (supabase: any) => {
  const { error } = await supabase.rpc('create_stored_procedures');
  if (error) {
    console.error('Error creating stored procedures:', error);
    throw error;
  }
};

// Initialize database
export const initializeDatabase = async () => {
  const supabase = createServerClient();
  await createStoredProcedure(supabase);
  await createUserProfilesTable(supabase);
};