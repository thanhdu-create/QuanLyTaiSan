import axiosClient from './axiosClient'

const taiSanApi = {
  // Lay tat ca tai san
  getAll: () => axiosClient.get('/tai-san'),
  
  // Lay tai san theo ID
  getById: (id) => axiosClient.get(`/tai-san/${id}`),
  
  // Lay tai san theo ma
  getByMa: (mataisan) => axiosClient.get(`/tai-san/ma/${mataisan}`),
  
  // Tim kiem tai san
  search: (keyword) => axiosClient.get('/tai-san/search', { params: { keyword } }),
  
  // Lay tai san theo loai
  getByLoai: (loaitaisanId) => axiosClient.get(`/tai-san/loai/${loaitaisanId}`),
  
  // Tao tai san moi
  create: (data) => axiosClient.post('/tai-san', data),
  
  // Cap nhat tai san
  update: (id, data) => axiosClient.put(`/tai-san/${id}`, data),
  
  // Xoa tai san
  delete: (id) => axiosClient.delete(`/tai-san/${id}`),
  
  // Lay tai san theo don vi
  getByDonVi: (donviId) => axiosClient.get(`/tai-san/by-don-vi/${donviId}`),
}

export default taiSanApi
