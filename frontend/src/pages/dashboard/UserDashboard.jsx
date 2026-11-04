import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Statistic, Spin, Grid, message, List, Tag, Avatar, Button, Progress } from 'antd'
import {
  IdcardOutlined,
  ApartmentOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  ToolOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  FileSearchOutlined,
  SwapOutlined,
  QrcodeOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import thongkeApi from '../../api/thongkeApi'
import { useAuth } from '../../hooks/useAuth'

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

// Moi danh sach chi hien thi 5 dong dau, cuon de xem tiep
const LIST_ITEM_HEIGHT = 64
const LIST_VISIBLE_ITEMS = 5
const LIST_SCROLL_HEIGHT = LIST_ITEM_HEIGHT * LIST_VISIBLE_ITEMS + LIST_VISIBLE_ITEMS
const listItemStyle = { height: LIST_ITEM_HEIGHT, padding: '8px 0', boxSizing: 'border-box', overflow: 'hidden' }
const ellipsisText = { display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }

// Dòng đợt kiểm kê có thêm thanh tiến độ nên cao hơn
const DOT_ITEM_HEIGHT = 80
const DOT_SCROLL_HEIGHT = DOT_ITEM_HEIGHT * LIST_VISIBLE_ITEMS + LIST_VISIBLE_ITEMS
const dotItemStyle = { height: DOT_ITEM_HEIGHT, padding: '8px 0', boxSizing: 'border-box', overflow: 'hidden' }

const UserDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const screens = Grid.useBreakpoint()
  const isMobile = screens.md === false
  const isTablet = screens.md === true && screens.lg === false
  const isNarrow = isMobile || isTablet
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await thongkeApi.getMyDashboard()
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

  const cardBody = { body: { padding: isMobile ? 12 : isTablet ? 16 : 24 } }
  const statFontSize = isMobile ? 18 : isTablet ? 22 : 24
  const statTitleSize = isMobile ? 12 : 13

  const cards = [
    {
      key: 'taiSanCuaToi',
      title: 'Tài sản tôi đang dùng',
      value: stats?.taiSanCuaToi || 0,
      icon: <IdcardOutlined />,
      color: '#1890ff',
    },
    stats?.coDonVi && {
      key: 'taiSanDonVi',
      title: 'Tài sản của đơn vị',
      value: stats?.taiSanDonVi || 0,
      icon: <ApartmentOutlined />,
      color: '#722ed1',
    },
    {
      key: 'dangSuDung',
      title: 'Đang sử dụng',
      value: stats?.dangSuDung || 0,
      icon: <CheckCircleOutlined />,
      color: '#3f8600',
    },
    {
      key: 'dangBaoTri',
      title: 'Đang bảo trì',
      value: stats?.dangBaoTri || 0,
      icon: <ToolOutlined />,
      color: '#fa8c16',
    },
    {
      key: 'huHong',
      title: 'Hư hỏng',
      value: stats?.huHong || 0,
      icon: <CloseCircleOutlined />,
      color: '#cf1322',
    },
    {
      key: 'conTrong',
      title: 'Còn trống',
      value: stats?.conTrong || 0,
      icon: <InboxOutlined />,
      color: '#13c2c2',
    },
  ].filter(Boolean)

  const alerts = [
    stats?.taiSanCuaToiDangBaoTri > 0 && {
      key: 'taiSanCuaToiBaoTri',
      title: 'Tài sản của tôi đang bảo trì',
      value: stats.taiSanCuaToiDangBaoTri,
      icon: <ToolOutlined />,
      color: '#fa8c16',
      to: '/taisan',
    },
    stats?.phieuBaoTriChoXuLy > 0 && {
      key: 'choXuLy',
      title: 'Phiếu bảo trì chờ xử lý',
      value: stats.phieuBaoTriChoXuLy,
      icon: <ClockCircleOutlined />,
      color: '#fa8c16',
      to: '/admin/bao-tri',
    },
    stats?.baoTriQuaHan > 0 && {
      key: 'quaHan',
      title: 'Bảo trì quá hạn',
      value: stats.baoTriQuaHan,
      icon: <WarningOutlined />,
      color: '#cf1322',
      to: '/admin/bao-tri',
    },
    stats?.dotKiemKeDangMo?.length > 0 && {
      key: 'kiemKe',
      title: 'Đợt kiểm kê đang mở',
      value: stats.dotKiemKeDangMo.length,
      icon: <FileSearchOutlined />,
      color: '#2f54eb',
      to: '/kiemke',
    },
  ].filter(Boolean)

  const taiSanList = stats?.danhSachTaiSan || []
  const taiSanTitle =
    stats?.phamViDanhSach === 'CA_NHAN'
      ? 'Tài sản của tôi'
      : stats?.phamViDanhSach === 'DON_VI'
        ? 'Tài sản của đơn vị'
        : 'Tài sản'
  const phieuBaoTriGanDay = stats?.phieuBaoTriGanDay
  const luanChuyenGanDay = stats?.luanChuyenGanDay
  const dotKiemKeDangMo = stats?.dotKiemKeDangMo

  return (
    <div>
      <Card styles={cardBody} style={{ marginBottom: 16 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: isMobile ? 18 : isTablet ? 20 : 22, fontWeight: 600 }}>
              Xin chào, {user?.hoten || user?.tendangnhap}
            </div>
            <div style={{ fontSize: 13, color: '#8c8c8c', marginTop: 4 }}>
              {stats?.coDonVi ? `Đơn vị: ${stats.tenDonVi}` : 'Bạn chưa được gán vào đơn vị nào'}
            </div>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<QrcodeOutlined />}
            block={isMobile}
            onClick={() => navigate('/quetqr')}
          >
            Quét mã QR
          </Button>
        </div>
      </Card>

      <Row gutter={[12, 12]}>
        {cards.map((item) => (
          <Col key={item.key} xs={12} sm={8} md={8} xl={4}>
            <Card styles={cardBody} style={{ height: '100%' }}>
              <Statistic
                title={<span style={{ fontSize: statTitleSize }}>{item.title}</span>}
                value={item.value}
                prefix={item.icon}
                valueStyle={{ color: item.color, fontSize: statFontSize }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {alerts.length > 0 && (
        <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
          {alerts.map((item) => (
            <Col key={item.key} xs={24} sm={12} md={12} xl={6}>
              <Card
                styles={cardBody}
                hoverable
                onClick={() => navigate(item.to)}
                style={{ cursor: 'pointer', height: '100%' }}
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
      )}

      <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12} xl={8}>
          <Card
            title={`${taiSanTitle} (${taiSanList.length})`}
            styles={cardBody}
            hoverable
            extra={!isNarrow && <span style={{ fontSize: 13, color: '#1890ff' }}>Xem tất cả →</span>}
            onClick={() => navigate('/taisan')}
          >
            <div style={{ maxHeight: LIST_SCROLL_HEIGHT, overflowY: 'auto' }}>
              <List
                dataSource={taiSanList}
                locale={{ emptyText: 'Chưa có tài sản' }}
                renderItem={(item) => (
                  <List.Item
                    style={{ ...listItemStyle, cursor: 'pointer' }}
                    onClick={(event) => {
                      event.stopPropagation()
                      navigate(`/assets/${item.taisanId}`)
                    }}
                    extra={
                      !isMobile && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                          <Tag color="blue" style={{ marginInlineEnd: 0 }}>
                            {item.tentrangthai || '-'}
                          </Tag>
                          {!isTablet && item.tenvitri && (
                            <span style={{ fontSize: 12, color: '#8c8c8c' }}>{item.tenvitri}</span>
                          )}
                        </div>
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
                          {`${item.tenloai || '-'} · ${item.tenDonVi || '-'}`}
                        </span>
                      }
                    />
                    {isMobile && (
                      <Tag color="blue" style={{ marginInlineEnd: 0, flexShrink: 0 }}>
                        {item.tentrangthai || '-'}
                      </Tag>
                    )}
                  </List.Item>
                )}
              />
            </div>
          </Card>
        </Col>

        {luanChuyenGanDay !== undefined && (
          <Col xs={24} lg={12} xl={8}>
            <Card
              title={`Luân chuyển gần đây (${luanChuyenGanDay.length})`}
              styles={cardBody}
              hoverable
              extra={!isNarrow && <span style={{ fontSize: 13, color: '#1890ff' }}>Xem tất cả →</span>}
              onClick={() => navigate('/luanchuyen')}
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
                            {!isNarrow && (
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
                            <span style={ellipsisText}>{`${item.benGiao || '-'} → ${item.benNhan || '-'}`}</span>
                          }
                        />
                      </List.Item>
                    )
                  }}
                />
              </div>
            </Card>
          </Col>
        )}

        {phieuBaoTriGanDay !== undefined && (
          <Col xs={24} lg={12} xl={8}>
            <Card
              title={`Phiếu bảo trì gần đây (${phieuBaoTriGanDay.length})`}
              styles={cardBody}
              hoverable
              extra={!isNarrow && <span style={{ fontSize: 13, color: '#1890ff' }}>Xem tất cả →</span>}
              onClick={() => navigate('/admin/bao-tri')}
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
                            {!isNarrow && (
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
        )}

        {dotKiemKeDangMo !== undefined && (
          <Col xs={24} lg={12} xl={8}>
            <Card
              title={`Đợt kiểm kê đang mở (${dotKiemKeDangMo.length})`}
              styles={cardBody}
              hoverable
              extra={!isNarrow && <span style={{ fontSize: 13, color: '#1890ff' }}>Xem tất cả →</span>}
              onClick={() => navigate('/kiemke')}
            >
              <div style={{ maxHeight: DOT_SCROLL_HEIGHT, overflowY: 'auto' }}>
                <List
                  dataSource={dotKiemKeDangMo}
                  locale={{ emptyText: 'Không có đợt kiểm kê nào đang mở' }}
                  renderItem={(item) => {
                    const tong = item.tongTaiSan || 0
                    const daKiem = item.daKiem || 0
                    const percent = tong > 0 ? Math.round((daKiem * 100) / tong) : 0
                    return (
                      <List.Item style={dotItemStyle}>
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              shape="square"
                              icon={<FileSearchOutlined />}
                              style={{ backgroundColor: '#f0f5ff', color: '#2f54eb' }}
                            />
                          }
                          title={
                            <span style={{ ...ellipsisText, fontSize: 14 }}>
                              <strong>{item.tendot}</strong>
                            </span>
                          }
                          description={
                            <div>
                              <div style={{ ...ellipsisText }}>{`${item.tendonvi || 'Toàn trường'} · ${item.ngaybatdau ? dayjs(item.ngaybatdau).format('DD/MM/YYYY') : ''}`}</div>
                              <Progress
                                percent={percent}
                                size="small"
                                format={() => `${daKiem}/${tong}`}
                                style={{ margin: 0 }}
                              />
                            </div>
                          }
                        />
                      </List.Item>
                    )
                  }}
                />
              </div>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  )
}

export default UserDashboard
