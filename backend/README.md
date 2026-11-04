# Backend - Hệ Thống Quản Lý Tài Sản Bằng Mã QR

## Công nghệ sử dụng

- **Java**: 17
- **Framework**: Spring Boot 3.2.0
- **Database**: MySQL 8.x
- **Build Tool**: Maven
- **Security**: Spring Security + JWT
- **QR Code**: ZXing
- **API Documentation**: Swagger UI (springdoc-openapi)

## Yêu cầu

- JDK 17 trở lên
- Maven 3.9+
- MySQL 8.x
- IDE: IntelliJ IDEA hoặc VS Code

## Cài đặt

### 1. Clone repository và di chuyển vào thư mục backend

```bash
cd backend
```

### 2. Cấu hình database

- Tạo database MySQL:
```sql
CREATE DATABASE quanlytaisanqr CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

- Import schema từ file `src/main/resources/db/quanlytaisanqr_gon.sql`

### 3. Cấu hình kết nối database

Sửa file `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/quanlytaisanqr?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Ho_Chi_Minh
    username: root
    password: your_password_here
```

### 4. Cài đặt dependencies

```bash
mvn clean install
```

### 5. Chạy ứng dụng

```bash
mvn spring-boot:run
```

Hoặc:

```bash
java -jar target/quanlytaisan-1.0.0.jar
```

## API Documentation

Sau khi chạy ứng dụng, truy cập Swagger UI tại:

```
http://localhost:8080/api/swagger-ui.html
```

## Cấu trúc thư mục

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/tvu/quanlytaisan/
│   │   │   ├── config/          # Cấu hình (Security, CORS, Swagger)
│   │   │   ├── security/        # JWT Service, Auth Filter
│   │   │   ├── entity/          # 13 Entity classes
│   │   │   ├── enums/           # Java Enums
│   │   │   ├── repository/      # JPA Repositories
│   │   │   ├── dto/
│   │   │   │   ├── request/     # Request DTOs
│   │   │   │   └── response/    # Response DTOs
│   │   │   ├── mapper/          # Entity-DTO Mappers
│   │   │   ├── service/         # Business Logic
│   │   │   ├── controller/      # REST Controllers
│   │   │   ├── exception/       # Exception Handlers
│   │   │   └── util/            # Utilities (QR Code)
│   │   └── resources/
│   │       ├── application.yml
│   │       └── db/
│   │           └── quanlytaisanqr_gon.sql
│   └── test/
└── pom.xml
```

## Controllers

- **AuthController**: Đăng nhập, JWT authentication
- **TaiSanController**: CRUD tài sản, tìm kiếm, sinh QR
- **LuanChuyenController**: Bàn giao, thu hồi, điều chuyển
- **BaoTriController**: Báo hỏng, sửa chữa, bảo trì định kỳ
- **KiemKeController**: Tạo đợt kiểm kê, ghi nhận kết quả
- **ThongKeController**: Dashboard, báo cáo
- **NguoiDungController**: Quản lý người dùng (ADMIN)

## Phân quyền

- **ADMIN**: Toàn quyền (thêm, sửa, xóa)
- **USER**: Chỉ xem, quét QR, báo hỏng

## Testing

```bash
mvn test
```

## Build production

```bash
mvn clean package -DskipTests
```

File JAR sẽ được tạo tại `target/quanlytaisan-1.0.0.jar`
