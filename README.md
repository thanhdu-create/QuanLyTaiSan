# Hệ thống Quản lý Tài sản bằng mã QR

Hệ thống quản lý tài sản toàn diện sử dụng mã QR để tra cứu, kiểm kê, bảo trì và luân chuyển tài sản. Hệ thống hỗ trợ quét QR bằng camera điện thoại, theo dõi lịch sử tài sản, quản lý bảo trì định kỳ và kiểm kê tài sản.

##pas của tidb
pass : 1ha5neG6WLI2o76W
host : gateway01.ap-southeast-1.prod.aws.tidbcloud.com
port : 4000
usernae : wvdpCa871TJs4DR.root

## 📋 Mục lục

- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Thư viện và công nghệ](#thư-viện-và-công-nghệ)
- [Cài đặt và chạy dự án](#cài-đặt-và-chạy-dự-án)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Chức năng của hệ thống](#chức-năng-của-hệ-thống)
- [Tài khoản mặc định](#tài-khoản-mặc-định)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)

## 🖥️ Yêu cầu hệ thống

### Phần mềm cần cài đặt trên máy:

| Phần mềm | Phiên bản yêu cầu | Mục đích | Link tải |
|----------|------------------|----------|----------|
| **Node.js** | 18.x hoặc 20.x LTS | Chạy frontend React | [nodejs.org](https://nodejs.org/) |
| **Java JDK** | 17 (LTS) **BẮT BUỘC** | Chạy backend Spring Boot | [Oracle JDK](https://www.oracle.com/java/technologies/downloads/#java17) |
| **Maven** | 3.8+ | Build backend (hoặc dùng Maven Wrapper có sẵn) | [maven.apache.org](https://maven.apache.org/download.cgi) |
| **MySQL** | 8.0+ | Cơ sở dữ liệu | [mysql.com](https://dev.mysql.com/downloads/installer/) |
| **Git** | Mới nhất | Quản lý source code | [git-scm.com](https://git-scm.com/downloads) |

> ⚠️ **QUAN TRỌNG - Java Version:** 
> - Dự án **YÊU CẦU Java 17** (không dùng Java 25 hoặc phiên bản khác)
> - Sử dụng Lombok và Spring Boot 3.3.5 chỉ tương thích với Java 17
> - Kiểm tra version: `java -version`
> - Nếu gặp lỗi Lombok, xem: [HUONG_DAN_SUA_LOI_LOMBOK.md](HUONG_DAN_SUA_LOI_LOMBOK.md)

## 🛠️ Thư viện và công nghệ

### Backend (Spring Boot)

#### Core Framework
- **Spring Boot**: 3.3.5
- **Spring Security**: JWT Authentication & Authorization
- **Spring Data JPA**: ORM và database access
- **Spring Validation**: Validation dữ liệu
- **Hibernate**: JPA implementation

#### Database
- **MySQL Connector**: `mysql-connector-j` (runtime)
- **Database**: MySQL 8.x với charset UTF-8 (utf8mb4)

#### Libraries
| Thư viện | Version | Mục đích |
|----------|---------|----------|
| **Lombok** | 1.18.36 | Giảm boilerplate code (getter/setter, builder) |
| **JJWT** | 0.12.6 | Xử lý JWT tokens (api, impl, jackson) |
| **ZXing** | 3.5.3 | Sinh mã QR code (core, javase) |
| **Springdoc OpenAPI** | 2.6.0 | Tự động sinh API documentation (Swagger UI) |
| **Apache POI** | 5.3.0 | Xuất báo cáo Excel |
| **Spring Boot DevTools** | - | Hot reload khi development (optional) |

#### Testing
- **Spring Boot Test**: Unit & Integration testing
- **Spring Security Test**: Security testing

### Frontend (React)

#### Core Framework
- **React**: 18.3.1
- **React DOM**: 18.3.1
- **Vite**: 5.4.2 (Build tool, thay thế Create React App)

#### UI & Components
| Thư viện | Version | Mục đích |
|----------|---------|----------|
| **Ant Design (antd)** | 5.20.0 | UI component library (Table, Form, Modal, etc.) |
| **@ant-design/icons** | 5.4.0 | Icon library của Ant Design |

#### Routing & HTTP
| Thư viện | Version | Mục đích |
|----------|---------|----------|
| **React Router DOM** | 6.26.0 | Client-side routing |
| **Axios** | 1.7.5 | HTTP client cho API calls |

#### QR Code & Charts
| Thư viện | Version | Mục đích |
|----------|---------|----------|
| **html5-qrcode** | 2.3.8 | Quét mã QR bằng camera (WebRTC) |
| **Recharts** | 2.12.7 | Vẽ biểu đồ thống kê |
| **DayJS** | 1.11.12 | Xử lý ngày tháng (thay thế Moment.js) |

#### Build & Development
- **@vitejs/plugin-react**: 4.3.1 (Vite plugin cho React)

## 🚀 Cài đặt và chạy dự án

### Bước 1: Clone repository

```bash
git clone <repository-url>
cd <project-folder>
```

### Bước 2: Setup Database

#### 2.1. Tạo database MySQL

```bash
# Đăng nhập MySQL
mysql -u root -p

# Tạo database với charset UTF-8
CREATE DATABASE quanlytaisanqr CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Thoát MySQL
exit;
```

#### 2.2. Import schema và dữ liệu mẫu

**📁 Vị trí file SQL:** `backend/src/main/resources/db/quanlytaisanqr_gon.sql`

```bash
# Import từ thư mục gốc dự án
mysql -u root -p quanlytaisanqr < backend/src/main/resources/db/quanlytaisanqr_gon.sql

# Hoặc từ thư mục backend
cd backend
mysql -u root -p quanlytaisanqr < src/main/resources/db/quanlytaisanqr_gon.sql
```

> 💡 **Lưu ý:** File SQL này chứa:
> - Schema đầy đủ (13 tables)
> - Dữ liệu mẫu cho danh mục (Đơn vị, Vị trí, Loại tài sản)
> - 2 tài khoản người dùng mặc định (admin, user)

### Bước 3: Backend Setup

```bash
cd backend
```

#### 3.1. Kiểm tra Java version

```bash
java -version
# Phải hiển thị: java version "17.x.x"
```

> ⚠️ Nếu thấy Java 25 hoặc version khác, cần đổi về Java 17. Xem hướng dẫn: [HUONG_DAN_SUA_LOI_LOMBOK.md](HUONG_DAN_SUA_LOI_LOMBOK.md)

#### 3.2. Cấu hình database

Mở file `backend/src/main/resources/application.yml` và cập nhật:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/quanlytaisanqr?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Ho_Chi_Minh
    username: root           # Thay bằng username MySQL của bạn
    password: your_password  # Thay bằng password MySQL của bạn
```

> 💡 **Tip:** Để bảo mật, tạo file `application-dev.yml` hoặc `application-local.yml` (đã có trong `.gitignore`) để override cấu hình local.

#### 3.3. Build và chạy backend

**Cách 1: Dùng Maven Wrapper (khuyến nghị - không cần cài Maven)**

```bash
# Windows
.\mvnw.cmd clean install -DskipTests
.\mvnw.cmd spring-boot:run

# Linux/Mac
./mvnw clean install -DskipTests
./mvnw spring-boot:run
```

**Cách 2: Dùng Maven đã cài**

```bash
mvn clean install -DskipTests
mvn spring-boot:run
```

✅ **Backend chạy tại:** `http://localhost:8080/api`

#### 3.4. Kiểm tra backend

Mở browser và truy cập:
- API Health: `http://localhost:8080/api/test/hello`
- Swagger UI: `http://localhost:8080/api/swagger-ui.html`

### Bước 4: Frontend Setup

Mở terminal mới (giữ backend chạy):

```bash
cd frontend
```

#### 4.1. Cài đặt dependencies

```bash
npm install
```

> ⏱️ Lần đầu cài sẽ mất ~2-3 phút tùy tốc độ mạng

#### 4.2. Cấu hình API URL

File `.env` đã có sẵn, kiểm tra nội dung:

```bash
# File: frontend/.env
VITE_API_URL=http://localhost:8080/api
```

> 💡 Nếu backend chạy ở port khác, thay đổi URL này

#### 4.3. Chạy development server

```bash
npm run dev
```

✅ **Frontend chạy tại:** `http://localhost:5173`

#### 4.4. Kiểm tra frontend

- Mở browser: `http://localhost:5173`
- Trang đăng nhập sẽ xuất hiện
- Đăng nhập bằng tài khoản mặc định (xem phần [Tài khoản mặc định](#tài-khoản-mặc-định))

### 🎉 Hoàn tất!

Bây giờ bạn có:
- ✅ Backend API chạy tại `http://localhost:8080/api`
- ✅ Frontend chạy tại `http://localhost:5173`
- ✅ Database MySQL với dữ liệu mẫu
- ✅ 2 tài khoản test (admin/user)

## 📁 Cấu trúc dự án

```
quanlytaisanqr/
├── backend/                              # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/tvu/quanlytaisan/
│   │   │   │   ├── config/              # Cấu hình (Security, CORS, Data Initializer)
│   │   │   │   ├── controller/          # 11 REST Controllers
│   │   │   │   │   ├── AuthController.java          # Đăng nhập, JWT
│   │   │   │   │   ├── TaiSanController.java        # CRUD tài sản, QR code
│   │   │   │   │   ├── LuanChuyenController.java    # Bàn giao, thu hồi, điều chuyển
│   │   │   │   │   ├── BaoTriController.java        # Bảo trì, sửa chữa
│   │   │   │   │   ├── KiemKeController.java        # Kiểm kê định kỳ
│   │   │   │   │   ├── ThongKeController.java       # Dashboard, thống kê
│   │   │   │   │   ├── DonViController.java         # Quản lý đơn vị
│   │   │   │   │   ├── ViTriController.java         # Quản lý vị trí
│   │   │   │   │   ├── LoaiTaiSanController.java    # Quản lý loại tài sản
│   │   │   │   │   ├── TrangThaiTaiSanController.java
│   │   │   │   │   └── NguoiDungController.java     # Quản lý người dùng (Admin)
│   │   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   │   │   ├── request/         # 11 Request DTOs
│   │   │   │   │   └── response/        # 9 Response DTOs
│   │   │   │   ├── entity/              # 13 JPA Entities
│   │   │   │   │   ├── base/BaseEntity.java         # Base entity với timestamp
│   │   │   │   │   ├── TaiSan.java                  # Tài sản
│   │   │   │   │   ├── LuanChuyen.java              # Luân chuyển
│   │   │   │   │   ├── BaoTri.java                  # Bảo trì
│   │   │   │   │   ├── DotKiemKe.java, ChiTietKiemKe.java
│   │   │   │   │   ├── DonVi.java, ViTri.java, LoaiTaiSan.java
│   │   │   │   │   ├── NguoiDung.java               # User
│   │   │   │   │   └── LichSu*.java                 # Lịch sử
│   │   │   │   ├── enums/               # 7 Java Enums
│   │   │   │   ├── repository/          # Spring Data JPA Repositories
│   │   │   │   ├── service/             # Business Logic Layer
│   │   │   │   ├── security/            # JWT Service, Auth Filter
│   │   │   │   ├── exception/           # Global Exception Handler
│   │   │   │   └── util/                # QR Code Generator
│   │   │   └── resources/
│   │   │       ├── application.yml                  # Main config
│   │   │       ├── application.yml.example          # Config template
│   │   │       ├── application-dev.yml              # Dev config
│   │   │       └── db/
│   │   │           └── quanlytaisanqr_gon.sql      # ⭐ DATABASE SCHEMA
│   │   └── test/                        # Unit tests
│   ├── pom.xml                          # Maven dependencies
│   ├── mvnw.cmd                         # Maven Wrapper (Windows)
│   ├── mvnw                             # Maven Wrapper (Linux/Mac)
│   └── README.md
│
├── frontend/                             # React Frontend
│   ├── src/
│   │   ├── api/                         # API clients (Axios)
│   │   │   ├── authApi.js               # Authentication
│   │   │   ├── taisanApi.js             # Tài sản APIs
│   │   │   ├── luanchuyenApi.js         # Luân chuyển APIs
│   │   │   ├── baotriApi.js             # Bảo trì APIs
│   │   │   ├── kiemkeApi.js             # Kiểm kê APIs
│   │   │   ├── nguoidungApi.js          # Người dùng APIs
│   │   │   └── thongkeApi.js            # Thống kê APIs
│   │   ├── components/                  # Shared components
│   │   │   ├── QrScanner.jsx            # Quét QR bằng camera
│   │   │   ├── QrImage.jsx              # Hiển thị & in QR code
│   │   │   ├── StatusTag.jsx            # Tag trạng thái
│   │   │   └── ConfirmDialog.jsx        # Dialog xác nhận
│   │   ├── context/                     # React Contexts
│   │   │   └── AuthContext.jsx          # Authentication state
│   │   ├── hooks/                       # Custom hooks
│   │   │   └── useAuth.js
│   │   ├── layouts/                     # Layout components
│   │   │   ├── MainLayout.jsx           # Layout chính với sidebar
│   │   │   └── LoginLayout.jsx          # Layout trang login
│   │   ├── pages/                       # Page components
│   │   │   ├── dangnhap/                # Trang đăng nhập
│   │   │   ├── dashboard/               # Dashboard & thống kê
│   │   │   ├── taisan/                  # Quản lý tài sản
│   │   │   ├── quetqr/                  # Quét QR
│   │   │   ├── luanchuyen/              # Luân chuyển tài sản
│   │   │   ├── kiemke/                  # Kiểm kê
│   │   │   └── nguoidung/               # Quản lý người dùng
│   │   ├── routes/                      # Route configuration
│   │   │   └── AppRoutes.jsx
│   │   ├── utils/                       # Utilities
│   │   │   ├── axiosConfig.js           # Axios interceptors
│   │   │   └── constants.js
│   │   ├── App.jsx                      # Root component
│   │   └── main.jsx                     # Entry point
│   ├── public/                          # Static assets
│   ├── index.html
│   ├── vite.config.js                   # Vite configuration
│   ├── package.json                     # NPM dependencies
│   ├── .env                             # Environment variables
│   ├── .env.example                     # Env template
│   └── README.md
│
├── docx/                                # Tài liệu dự án
│   └── Danh sách xây dựng chức năng.md
├── .kiro/                               # Kiro specs & configs
│   └── specs/                           # Feature specifications
├── SECURITY.md                          # Hướng dẫn bảo mật
├── HUONG_DAN_CHAY_UNG_DUNG.md          # Hướng dẫn chi tiết
├── HUONG_DAN_SUA_LOI_LOMBOK.md         # Fix Java/Lombok errors
├── .gitignore                           # Git ignore rules
└── README.md                            # ⭐ File này
```

## ✨ Chức năng của hệ thống

### 1. 🔐 Xác thực và Phân quyền
- **Đăng nhập JWT**: Authentication token-based với Spring Security
- **2 vai trò người dùng**:
  - **ADMIN**: Toàn quyền quản lý hệ thống
  - **USER**: Xem tài sản, quét QR, báo hỏng
- **Quản lý profile**: Đổi mật khẩu, xem thông tin cá nhân

### 2. 📦 Quản lý Tài sản
- **CRUD tài sản**: Thêm, sửa, xóa, xem chi tiết tài sản
- **Tìm kiếm & lọc**: Theo mã, tên, đơn vị, loại, trạng thái
- **Sinh mã QR tự động**: Mỗi tài sản có QR code riêng
- **In QR code**: In từng cái hoặc hàng loạt
- **Lịch sử tài sản**: Theo dõi mọi thay đổi (trạng thái, vị trí, bảo trì)
- **Upload hình ảnh**: Ảnh tài sản (tùy chọn)

### 3. 📱 Quét QR Code
- **Quét bằng camera**: Sử dụng camera điện thoại/laptop
- **Tra cứu nhanh**: Xem thông tin tài sản ngay lập tức
- **Lịch sử quét**: Ghi lại thời gian và người quét

### 4. 🔄 Quản lý Luân chuyển
- **Bàn giao tài sản**: Chuyển tài sản cho người khác
- **Thu hồi tài sản**: Thu hồi về kho hoặc đơn vị
- **Điều chuyển**: Chuyển tài sản giữa các vị trí/đơn vị
- **Theo dõi lịch sử**: Xem toàn bộ quá trình luân chuyển
- **Phê duyệt**: Xác nhận bàn giao/thu hồi

### 5. 🔧 Quản lý Bảo trì
- **Báo hỏng**: Người dùng báo cáo tài sản hỏng hóc
- **Đăng ký sửa chữa**: Lập phiếu sửa chữa
- **Bảo trì định kỳ**: Lên lịch bảo trì theo chu kỳ
- **Theo dõi chi phí**: Ghi nhận chi phí bảo trì
- **Lịch sử bảo trì**: Xem toàn bộ lịch sử sửa chữa/bảo trì
- **Thống kê bảo trì**: Báo cáo theo đơn vị, loại tài sản, thời gian

### 6. ✅ Kiểm kê Tài sản
- **Tạo đợt kiểm kê**: Lập kế hoạch kiểm kê định kỳ
- **Phân công kiểm kê**: Giao nhiệm vụ cho từng người
- **Ghi nhận kết quả**: Quét QR và xác nhận tài sản
  - ✅ Đầy đủ (tài sản còn, đúng vị trí)
  - ⚠️ Thiếu (không tìm thấy)
  - 📍 Sai vị trí (tìm thấy nhưng sai chỗ)
  - ➕ Thừa (tài sản không có trong danh sách)
- **Báo cáo kiểm kê**: Tổng hợp kết quả, tỷ lệ đạt

### 7. 📊 Dashboard & Thống kê
- **Tổng quan hệ thống**:
  - Tổng số tài sản
  - Tài sản theo trạng thái (Đang sử dụng, Hỏng, Bảo trì, Thanh lý)
  - Tài sản theo đơn vị
  - Tài sản theo loại
- **Biểu đồ trực quan**: Pie chart, bar chart (Recharts)
- **Thống kê bảo trì**: Số lượng, chi phí theo thời gian
- **Thống kê kiểm kê**: Tỷ lệ đầy đủ/thiếu/sai vị trí

### 8. 📂 Quản lý Danh mục
- **Đơn vị**: Quản lý các đơn vị/phòng ban
- **Vị trí**: Quản lý vị trí lưu trữ tài sản
- **Loại tài sản**: Phân loại tài sản (Máy tính, Bàn ghế, Xe cộ, v.v.)
- **Trạng thái**: Các trạng thái tài sản có thể có

### 9. 👥 Quản lý Người dùng (Admin)
- **CRUD người dùng**: Thêm, sửa, xóa tài khoản
- **Phân quyền**: Gán vai trò ADMIN/USER
- **Reset password**: Admin có thể reset mật khẩu cho user
- **Vô hiệu hóa tài khoản**: Khóa tài khoản không cần xóa

### 10. 📄 Xuất báo cáo
- **Xuất Excel**: Danh sách tài sản, báo cáo kiểm kê (Apache POI)
- **In QR code**: In mã QR hàng loạt
- **Báo cáo tùy chỉnh**: Lọc theo tiêu chí khác nhau

## 👤 Tài khoản mặc định

Sau khi import database (`quanlytaisanqr_gon.sql`), hệ thống tự động có 2 tài khoản để test:

| Vai trò | Username | Password | Quyền hạn |
|---------|----------|----------|-----------|
| **Admin** | `admin` | `admin123` | ✅ Toàn quyền: CRUD tài sản, người dùng, danh mục, phê duyệt |
| **User** | `user` | `user123` | ⚠️ Hạn chế: Xem tài sản, quét QR, báo hỏng |

### 🔒 Lưu ý bảo mật

> ⚠️ **QUAN TRỌNG - ĐỌC KỸ TRƯỚC KHI SỬ DỤNG:**
> 
> 1. **Đổi password ngay** sau khi đăng nhập lần đầu!
> 2. **KHÔNG dùng tài khoản mặc định** trong môi trường production
> 3. **Đổi JWT secret key** trong `application.yml` trước khi deploy
> 4. Xem chi tiết: [SECURITY.md](SECURITY.md)

### 💡 Cách đổi password

1. Đăng nhập với tài khoản mặc định
2. Click vào avatar/tên người dùng ở góc phải
3. Chọn "Đổi mật khẩu"
4. Nhập mật khẩu cũ và mật khẩu mới

## � API Documentation

Sau khi chạy backend, truy cập **Swagger UI** để xem tài liệu API:

```
http://localhost:8080/api/swagger-ui.html
```

### API Endpoints chính

| Module | Base Path | Mô tả |
|--------|-----------|-------|
| Authentication | `/api/auth` | Đăng nhập, lấy thông tin user |
| Tài sản | `/api/tai-san` | CRUD, QR code, tìm kiếm |
| Luân chuyển | `/api/luanchuyen` | Bàn giao, thu hồi, điều chuyển |
| Bảo trì | `/api/bao-tri` | Báo hỏng, sửa chữa, thống kê |
| Kiểm kê | `/api/kiem-ke` | Tạo đợt, ghi nhận kết quả |
| Thống kê | `/api/thongke` | Dashboard data |
| Đơn vị | `/api/don-vi` | CRUD đơn vị |
| Vị trí | `/api/vi-tri` | CRUD vị trí |
| Loại tài sản | `/api/loai-tai-san` | CRUD loại tài sản |
| Người dùng | `/api/nguoidung` | CRUD user (Admin only) |

### Ví dụ API calls

**1. Login:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

# Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "admin",
  "vaiTro": "ADMIN"
}
```

**2. Lấy danh sách tài sản:**
```bash
GET /api/tai-san
Authorization: Bearer <token>
```

**3. Sinh QR code:**
```bash
GET /api/tai-san/{id}/qrcode
Authorization: Bearer <token>

# Response: Image (PNG)
```

## 🧪 Testing

### Backend Testing

```bash
cd backend

# Chạy tất cả tests
mvn test

# Chạy test với code coverage
mvn test jacoco:report

# Skip tests khi build
mvn clean package -DskipTests
```

### Frontend Testing

```bash
cd frontend

# Chạy development server để test thủ công
npm run dev

# Build production để kiểm tra lỗi build
npm run build

# Preview production build
npm run preview
```

### Testing trên thiết bị di động

#### Cách 1: Dùng cùng mạng WiFi

1. **Kiểm tra IP máy tính:**
   ```bash
   # Windows
   ipconfig
   # Tìm "IPv4 Address" của WiFi adapter
   
   # Linux/Mac
   ifconfig
   # hoặc
   ip addr show
   ```

2. **Frontend đã cấu hình `host: true`** trong `vite.config.js`

3. **Truy cập từ điện thoại:**
   ```
   http://<YOUR_IP>:5173
   
   # Ví dụ:
   http://192.168.1.100:5173
   ```

#### Cách 2: Dùng ngrok (khuyến nghị cho camera)

Camera chỉ hoạt động trên:
- ✅ `localhost` (khi dev trên máy tính)
- ✅ HTTPS domains (bất kỳ)
- ❌ HTTP qua IP (bị browser chặn vì bảo mật)

**Cài đặt ngrok:**
```bash
# Cài qua npm
npm install -g ngrok

# Hoặc tải binary: https://ngrok.com/download
```

**Tạo tunnel HTTPS:**
```bash
# Chạy ngrok
ngrok http 5173

# Ngrok sẽ cho bạn URL HTTPS:
# https://abc123.ngrok.io -> http://localhost:5173
```

**Truy cập từ điện thoại:**
```
https://abc123.ngrok.io
```

> 💡 URL ngrok thay đổi mỗi lần khởi động (free tier). Upgrade để có fixed domain.

## 🚀 Deployment

### Backend Deployment

#### Cách 1: Deploy JAR file

```bash
cd backend

# Build JAR file
mvn clean package -DskipTests

# File JAR tạo tại:
# target/quanlytaisan-1.0.0.jar

# Chạy trên server
java -jar target/quanlytaisan-1.0.0.jar

# Hoặc chỉ định profile
java -jar -Dspring.profiles.active=prod target/quanlytaisan-1.0.0.jar
```

#### Cách 2: Deploy với Docker (tùy chọn)

```dockerfile
# Dockerfile example
FROM eclipse-temurin:17-jdk-alpine
VOLUME /tmp
COPY target/quanlytaisan-1.0.0.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

```bash
# Build image
docker build -t quanlytaisan-backend .

# Run container
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/quanlytaisanqr \
  -e SPRING_DATASOURCE_PASSWORD=your_password \
  quanlytaisan-backend
```

#### Production Checklist

- [ ] Đổi JWT secret key trong `application-prod.yml`
- [ ] Cấu hình database production
- [ ] Bật HTTPS
- [ ] Cấu hình CORS cho domain production
- [ ] Đổi password tài khoản admin mặc định
- [ ] Setup backup database tự động
- [ ] Cấu hình logging (file log, level)
- [ ] Setup monitoring (optional)

### Frontend Deployment

#### Build production

```bash
cd frontend

# Build
npm run build

# Thư mục `dist/` chứa static files
```

#### Deploy lên web server

**Option 1: Nginx**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/quanlytaisan/dist;
    index index.html;
    
    # React Router support
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Option 2: Apache**

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/quanlytaisan/dist
    
    <Directory /var/www/quanlytaisan/dist>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        # React Router support
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

**Option 3: Vercel/Netlify (Static hosting)**

```bash
# Deploy lên Vercel
npm install -g vercel
cd frontend
vercel

# Deploy lên Netlify
npm install -g netlify-cli
cd frontend
netlify deploy --prod --dir=dist
```

> ⚠️ **Lưu ý:** Cập nhật `VITE_API_URL` trong `.env` hoặc `.env.production` với URL backend production

#### Production Checklist

- [ ] Cấu hình `.env.production` với API URL production
- [ ] Build production: `npm run build`
- [ ] Test production build: `npm run preview`
- [ ] Setup HTTPS (Let's Encrypt)
- [ ] Cấu hình CORS trên backend cho domain frontend
- [ ] Test camera trên HTTPS
- [ ] Setup CDN (optional)

## 📖 Hướng dẫn chi tiết

- 📘 **Hướng dẫn chạy ứng dụng**: [HUONG_DAN_CHAY_UNG_DUNG.md](HUONG_DAN_CHAY_UNG_DUNG.md)
- 🔧 **Hướng dẫn sửa lỗi Java/Lombok**: [HUONG_DAN_SUA_LOI_LOMBOK.md](HUONG_DAN_SUA_LOI_LOMBOK.md)
- 🔒 **Hướng dẫn bảo mật**: [SECURITY.md](SECURITY.md)
- 📋 **Kế hoạch phát triển**: [docx/Danh sách xây dựng chức năng.md](docx/Danh%20sách%20xây%20dựng%20chức%20năng%20–%20Hệ%20thống%20quản%20lý%20tài%20sản%20bằng%20mã%20QR.md)
- 💻 **Backend README**: [backend/README.md](backend/README.md)
- 🎨 **Frontend README**: [frontend/README.md](frontend/README.md)

## 🔒 Bảo mật

### ⚠️ Checklist trước khi push code lên Git

- [ ] **KHÔNG commit** file `.env` (đã có trong `.gitignore`)
- [ ] **KHÔNG commit** file `application-dev.yml` hoặc `application-prod.yml` (nếu chứa password thật)
- [ ] **KHÔNG hard-code** password/API key trong code
- [ ] **ĐÃ TẠO** file `.env.example` và `application.yml.example` (template không chứa password)
- [ ] **ĐÃ KIỂM TRA** `.gitignore` hoàn chỉnh

### Các file KHÔNG được commit

```
# Backend
backend/src/main/resources/application-dev.yml
backend/src/main/resources/application-prod.yml
backend/src/main/resources/application-local.yml

# Frontend
frontend/.env
frontend/.env.local
frontend/.env.production

# Database
*.sql (nếu chứa dữ liệu thật)
```

Xem chi tiết: [SECURITY.md](SECURITY.md)

## 🤝 Đóng góp

Chúng tôi hoan nghênh mọi đóng góp! Để đóng góp:

1. **Fork** repository này
2. **Tạo branch** cho feature: `git checkout -b feature/TinhNangMoi`
3. **Commit** changes: `git commit -m 'Thêm tính năng XYZ'`
4. **Push** lên branch: `git push origin feature/TinhNangMoi`
5. **Tạo Pull Request**

### Quy tắc khi đóng góp

- Code phải follow convention của dự án
- Viết commit message rõ ràng (tiếng Việt OK)
- Test kỹ trước khi tạo PR
- Không commit file config chứa password

## 📄 License

[MIT License](LICENSE) - Xem file LICENSE để biết chi tiết

## 📧 Liên hệ

- **Email**: [your-email@example.com]
- **GitHub**: [https://github.com/yourusername/quanlytaisanqr]
- **Issues**: [https://github.com/yourusername/quanlytaisanqr/issues]

---

**Made with ❤️ by TVU Team**
