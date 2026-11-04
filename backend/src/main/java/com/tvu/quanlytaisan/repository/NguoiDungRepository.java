package com.tvu.quanlytaisan.repository;

import com.tvu.quanlytaisan.entity.NguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NguoiDungRepository extends JpaRepository<NguoiDung, Long> {
    Optional<NguoiDung> findByTendangnhap(String tendangnhap);
    boolean existsByTendangnhap(String tendangnhap);
    boolean existsByTendangnhapAndNguoidungIdNot(String tendangnhap, Long nguoidungId);
    boolean existsByEmail(String email);
    boolean existsByEmailAndNguoidungIdNot(String email, Long nguoidungId);
    List<NguoiDung> findByHoatdong(Boolean hoatdong);
}
