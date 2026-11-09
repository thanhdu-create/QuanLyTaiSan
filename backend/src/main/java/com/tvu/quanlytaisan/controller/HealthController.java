package com.tvu.quanlytaisan.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoint kiểm tra backend còn sống, dùng cho Render health check.
 * Context path là /api nên đường dẫn công khai là GET /api/health.
 */
@RestController
public class HealthController {

    @GetMapping("/health")
    public String health() {
        return "OK";
    }
}
