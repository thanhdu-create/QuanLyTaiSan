import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Spin } from 'antd'

const AdminRoute = ({ children, permission }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/dangnhap" replace />
  }

  const allowed =
    user.vaitro === 'ADMIN' || (!!permission && !!user.quyenhan?.includes(permission))

  if (!allowed) {
    return <Navigate to="/" replace />
  }

  return children
}

export default AdminRoute
