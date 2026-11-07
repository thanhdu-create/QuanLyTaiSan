-- =====================================================
-- HỆ THỐNG QUẢN LÝ TÀI SẢN BẰNG MÃ QR
-- File: Export dữ liệu đầy đủ với sample data
-- Mục đích: Import trên máy khác để test
-- =====================================================

DROP DATABASE IF EXISTS quanlytaisanqr;
CREATE DATABASE quanlytaisanqr
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE quanlytaisanqr;

-- =====================================================
-- 1. PHÂN QUYỀN & NGƯỜI DÙNG
-- =====================================================
CREATE TABLE vaitro (
    vaitro_id  TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    mavaitro   VARCHAR(20) NOT NULL UNIQUE,
    tenvaitro  VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE donvi (
    donvi_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    madonvi      VARCHAR(30)  NOT NULL UNIQUE,
    tendonvi     VARCHAR(150) NOT NULL,
    donvicha_id  INT UNSIGNED NULL,
    CONSTRAINT fk_donvi_donvicha FOREIGN KEY (donvicha_id)
        REFERENCES donvi(donvi_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE nguoidung (
    nguoidung_id  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tendangnhap   VARCHAR(50)  NOT NULL UNIQUE,
    matkhaumahoa  VARCHAR(255) NOT NULL,
    hoten         VARCHAR(100) NOT NULL,
    email         VARCHAR(100) UNIQUE,
    vaitro_id     TINYINT UNSIGNED NOT NULL,
    donvi_id      INT UNSIGNED NULL,
    hoatdong      TINYINT(1) NOT NULL DEFAULT 1,
    CONSTRAINT fk_nguoidung_vaitro FOREIGN KEY (vaitro_id) REFERENCES vaitro(vaitro_id),
    CONSTRAINT fk_nguoidung_donvi  FOREIGN KEY (donvi_id)  REFERENCES donvi(donvi_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- 2. DANH MỤC
-- =====================================================
CREATE TABLE vitri (
    vitri_id  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    mavitri   VARCHAR(30)  NOT NULL UNIQUE,
    tenvitri  VARCHAR(150) NOT NULL,
    donvi_id  INT UNSIGNED NOT NULL,
    CONSTRAINT fk_vitri_donvi FOREIGN KEY (donvi_id) REFERENCES donvi(donvi_id)
) ENGINE=InnoDB;

CREATE TABLE loaitaisan (
    loaitaisan_id  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tenloai        VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE trangthaitaisan (
    trangthaitaisan_id  TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    matrangthai         VARCHAR(20) NOT NULL UNIQUE,
    tentrangthai        VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

-- =====================================================
-- 3. TÀI SẢN & MÃ QR
-- =====================================================
CREATE TABLE taisan (
    taisan_id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    mataisan            VARCHAR(50)  NOT NULL UNIQUE,
    tentaisan           VARCHAR(200) NOT NULL,
    loaitaisan_id       INT UNSIGNED NOT NULL,
    thongsokythuat      TEXT,
    ngaynhap            DATE NOT NULL,
    giatri              DECIMAL(15,2) NOT NULL DEFAULT 0,
    vitri_id            INT UNSIGNED NULL,
    trangthaitaisan_id  TINYINT UNSIGNED NOT NULL,
    nguoisudung_id      BIGINT UNSIGNED NULL,
    daxoa               TINYINT(1) NOT NULL DEFAULT 0,
    ngaytao             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_taisan_loaitaisan      FOREIGN KEY (loaitaisan_id)      REFERENCES loaitaisan(loaitaisan_id),
    CONSTRAINT fk_taisan_vitri           FOREIGN KEY (vitri_id)           REFERENCES vitri(vitri_id) ON DELETE SET NULL,
    CONSTRAINT fk_taisan_trangthaitaisan FOREIGN KEY (trangthaitaisan_id) REFERENCES trangthaitaisan(trangthaitaisan_id),
    CONSTRAINT fk_taisan_nguoisudung     FOREIGN KEY (nguoisudung_id)     REFERENCES nguoidung(nguoidung_id) ON DELETE SET NULL,
    INDEX idx_taisan_ten (tentaisan),
    INDEX idx_taisan_vitri (vitri_id),
    INDEX idx_taisan_trangthai (trangthaitaisan_id)
) ENGINE=InnoDB;

CREATE TABLE lichsuquet (
    lichsuquet_id  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    taisan_id      BIGINT UNSIGNED NOT NULL,
    nguoidung_id   BIGINT UNSIGNED NULL,
    thoigianquet   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lichsuquet_taisan    FOREIGN KEY (taisan_id)    REFERENCES taisan(taisan_id) ON DELETE CASCADE,
    CONSTRAINT fk_lichsuquet_nguoidung FOREIGN KEY (nguoidung_id) REFERENCES nguoidung(nguoidung_id) ON DELETE SET NULL,
    INDEX idx_lichsuquet_taisan (taisan_id, thoigianquet)
) ENGINE=InnoDB;

-- =====================================================
-- 4. BÀN GIAO / THU HỒI / LUÂN CHUYỂN
-- =====================================================
CREATE TABLE luanchuyen (
    luanchuyen_id  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    loaiphieu      ENUM('BANGIAO','THUHOI','DIEUCHUYEN') NOT NULL,
    taisan_id      BIGINT UNSIGNED NOT NULL,
    nguoigiao_id   BIGINT UNSIGNED NULL,
    nguoinhan_id   BIGINT UNSIGNED NULL,
    vitri_id       INT UNSIGNED NULL,
    ngaythuchien   DATE NOT NULL,
    lydo           VARCHAR(500),
    CONSTRAINT fk_luanchuyen_taisan    FOREIGN KEY (taisan_id)    REFERENCES taisan(taisan_id),
    CONSTRAINT fk_luanchuyen_nguoigiao FOREIGN KEY (nguoigiao_id) REFERENCES nguoidung(nguoidung_id) ON DELETE SET NULL,
    CONSTRAINT fk_luanchuyen_nguoinhan FOREIGN KEY (nguoinhan_id) REFERENCES nguoidung(nguoidung_id) ON DELETE SET NULL,
    CONSTRAINT fk_luanchuyen_vitri     FOREIGN KEY (vitri_id)     REFERENCES vitri(vitri_id) ON DELETE SET NULL,
    INDEX idx_luanchuyen_taisan (taisan_id, ngaythuchien)
) ENGINE=InnoDB;

-- =====================================================
-- 5. SỬA CHỮA & BẢO TRÌ
-- =====================================================
CREATE TABLE baotri (
    baotri_id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    taisan_id           BIGINT UNSIGNED NOT NULL,
    loaibaotri          ENUM('SUACHUA','DINHKY') NOT NULL,
    nguoibao_id         BIGINT UNSIGNED NULL,
    ngaybao             DATE NOT NULL,
    motahuhong          TEXT,
    trangthaixuly       ENUM('CHOXULY','DANGXULY','HOANTHANH','DAHUY') NOT NULL DEFAULT 'CHOXULY',
    ngayhoanthanh       DATE NULL,
    chiphi              DECIMAL(15,2) NOT NULL DEFAULT 0,
    ketqua              TEXT,
    ngaybaotritieptheo  DATE NULL,
    CONSTRAINT fk_baotri_taisan   FOREIGN KEY (taisan_id)   REFERENCES taisan(taisan_id),
    CONSTRAINT fk_baotri_nguoibao FOREIGN KEY (nguoibao_id) REFERENCES nguoidung(nguoidung_id) ON DELETE SET NULL,
    INDEX idx_baotri_taisan (taisan_id, ngaybao),
    INDEX idx_baotri_trangthai (trangthaixuly)
) ENGINE=InnoDB;

-- =====================================================
-- 6. LỊCH SỬ ĐỔI TRẠNG THÁI
-- =====================================================
CREATE TABLE lichsutrangthai (
    lichsutrangthai_id  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    taisan_id           BIGINT UNSIGNED NOT NULL,
    trangthaitaisan_id  TINYINT UNSIGNED NOT NULL,
    nguoidung_id        BIGINT UNSIGNED NULL,
    thoigian            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lichsutrangthai_taisan    FOREIGN KEY (taisan_id)          REFERENCES taisan(taisan_id) ON DELETE CASCADE,
    CONSTRAINT fk_lichsutrangthai_trangthai FOREIGN KEY (trangthaitaisan_id) REFERENCES trangthaitaisan(trangthaitaisan_id),
    CONSTRAINT fk_lichsutrangthai_nguoidung FOREIGN KEY (nguoidung_id)       REFERENCES nguoidung(nguoidung_id) ON DELETE SET NULL,
    INDEX idx_lichsutrangthai_taisan (taisan_id, thoigian)
) ENGINE=InnoDB;

-- =====================================================
-- 7. KIỂM KÊ
-- =====================================================
CREATE TABLE dotkiemke (
    dotkiemke_id  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tendot        VARCHAR(150) NOT NULL,
    donvi_id      INT UNSIGNED NULL,
    ngaybatdau    DATE NOT NULL,
    trangthai     ENUM('DANGMO','DADONG') NOT NULL DEFAULT 'DANGMO',
    CONSTRAINT fk_dotkiemke_donvi FOREIGN KEY (donvi_id) REFERENCES donvi(donvi_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE chitietkiemke (
    chitietkiemke_id  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    dotkiemke_id      BIGINT UNSIGNED NOT NULL,
    taisan_id         BIGINT UNSIGNED NOT NULL,
    vitrithucte_id    INT UNSIGNED NULL,
    ketqua            ENUM('CHUAKIEM','CO','THIEU','LECHVITRI') NOT NULL DEFAULT 'CHUAKIEM',
    nguoidung_id      BIGINT UNSIGNED NULL,
    thoigiankiem      DATETIME NULL,
    UNIQUE KEY uq_chitietkiemke_dot_taisan (dotkiemke_id, taisan_id),
    CONSTRAINT fk_chitietkiemke_dot       FOREIGN KEY (dotkiemke_id)   REFERENCES dotkiemke(dotkiemke_id) ON DELETE CASCADE,
    CONSTRAINT fk_chitietkiemke_taisan    FOREIGN KEY (taisan_id)      REFERENCES taisan(taisan_id),
    CONSTRAINT fk_chitietkiemke_vitri     FOREIGN KEY (vitrithucte_id) REFERENCES vitri(vitri_id) ON DELETE SET NULL,
    CONSTRAINT fk_chitietkiemke_nguoidung FOREIGN KEY (nguoidung_id)   REFERENCES nguoidung(nguoidung_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- 8. DỮ LIỆU KHỞI TẠO CƠ BẢN
-- =====================================================

-- Vai trò
INSERT INTO vaitro (mavaitro, tenvaitro) VALUES
    ('ADMIN', 'Quản trị viên'),
    ('USER',  'Người sử dụng');

-- Trạng thái tài sản
INSERT INTO trangthaitaisan (matrangthai, tentrangthai) VALUES
    ('IN_USE',      'Đang sử dụng'),
    ('AVAILABLE',   'Còn trống'),
    ('MAINTENANCE', 'Đang bảo trì'),
    ('BROKEN',      'Hư hỏng');

-- Đơn vị
INSERT INTO donvi (madonvi, tendonvi, donvicha_id) VALUES
    ('DV001', 'Phòng Hành chính', NULL),
    ('DV002', 'Phòng Kế toán', NULL),
    ('DV003', 'Phòng Kỹ thuật', NULL),
    ('DV004', 'Phòng Nhân sự', NULL),
    ('DV005', 'Kho tổng', NULL),
    ('DV006', 'Phòng IT', NULL),
    ('DV007', 'Phòng Marketing', NULL);

-- Vị trí
INSERT INTO vitri (mavitri, tenvitri, donvi_id) VALUES
    ('VT001', 'Phòng 101', 1),
    ('VT002', 'Phòng 102', 1),
    ('VT003', 'Phòng 201', 2),
    ('VT004', 'Phòng 202', 2),
    ('VT005', 'Phòng 301', 3),
    ('VT006', 'Phòng 302', 3),
    ('VT007', 'Khu vực A', 5),
    ('VT008', 'Khu vực B', 5),
    ('VT009', 'Phòng Server', 6),
    ('VT010', 'Văn phòng chung', 7);

-- Loại tài sản
INSERT INTO loaitaisan (tenloai) VALUES
    ('Máy tính'),
    ('Bàn ghế'),
    ('Điều hòa'),
    ('Máy in'),
    ('Tủ tài liệu'),
    ('Điện thoại'),
    ('Máy chiếu'),
    ('Xe ô tô'),
    ('Xe máy'),
    ('Thiết bị mạng'),
    ('Laptop'),
    ('Màn hình'),
    ('Bàn làm việc'),
    ('Ghế xoay'),
    ('Tủ lạnh');

-- =====================================================
-- 9. DỮ LIỆU MẪU - NGƯỜI DÙNG
-- =====================================================
-- Password đều là BCrypt hash của: admin123 và user123
-- BCrypt hash: $2a$10$N9qo8uLOickgx2ZMRZoMye7tBZshO5Jz8ViI5WQnMUXlPbXhWJ5vy (admin123)
-- BCrypt hash: $2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8. (user123)

INSERT INTO nguoidung (tendangnhap, matkhaumahoa, hoten, email, vaitro_id, donvi_id, hoatdong) VALUES
    ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMye7tBZshO5Jz8ViI5WQnMUXlPbXhWJ5vy', 'Quản trị viên', 'admin@example.com', 1, 1, 1),
    ('user', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Người dùng', 'user@example.com', 2, 2, 1),
    ('nvien01', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Nguyễn Văn A', 'nguyenvana@example.com', 2, 3, 1),
    ('nvien02', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Trần Thị B', 'tranthib@example.com', 2, 4, 1),
    ('nvien03', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Lê Văn C', 'levanc@example.com', 2, 6, 1);

-- =====================================================
-- 10. DỮ LIỆU MẪU - TÀI SẢN
-- =====================================================
INSERT INTO taisan (mataisan, tentaisan, loaitaisan_id, thongsokythuat, ngaynhap, giatri, vitri_id, trangthaitaisan_id, nguoisudung_id, daxoa) VALUES
    -- Máy tính
    ('TS001', 'Máy tính Dell Optiplex 7010', 1, 'CPU: i5-12400, RAM: 16GB, SSD: 512GB', '2024-01-15', 18000000, 1, 1, 3, 0),
    ('TS002', 'Máy tính HP EliteDesk 800 G9', 1, 'CPU: i7-12700, RAM: 32GB, SSD: 1TB', '2024-01-20', 25000000, 2, 1, 4, 0),
    ('TS003', 'Máy tính Lenovo ThinkCentre M920', 1, 'CPU: i5-11500, RAM: 16GB, SSD: 512GB', '2024-02-10', 16000000, 5, 1, 3, 0),
    ('TS004', 'Máy tính ASUS VivoPC', 1, 'CPU: i3-10100, RAM: 8GB, SSD: 256GB', '2024-02-15', 12000000, 6, 2, NULL, 0),
    
    -- Laptop
    ('TS005', 'Laptop Dell Latitude 5420', 11, 'CPU: i7-1165G7, RAM: 16GB, SSD: 512GB, 14 inch', '2024-01-25', 22000000, 1, 1, 1, 0),
    ('TS006', 'Laptop Lenovo ThinkPad X1 Carbon', 11, 'CPU: i7-1185G7, RAM: 16GB, SSD: 1TB, 14 inch', '2024-03-01', 35000000, 9, 1, 5, 0),
    ('TS007', 'Laptop HP ProBook 450 G9', 11, 'CPU: i5-1235U, RAM: 8GB, SSD: 256GB, 15.6 inch', '2024-03-10', 18000000, 10, 1, 2, 0),
    
    -- Màn hình
    ('TS008', 'Màn hình Dell 24 inch P2422H', 12, '24 inch, Full HD, IPS, 60Hz', '2024-01-15', 4500000, 1, 1, 3, 0),
    ('TS009', 'Màn hình LG 27 inch 27UP550', 12, '27 inch, 4K, IPS, 60Hz', '2024-02-20', 7500000, 2, 1, 4, 0),
    ('TS010', 'Màn hình ASUS 24 inch VA24EHE', 12, '24 inch, Full HD, IPS, 75Hz', '2024-03-05', 3500000, 5, 2, NULL, 0),
    
    -- Máy in
    ('TS011', 'Máy in HP LaserJet Pro M404dn', 4, 'In laser đen trắng, tốc độ 38 trang/phút', '2024-01-10', 8500000, 7, 1, NULL, 0),
    ('TS012', 'Máy in Canon PIXMA G3010', 4, 'In màu, scan, copy, in phun màu', '2024-02-15', 4200000, 3, 1, NULL, 0),
    ('TS013', 'Máy in Brother HL-L2321D', 4, 'In laser đen trắng, tốc độ 30 trang/phút', '2024-03-20', 3500000, 4, 3, NULL, 0),
    
    -- Bàn ghế
    ('TS014', 'Bàn làm việc gỗ 1m2 x 0.6m', 13, 'Gỗ công nghiệp chống ẩm, màu nâu', '2024-01-05', 2500000, 1, 1, 3, 0),
    ('TS015', 'Bàn làm việc gỗ 1m4 x 0.7m', 13, 'Gỗ công nghiệp chống ẩm, màu trắng', '2024-01-05', 3200000, 2, 1, 4, 0),
    ('TS016', 'Ghế xoay văn phòng có tựa lưng', 14, 'Lưng lưới thoáng khí, nâng hạ khí nén', '2024-01-05', 1800000, 1, 1, 3, 0),
    ('TS017', 'Ghế xoay văn phòng cao cấp', 14, 'Da PU, tựa lưng điều chỉnh, tay vịn', '2024-01-05', 3500000, 2, 1, 4, 0),
    
    -- Điều hòa
    ('TS018', 'Điều hòa Daikin 1.5HP', 3, '12000 BTU, inverter, gas R32', '2024-01-12', 12000000, 1, 1, NULL, 0),
    ('TS019', 'Điều hòa Panasonic 2HP', 3, '18000 BTU, inverter, gas R32', '2024-01-12', 15000000, 3, 1, NULL, 0),
    ('TS020', 'Điều hòa LG 1HP', 3, '9000 BTU, inverter, gas R32', '2024-02-18', 8500000, 5, 4, NULL, 0),
    
    -- Thiết bị mạng
    ('TS021', 'Router Cisco RV340', 10, 'Dual WAN, VPN, 16 ports Gigabit', '2024-01-08', 12000000, 9, 1, NULL, 0),
    ('TS022', 'Switch TP-Link 24 Port Gigabit', 10, '24 ports 10/100/1000 Mbps', '2024-01-08', 5500000, 9, 1, NULL, 0),
    ('TS023', 'Access Point Ubiquiti UniFi AP', 10, 'WiFi 6, tốc độ 1200Mbps', '2024-02-05', 3500000, 9, 1, NULL, 0),
    
    -- Máy chiếu
    ('TS024', 'Máy chiếu Epson EB-X06', 7, 'XGA 1024x768, 3600 lumens', '2024-01-20', 8500000, 1, 1, NULL, 0),
    ('TS025', 'Máy chiếu BenQ MH535', 7, 'Full HD 1920x1080, 3600 lumens', '2024-03-15', 12000000, 10, 2, NULL, 0),
    
    -- Tủ tài liệu
    ('TS026', 'Tủ tài liệu gỗ 5 ngăn', 5, 'Gỗ công nghiệp, 5 ngăn kéo, khóa', '2024-01-10', 4500000, 3, 1, NULL, 0),
    ('TS027', 'Tủ sắt văn phòng 4 ngăn', 5, 'Sắt sơn tĩnh điện, 4 ngăn, khóa an toàn', '2024-02-08', 3200000, 4, 1, NULL, 0),
    
    -- Xe
    ('TS028', 'Xe máy Honda SH 150i', 9, 'Màu đen, đời 2023, biển số 59A1-12345', '2023-12-20', 85000000, 7, 1, 1, 0),
    ('TS029', 'Xe máy Yamaha Exciter 155', 9, 'Màu xanh, đời 2023, biển số 59A1-54321', '2023-12-20', 48000000, 7, 1, 2, 0),
    ('TS030', 'Xe ô tô Toyota Vios', 8, 'Màu trắng, đời 2022, số tự động, biển số 59A-12345', '2023-11-15', 520000000, 7, 1, 1, 0);

-- =====================================================
-- 11. DỮ LIỆU MẪU - LỊCH SỬ QUÉT QR
-- =====================================================
INSERT INTO lichsuquet (taisan_id, nguoidung_id, thoigianquet) VALUES
    (1, 3, '2024-10-01 08:30:00'),
    (1, 3, '2024-10-15 14:20:00'),
    (2, 4, '2024-10-05 09:15:00'),
    (5, 1, '2024-10-20 10:45:00'),
    (11, 2, '2024-10-22 15:30:00'),
    (28, 1, '2024-10-25 16:00:00'),
    (30, 1, '2024-10-28 08:15:00');

-- =====================================================
-- 12. DỮ LIỆU MẪU - LUÂN CHUYỂN
-- =====================================================
INSERT INTO luanchuyen (loaiphieu, taisan_id, nguoigiao_id, nguoinhan_id, vitri_id, ngaythuchien, lydo) VALUES
    ('BANGIAO', 1, 1, 3, 1, '2024-01-15', 'Bàn giao máy tính cho nhân viên mới'),
    ('BANGIAO', 2, 1, 4, 2, '2024-01-20', 'Bàn giao máy tính cho trưởng phòng'),
    ('DIEUCHUYEN', 3, 3, 3, 5, '2024-02-20', 'Chuyển máy tính sang phòng Kỹ thuật'),
    ('BANGIAO', 5, 1, 1, 1, '2024-01-25', 'Bàn giao laptop cho admin'),
    ('BANGIAO', 28, 1, 1, 7, '2023-12-20', 'Bàn giao xe máy Honda SH'),
    ('BANGIAO', 30, 1, 1, 7, '2023-11-15', 'Bàn giao xe ô tô Toyota Vios');

-- =====================================================
-- 13. DỮ LIỆU MẪU - BẢO TRÌ
-- =====================================================
INSERT INTO baotri (taisan_id, loaibaotri, nguoibao_id, ngaybao, motahuhong, trangthaixuly, ngayhoanthanh, chiphi, ketqua, ngaybaotritieptheo) VALUES
    (13, 'SUACHUA', 2, '2024-03-25', 'Máy in bị kẹt giấy, không in được', 'HOANTHANH', '2024-03-26', 350000, 'Đã thay roller và vệ sinh máy in', NULL),
    (20, 'SUACHUA', 3, '2024-03-01', 'Điều hòa không lạnh, có tiếng kêu lạ', 'HOANTHANH', '2024-03-03', 1500000, 'Đã bơm gas và vệ sinh dàn nóng', '2024-09-03'),
    (3, 'DINHKY', 3, '2024-10-15', 'Bảo trì định kỳ 6 tháng', 'DANGXULY', NULL, 0, NULL, NULL),
    (28, 'DINHKY', 1, '2024-06-20', 'Bảo dưỡng định kỳ xe máy', 'HOANTHANH', '2024-06-20', 350000, 'Thay dầu, vệ sinh xe', '2024-12-20'),
    (30, 'DINHKY', 1, '2024-05-15', 'Bảo dưỡng định kỳ 10.000km', 'HOANTHANH', '2024-05-15', 2500000, 'Thay dầu máy, lọc gió, kiểm tra phanh', '2024-11-15');

-- =====================================================
-- 14. DỮ LIỆU MẪU - LỊCH SỬ TRẠNG THÁI
-- =====================================================
INSERT INTO lichsutrangthai (taisan_id, trangthaitaisan_id, nguoidung_id, thoigian) VALUES
    (1, 1, 1, '2024-01-15 08:00:00'),
    (2, 1, 1, '2024-01-20 08:00:00'),
    (13, 1, 1, '2024-02-15 08:00:00'),
    (13, 3, 2, '2024-03-25 09:00:00'),
    (13, 1, 1, '2024-03-26 16:00:00'),
    (20, 1, 1, '2024-02-18 08:00:00'),
    (20, 4, 3, '2024-03-01 10:00:00'),
    (20, 1, 1, '2024-03-03 15:00:00');

-- =====================================================
-- 15. DỮ LIỆU MẪU - KIỂM KÊ
-- =====================================================
INSERT INTO dotkiemke (tendot, donvi_id, ngaybatdau, trangthai) VALUES
    ('Kiểm kê Quý 1 - 2024', NULL, '2024-03-01', 'DADONG'),
    ('Kiểm kê định kỳ tháng 10/2024', 1, '2024-10-01', 'DANGMO');

-- Chi tiết kiểm kê đợt 1 (đã đóng)
INSERT INTO chitietkiemke (dotkiemke_id, taisan_id, vitrithucte_id, ketqua, nguoidung_id, thoigiankiem) VALUES
    (1, 1, 1, 'CO', 3, '2024-03-02 08:30:00'),
    (1, 2, 2, 'CO', 4, '2024-03-02 09:00:00'),
    (1, 3, 5, 'CO', 3, '2024-03-03 10:15:00'),
    (1, 5, 1, 'CO', 1, '2024-03-02 14:20:00'),
    (1, 11, 7, 'CO', 2, '2024-03-04 09:45:00'),
    (1, 18, 1, 'CO', 3, '2024-03-02 11:00:00'),
    (1, 19, 3, 'CO', 4, '2024-03-03 13:30:00');

-- Chi tiết kiểm kê đợt 2 (đang mở)
INSERT INTO chitietkiemke (dotkiemke_id, taisan_id, vitrithucte_id, ketqua, nguoidung_id, thoigiankiem) VALUES
    (2, 1, 1, 'CO', 3, '2024-10-02 08:15:00'),
    (2, 2, 2, 'CO', 4, '2024-10-02 08:30:00'),
    (2, 5, 1, 'CO', 1, '2024-10-03 09:00:00'),
    (2, 8, 1, 'CO', 3, '2024-10-02 10:45:00'),
    (2, 14, 1, 'CO', 3, '2024-10-02 11:00:00'),
    (2, 16, 1, 'CO', 3, '2024-10-02 11:15:00'),
    (2, 18, 1, 'CHUAKIEM', NULL, NULL),
    (2, 28, 7, 'CO', 1, '2024-10-05 08:00:00');

-- =====================================================
-- 16. VIEW - BÁO CÁO & THỐNG KÊ
-- =====================================================
CREATE VIEW thongketheotrangthai AS
SELECT tt.matrangthai, tt.tentrangthai, COUNT(ts.taisan_id) AS soluong
FROM trangthaitaisan tt
LEFT JOIN taisan ts ON ts.trangthaitaisan_id = tt.trangthaitaisan_id AND ts.daxoa = 0
GROUP BY tt.trangthaitaisan_id, tt.matrangthai, tt.tentrangthai;

CREATE VIEW chitiettaisan AS
SELECT ts.taisan_id, ts.mataisan, ts.tentaisan, lt.tenloai,
       ts.thongsokythuat, ts.ngaynhap, ts.giatri,
       vt.tenvitri, dv.tendonvi,
       tt.matrangthai, tt.tentrangthai,
       nd.hoten AS nguoisudung
FROM taisan ts
JOIN loaitaisan lt      ON lt.loaitaisan_id = ts.loaitaisan_id
JOIN trangthaitaisan tt ON tt.trangthaitaisan_id = ts.trangthaitaisan_id
LEFT JOIN vitri vt      ON vt.vitri_id = ts.vitri_id
LEFT JOIN donvi dv      ON dv.donvi_id = vt.donvi_id
LEFT JOIN nguoidung nd  ON nd.nguoidung_id = ts.nguoisudung_id
WHERE ts.daxoa = 0;

-- =====================================================
-- KẾT THÚC FILE SQL
-- Tổng hợp:
-- - 13 tables
-- - 2 views
-- - 5 người dùng (2 default + 3 nhân viên)
-- - 30 tài sản mẫu
-- - Lịch sử quét, luân chuyển, bảo trì, kiểm kê
-- =====================================================
