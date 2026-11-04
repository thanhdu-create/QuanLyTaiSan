package com.tvu.quanlytaisan.service;

import com.tvu.quanlytaisan.dto.request.BaoTriRequest;
import com.tvu.quanlytaisan.dto.request.BaoTriUpdateRequest;
import com.tvu.quanlytaisan.dto.response.BaoTriResponse;
import com.tvu.quanlytaisan.dto.response.BaoTriThongKeResponse;
import com.tvu.quanlytaisan.entity.BaoTri;
import com.tvu.quanlytaisan.entity.NguoiDung;
import com.tvu.quanlytaisan.entity.TaiSan;
import com.tvu.quanlytaisan.enums.TrangThaiXuLy;
import com.tvu.quanlytaisan.exception.BadRequestException;
import com.tvu.quanlytaisan.exception.ResourceNotFoundException;
import com.tvu.quanlytaisan.repository.BaoTriRepository;
import com.tvu.quanlytaisan.repository.NguoiDungRepository;
import com.tvu.quanlytaisan.repository.TaiSanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BaoTriService {
    
    private final BaoTriRepository baoTriRepository;
    private final TaiSanRepository taiSanRepository;
    private final NguoiDungRepository nguoiDungRepository;
    
    @Transactional(readOnly = true)
    public List<BaoTriResponse> getAllBaoTri() {
        return baoTriRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public BaoTriResponse getBaoTriById(Long id) {
        BaoTri baoTri = baoTriRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu bảo trì", "id", id));
        return mapToResponse(baoTri);
    }
    
    @Transactional(readOnly = true)
    public List<BaoTriResponse> getBaoTriByTrangThai(TrangThaiXuLy trangthaixuly) {
        return baoTriRepository.findByTrangthaixuly(trangthaixuly).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<BaoTriResponse> getBaoTriByTaiSan(Long taisanId) {
        return baoTriRepository.findByTaiSanId(taisanId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<BaoTriResponse> searchBaoTri(String keyword) {
        return baoTriRepository.searchByKeyword(keyword).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public BaoTriResponse createBaoTri(BaoTriRequest request, Long nguoibaoId) {
        // Load tai san
        TaiSan taiSan = taiSanRepository.findById(request.getTaisanId())
                .orElseThrow(() -> new ResourceNotFoundException("Tài sản", "id", request.getTaisanId()));
        
        // Load nguoi bao
        NguoiDung nguoibao = nguoiDungRepository.findById(nguoibaoId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", nguoibaoId));
        
        BaoTri baoTri = new BaoTri();
        baoTri.setTaisan(taiSan);
        baoTri.setLoaibaotri(request.getLoaibaotri());
        baoTri.setNguoibao(nguoibao);
        baoTri.setNgaybao(request.getNgaybao());
        baoTri.setMotahuhong(request.getMotahuhong());
        baoTri.setTrangthaixuly(TrangThaiXuLy.CHOXULY);
        baoTri.setChiphi(request.getChiphi() != null ? request.getChiphi() : BigDecimal.ZERO);
        baoTri.setNgaybaotritieptheo(request.getNgaybaotritieptheo());
        
        BaoTri saved = baoTriRepository.save(baoTri);
        return mapToResponse(saved);
    }
    
    @Transactional
    public List<BaoTriResponse> createBaoTriBatch(List<Long> taisanIds, BaoTriRequest commonData, Long nguoibaoId) {
        // Validate batch size
        if (taisanIds == null || taisanIds.isEmpty()) {
            throw new BadRequestException("Danh sách tài sản không được rỗng");
        }
        
        if (taisanIds.size() > 100) {
            throw new BadRequestException("Vượt quá giới hạn 100 tài sản");
        }
        
        // Validate all taisanIds exist
        for (Long taisanId : taisanIds) {
            if (!taiSanRepository.existsById(taisanId)) {
                throw new ResourceNotFoundException("Tài sản", "id", taisanId);
            }
        }
        
        // Load nguoi bao
        NguoiDung nguoibao = nguoiDungRepository.findById(nguoibaoId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", nguoibaoId));
        
        // Create BaoTri entities for each taisanId
        List<BaoTriResponse> responses = new ArrayList<>();
        
        for (Long taisanId : taisanIds) {
            TaiSan taiSan = taiSanRepository.findById(taisanId)
                    .orElseThrow(() -> new ResourceNotFoundException("Tài sản", "id", taisanId));
            
            BaoTri baoTri = new BaoTri();
            baoTri.setTaisan(taiSan);
            baoTri.setLoaibaotri(commonData.getLoaibaotri());
            baoTri.setNguoibao(nguoibao);
            baoTri.setNgaybao(commonData.getNgaybao());
            baoTri.setMotahuhong(commonData.getMotahuhong());
            baoTri.setTrangthaixuly(TrangThaiXuLy.CHOXULY);
            baoTri.setChiphi(commonData.getChiphi() != null ? commonData.getChiphi() : BigDecimal.ZERO);
            baoTri.setNgaybaotritieptheo(commonData.getNgaybaotritieptheo());
            
            BaoTri saved = baoTriRepository.save(baoTri);
            responses.add(mapToResponse(saved));
        }
        
        return responses;
    }
    
    @Transactional
    public BaoTriResponse updateBaoTri(Long id, BaoTriUpdateRequest request) {
        BaoTri baoTri = baoTriRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu bảo trì", "id", id));
        
        baoTri.setTrangthaixuly(request.getTrangthaixuly());
        
        if (request.getChiphi() != null) {
            baoTri.setChiphi(request.getChiphi());
        }
        
        if (request.getKetqua() != null) {
            baoTri.setKetqua(request.getKetqua());
        }
        
        if (request.getNgayhoanthanh() != null) {
            baoTri.setNgayhoanthanh(request.getNgayhoanthanh());
        }
        
        if (request.getNgaybaotritieptheo() != null) {
            baoTri.setNgaybaotritieptheo(request.getNgaybaotritieptheo());
        }
        
        BaoTri updated = baoTriRepository.save(baoTri);
        return mapToResponse(updated);
    }
    
    @Transactional
    public void deleteBaoTri(Long id) {
        BaoTri baoTri = baoTriRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu bảo trì", "id", id));
        baoTriRepository.delete(baoTri);
    }
    
    @Transactional(readOnly = true)
    public BaoTriThongKeResponse getThongKe() {
        LocalDate now = LocalDate.now();
        int currentYear = now.getYear();
        int currentMonth = now.getMonthValue();
        
        return BaoTriThongKeResponse.builder()
                .tongSoPhieu((int) baoTriRepository.count())
                .soPhieuChoXuLy((int) baoTriRepository.countByTrangthaixuly(TrangThaiXuLy.CHOXULY))
                .soPhieuDangXuLy((int) baoTriRepository.countByTrangthaixuly(TrangThaiXuLy.DANGXULY))
                .soPhieuHoanThanh((int) baoTriRepository.countByTrangthaixuly(TrangThaiXuLy.HOANTHANH))
                .soPhieuDaHuy((int) baoTriRepository.countByTrangthaixuly(TrangThaiXuLy.DAHUY))
                .tongChiPhi(BigDecimal.valueOf(baoTriRepository.getTongChiPhi()))
                .chiPhiThang(BigDecimal.valueOf(baoTriRepository.getChiPhiTheoThang(currentYear, currentMonth)))
                .chiPhiNam(BigDecimal.valueOf(baoTriRepository.getChiPhiTheoNam(currentYear)))
                .build();
    }
    
    @Transactional(readOnly = true)
    public List<BaoTriResponse> getTaiSanCanBaoTri() {
        LocalDate now = LocalDate.now();
        return baoTriRepository.getTaiSanCanBaoTri(now).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    private BaoTriResponse mapToResponse(BaoTri entity) {
        return BaoTriResponse.builder()
                .baotriId(entity.getBaotriId())
                .taisanId(entity.getTaisan().getTaisanId())
                .mataisan(entity.getTaisan().getMataisan())
                .tentaisan(entity.getTaisan().getTentaisan())
                .loaibaotri(entity.getLoaibaotri())
                .nguoibaoId(entity.getNguoibao() != null ? entity.getNguoibao().getNguoidungId() : null)
                .hotennguoibao(entity.getNguoibao() != null ? entity.getNguoibao().getHoten() : null)
                .ngaybao(entity.getNgaybao())
                .motahuhong(entity.getMotahuhong())
                .trangthaixuly(entity.getTrangthaixuly())
                .ngayhoanthanh(entity.getNgayhoanthanh())
                .chiphi(entity.getChiphi())
                .ketqua(entity.getKetqua())
                .ngaybaotritieptheo(entity.getNgaybaotritieptheo())
                .build();
    }
}
