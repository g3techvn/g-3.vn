import { createClient } from '@supabase/supabase-js';

// Lấy URL và API key từ biến môi trường
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://static.g-3.vn/';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzQxNTAwMDAwLAogICJleHAiOiAxODk5MjY2NDAwCn0.muKe0Nrvkf5bMyLoFqAuFypRu3jHAcTYU08SYKrgRQo';

// Khởi tạo Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 