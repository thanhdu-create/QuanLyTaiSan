package com.tvu.quanlytaisan.entity;

import com.tvu.quanlytaisan.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "taisan")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class TaiSan extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "taisan_id")
    private Long taisanId;
    
    @Column(name = "mataisan", length = 50, nullable = false, unique = true)
    private String mataisan;
    
    @Column(name = "tentaisan", length = 200, nullable = false)
    private String tentaisan;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loaitaisan_id", nullable = false)
    private LoaiTaiSan loaitaisan;
    
    @Column(name = "thongsokythuat", columnDefinition = "TEXT")
    private String thongsokythuat;
    
    @Column(name = "ngaymua", nullable = false)
    private LocalDate ngaymua;
    
    @Column(name = "giatri", precision = 15, scale = 2, nullable = false)
    private BigDecimal giatri = BigDecimal.ZERO;
    
    @Column(name = "thoigian_sudung")
    private Integer thoigianSudung = 5;
    
    @Column(name = "tile_thanhly", precision = 5, scale = 2)
    private BigDecimal tileThanhLy = new BigDecimal("10.00");
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vitri_id")
    private ViTri vitri;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trangthaitaisan_id", nullable = false)
    private TrangThaiTaiSan trangthaitaisan;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoisudung_id")
    private NguoiDung nguoisudung;
    
    @Column(name = "daxoa", nullable = false)
    private Boolean daxoa = false;
    
    // Removed ngaytao field - using created_at from BaseEntity instead
}
