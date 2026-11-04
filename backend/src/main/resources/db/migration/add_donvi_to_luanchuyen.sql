-- =====================================================
-- MIGRATION: Phiếu luân chuyển cho phép bên giao/nhận là đơn vị
-- Thêm: donvigiao_id, donvinhan_id (FK -> donvi)
-- Bên giao/nhận có thể là người (nguoidung) HOẶC đơn vị (donvi)
-- =====================================================

ALTER TABLE luanchuyen
    ADD COLUMN donvigiao_id INT UNSIGNED NULL COMMENT 'Đơn vị bàn giao (nếu giao theo đơn vị)',
    ADD COLUMN donvinhan_id  INT UNSIGNED NULL COMMENT 'Đơn vị nhận (nếu nhận theo đơn vị)';

ALTER TABLE luanchuyen
    ADD CONSTRAINT fk_luanchuyen_donvigiao FOREIGN KEY (donvigiao_id)
        REFERENCES donvi(donvi_id) ON DELETE SET NULL;

ALTER TABLE luanchuyen
    ADD CONSTRAINT fk_luanchuyen_donvinhan FOREIGN KEY (donvinhan_id)
        REFERENCES donvi(donvi_id) ON DELETE SET NULL;

-- Chuẩn hóa updated_at cho khớp pattern của dự án (donvi, vitri):
-- nullable để Hibernate ghi NULL khi tạo mới, tự cập nhật khi sửa
ALTER TABLE luanchuyen
    MODIFY updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP;
