package com.tvu.quanlytaisan.service;

import com.tvu.quanlytaisan.entity.BaoTri;
import com.tvu.quanlytaisan.entity.DotKiemKe;
import com.tvu.quanlytaisan.entity.LuanChuyen;
import com.tvu.quanlytaisan.entity.NguoiDung;
import com.tvu.quanlytaisan.entity.TaiSan;
import com.tvu.quanlytaisan.enums.KetQuaKiemKe;
import com.tvu.quanlytaisan.enums.TrangThaiDotKiemKe;
import com.tvu.quanlytaisan.enums.TrangThaiXuLy;
import com.tvu.quanlytaisan.exception.ResourceNotFoundException;
import com.tvu.quanlytaisan.exception.UnauthorizedException;
import com.tvu.quanlytaisan.repository.BaoTriRepository;
import com.tvu.quanlytaisan.repository.ChiTietKiemKeRepository;
import com.tvu.quanlytaisan.repository.DotKiemKeRepository;
import com.tvu.quanlytaisan.repository.LuanChuyenRepository;
import com.tvu.quanlytaisan.repository.NguoiDungRepository;
import com.tvu.quanlytaisan.repository.TaiSanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ThongKeService {

    private final TaiSanRepository taiSanRepository;
    private final BaoTriRepository baoTriRepository;
    private final LuanChuyenRepository luanChuyenRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final DotKiemKeRepository dotKiemKeRepository;
    private final ChiTietKiemKeRepository chiTietKiemKeRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        List<TaiSan> taiSans = taiSanRepository.findByDaxoaFalse();

        long dangSuDung = 0;
        long conTrong = 0;
        long dangBaoTri = 0;
        long huHong = 0;
        long sapHetKhauHao = 0;
        BigDecimal tongGiaTri = BigDecimal.ZERO;
        Map<String, Long> theoLoai = new LinkedHashMap<>();
        Map<String, Long> theoDonVi = new LinkedHashMap<>();

        for (TaiSan ts : taiSans) {
            String matrangthai = ts.getTrangthaitaisan() != null ? ts.getTrangthaitaisan().getMatrangthai() : "";
            switch (matrangthai) {
                case "IN_USE" -> dangSuDung++;
                case "AVAILABLE" -> conTrong++;
                case "MAINTENANCE" -> dangBaoTri++;
                case "BROKEN" -> huHong++;
                default -> { }
            }

            if (ts.getGiatri() != null) {
                tongGiaTri = tongGiaTri.add(ts.getGiatri());
            }
            if (isSapHetKhauHao(ts)) {
                sapHetKhauHao++;
            }

            String tenloai = ts.getLoaitaisan() != null ? ts.getLoaitaisan().getTenloai() : "Khác";
            theoLoai.merge(tenloai, 1L, Long::sum);

            String tendonvi = ts.getVitri() != null && ts.getVitri().getDonvi() != null
                    ? ts.getVitri().getDonvi().getTendonvi()
                    : "Chưa phân bổ";
            theoDonVi.merge(tendonvi, 1L, Long::sum);
        }

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("tongTaiSan", (long) taiSans.size());
        stats.put("dangSuDung", dangSuDung);
        stats.put("conTrong", conTrong);
        stats.put("dangBaoTri", dangBaoTri);
        stats.put("huHong", huHong);
        stats.put("tongGiaTri", tongGiaTri);
        stats.put("taiSanTheoLoai", toChartData(theoLoai));
        stats.put("taiSanTheoDonVi", toChartData(theoDonVi));

        stats.put("phieuBaoTriChoXuLy", baoTriRepository.countByTrangthaixuly(TrangThaiXuLy.CHOXULY));
        stats.put("baoTriQuaHan", baoTriRepository.countQuaHan(LocalDate.now()));
        stats.put("taiSanSapHetKhauHao", sapHetKhauHao);
        stats.put("taiSanMoi", getTaiSanMoi());
        stats.put("phieuBaoTriGanDay", getPhieuBaoTriGanDay());
        stats.put("luanChuyenGanDay", getLuanChuyenGanDay());
        return stats;
    }

    /**
     * Dashboard cho người dùng thường: chỉ dữ liệu trong phạm vi đơn vị của họ
     * (hoặc tài sản cá nhân nếu chưa thuộc đơn vị). Các khối nghiệp vụ
     * (bảo trì / luân chuyển / kiểm kê) chỉ trả khi được cấp quyền tương ứng.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getMyDashboardStats() {
        NguoiDung nguoiDung = getCurrentNguoiDung();
        Long nguoidungId = nguoiDung.getNguoidungId();
        Integer donviId = nguoiDung.getDonvi() != null ? nguoiDung.getDonvi().getDonviId() : null;

        List<TaiSan> taiSanCuaToi = taiSanRepository.findByNguoisudung(nguoidungId);
        List<TaiSan> taiSanDonVi = donviId != null
                ? taiSanRepository.findByViTriDonviDonviId(donviId)
                : List.of();
        List<TaiSan> phamVi = donviId != null ? taiSanDonVi : taiSanCuaToi;

        long dangSuDung = 0;
        long conTrong = 0;
        long dangBaoTri = 0;
        long huHong = 0;
        for (TaiSan ts : phamVi) {
            String matrangthai = ts.getTrangthaitaisan() != null ? ts.getTrangthaitaisan().getMatrangthai() : "";
            switch (matrangthai) {
                case "IN_USE" -> dangSuDung++;
                case "AVAILABLE" -> conTrong++;
                case "MAINTENANCE" -> dangBaoTri++;
                case "BROKEN" -> huHong++;
                default -> { }
            }
        }

        long taiSanCuaToiDangBaoTri = taiSanCuaToi.stream()
                .filter(ts -> ts.getTrangthaitaisan() != null
                        && "MAINTENANCE".equals(ts.getTrangthaitaisan().getMatrangthai()))
                .count();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("coDonVi", donviId != null);
        stats.put("tenDonVi", nguoiDung.getDonvi() != null ? nguoiDung.getDonvi().getTendonvi() : null);
        stats.put("taiSanCuaToi", (long) taiSanCuaToi.size());
        stats.put("taiSanDonVi", (long) taiSanDonVi.size());
        stats.put("dangSuDung", dangSuDung);
        stats.put("conTrong", conTrong);
        stats.put("dangBaoTri", dangBaoTri);
        stats.put("huHong", huHong);
        stats.put("taiSanCuaToiDangBaoTri", taiSanCuaToiDangBaoTri);

        List<TaiSan> danhSach = !taiSanCuaToi.isEmpty() ? taiSanCuaToi : taiSanDonVi;
        stats.put("phamViDanhSach",
                !taiSanCuaToi.isEmpty() ? "CA_NHAN" : (donviId != null ? "DON_VI" : "TRONG"));
        stats.put("danhSachTaiSan", mapDanhSachTaiSan(danhSach));

        if (hasAuthority("PERM_BAOTRI")) {
            List<BaoTri> baoTris = donviId != null
                    ? baoTriRepository.findGanDayByDonVi(donviId)
                    : baoTriRepository.findGanDayByNguoiDung(nguoidungId);
            long choXuLy = donviId != null
                    ? baoTriRepository.countByDonViAndTrangthai(donviId, TrangThaiXuLy.CHOXULY)
                    : baoTriRepository.countByNguoiDungAndTrangthai(nguoidungId, TrangThaiXuLy.CHOXULY);
            long quaHan = donviId != null
                    ? baoTriRepository.countQuaHanByDonVi(donviId, LocalDate.now())
                    : baoTriRepository.countQuaHanByNguoiDung(nguoidungId, LocalDate.now());
            stats.put("phieuBaoTriChoXuLy", choXuLy);
            stats.put("baoTriQuaHan", quaHan);
            stats.put("phieuBaoTriGanDay", mapBaoTri(baoTris));
        }

        if (hasAuthority("PERM_LUANCHUYEN")) {
            stats.put("luanChuyenGanDay",
                    mapLuanChuyen(luanChuyenRepository.findLienQuan(nguoidungId, donviId)));
        }

        if (hasAuthority("PERM_KIEMKE")) {
            stats.put("dotKiemKeDangMo",
                    mapDotKiemKe(dotKiemKeRepository.findDangMoTaiDonVi(TrangThaiDotKiemKe.DANGMO, donviId)));
        }

        return stats;
    }

    private boolean isSapHetKhauHao(TaiSan ts) {
        if (ts.getNgaymua() == null) {
            return false;
        }
        long soNgay = ChronoUnit.DAYS.between(ts.getNgaymua(), LocalDate.now());
        double soNam = soNgay / 365.25;
        int thoigianSudung = ts.getThoigianSudung() != null && ts.getThoigianSudung() > 0 ? ts.getThoigianSudung() : 5;
        double tyle = Math.min(100.0, soNam / thoigianSudung * 100);
        return tyle >= 80.0;
    }

    private List<Map<String, Object>> getTaiSanMoi() {
        return taiSanRepository.findByDaxoaFalseOrderByCreatedAtDescTaisanIdDesc().stream()
                .map(ts -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("taisanId", ts.getTaisanId());
                    item.put("mataisan", ts.getMataisan());
                    item.put("tentaisan", ts.getTentaisan());
                    item.put("tenloai", ts.getLoaitaisan() != null ? ts.getLoaitaisan().getTenloai() : null);
                    item.put("tentrangthai", ts.getTrangthaitaisan() != null ? ts.getTrangthaitaisan().getTentrangthai() : null);
                    item.put("ngaymua", ts.getNgaymua());
                    item.put("createdAt", ts.getCreatedAt());
                    return item;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> getPhieuBaoTriGanDay() {
        return mapBaoTri(baoTriRepository.findAllByOrderByNgaybaoDescBaotriIdDesc());
    }

    private List<Map<String, Object>> getLuanChuyenGanDay() {
        return mapLuanChuyen(luanChuyenRepository.findAllByOrderByNgaythuchienDescLuanchuyenIdDesc());
    }

    private List<Map<String, Object>> mapBaoTri(List<BaoTri> list) {
        return list.stream()
                .map(bt -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("baotriId", bt.getBaotriId());
                    item.put("mataisan", bt.getTaisan() != null ? bt.getTaisan().getMataisan() : null);
                    item.put("tentaisan", bt.getTaisan() != null ? bt.getTaisan().getTentaisan() : null);
                    item.put("loaibaotri", bt.getLoaibaotri() != null ? bt.getLoaibaotri().name() : null);
                    item.put("ngaybao", bt.getNgaybao());
                    item.put("trangthaixuly", bt.getTrangthaixuly() != null ? bt.getTrangthaixuly().name() : null);
                    return item;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> mapLuanChuyen(List<LuanChuyen> list) {
        return list.stream()
                .map(lc -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("luanchuyenId", lc.getLuanchuyenId());
                    item.put("loaiphieu", lc.getLoaiphieu() != null ? lc.getLoaiphieu().name() : null);
                    item.put("mataisan", lc.getTaisan() != null ? lc.getTaisan().getMataisan() : null);
                    item.put("tentaisan", lc.getTaisan() != null ? lc.getTaisan().getTentaisan() : null);
                    item.put("benGiao", lc.getNguoigiao() != null
                            ? lc.getNguoigiao().getHoten()
                            : (lc.getDonvigiao() != null ? lc.getDonvigiao().getTendonvi() : null));
                    item.put("benNhan", lc.getNguoinhan() != null
                            ? lc.getNguoinhan().getHoten()
                            : (lc.getDonvinhan() != null ? lc.getDonvinhan().getTendonvi() : null));
                    item.put("ngaythuchien", lc.getNgaythuchien());
                    return item;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> mapDanhSachTaiSan(List<TaiSan> list) {
        return list.stream()
                .map(ts -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("taisanId", ts.getTaisanId());
                    item.put("mataisan", ts.getMataisan());
                    item.put("tentaisan", ts.getTentaisan());
                    item.put("tenloai", ts.getLoaitaisan() != null ? ts.getLoaitaisan().getTenloai() : null);
                    item.put("tenvitri", ts.getVitri() != null ? ts.getVitri().getTenvitri() : null);
                    item.put("tenDonVi", ts.getVitri() != null && ts.getVitri().getDonvi() != null
                            ? ts.getVitri().getDonvi().getTendonvi() : null);
                    item.put("tentrangthai", ts.getTrangthaitaisan() != null
                            ? ts.getTrangthaitaisan().getTentrangthai() : null);
                    item.put("ngaymua", ts.getNgaymua());
                    item.put("createdAt", ts.getCreatedAt());
                    return item;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> mapDotKiemKe(List<DotKiemKe> dots) {
        return dots.stream()
                .map(dot -> {
                    Long tongTaiSan = chiTietKiemKeRepository.countByDotkiemkeDotkiemkeId(dot.getDotkiemkeId());
                    Long daKiem = chiTietKiemKeRepository.countDaKiem(dot.getDotkiemkeId());
                    Long chuaKiem = chiTietKiemKeRepository
                            .countByDotkiemkeDotkiemkeIdAndKetqua(dot.getDotkiemkeId(), KetQuaKiemKe.CHUAKIEM);

                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("dotkiemkeId", dot.getDotkiemkeId());
                    item.put("tendot", dot.getTendot());
                    item.put("tendonvi", dot.getDonvi() != null ? dot.getDonvi().getTendonvi() : "Toàn trường");
                    item.put("ngaybatdau", dot.getNgaybatdau());
                    item.put("tongTaiSan", tongTaiSan);
                    item.put("daKiem", daKiem);
                    item.put("chuaKiem", chuaKiem);
                    return item;
                })
                .collect(Collectors.toList());
    }

    private NguoiDung getCurrentNguoiDung() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("Chưa đăng nhập");
        }
        return nguoiDungRepository.findByTendangnhap(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
    }

    private boolean hasAuthority(String authority) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> authority.equals(a.getAuthority()));
    }

    private List<Map<String, Object>> toChartData(Map<String, Long> counts) {
        return counts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(entry -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("name", entry.getKey());
                    item.put("value", entry.getValue());
                    return item;
                })
                .collect(Collectors.toList());
    }
}
