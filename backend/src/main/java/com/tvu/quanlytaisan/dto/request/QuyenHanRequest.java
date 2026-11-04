package com.tvu.quanlytaisan.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuyenHanRequest {

    @NotNull(message = "Danh sách quyền không được để trống")
    private List<String> quyenhan;
}
