-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th10 09, 2026 lúc 07:13 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `quanlytaisanqr`
--
CREATE DATABASE IF NOT EXISTS `quanlytaisanqr` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `quanlytaisanqr`;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `baotri`
--

CREATE TABLE `baotri` (
  `baotri_id` bigint(20) UNSIGNED NOT NULL,
  `taisan_id` bigint(20) UNSIGNED NOT NULL,
  `loaibaotri` enum('SUACHUA','DINHKY') NOT NULL,
  `nguoibao_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ngaybao` date NOT NULL,
  `motahuhong` text DEFAULT NULL,
  `trangthaixuly` enum('CHOXULY','DANGXULY','HOANTHANH','DAHUY') NOT NULL DEFAULT 'CHOXULY',
  `ngayhoanthanh` date DEFAULT NULL,
  `chiphi` decimal(15,2) NOT NULL DEFAULT 0.00,
  `ketqua` text DEFAULT NULL,
  `ngaybaotritieptheo` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `baotri`
--

INSERT INTO `baotri` (`baotri_id`, `taisan_id`, `loaibaotri`, `nguoibao_id`, `ngaybao`, `motahuhong`, `trangthaixuly`, `ngayhoanthanh`, `chiphi`, `ketqua`, `ngaybaotritieptheo`, `created_at`, `updated_at`) VALUES
(1, 1, 'SUACHUA', 7, '2026-11-03', 'lỗi xọc màn hình', 'CHOXULY', NULL, 600000.00, NULL, '2027-03-01', '2026-11-03 09:37:42', '2026-11-03 09:37:42');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chitietkiemke`
--

CREATE TABLE `chitietkiemke` (
  `chitietkiemke_id` bigint(20) UNSIGNED NOT NULL,
  `dotkiemke_id` bigint(20) UNSIGNED NOT NULL,
  `taisan_id` bigint(20) UNSIGNED NOT NULL,
  `vitrithucte_id` int(10) UNSIGNED DEFAULT NULL,
  `ketqua` enum('CHUAKIEM','CO','THIEU','LECHVITRI') NOT NULL DEFAULT 'CHUAKIEM',
  `nguoidung_id` bigint(20) UNSIGNED DEFAULT NULL,
  `thoigiankiem` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `chitietkiemke`
--

INSERT INTO `chitietkiemke` (`chitietkiemke_id`, `dotkiemke_id`, `taisan_id`, `vitrithucte_id`, `ketqua`, `nguoidung_id`, `thoigiankiem`, `created_at`, `updated_at`) VALUES
(1, 1, 1, NULL, 'CHUAKIEM', NULL, NULL, '2026-11-02 08:26:10', '2026-11-02 08:26:10');

-- --------------------------------------------------------

--
-- Cấu trúc đóng vai cho view `chitiettaisan`
-- (See below for the actual view)
--
CREATE TABLE `chitiettaisan` (
);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `donvi`
--

CREATE TABLE `donvi` (
  `donvi_id` int(10) UNSIGNED NOT NULL,
  `madonvi` varchar(30) NOT NULL,
  `tendonvi` varchar(150) NOT NULL,
  `donvicha_id` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `donvi`
--

INSERT INTO `donvi` (`donvi_id`, `madonvi`, `tendonvi`, `donvicha_id`, `created_at`, `updated_at`) VALUES
(1, 'DV001', 'Phòng Hành chính', 7, '2026-11-01 07:21:04', '2026-11-01 09:30:56'),
(2, 'DV002', 'Phòng Kế toán', 7, '2026-11-01 07:21:04', '2026-11-01 09:30:50'),
(3, 'DV003', 'Phòng Kỹ thuật', 7, '2026-11-01 07:21:04', '2026-11-01 09:30:45'),
(4, 'DV004', 'Phòng Nhân sự', 7, '2026-11-01 07:21:04', '2026-11-01 09:30:39'),
(5, 'DV005', 'Kho tổng', 7, '2026-11-01 07:21:04', '2026-11-01 09:30:32'),
(6, 'DV2537230673', 'Trường Kỹ thuật và Công nghệ', NULL, '2026-11-01 09:29:35', '2026-11-01 09:29:35'),
(7, 'DV2538865581', 'Khoa Công nghệ Thông tin', 6, '2026-11-01 09:30:00', '2026-11-01 09:30:09');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `dotkiemke`
--

CREATE TABLE `dotkiemke` (
  `dotkiemke_id` bigint(20) UNSIGNED NOT NULL,
  `tendot` varchar(150) NOT NULL,
  `donvi_id` int(10) UNSIGNED DEFAULT NULL,
  `ngaybatdau` date NOT NULL,
  `trangthai` enum('DANGMO','DADONG') NOT NULL DEFAULT 'DANGMO',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `dotkiemke`
--

INSERT INTO `dotkiemke` (`dotkiemke_id`, `tendot`, `donvi_id`, `ngaybatdau`, `trangthai`, `created_at`, `updated_at`) VALUES
(1, 'Kiểm kê tài sản đợt 1 năm 2027', 1, '2026-11-02', 'DANGMO', '2026-11-02 08:26:10', '2026-11-02 08:26:10');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lichsuquet`
--

CREATE TABLE `lichsuquet` (
  `lichsuquet_id` bigint(20) UNSIGNED NOT NULL,
  `taisan_id` bigint(20) UNSIGNED NOT NULL,
  `nguoidung_id` bigint(20) UNSIGNED DEFAULT NULL,
  `thoigianquet` datetime NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lichsutrangthai`
--

CREATE TABLE `lichsutrangthai` (
  `lichsutrangthai_id` bigint(20) UNSIGNED NOT NULL,
  `taisan_id` bigint(20) UNSIGNED NOT NULL,
  `trangthaitaisan_id` tinyint(3) UNSIGNED NOT NULL,
  `nguoidung_id` bigint(20) UNSIGNED DEFAULT NULL,
  `thoigian` datetime NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `lichsutrangthai`
--

INSERT INTO `lichsutrangthai` (`lichsutrangthai_id`, `taisan_id`, `trangthaitaisan_id`, `nguoidung_id`, `thoigian`, `created_at`, `updated_at`) VALUES
(1, 5, 1, 7, '2026-11-04 15:22:35', '2026-11-04 08:22:35', '2026-11-04 08:22:35'),
(2, 5, 2, 7, '2026-11-04 15:22:55', '2026-11-04 08:22:55', '2026-11-04 08:22:55'),
(3, 6, 1, 7, '2026-11-04 16:03:47', '2026-11-04 09:03:47', '2026-11-04 09:03:47'),
(4, 5, 1, 7, '2026-11-04 16:39:59', '2026-11-04 09:39:59', '2026-11-04 09:39:59');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `loaitaisan`
--

CREATE TABLE `loaitaisan` (
  `loaitaisan_id` int(10) UNSIGNED NOT NULL,
  `tenloai` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `loaitaisan`
--

INSERT INTO `loaitaisan` (`loaitaisan_id`, `tenloai`, `created_at`, `updated_at`) VALUES
(1, 'Màn hình máy tính', '2026-10-31 18:28:49', '2026-10-31 18:28:49'),
(2, 'Máy tính', '2026-11-01 07:21:05', '2026-11-01 07:21:05'),
(3, 'Bàn ghế', '2026-11-01 07:21:05', '2026-11-01 07:21:05'),
(4, 'Điều hòa', '2026-11-01 07:21:05', '2026-11-01 07:21:05'),
(5, 'Máy in', '2026-11-01 07:21:05', '2026-11-01 07:21:05'),
(6, 'Tủ tài liệu', '2026-11-01 07:21:05', '2026-11-01 07:21:05'),
(7, 'Điện thoại', '2026-11-01 07:21:05', '2026-11-01 07:21:05'),
(8, 'Máy chiếu', '2026-11-01 07:21:05', '2026-11-01 07:21:05'),
(9, 'Xe ô tô', '2026-11-01 07:21:05', '2026-11-01 07:21:05'),
(10, 'Xe máy', '2026-11-01 07:21:05', '2026-11-01 07:21:05'),
(11, 'Thiết bị mạng', '2026-11-01 07:21:05', '2026-11-01 07:21:05');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `luanchuyen`
--

CREATE TABLE `luanchuyen` (
  `luanchuyen_id` bigint(20) UNSIGNED NOT NULL,
  `loaiphieu` enum('BANGIAO','THUHOI','DIEUCHUYEN') NOT NULL,
  `taisan_id` bigint(20) UNSIGNED NOT NULL,
  `nguoigiao_id` bigint(20) UNSIGNED DEFAULT NULL,
  `nguoinhan_id` bigint(20) UNSIGNED DEFAULT NULL,
  `vitri_id` int(10) UNSIGNED DEFAULT NULL,
  `ngaythuchien` date NOT NULL,
  `lydo` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `donvigiao_id` int(10) UNSIGNED DEFAULT NULL,
  `donvinhan_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `luanchuyen`
--

INSERT INTO `luanchuyen` (`luanchuyen_id`, `loaiphieu`, `taisan_id`, `nguoigiao_id`, `nguoinhan_id`, `vitri_id`, `ngaythuchien`, `lydo`, `created_at`, `updated_at`, `donvigiao_id`, `donvinhan_id`) VALUES
(5, 'BANGIAO', 5, 7, NULL, 3, '2026-11-04', NULL, '2026-11-04 09:39:59', '2026-11-04 16:39:59', NULL, 2),
(6, 'DIEUCHUYEN', 1, NULL, NULL, NULL, '2026-11-04', 'điều chuyển tài sản', '2026-11-04 10:10:23', '2026-11-04 17:10:23', 1, 6);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `nguoidung`
--

CREATE TABLE `nguoidung` (
  `nguoidung_id` bigint(20) UNSIGNED NOT NULL,
  `tendangnhap` varchar(50) NOT NULL,
  `matkhaumahoa` varchar(255) NOT NULL,
  `hoten` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `vaitro` varchar(20) NOT NULL,
  `donvi_id` int(10) UNSIGNED DEFAULT NULL,
  `hoatdong` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `quyenhan` varchar(500) DEFAULT NULL COMMENT 'Mã các trang admin được cấp quyền: LUANCHUYEN, BAOTRI, KIEMKE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `nguoidung`
--

INSERT INTO `nguoidung` (`nguoidung_id`, `tendangnhap`, `matkhaumahoa`, `hoten`, `email`, `vaitro`, `donvi_id`, `hoatdong`, `created_at`, `updated_at`, `quyenhan`) VALUES
(7, 'admin', 'admin123', 'Administrator', 'admin@quanlytaisan.com', 'ADMIN', NULL, 1, '2026-10-30 08:13:08', '2026-10-30 08:29:35', NULL),
(8, 'user', 'user123', 'User Demo', 'user@quanlytaisan.com', 'USER', NULL, 1, '2026-10-30 08:14:56', '2026-11-04 16:53:21', 'LUANCHUYEN,BAOTRI');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `taisan`
--

CREATE TABLE `taisan` (
  `taisan_id` bigint(20) UNSIGNED NOT NULL,
  `mataisan` varchar(50) NOT NULL,
  `tentaisan` varchar(200) NOT NULL,
  `loaitaisan_id` int(10) UNSIGNED NOT NULL,
  `thongsokythuat` text DEFAULT NULL,
  `ngaymua` date NOT NULL COMMENT 'Ngày mua tài sản (dùng để tính khấu hao)',
  `giatri` decimal(15,2) NOT NULL DEFAULT 0.00,
  `vitri_id` int(10) UNSIGNED DEFAULT NULL,
  `trangthaitaisan_id` tinyint(3) UNSIGNED NOT NULL,
  `nguoisudung_id` bigint(20) UNSIGNED DEFAULT NULL,
  `daxoa` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `thoigian_sudung` int(11) DEFAULT 5 COMMENT 'Thời gian sử dụng dự kiến (năm)',
  `tile_thanhly` decimal(5,2) DEFAULT 10.00 COMMENT 'Tỷ lệ giá trị thanh lý (% của nguyên giá)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `taisan`
--

INSERT INTO `taisan` (`taisan_id`, `mataisan`, `tentaisan`, `loaitaisan_id`, `thongsokythuat`, `ngaymua`, `giatri`, `vitri_id`, `trangthaitaisan_id`, `nguoisudung_id`, `daxoa`, `created_at`, `updated_at`, `thoigian_sudung`, `tile_thanhly`) VALUES
(1, 'TS-0001', 'Màn hình xaomi', 1, 'Màn hình Xiaomi A27 (27 inch) là mẫu màn hình phổ thông được nhiều người lựa chọn nhờ thiết kế viền mỏng hiện đại, mức giá dễ tiếp cận (khoảng 3 triệu đồng) nhưng vẫn trang bị tấm nền IPS chất lượng cao với góc nhìn rộng 178°. Phiên bản nâng cấp mới hỗ trợ tần số quét 144Hz, độ phủ màu 99% sRGB và đạt chứng nhận ánh sáng xanh thấp TÜV Rheinland giúp bảo vệ mắt khi làm việc lâu. Đây là giải pháp hiển thị kinh tế và đáng tin cậy cho nhu cầu làm việc văn phòng, học tập và giải trí cơ bản.', '2025-11-01', 2700000.00, 1, 1, NULL, 0, '2026-11-01 07:57:40', '2026-11-02 08:25:27', 6, 10.00),
(2, 'TS-0002', 'Bàn phím cơ AULA F75', 2, 'Layout: 75% (80 phím, nhỏ gọn, có núm xoay âm lượng tiện lợi).\nCấu trúc: Gasket Mount + 5 lớp foam tiêu âm (cho âm thanh \"thock\" / creamy đầm ấm, êm tay).\nKết nối: 3 chế độ (Wireless 2.4GHz / Bluetooth / Dây Type-C).\nPin: 4,000 mAh (dung lượng lớn, dùng lâu).\nĐiểm cộng: Switch mượt (đã lube sẵn, chuộng nhất LEOBOG Reaper), keycap PBT bền bỉ, hỗ trợ Hot-swap dễ thay switch.', '2026-11-01', 1000000.00, 3, 1, NULL, 0, '2026-11-01 09:34:33', '2026-11-01 09:34:33', 5, 10.00),
(3, 'TS-0003', 'chuột có dây LX2000', 2, NULL, '2026-11-01', 300000.00, 3, 1, NULL, 0, '2026-11-01 16:55:18', '2026-11-01 16:55:18', 5, 10.00),
(4, 'TS-0004', 'chuột không dây RC 500', 2, NULL, '2026-11-02', 500000.00, 3, 1, NULL, 0, '2026-11-01 17:03:21', '2026-11-01 17:03:21', 5, 10.00),
(5, 'TS-TEST-01', 'Máy chiếu test luân chuyển', 1, NULL, '2026-11-01', 15000000.00, 3, 1, NULL, 0, '2026-11-04 08:20:49', '2026-11-04 09:39:59', 5, 10.00),
(6, 'TS-0005', 'Chuột không dây LX 500', 2, 'chột không dây lx 500 giá 800000', '2026-11-04', 800000.00, 7, 1, NULL, 0, '2026-11-04 09:01:58', '2026-11-04 09:11:36', 5, 10.00),
(7, 'TS-0006', 'Màn hình Dell UltraSharp U2724D', 1, 'Màn hình đồ họa 27 inch độ phân giải 2K QHD, tần số quét 120Hz, hiển thị màu sắc chuẩn xác độ phủ màu cao, hỗ trợ nhiều cổng kết nối hiện đại phù hợp cho công việc văn phòng và thiết kế chuyên nghiệp.', '2026-11-04', 0.00, 7, 2, NULL, 0, '2026-11-04 09:43:03', '2026-11-04 09:43:03', 5, 10.00),
(8, 'TS-0007', 'Màn hình LG 24MP88HV-S', 1, 'Màn hình 23.8 inch Full HD với thiết kế 4 viền siêu mỏng ấn tượng, tấm nền IPS cho góc nhìn rộng và màu sắc trung thực, tích hợp loa ngoài tiện lợi cho công việc văn phòng hàng ngày.', '2026-11-04', 4200000.00, 7, 1, NULL, 0, '2026-11-04 09:43:38', '2026-11-04 09:43:38', 5, 10.00),
(9, 'TS-0008', 'Apple MacBook Air M2 13.6 inch', 2, 'Máy tính đồng bộ dành cho doanh nghiệp trang bị vi xử lý Intel Core i5 thế hệ mới, hoạt động bền bỉ, tính bảo mật cao và dễ dàng nâng cấp linh kiện.', '2026-11-04', 0.00, 7, 2, NULL, 0, '2026-11-04 09:44:20', '2026-11-04 09:44:20', 5, 10.00);

-- --------------------------------------------------------

--
-- Cấu trúc đóng vai cho view `thongketheotrangthai`
-- (See below for the actual view)
--
CREATE TABLE `thongketheotrangthai` (
`matrangthai` varchar(20)
,`tentrangthai` varchar(50)
,`soluong` bigint(21)
);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `trangthaitaisan`
--

CREATE TABLE `trangthaitaisan` (
  `trangthaitaisan_id` tinyint(3) UNSIGNED NOT NULL,
  `matrangthai` varchar(20) NOT NULL,
  `tentrangthai` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `trangthaitaisan`
--

INSERT INTO `trangthaitaisan` (`trangthaitaisan_id`, `matrangthai`, `tentrangthai`, `created_at`, `updated_at`) VALUES
(1, 'IN_USE', 'Đang sử dụng', '2026-10-30 07:24:01', '2026-10-30 07:24:01'),
(2, 'AVAILABLE', 'Còn trống', '2026-10-30 07:24:01', '2026-10-30 07:24:01'),
(3, 'MAINTENANCE', 'Đang bảo trì', '2026-10-30 07:24:01', '2026-10-30 07:24:01'),
(4, 'BROKEN', 'Hư hỏng', '2026-10-30 07:24:01', '2026-10-30 07:24:01');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `vitri`
--

CREATE TABLE `vitri` (
  `vitri_id` int(10) UNSIGNED NOT NULL,
  `mavitri` varchar(30) NOT NULL,
  `tenvitri` varchar(150) NOT NULL,
  `donvi_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `vitri`
--

INSERT INTO `vitri` (`vitri_id`, `mavitri`, `tenvitri`, `donvi_id`, `created_at`, `updated_at`) VALUES
(1, 'VT001', 'Phòng 101', 1, '2026-11-01 07:21:05', '2026-11-01 07:21:05'),
(2, 'VT002', 'Phòng 102', 1, '2026-11-01 07:21:05', '2026-11-01 07:21:05'),
(3, 'VT003', 'Phòng 201', 2, '2026-11-01 07:21:05', '2026-11-01 07:21:05'),
(4, 'VT004', 'Phòng 202', 2, '2026-11-01 07:21:05', '2026-11-01 07:21:05'),
(5, 'VT005', 'Phòng 301', 3, '2026-11-01 07:21:05', '2026-11-01 07:21:05'),
(6, 'VT006', 'Phòng 302', 3, '2026-11-01 07:21:05', '2026-11-01 07:21:05'),
(7, 'VT007', 'Khu vực A', 5, '2026-11-01 07:21:05', '2026-11-01 07:21:05'),
(8, 'VT008', 'Khu vực B', 5, '2026-11-01 07:21:05', '2026-11-01 07:21:05');

-- --------------------------------------------------------

--
-- Cấu trúc cho view `chitiettaisan`
--
DROP TABLE IF EXISTS `chitiettaisan`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `chitiettaisan`  AS SELECT `ts`.`taisan_id` AS `taisan_id`, `ts`.`mataisan` AS `mataisan`, `ts`.`tentaisan` AS `tentaisan`, `lt`.`tenloai` AS `tenloai`, `ts`.`thongsokythuat` AS `thongsokythuat`, `ts`.`ngaynhap` AS `ngaynhap`, `ts`.`giatri` AS `giatri`, `vt`.`tenvitri` AS `tenvitri`, `dv`.`tendonvi` AS `tendonvi`, `tt`.`matrangthai` AS `matrangthai`, `tt`.`tentrangthai` AS `tentrangthai`, `nd`.`hoten` AS `nguoisudung` FROM (((((`taisan` `ts` join `loaitaisan` `lt` on(`lt`.`loaitaisan_id` = `ts`.`loaitaisan_id`)) join `trangthaitaisan` `tt` on(`tt`.`trangthaitaisan_id` = `ts`.`trangthaitaisan_id`)) left join `vitri` `vt` on(`vt`.`vitri_id` = `ts`.`vitri_id`)) left join `donvi` `dv` on(`dv`.`donvi_id` = `vt`.`donvi_id`)) left join `nguoidung` `nd` on(`nd`.`nguoidung_id` = `ts`.`nguoisudung_id`)) WHERE `ts`.`daxoa` = 0 ;

-- --------------------------------------------------------

--
-- Cấu trúc cho view `thongketheotrangthai`
--
DROP TABLE IF EXISTS `thongketheotrangthai`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `thongketheotrangthai`  AS SELECT `tt`.`matrangthai` AS `matrangthai`, `tt`.`tentrangthai` AS `tentrangthai`, count(`ts`.`taisan_id`) AS `soluong` FROM (`trangthaitaisan` `tt` left join `taisan` `ts` on(`ts`.`trangthaitaisan_id` = `tt`.`trangthaitaisan_id` and `ts`.`daxoa` = 0)) GROUP BY `tt`.`trangthaitaisan_id`, `tt`.`matrangthai`, `tt`.`tentrangthai` ;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `baotri`
--
ALTER TABLE `baotri`
  ADD PRIMARY KEY (`baotri_id`),
  ADD KEY `fk_baotri_nguoibao` (`nguoibao_id`),
  ADD KEY `idx_baotri_taisan` (`taisan_id`,`ngaybao`),
  ADD KEY `idx_baotri_trangthai` (`trangthaixuly`);

--
-- Chỉ mục cho bảng `chitietkiemke`
--
ALTER TABLE `chitietkiemke`
  ADD PRIMARY KEY (`chitietkiemke_id`),
  ADD UNIQUE KEY `uq_chitietkiemke_dot_taisan` (`dotkiemke_id`,`taisan_id`),
  ADD KEY `fk_chitietkiemke_taisan` (`taisan_id`),
  ADD KEY `fk_chitietkiemke_vitri` (`vitrithucte_id`),
  ADD KEY `fk_chitietkiemke_nguoidung` (`nguoidung_id`);

--
-- Chỉ mục cho bảng `donvi`
--
ALTER TABLE `donvi`
  ADD PRIMARY KEY (`donvi_id`),
  ADD UNIQUE KEY `madonvi` (`madonvi`),
  ADD KEY `fk_donvi_donvicha` (`donvicha_id`);

--
-- Chỉ mục cho bảng `dotkiemke`
--
ALTER TABLE `dotkiemke`
  ADD PRIMARY KEY (`dotkiemke_id`),
  ADD KEY `fk_dotkiemke_donvi` (`donvi_id`);

--
-- Chỉ mục cho bảng `lichsuquet`
--
ALTER TABLE `lichsuquet`
  ADD PRIMARY KEY (`lichsuquet_id`),
  ADD KEY `fk_lichsuquet_nguoidung` (`nguoidung_id`),
  ADD KEY `idx_lichsuquet_taisan` (`taisan_id`,`thoigianquet`);

--
-- Chỉ mục cho bảng `lichsutrangthai`
--
ALTER TABLE `lichsutrangthai`
  ADD PRIMARY KEY (`lichsutrangthai_id`),
  ADD KEY `fk_lichsutrangthai_trangthai` (`trangthaitaisan_id`),
  ADD KEY `fk_lichsutrangthai_nguoidung` (`nguoidung_id`),
  ADD KEY `idx_lichsutrangthai_taisan` (`taisan_id`,`thoigian`);

--
-- Chỉ mục cho bảng `loaitaisan`
--
ALTER TABLE `loaitaisan`
  ADD PRIMARY KEY (`loaitaisan_id`),
  ADD UNIQUE KEY `tenloai` (`tenloai`);

--
-- Chỉ mục cho bảng `luanchuyen`
--
ALTER TABLE `luanchuyen`
  ADD PRIMARY KEY (`luanchuyen_id`),
  ADD KEY `fk_luanchuyen_nguoigiao` (`nguoigiao_id`),
  ADD KEY `fk_luanchuyen_nguoinhan` (`nguoinhan_id`),
  ADD KEY `fk_luanchuyen_vitri` (`vitri_id`),
  ADD KEY `idx_luanchuyen_taisan` (`taisan_id`,`ngaythuchien`),
  ADD KEY `fk_luanchuyen_donvigiao` (`donvigiao_id`),
  ADD KEY `fk_luanchuyen_donvinhan` (`donvinhan_id`);

--
-- Chỉ mục cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  ADD PRIMARY KEY (`nguoidung_id`),
  ADD UNIQUE KEY `tendangnhap` (`tendangnhap`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_nguoidung_donvi` (`donvi_id`);

--
-- Chỉ mục cho bảng `taisan`
--
ALTER TABLE `taisan`
  ADD PRIMARY KEY (`taisan_id`),
  ADD UNIQUE KEY `mataisan` (`mataisan`),
  ADD KEY `fk_taisan_loaitaisan` (`loaitaisan_id`),
  ADD KEY `fk_taisan_nguoisudung` (`nguoisudung_id`),
  ADD KEY `idx_taisan_ten` (`tentaisan`),
  ADD KEY `idx_taisan_vitri` (`vitri_id`),
  ADD KEY `idx_taisan_trangthai` (`trangthaitaisan_id`);

--
-- Chỉ mục cho bảng `trangthaitaisan`
--
ALTER TABLE `trangthaitaisan`
  ADD PRIMARY KEY (`trangthaitaisan_id`),
  ADD UNIQUE KEY `matrangthai` (`matrangthai`);

--
-- Chỉ mục cho bảng `vitri`
--
ALTER TABLE `vitri`
  ADD PRIMARY KEY (`vitri_id`),
  ADD UNIQUE KEY `mavitri` (`mavitri`),
  ADD KEY `fk_vitri_donvi` (`donvi_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `baotri`
--
ALTER TABLE `baotri`
  MODIFY `baotri_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `chitietkiemke`
--
ALTER TABLE `chitietkiemke`
  MODIFY `chitietkiemke_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `donvi`
--
ALTER TABLE `donvi`
  MODIFY `donvi_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `dotkiemke`
--
ALTER TABLE `dotkiemke`
  MODIFY `dotkiemke_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `lichsuquet`
--
ALTER TABLE `lichsuquet`
  MODIFY `lichsuquet_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `lichsutrangthai`
--
ALTER TABLE `lichsutrangthai`
  MODIFY `lichsutrangthai_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `loaitaisan`
--
ALTER TABLE `loaitaisan`
  MODIFY `loaitaisan_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT cho bảng `luanchuyen`
--
ALTER TABLE `luanchuyen`
  MODIFY `luanchuyen_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  MODIFY `nguoidung_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `taisan`
--
ALTER TABLE `taisan`
  MODIFY `taisan_id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `trangthaitaisan`
--
ALTER TABLE `trangthaitaisan`
  MODIFY `trangthaitaisan_id` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `vitri`
--
ALTER TABLE `vitri`
  MODIFY `vitri_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `baotri`
--
ALTER TABLE `baotri`
  ADD CONSTRAINT `fk_baotri_nguoibao` FOREIGN KEY (`nguoibao_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_baotri_taisan` FOREIGN KEY (`taisan_id`) REFERENCES `taisan` (`taisan_id`);

--
-- Các ràng buộc cho bảng `chitietkiemke`
--
ALTER TABLE `chitietkiemke`
  ADD CONSTRAINT `fk_chitietkiemke_dot` FOREIGN KEY (`dotkiemke_id`) REFERENCES `dotkiemke` (`dotkiemke_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_chitietkiemke_nguoidung` FOREIGN KEY (`nguoidung_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_chitietkiemke_taisan` FOREIGN KEY (`taisan_id`) REFERENCES `taisan` (`taisan_id`),
  ADD CONSTRAINT `fk_chitietkiemke_vitri` FOREIGN KEY (`vitrithucte_id`) REFERENCES `vitri` (`vitri_id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `donvi`
--
ALTER TABLE `donvi`
  ADD CONSTRAINT `fk_donvi_donvicha` FOREIGN KEY (`donvicha_id`) REFERENCES `donvi` (`donvi_id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `dotkiemke`
--
ALTER TABLE `dotkiemke`
  ADD CONSTRAINT `fk_dotkiemke_donvi` FOREIGN KEY (`donvi_id`) REFERENCES `donvi` (`donvi_id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `lichsuquet`
--
ALTER TABLE `lichsuquet`
  ADD CONSTRAINT `fk_lichsuquet_nguoidung` FOREIGN KEY (`nguoidung_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_lichsuquet_taisan` FOREIGN KEY (`taisan_id`) REFERENCES `taisan` (`taisan_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `lichsutrangthai`
--
ALTER TABLE `lichsutrangthai`
  ADD CONSTRAINT `fk_lichsutrangthai_nguoidung` FOREIGN KEY (`nguoidung_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_lichsutrangthai_taisan` FOREIGN KEY (`taisan_id`) REFERENCES `taisan` (`taisan_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_lichsutrangthai_trangthai` FOREIGN KEY (`trangthaitaisan_id`) REFERENCES `trangthaitaisan` (`trangthaitaisan_id`);

--
-- Các ràng buộc cho bảng `luanchuyen`
--
ALTER TABLE `luanchuyen`
  ADD CONSTRAINT `fk_luanchuyen_donvigiao` FOREIGN KEY (`donvigiao_id`) REFERENCES `donvi` (`donvi_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_luanchuyen_donvinhan` FOREIGN KEY (`donvinhan_id`) REFERENCES `donvi` (`donvi_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_luanchuyen_nguoigiao` FOREIGN KEY (`nguoigiao_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_luanchuyen_nguoinhan` FOREIGN KEY (`nguoinhan_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_luanchuyen_taisan` FOREIGN KEY (`taisan_id`) REFERENCES `taisan` (`taisan_id`),
  ADD CONSTRAINT `fk_luanchuyen_vitri` FOREIGN KEY (`vitri_id`) REFERENCES `vitri` (`vitri_id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `nguoidung`
--
ALTER TABLE `nguoidung`
  ADD CONSTRAINT `fk_nguoidung_donvi` FOREIGN KEY (`donvi_id`) REFERENCES `donvi` (`donvi_id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `taisan`
--
ALTER TABLE `taisan`
  ADD CONSTRAINT `fk_taisan_loaitaisan` FOREIGN KEY (`loaitaisan_id`) REFERENCES `loaitaisan` (`loaitaisan_id`),
  ADD CONSTRAINT `fk_taisan_nguoisudung` FOREIGN KEY (`nguoisudung_id`) REFERENCES `nguoidung` (`nguoidung_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_taisan_trangthaitaisan` FOREIGN KEY (`trangthaitaisan_id`) REFERENCES `trangthaitaisan` (`trangthaitaisan_id`),
  ADD CONSTRAINT `fk_taisan_vitri` FOREIGN KEY (`vitri_id`) REFERENCES `vitri` (`vitri_id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `vitri`
--
ALTER TABLE `vitri`
  ADD CONSTRAINT `fk_vitri_donvi` FOREIGN KEY (`donvi_id`) REFERENCES `donvi` (`donvi_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
