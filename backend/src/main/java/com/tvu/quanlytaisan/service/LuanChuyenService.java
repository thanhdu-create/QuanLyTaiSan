package com.tvu.quanlytaisan.service;

import com.tvu.quanlytaisan.dto.request.LuanChuyenRequest;
import com.tvu.quanlytaisan.dto.response.LuanChuyenResponse;
import com.tvu.quanlytaisan.entity.DonVi;
import com.tvu.quanlytaisan.entity.LichSuTrangThai;
import com.tvu.quanlytaisan.entity.LuanChuyen;
import com.tvu.quanlytaisan.entity.NguoiDung;
import com.tvu.quanlytaisan.entity.TaiSan;
import com.tvu.quanlytaisan.entity.TrangThaiTaiSan;
import com.tvu.quanlytaisan.entity.ViTri;
import com.tvu.quanlytaisan.enums.LoaiPhieu;
import com.tvu.quanlytaisan.exception.BadRequestException;
import com.tvu.quanlytaisan.exception.ResourceNotFoundException;
import com.tvu.quanlytaisan.repository.DonViRepository;
import com.tvu.quanlytaisan.repository.LichSuTrangThaiRepository;
import com.tvu.quanlytaisan.repository.LuanChuyenRepository;
import com.tvu.quanlytaisan.repository.NguoiDungRepository;
import com.tvu.quanlytaisan.repository.TaiSanRepository;
import com.tvu.quanlytaisan.repository.TrangThaiTaiSanRepository;
import com.tvu.quanlytaisan.repository.ViTriRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LuanChuyenService {

    private static final String TRANG_THAI_CON_TRONG = "AVAILABLE";
    private static final String TRANG_THAI_DANG_SU_DUNG = "IN_USE";

    private final LuanChuyenRepository luanChuyenRepository;
    private final TaiSanRepository taiSanRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final DonViRepository donViRepository;
    private final ViTriRepository viTriRepository;
    private final TrangThaiTaiSanRepository trangThaiTaiSanRepository;
    private final LichSuTrangThaiRepository lichSuTrangThaiRepository;

    @Transactional(readOnly = true)
    public Page<LuanChuyenResponse> getAll(LoaiPhieu loaiphieu, String keyword,
                                           LocalDate tuNgay, LocalDate denNgay,
                                           Pageable pageable) {
        Page<LuanChuyen> page = (loaiphieu != null)
                ? luanChuyenRepository.search(loaiphieu, keyword, tuNgay, denNgay, pageable)
                : luanChuyenRepository.search(keyword, tuNgay, denNgay, pageable);
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public LuanChuyenResponse getById(Long id) {
        LuanChuyen phieu = luanChuyenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phiếu luân chuyển"));
        return toResponse(phieu);
    }

    @Transactional(readOnly = true)
    public List<LuanChuyenResponse> getByTaisan(Long taisanId) {
        return luanChuyenRepository
                .findByTaisan_TaisanIdOrderByNgaythuchienDescLuanchuyenIdDesc(taisanId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public LuanChuyenResponse create(LuanChuyenRequest request, Long nguoidungHienTaiId) {
        NguoiDung nguoidungHienTai = nguoiDungRepository.findById(nguoidungHienTaiId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng hiện tại"));

        TaiSan taisan = taiSanRepository.findById(request.getTaisanId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài sản"));
        if (Boolean.TRUE.equals(taisan.getDaxoa())) {
            throw new BadRequestException("Tài sản đã ngừng sử dụng, không thể tạo phiếu luân chuyển");
        }

        validateKhongChonCaHai(request.getNguoigiaoId(), request.getDonvigiaoId(), "giao");
        validateKhongChonCaHai(request.getNguoinhanId(), request.getDonvinhanId(), "nhận");

        // Mọi loại phiếu đều bắt buộc có bên giao và bên nhận
        if (request.getNguoigiaoId() == null && request.getDonvigiaoId() == null) {
            throw new BadRequestException("Phiếu luân chuyển phải có người giao hoặc đơn vị giao");
        }
        if (request.getNguoinhanId() == null && request.getDonvinhanId() == null) {
            throw new BadRequestException("Phiếu luân chuyển phải có người nhận hoặc đơn vị nhận");
        }

        LocalDate ngaythuchien = request.getNgaythuchien() != null
                ? request.getNgaythuchien() : LocalDate.now();
        boolean doiTrangThai = false;
        TrangThaiTaiSan trangThaiMoi = null;

        LuanChuyen phieu = new LuanChuyen();
        phieu.setLoaiphieu(request.getLoaiphieu());
        phieu.setTaisan(taisan);
        phieu.setNgaythuchien(ngaythuchien);
        phieu.setLydo(request.getLydo());

        switch (request.getLoaiphieu()) {
            case BANGIAO -> {
                if (!TRANG_THAI_CON_TRONG.equals(taisan.getTrangthaitaisan().getMatrangthai())) {
                    throw new BadRequestException("Chỉ được bàn giao tài sản đang còn trống");
                }

                // Bên giao: người hoặc đơn vị (đã validate bắt buộc ở trên)
                phieu.setNguoigiao(request.getNguoigiaoId() != null
                        ? loadNguoiDung(request.getNguoigiaoId()) : null);
                phieu.setDonvigiao(request.getDonvigiaoId() != null
                        ? loadDonVi(request.getDonvigiaoId()) : null);

                // Bên nhận: người hoặc đơn vị
                phieu.setNguoinhan(request.getNguoinhanId() != null
                        ? loadNguoiDung(request.getNguoinhanId()) : null);
                phieu.setDonvinhan(request.getDonvinhanId() != null
                        ? loadDonVi(request.getDonvinhanId()) : null);

                // Vị trí cụ thể thuộc đơn vị nhận (không bắt buộc khi chọn đơn vị)
                if (request.getVitriId() != null) {
                    ViTri vitriNhan = viTriRepository.findById(request.getVitriId())
                            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vị trí"));
                    phieu.setVitri(vitriNhan);
                    taisan.setVitri(vitriNhan);
                }

                taisan.setNguoisudung(phieu.getNguoinhan());
                trangThaiMoi = loadTrangThai(TRANG_THAI_DANG_SU_DUNG);
                taisan.setTrangthaitaisan(trangThaiMoi);
                doiTrangThai = true;
            }
            case THUHOI -> {
                if (!TRANG_THAI_DANG_SU_DUNG.equals(taisan.getTrangthaitaisan().getMatrangthai())) {
                    throw new BadRequestException("Chỉ được thu hồi tài sản đang được sử dụng");
                }

                // Bên giao: người hoặc đơn vị (đã validate bắt buộc ở trên)
                phieu.setNguoigiao(request.getNguoigiaoId() != null
                        ? loadNguoiDung(request.getNguoigiaoId()) : null);
                phieu.setDonvigiao(request.getDonvigiaoId() != null
                        ? loadDonVi(request.getDonvigiaoId()) : null);

                // Bên nhận: người hoặc đơn vị
                phieu.setNguoinhan(request.getNguoinhanId() != null
                        ? loadNguoiDung(request.getNguoinhanId()) : null);
                phieu.setDonvinhan(request.getDonvinhanId() != null
                        ? loadDonVi(request.getDonvinhanId()) : null);

                taisan.setNguoisudung(null);
                trangThaiMoi = loadTrangThai(TRANG_THAI_CON_TRONG);
                taisan.setTrangthaitaisan(trangThaiMoi);
                doiTrangThai = true;
            }
            case DIEUCHUYEN -> {
                // Bên giao: người hoặc đơn vị (đã validate bắt buộc ở trên)
                phieu.setNguoigiao(request.getNguoigiaoId() != null
                        ? loadNguoiDung(request.getNguoigiaoId()) : null);
                phieu.setDonvigiao(request.getDonvigiaoId() != null
                        ? loadDonVi(request.getDonvigiaoId()) : null);
                phieu.setNguoinhan(request.getNguoinhanId() != null
                        ? loadNguoiDung(request.getNguoinhanId()) : null);
                phieu.setDonvinhan(request.getDonvinhanId() != null
                        ? loadDonVi(request.getDonvinhanId()) : null);

                // Điều chuyển: đơn vị nhận không được trùng đơn vị giao
                if (phieu.getDonvigiao() != null && phieu.getDonvinhan() != null
                        && phieu.getDonvigiao().getDonviId().equals(phieu.getDonvinhan().getDonviId())) {
                    throw new BadRequestException("Đơn vị nhận trùng với đơn vị giao");
                }

                // Vị trí mới không bắt buộc — chỉ cập nhật khi client truyền lên
                if (request.getVitriId() != null) {
                    ViTri vitriMoi = viTriRepository.findById(request.getVitriId())
                            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vị trí"));
                    if (taisan.getVitri() != null
                            && taisan.getVitri().getVitriId().equals(vitriMoi.getVitriId())) {
                        throw new BadRequestException("Vị trí mới trùng với vị trí hiện tại của tài sản");
                    }
                    phieu.setVitri(vitriMoi);
                    taisan.setVitri(vitriMoi);
                }
            }
        }

        taiSanRepository.save(taisan);

        // Ghi lịch sử thay đổi trạng thái (bảng lichsutrangthai)
        if (doiTrangThai) {
            LichSuTrangThai lichSu = new LichSuTrangThai();
            lichSu.setTaisan(taisan);
            lichSu.setTrangthaitaisan(trangThaiMoi);
            lichSu.setNguoidung(nguoidungHienTai);
            lichSuTrangThaiRepository.save(lichSu);
        }

        LuanChuyen saved = luanChuyenRepository.save(phieu);
        return toResponse(saved);
    }

    private void validateKhongChonCaHai(Long nguoiId, Integer donviId, String ben) {
        if (nguoiId != null && donviId != null) {
            throw new BadRequestException(
                    "Bên " + ben + " chỉ được chọn một trong hai: người hoặc đơn vị");
        }
    }

    private NguoiDung loadNguoiDung(Long id) {
        return nguoiDungRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
    }

    private DonVi loadDonVi(Integer id) {
        return donViRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn vị"));
    }

    private TrangThaiTaiSan loadTrangThai(String matrangthai) {
        return trangThaiTaiSanRepository.findByMatrangthai(matrangthai)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy trạng thái tài sản: " + matrangthai));
    }

    private LuanChuyenResponse toResponse(LuanChuyen l) {
        TaiSan ts = l.getTaisan();
        return LuanChuyenResponse.builder()
                .luanchuyenId(l.getLuanchuyenId())
                .loaiphieu(l.getLoaiphieu())
                .taisanId(ts.getTaisanId())
                .mataisan(ts.getMataisan())
                .tentaisan(ts.getTentaisan())
                .nguoigiaoId(l.getNguoigiao() != null ? l.getNguoigiao().getNguoidungId() : null)
                .tenNguoiGiao(l.getNguoigiao() != null ? l.getNguoigiao().getHoten() : null)
                .donvigiaoId(l.getDonvigiao() != null ? l.getDonvigiao().getDonviId() : null)
                .tenDonViGiao(l.getDonvigiao() != null ? l.getDonvigiao().getTendonvi() : null)
                .nguoinhanId(l.getNguoinhan() != null ? l.getNguoinhan().getNguoidungId() : null)
                .tenNguoiNhan(l.getNguoinhan() != null ? l.getNguoinhan().getHoten() : null)
                .donvinhanId(l.getDonvinhan() != null ? l.getDonvinhan().getDonviId() : null)
                .tenDonViNhan(l.getDonvinhan() != null ? l.getDonvinhan().getTendonvi() : null)
                .vitriId(l.getVitri() != null ? l.getVitri().getVitriId() : null)
                .tenViTri(l.getVitri() != null ? l.getVitri().getTenvitri() : null)
                .tenDonVi(l.getVitri() != null && l.getVitri().getDonvi() != null
                        ? l.getVitri().getDonvi().getTendonvi() : null)
                .ngaythuchien(l.getNgaythuchien())
                .lydo(l.getLydo())
                .build();
    }
}
