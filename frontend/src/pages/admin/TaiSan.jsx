import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Card,
  Select,
  DatePicker,
  InputNumber,
  Tag,
  Dropdown,
  Grid,
  Empty,
  Pagination,
  Spin,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, QrcodeOutlined, DownloadOutlined, EllipsisOutlined } from '@ant-design/icons'
import taiSanApi from '../../api/taisanApi'
import loaiTaiSanApi from '../../api/loaiTaiSanApi'
import donViApi from '../../api/donviApi'
import viTriApi from '../../api/vitriApi'
import trangThaiApi from '../../api/trangthaiApi'
import QRCodeModal from '../../components/QRCodeModal'
import dayjs from 'dayjs'

const { TextArea } = Input

const TaiSan = () => {
  const [data, setData] = useState([])
  const [loaiTaiSanList, setLoaiTaiSanList] = useState([])
  const [donViList, setDonViList] = useState([])
  const [viTriList, setViTriList] = useState([])
  const [allViTriList, setAllViTriList] = useState([])
  const [trangThaiList, setTrangThaiList] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)
  const [selectedTaiSan, setSelectedTaiSan] = useState(null)
  const [form] = Form.useForm()

  const screens = Grid.useBreakpoint()
  // Phone: dưới breakpoint md (768px); tablet/desktop dùng bảng
  const isMobile = screens.md === false
  const [mobilePage, setMobilePage] = useState(1)
  const MOBILE_PAGE_SIZE = 10
  // Tổng số trang an toàn khi dữ liệu co lại sau khi tìm kiếm
  const mobileTotalPages = Math.max(1, Math.ceil(data.length / MOBILE_PAGE_SIZE))
  const safeMobilePage = Math.min(mobilePage, mobileTotalPages)
  const mobileData = data.slice((safeMobilePage - 1) * MOBILE_PAGE_SIZE, safeMobilePage * MOBILE_PAGE_SIZE)

  useEffect(() => {
    fetchData()
    fetchLoaiTaiSan()
    fetchDonVi()
    fetchViTri()
    fetchTrangThai()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await taiSanApi.getAll()
      setData(response.data)
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const fetchLoaiTaiSan = async () => {
    try {
      const response = await loaiTaiSanApi.getAll()
      setLoaiTaiSanList(response.data)
    } catch (error) {
      console.error('Không thể tải danh sách loại tài sản:', error)
    }
  }

  const fetchDonVi = async () => {
    try {
      const response = await donViApi.getAll()
      setDonViList(response.data)
    } catch (error) {
      console.error('Không thể tải danh sách đơn vị:', error)
    }
  }

  const fetchViTri = async () => {
    try {
      const response = await viTriApi.getAll()
      setAllViTriList(response.data)
      setViTriList(response.data)
    } catch (error) {
      console.error('Không thể tải danh sách vị trí:', error)
    }
  }

  const fetchTrangThai = async () => {
    try {
      const response = await trangThaiApi.getAll()
      setTrangThaiList(response.data)
    } catch (error) {
      console.error('Không thể tải danh sách trạng thái:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      fetchData()
      return
    }

    try {
      setLoading(true)
      const response = await taiSanApi.search(searchKeyword)
      setData(response.data)
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể tìm kiếm')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    
    // Generate auto asset code
    const nextCode = generateAssetCode()
    
    // Set default values
    form.setFieldsValue({
      mataisan: nextCode,
      ngaymua: dayjs(),
      giatri: 0,
      thoigianSudung: 5,
      tileThanhLy: 10,
      trangthaitaisanId: 1, // Default: Available
    })
    setIsModalOpen(true)
  }

  const generateAssetCode = () => {
    if (data.length === 0) {
      return 'TS-0001'
    }
    
    // Find the highest number from existing asset codes
    const numbers = data
      .map(item => {
        const match = item.mataisan.match(/TS-(\d+)/)
        return match ? parseInt(match[1]) : 0
      })
      .filter(num => num > 0)
    
    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0
    const nextNumber = maxNumber + 1
    
    return `TS-${String(nextNumber).padStart(4, '0')}`
  }

  const handleEdit = async (record) => {
    setEditingId(record.taisanId)
    form.setFieldsValue({
      mataisan: record.mataisan,
      tentaisan: record.tentaisan,
      loaitaisanId: record.loaitaisanId,
      thongsokythuat: record.thongsokythuat,
      ngaymua: record.ngaymua ? dayjs(record.ngaymua) : null,
      giatri: record.giatri,
      thoigianSudung: record.thoigianSudung || 5,
      tileThanhLy: record.tileThanhLy || 10,
      donviId: record.donviId,
      vitriId: record.vitriId,
      trangthaitaisanId: record.trangthaitaisanId,
      nguoisudungId: record.nguoisudungId,
    })
    
    // Filter vi tri by don vi
    if (record.donviId) {
      const filtered = allViTriList.filter(vt => vt.donvi?.donviId === record.donviId)
      setViTriList(filtered)
    }
    
    setIsModalOpen(true)
  }

  const handleDonViChange = (donviId) => {
    form.setFieldValue('vitriId', null)
    if (donviId) {
      const filtered = allViTriList.filter(vt => vt.donvi?.donviId === donviId)
      setViTriList(filtered)
    } else {
      setViTriList(allViTriList)
    }
  }

  const handleDelete = async (id) => {
    try {
      await taiSanApi.delete(id)
      message.success('Xóa tài sản thành công')
      fetchData()
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể xóa tài sản')
    }
  }

  const handleViewQR = (record) => {
    if (!record.qrCode) {
      message.warning('Mã QR chưa được tạo cho tài sản này')
      console.log('Record data:', record)
      return
    }
    setSelectedTaiSan(record)
    setIsQRModalOpen(true)
  }

  const handleDownloadQR = (record) => {
    if (!record.qrCode) {
      message.warning('Mã QR chưa được tạo cho tài sản này')
      console.log('Record data:', record)
      return
    }
    
    const link = document.createElement('a')
    link.href = record.qrCode
    link.download = `QR_${record.mataisan}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    message.success('Đã tải xuống mã QR')
  }

  const handleSubmit = async (values) => {
    try {
      const submitData = {
        ...values,
        ngaymua: values.ngaymua.format('YYYY-MM-DD'),
      }
      
      // Remove donviId before sending to backend
      delete submitData.donviId

      if (editingId) {
        await taiSanApi.update(editingId, submitData)
        message.success('Cập nhật tài sản thành công')
      } else {
        await taiSanApi.create(submitData)
        message.success('Thêm tài sản thành công')
      }
      setIsModalOpen(false)
      form.resetFields()
      fetchData()
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0)

  const renderTrangThaiTag = (text) => {
    let color = 'default'
    if (text === 'Đang sử dụng') color = 'green'
    else if (text === 'Sẵn sàng') color = 'blue'
    else if (text === 'Bảo trì') color = 'orange'
    else if (text === 'Hỏng') color = 'red'
    return <Tag color={color}>{text}</Tag>
  }

  const renderKhauHaoTag = (value) => {
    const percent = parseFloat(value || 0)
    let color = 'success'
    if (percent >= 80) color = 'error'
    else if (percent >= 50) color = 'warning'
    return <Tag color={color}>{percent.toFixed(1)}%</Tag>
  }

  const handleConfirmDelete = (record) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa tài sản này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => handleDelete(record.taisanId),
    })
  }

  const actionMenuItems = (record) => [
    {
      key: 'view-qr',
      icon: <QrcodeOutlined />,
      label: 'Xem mã QR',
      onClick: () => handleViewQR(record),
    },
    {
      key: 'download-qr',
      icon: <DownloadOutlined />,
      label: 'Tải mã QR',
      onClick: () => handleDownloadQR(record),
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Sửa',
      onClick: () => handleEdit(record),
    },
    { type: 'divider' },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Xóa',
      danger: true,
      onClick: () => handleConfirmDelete(record),
    },
  ]

  const columns = [
    {
      title: 'Mã tài sản',
      dataIndex: 'mataisan',
      key: 'mataisan',
      width: 120,
      fixed: 'left',
    },
    {
      title: 'Tên tài sản',
      dataIndex: 'tentaisan',
      key: 'tentaisan',
      width: 200,
    },
    {
      title: 'Loại tài sản',
      dataIndex: 'tenloai',
      key: 'tenloai',
      width: 150,
    },
    {
      title: 'Giá trị gốc',
      dataIndex: 'giatri',
      key: 'giatri',
      width: 130,
      render: (value) =>
        new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(value),
    },
    {
      title: 'Ngày mua',
      dataIndex: 'ngaymua',
      key: 'ngaymua',
      width: 110,
      render: (date) => (date ? dayjs(date).format('DD/MM/YYYY') : '-'),
    },
    {
      title: 'TG sử dụng',
      key: 'thoigianSudung',
      width: 120,
      responsive: ['lg'],
      render: (_, record) => {
        const daDung = record.soNamDaSuDung ? parseFloat(record.soNamDaSuDung).toFixed(1) : '0.0'
        const duKien = record.thoigianSudung || 5
        return (
          <span title={`Đã dùng ${daDung} năm / Dự kiến ${duKien} năm`}>
            {daDung} / {duKien} năm
          </span>
        )
      },
    },
    {
      title: 'Khấu hao',
      dataIndex: 'tyleKhauHao',
      key: 'tyleKhauHao',
      width: 100,
      render: (value) => renderKhauHaoTag(value),
    },
    {
      title: 'Giá trị còn lại',
      dataIndex: 'giaTriConLai',
      key: 'giaTriConLai',
      width: 130,
      responsive: ['lg'],
      render: (value) =>
        new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(value || 0),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'tentrangthai',
      key: 'tentrangthai',
      width: 120,
      render: (text) => renderTrangThaiTag(text),
    },
    {
      title: 'Vị trí',
      dataIndex: 'tenvitri',
      key: 'tenvitri',
      width: 130,
      render: (text) => text || '-',
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 80,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Dropdown
          menu={{ items: actionMenuItems(record) }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="text" icon={<EllipsisOutlined />} />
        </Dropdown>
      ),
    },
  ]

  return (
    <Card
      title="Quản lý Tài Sản"
      extra={!isMobile && (
        <Space>
          <Input.Search
            placeholder="Tìm theo mã hoặc tên"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 250 }}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm tài sản
          </Button>
        </Space>
      )}
      styles={{ body: { padding: isMobile ? 12 : 24 } }}
    >
      {isMobile && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          <Input.Search
            placeholder="Tìm theo mã hoặc tên"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onSearch={handleSearch}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} block>
            Thêm tài sản
          </Button>
        </div>
      )}

      {isMobile ? (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin />
            </div>
          ) : data.length === 0 ? (
            <Empty description="Không có tài sản" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mobileData.map((record) => (
                <Card key={record.taisanId} size="small">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <Space size={6} wrap>
                        <strong>{record.mataisan}</strong>
                        {renderTrangThaiTag(record.tentrangthai)}
                      </Space>
                      <div style={{ marginTop: 4, fontWeight: 500 }}>{record.tentaisan}</div>
                      <div style={{ fontSize: 12, color: '#888' }}>{record.tenloai}</div>
                    </div>
                    <Dropdown
                      menu={{ items: actionMenuItems(record) }}
                      trigger={['click']}
                      placement="bottomRight"
                    >
                      <Button type="text" icon={<EllipsisOutlined />} />
                    </Dropdown>
                  </div>
                  <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 13 }}>
                    <div>Giá trị: <strong>{formatCurrency(record.giatri)}</strong></div>
                    <div>Còn lại: <strong>{formatCurrency(record.giaTriConLai)}</strong></div>
                    <div>Khấu hao: {renderKhauHaoTag(record.tyleKhauHao)}</div>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Vị trí: {record.tenvitri || '—'}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <Pagination
              size="small"
              simple
              current={safeMobilePage}
              pageSize={MOBILE_PAGE_SIZE}
              total={data.length}
              onChange={setMobilePage}
            />
          </div>
          <div style={{ textAlign: 'center', color: '#888', fontSize: 12, marginTop: 8 }}>
            Tổng {data.length} tài sản
          </div>
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={data}
          rowKey="taisanId"
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} tài sản`,
          }}
        />
      )}

      <Modal
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 24 }}>
            <span>{editingId ? 'Cập nhật tài sản' : 'Thêm tài sản'}</span>
            {!editingId && (
              <span style={{ fontSize: 14, fontWeight: 'normal', color: '#1890ff' }}>
                Mã TS: {form.getFieldValue('mataisan')}
              </span>
            )}
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        width={isMobile ? '100%' : 800}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Hidden field for mataisan */}
          <Form.Item name="mataisan" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            name="tentaisan"
            label="Tên tài sản"
            rules={[
              { required: true, message: 'Vui lòng nhập tên tài sản' },
              { max: 200, message: 'Tên tài sản không được quá 200 ký tự' },
            ]}
          >
            <Input placeholder="Nhập tên tài sản" />
          </Form.Item>

          <Form.Item
            name="loaitaisanId"
            label="Loại tài sản"
            rules={[{ required: true, message: 'Vui lòng chọn loại tài sản' }]}
          >
            <Select placeholder="Chọn loại tài sản">
              {loaiTaiSanList.map((item) => (
                <Select.Option key={item.loaitaisanId} value={item.loaitaisanId}>
                  {item.tenloai}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="donviId" label="Đơn vị">
            <Select placeholder="Chọn đơn vị" allowClear onChange={handleDonViChange}>
              {donViList.map((item) => (
                <Select.Option key={item.donviId} value={item.donviId}>
                  {item.tendonvi}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="vitriId" label="Vị trí">
            <Select placeholder="Chọn vị trí" allowClear>
              {viTriList.map((item) => (
                <Select.Option key={item.vitriId} value={item.vitriId}>
                  {item.tenvitri}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="thongsokythuat" label="Thông số kỹ thuật">
            <TextArea rows={3} placeholder="Nhập thông số kỹ thuật" />
          </Form.Item>

          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 0 : 24 }}>
            <Form.Item
              name="ngaymua"
              label="Ngày mua"
              rules={[{ required: true, message: 'Vui lòng chọn ngày mua' }]}
              style={{ width: isMobile ? '100%' : 200 }}
            >
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="giatri"
              label="Giá trị (VNĐ)"
              rules={[
                { required: true, message: 'Vui lòng nhập giá trị' },
                { type: 'number', min: 0, message: 'Giá trị phải lớn hơn hoặc bằng 0' },
              ]}
              style={{ flex: 1 }}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                placeholder="Nhập giá trị"
              />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 0 : 24 }}>
            <Form.Item
              name="thoigianSudung"
              label="Thời gian sử dụng (năm)"
              rules={[
                { required: true, message: 'Vui lòng nhập thời gian sử dụng' },
                { type: 'number', min: 1, message: 'Thời gian sử dụng phải lớn hơn 0' },
              ]}
              style={{ width: isMobile ? '100%' : 200 }}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={1}
                placeholder="Nhập số năm"
              />
            </Form.Item>

            <Form.Item
              name="tileThanhLy"
              label="Tỷ lệ thanh lý (%)"
              rules={[
                { required: true, message: 'Vui lòng nhập tỷ lệ thanh lý' },
                { type: 'number', min: 0, max: 100, message: 'Tỷ lệ thanh lý từ 0-100%' },
              ]}
              style={{ flex: 1 }}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                max={100}
                placeholder="Nhập tỷ lệ %"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="trangthaitaisanId"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select placeholder="Chọn trạng thái">
              {trangThaiList.map((item) => (
                <Select.Option key={item.trangthaitaisanId} value={item.trangthaitaisanId}>
                  {item.tentrangthai}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setIsModalOpen(false)
                  form.resetFields()
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingId ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {selectedTaiSan && (
        <QRCodeModal
          visible={isQRModalOpen}
          onClose={() => {
            setIsQRModalOpen(false)
            setSelectedTaiSan(null)
          }}
          qrCode={selectedTaiSan.qrCode}
          mataisan={selectedTaiSan.mataisan}
          tentaisan={selectedTaiSan.tentaisan}
        />
      )}
    </Card>
  )
}

export default TaiSan
