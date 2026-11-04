import axiosClient from './axiosClient'

const baoTriApi = {
  // Lay tat ca phieu bao tri
  getAll: () => axiosClient.get('/bao-tri'),
  
  // Lay phieu bao tri theo ID
  getById: (id) => axiosClient.get(`/bao-tri/${id}`),
  
  // Lay phieu bao tri theo trang thai
  getByTrangThai: (trangthaixuly) => axiosClient.get(`/bao-tri/trang-thai/${trangthaixuly}`),
  
  // Lay phieu bao tri theo tai san
  getByTaiSan: (taisanId) => axiosClient.get(`/bao-tri/tai-san/${taisanId}`),
  
  // Tim kiem phieu bao tri
  search: (keyword) => axiosClient.get('/bao-tri/search', { params: { keyword } }),
  
  // Tao phieu bao tri moi
  create: (data) => axiosClient.post('/bao-tri', data),
  
  // Cap nhat phieu bao tri
  update: (id, data) => axiosClient.put(`/bao-tri/${id}`, data),
  
  // Xoa phieu bao tri
  delete: (id) => axiosClient.delete(`/bao-tri/${id}`),
  
  // Lay thong ke
  getThongKe: () => axiosClient.get('/bao-tri/thong-ke'),
  
  // Lay danh sach tai san can bao tri
  getCanBaoTri: () => axiosClient.get('/bao-tri/can-bao-tri'),
  
  // Tao nhieu phieu bao tri (batch)
  createBatch: (data) => axiosClient.post('/bao-tri/batch', data),
}

export default baoTriApi
