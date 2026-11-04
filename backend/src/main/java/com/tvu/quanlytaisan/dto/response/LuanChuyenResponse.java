package com.tvu.quanlytaisan.dto.response;

import com.tvu.quanlytaisan.enums.LoaiPhieu;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LuanChuyenResponse {

    private Long luanchuyenId;
    private LoaiPhieu loaiphieu;

    private Long taisanId;
    private String mataisan;
    private String tentaisan;

    private Long nguoigiaoId;
    private String tenNguoiGiao;
    private Integer donvigiaoId;
    private String tenDonViGiao;

    private Long nguoinhanId;
    private String tenNguoiNhan;
    private Integer donvinhanId;
    private String tenDonViNhan;

    private Integer vitriId;
    private String tenViTri;
    private String tenDonVi;

    private LocalDate ngaythuchien;
    private String lydo;
}
