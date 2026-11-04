import { useState, useEffect } from 'react'
import { Card, Select, Button, Result, Space, Tag, message, Radio, Grid } from 'antd'
import { QrcodeOutlined, CheckCircleOutlined, CloseCircleOutlined, WarningOutlined } from '@ant-design/icons'
import kiemkeApi from '../../../api/kiemkeApi'
import viTriApi from '../../../api/vitriApi'
import taisanApi from '../../../api/taisanApi'
import QrScanner from '../../../components/QrScanner'
import { KET_QUA_KIEM_KE, KET_QUA_KIEM_KE_LABEL, TRANG_THAI_DOT_KIEM_KE } from '../../../utils/constants'

const { useBreakpoint } = Grid

const QuetKiemKe = () => {
  const [dotKiemKeList, setDotKiemKeList] = useState([])
  const [selectedDot, setSelectedDot] = useState(null)
  const [viTriList, setViTriList] = useState([])
  const [scannedTaiSan, setScannedTaiSan] = useState(null)
  const [ketqua, setKetqua] = useState(null)
  const [vitrithucteId, setVitrithucteId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)

  const screens = useBreakpoint()
  const isMobile = screens.xs || screens.sm

  useEffect(() => {
    fetchDotKiemKe()
    fetchViTri()
  }, [])

  const fetchDotKiemKe = async () => {
    try {
      const response = await kiemkeApi.getAllDotKiemKe(TRANG_THAI_DOT_KIEM_KE.DANGMO)
      setDotKiemKeList(response.data)
    } catch (error) {
      message.error('Không thể tải danh sách đợt kiểm kê')
    }
  }

  const fetchViTri = async () => {
    try {
      const response = await viTriApi.getAll()
      setViTriList(response.data)
    } catch (error) {
      message.error('Không thể tải danh sách vị trí')
    }
  }

  const handleScan = async (mataisan) => {
    if (!selectedDot) {
      message.warning('Vui lòng chọn đợt kiểm kê trước')
      return
    }

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
      setLoading(true)
      const payload = {
        dotkiemkeId: selectedDot.dotkiemkeId,
        taisanId: scannedTaiSan.taisanId,
        ketqua: ketqua,
        vitrithucteId: ketqua === KET_QUA_KIEM_KE.LECHVITRI ? vitrithucteId : null,
      }

      await kiemkeApi.kiemTraTaiSan(payload)
      message.success('Lưu kết quả kiểm tra thành công')
      
      // Reset
      setScannedTaiSan(null)
      setKetqua(null)
      setVitrithucteId(null)
      setIsScanning(true)
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setScannedTaiSan(null)
    setKetqua(null)
    setVitrithucteId(null)
    setIsScanning(true)
  }

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <label style={{ marginBottom: 8, display: 'block', fontWeight: 500 }}>
              Chọn đợt kiểm kê:
            </label>
            <Select
              style={{ width: '100%' }}
              placeholder="Chọn đợt kiểm kê đang mở"
              value={selectedDot?.dotkiemkeId}
              onChange={(value) => {
                const dot = dotKiemKeList.find(d => d.dotkiemkeId === value)
                setSelectedDot(dot)
                setScannedTaiSan(null)
                setKetqua(null)
              }}
            >
              {dotKiemKeList.map(dot => (
                <Select.Option key={dot.dotkiemkeId} value={dot.dotkiemkeId}>
                  {dot.tendot} - {dot.tendonvi} ({dot.daKiem}/{dot.tongTaiSan})
                </Select.Option>
              ))}
            </Select>
          </div>

          {selectedDot && (
            <Card type="inner" size="small">
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ display: isMobile ? 'block' : 'flex', gap: isMobile ? 4 : 16 }}>
                  <div><strong>Đợt:</strong> {selectedDot.tendot}</div>
                  <div><strong>Đơn vị:</strong> {selectedDot.tendonvi}</div>
                </div>
                <div><strong>Tiến độ:</strong> {selectedDot.daKiem}/{selectedDot.tongTaiSan} tài sản</div>
              </Space>
            </Card>
          )}
        </Space>
      </Card>

      {selectedDot && !scannedTaiSan && (
        <Card>
          <div style={{ textAlign: 'center', padding: isMobile ? '20px 10px' : '40px 20px' }}>
            {!isScanning ? (
              <>
                <QrcodeOutlined style={{ fontSize: isMobile ? 48 : 64, color: '#1890ff', marginBottom: 16 }} />
                <h3 style={{ fontSize: isMobile ? 18 : 24 }}>Sẵn sàng quét mã QR</h3>
                <p style={{ fontSize: isMobile ? 14 : 16 }}>Nhấn nút bên dưới để bắt đầu quét</p>
                <Button 
                  type="primary" 
                  size={isMobile ? 'large' : 'large'}
                  icon={<QrcodeOutlined />}
                  onClick={() => setIsScanning(true)}
                  style={isMobile ? { width: '100%', height: 48, fontSize: 16 } : {}}
                >
                  Bắt đầu quét
                </Button>
              </>
            ) : (
              <div style={isMobile ? {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#000',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              } : {}}>
                <QrScanner
                  onScan={handleScan}
                  onError={(error) => message.error('Lỗi camera: ' + error)}
                />
                <Button 
                  size={isMobile ? 'large' : 'middle'}
                  style={isMobile ? { 
                    marginTop: 16, 
                    width: '90%', 
                    maxWidth: 300,
                    height: 48,
                    fontSize: 16
                  } : { marginTop: 16 }}
                  onClick={() => setIsScanning(false)}
                >
                  Dừng quét
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {scannedTaiSan && (
        <Card title="Thông tin tài sản">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card type="inner">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div><strong>Mã tài sản:</strong> {scannedTaiSan.mataisan}</div>
                <div><strong>Tên tài sản:</strong> {scannedTaiSan.tentaisan}</div>
                <div><strong>Loại:</strong> {scannedTaiSan.tenloai}</div>
                <div><strong>Vị trí đăng ký:</strong> {scannedTaiSan.tenvitri || 'Chưa có'}</div>
                <div><strong>Đơn vị:</strong> {scannedTaiSan.tendonvi || 'Chưa có'}</div>
              </Space>
            </Card>

            <div>
              <label style={{ marginBottom: 8, display: 'block', fontWeight: 500, fontSize: isMobile ? 16 : 14 }}>
                Kết quả kiểm tra: <span style={{ color: 'red' }}>*</span>
              </label>
              <Radio.Group 
                value={ketqua} 
                onChange={(e) => setKetqua(e.target.value)}
                style={{ width: '100%' }}
                size={isMobile ? 'large' : 'middle'}
              >
                <Space direction="vertical" style={{ width: '100%' }} size={isMobile ? 'large' : 'middle'}>
                  <Radio 
                    value={KET_QUA_KIEM_KE.CO}
                    style={isMobile ? { 
                      padding: '12px', 
                      border: '1px solid #d9d9d9', 
                      borderRadius: 6,
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center'
                    } : {}}
                  >
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: isMobile ? 18 : 14 }} /> {KET_QUA_KIEM_KE_LABEL.CO}
                  </Radio>
                  <Radio 
                    value={KET_QUA_KIEM_KE.LECHVITRI}
                    style={isMobile ? { 
                      padding: '12px', 
                      border: '1px solid #d9d9d9', 
                      borderRadius: 6,
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center'
                    } : {}}
                  >
                    <WarningOutlined style={{ color: '#faad14', fontSize: isMobile ? 18 : 14 }} /> {KET_QUA_KIEM_KE_LABEL.LECHVITRI}
                  </Radio>
                  <Radio 
                    value={KET_QUA_KIEM_KE.THIEU}
                    style={isMobile ? { 
                      padding: '12px', 
                      border: '1px solid #d9d9d9', 
                      borderRadius: 6,
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center'
                    } : {}}
                  >
                    <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: isMobile ? 18 : 14 }} /> {KET_QUA_KIEM_KE_LABEL.THIEU}
                  </Radio>
                </Space>
              </Radio.Group>
            </div>

            {ketqua === KET_QUA_KIEM_KE.LECHVITRI && (
              <div>
                <label style={{ marginBottom: 8, display: 'block', fontWeight: 500, fontSize: isMobile ? 16 : 14 }}>
                  Vị trí thực tế: <span style={{ color: 'red' }}>*</span>
                </label>
                <Select
                  style={{ width: '100%' }}
                  size={isMobile ? 'large' : 'middle'}
                  placeholder="Chọn vị trí thực tế tìm thấy"
                  value={vitrithucteId}
                  onChange={setVitrithucteId}
                  showSearch
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

            <Space style={{ width: '100%', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Button 
                onClick={handleReset}
                size={isMobile ? 'large' : 'middle'}
                style={isMobile ? { flex: 1, minWidth: 120, height: 48 } : {}}
              >
                Quét lại
              </Button>
              <Button 
                type="primary" 
                loading={loading}
                onClick={handleSubmitKiemTra}
                size={isMobile ? 'large' : 'middle'}
                style={isMobile ? { flex: 1, minWidth: 120, height: 48 } : {}}
              >
                Lưu kết quả
              </Button>
            </Space>
          </Space>
        </Card>
      )}
    </div>
  )
}

export default QuetKiemKe
