package com.tvu.quanlytaisan.controller;

import com.tvu.quanlytaisan.dto.request.ViTriRequest;
import com.tvu.quanlytaisan.dto.response.ApiResponse;
import com.tvu.quanlytaisan.entity.DonVi;
import com.tvu.quanlytaisan.entity.ViTri;
import com.tvu.quanlytaisan.exception.BadRequestException;
import com.tvu.quanlytaisan.exception.ResourceNotFoundException;
import com.tvu.quanlytaisan.repository.DonViRepository;
import com.tvu.quanlytaisan.repository.ViTriRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vi-tri")
@RequiredArgsConstructor
public class ViTriController {
    
    private final ViTriRepository viTriRepository;
    private final DonViRepository donViRepository;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<ViTri>>> getAllViTri() {
        List<ViTri> viTris = viTriRepository.findAll();
        // Force load donvi to avoid lazy loading exception
        viTris.forEach(vt -> {
            if (vt.getDonvi() != null) {
                vt.getDonvi().getTendonvi();
            }
        });
        return ResponseEntity.ok(ApiResponse.success(viTris));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<ViTri>> getViTriById(@PathVariable Integer id) {
        ViTri viTri = viTriRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vị trí với ID: " + id));
        // Force load donvi
        if (viTri.getDonvi() != null) {
            viTri.getDonvi().getTendonvi();
        }
        return ResponseEntity.ok(ApiResponse.success(viTri));
    }
    
    @GetMapping("/don-vi/{donviId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<ViTri>>> getViTriByDonVi(@PathVariable Integer donviId) {
        List<ViTri> viTris = viTriRepository.findByDonviDonviId(donviId);
        // Force load donvi to avoid lazy loading exception
        viTris.forEach(vt -> {
            if (vt.getDonvi() != null) {
                vt.getDonvi().getTendonvi();
            }
        });
        return ResponseEntity.ok(ApiResponse.success(viTris));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERM_DONVIVITRI')")
    @Transactional
    public ResponseEntity<ApiResponse<ViTri>> createViTri(@RequestBody ViTriRequest request) {
        // Validate
        if (request.getMavitri() == null || request.getMavitri().trim().isEmpty()) {
            throw new BadRequestException("Mã vị trí không được để trống");
        }
        if (request.getTenvitri() == null || request.getTenvitri().trim().isEmpty()) {
            throw new BadRequestException("Tên vị trí không được để trống");
        }
        if (request.getDonviId() == null) {
            throw new BadRequestException("Đơn vị không được để trống");
        }
        
        // Check duplicate mavitri
        if (viTriRepository.findByMavitri(request.getMavitri()).isPresent()) {
            throw new BadRequestException("Mã vị trí đã tồn tại");
        }
        
        // Get donvi
        DonVi donVi = donViRepository.findById(request.getDonviId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn vị"));
        
        // Create new ViTri entity
        ViTri viTri = new ViTri();
        viTri.setMavitri(request.getMavitri());
        viTri.setTenvitri(request.getTenvitri());
        viTri.setDonvi(donVi);
        
        ViTri savedViTri = viTriRepository.save(viTri);
        // Force load donvi
        savedViTri.getDonvi().getTendonvi();
        return ResponseEntity.ok(ApiResponse.success(savedViTri));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERM_DONVIVITRI')")
    @Transactional
    public ResponseEntity<ApiResponse<ViTri>> updateViTri(@PathVariable Integer id, @RequestBody ViTriRequest request) {
        ViTri existingViTri = viTriRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vị trí với ID: " + id));
        
        // Validate
        if (request.getMavitri() == null || request.getMavitri().trim().isEmpty()) {
            throw new BadRequestException("Mã vị trí không được để trống");
        }
        if (request.getTenvitri() == null || request.getTenvitri().trim().isEmpty()) {
            throw new BadRequestException("Tên vị trí không được để trống");
        }
        if (request.getDonviId() == null) {
            throw new BadRequestException("Đơn vị không được để trống");
        }
        
        // Check duplicate mavitri (exclude current)
        viTriRepository.findByMavitri(request.getMavitri()).ifPresent(vt -> {
            if (!vt.getVitriId().equals(id)) {
                throw new BadRequestException("Mã vị trí đã tồn tại");
            }
        });
        
        existingViTri.setMavitri(request.getMavitri());
        existingViTri.setTenvitri(request.getTenvitri());
        
        // Get donvi
        DonVi donVi = donViRepository.findById(request.getDonviId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn vị"));
        existingViTri.setDonvi(donVi);
        
        ViTri updatedViTri = viTriRepository.save(existingViTri);
        // Force load donvi
        updatedViTri.getDonvi().getTendonvi();
        return ResponseEntity.ok(ApiResponse.success(updatedViTri));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PERM_DONVIVITRI')")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteViTri(@PathVariable Integer id) {
        ViTri viTri = viTriRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vị trí với ID: " + id));
        
        viTriRepository.delete(viTri);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
