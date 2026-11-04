package com.tvu.quanlytaisan.service;

import com.tvu.quanlytaisan.dto.request.NguoiDungRequest;
import com.tvu.quanlytaisan.dto.response.NguoiDungResponse;
import com.tvu.quanlytaisan.entity.DonVi;
import com.tvu.quanlytaisan.entity.NguoiDung;
import com.tvu.quanlytaisan.enums.QuyenHan;
import com.tvu.quanlytaisan.exception.BadRequestException;
import com.tvu.quanlytaisan.exception.ResourceNotFoundException;
import com.tvu.quanlytaisan.repository.DonViRepository;
import com.tvu.quanlytaisan.repository.NguoiDungRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NguoiDungService {

    private final NguoiDungRepository nguoiDungRepository;
    private final DonViRepository donViRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<NguoiDungResponse> getAll(Boolean hoatdong) {
        List<NguoiDung> list = (hoatdong != null)
                ? nguoiDungRepository.findByHoatdong(hoatdong)
                : nguoiDungRepository.findAll();
        return list.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public NguoiDungResponse getById(Long id) {
        return toResponse(findNguoiDung(id));
    }

    @Transactional
    public NguoiDungResponse create(NguoiDungRequest request) {
        String tendangnhap = request.getTendangnhap().trim();
        if (nguoiDungRepository.existsByTendangnhap(tendangnhap)) {
            throw new BadRequestException("Tên đăng nhập đã tồn tại: " + tendangnhap);
        }

        String email = normalizeEmail(request.getEmail());
        if (email != null && nguoiDungRepository.existsByEmail(email)) {
            throw new BadRequestException("Email đã được sử dụng: " + email);
        }

        String matkhau = request.getMatkhau();
        if (matkhau == null || matkhau.isBlank()) {
            throw new BadRequestException("Mật khẩu không được để trống");
        }
        if (matkhau.length() < 6) {
            throw new BadRequestException("Mật khẩu phải có ít nhất 6 ký tự");
        }

        NguoiDung nguoiDung = new NguoiDung();
        nguoiDung.setTendangnhap(tendangnhap);
        nguoiDung.setMatkhaumahoa(passwordEncoder.encode(matkhau));
        nguoiDung.setHoten(request.getHoten().trim());
        nguoiDung.setEmail(email);
        nguoiDung.setVaitro(request.getVaitro());
        nguoiDung.setDonvi(resolveDonVi(request.getDonviId()));
        nguoiDung.setHoatdong(request.getHoatdong() == null || request.getHoatdong());
        nguoiDung.setQuyenhan(QuyenHan.serialize(request.getQuyenhan()));

        return toResponse(nguoiDungRepository.save(nguoiDung));
    }

    @Transactional
    public NguoiDungResponse update(Long id, NguoiDungRequest request) {
        NguoiDung nguoiDung = findNguoiDung(id);

        String tendangnhap = request.getTendangnhap().trim();
        if (nguoiDungRepository.existsByTendangnhapAndNguoidungIdNot(tendangnhap, id)) {
            throw new BadRequestException("Tên đăng nhập đã tồn tại: " + tendangnhap);
        }

        String email = normalizeEmail(request.getEmail());
        if (email != null && nguoiDungRepository.existsByEmailAndNguoidungIdNot(email, id)) {
            throw new BadRequestException("Email đã được sử dụng: " + email);
        }

        String matkhau = request.getMatkhau();
        if (matkhau != null && !matkhau.isBlank()) {
            if (matkhau.length() < 6) {
                throw new BadRequestException("Mật khẩu phải có ít nhất 6 ký tự");
            }
            nguoiDung.setMatkhaumahoa(passwordEncoder.encode(matkhau));
        }

        nguoiDung.setTendangnhap(tendangnhap);
        nguoiDung.setHoten(request.getHoten().trim());
        nguoiDung.setEmail(email);
        nguoiDung.setVaitro(request.getVaitro());
        nguoiDung.setDonvi(resolveDonVi(request.getDonviId()));
        if (request.getHoatdong() != null) {
            nguoiDung.setHoatdong(request.getHoatdong());
        }
        if (request.getQuyenhan() != null) {
            nguoiDung.setQuyenhan(QuyenHan.serialize(request.getQuyenhan()));
        }

        return toResponse(nguoiDungRepository.save(nguoiDung));
    }

    @Transactional
    public NguoiDungResponse updateQuyenHan(Long id, List<String> quyenhan) {
        NguoiDung nguoiDung = findNguoiDung(id);
        nguoiDung.setQuyenhan(QuyenHan.serialize(quyenhan));
        return toResponse(nguoiDungRepository.save(nguoiDung));
    }

    @Transactional
    public void delete(Long id) {
        NguoiDung nguoiDung = findNguoiDung(id);
        nguoiDungRepository.delete(nguoiDung);
    }

    private NguoiDung findNguoiDung(Long id) {
        return nguoiDungRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
    }

    private DonVi resolveDonVi(Integer donviId) {
        if (donviId == null) {
            return null;
        }
        return donViRepository.findById(donviId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn vị"));
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }
        return email.trim();
    }

    private NguoiDungResponse toResponse(NguoiDung nd) {
        return NguoiDungResponse.builder()
                .nguoidungId(nd.getNguoidungId())
                .tendangnhap(nd.getTendangnhap())
                .hoten(nd.getHoten())
                .email(nd.getEmail())
                .vaitro(nd.getVaitro())
                .donviId(nd.getDonvi() != null ? nd.getDonvi().getDonviId() : null)
                .tenDonVi(nd.getDonvi() != null ? nd.getDonvi().getTendonvi() : null)
                .hoatdong(nd.getHoatdong())
                .createdAt(nd.getCreatedAt())
                .quyenhan(QuyenHan.parse(nd.getQuyenhan()))
                .build();
    }
}
