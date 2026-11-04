package com.tvu.quanlytaisan.dto.request;

import com.tvu.quanlytaisan.enums.LoaiBaoTri;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BaoTriBatchRequest {
    
    @NotNull(message = "Danh sách tài sản không được để trống")
    @Size(min = 1, max = 100, message = "Danh sách tài sản phải có từ 1 đến 100 phần tử")
    private List<Long> taisanIds;
    
    @NotNull(message = "Loại bảo trì không được để trống")
    private LoaiBaoTri loaibaotri;
    
    @NotNull(message = "Ngày báo không được để trống")
    private LocalDate ngaybao;
    
    private String motahuhong;
    
    private BigDecimal chiphi;
    
    private LocalDate ngaybaotritieptheo;
}
