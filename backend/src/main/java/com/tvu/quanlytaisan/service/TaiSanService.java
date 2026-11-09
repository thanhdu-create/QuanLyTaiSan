package com.tvu.quanlytaisan.service;

import com.tvu.quanlytaisan.dto.request.TaiSanRequest;
import com.tvu.quanlytaisan.dto.response.TaiSanResponse;
import com.tvu.quanlytaisan.entity.*;
import com.tvu.quanlytaisan.exception.BadRequestException;
import com.tvu.quanlytaisan.exception.ResourceNotFoundException;
import com.tvu.quanlytaisan.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class TaiSanService {
    
    private final TaiSanRepository taiSanRepository;
    private final LoaiTaiSanRepository loaiTaiSanRepository;
    private final ViTriRepository viTriRepository;
    private final TrangThaiTaiSanRepository trangThaiTaiSanRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final DonViRepository donViRepository;
    private final QRCodeService qrCodeService;
    
    @Transactional(readOnly = true)
    public List<TaiSanResponse> getAllTaiSan() {
        return taiSanRepository.findByDaxoaFalse().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public TaiSanResponse getTaiSanById(Long id) {
        TaiSan taiSan = taiSanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tài sản", "id", id));
        
        if (taiSan.getDaxoa()) {
            throw new ResourceNotFoundException("Tài sản", "id", id);
        }
        
        return mapToResponse(taiSan);
    }
    
    @Transactional(readOnly = true)
    public TaiSanResponse getTaiSanByMa(String mataisan) {
        TaiSan taiSan = taiSanRepository.findByMataisan(mataisan)
                .orElseThrow(() -> new ResourceNotFoundException("Tài sản", "mã", mataisan));
        
        if (taiSan.getDaxoa()) {
            throw new ResourceNotFoundException("Tài sản", "mã", mataisan);
        }
        
        return mapToResponse(taiSan);
    }
    
    @Transactional(readOnly = true)
    public List<TaiSanResponse> searchTaiSan(String keyword) {
        return taiSanRepository.searchByKeyword(keyword).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<TaiSanResponse> getTaiSanByLoai(Integer loaitaisanId) {
        return taiSanRepository.findByLoaiTaiSan(loaitaisanId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<TaiSanResponse> getTaiSanByDonVi(Integer donviId) {
        // Verify that the unit exists
        donViRepository.findById(donviId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn vị"));
        
        // Get all assets for the unit
        return taiSanRepository.findByDonViId(donviId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public TaiSanResponse createTaiSan(TaiSanRequest request) {
        // Kiem tra ma tai san da ton tai chua
        if (taiSanRepository.existsByMataisan(request.getMataisan())) {
            throw new BadRequestException("Mã tài sản đã tồn tại: " + request.getMataisan());
        }
        
        TaiSan taiSan = new TaiSan();
        mapRequestToEntity(request, taiSan);
        
        TaiSan saved = taiSanRepository.save(taiSan);
        return mapToResponse(saved);
    }
    
    @Transactional
    public TaiSanResponse updateTaiSan(Long id, TaiSanRequest request) {
        TaiSan taiSan = taiSanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tài sản", "id", id));
        
        if (taiSan.getDaxoa()) {
            throw new BadRequestException("Không thể cập nhật tài sản đã bị xóa");
        }
        
        // Kiem tra ma tai san da ton tai chua (tru chinh no)
        if (taiSanRepository.existsByMataisanAndTaisanIdNot(request.getMataisan(), id)) {
            throw new BadRequestException("Mã tài sản đã tồn tại: " + request.getMataisan());
        }
        
        mapRequestToEntity(request, taiSan);
        
        TaiSan updated = taiSanRepository.save(taiSan);
        return mapToResponse(updated);
    }
    
    @Transactional
    public void deleteTaiSan(Long id) {
        TaiSan taiSan = taiSanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tài sản", "id", id));
        
        // Xoa mem
        taiSan.setDaxoa(true);
        taiSanRepository.save(taiSan);
    }
    
    private void mapRequestToEntity(TaiSanRequest request, TaiSan entity) {
        entity.setMataisan(request.getMataisan());
        entity.setTentaisan(request.getTentaisan());
        entity.setThongsokythuat(request.getThongsokythuat());
        entity.setNgaymua(request.getNgaymua());
        entity.setGiatri(request.getGiatri());
        entity.setThoigianSudung(request.getThoigianSudung());
        entity.setTileThanhLy(request.getTileThanhLy());
        
        // Load loai tai san
        LoaiTaiSan loaiTaiSan = loaiTaiSanRepository.findById(request.getLoaitaisanId())
                .orElseThrow(() -> new ResourceNotFoundException("Loại tài sản", "id", request.getLoaitaisanId()));
        entity.setLoaitaisan(loaiTaiSan);
        
        // Load vi tri (optional)
        if (request.getVitriId() != null) {
            ViTri vitri = viTriRepository.findById(request.getVitriId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vị trí", "id", request.getVitriId()));
            entity.setVitri(vitri);
        } else {
            entity.setVitri(null);
        }
        
        // Load trang thai
        TrangThaiTaiSan trangThai = trangThaiTaiSanRepository.findById(request.getTrangthaitaisanId())
                .orElseThrow(() -> new ResourceNotFoundException("Trạng thái tài sản", "id", request.getTrangthaitaisanId()));
        entity.setTrangthaitaisan(trangThai);
        
        // Load nguoi su dung (optional)
        if (request.getNguoisudungId() != null) {
            NguoiDung nguoiDung = nguoiDungRepository.findById(request.getNguoisudungId())
                    .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", request.getNguoisudungId()));
            entity.setNguoisudung(nguoiDung);
        } else {
            entity.setNguoisudung(null);
        }
    }
    
    private TaiSanResponse mapToResponse(TaiSan entity) {
        // Tạo QR code cho tài sản
        String qrCode = null;
        try {
            qrCode = qrCodeService.generateQRCodeForTaiSan(entity.getTaisanId(), entity.getMataisan());
        } catch (Exception e) {
            // Nếu lỗi tạo QR, không throw exception, chỉ log
            log.warn("Không tạo được QR code cho tài sản {}: {}", entity.getMataisan(), e.getMessage());
        }
        
        // Tính toán khấu hao
        KhauHaoInfo khauHao = calculateKhauHao(entity);
        
        return TaiSanResponse.builder()
                .taisanId(entity.getTaisanId())
                .mataisan(entity.getMataisan())
                .tentaisan(entity.getTentaisan())
                .loaitaisanId(entity.getLoaitaisan().getLoaitaisanId())
                .tenloai(entity.getLoaitaisan().getTenloai())
                .thongsokythuat(entity.getThongsokythuat())
                .ngaymua(entity.getNgaymua())
                .giatri(entity.getGiatri())
                .thoigianSudung(entity.getThoigianSudung())
                .tileThanhLy(entity.getTileThanhLy())
                .soNgayDaSuDung(khauHao.soNgayDaSuDung)
                .soNamDaSuDung(khauHao.soNamDaSuDung)
                .giaTriThanhLy(khauHao.giaTriThanhLy)
                .khauHaoNam(khauHao.khauHaoNam)
                .tongKhauHao(khauHao.tongKhauHao)
                .tyleKhauHao(khauHao.tyleKhauHao)
                .giaTriConLai(khauHao.giaTriConLai)
                .vitriId(entity.getVitri() != null ? entity.getVitri().getVitriId() : null)
                .tenvitri(entity.getVitri() != null ? entity.getVitri().getTenvitri() : null)
                .donviId(entity.getVitri() != null && entity.getVitri().getDonvi() != null ? entity.getVitri().getDonvi().getDonviId() : null)
                .tendonvi(entity.getVitri() != null && entity.getVitri().getDonvi() != null ? entity.getVitri().getDonvi().getTendonvi() : null)
                .trangthaitaisanId(entity.getTrangthaitaisan().getTrangthaitaisanId())
                .matrangthai(entity.getTrangthaitaisan().getMatrangthai())
                .tentrangthai(entity.getTrangthaitaisan().getTentrangthai())
                .nguoisudungId(entity.getNguoisudung() != null ? entity.getNguoisudung().getNguoidungId() : null)
                .tennguoisudung(entity.getNguoisudung() != null ? entity.getNguoisudung().getHoten() : null)
                .daxoa(entity.getDaxoa())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .qrCode(qrCode)
                .build();
    }
    
    /**
     * Tính toán thông tin khấu hao theo phương pháp đường thẳng
     */
    private KhauHaoInfo calculateKhauHao(TaiSan entity) {
        KhauHaoInfo info = new KhauHaoInfo();
        
        try {
            LocalDate ngaymua = entity.getNgaymua();
            
            // Nếu ngày mua là null, trả về giá trị mặc định
            if (ngaymua == null) {
                System.err.println("⚠️ Ngày mua is null for asset: " + entity.getMataisan());
                info.soNgayDaSuDung = 0L;
                info.soNamDaSuDung = BigDecimal.ZERO;
                info.giaTriThanhLy = BigDecimal.ZERO;
                info.khauHaoNam = BigDecimal.ZERO;
                info.tongKhauHao = BigDecimal.ZERO;
                info.tyleKhauHao = BigDecimal.ZERO;
                info.giaTriConLai = entity.getGiatri();
                return info;
            }
            
            LocalDate now = LocalDate.now();
            BigDecimal giatri = entity.getGiatri() != null ? entity.getGiatri() : BigDecimal.ZERO;
            Integer thoigianSudung = entity.getThoigianSudung() != null ? entity.getThoigianSudung() : 5;
            BigDecimal tileThanhLy = entity.getTileThanhLy() != null ? entity.getTileThanhLy() : new BigDecimal("10.00");
            
            System.out.println("🔍 Calculating depreciation for: " + entity.getMataisan());
            System.out.println("   - Ngày mua: " + ngaymua);
            System.out.println("   - Giá trị: " + giatri);
            System.out.println("   - Thời gian sử dụng: " + thoigianSudung + " năm");
            System.out.println("   - Tỷ lệ thanh lý: " + tileThanhLy + "%");
            
            // Tính số ngày đã sử dụng
            long soNgay = java.time.temporal.ChronoUnit.DAYS.between(ngaymua, now);
            info.soNgayDaSuDung = soNgay;
            System.out.println("   - Số ngày đã sử dụng: " + soNgay);
            
            // Tính số năm đã sử dụng (1 năm = 365.25 ngày)
            BigDecimal soNam = new BigDecimal(soNgay).divide(new BigDecimal("365.25"), 2, BigDecimal.ROUND_HALF_UP);
            info.soNamDaSuDung = soNam;
            System.out.println("   - Số năm đã sử dụng: " + soNam);
            
            // Tính giá trị thanh lý (% của nguyên giá)
            BigDecimal giaTriThanhLy = giatri.multiply(tileThanhLy).divide(new BigDecimal("100"), 2, BigDecimal.ROUND_HALF_UP);
            info.giaTriThanhLy = giaTriThanhLy;
            System.out.println("   - Giá trị thanh lý: " + giaTriThanhLy);
            
            // Tính khấu hao hàng năm = (Nguyên giá - Giá trị thanh lý) / Thời gian sử dụng
            BigDecimal khauHaoNam = giatri.subtract(giaTriThanhLy)
                    .divide(new BigDecimal(thoigianSudung), 2, BigDecimal.ROUND_HALF_UP);
            info.khauHaoNam = khauHaoNam;
            System.out.println("   - Khấu hao/năm: " + khauHaoNam);
            
            // Tính tổng khấu hao = Khấu hao/năm × Số năm đã sử dụng
            BigDecimal tongKhauHao = khauHaoNam.multiply(soNam).setScale(2, BigDecimal.ROUND_HALF_UP);
            info.tongKhauHao = tongKhauHao;
            System.out.println("   - Tổng khấu hao: " + tongKhauHao);
            
            // Tính giá trị còn lại = Nguyên giá - Tổng khấu hao (không thấp hơn giá trị thanh lý)
            BigDecimal giaTriConLai = giatri.subtract(tongKhauHao);
            if (giaTriConLai.compareTo(giaTriThanhLy) < 0) {
                giaTriConLai = giaTriThanhLy;
            }
            info.giaTriConLai = giaTriConLai;
            System.out.println("   - Giá trị còn lại: " + giaTriConLai);
            
            // Tính tỷ lệ khấu hao (%) = (Số năm đã sử dụng / Thời gian sử dụng) × 100
            BigDecimal tyleKhauHao = soNam.divide(new BigDecimal(thoigianSudung), 4, BigDecimal.ROUND_HALF_UP)
                    .multiply(new BigDecimal("100")).setScale(2, BigDecimal.ROUND_HALF_UP);
            if (tyleKhauHao.compareTo(new BigDecimal("100")) > 0) {
                tyleKhauHao = new BigDecimal("100.00");
            }
            info.tyleKhauHao = tyleKhauHao;
            System.out.println("   - Tỷ lệ khấu hao: " + tyleKhauHao + "%");
            System.out.println("✅ Depreciation calculation completed for: " + entity.getMataisan());
            
        } catch (Exception e) {
            // Nếu có lỗi, trả về giá trị mặc định
            System.err.println("❌ Error calculating depreciation for: " + entity.getMataisan());
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            
            info.soNgayDaSuDung = 0L;
            info.soNamDaSuDung = BigDecimal.ZERO;
            info.giaTriThanhLy = BigDecimal.ZERO;
            info.khauHaoNam = BigDecimal.ZERO;
            info.tongKhauHao = BigDecimal.ZERO;
            info.tyleKhauHao = BigDecimal.ZERO;
            info.giaTriConLai = entity.getGiatri() != null ? entity.getGiatri() : BigDecimal.ZERO;
        }
        
        return info;
    }
    
    /**
     * Inner class chứa thông tin khấu hao tính toán
     */
    private static class KhauHaoInfo {
        Long soNgayDaSuDung;
        BigDecimal soNamDaSuDung;
        BigDecimal giaTriThanhLy;
        BigDecimal khauHaoNam;
        BigDecimal tongKhauHao;
        BigDecimal tyleKhauHao;
        BigDecimal giaTriConLai;
    }
}
