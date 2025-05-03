Link: https://static.g-3.vn/

ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzQxNTAwMDAwLAogICJleHAiOiAxODk5MjY2NDAwCn0.muKe0Nrvkf5bMyLoFqAuFypRu3jHAcTYU08SYKrgRQo
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3NDE1MDAwMDAsCiAgImV4cCI6IDE4OTkyNjY0MDAKfQ.1KoSiJVueKJNkF59uc84BLqk7h8VdAoVp6Gozqr_vGc

# Hướng dẫn triển khai Supabase cho dự án g-3.vn

## 1. Tạo project Supabase
- Truy cập https://app.supabase.com/ và đăng nhập/tạo tài khoản.
- Nhấn "New project", nhập tên project, chọn region, đặt password cho database.
- Lưu lại **Project URL**, **Anon Key**, **Service Role Key** (ghi vào `.env.local` hoặc file cấu hình).

## 2. Thiết lập Database Schema
- Vào tab **SQL Editor** > **New query** để tạo các bảng chính:

### Tạo bảng `categories`
```sql
create table categories (
  id serial primary key,
  name text not null,
  description text
);
```

### Tạo bảng `brands`
```sql
create table brands (
  id serial primary key,
  name text not null,
  description text
);
```

### Tạo bảng `tags`
```sql
create table tags (
  id serial primary key,
  name text not null
);
```

### Tạo bảng `products`
```sql
create table products (
  id serial primary key,
  name text not null,
  description text,
  price numeric not null,
  image_url text,
  category_id integer references categories(id),
  brand_id integer references brands(id)
);
```

### Tạo bảng liên kết `product_tags`
```sql
create table product_tags (
  product_id integer references products(id),
  tag_id integer references tags(id),
  primary key (product_id, tag_id)
);
```

### Tạo bảng `users` (bổ sung thông tin cho user Supabase Auth)
```sql
create table users (
  id uuid primary key references auth.users(id),
  email text,
  name text,
  address text,
  phone text
);
```

### Tạo bảng `orders`
```sql
create table orders (
  id serial primary key,
  user_id uuid references users(id),
  status text,
  total_price numeric,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

### Tạo bảng `order_items`
```sql
create table order_items (
  id serial primary key,
  order_id integer references orders(id),
  product_id integer references products(id),
  quantity integer,
  price numeric
);
```

### Tạo bảng `blog_posts`
```sql
create table blog_posts (
  id serial primary key,
  title text not null,
  slug text unique not null,
  content text,
  author_id uuid references users(id),
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

## 3. Thiết lập Auth (Xác thực)
- Vào tab **Authentication** > **Settings**:
  - Cho phép đăng ký bằng email/password.
  - Có thể bật xác thực OAuth (Google, Facebook...) nếu cần.
- Khi user đăng ký, Supabase sẽ tự động tạo bản ghi trong `auth.users`. Có thể dùng trigger để tự thêm vào bảng `users` nếu muốn lưu thêm thông tin.

## 4. Thiết lập Storage (Lưu trữ ảnh)
- Vào tab **Storage** > **Create bucket**:
  - Tạo bucket tên `product-images` (hoặc tuỳ ý).
  - Chỉnh policy cho phép đọc công khai, chỉ user đăng nhập mới được upload/xoá.

## 5. Ghi chú cấu hình môi trường
- Tạo file `.env.local` ở root dự án Next.js:
```
NEXT_PUBLIC_SUPABASE_URL=... (Project URL)
NEXT_PUBLIC_SUPABASE_ANON_KEY=... (Anon Key)
```
- Không commit file này lên git!

## 6. Kết nối Supabase trong Next.js
- Tạo file `src/lib/supabaseClient.ts`:
```ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## 7. Một số lưu ý
- Có thể dùng Supabase Table Editor để nhập dữ liệu mẫu.
- Quản lý sản phẩm, đơn hàng, blog... trực tiếp trên Supabase Table Editor.
- Có thể tạo trigger để đồng bộ dữ liệu giữa bảng `auth.users` và bảng `users` nếu cần.
- Tham khảo docs: https://supabase.com/docs

---

# Supabase deployment guide for g-3.vn

## 1. Create Supabase project
- Go to https://app.supabase.com/ and sign in/create account.
- Click "New project", enter project name, select region, set database password.
- Save **Project URL**, **Anon Key**, **Service Role Key** (put in `.env.local` or config file).

## 2. Database Schema setup
- Go to **SQL Editor** > **New query** and create main tables (see Vietnamese section for SQL).

## 3. Auth setup
- Go to **Authentication** > **Settings**:
  - Enable email/password sign up.
  - Optionally enable OAuth (Google, Facebook...).
- On user sign up, Supabase auto-creates record in `auth.users`. Use trigger to sync with `users` table if needed.

## 4. Storage setup
- Go to **Storage** > **Create bucket**:
  - Create bucket (e.g. `product-images`).
  - Set policy: public read, only authenticated users can upload/delete.

## 5. Environment config
- Create `.env.local` in Next.js root:
```
NEXT_PUBLIC_SUPABASE_URL=... (Project URL)
NEXT_PUBLIC_SUPABASE_ANON_KEY=... (Anon Key)
```
- Do not commit this file to git!

## 6. Connect Supabase in Next.js
- Create `src/lib/supabaseClient.ts` (see Vietnamese section for code).

## 7. Notes
- Use Supabase Table Editor for sample data.
- Manage products, orders, blog... directly in Supabase Table Editor.
- Create trigger to sync `auth.users` and `users` if needed.
- Docs: https://supabase.com/docs

