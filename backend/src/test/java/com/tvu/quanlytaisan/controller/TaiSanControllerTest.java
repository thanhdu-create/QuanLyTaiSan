package com.tvu.quanlytaisan.controller;

import com.tvu.quanlytaisan.dto.response.TaiSanResponse;
import com.tvu.quanlytaisan.exception.ResourceNotFoundException;
import com.tvu.quanlytaisan.service.TaiSanService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaiSanControllerTest {

    @Mock
    private TaiSanService taiSanService;

    @InjectMocks
    private TaiSanController taiSanController;

    private TaiSanResponse mockTaiSanResponse1;
    private TaiSanResponse mockTaiSanResponse2;

    @BeforeEach
    void setUp() {
        mockTaiSanResponse1 = TaiSanResponse.builder()
                .taisanId(1L)
                .mataisan("TS001")
                .tentaisan("Tai san 1")
                .loaitaisanId(1)
                .tenloai("Loai 1")
                .ngaymua(LocalDate.now())
                .giatri(BigDecimal.valueOf(100000))
                .donviId(1)
                .tendonvi("Don vi 1")
                .build();

        mockTaiSanResponse2 = TaiSanResponse.builder()
                .taisanId(2L)
                .mataisan("TS002")
                .tentaisan("Tai san 2")
                .loaitaisanId(1)
                .tenloai("Loai 1")
                .ngaymua(LocalDate.now())
                .giatri(BigDecimal.valueOf(200000))
                .donviId(1)
                .tendonvi("Don vi 1")
                .build();
    }

    @Test
    void testGetTaiSanByDonVi_Success() {
        // Given
        Integer donviId = 1;
        List<TaiSanResponse> expectedResponses = Arrays.asList(mockTaiSanResponse1, mockTaiSanResponse2);
        when(taiSanService.getTaiSanByDonVi(donviId)).thenReturn(expectedResponses);

        // When
        var response = taiSanController.getTaiSanByDonVi(donviId);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals(2, response.getBody().getData().size());
        verify(taiSanService, times(1)).getTaiSanByDonVi(donviId);
    }

    @Test
    void testGetTaiSanByDonVi_EmptyList() {
        // Given
        Integer donviId = 1;
        when(taiSanService.getTaiSanByDonVi(donviId)).thenReturn(Collections.emptyList());

        // When
        var response = taiSanController.getTaiSanByDonVi(donviId);

        // Then
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals(0, response.getBody().getData().size());
        verify(taiSanService, times(1)).getTaiSanByDonVi(donviId);
    }

    @Test
    void testGetTaiSanByDonVi_DonViNotFound() {
        // Given
        Integer donviId = 999;
        when(taiSanService.getTaiSanByDonVi(donviId))
                .thenThrow(new ResourceNotFoundException("Không tìm thấy đơn vị"));

        // When & Then
        assertThrows(ResourceNotFoundException.class, 
            () -> taiSanController.getTaiSanByDonVi(donviId));
        verify(taiSanService, times(1)).getTaiSanByDonVi(donviId);
    }

    @Test
    void testGetTaiSanByDonVi_VerifyServiceCall() {
        // Given
        Integer donviId = 1;
        List<TaiSanResponse> expectedResponses = Arrays.asList(mockTaiSanResponse1);
        when(taiSanService.getTaiSanByDonVi(donviId)).thenReturn(expectedResponses);

        // When
        taiSanController.getTaiSanByDonVi(donviId);

        // Then
        verify(taiSanService, times(1)).getTaiSanByDonVi(donviId);
        verifyNoMoreInteractions(taiSanService);
    }
}
