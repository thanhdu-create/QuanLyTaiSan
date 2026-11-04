package com.tvu.quanlytaisan.controller;

import com.tvu.quanlytaisan.dto.request.DotKiemKeRequest;
import com.tvu.quanlytaisan.dto.request.KiemKeRequest;
import com.tvu.quanlytaisan.dto.response.ApiResponse;
import com.tvu.quanlytaisan.dto.response.ChiTietKiemKeResponse;
import com.tvu.quanlytaisan.dto.response.DotKiemKeResponse;
import com.tvu.quanlytaisan.entity.NguoiDung;
import com.tvu.quanlytaisan.enums.TrangThaiDotKiemKe;
import com.tvu.quanlytaisan.exception.ResourceNotFoundException;
import com.tvu.quanlytaisan.repository.NguoiDungRepository;
import com.tvu.quanlytaisan.service.KiemKeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/kiem-ke")
@RequiredArgsConstructor
public class KiemKeController {
    
    private final KiemKeService kiemKeService;
    private final NguoiDungRepository nguoiDungRepository;
    
    @PostMapping("/dot-kiem-ke")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERM_KIEMKE')")
    public ResponseEntity<ApiResponse<DotKiemKeResponse>> createDotKiemKe(
            @RequestBody DotKiemKeRequest request,
            Authentication authentication) {
        Long nguoidungId = getNguoidungIdFromAuthentication(authentication);
        DotKiemKeResponse response = kiemKeService.createDotKiemKe(request, nguoidungId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/dot-kiem-ke")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<List<DotKiemKeResponse>>> getAllDotKiemKe(
            @RequestParam(required = false) TrangThaiDotKiemKe trangthai) {
        List<DotKiemKeResponse> response;
        if (trangthai != null) {
            response = kiemKeService.getDotKiemKeByTrangthai(trangthai);
        } else {
            response = kiemKeService.getAllDotKiemKe();
        }
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/dot-kiem-ke/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<DotKiemKeResponse>> getDotKiemKeById(@PathVariable Long id) {
        DotKiemKeResponse response = kiemKeService.getDotKiemKeById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/dot-kiem-ke/{id}/chi-tiet")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<List<ChiTietKiemKeResponse>>> getChiTietKiemKe(@PathVariable Long id) {
        List<ChiTietKiemKeResponse> response = kiemKeService.getChiTietKiemKe(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PostMapping("/kiem-tra")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<ChiTietKiemKeResponse>> kiemTraTaiSan(
            @RequestBody KiemKeRequest request,
            Authentication authentication) {
        Long nguoidungId = getNguoidungIdFromAuthentication(authentication);
        ChiTietKiemKeResponse response = kiemKeService.kiemTraTaiSan(request, nguoidungId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PutMapping("/dot-kiem-ke/{id}/dong")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERM_KIEMKE')")
    public ResponseEntity<ApiResponse<DotKiemKeResponse>> dongDotKiemKe(@PathVariable Long id) {
        DotKiemKeResponse response = kiemKeService.dongDotKiemKe(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    /**
     * Helper method to get nguoidungId from authentication
     */
    private Long getNguoidungIdFromAuthentication(Authentication authentication) {
        String username = authentication.getName();
        NguoiDung nguoiDung = nguoiDungRepository.findByTendangnhap(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        return nguoiDung.getNguoidungId();
    }
}
