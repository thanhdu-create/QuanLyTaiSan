package com.tvu.quanlytaisan.repository;

import com.tvu.quanlytaisan.entity.LuanChuyen;
import com.tvu.quanlytaisan.enums.LoaiPhieu;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LuanChuyenRepository extends JpaRepository<LuanChuyen, Long> {

    // Tim kiem co bo loc loai phieu
    @Query("SELECT l FROM LuanChuyen l WHERE l.loaiphieu = :loaiphieu " +
           "AND (:keyword IS NULL OR LOWER(l.taisan.tentaisan) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(l.taisan.mataisan) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:tuNgay IS NULL OR l.ngaythuchien >= :tuNgay) " +
           "AND (:denNgay IS NULL OR l.ngaythuchien <= :denNgay)")
    Page<LuanChuyen> search(@Param("loaiphieu") LoaiPhieu loaiphieu,
                            @Param("keyword") String keyword,
                            @Param("tuNgay") LocalDate tuNgay,
                            @Param("denNgay") LocalDate denNgay,
                            Pageable pageable);

    // Tim kiem khong loc loai phieu
    @Query("SELECT l FROM LuanChuyen l WHERE " +
           "(:keyword IS NULL OR LOWER(l.taisan.tentaisan) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(l.taisan.mataisan) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:tuNgay IS NULL OR l.ngaythuchien >= :tuNgay) " +
           "AND (:denNgay IS NULL OR l.ngaythuchien <= :denNgay)")
    Page<LuanChuyen> search(@Param("keyword") String keyword,
                            @Param("tuNgay") LocalDate tuNgay,
                            @Param("denNgay") LocalDate denNgay,
                            Pageable pageable);

    // Lich su luan chuyen cua mot tai san (cho timeline)
    List<LuanChuyen> findByTaisan_TaisanIdOrderByNgaythuchienDescLuanchuyenIdDesc(Long taisanId);

    // Danh sach phieu luan chuyen sap xep moi nhat truoc
    List<LuanChuyen> findAllByOrderByNgaythuchienDescLuanchuyenIdDesc();

    // Phieu luan chuyen lien quan den nguoi dung hoac don vi cua ho
    @Query("SELECT l FROM LuanChuyen l " +
           "LEFT JOIN l.nguoigiao ng LEFT JOIN l.nguoinhan nn " +
           "LEFT JOIN l.donvigiao dg LEFT JOIN l.donvinhan dn " +
           "WHERE ng.nguoidungId = :nguoidungId OR nn.nguoidungId = :nguoidungId " +
           "OR (:donviId IS NOT NULL AND (dg.donviId = :donviId OR dn.donviId = :donviId)) " +
           "ORDER BY l.ngaythuchien DESC, l.luanchuyenId DESC")
    List<LuanChuyen> findLienQuan(@Param("nguoidungId") Long nguoidungId,
                                  @Param("donviId") Integer donviId);
}
