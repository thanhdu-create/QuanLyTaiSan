-- =====================================================
-- MIGRATION FINAL: Thêm cột Khấu hao
-- Database đã có sẵn: ngaymua, created_at, updated_at
-- Chỉ cần thêm: thoigian_sudung, tile_thanhly
-- =====================================================

-- BƯỚC 1: THÊM CỘT THỜI GIAN SỬ DỤNG
ALTER TABLE taisan 
    ADD COLUMN thoigian_sudung INT DEFAULT 5 
    COMMENT 'Thời gian sử dụng dự kiến (năm)';

-- BƯỚC 2: THÊM CỘT TỶ LỆ THANH LÝ
ALTER TABLE taisan 
    ADD COLUMN tile_thanhly DECIMAL(5,2) DEFAULT 10.00 
    COMMENT 'Tỷ lệ giá trị thanh lý (% của nguyên giá)';

-- BƯỚC 3: CẬP NHẬT GIÁ TRỊ MẶC ĐỊNH CHO DỮ LIỆU CŨ
UPDATE taisan 
SET thoigian_sudung = 5 
WHERE thoigian_sudung IS NULL;

UPDATE taisan 
SET tile_thanhly = 10.00 
WHERE tile_thanhly IS NULL;

-- BƯỚC 4: KIỂM TRA KẾT QUẢ
SELECT 
    taisan_id,
    mataisan,
    tentaisan,
    giatri,
    ngaymua,
    thoigian_sudung,
    tile_thanhly,
    created_at
FROM taisan 
LIMIT 5;

-- BƯỚC 5: TEST TÍNH TOÁN KHẤU HAO
SELECT 
    mataisan,
    tentaisan,
    giatri AS nguyen_gia,
    ngaymua,
    thoigian_sudung AS tg_su_dung_nam,
    tile_thanhly,
    -- Tính toán khấu hao
    ROUND(giatri * (tile_thanhly / 100), 0) AS gia_tri_thanh_ly,
    ROUND(DATEDIFF(CURDATE(), ngaymua) / 365.25, 1) AS da_su_dung_nam,
    ROUND((giatri - (giatri * tile_thanhly / 100)) / thoigian_sudung, 0) AS khau_hao_nam,
    GREATEST(
        ROUND(giatri - ((giatri - (giatri * tile_thanhly / 100)) / thoigian_sudung) * 
        (DATEDIFF(CURDATE(), ngaymua) / 365.25), 0),
        ROUND(giatri * (tile_thanhly / 100), 0)
    ) AS gia_tri_con_lai,
    LEAST(
        ROUND((DATEDIFF(CURDATE(), ngaymua) / 365.25 / thoigian_sudung) * 100, 1), 
        100.0
    ) AS ty_le_khau_hao_percent
FROM taisan 
WHERE daxoa = FALSE
LIMIT 5;

-- =====================================================
-- HOÀN THÀNH! ✅
-- =====================================================
-- Kết quả:
-- ✅ ngaymua (đã có sẵn)
-- ✅ thoigian_sudung (mới thêm)
-- ✅ tile_thanhly (mới thêm)
-- ✅ created_at, updated_at (đã có sẵn)
