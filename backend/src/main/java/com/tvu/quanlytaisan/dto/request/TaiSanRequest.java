package com.tvu.quanlytaisan.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaiSanRequest {
    
    @NotBlank(message = "Mã tài sản không được để trống")
    @Size(max = 50, message = "Mã tài sản không được quá 50 ký tự")
    private String mataisan;
    
    @NotBlank(message = "Tên tài sản không được để trống")
    @Size(max = 200, message = "Tên tài sản không được quá 200 ký tự")
    private String tentaisan;
    
    @NotNull(message = "Loại tài sản không được để trống")
    private Integer loaitaisanId;
    
    private String thongsokythuat;
    
    @NotNull(message = "Ngày mua không được để trống")
    private LocalDate ngaymua;
    
    @NotNull(message = "Giá trị không được để trống")
    @DecimalMin(value = "0.0", message = "Giá trị phải lớn hơn hoặc bằng 0")
    private BigDecimal giatri;
    
    @Min(value = 1, message = "Thời gian sử dụng phải lớn hơn 0")
    private Integer thoigianSudung = 5;
    
    @DecimalMin(value = "0.0", message = "Tỷ lệ thanh lý phải lớn hơn hoặc bằng 0")
    @DecimalMax(value = "100.0", message = "Tỷ lệ thanh lý không được quá 100%")
    private BigDecimal tileThanhLy = new BigDecimal("10.00");
    
    private Integer vitriId;
    
    @NotNull(message = "Trạng thái tài sản không được để trống")
    private Integer trangthaitaisanId;
    
    private Long nguoisudungId;
}
