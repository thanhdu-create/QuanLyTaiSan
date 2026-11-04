import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Statistic, Spin, Grid, Empty, message, List, Tag, Avatar } from 'antd'
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  ToolOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  AlertOutlined,
  SwapOutlined,
} from '@ant-design/icons'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import dayjs from 'dayjs'
import thongkeApi from '../../api/thongkeApi'
import { useAuth } from '../../hooks/useAuth'

const PIE_COLORS = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16']

const BAOTRI_STATUS = {
  CHOXULY: { text: 'Chờ xử lý', color: 'orange' },
  DANGXULY: { text: 'Đang xử lý', color: 'blue' },
  HOANTHANH: { text: 'Hoàn thành', color: 'green' },
  DAHUY: { text: 'Đã hủy', color: 'red' },
}

const LUANCHUYEN_TYPE = {
  BANGIAO: { text: 'Bàn giao', color: 'blue' },
  DIEUCHUYEN: { text: 'Điều chuyển', color: 'purple' },
  THUHOI: { text: 'Thu hồi', color: 'orange' },
}

const formatTien = (value) => `${new Intl.NumberFormat('vi-VN').format(value ?? 0)} đ`

// Moi danh sach chi hien thi 5 dong dau, cuon de xem tiep
const LIST_ITEM_HEIGHT = 64
const LIST_VISIBLE_ITEMS = 5
const LIST_SCROLL_HEIGHT = LIST_ITEM_HEIGHT * LIST_VISIBLE_ITEMS + LIST_VISIBLE_ITEMS
const listItemStyle = { height: LIST_ITEM_HEIGHT, padding: '8px 0', boxSizing: 'border-box', overflow: 'hidden' }
const ellipsisText = { display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const screens = Grid.useBreakpoint()
  // Phone: dưới breakpoint md (768px); tablet: md đến dưới lg (992px)
  const isMobile = screens.md === false
  const isTablet = screens.md === true && screens.lg === false
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.vaitro === 'ADMIN'

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await thongkeApi.getDashboard()
        setStats(response.data)
      } catch (error) {
        message.error(error.response?.data?.message || 'Không thể tải dữ liệu thống kê')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    )
  }

  const cards = [
    { key: 'tongTaiSan', title: 'Tổng tài sản', value: stats?.tongTaiSan || 0, icon: <AppstoreOutlined />, color: '#1890ff' },
    { key: 'dangSuDung', title: 'Đang sử dụng', value: stats?.dangSuDung || 0, icon: <CheckCircleOutlined />, color: '#3f8600' },
    { key: 'conTrong', title: 'Còn trống', value: stats?.conTrong || 0, icon: <InboxOutlined />, color: '#13c2c2' },
    { key: 'dangBaoTri', title: 'Đang bảo trì', value: stats?.dangBaoTri || 0, icon: <ToolOutlined />, color: '#fa8c16' },
    { key: 'huHong', title: 'Hư hỏng', value: stats?.huHong || 0, icon: <CloseCircleOutlined />, color: '#cf1322' },
    { key: 'tongGiaTri', title: 'Tổng nguyên giá', value: stats?.tongGiaTri || 0, icon: <DollarOutlined />, color: '#722ed1', isCurrency: true },
  ]

  const alerts = [
    { key: 'choXuLy', title: 'Phiếu bảo trì chờ xử lý', value: stats?.phieuBaoTriChoXuLy || 0, icon: <ClockCircleOutlined />, color: '#fa8c16', to: '/admin/bao-tri' },
    { key: 'quaHan', title: 'Bảo trì quá hạn', value: stats?.baoTriQuaHan || 0, icon: <WarningOutlined />, color: '#cf1322', to: '/admin/bao-tri' },
    { key: 'khauHao', title: 'Tài sản khấu hao ≥ 80%', value: stats?.taiSanSapHetKhauHao || 0, icon: <AlertOutlined />, color: '#d4380d', to: '/admin/tai-san' },
  ]

  const loaiData = stats?.taiSanTheoLoai || []
  const donViData = stats?.taiSanTheoDonVi || []
  const taiSanMoi = stats?.taiSanMoi || []
  const phieuBaoTriGanDay = stats?.phieuBaoTriGanDay || []
  const luanChuyenGanDay = stats?.luanChuyenGanDay || []
  const chartHeight = isMobile ? 240 : isTablet ? 280 : 320
  const cardBody = { body: { padding: isMobile ? 12 : 24 } }
  const isNarrow = isMobile || isTablet

  return (
    <div>
      <h2 style={{ marginTop: 0, fontSize: isMobile ? 18 : isTablet ? 20 : 24 }}>Dashboard</h2>

      <Row gutter={[12, 12]}>
        {cards.map((item) => (
          <Col key={item.key} xs={12} sm={12} md={8} xl={4}>
            <Card styles={cardBody}>
              <Statistic
                title={item.title}
                value={item.value}
                prefix={item.icon}
                valueStyle={{
                  color: item.color,
                  fontSize: item.isCurrency
                    ? (isMobile ? 15 : isTablet ? 17 : 20)
                    : (isMobile ? 20 : isTablet ? 22 : 24),
                }}
                formatter={item.isCurrency ? (value) => formatTien(value) : undefined}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
        {alerts.map((item) => (
          <Col key={item.key} xs={24} sm={8}>
            <Card
              styles={cardBody}
              onClick={isAdmin ? () => navigate(item.to) : undefined}
              style={isAdmin ? { cursor: 'pointer' } : undefined}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 12 }}>
                <div
                  style={{
                    width: isMobile ? 36 : 40,
                    height: isMobile ? 36 : 40,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isMobile ? 18 : 20,
                    color: item.color,
                    background: `${item.color}14`,
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 600, color: item.color, lineHeight: 1.2 }}>
                    {item.value}
                  </div>
                  <div style={{ fontSize: isMobile ? 12 : 13, color: '#8c8c8c' }}>{item.title}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
        <Col xs={24} xl={12}>
          <Card title="Tài sản theo loại" styles={cardBody}>
            {loaiData.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu" />
            ) : (
              <ResponsiveContainer width="100%" height={chartHeight}>
                <PieChart>
                  <Pie
                    data={loaiData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy={isNarrow ? '45%' : '50%'}
                    outerRadius={isMobile ? 65 : isTablet ? 80 : 100}
                    label={!isNarrow}
                  >
                    {loaiData.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} tài sản`, 'Số lượng']} />
                  <Legend
                    layout={isNarrow ? 'horizontal' : 'vertical'}
                    verticalAlign={isNarrow ? 'bottom' : 'middle'}
                    align={isNarrow ? 'center' : 'right'}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card title="Tài sản theo đơn vị" styles={cardBody}>
            {donViData.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu" />
            ) : (
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart
                  data={donViData}
                  layout="vertical"
                  margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={isMobile ? 90 : isTablet ? 120 : 160}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip formatter={(value) => [`${value} tài sản`, 'Số lượng']} />
                  <Bar dataKey="value" fill="#1890ff" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12} xl={8}>
          <Card
            title={`Tài sản mới thêm (${taiSanMoi.length})`}
            styles={cardBody}
            hoverable={isAdmin}
            extra={isAdmin && !isMobile && <span style={{ fontSize: 13, color: '#1890ff' }}>Xem tất cả →</span>}
            onClick={isAdmin ? () => navigate('/admin/tai-san') : undefined}
          >
            <div style={{ maxHeight: LIST_SCROLL_HEIGHT, overflowY: 'auto' }}>
              <List
                dataSource={taiSanMoi}
                locale={{ emptyText: 'Chưa có tài sản' }}
                renderItem={(item) => (
                  <List.Item
                    style={listItemStyle}
                    extra={
                      !isMobile && (
                        <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                          {item.createdAt ? dayjs(item.createdAt).format('DD/MM/YYYY') : ''}
                        </span>
                      )
                    }
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          shape="square"
                          icon={<InboxOutlined />}
                          style={{ backgroundColor: '#e6f7ff', color: '#1890ff' }}
                        />
                      }
                      title={
                        <span style={{ ...ellipsisText, fontSize: 14 }}>
                          <strong>{item.mataisan}</strong> · {item.tentaisan}
                        </span>
                      }
                      description={
                        <span style={ellipsisText}>
                          {`${item.tenloai || '-'} · ${item.tentrangthai || '-'}`}
                        </span>
                      }
                    />
                    {isMobile && (
                      <div style={{ fontSize: 12, color: '#8c8c8c', flexShrink: 0 }}>
                        {item.createdAt ? dayjs(item.createdAt).format('DD/MM/YYYY') : ''}
                      </div>
                    )}
                  </List.Item>
                )}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12} xl={8}>
          <Card
            title={`Phiếu bảo trì gần đây (${phieuBaoTriGanDay.length})`}
            styles={cardBody}
            hoverable={isAdmin}
            extra={isAdmin && !isMobile && <span style={{ fontSize: 13, color: '#1890ff' }}>Xem tất cả →</span>}
            onClick={isAdmin ? () => navigate('/admin/bao-tri') : undefined}
          >
            <div style={{ maxHeight: LIST_SCROLL_HEIGHT, overflowY: 'auto' }}>
              <List
                dataSource={phieuBaoTriGanDay}
                locale={{ emptyText: 'Chưa có phiếu bảo trì' }}
                renderItem={(item) => {
                  const status = BAOTRI_STATUS[item.trangthaixuly] || { text: item.trangthaixuly, color: 'default' }
                  return (
                    <List.Item
                      style={listItemStyle}
                      extra={
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                          <Tag color={status.color} style={{ marginInlineEnd: 0 }}>
                            {status.text}
                          </Tag>
                          {!isMobile && (
                            <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                              {item.ngaybao ? dayjs(item.ngaybao).format('DD/MM/YYYY') : ''}
                            </span>
                          )}
                        </div>
                      }
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            shape="square"
                            icon={<ToolOutlined />}
                            style={{ backgroundColor: '#fff7e6', color: '#fa8c16' }}
                          />
                        }
                        title={
                          <span style={{ ...ellipsisText, fontSize: 14 }}>
                            <strong>BT-{String(item.baotriId).padStart(4, '0')}</strong> · {item.mataisan}
                          </span>
                        }
                        description={
                          <span style={ellipsisText}>
                            {`${item.tentaisan || '-'} · ${item.loaibaotri === 'DINHKY' ? 'Định kỳ' : 'Sửa chữa'}`}
                          </span>
                        }
                      />
                    </List.Item>
                  )
                }}
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} md={24} xl={8}>
          <Card
            title={`Luân chuyển gần đây (${luanChuyenGanDay.length})`}
            styles={cardBody}
            hoverable={isAdmin}
            extra={isAdmin && !isMobile && <span style={{ fontSize: 13, color: '#1890ff' }}>Xem tất cả →</span>}
            onClick={isAdmin ? () => navigate('/luanchuyen') : undefined}
          >
            <div style={{ maxHeight: LIST_SCROLL_HEIGHT, overflowY: 'auto' }}>
              <List
                dataSource={luanChuyenGanDay}
                locale={{ emptyText: 'Chưa có phiếu luân chuyển' }}
                renderItem={(item) => {
                  const type = LUANCHUYEN_TYPE[item.loaiphieu] || { text: item.loaiphieu, color: 'default' }
                  return (
                    <List.Item
                      style={listItemStyle}
                      extra={
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                          <Tag color={type.color} style={{ marginInlineEnd: 0 }}>
                            {type.text}
                          </Tag>
                          {!isMobile && (
                            <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                              {item.ngaythuchien ? dayjs(item.ngaythuchien).format('DD/MM/YYYY') : ''}
                            </span>
                          )}
                        </div>
                      }
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            shape="square"
                            icon={<SwapOutlined />}
                            style={{ backgroundColor: '#f9f0ff', color: '#722ed1' }}
                          />
                        }
                        title={
                          <span style={{ ...ellipsisText, fontSize: 14 }}>
                            <strong>LC-{String(item.luanchuyenId).padStart(4, '0')}</strong> · {item.mataisan}
                          </span>
                        }
                        description={
                          <span style={ellipsisText}>
                            {`${item.benGiao || '-'} → ${item.benNhan || '-'}`}
                          </span>
                        }
                      />
                    </List.Item>
                  )
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AdminDashboard
