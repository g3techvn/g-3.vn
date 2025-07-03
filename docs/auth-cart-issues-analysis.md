# Tổng hợp các vấn đề về giỏ hàng (cart) và xác thực user/middleware

## 1. Vấn đề giỏ hàng (Cart)

### Hiện trạng
- Tồn tại 2 CartProvider khác nhau:
  - `src/features/cart/CartProvider.tsx`: Đơn giản, không lưu localStorage, không error state, không tính tổng tiền, không giới hạn số lượng.
  - `src/context/CartContext.tsx`: Đầy đủ, có localStorage, error state, giới hạn số lượng, tổng tiền, v.v.
- Sử dụng hook `useCart` không đồng nhất ở các component/page.
- Nguy cơ lỗi/xung đột khi state không đồng bộ, mất dữ liệu, không hiển thị đúng, không lưu localStorage.

### Đề xuất khắc phục
- Chỉ giữ lại 1 CartProvider duy nhất (`src/context/CartContext.tsx`).
- Đảm bảo mọi nơi đều import/use từ context này.
- Xóa/hợp nhất code thừa.
- Test lại toàn bộ flow giỏ hàng.

---

## 2. Vấn đề xác thực user đăng nhập & middleware

### Hiện trạng
- Dùng Supabase cho xác thực, session qua cookie.
- Có 2 lớp middleware:
  - Global (`src/middleware.ts`): kiểm tra session, role, thêm security headers, CORS, redirect.
  - API-level (`src/lib/auth/auth-middleware.ts`): xác thực từng API, kiểm tra role, rate-limit, phát hiện bot.
- Một số logic xác thực bị trùng lặp giữa middleware.ts và từng API.
- Role kiểm tra qua user_metadata/profile, nếu không đồng bộ dễ gây lỗi phân quyền.
- Một số API public nếu quên thêm vào danh sách bảo vệ có thể bị truy cập trái phép.
- Middleware nâng cao (enhanced-auth) chưa áp dụng rộng rãi.
- Xử lý lỗi chưa nhất quán (JSON/redirect).

### Đề xuất khắc phục
- Chỉ kiểm tra xác thực ở một nơi (ưu tiên middleware.ts cho global, API chỉ check logic đặc biệt).
- Đảm bảo mọi route cần bảo vệ đều nằm trong danh sách PROTECTED_ROUTES/ADMIN_ROUTES.
- Đồng bộ logic phân quyền (role) giữa Supabase user_metadata và profile.
- Nếu dùng enhanced-auth (JWT, multi-device, blacklist), cần áp dụng nhất quán ở các API.
- Thống nhất cách trả lỗi (JSON cho API, redirect cho page).
- Test kỹ các trường hợp session hết hạn, user không đủ quyền, request bất thường.

---

## English Summary

### Cart Issues
- Two different CartProviders exist, causing state and logic inconsistency.
- Inconsistent use of `useCart` hook.
- Risk of bugs: lost data, UI not updating, no localStorage, etc.

**Fix:** Keep only one CartProvider (`src/context/CartContext.tsx`), unify all imports, remove redundant code, test all cart flows.

### Auth/Middleware Issues
- Supabase session-based auth, two middleware layers (global & API-level).
- Duplicate auth logic, role check may be inconsistent, not all APIs protected.
- Enhanced-auth (JWT, device/session) not fully used.
- Inconsistent error handling (JSON/redirect).

**Fix:** Centralize auth checks (preferably in middleware.ts), ensure all protected/admin routes are listed, sync role logic, use enhanced-auth consistently if needed, unify error handling, test all edge cases.
