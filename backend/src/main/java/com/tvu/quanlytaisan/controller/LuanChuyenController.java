package com.tvu.quanlytaisan.controller;

import com.tvu.quanlytaisan.dto.request.LuanChuyenRequest;
import com.tvu.quanlytaisan.dto.response.ApiResponse;
import com.tvu.quanlytaisan.dto.response.LuanChuyenResponse;
import com.tvu.quanlytaisan.entity.NguoiDung;
import com.tvu.quanlytaisan.enums.LoaiPhieu;
import com.tvu.quanlytaisan.exception.ResourceNotFoundException;
import com.tvu.quanlytaisan.repository.NguoiDungRepository;
import com.tvu.quanlytaisan.service.LuanChuyenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/luanchuyen")
@RequiredArgsConstructor
public class LuanChuyenController {

    private final LuanChuyenService luanChuyenService;
    private final NguoiDungRepository nguoiDungRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERM_LUANCHUYEN')")
    public ResponseEntity<ApiResponse<Page<LuanChuyenResponse>>> getAll(
            @RequestParam(required = false) LoaiPhieu loaiphieu,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Order.desc("ngaythuchien"), Sort.Order.desc("luanchuyenId")));
        Page<LuanChuyenResponse> response = luanChuyenService.getAll(
                loaiphieu, keyword, tuNgay, denNgay, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERM_LUANCHUYEN')")
    public ResponseEntity<ApiResponse<LuanChuyenResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(luanChuyenService.getById(id)));
    }

    // Lịch sử luân chuyển của một tài sản - mọi người đã đăng nhập đều xem được
    @GetMapping("/taisan/{taisanId}")
    public ResponseEntity<ApiResponse<List<LuanChuyenResponse>>> getByTaisan(
            @PathVariable Long taisanId) {
        return ResponseEntity.ok(ApiResponse.success(luanChuyenService.getByTaisan(taisanId)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERM_LUANCHUYEN')")
    public ResponseEntity<ApiResponse<LuanChuyenResponse>> create(
            @Valid @RequestBody LuanChuyenRequest request,
            Authentication authentication) {
        Long nguoidungHienTaiId = getNguoidungIdFromAuthentication(authentication);
        LuanChuyenResponse response = luanChuyenService.create(request, nguoidungHienTaiId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo phiếu luân chuyển thành công", response));
    }

    private Long getNguoidungIdFromAuthentication(Authentication authentication) {
        String username = authentication.getName();
        NguoiDung nguoiDung = nguoiDungRepository.findByTendangnhap(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        return nguoiDung.getNguoidungId();
    }
}
