package com.tvu.quanlytaisan.dto.request;

import com.tvu.quanlytaisan.enums.LoaiPhieu;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LuanChuyenRequest {

    @NotNull(message = "Loại phiếu là bắt buộc")
    private LoaiPhieu loaiphieu;

    @NotNull(message = "Tài sản là bắt buộc")
    private Long taisanId;

    // Bên giao: bắt buộc chọn 1 trong 2 (người hoặc đơn vị) — validate trong Service
    private Long nguoigiaoId;
    private Integer donvigiaoId;

    // Bên nhận: bắt buộc chọn 1 trong 2 (người hoặc đơn vị) — validate trong Service
    private Long nguoinhanId;
    private Integer donvinhanId;

    // Không bắt buộc: nếu có thì cập nhật vị trí mới cho phiếu và tài sản
    private Integer vitriId;

    // Mặc định hôm nay nếu bỏ trống
    private LocalDate ngaythuchien;

    @Size(max = 500, message = "Lý do tối đa 500 ký tự")
    private String lydo;
}
