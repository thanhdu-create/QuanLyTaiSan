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
public class LoginResponse {
    private String token;
    
    @Builder.Default
    private String type = "Bearer";
    private Long nguoidungId;
    private String tendangnhap;
    private String hoten;
    private String email;
    private VaiTro vaitro;
    private List<String> quyenhan;
}
