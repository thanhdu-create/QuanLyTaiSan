import axios from 'axios'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

axiosClient.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      // HashRouter: điều hướng kèm base để đúng đường dẫn GitHub Pages
      window.location.href = `${import.meta.env.BASE_URL}#/dangnhap`
    }
    return Promise.reject(err)
  }
)

export default axiosClient
