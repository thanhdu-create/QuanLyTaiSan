import axiosClient from './axiosClient'

const thongkeApi = {
  getDashboard: () => axiosClient.get('/thongke/dashboard'),
  getMyDashboard: () => axiosClient.get('/thongke/dashboard/me'),
  getTaiSanByTrangThai: () => axiosClient.get('/thongke/taisan-trangthai'),
  getTaiSanByLoai: () => axiosClient.get('/thongke/taisan-loai'),
  getTaiSanByDonVi: () => axiosClient.get('/thongke/taisan-donvi'),
}

export default thongkeApi
