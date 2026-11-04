package com.tvu.quanlytaisan.controller;

import com.tvu.quanlytaisan.dto.request.BaoTriBatchRequest;
import com.tvu.quanlytaisan.dto.request.BaoTriRequest;
import com.tvu.quanlytaisan.dto.request.BaoTriUpdateRequest;
import com.tvu.quanlytaisan.dto.response.ApiResponse;
import com.tvu.quanlytaisan.dto.response.BaoTriResponse;
import com.tvu.quanlytaisan.dto.response.BaoTriThongKeResponse;
import com.tvu.quanlytaisan.entity.NguoiDung;
import com.tvu.quanlytaisan.enums.TrangThaiXuLy;
import com.tvu.quanlytaisan.exception.ResourceNotFoundException;
import com.tvu.quanlytaisan.repository.NguoiDungRepository;
import com.tvu.quanlytaisan.service.BaoTriService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bao-tri")
@RequiredArgsConstructor
public class BaoTriController {
    
    private final BaoTriService baoTriService;
    private final NguoiDungRepository nguoiDungRepository;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERM_BAOTRI')")
    public ResponseEntity<ApiResponse<List<BaoTriResponse>>> getAllBaoTri() {
        List<BaoTriResponse> response = baoTriService.getAllBaoTri();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERM_BAOTRI')")
    public ResponseEntity<ApiResponse<BaoTriResponse>> getBaoTriById(@PathVariable Long id) {
        BaoTriResponse response = baoTriService.getBaoTriById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/trang-thai/{trangthaixuly}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERM_BAOTRI')")
    public ResponseEntity<ApiResponse<List<BaoTriResponse>>> getBaoTriByTrangThai(
            @PathVariable TrangThaiXuLy trangthaixuly) {
        List<BaoTriResponse> response = baoTriService.getBaoTriByTrangThai(trangthaixuly);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/tai-san/{taisanId}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERM_BAOTRI')")
    public ResponseEntity<ApiResponse<List<BaoTriResponse>>> getBaoTriByTaiSan(
            @PathVariable Long taisanId) {
        List<BaoTriResponse> response = baoTriService.getBaoTriByTaiSan(taisanId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERM_BAOTRI')")
    public ResponseEntity<ApiResponse<List<BaoTriResponse>>> searchBaoTri(
            @RequestParam String keyword) {
        List<BaoTriResponse> response = baoTriService.searchBaoTri(keyword);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERM_BAOTRI')")
    public ResponseEntity<ApiResponse<BaoTriResponse>> createBaoTri(
            @Valid @RequestBody BaoTriRequest request,
            Authentication authentication) {
        Long nguoibaoId = getNguoidungIdFromAuthentication(authentication);
        BaoTriResponse response = baoTriService.createBaoTri(request, nguoibaoId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo phiếu bảo trì thành công", response));
    }
    
    @PostMapping("/batch")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERM_BAOTRI')")
    public ResponseEntity<ApiResponse<List<BaoTriResponse>>> createBaoTriBatch(
            @Valid @RequestBody BaoTriBatchRequest request,
            Authentication authentication) {
        Long nguoibaoId = getNguoidungIdFromAuthentication(authentication);
        
        // Convert BaoTriBatchRequest to BaoTriRequest for common data
        BaoTriRequest commonData = new BaoTriRequest();
        commonData.setLoaibaotri(request.getLoaibaotri());
        commonData.setNgaybao(request.getNgaybao());
        commonData.setMotahuhong(request.getMotahuhong());
        commonData.setChiphi(request.getChiphi());
        commonData.setNgaybaotritieptheo(request.getNgaybaotritieptheo());
        
        List<BaoTriResponse> responses = baoTriService.createBaoTriBatch(
                request.getTaisanIds(), 
                commonData, 
                nguoibaoId
        );
        
        String successMessage = String.format("Đã tạo %d phiếu bảo trì thành công", responses.size());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(successMessage, responses));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERM_BAOTRI')")
    public ResponseEntity<ApiResponse<BaoTriResponse>> updateBaoTri(
            @PathVariable Long id,
            @Valid @RequestBody BaoTriUpdateRequest request) {
        BaoTriResponse response = baoTriService.updateBaoTri(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật phiếu bảo trì thành công", response));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERM_BAOTRI')")
    public ResponseEntity<ApiResponse<Void>> deleteBaoTri(@PathVariable Long id) {
        baoTriService.deleteBaoTri(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa phiếu bảo trì thành công"));
    }
    
    @GetMapping("/thong-ke")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERM_BAOTRI')")
    public ResponseEntity<ApiResponse<BaoTriThongKeResponse>> getThongKe() {
        BaoTriThongKeResponse response = baoTriService.getThongKe();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/can-bao-tri")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERM_BAOTRI')")
    public ResponseEntity<ApiResponse<List<BaoTriResponse>>> getTaiSanCanBaoTri() {
        List<BaoTriResponse> response = baoTriService.getTaiSanCanBaoTri();
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
