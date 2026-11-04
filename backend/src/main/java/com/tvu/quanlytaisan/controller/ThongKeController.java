package com.tvu.quanlytaisan.controller;

import com.tvu.quanlytaisan.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tvu.quanlytaisan.service.ThongKeService;

import java.util.Map;

@RestController
@RequestMapping("/thongke")
@RequiredArgsConstructor
public class ThongKeController {

    private final ThongKeService thongKeService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success(thongKeService.getDashboardStats()));
    }

    @GetMapping("/dashboard/me")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success(thongKeService.getMyDashboardStats()));
    }
}
