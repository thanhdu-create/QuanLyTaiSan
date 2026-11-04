# 🚀 Hướng dẫn nhanh - Sửa lỗi Camera

## Chỉ cần 2 bước!

### Bước 1: Chạy file này
```
Double-click vào: start-with-https.bat
```

File này sẽ:
- ✅ Tự động tải ngrok (nếu chưa có)
- ✅ Khởi động frontend
- ✅ Tạo HTTPS tunnel

**KHÔNG CẦN QUYỀN ADMINISTRATOR!**

### Bước 2: Lấy URL HTTPS

Sau khi chạy, sẽ mở 2 cửa sổ terminal:

**Cửa sổ 1 - FRONTEND:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.2.11:5173/
```

**Cửa sổ 2 - NGROK:**
```
Session Status                online
...
Forwarding                    https://abc123xyz.ngrok-free.app -> http://localhost:5173
```

👆 **Copy URL này**: `https://abc123xyz.ngrok-free.app`

### Bước 3: Mở trên điện thoại

1. Mở trình duyệt trên điện thoại
2. Dán URL: `https://abc123xyz.ngrok-free.app`
3. Click **"Visit Site"** (trang bảo mật của ngrok)
4. Đăng nhập vào hệ thống
5. Vào trang **Kiểm kê** → Click **"Quét QR để kiểm kê"**
6. Cho phép quyền camera → **Camera hoạt động!** 📱✅

---

## ❌ Nếu gặp lỗi

### Lỗi: "Không thể tải ngrok"
**Giải pháp:**
1. Tải thủ công từ: https://ngrok.com/download
2. Chọn **Windows (64-bit)**
3. Giải nén file `ngrok.exe` vào thư mục `frontend`
4. Chạy lại `start-with-https.bat`

### Lỗi: "npm run dev" không chạy
**Giải pháp:**
```bash
# Cài dependencies trước
cd frontend
npm install
```

### Lỗi: "ERR_NGROK_108"
**Giải pháp:**
- Ngrok miễn phí chỉ cho 1 tunnel
- Đóng tất cả cửa sổ ngrok cũ
- Chạy lại

### URL thay đổi mỗi lần chạy?
**Đúng vậy!** Mỗi lần chạy ngrok sẽ có URL mới.

**Muốn URL cố định?**
1. Đăng ký tài khoản miễn phí tại: https://ngrok.com
2. Copy authtoken
3. Chạy: `ngrok config add-authtoken YOUR_TOKEN`
4. Sau đó có thể dùng domain cố định

---

## 🎯 Tóm tắt

1. **Double-click**: `start-with-https.bat`
2. **Copy URL** từ cửa sổ NGROK
3. **Mở trên điện thoại** → Camera hoạt động!

Đơn giản vậy thôi! 🎉
