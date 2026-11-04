import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, Dropdown, Grid, Drawer } from 'antd'
import {
  DashboardOutlined,
  AppstoreOutlined,
  QrcodeOutlined,
  SwapOutlined,
  ToolOutlined,
  FileSearchOutlined,
  DatabaseOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BugOutlined,
  TagsOutlined,
  InboxOutlined,
  ApartmentOutlined,
} from '@ant-design/icons'
import { useAuth } from '../hooks/useAuth'
import { hasPermission } from '../utils/permissions'

const { Header, Sider, Content } = Layout

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const screens = Grid.useBreakpoint()
  // Phone: dưới breakpoint md (768px) — menu chuyển vào Drawer
  const isMobile = screens.md === false

  const isAdmin = user?.vaitro === 'ADMIN'

  const canLoaiTaiSan = hasPermission(user, 'LOAITAISAN')
  const canTaiSan = hasPermission(user, 'TAISAN')
  const canDonViViTri = hasPermission(user, 'DONVIVITRI')
  const canManage = canLoaiTaiSan || canTaiSan || canDonViViTri

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/'),
    },
    {
      key: '/quetqr',
      icon: <QrcodeOutlined />,
      label: 'Quét QR',
      onClick: () => navigate('/quetqr'),
    },
    hasPermission(user, 'LUANCHUYEN') && {
      key: '/luanchuyen',
      icon: <SwapOutlined />,
      label: 'Luân chuyển',
      onClick: () => navigate('/luanchuyen'),
    },
    hasPermission(user, 'BAOTRI') && {
      key: '/admin/bao-tri',
      icon: <ToolOutlined />,
      label: 'Bảo trì',
      onClick: () => navigate('/admin/bao-tri'),
    },
    hasPermission(user, 'KIEMKE') && {
      key: '/kiemke',
      icon: <FileSearchOutlined />,
      label: 'Kiểm kê',
      onClick: () => navigate('/kiemke'),
    },
    canManage && {
      key: 'admin',
      icon: <DatabaseOutlined />,
      label: 'Quản lý',
      children: [
        canLoaiTaiSan && {
          key: '/admin/loai-tai-san',
          icon: <TagsOutlined />,
          label: 'Loại tài sản',
          onClick: () => navigate('/admin/loai-tai-san'),
        },
        canTaiSan && {
          key: '/admin/tai-san',
          icon: <InboxOutlined />,
          label: 'Tài sản',
          onClick: () => navigate('/admin/tai-san'),
        },
        canDonViViTri && {
          key: '/admin/don-vi-vi-tri',
          icon: <ApartmentOutlined />,
          label: 'Đơn vị & Vị trí',
          onClick: () => navigate('/admin/don-vi-vi-tri'),
        },
      ].filter(Boolean),
    },
    isAdmin && {
      key: '/nguoidung',
      icon: <UserOutlined />,
      label: 'Người dùng',
      onClick: () => navigate('/nguoidung'),
    },
  ].filter(Boolean)

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: logout,
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {isMobile ? (
        <Drawer
          placement="left"
          width={240}
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          closable={false}
          styles={{ body: { padding: 0, background: '#001529' } }}
        >
          <div style={{
            height: 32,
            margin: 16,
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
          }}>
            QL Tài Sản QR
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            defaultOpenKeys={['admin']}
            items={menuItems}
            onClick={() => setMobileMenuOpen(false)}
          />
        </Drawer>
      ) : (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{ position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', alignSelf: 'flex-start' }}
        >
          <div style={{
            height: 32,
            margin: 16,
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
          }}>
            {!collapsed && 'QL Tài Sản QR'}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            defaultOpenKeys={['admin']}
            items={menuItems}
          />
        </Sider>
      )}
      <Layout>
        <Header style={{ padding: '0 16px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            type="text"
            icon={isMobile || collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => (isMobile ? setMobileMenuOpen(true) : setCollapsed(!collapsed))}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="text" icon={<UserOutlined />}>
              {user?.hoten || user?.tendangnhap}
            </Button>
          </Dropdown>
        </Header>
        <Content style={{
          margin: isMobile ? '12px 8px' : '24px 16px',
          padding: isMobile ? 12 : 24,
          background: '#fff',
          minHeight: 280,
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
