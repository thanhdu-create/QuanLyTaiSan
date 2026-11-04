package com.tvu.quanlytaisan.enums;

import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Các trang admin có thể được cấp riêng cho từng người dùng.
 * Lưu trong nguoidung.quyenhan dưới dạng CSV (VD: "LUANCHUYEN,BAOTRI").
 */
public enum QuyenHan {
    LUANCHUYEN,
    BAOTRI,
    KIEMKE,
    LOAITAISAN,
    TAISAN,
    DONVIVITRI;

    public static List<String> parse(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        List<String> result = new ArrayList<>();
        for (String code : value.split(",")) {
            String normalized = code.trim().toUpperCase();
            if (!normalized.isEmpty() && isValid(normalized)) {
                result.add(normalized);
            }
        }
        return result;
    }

    public static String serialize(Collection<String> codes) {
        if (codes == null || codes.isEmpty()) {
            return null;
        }
        Set<String> valid = new LinkedHashSet<>();
        for (String code : codes) {
            if (code == null) {
                continue;
            }
            String normalized = code.trim().toUpperCase();
            if (!normalized.isEmpty() && isValid(normalized)) {
                valid.add(normalized);
            }
        }
        return valid.isEmpty() ? null : String.join(",", valid);
    }

    private static boolean isValid(String code) {
        for (QuyenHan quyenHan : values()) {
            if (quyenHan.name().equals(code)) {
                return true;
            }
        }
        return false;
    }
}
