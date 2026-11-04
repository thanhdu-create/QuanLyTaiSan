package com.tvu.quanlytaisan.entity;

import com.tvu.quanlytaisan.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "nguoidung")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class NguoiDung extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "nguoidung_id")
    private Long nguoidungId;
    
    @Column(name = "tendangnhap", length = 50, nullable = false, unique = true)
    private String tendangnhap;
    
    @Column(name = "matkhaumahoa", length = 255, nullable = false)
    private String matkhaumahoa;
    
    @Column(name = "hoten", length = 100, nullable = false)
    private String hoten;
    
    @Column(name = "email", length = 100, unique = true)
    private String email;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "vaitro", length = 20, nullable = false)
    private com.tvu.quanlytaisan.enums.VaiTro vaitro;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donvi_id")
    private DonVi donvi;
    
    @Column(name = "hoatdong", nullable = false)
    private Boolean hoatdong = true;

    // CSV các mã trang admin được cấp quyền, VD: "LUANCHUYEN,BAOTRI"
    @Column(name = "quyenhan", length = 500)
    private String quyenhan;
}
