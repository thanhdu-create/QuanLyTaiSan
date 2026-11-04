import { useState, useEffect } from 'react'
import { Modal, Table, Tag, Space, Spin, message, Card, Row, Col, Statistic, Progress, Button, Radio, Select, Grid } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, WarningOutlined, QuestionCircleOutlined, FileTextOutlined, QrcodeOutlined } from '@ant-design/icons'
import kiemkeApi from '../../../api/kiemkeApi'
import taisanApi from '../../../api/taisanApi'
import viTriApi from '../../../api/vitriApi'
import QrScanner from '../../../components/QrScanner'
import { KET_QUA_KIEM_KE, KET_QUA_KIEM_KE_LABEL, KET_QUA_KIEM_KE_COLOR } from '../../../utils/constants'
import dayjs from 'dayjs'

const { useBreakpoint } = Grid

const ChiTietDotKiemKe = ({ visible, dotKiemKe, onClose }) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scannedTaiSan, setScannedTaiSan] = useState(null)
  const [ketqua, setKetqua] = useState(null)
  const [vitrithucteId, setVitrithucteId] = useState(null)
  const [viTriList, setViTriList] = useState([])
  const [saving, setSaving] = useState(false)
  
  const screens = useBreakpoint()
  const isMobile = screens.xs || screens.sm
  const isTablet = screens.md && !screens.lg

  useEffect(() => {
    if (visible && dotKiemKe) {
      fetchChiTiet()
      fetchViTri()
    }
  }, [visible, dotKiemKe])

  const fetchChiTiet = async () => {
    try {
      setLoading(true)
      const response = await kiemkeApi.getChiTietKiemKe(dotKiemKe.dotkiemkeId)
      setData(response.data)
    } catch (error) {
      message.error('Không thể tải chi tiết kiểm kê')
    } finally {
      setLoading(false)
    }
  }

  const fetchViTri = async () => {
    try {
      const response = await viTriApi.getAll()
      setViTriList(response.data)
    } catch (error) {
      console.error('Không thể tải danh sách vị trí')
    }
  }

  const handleScan = async (mataisan) => {
    try {
      setLoading(true)
      setIsScanning(false)
      
      // Tìm tài sản theo mã
      const response = await taisanApi.getByMa(mataisan)
      setScannedTaiSan(response)
      setKetqua(null)
      setVitrithucteId(null)
    } catch (error) {
      message.error('Không tìm thấy tài sản với mã: ' + mataisan)
      setScannedTaiSan(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitKiemTra = async () => {
    if (!ketqua) {
      message.warning('Vui lòng chọn kết quả kiểm tra')
      return
    }

    if (ketqua === KET_QUA_KIEM_KE.LECHVITRI && !vitrithucteId) {
      message.warning('Vui lòng chọn vị trí thực tế')
      return
    }

    try {
      setSaving(true)
      const payload = {
        dotkiemkeId: dotKiemKe.dotkiemkeId,
        taisanId: scannedTaiSan.taisanId,
        ketqua: ketqua,
        vitrithucteId: ketqua === KET_QUA_KIEM_KE.LECHVITRI ? vitrithucteId : null,
      }

      await kiemkeApi.kiemTraTaiSan(payload)
      message.success('Lưu kết quả kiểm tra thành công')
      
      // Reset và refresh data
      setScannedTaiSan(null)
      setKetqua(null)
      setVitrithucteId(null)
      setIsScanning(true)
      fetchChiTiet() // Reload danh sách
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setScannedTaiSan(null)
    setKetqua(null)
    setVitrithucteId(null)
    setIsScanning(true)
  }

  const handleCloseScanner = () => {
    setIsScanning(false)
    setScannedTaiSan(null)
    setKetqua(null)
    setVitrithucteId(null)
  }

  // Tính toán thống kê
  const chuaKiem = (dotKiemKe?.tongTaiSan || 0) - (dotKiemKe?.daKiem || 0)
  const tyLeHoanThanh = dotKiemKe?.tongTaiSan > 0 
    ? Math.round((dotKiemKe?.daKiem / dotKiemKe?.tongTaiSan) * 100) 
    : 0
  const tyLeCo = dotKiemKe?.tongTaiSan > 0
    ? Math.round((dotKiemKe?.coMatDungViTri / dotKiemKe?.tongTaiSan) * 100)
    : 0

  // Render mobile card view for table
  const renderMobileCard = (record, index) => (
    <Card 
      key={record.chitietkiemkeId} 
      size="small" 
      style={{ marginBottom: 8 }}
      title={
        <Space>
          <span>#{index + 1}</span>
          <Tag color="blue">{record.mataisan}</Tag>
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <div><strong>Tên:</strong> {record.tentaisan}</div>
        <div><strong>Loại:</strong> {record.tenloai}</div>
        <div>
          <strong>Vị trí:</strong> {record.tenvitri || '-'}
          {record.tendonvi && <div style={{ fontSize: 12, color: '#888' }}>{record.tendonvi}</div>}
        </div>
        <div>
          <strong>Kết quả:</strong>{' '}
          {!record.ketqua ? (
            <Tag icon={<QuestionCircleOutlined />} color="default">Chưa kiểm</Tag>
          ) : (
            <Tag icon={{
              [KET_QUA_KIEM_KE.CO]: <CheckCircleOutlined />,
              [KET_QUA_KIEM_KE.LECHVITRI]: <WarningOutlined />,
              [KET_QUA_KIEM_KE.THIEU]: <CloseCircleOutlined />,
            }[record.ketqua]} color={KET_QUA_KIEM_KE_COLOR[record.ketqua]}>
              {KET_QUA_KIEM_KE_LABEL[record.ketqua]}
            </Tag>
          )}
        </div>
        {record.ketqua === KET_QUA_KIEM_KE.LECHVITRI && (
          <div>
            <strong>Vị trí thực tế:</strong> {record.tenvitrithucte || '-'}
            {record.tendonvithucte && <div style={{ fontSize: 12, color: '#888' }}>{record.tendonvithucte}</div>}
          </div>
        )}
        {record.hotennguoikiem && (
          <div style={{ fontSize: 12, color: '#888' }}>
            Kiểm bởi: {record.hotennguoikiem} - {dayjs(record.thoigiankiem).format('DD/MM/YYYY HH:mm')}
          </div>
        )}
      </Space>
    </Card>
  )

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Mã tài sản',
      dataIndex: 'mataisan',
      key: 'mataisan',
      width: 130,
    },
    {
      title: 'Tên tài sản',
      dataIndex: 'tentaisan',
      key: 'tentaisan',
      width: 200,
    },
    {
      title: 'Loại',
      dataIndex: 'tenloai',
      key: 'tenloai',
      width: 120,
    },
    {
      title: 'Vị trí đăng ký',
      key: 'vitridangky',
      width: 150,
      render: (_, record) => (
        <div>
          <div>{record.tenvitri || '-'}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{record.tendonvi || '-'}</div>
        </div>
      ),
    },
    {
      title: 'Kết quả',
      dataIndex: 'ketqua',
      key: 'ketqua',
      width: 140,
      render: (ketqua) => {
        if (!ketqua) {
          return (
            <Tag icon={<QuestionCircleOutlined />} color="default">
              Chưa kiểm
            </Tag>
          )
        }
        
        const icon = {
          [KET_QUA_KIEM_KE.CO]: <CheckCircleOutlined />,
          [KET_QUA_KIEM_KE.LECHVITRI]: <WarningOutlined />,
          [KET_QUA_KIEM_KE.THIEU]: <CloseCircleOutlined />,
        }[ketqua]
        
        return (
          <Tag icon={icon} color={KET_QUA_KIEM_KE_COLOR[ketqua]}>
            {KET_QUA_KIEM_KE_LABEL[ketqua]}
          </Tag>
        )
      },
      filters: [
        { text: 'Chưa kiểm', value: null },
        { text: KET_QUA_KIEM_KE_LABEL.CO, value: KET_QUA_KIEM_KE.CO },
        { text: KET_QUA_KIEM_KE_LABEL.LECHVITRI, value: KET_QUA_KIEM_KE.LECHVITRI },
        { text: KET_QUA_KIEM_KE_LABEL.THIEU, value: KET_QUA_KIEM_KE.THIEU },
      ],
      onFilter: (value, record) => {
        if (value === null) return !record.ketqua
        return record.ketqua === value
      },
    },
    {
      title: 'Vị trí thực tế',
      key: 'vitrithucte',
      width: 150,
      render: (_, record) => {
        if (record.ketqua !== KET_QUA_KIEM_KE.LECHVITRI) return '-'
        return (
          <div>
            <div>{record.tenvitrithucte || '-'}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{record.tendonvithucte || '-'}</div>
          </div>
        )
      },
    },
    {
      title: 'Người kiểm',
      dataIndex: 'hotennguoikiem',
      key: 'hotennguoikiem',
      width: 130,
      render: (text) => text || '-',
    },
    {
      title: 'Thời gian kiểm',
      dataIndex: 'thoigiankiem',
      key: 'thoigiankiem',
      width: 140,
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-',
    },
  ]

  // Filter columns for tablet
  const tabletColumns = columns.filter(col => 
    !['hotennguoikiem', 'thoigiankiem'].includes(col.key)
  )

  return (
    <Modal
      title={isMobile ? dotKiemKe?.tendot : `Chi tiết: ${dotKiemKe?.tendot}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={isMobile ? '100%' : isTablet ? '95%' : 1400}
      style={isMobile ? { top: 0, maxWidth: '100%', margin: 0, padding: 0 } : { top: 20 }}
      styles={isMobile ? { body: { padding: '12px' } } : undefined}
    >
      <Spin spinning={loading}>
        {/* Thống kê tổng quan - Responsive Grid */}
        <Row gutter={[8, 8]} style={{ marginBottom: isMobile ? 12 : 24 }}>
          <Col xs={12} sm={12} md={6} lg={6}>
            <Card size="small">
              <Statistic
                title="Tổng TS"
                value={dotKiemKe?.tongTaiSan || 0}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff', fontSize: isMobile ? 20 : 24 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6} lg={6}>
            <Card size="small">
              <Statistic
                title="Đã kiểm"
                value={dotKiemKe?.daKiem || 0}
                suffix={`/ ${dotKiemKe?.tongTaiSan || 0}`}
                valueStyle={{ color: '#52c41a', fontSize: isMobile ? 20 : 24 }}
              />
              <Progress 
                percent={tyLeHoanThanh} 
                size="small" 
                style={{ marginTop: 8 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6} lg={6}>
            <Card size="small">
              <Statistic
                title="Chưa kiểm"
                value={chuaKiem}
                valueStyle={{ color: '#d9d9d9', fontSize: isMobile ? 20 : 24 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6} lg={6}>
            <Card size="small">
              <Statistic
                title="Tỷ lệ chính xác"
                value={tyLeCo}
                suffix="%"
                valueStyle={{ 
                  color: tyLeCo >= 95 ? '#52c41a' : tyLeCo >= 80 ? '#faad14' : '#ff4d4f',
                  fontSize: isMobile ? 20 : 24
                }}
              />
              {!isMobile && (
                <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
                  Có đúng vị trí / Tổng số
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Kết quả chi tiết - Vertical on mobile */}
        <Row gutter={[8, 8]} style={{ marginBottom: isMobile ? 12 : 24 }}>
          <Col xs={24} sm={24} md={8}>
            <Card size="small">
              <Space>
                <CheckCircleOutlined style={{ fontSize: isMobile ? 18 : 20, color: '#52c41a' }} />
                <div>
                  <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 500 }}>
                    {dotKiemKe?.coMatDungViTri || 0}
                  </div>
                  <div style={{ fontSize: 12, color: '#888' }}>Có (đúng vị trí)</div>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={12} sm={12} md={8}>
            <Card size="small">
              <Space>
                <WarningOutlined style={{ fontSize: isMobile ? 18 : 20, color: '#faad14' }} />
                <div>
                  <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 500 }}>
                    {dotKiemKe?.coMatLechViTri || 0}
                  </div>
                  <div style={{ fontSize: 12, color: '#888' }}>Lệch vị trí</div>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={12} sm={12} md={8}>
            <Card size="small">
              <Space>
                <CloseCircleOutlined style={{ fontSize: isMobile ? 18 : 20, color: '#ff4d4f' }} />
                <div>
                  <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 500 }}>
                    {dotKiemKe?.thieu || 0}
                  </div>
                  <div style={{ fontSize: 12, color: '#888' }}>Thiếu</div>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Nút quét QR */}
        {dotKiemKe?.trangthai === 'DANGMO' && !isScanning && !scannedTaiSan && (
          <Card style={{ marginBottom: isMobile ? 12 : 16, textAlign: 'center', background: '#f0f5ff' }}>
            <Button 
              type="primary" 
              size={isMobile ? 'middle' : 'large'}
              icon={<QrcodeOutlined />}
              onClick={() => setIsScanning(true)}
              block={isMobile}
            >
              Quét QR để kiểm kê
            </Button>
          </Card>
        )}

        {/* QR Scanner - Full viewport on mobile */}
        {isScanning && !scannedTaiSan && (
          <Card style={{ marginBottom: isMobile ? 12 : 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={isMobile ? { 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                zIndex: 1000, 
                background: '#000',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              } : {}}>
                <QrScanner
                  onScan={handleScan}
                  onError={(error) => message.error('Lỗi camera: ' + error)}
                />
                <Button 
                  style={isMobile ? { 
                    position: 'absolute', 
                    bottom: 20, 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    zIndex: 1001
                  } : { marginTop: 16 }}
                  onClick={handleCloseScanner}
                  size={isMobile ? 'large' : 'middle'}
                >
                  Đóng camera
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Form kiểm tra tài sản - Responsive */}
        {scannedTaiSan && (
          <Card title="Thông tin tài sản" size="small" style={{ marginBottom: isMobile ? 12 : 16 }}>
            <Space direction="vertical" style={{ width: '100%' }} size={isMobile ? 'small' : 'large'}>
              <Card type="inner" size="small">
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <div><strong>Mã:</strong> {scannedTaiSan.mataisan}</div>
                  <div><strong>Tên:</strong> {scannedTaiSan.tentaisan}</div>
                  <div><strong>Loại:</strong> {scannedTaiSan.tenloai}</div>
                  <div><strong>Vị trí:</strong> {scannedTaiSan.tenvitri || 'Chưa có'}</div>
                  <div><strong>Đơn vị:</strong> {scannedTaiSan.tendonvi || 'Chưa có'}</div>
                </Space>
              </Card>

              <div>
                <label style={{ marginBottom: 8, display: 'block', fontWeight: 500 }}>
                  Kết quả: <span style={{ color: 'red' }}>*</span>
                </label>
                <Radio.Group 
                  value={ketqua} 
                  onChange={(e) => setKetqua(e.target.value)}
                  style={{ width: '100%' }}
                  size={isMobile ? 'large' : 'middle'}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Radio value={KET_QUA_KIEM_KE.CO}>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} /> {KET_QUA_KIEM_KE_LABEL.CO}
                    </Radio>
                    <Radio value={KET_QUA_KIEM_KE.LECHVITRI}>
                      <WarningOutlined style={{ color: '#faad14' }} /> {KET_QUA_KIEM_KE_LABEL.LECHVITRI}
                    </Radio>
                    <Radio value={KET_QUA_KIEM_KE.THIEU}>
                      <CloseCircleOutlined style={{ color: '#ff4d4f' }} /> {KET_QUA_KIEM_KE_LABEL.THIEU}
                    </Radio>
                  </Space>
                </Radio.Group>
              </div>

              {ketqua === KET_QUA_KIEM_KE.LECHVITRI && (
                <div>
                  <label style={{ marginBottom: 8, display: 'block', fontWeight: 500 }}>
                    Vị trí thực tế: <span style={{ color: 'red' }}>*</span>
                  </label>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Chọn vị trí thực tế"
                    value={vitrithucteId}
                    onChange={setVitrithucteId}
                    showSearch
                    size={isMobile ? 'large' : 'middle'}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {viTriList.map(vt => (
                      <Select.Option 
                        key={vt.vitriId} 
                        value={vt.vitriId}
                        label={`${vt.tenvitri} - ${vt.donvi?.tendonvi || ''}`}
                      >
                        {vt.tenvitri} - {vt.donvi?.tendonvi || ''}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              )}

              <Space style={{ width: '100%', justifyContent: 'flex-end' }} size="small">
                <Button onClick={handleReset} size={isMobile ? 'large' : 'middle'}>
                  Quét lại
                </Button>
                <Button 
                  type="primary" 
                  loading={saving}
                  onClick={handleSubmitKiemTra}
                  size={isMobile ? 'large' : 'middle'}
                >
                  Lưu kết quả
                </Button>
              </Space>
            </Space>
          </Card>
        )}

        {/* Bảng chi tiết - Card view on mobile, Table on desktop */}
        {isMobile ? (
          <div>
            {data.map((record, index) => renderMobileCard(record, index))}
          </div>
        ) : (
          <Table
            columns={isTablet ? tabletColumns : columns}
            dataSource={data}
            rowKey="chitietkiemkeId"
            pagination={{
              pageSize: 10,
              showSizeChanger: !isMobile,
              showTotal: (total) => `Tổng ${total} tài sản`,
            }}
            scroll={{ x: isTablet ? 900 : 1100 }}
            size={isTablet ? 'small' : 'middle'}
          />
        )}
      </Spin>
    </Modal>
  )
}

export default ChiTietDotKiemKe
