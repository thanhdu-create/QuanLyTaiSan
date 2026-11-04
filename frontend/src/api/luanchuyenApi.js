import axiosClient from './axiosClient'

const luanchuyenApi = {
  getAll: (params) => axiosClient.get('/luanchuyen', { params }),
  getById: (id) => axiosClient.get(`/luanchuyen/${id}`),
  getByTaisan: (taisanId) => axiosClient.get(`/luanchuyen/taisan/${taisanId}`),
  create: (data) => axiosClient.post('/luanchuyen', data),
}

export default luanchuyenApi
