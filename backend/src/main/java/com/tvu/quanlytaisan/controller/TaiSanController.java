package com.tvu.quanlytaisan.controller;

import com.tvu.quanlytaisan.dto.request.TaiSanRequest;
import com.tvu.quanlytaisan.dto.response.ApiResponse;
import com.tvu.quanlytaisan.dto.response.TaiSanResponse;
import com.tvu.quanlytaisan.service.QRCodeService;
import com.tvu.quanlytaisan.service.TaiSanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tai-san")
@RequiredArgsConstructor
public class TaiSanController {
    
    private final TaiSanService taiSanService;
    private final QRCodeService qrCodeService;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<List<TaiSanResponse>>> getAllTaiSan() {
        List<TaiSanResponse> response = taiSanService.getAllTaiSan();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<TaiSanResponse>> getTaiSanById(@PathVariable Long id) {
        TaiSanResponse response = taiSanService.getTaiSanById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/ma/{mataisan}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<TaiSanResponse>> getTaiSanByMa(@PathVariable String mataisan) {
        TaiSanResponse response = taiSanService.getTaiSanByMa(mataisan);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<List<TaiSanResponse>>> searchTaiSan(@RequestParam String keyword) {
        List<TaiSanResponse> response = taiSanService.searchTaiSan(keyword);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/loai/{loaitaisanId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<List<TaiSanResponse>>> getTaiSanByLoai(@PathVariable Integer loaitaisanId) {
        List<TaiSanResponse> response = taiSanService.getTaiSanByLoai(loaitaisanId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/by-don-vi/{donviId}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERM_TAISAN')")
    public ResponseEntity<ApiResponse<List<TaiSanResponse>>> getTaiSanByDonVi(@PathVariable Integer donviId) {
        List<TaiSanResponse> response = taiSanService.getTaiSanByDonVi(donviId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERM_TAISAN')")
    public ResponseEntity<ApiResponse<TaiSanResponse>> createTaiSan(@Valid @RequestBody TaiSanRequest request) {
        TaiSanResponse response = taiSanService.createTaiSan(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo tài sản thành công", response));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERM_TAISAN')")
    public ResponseEntity<ApiResponse<TaiSanResponse>> updateTaiSan(
            @PathVariable Long id,
            @Valid @RequestBody TaiSanRequest request) {
        TaiSanResponse response = taiSanService.updateTaiSan(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật tài sản thành công", response));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERM_TAISAN')")
    public ResponseEntity<ApiResponse<Void>> deleteTaiSan(@PathVariable Long id) {
        taiSanService.deleteTaiSan(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa tài sản thành công"));
    }
    
    @GetMapping("/{id}/qrcode")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<String>> getQRCode(@PathVariable Long id) {
        TaiSanResponse taiSan = taiSanService.getTaiSanById(id);
        String qrCodeBase64 = qrCodeService.generateQRCodeForTaiSan(taiSan.getTaisanId(), taiSan.getMataisan());
        return ResponseEntity.ok(ApiResponse.success(qrCodeBase64));
    }
}
