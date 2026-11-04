package com.tvu.quanlytaisan.dto.response;

import com.tvu.quanlytaisan.enums.VaiTro;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoResponse {
    private Long nguoidungId;
    private String tendangnhap;
    private String hoten;
    private String email;
    private VaiTro vaitro;
    private String tenDonVi;
    private Boolean hoatdong;
    private List<String> quyenhan;
}
