package com.tvu.quanlytaisan.controller;

import com.tvu.quanlytaisan.dto.request.NguoiDungRequest;
import com.tvu.quanlytaisan.dto.request.QuyenHanRequest;
import com.tvu.quanlytaisan.dto.response.ApiResponse;
import com.tvu.quanlytaisan.dto.response.NguoiDungResponse;
import com.tvu.quanlytaisan.service.NguoiDungService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/nguoidung")
@RequiredArgsConstructor
public class NguoiDungController {

    private final NguoiDungService nguoiDungService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<NguoiDungResponse>>> getAll(
            @RequestParam(required = false) Boolean hoatdong) {
        return ResponseEntity.ok(ApiResponse.success(nguoiDungService.getAll(hoatdong)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<NguoiDungResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(nguoiDungService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<NguoiDungResponse>> create(
            @Valid @RequestBody NguoiDungRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo người dùng thành công", nguoiDungService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<NguoiDungResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody NguoiDungRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật người dùng thành công", nguoiDungService.update(id, request)));
    }

    @PutMapping("/{id}/quyenhan")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<NguoiDungResponse>> updateQuyenHan(
            @PathVariable Long id,
            @Valid @RequestBody QuyenHanRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật quyền truy cập thành công",
                nguoiDungService.updateQuyenHan(id, request.getQuyenhan())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        nguoiDungService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa người dùng thành công"));
    }
}
