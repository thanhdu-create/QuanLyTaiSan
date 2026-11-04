package com.tvu.quanlytaisan.repository;

import com.tvu.quanlytaisan.entity.BaoTri;
import com.tvu.quanlytaisan.enums.TrangThaiXuLy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BaoTriRepository extends JpaRepository<BaoTri, Long> {
    
    // Lay tat ca phieu bao tri theo trang thai
    List<BaoTri> findByTrangthaixuly(TrangThaiXuLy trangthaixuly);
    
    // Lay tat ca phieu bao tri cua mot tai san
    @Query("SELECT bt FROM BaoTri bt WHERE bt.taisan.taisanId = :taisanId ORDER BY bt.ngaybao DESC")
    List<BaoTri> findByTaiSanId(@Param("taisanId") Long taisanId);
    
    // Tim kiem phieu bao tri theo ma tai san
    @Query("SELECT bt FROM BaoTri bt WHERE bt.taisan.mataisan LIKE %:keyword% OR bt.taisan.tentaisan LIKE %:keyword% ORDER BY bt.ngaybao DESC")
    List<BaoTri> searchByKeyword(@Param("keyword") String keyword);
    
    // Dem so phieu theo trang thai
    long countByTrangthaixuly(TrangThaiXuLy trangthaixuly);
    
    // Tinh tong chi phi bao tri
    @Query("SELECT COALESCE(SUM(bt.chiphi), 0) FROM BaoTri bt WHERE bt.trangthaixuly = 'HOANTHANH'")
    Double getTongChiPhi();
    
    // Tinh tong chi phi bao tri theo thang
    @Query("SELECT COALESCE(SUM(bt.chiphi), 0) FROM BaoTri bt WHERE bt.trangthaixuly = 'HOANTHANH' AND YEAR(bt.ngayhoanthanh) = :year AND MONTH(bt.ngayhoanthanh) = :month")
    Double getChiPhiTheoThang(@Param("year") int year, @Param("month") int month);
    
    // Tinh tong chi phi bao tri theo nam
    @Query("SELECT COALESCE(SUM(bt.chiphi), 0) FROM BaoTri bt WHERE bt.trangthaixuly = 'HOANTHANH' AND YEAR(bt.ngayhoanthanh) = :year")
    Double getChiPhiTheoNam(@Param("year") int year);
    
    // Lay danh sach tai san can bao tri dinh ky
    @Query("SELECT bt FROM BaoTri bt WHERE bt.ngaybaotritieptheo IS NOT NULL AND bt.ngaybaotritieptheo <= :ngay")
    List<BaoTri> getTaiSanCanBaoTri(@Param("ngay") LocalDate ngay);

    // Danh sach phieu bao tri sap xep moi nhat truoc
    List<BaoTri> findAllByOrderByNgaybaoDescBaotriIdDesc();

    // Dem so phieu bao tri qua han bao tri tiep theo ma chua hoan thanh
    @Query("SELECT COUNT(bt) FROM BaoTri bt WHERE bt.ngaybaotritieptheo IS NOT NULL " +
           "AND bt.ngaybaotritieptheo < :ngay AND bt.trangthaixuly IN ('CHOXULY', 'DANGXULY')")
    long countQuaHan(@Param("ngay") LocalDate ngay);

    // --- Pham vi don vi (dashboard nguoi dung) ---

    @Query("SELECT bt FROM BaoTri bt WHERE bt.taisan.vitri.donvi.donviId = :donviId " +
           "ORDER BY bt.ngaybao DESC, bt.baotriId DESC")
    List<BaoTri> findGanDayByDonVi(@Param("donviId") Integer donviId);

    @Query("SELECT COUNT(bt) FROM BaoTri bt WHERE bt.taisan.vitri.donvi.donviId = :donviId " +
           "AND bt.trangthaixuly = :trangthai")
    long countByDonViAndTrangthai(@Param("donviId") Integer donviId,
                                  @Param("trangthai") TrangThaiXuLy trangthai);

    @Query("SELECT COUNT(bt) FROM BaoTri bt WHERE bt.taisan.vitri.donvi.donviId = :donviId " +
           "AND bt.ngaybaotritieptheo IS NOT NULL AND bt.ngaybaotritieptheo < :ngay " +
           "AND bt.trangthaixuly IN ('CHOXULY', 'DANGXULY')")
    long countQuaHanByDonVi(@Param("donviId") Integer donviId, @Param("ngay") LocalDate ngay);

    // --- Pham vi ca nhan (nguoi dung khong thuoc don vi) ---

    @Query("SELECT bt FROM BaoTri bt WHERE bt.taisan.nguoisudung.nguoidungId = :nguoidungId " +
           "ORDER BY bt.ngaybao DESC, bt.baotriId DESC")
    List<BaoTri> findGanDayByNguoiDung(@Param("nguoidungId") Long nguoidungId);

    @Query("SELECT COUNT(bt) FROM BaoTri bt WHERE bt.taisan.nguoisudung.nguoidungId = :nguoidungId " +
           "AND bt.trangthaixuly = :trangthai")
    long countByNguoiDungAndTrangthai(@Param("nguoidungId") Long nguoidungId,
                                      @Param("trangthai") TrangThaiXuLy trangthai);

    @Query("SELECT COUNT(bt) FROM BaoTri bt WHERE bt.taisan.nguoisudung.nguoidungId = :nguoidungId " +
           "AND bt.ngaybaotritieptheo IS NOT NULL AND bt.ngaybaotritieptheo < :ngay " +
           "AND bt.trangthaixuly IN ('CHOXULY', 'DANGXULY')")
    long countQuaHanByNguoiDung(@Param("nguoidungId") Long nguoidungId, @Param("ngay") LocalDate ngay);
}
