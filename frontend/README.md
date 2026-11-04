# Frontend - Hệ thống Quản lý Tài sản bằng mã QR

Frontend được xây dựng bằng ReactJS 18 + Vite + Ant Design 5.

## Công nghệ sử dụng

- **ReactJS 18**: Framework UI
- **Vite**: Build tool
- **Ant Design 5**: Thư viện UI components
- **React Router DOM 6**: Điều hướng
- **Axios**: HTTP client
- **html5-qrcode**: Quét mã QR
- **Recharts**: Biểu đồ
- **DayJS**: Xử lý ngày tháng

## Cài đặt

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình

File `.env` đã được tạo sẵn với cấu hình mặc định:

```
VITE_API_URL=http://localhost:8080/api
```

### 3. Chạy development server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:5173`

### 4. Build production

```bash
npm run build
```

## Cấu trúc thư mục

```
frontend/
├── src/
│   ├── api/              # API clients (axios)
│   ├── components/       # Shared components
│   ├── context/          # React contexts (Auth)
│   ├── hooks/            # Custom hooks
│   ├── layouts/          # Layout components
│   ├── pages/            # Page components
│   │   ├── dangnhap/     # Đăng nhập
│   │   ├── dashboard/    # Dashboard
│   │   ├── taisan/       # Quản lý tài sản
│   │   ├── quetqr/       # Quét QR
│   │   ├── luanchuyen/   # Luân chuyển
│   │   ├── kiemke/       # Kiểm kê
│   │   └── nguoidung/    # Người dùng
│   ├── routes/           # Route configuration
│   ├── utils/            # Utilities
│   ├── App.jsx           # Root component
│   └── main.jsx          # Entry point
├── index.html
├── vite.config.js
└── package.json
```

## Tính năng đã triển khai

### Core Infrastructure
- ✅ Cấu hình Vite + React
- ✅ Routing với React Router DOM
- ✅ Authentication Context
- ✅ Private Route & Admin Route
- ✅ Axios client với JWT interceptor
- ✅ Layout chính với menu sidebar
- ✅ Login layout

### Components
- ✅ StatusTag - Hiển thị trạng thái tài sản
- ✅ QrScanner - Quét mã QR bằng camera
- ✅ QrImage - Hiển thị và in mã QR
- ✅ ConfirmDialog - Dialog xác nhận

### Pages
- ✅ Trang đăng nhập (DangNhap)
- ✅ Dashboard với thống kê
- ✅ Danh sách tài sản (TaiSanList) với tìm kiếm
- ✅ Chi tiết tài sản (TaiSanDetail) với QR code
- ✅ Quét QR (QuetQR)
- ⏳ Form thêm/sửa tài sản (placeholder)
- ⏳ Các trang khác (placeholder)

### API Clients
- ✅ authApi - Đăng nhập, lấy thông tin user
- ✅ taisanApi - CRUD tài sản, QR code, lịch sử
- ✅ luanchuyenApi - Bàn giao, thu hồi, điều chuyển
- ✅ baotriApi - Báo hỏng, sửa chữa
- ✅ kiemkeApi - Kiểm kê
- ✅ nguoidungApi - Quản lý người dùng
- ✅ thongkeApi - Dashboard statistics

## Chức năng cần phát triển

1. **Form thêm/sửa tài sản** - Hoàn thiện TaiSanForm
2. **Quản lý luân chuyển** - UI cho bàn giao, thu hồi, điều chuyển
3. **Quản lý bảo trì** - UI cho báo hỏng và sửa chữa
4. **Quản lý kiểm kê** - Tạo đợt kiểm kê và ghi nhận kết quả
5. **Quản lý danh mục** - CRUD cho đơn vị, vị trí, loại tài sản
6. **Quản lý người dùng** - CRUD và phân quyền

## Lưu ý khi phát triển

### Authentication
- Token JWT được lưu trong `localStorage`
- Axios interceptor tự động gắn token vào header
- Tự động redirect về trang login khi nhận 401

### Phân quyền
- USER: Xem tài sản, quét QR, báo hỏng
- ADMIN: Full quyền

### Camera và HTTPS
- Camera chỉ hoạt động trên HTTPS (trừ localhost)
- Để test trên điện thoại thật, cần deploy với HTTPS hoặc dùng ngrok

### Responsive
- Giao diện Ant Design tự động responsive
- Cần test kỹ trên mobile vì người dùng chủ yếu dùng điện thoại để quét QR

## Kết nối Backend

Backend Spring Boot cần:
1. Chạy ở `http://localhost:8080`
2. Bật CORS cho `http://localhost:5173`
3. Implement các API endpoint theo contract đã định nghĩa

## Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build production
- `npm run preview` - Preview production build

## Trình duyệt hỗ trợ

- Chrome (khuyến nghị)
- Firefox
- Safari
- Edge

Tính năng quét QR yêu cầu browser hỗ trợ WebRTC và getUserMedia API.
