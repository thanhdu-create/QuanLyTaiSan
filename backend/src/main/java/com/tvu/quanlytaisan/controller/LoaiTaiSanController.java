package com.tvu.quanlytaisan.controller;

import com.tvu.quanlytaisan.dto.request.LoaiTaiSanRequest;
import com.tvu.quanlytaisan.dto.response.ApiResponse;
import com.tvu.quanlytaisan.dto.response.LoaiTaiSanResponse;
import com.tvu.quanlytaisan.service.LoaiTaiSanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/loai-tai-san")
@RequiredArgsConstructor
public class LoaiTaiSanController {
    
    private final LoaiTaiSanService loaiTaiSanService;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<List<LoaiTaiSanResponse>>> getAllLoaiTaiSan() {
        List<LoaiTaiSanResponse> response = loaiTaiSanService.getAllLoaiTaiSan();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<LoaiTaiSanResponse>> getLoaiTaiSanById(@PathVariable Integer id) {
        LoaiTaiSanResponse response = loaiTaiSanService.getLoaiTaiSanById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERM_LOAITAISAN')")
    public ResponseEntity<ApiResponse<LoaiTaiSanResponse>> createLoaiTaiSan(@Valid @RequestBody LoaiTaiSanRequest request) {
        LoaiTaiSanResponse response = loaiTaiSanService.createLoaiTaiSan(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo loại tài sản thành công", response));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERM_LOAITAISAN')")
    public ResponseEntity<ApiResponse<LoaiTaiSanResponse>> updateLoaiTaiSan(
            @PathVariable Integer id,
            @Valid @RequestBody LoaiTaiSanRequest request) {
        LoaiTaiSanResponse response = loaiTaiSanService.updateLoaiTaiSan(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật loại tài sản thành công", response));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERM_LOAITAISAN')")
    public ResponseEntity<ApiResponse<Void>> deleteLoaiTaiSan(@PathVariable Integer id) {
        loaiTaiSanService.deleteLoaiTaiSan(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa loại tài sản thành công"));
    }
}
