package com.tvu.quanlytaisan.repository;

import com.tvu.quanlytaisan.entity.LichSuTrangThai;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LichSuTrangThaiRepository extends JpaRepository<LichSuTrangThai, Long> {
    List<LichSuTrangThai> findByTaisan_TaisanIdOrderByThoigianDesc(Long taisanId);
}
