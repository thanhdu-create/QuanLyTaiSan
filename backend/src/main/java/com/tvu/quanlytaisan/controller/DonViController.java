package com.tvu.quanlytaisan.controller;

import com.tvu.quanlytaisan.dto.request.DonViRequest;
import com.tvu.quanlytaisan.dto.response.ApiResponse;
import com.tvu.quanlytaisan.entity.DonVi;
import com.tvu.quanlytaisan.exception.BadRequestException;
import com.tvu.quanlytaisan.exception.ResourceNotFoundException;
import com.tvu.quanlytaisan.repository.DonViRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/don-vi")
@RequiredArgsConstructor
public class DonViController {
    
    private final DonViRepository donViRepository;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<List<DonVi>>> getAllDonVi() {
        List<DonVi> donVis = donViRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(donVis));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<DonVi>> getDonViById(@PathVariable Integer id) {
        DonVi donVi = donViRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn vị với ID: " + id));
        return ResponseEntity.ok(ApiResponse.success(donVi));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERM_DONVIVITRI')")
    @Transactional
    public ResponseEntity<ApiResponse<DonVi>> createDonVi(@RequestBody DonViRequest request) {
        // Validate
        if (request.getMadonvi() == null || request.getMadonvi().trim().isEmpty()) {
            throw new BadRequestException("Mã đơn vị không được để trống");
        }
        if (request.getTendonvi() == null || request.getTendonvi().trim().isEmpty()) {
            throw new BadRequestException("Tên đơn vị không được để trống");
        }
        
        // Check duplicate madonvi
        if (donViRepository.findByMadonvi(request.getMadonvi()).isPresent()) {
            throw new BadRequestException("Mã đơn vị đã tồn tại");
        }
        
        // Create new DonVi entity
        DonVi donVi = new DonVi();
        donVi.setMadonvi(request.getMadonvi());
        donVi.setTendonvi(request.getTendonvi());
        
        // Handle donviCha
        if (request.getDonvichaId() != null) {
            DonVi donViCha = donViRepository.findById(request.getDonvichaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn vị cha"));
            donVi.setDonviCha(donViCha);
        }
        
        DonVi savedDonVi = donViRepository.save(donVi);
        return ResponseEntity.ok(ApiResponse.success(savedDonVi));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERM_DONVIVITRI')")
    @Transactional
    public ResponseEntity<ApiResponse<DonVi>> updateDonVi(@PathVariable Integer id, @RequestBody DonViRequest request) {
        DonVi existingDonVi = donViRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn vị với ID: " + id));
        
        // Validate
        if (request.getMadonvi() == null || request.getMadonvi().trim().isEmpty()) {
            throw new BadRequestException("Mã đơn vị không được để trống");
        }
        if (request.getTendonvi() == null || request.getTendonvi().trim().isEmpty()) {
            throw new BadRequestException("Tên đơn vị không được để trống");
        }
        
        // Check duplicate madonvi (exclude current)
        donViRepository.findByMadonvi(request.getMadonvi()).ifPresent(dv -> {
            if (!dv.getDonviId().equals(id)) {
                throw new BadRequestException("Mã đơn vị đã tồn tại");
            }
        });
        
        existingDonVi.setMadonvi(request.getMadonvi());
        existingDonVi.setTendonvi(request.getTendonvi());
        
        // Handle donviCha
        if (request.getDonvichaId() != null) {
            DonVi donViCha = donViRepository.findById(request.getDonvichaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn vị cha"));
            existingDonVi.setDonviCha(donViCha);
        } else {
            existingDonVi.setDonviCha(null);
        }
        
        DonVi updatedDonVi = donViRepository.save(existingDonVi);
        return ResponseEntity.ok(ApiResponse.success(updatedDonVi));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERM_DONVIVITRI')")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteDonVi(@PathVariable Integer id) {
        DonVi donVi = donViRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn vị với ID: " + id));
        
        donViRepository.delete(donVi);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
