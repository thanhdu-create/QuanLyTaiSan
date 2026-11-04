package com.tvu.quanlytaisan.service;

import com.tvu.quanlytaisan.dto.request.BaoTriRequest;
import com.tvu.quanlytaisan.dto.response.BaoTriResponse;
import com.tvu.quanlytaisan.entity.BaoTri;
import com.tvu.quanlytaisan.entity.NguoiDung;
import com.tvu.quanlytaisan.entity.TaiSan;
import com.tvu.quanlytaisan.enums.LoaiBaoTri;
import com.tvu.quanlytaisan.enums.TrangThaiXuLy;
import com.tvu.quanlytaisan.exception.BadRequestException;
import com.tvu.quanlytaisan.exception.ResourceNotFoundException;
import com.tvu.quanlytaisan.repository.BaoTriRepository;
import com.tvu.quanlytaisan.repository.NguoiDungRepository;
import com.tvu.quanlytaisan.repository.TaiSanRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BaoTriServiceTest {

    @Mock
    private BaoTriRepository baoTriRepository;

    @Mock
    private TaiSanRepository taiSanRepository;

    @Mock
    private NguoiDungRepository nguoiDungRepository;

    @InjectMocks
    private BaoTriService baoTriService;

    private NguoiDung mockNguoiDung;
    private TaiSan mockTaiSan1;
    private TaiSan mockTaiSan2;
    private BaoTriRequest mockRequest;

    @BeforeEach
    void setUp() {
        // Mock NguoiDung
        mockNguoiDung = new NguoiDung();
        mockNguoiDung.setNguoidungId(1L);
        mockNguoiDung.setHoten("Test User");

        // Mock TaiSan 1
        mockTaiSan1 = new TaiSan();
        mockTaiSan1.setTaisanId(1L);
        mockTaiSan1.setMataisan("TS001");
        mockTaiSan1.setTentaisan("Tai san 1");

        // Mock TaiSan 2
        mockTaiSan2 = new TaiSan();
        mockTaiSan2.setTaisanId(2L);
        mockTaiSan2.setMataisan("TS002");
        mockTaiSan2.setTentaisan("Tai san 2");

        // Mock BaoTriRequest
        mockRequest = new BaoTriRequest();
        mockRequest.setLoaibaotri(LoaiBaoTri.DINHKY);
        mockRequest.setNgaybao(LocalDate.now());
        mockRequest.setMotahuhong("Mo ta hu hong");
        mockRequest.setChiphi(BigDecimal.valueOf(100000));
        mockRequest.setNgaybaotritieptheo(LocalDate.now().plusMonths(3));
    }

    @Test
    void testCreateBaoTriBatch_Success() {
        // Given
        List<Long> taisanIds = Arrays.asList(1L, 2L);
        Long nguoibaoId = 1L;

        when(nguoiDungRepository.findById(nguoibaoId)).thenReturn(Optional.of(mockNguoiDung));
        when(taiSanRepository.existsById(1L)).thenReturn(true);
        when(taiSanRepository.existsById(2L)).thenReturn(true);
        when(taiSanRepository.findById(1L)).thenReturn(Optional.of(mockTaiSan1));
        when(taiSanRepository.findById(2L)).thenReturn(Optional.of(mockTaiSan2));

        BaoTri savedBaoTri1 = new BaoTri();
        savedBaoTri1.setBaotriId(1L);
        savedBaoTri1.setTaisan(mockTaiSan1);
        savedBaoTri1.setNguoibao(mockNguoiDung);
        savedBaoTri1.setLoaibaotri(LoaiBaoTri.DINHKY);
        savedBaoTri1.setNgaybao(mockRequest.getNgaybao());
        savedBaoTri1.setMotahuhong(mockRequest.getMotahuhong());
        savedBaoTri1.setTrangthaixuly(TrangThaiXuLy.CHOXULY);
        savedBaoTri1.setChiphi(mockRequest.getChiphi());
        savedBaoTri1.setNgaybaotritieptheo(mockRequest.getNgaybaotritieptheo());

        BaoTri savedBaoTri2 = new BaoTri();
        savedBaoTri2.setBaotriId(2L);
        savedBaoTri2.setTaisan(mockTaiSan2);
        savedBaoTri2.setNguoibao(mockNguoiDung);
        savedBaoTri2.setLoaibaotri(LoaiBaoTri.DINHKY);
        savedBaoTri2.setNgaybao(mockRequest.getNgaybao());
        savedBaoTri2.setMotahuhong(mockRequest.getMotahuhong());
        savedBaoTri2.setTrangthaixuly(TrangThaiXuLy.CHOXULY);
        savedBaoTri2.setChiphi(mockRequest.getChiphi());
        savedBaoTri2.setNgaybaotritieptheo(mockRequest.getNgaybaotritieptheo());

        when(baoTriRepository.save(any(BaoTri.class)))
                .thenReturn(savedBaoTri1)
                .thenReturn(savedBaoTri2);

        // When
        List<BaoTriResponse> responses = baoTriService.createBaoTriBatch(taisanIds, mockRequest, nguoibaoId);

        // Then
        assertNotNull(responses);
        assertEquals(2, responses.size());
        verify(baoTriRepository, times(2)).save(any(BaoTri.class));
        verify(taiSanRepository, times(2)).existsById(anyLong());
        verify(nguoiDungRepository, times(1)).findById(nguoibaoId);
    }

    @Test
    void testCreateBaoTriBatch_EmptyList_ThrowsBadRequestException() {
        // Given
        List<Long> taisanIds = Arrays.asList();
        Long nguoibaoId = 1L;

        // When & Then
        BadRequestException exception = assertThrows(BadRequestException.class, 
            () -> baoTriService.createBaoTriBatch(taisanIds, mockRequest, nguoibaoId));
        
        assertEquals("Danh sách tài sản không được rỗng", exception.getMessage());
        verify(baoTriRepository, never()).save(any(BaoTri.class));
    }

    @Test
    void testCreateBaoTriBatch_NullList_ThrowsBadRequestException() {
        // Given
        List<Long> taisanIds = null;
        Long nguoibaoId = 1L;

        // When & Then
        BadRequestException exception = assertThrows(BadRequestException.class, 
            () -> baoTriService.createBaoTriBatch(taisanIds, mockRequest, nguoibaoId));
        
        assertEquals("Danh sách tài sản không được rỗng", exception.getMessage());
        verify(baoTriRepository, never()).save(any(BaoTri.class));
    }

    @Test
    void testCreateBaoTriBatch_ExceedsMaxSize_ThrowsBadRequestException() {
        // Given
        List<Long> taisanIds = new java.util.ArrayList<>();
        for (long i = 1; i <= 101; i++) {
            taisanIds.add(i);
        }
        Long nguoibaoId = 1L;

        // When & Then
        BadRequestException exception = assertThrows(BadRequestException.class, 
            () -> baoTriService.createBaoTriBatch(taisanIds, mockRequest, nguoibaoId));
        
        assertEquals("Vượt quá giới hạn 100 tài sản", exception.getMessage());
        verify(baoTriRepository, never()).save(any(BaoTri.class));
    }

    @Test
    void testCreateBaoTriBatch_InvalidTaisanId_ThrowsResourceNotFoundException() {
        // Given
        List<Long> taisanIds = Arrays.asList(1L, 999L);
        Long nguoibaoId = 1L;

        when(taiSanRepository.existsById(1L)).thenReturn(true);
        when(taiSanRepository.existsById(999L)).thenReturn(false);

        // When & Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, 
            () -> baoTriService.createBaoTriBatch(taisanIds, mockRequest, nguoibaoId));
        
        assertTrue(exception.getMessage().contains("Tài sản"));
        verify(baoTriRepository, never()).save(any(BaoTri.class));
    }

    @Test
    void testCreateBaoTriBatch_InvalidNguoibaoId_ThrowsResourceNotFoundException() {
        // Given
        List<Long> taisanIds = Arrays.asList(1L, 2L);
        Long nguoibaoId = 999L;

        when(taiSanRepository.existsById(1L)).thenReturn(true);
        when(taiSanRepository.existsById(2L)).thenReturn(true);
        when(nguoiDungRepository.findById(nguoibaoId)).thenReturn(Optional.empty());

        // When & Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, 
            () -> baoTriService.createBaoTriBatch(taisanIds, mockRequest, nguoibaoId));
        
        assertTrue(exception.getMessage().contains("Người dùng"));
        verify(baoTriRepository, never()).save(any(BaoTri.class));
    }

    @Test
    void testCreateBaoTriBatch_AllFieldsSetCorrectly() {
        // Given
        List<Long> taisanIds = Arrays.asList(1L);
        Long nguoibaoId = 1L;

        when(nguoiDungRepository.findById(nguoibaoId)).thenReturn(Optional.of(mockNguoiDung));
        when(taiSanRepository.existsById(1L)).thenReturn(true);
        when(taiSanRepository.findById(1L)).thenReturn(Optional.of(mockTaiSan1));

        when(baoTriRepository.save(any(BaoTri.class))).thenAnswer(invocation -> {
            BaoTri baoTri = invocation.getArgument(0);
            baoTri.setBaotriId(1L);
            
            // Verify all fields are set correctly
            assertEquals(mockTaiSan1, baoTri.getTaisan());
            assertEquals(mockNguoiDung, baoTri.getNguoibao());
            assertEquals(LoaiBaoTri.DINHKY, baoTri.getLoaibaotri());
            assertEquals(mockRequest.getNgaybao(), baoTri.getNgaybao());
            assertEquals(mockRequest.getMotahuhong(), baoTri.getMotahuhong());
            assertEquals(TrangThaiXuLy.CHOXULY, baoTri.getTrangthaixuly());
            assertEquals(mockRequest.getChiphi(), baoTri.getChiphi());
            assertEquals(mockRequest.getNgaybaotritieptheo(), baoTri.getNgaybaotritieptheo());
            
            return baoTri;
        });

        // When
        List<BaoTriResponse> responses = baoTriService.createBaoTriBatch(taisanIds, mockRequest, nguoibaoId);

        // Then
        assertNotNull(responses);
        assertEquals(1, responses.size());
        verify(baoTriRepository, times(1)).save(any(BaoTri.class));
    }

    @Test
    void testCreateBaoTriBatch_WithNullChiphi_DefaultsToZero() {
        // Given
        List<Long> taisanIds = Arrays.asList(1L);
        Long nguoibaoId = 1L;
        mockRequest.setChiphi(null);

        when(nguoiDungRepository.findById(nguoibaoId)).thenReturn(Optional.of(mockNguoiDung));
        when(taiSanRepository.existsById(1L)).thenReturn(true);
        when(taiSanRepository.findById(1L)).thenReturn(Optional.of(mockTaiSan1));

        when(baoTriRepository.save(any(BaoTri.class))).thenAnswer(invocation -> {
            BaoTri baoTri = invocation.getArgument(0);
            baoTri.setBaotriId(1L);
            
            // Verify chiphi defaults to ZERO
            assertEquals(BigDecimal.ZERO, baoTri.getChiphi());
            
            return baoTri;
        });

        // When
        List<BaoTriResponse> responses = baoTriService.createBaoTriBatch(taisanIds, mockRequest, nguoibaoId);

        // Then
        assertNotNull(responses);
        assertEquals(1, responses.size());
        verify(baoTriRepository, times(1)).save(any(BaoTri.class));
    }
}
