import { HashRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import { AuthProvider } from './context/AuthContext'
import AppRoutes from './routes/AppRoutes'
import 'dayjs/locale/vi'
import dayjs from 'dayjs'

dayjs.locale('vi')

function App() {
  return (
    <ConfigProvider locale={viVN}>
      <HashRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </HashRouter>
    </ConfigProvider>
  )
}

export default App
