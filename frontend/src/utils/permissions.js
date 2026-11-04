// Các trang admin có thể cấp riêng cho từng người dùng (khớp enum QuyenHan ở backend)
export const PERMISSION_OPTIONS = [
  { value: 'LUANCHUYEN', label: 'Luân chuyển' },
  { value: 'BAOTRI', label: 'Bảo trì' },
  { value: 'KIEMKE', label: 'Kiểm kê' },
  { value: 'LOAITAISAN', label: 'Loại tài sản' },
  { value: 'TAISAN', label: 'Tài sản' },
  { value: 'DONVIVITRI', label: 'Đơn vị & Vị trí' },
]

export const getPermissionLabel = (code) =>
  PERMISSION_OPTIONS.find((option) => option.value === code)?.label || code

// ADMIN luôn có toàn quyền, người dùng thường cần được cấp mã quyền tương ứng
export const hasPermission = (user, code) =>
  user?.vaitro === 'ADMIN' || !!user?.quyenhan?.includes(code)
