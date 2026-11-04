package com.tvu.quanlytaisan.dto.request;

import com.tvu.quanlytaisan.enums.VaiTro;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NguoiDungRequest {

    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(max = 50, message = "Tên đăng nhập không được quá 50 ký tự")
    private String tendangnhap;

    // Bắt buộc khi tạo mới, để trống khi cập nhật nếu không đổi mật khẩu
    @Size(max = 100, message = "Mật khẩu không được quá 100 ký tự")
    private String matkhau;

    @NotBlank(message = "Họ tên không được để trống")
    @Size(max = 100, message = "Họ tên không được quá 100 ký tự")
    private String hoten;

    @Email(message = "Email không hợp lệ")
    @Size(max = 100, message = "Email không được quá 100 ký tự")
    private String email;

    @NotNull(message = "Vui lòng chọn vai trò")
    private VaiTro vaitro;

    private Integer donviId;

    private Boolean hoatdong;

    // Chỉ cập nhật khi khác null, tránh vô tình xóa quyền khi sửa thông tin cơ bản
    private List<String> quyenhan;
}
