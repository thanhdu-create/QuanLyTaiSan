package com.tvu.quanlytaisan.repository;

import com.tvu.quanlytaisan.entity.DotKiemKe;
import com.tvu.quanlytaisan.enums.TrangThaiDotKiemKe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DotKiemKeRepository extends JpaRepository<DotKiemKe, Long> {
    List<DotKiemKe> findByTrangthaiOrderByNgaybatdauDesc(TrangThaiDotKiemKe trangthai);
    List<DotKiemKe> findAllByOrderByNgaybatdauDesc();

    // Dot dang mo ap dung cho don vi (gom ca dot toan truong)
    @Query("SELECT d FROM DotKiemKe d WHERE d.trangthai = :trangthai " +
           "AND (:donviId IS NULL OR d.donvi IS NULL OR d.donvi.donviId = :donviId) " +
           "ORDER BY d.ngaybatdau DESC")
    List<DotKiemKe> findDangMoTaiDonVi(@Param("trangthai") TrangThaiDotKiemKe trangthai,
                                       @Param("donviId") Integer donviId);
}
