import { createContext, useState, useEffect } from 'react'
import authApi from '../api/authApi'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      authApi.getCurrentUser()
        .then((response) => {
          // Backend trả về ApiResponse, data nằm trong response.data
          setUser(response.data)
        })
        .catch(() => {
          localStorage.removeItem('token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (credentials) => {
    const response = await authApi.login(credentials)
    // response.data chứa {token, nguoidungId, tendangnhap, ...}
    const { token, ...userData } = response.data
    localStorage.setItem('token', token)
    setUser(userData)
    return response
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    // HashRouter: điều hướng kèm base để đúng đường dẫn GitHub Pages
    window.location.href = `${import.meta.env.BASE_URL}#/dangnhap`
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
