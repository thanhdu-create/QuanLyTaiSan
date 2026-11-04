-- =====================================================
-- MIGRATION: Phân quyền truy cập trang admin cho người dùng
-- Cột quyenhan lưu danh sách mã trang, phân tách bằng dấu phẩy
-- Ví dụ: 'LUANCHUYEN,BAOTRI,TAISAN'
-- =====================================================

ALTER TABLE nguoidung
    ADD COLUMN quyenhan VARCHAR(500) NULL
        COMMENT 'Mã các trang admin được cấp quyền: LUANCHUYEN, BAOTRI, KIEMKE, LOAITAISAN, TAISAN, DONVIVITRI';
