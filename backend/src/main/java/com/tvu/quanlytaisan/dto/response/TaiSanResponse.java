package com.tvu.quanlytaisan.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaiSanResponse {
    
    private Long taisanId;
    private String mataisan;
    private String tentaisan;
    
    // Thong tin loai tai san
    private Integer loaitaisanId;
    private String tenloai;
    
    private String thongsokythuat;
    private LocalDate ngaymua;
    private BigDecimal giatri;
    
    // Thong tin khau hao
    private Integer thoigianSudung;
    private BigDecimal tileThanhLy;
    private Long soNgayDaSuDung;
    private BigDecimal soNamDaSuDung;
    private BigDecimal giaTriThanhLy;
    private BigDecimal khauHaoNam;
    private BigDecimal tongKhauHao;
    private BigDecimal tyleKhauHao;
    private BigDecimal giaTriConLai;
    
    // Thong tin vi tri
    private Integer vitriId;
    private String tenvitri;
    
    // Thong tin don vi (tu vi tri)
    private Integer donviId;
    private String tendonvi;
    
    // Thong tin trang thai
    private Integer trangthaitaisanId;
    private String matrangthai;
    private String tentrangthai;
    
    // Thong tin nguoi su dung
    private Long nguoisudungId;
    private String tennguoisudung;
    
    private Boolean daxoa;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // QR Code (base64 string)
    private String qrCode;
}
