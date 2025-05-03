import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Lấy session hiện tại
    const getSession = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    // Gọi hàm lấy session
    getSession();

    // Đăng ký lắng nghe sự kiện thay đổi auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Cleanup subscription khi unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading, error };
}

export function useSupabaseQuery<T>(
  table: string,
  options?: {
    columns?: string;
    filter?: { column: string; value: unknown; operator?: string };
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
  }
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      let query = supabase.from(table).select(options?.columns || '*');

      // Thêm filter nếu có
      if (options?.filter) {
        const { column, value, operator = '=' } = options.filter;
        query = query.filter(column, operator, value);
      }

      // Thêm order by nếu có
      if (options?.orderBy) {
        const { column, ascending = true } = options.orderBy;
        query = query.order(column, { ascending });
      }

      // Thêm limit nếu có
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      setData(data as T[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [table, JSON.stringify(options)]);

  return { data, loading, error, refetch: fetchData };
} 