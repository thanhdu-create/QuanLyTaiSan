import { useAuth } from '../../hooks/useAuth'
import AdminDashboard from './AdminDashboard'
import UserDashboard from './UserDashboard'

const Dashboard = () => {
  const { user } = useAuth()

  return user?.vaitro === 'ADMIN' ? <AdminDashboard /> : <UserDashboard />
}

export default Dashboard
