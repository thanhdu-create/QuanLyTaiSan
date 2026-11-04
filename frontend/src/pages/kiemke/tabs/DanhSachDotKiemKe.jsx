import { useState, useEffect } from 'react'
import { Card, Button, Table, Tag, Space, Modal, Form, Input, DatePicker, Select, message, Popconfirm, Progress, Grid } from 'antd'
import { PlusOutlined, EyeOutlined, CheckCircleOutlined } from '@ant-design/icons'
import kiemkeApi from '../../../api/kiemkeApi'
import donviApi from '../../../api/donviApi'
import viTriApi from '../../../api/vitriApi'
import { generateAutoCode } from '../../../hooks/useAutoCode'
import ModalTitleWithCode from '../../../components/ModalTitleWithCode'
import PhamViKiemKeCard from '../../../components/PhamViKiemKeCard'
import { TRANG_THAI_DOT_KIEM_KE, TRANG_THAI_DOT_KIEM_KE_LABEL, TRANG_THAI_DOT_KIEM_KE_COLOR } from '../../../utils/constants'
import ChiTietDotKiemKe from '../components/ChiTietDotKiemKe'
import dayjs from 'dayjs'

const { useBreakpoint } = Grid

const DanhSachDotKiemKe = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedDot, setSelectedDot] = useState(null)
  const [donViList, setDonViList] = useState([])
  const [viTriList, setViTriList] = useState([])
  const [filterTrangthai, setFilterTrangthai] = useState(null)
  const [phamViKiemKe, setPhamViKiemKe] = useState('TOAN_TRUONG')
  const [capTruong, setCapTruong] = useState([])
  const [capKhoa, setCapKhoa] = useState([])
  const [capPhongBan, setCapPhongBan] = useState([])
  const [selectedTruong, setSelectedTruong] = useState(null)
  const [selectedKhoa, setSelectedKhoa] = useState(null)
  const [form] = Form.useForm()
  
  const screens = useBreakpoint()
  const isMobile = screens.xs || screens.sm
  const isTablet = screens.md && !screens.lg

  useEffect(() => {
    fetchData()
    fetchDonVi()
    fetchViTri()
  }, [filterTrangthai])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await kiemkeApi.getAllDotKiemKe(filterTrangthai)
      setData(response.data)
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const fetchDonVi = async () => {
    try {
      const response = await donviApi.getAll()
      setDonViList(response.data)
      
      // Helper function để xác định cấp độ của đơn vị
      const getCapDonVi = (donvi) => {
        if (!donvi.donviCha) {
          return 0 // Cấp trường
        }
        
        // Tìm đơn vị cha trong data để kiểm tra ông nội
        const cha = response.data.find(dv => dv.donviId === donvi.donviCha.donviId)
        if (!cha) {
          return 1 // Không tìm thấy cha, giả định là cấp khoa
        }
        
        if (!cha.donviCha) {
          return 1 // Cha không có cha => đây là cấp khoa
        }
        
        return 2 // Cha có cha => đây là cấp phòng ban
      }
      
      // Phân loại đơn vị theo cấp
      const truong = response.data.filter(dv => getCapDonVi(dv) === 0)
      const khoa = response.data.filter(dv => getCapDonVi(dv) === 1)
      const phongban = response.data.filter(dv => getCapDonVi(dv) === 2)
      
      setCapTruong(truong)
      setCapKhoa(khoa)
      setCapPhongBan(phongban)
    } catch (error) {
      message.error('Không thể tải danh sách đơn vị')
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

  const handleAdd = () => {
    form.resetFields()
    form.setFieldsValue({
      ngaybatdau: dayjs()
    })
    setPhamViKiemKe('TOAN_TRUONG')
    setSelectedTruong(null)
    setSelectedKhoa(null)
    setIsModalOpen(true)
  }

  const handleSubmit = async (values) => {
    try {
      let donviId = null
      
      // Xác định donviId dựa trên phạm vi kiểm kê
      if (phamViKiemKe === 'CAP_TRUONG' && values.truongId) {
        donviId = values.truongId
      } else if (phamViKiemKe === 'CAP_KHOA' && values.khoaId) {
        donviId = values.khoaId
      } else if (phamViKiemKe === 'CAP_PHONGBAN' && values.phongbanId) {
        donviId = values.phongbanId
      } else if (phamViKiemKe === 'VITRI' && values.vitriId) {
        // Lấy donviId từ vị trí đã chọn
        const vitri = viTriList.find(vt => vt.vitriId === values.vitriId)
        if (vitri && vitri.donvi) {
          donviId = vitri.donvi.donviId
        }
      }
      
      const payload = {
        tendot: values.tendot,
        donviId: donviId,
        ngaybatdau: values.ngaybatdau.format('YYYY-MM-DD'),
      }

      await kiemkeApi.createDotKiemKe(payload)
      message.success('Tạo đợt kiểm kê thành công')
      setIsModalOpen(false)
      form.resetFields()
      setPhamViKiemKe('TOAN_TRUONG')
      setSelectedTruong(null)
      setSelectedKhoa(null)
      fetchData()
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  const handleViewDetail = (record) => {
    setSelectedDot(record)
    setIsDetailModalOpen(true)
  }

  const handleDongDot = async (id) => {
    try {
      await kiemkeApi.dongDotKiemKe(id)
      message.success('Đóng đợt kiểm kê thành công')
      fetchData()
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể đóng đợt kiểm kê')
    }
  }

  const handleTruongChange = (value) => {
    setSelectedTruong(value)
    setSelectedKhoa(null)
    form.setFieldsValue({
      khoaId: undefined,
      phongbanId: undefined,
    })
  }

  const handleKhoaChange = (value) => {
    setSelectedKhoa(value)
    form.setFieldsValue({
      phongbanId: undefined,
    })
  }

  // Lọc khoa theo trường đã chọn
  const getKhoaByTruong = () => {
    if (!selectedTruong) return []
    return capKhoa.filter(khoa => khoa.donviCha?.donviId === selectedTruong)
  }

  // Lọc phòng ban theo khoa đã chọn
  const getPhongBanByKhoa = () => {
    if (!selectedKhoa) return []
    return capPhongBan.filter(pb => pb.donviCha?.donviId === selectedKhoa)
  }

  // Mobile card view renderer
  const renderMobileCard = (record) => (
    <Card 
      key={record.dotkiemkeId}
      size="small"
      style={{ marginBottom: 12 }}
      title={
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <div style={{ fontWeight: 500, fontSize: 14 }}>{record.tendot}</div>
          <div style={{ fontSize: 12, color: '#888', fontWeight: 'normal' }}>
            {record.tendonvi} • {dayjs(record.ngaybatdau).format('DD/MM/YYYY')}
          </div>
        </Space>
      }
      extra={
        <Tag color={TRANG_THAI_DOT_KIEM_KE_COLOR[record.trangthai]} style={{ margin: 0 }}>
          {TRANG_THAI_DOT_KIEM_KE_LABEL[record.trangthai]}
        </Tag>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {/* Tiến độ */}
        <div>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Tiến độ kiểm kê</div>
          <Progress 
            percent={record.tongTaiSan > 0 ? Math.round((record.daKiem / record.tongTaiSan) * 100) : 0} 
            size="small"
            format={() => `${record.daKiem}/${record.tongTaiSan}`}
          />
        </div>

        {/* Kết quả */}
        <div>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Kết quả</div>
          <Space size={8} wrap>
            <Tag color="success">✓ {record.coMatDungViTri}</Tag>
            <Tag color="warning">⚠ {record.coMatLechViTri}</Tag>
            <Tag color="error">✗ {record.thieu}</Tag>
          </Space>
        </div>

        {/* Actions */}
        <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: 8 }}>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
          {record.trangthai === TRANG_THAI_DOT_KIEM_KE.DANGMO && (
            <Popconfirm
              title="Đóng đợt kiểm kê"
              description="Bạn có chắc chắn muốn đóng đợt kiểm kê này?"
              onConfirm={() => handleDongDot(record.dotkiemkeId)}
              okText="Đóng"
              cancelText="Hủy"
            >
              <Button
                size="small"
                type="primary"
                icon={<CheckCircleOutlined />}
              >
                Đóng đợt
              </Button>
            </Popconfirm>
          )}
        </Space>
      </Space>
    </Card>
  )

  const columns = [
    {
      title: 'Tên đợt kiểm kê',
      dataIndex: 'tendot',
      key: 'tendot',
      width: 250,
    },
    {
      title: 'Đơn vị',
      dataIndex: 'tendonvi',
      key: 'tendonvi',
      width: 150,
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'ngaybatdau',
      key: 'ngaybatdau',
      width: 120,
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangthai',
      key: 'trangthai',
      width: 120,
      render: (trangthai) => (
        <Tag color={TRANG_THAI_DOT_KIEM_KE_COLOR[trangthai]}>
          {TRANG_THAI_DOT_KIEM_KE_LABEL[trangthai]}
        </Tag>
      ),
    },
    {
      title: 'Tiến độ',
      key: 'tiendo',
      width: 200,
      render: (_, record) => {
        const percent = record.tongTaiSan > 0 
          ? Math.round((record.daKiem / record.tongTaiSan) * 100) 
          : 0
        return (
          <div>
            <Progress percent={percent} size="small" />
            <span style={{ fontSize: 12 }}>
              {record.daKiem}/{record.tongTaiSan} tài sản
            </span>
          </div>
        )
      },
    },
    {
      title: 'Kết quả',
      key: 'ketqua',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <span>✓ {record.coMatDungViTri} | ⚠ {record.coMatLechViTri} | ✗ {record.thieu}</span>
        </Space>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
          {record.trangthai === TRANG_THAI_DOT_KIEM_KE.DANGMO && (
            <Popconfirm
              title="Đóng đợt kiểm kê"
              description="Bạn có chắc chắn muốn đóng đợt kiểm kê này?"
              onConfirm={() => handleDongDot(record.dotkiemkeId)}
              okText="Đóng"
              cancelText="Hủy"
            >
              <Button
                type="link"
                size="small"
                icon={<CheckCircleOutlined />}
              >
                Đóng đợt
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <Card
      title="Danh sách đợt kiểm kê"
      extra={
        <Space wrap>
          {!isMobile && (
            <Select
              style={{ width: 150 }}
              placeholder="Lọc trạng thái"
              allowClear
              value={filterTrangthai}
              onChange={setFilterTrangthai}
            >
              <Select.Option value={TRANG_THAI_DOT_KIEM_KE.DANGMO}>
                {TRANG_THAI_DOT_KIEM_KE_LABEL.DANGMO}
              </Select.Option>
              <Select.Option value={TRANG_THAI_DOT_KIEM_KE.DADONG}>
                {TRANG_THAI_DOT_KIEM_KE_LABEL.DADONG}
              </Select.Option>
            </Select>
          )}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size={isMobile ? 'middle' : 'middle'}
          >
            {isMobile ? 'Tạo' : 'Tạo đợt kiểm kê'}
          </Button>
        </Space>
      }
    >
      {/* Mobile filter on top of list */}
      {isMobile && (
        <div style={{ marginBottom: 16 }}>
          <Select
            style={{ width: '100%' }}
            placeholder="Lọc trạng thái"
            allowClear
            value={filterTrangthai}
            onChange={setFilterTrangthai}
          >
            <Select.Option value={TRANG_THAI_DOT_KIEM_KE.DANGMO}>
              {TRANG_THAI_DOT_KIEM_KE_LABEL.DANGMO}
            </Select.Option>
            <Select.Option value={TRANG_THAI_DOT_KIEM_KE.DADONG}>
              {TRANG_THAI_DOT_KIEM_KE_LABEL.DADONG}
            </Select.Option>
          </Select>
        </div>
      )}

      {/* Conditional rendering: Mobile cards vs Desktop table */}
      {isMobile ? (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>Đang tải...</div>
          ) : data.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              Không có dữ liệu
            </div>
          ) : (
            data.map(record => renderMobileCard(record))
          )}
        </div>
      ) : (
        <Table
          columns={isTablet ? columns.filter(col => 
            ['tendot', 'tendonvi', 'trangthai', 'tiendo', 'action'].includes(col.key)
          ) : columns}
          dataSource={data}
          rowKey="dotkiemkeId"
          loading={loading}
          scroll={isTablet ? { x: 800 } : undefined}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đợt kiểm kê`,
          }}
        />
      )}

      <Modal
        title="Tạo đợt kiểm kê mới"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
          setPhamViKiemKe('TOAN_TRUONG')
          setSelectedTruong(null)
          setSelectedKhoa(null)
        }}
        footer={null}
        width={isMobile ? '100%' : isTablet ? '90%' : 700}
        style={isMobile ? { top: 0, maxWidth: '100vw', paddingBottom: 0 } : {}}
        styles={isMobile ? { body: { maxHeight: 'calc(100vh - 110px)', overflowY: 'auto' } } : {}}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="tendot"
            label="Tên đợt kiểm kê"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đợt kiểm kê' },
              { max: 150, message: 'Tên đợt không được quá 150 ký tự' },
            ]}
          >
            <Input placeholder="VD: Kiểm kê Quý 1/2026" />
          </Form.Item>

          <Form.Item label="Phạm vi kiểm kê">
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 1fr 1fr', 
              gap: '10px' 
            }}>
              <PhamViKiemKeCard
                value="TOAN_TRUONG"
                currentValue={phamViKiemKe}
                title="Toàn trường"
                description="Tất cả tài sản"
                onClick={() => {
                  setPhamViKiemKe('TOAN_TRUONG')
                  setSelectedTruong(null)
                  setSelectedKhoa(null)
                  form.setFieldsValue({
                    truongId: undefined,
                    khoaId: undefined,
                    phongbanId: undefined,
                    vitriId: undefined,
                  })
                }}
              />
              
              <PhamViKiemKeCard
                value="CAP_TRUONG"
                currentValue={phamViKiemKe}
                title="Cấp Trường"
                description="Chọn đơn vị trường"
                onClick={() => {
                  setPhamViKiemKe('CAP_TRUONG')
                  setSelectedTruong(null)
                  setSelectedKhoa(null)
                  form.setFieldsValue({
                    truongId: undefined,
                    khoaId: undefined,
                    phongbanId: undefined,
                    vitriId: undefined,
                  })
                }}
              />
              
              <PhamViKiemKeCard
                value="CAP_KHOA"
                currentValue={phamViKiemKe}
                title="Cấp Khoa"
                description="Trường → Khoa"
                onClick={() => {
                  setPhamViKiemKe('CAP_KHOA')
                  setSelectedTruong(null)
                  setSelectedKhoa(null)
                  form.setFieldsValue({
                    truongId: undefined,
                    khoaId: undefined,
                    phongbanId: undefined,
                    vitriId: undefined,
                  })
                }}
              />
              
              <PhamViKiemKeCard
                value="CAP_PHONGBAN"
                currentValue={phamViKiemKe}
                title="Cấp Phòng ban"
                description="Trường → Khoa → PB"
                onClick={() => {
                  setPhamViKiemKe('CAP_PHONGBAN')
                  setSelectedTruong(null)
                  setSelectedKhoa(null)
                  form.setFieldsValue({
                    truongId: undefined,
                    khoaId: undefined,
                    phongbanId: undefined,
                    vitriId: undefined,
                  })
                }}
              />
              
              <PhamViKiemKeCard
                value="VITRI"
                currentValue={phamViKiemKe}
                title="Theo vị trí"
                description="Chọn phòng cụ thể"
                onClick={() => {
                  setPhamViKiemKe('VITRI')
                  setSelectedTruong(null)
                  setSelectedKhoa(null)
                  form.setFieldsValue({
                    truongId: undefined,
                    khoaId: undefined,
                    phongbanId: undefined,
                    vitriId: undefined,
                  })
                }}
              />
            </div>
          </Form.Item>

          {/* Hiển thị select theo phạm vi đã chọn */}
          {phamViKiemKe === 'CAP_TRUONG' && (
            <Form.Item
              name="truongId"
              label="Chọn đơn vị cấp Trường"
              rules={[{ required: true, message: 'Vui lòng chọn đơn vị cấp Trường' }]}
            >
              <Select
                placeholder="Chọn đơn vị cấp Trường"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={capTruong.map(item => ({
                  value: item.donviId,
                  label: `${item.madonvi} - ${item.tendonvi}`,
                }))}
              />
            </Form.Item>
          )}

          {phamViKiemKe === 'CAP_KHOA' && (
            <>
              <Form.Item
                name="truongId"
                label="Bước 1: Chọn Trường"
                rules={[{ required: true, message: 'Vui lòng chọn Trường' }]}
              >
                <Select
                  placeholder="Chọn Trường"
                  showSearch
                  optionFilterProp="children"
                  onChange={handleTruongChange}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={capTruong.map(item => ({
                    value: item.donviId,
                    label: `${item.madonvi} - ${item.tendonvi}`,
                  }))}
                />
              </Form.Item>

              {selectedTruong && (
                <Form.Item
                  name="khoaId"
                  label="Bước 2: Chọn Khoa"
                  rules={[{ required: true, message: 'Vui lòng chọn Khoa' }]}
                >
                  <Select
                    placeholder="Chọn Khoa"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={getKhoaByTruong().map(item => ({
                      value: item.donviId,
                      label: `${item.madonvi} - ${item.tendonvi}`,
                    }))}
                  />
                </Form.Item>
              )}
            </>
          )}

          {phamViKiemKe === 'CAP_PHONGBAN' && (
            <>
              <Form.Item
                name="truongId"
                label="Bước 1: Chọn Trường"
                rules={[{ required: true, message: 'Vui lòng chọn Trường' }]}
              >
                <Select
                  placeholder="Chọn Trường"
                  showSearch
                  optionFilterProp="children"
                  onChange={handleTruongChange}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={capTruong.map(item => ({
                    value: item.donviId,
                    label: `${item.madonvi} - ${item.tendonvi}`,
                  }))}
                />
              </Form.Item>

              {selectedTruong && (
                <Form.Item
                  name="khoaId"
                  label="Bước 2: Chọn Khoa"
                  rules={[{ required: true, message: 'Vui lòng chọn Khoa' }]}
                >
                  <Select
                    placeholder="Chọn Khoa"
                    showSearch
                    optionFilterProp="children"
                    onChange={handleKhoaChange}
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={getKhoaByTruong().map(item => ({
                      value: item.donviId,
                      label: `${item.madonvi} - ${item.tendonvi}`,
                    }))}
                  />
                </Form.Item>
              )}

              {selectedKhoa && (
                <Form.Item
                  name="phongbanId"
                  label="Bước 3: Chọn Phòng ban"
                  rules={[{ required: true, message: 'Vui lòng chọn Phòng ban' }]}
                >
                  <Select
                    placeholder="Chọn Phòng ban"
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={getPhongBanByKhoa().map(item => ({
                      value: item.donviId,
                      label: `${item.madonvi} - ${item.tendonvi}`,
                    }))}
                  />
                </Form.Item>
              )}
            </>
          )}

          {phamViKiemKe === 'VITRI' && (
            <Form.Item
              name="vitriId"
              label="Chọn vị trí (Phòng)"
              rules={[{ required: true, message: 'Vui lòng chọn vị trí' }]}
            >
              <Select
                placeholder="Chọn vị trí phòng cụ thể"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={viTriList.map(item => ({
                  value: item.vitriId,
                  label: `${item.tenvitri}${item.donvi ? ` - ${item.donvi.tendonvi}` : ''}`,
                }))}
              />
            </Form.Item>
          )}

          <Form.Item
            name="ngaybatdau"
            label="Ngày bắt đầu"
            rules={[
              { required: true, message: 'Vui lòng chọn ngày bắt đầu' },
            ]}
          >
            <DatePicker 
              format="DD/MM/YYYY" 
              style={{ width: '100%' }}
              placeholder="Chọn ngày bắt đầu"
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setIsModalOpen(false)
                form.resetFields()
                setPhamViKiemKe('TOAN_TRUONG')
                setSelectedTruong(null)
                setSelectedKhoa(null)
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Tạo đợt kiểm kê
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {selectedDot && (
        <ChiTietDotKiemKe
          visible={isDetailModalOpen}
          dotKiemKe={selectedDot}
          onClose={() => {
            setIsDetailModalOpen(false)
            setSelectedDot(null)
            fetchData()
          }}
        />
      )}
    </Card>
  )
}

export default DanhSachDotKiemKe
