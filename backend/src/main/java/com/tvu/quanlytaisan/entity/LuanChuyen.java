package com.tvu.quanlytaisan.entity;

import com.tvu.quanlytaisan.entity.base.BaseEntity;
import com.tvu.quanlytaisan.enums.LoaiPhieu;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "luanchuyen")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class LuanChuyen extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "luanchuyen_id")
    private Long luanchuyenId;

    @Enumerated(EnumType.STRING)
    @Column(name = "loaiphieu", nullable = false)
    private LoaiPhieu loaiphieu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "taisan_id", nullable = false)
    private TaiSan taisan;

    // Bên giao: người (nguoidung) HOẶC đơn vị (donvi)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoigiao_id")
    private NguoiDung nguoigiao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donvigiao_id")
    private DonVi donvigiao;

    // Bên nhận: người (nguoidung) HOẶC đơn vị (donvi)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoinhan_id")
    private NguoiDung nguoinhan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donvinhan_id")
    private DonVi donvinhan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vitri_id")
    private ViTri vitri;

    @Column(name = "ngaythuchien", nullable = false)
    private LocalDate ngaythuchien;

    @Column(name = "lydo", length = 500)
    private String lydo;
}
