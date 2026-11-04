import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Popconfirm,
  Card,
  Select,
  DatePicker,
  InputNumber,
  Tag,
  Row,
  Col,
  Statistic,
  Radio,
  Checkbox,
  Spin,
  Alert,
  Divider,
  List,
  Pagination,
  Grid,
  Empty,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  QrcodeOutlined,
  ToolOutlined,
} from '@ant-design/icons'
import baoTriApi from '../../api/baoTriApi'
import taiSanApi from '../../api/taiSanApi'
import donViApi from '../../api/donViApi'
import dayjs from 'dayjs'
import QRScannerModal from '../../components/QRScannerModal'

const { TextArea } = Input

const BaoTri = () => {
  const [data, setData] = useState([])
  const [taiSanList, setTaiSanList] = useState([])
  const [donViList, setDonViList] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterTrangThai, setFilterTrangThai] = useState(null)
  const [thongKe, setThongKe] = useState(null)
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false)

  const screens = Grid.useBreakpoint()
  // Phone: dưới breakpoint md (768px); tablet/desktop dùng bảng
  const isMobile = screens.md === false
  const [mobilePage, setMobilePage] = useState(1)
  const MOBILE_PAGE_SIZE = 10
  // Tổng số trang an toàn khi dữ liệu co lại sau khi lọc/tìm kiếm
  const mobileTotalPages = Math.max(1, Math.ceil(data.length / MOBILE_PAGE_SIZE))
  const safeMobilePage = Math.min(mobilePage, mobileTotalPages)
  const mobileData = data.slice((safeMobilePage - 1) * MOBILE_PAGE_SIZE, safeMobilePage * MOBILE_PAGE_SIZE)
  
  // Mode selection states
  const [baoTriMode, setBaoTriMode] = useState('device')
  const [selectedDonVi, setSelectedDonVi] = useState(null)
  const [unitAssetList, setUnitAssetList] = useState([])
  const [selectedAssets, setSelectedAssets] = useState([])
  const [loadingUnitAssets, setLoadingUnitAssets] = useState(false)
  const [assetPage, setAssetPage] = useState(1)
  const pageSize = 50
  
  const [form] = Form.useForm()
  const [updateForm] = Form.useForm()

  useEffect(() => {
    fetchData()
    fetchTaiSan()
    fetchDonVi()
    fetchThongKe()
  }, [filterTrangThai])

  const fetchData = async () => {
    try {
      setLoading(true)
      let response
      if (filterTrangThai) {
        response = await baoTriApi.getByTrangThai(filterTrangThai)
      } else {
        response = await baoTriApi.getAll()
      }
      setData(response.data)
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const fetchTaiSan = async () => {
    try {
      const response = await taiSanApi.getAll()
      setTaiSanList(response.data)
    } catch (error) {
      console.error('Không thể tải danh sách tài sản:', error)
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

  const fetchThongKe = async () => {
    try {
      const response = await baoTriApi.getThongKe()
      setThongKe(response.data)
    } catch (error) {
      console.error('Không thể tải thống kê:', error)
    }
  }

  const fetchAssetsByDonVi = async (donviId) => {
    try {
      setLoadingUnitAssets(true)
      const response = await taiSanApi.getByDonVi(donviId)
      setUnitAssetList(response.data)
      setSelectedAssets([])
      setAssetPage(1)
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể tải danh sách tài sản')
      setUnitAssetList([])
    } finally {
      setLoadingUnitAssets(false)
    }
  }

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      fetchData()
      return
    }
    try {
      setLoading(true)
      const response = await baoTriApi.search(searchKeyword)
      setData(response.data)
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể tìm kiếm')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    form.resetFields()
    form.setFieldsValue({
      ngaybao: dayjs(),
      loaibaotri: 'SUACHUA',
    })
    setBaoTriMode('device')
    setSelectedDonVi(null)
    setUnitAssetList([])
    setSelectedAssets([])
    setIsModalOpen(true)
  }

  const handleModeChange = (e) => {
    const newMode = e.target.value
    setBaoTriMode(newMode)
    form.setFieldValue('taisanId', undefined)
    setSelectedDonVi(null)
    setUnitAssetList([])
    setSelectedAssets([])
  }

  const handleDonViChange = (donviId) => {
    setSelectedDonVi(donviId)
    if (donviId) {
      fetchAssetsByDonVi(donviId)
    } else {
      setUnitAssetList([])
      setSelectedAssets([])
    }
  }

  const handleAssetSelect = (taisanId, checked) => {
    if (checked) {
      if (selectedAssets.length >= 100) {
        message.warning('Chỉ được chọn tối đa 100 tài sản mỗi lần')
        return
      }
      setSelectedAssets([...selectedAssets, taisanId])
    } else {
      setSelectedAssets(selectedAssets.filter(id => id !== taisanId))
    }
  }

  const handleSelectAll = () => {
    if (unitAssetList.length > 100) {
      message.warning('Chỉ được chọn tối đa 100 tài sản mỗi lần')
      setSelectedAssets(unitAssetList.slice(0, 100).map(ts => ts.taisanId))
    } else {
      setSelectedAssets(unitAssetList.map(ts => ts.taisanId))
    }
  }

  const handleDeselectAll = () => {
    setSelectedAssets([])
  }

  const handleQRScan = () => {
    setIsQRScannerOpen(true)
  }

  const handleQRScanned = async (mataisan) => {
    try {
      const response = await taiSanApi.getByMa(mataisan)
      const taiSan = response.data
      form.resetFields()
      form.setFieldsValue({
        taisanId: taiSan.taisanId,
        ngaybao: dayjs(),
        loaibaotri: 'SUACHUA',
      })
      setBaoTriMode('device')
      setIsModalOpen(true)
      setIsQRScannerOpen(false)
      message.success(`Đã quét tài sản: ${taiSan.mataisan}`)
    } catch (error) {
      message.error('Không tìm thấy tài sản với mã QR này')
    }
  }

  const handleUpdate = (record) => {
    setEditingId(record.baotriId)
    updateForm.setFieldsValue({
      trangthaixuly: record.trangthaixuly,
      chiphi: record.chiphi,
      ketqua: record.ketqua,
      ngayhoanthanh: record.ngayhoanthanh ? dayjs(record.ngayhoanthanh) : null,
      ngaybaotritieptheo: record.ngaybaotritieptheo ? dayjs(record.ngaybaotritieptheo) : null,
    })
    setIsUpdateModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await baoTriApi.delete(id)
      message.success('Xóa phiếu bảo trì thành công')
      fetchData()
      fetchThongKe()
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể xóa phiếu bảo trì')
    }
  }

  const handleSubmit = async (values) => {
    try {
      if (baoTriMode === 'device') {
        const submitData = {
          ...values,
          ngaybao: values.ngaybao.format('YYYY-MM-DD'),
        }
        await baoTriApi.create(submitData)
        message.success('Tạo phiếu bảo trì thành công')
      } else {
        if (selectedAssets.length === 0) {
          message.error('Vui lòng chọn ít nhất một tài sản')
          return
        }
        if (selectedAssets.length > 100) {
          message.error('Chỉ được chọn tối đa 100 tài sản mỗi lần')
          return
        }
        const submitData = {
          taisanIds: selectedAssets,
          loaibaotri: values.loaibaotri,
          ngaybao: values.ngaybao.format('YYYY-MM-DD'),
          motahuhong: values.motahuhong,
          chiphi: values.chiphi,
          ngaybaotritieptheo: values.ngaybaotritieptheo 
            ? values.ngaybaotritieptheo.format('YYYY-MM-DD') 
            : null,
        }
        await baoTriApi.createBatch(submitData)
        message.success(`Đã tạo ${selectedAssets.length} phiếu bảo trì thành công`)
      }
      setIsModalOpen(false)
      form.resetFields()
      setBaoTriMode('device')
      setSelectedDonVi(null)
      setUnitAssetList([])
      setSelectedAssets([])
      fetchData()
      fetchThongKe()
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  const handleUpdateSubmit = async (values) => {
    try {
      const submitData = {
        ...values,
        ngayhoanthanh: values.ngayhoanthanh ? values.ngayhoanthanh.format('YYYY-MM-DD') : null,
        ngaybaotritieptheo: values.ngaybaotritieptheo ? values.ngaybaotritieptheo.format('YYYY-MM-DD') : null,
      }
      await baoTriApi.update(editingId, submitData)
      message.success('Cập nhật phiếu bảo trì thành công')
      setIsUpdateModalOpen(false)
      updateForm.resetFields()
      fetchData()
      fetchThongKe()
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  const getTrangThaiColor = (trangthai) => {
    const colors = { CHOXULY: 'orange', DANGXULY: 'blue', HOANTHANH: 'green', DAHUY: 'red' }
    return colors[trangthai] || 'default'
  }

  const getTrangThaiText = (trangthai) => {
    const texts = { CHOXULY: 'Chờ xử lý', DANGXULY: 'Đang xử lý', HOANTHANH: 'Hoàn thành', DAHUY: 'Đã hủy' }
    return texts[trangthai] || trangthai
  }

  const getLoaiBaoTriText = (loai) => loai === 'SUACHUA' ? 'Sửa chữa' : 'Định kỳ'

  const formatTien = (value) => `${new Intl.NumberFormat('vi-VN').format(value ?? 0)} đ`

  const paginatedAssets = unitAssetList.slice((assetPage - 1) * pageSize, assetPage * pageSize)

  const columns = [
    { title: 'Mã phiếu', dataIndex: 'baotriId', key: 'baotriId', width: 100, render: (id) => `BT-${String(id).padStart(4, '0')}` },
    { title: 'Mã tài sản', dataIndex: 'mataisan', key: 'mataisan', width: 120 },
    { title: 'Tên tài sản', dataIndex: 'tentaisan', key: 'tentaisan', width: 200 },
    { title: 'Loại', dataIndex: 'loaibaotri', key: 'loaibaotri', width: 100, render: (loai) => <Tag color={loai === 'DINHKY' ? 'blue' : 'orange'}>{getLoaiBaoTriText(loai)}</Tag> },
    { title: 'Ngày báo', dataIndex: 'ngaybao', key: 'ngaybao', width: 120, render: (date) => dayjs(date).format('DD/MM/YYYY') },
    { title: 'Trạng thái', dataIndex: 'trangthaixuly', key: 'trangthaixuly', width: 130, render: (trangthai) => <Tag color={getTrangThaiColor(trangthai)}>{getTrangThaiText(trangthai)}</Tag> },
    { title: 'Chi phí', dataIndex: 'chiphi', key: 'chiphi', width: 130, render: (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value) },
    { title: 'Người báo', dataIndex: 'hotennguoibao', key: 'hotennguoibao', width: 150, responsive: ['lg'] },
    {
      title: 'Thao tác', key: 'action', width: 150, fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleUpdate(record)}>Cập nhật</Button>
          <Popconfirm title="Xác nhận xóa" description="Bạn có chắc chắn muốn xóa phiếu bảo trì này?" onConfirm={() => handleDelete(record.baotriId)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Card title="Quản lý Bảo Trì" styles={{ body: { padding: isMobile ? 12 : 24 } }}>
      {thongKe && (isMobile ? (
        <Card size="small" style={{ marginBottom: 12 }}>
          <Row gutter={[8, 8]}>
            <Col span={12}>
              <div style={{ fontSize: 12, color: '#888' }}>Tổng số phiếu</div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{thongKe.tongSoPhieu}</div>
            </Col>
            <Col span={12}>
              <div style={{ fontSize: 12, color: '#888' }}>Chờ xử lý</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#faad14' }}>{thongKe.soPhieuChoXuLy}</div>
            </Col>
            <Col span={12}>
              <div style={{ fontSize: 12, color: '#888' }}>Đang xử lý</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#1890ff' }}>{thongKe.soPhieuDangXuLy}</div>
            </Col>
            <Col span={12}>
              <div style={{ fontSize: 12, color: '#888' }}>Hoàn thành</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#52c41a' }}>{thongKe.soPhieuHoanThanh}</div>
            </Col>
          </Row>
          <Divider style={{ margin: '10px 0' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#888' }}>Tổng chi phí</span>
              <strong style={{ color: '#cf1322' }}>{formatTien(thongKe.tongChiPhi)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#888' }}>Chi phí tháng này</span>
              <strong>{formatTien(thongKe.chiPhiThang)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#888' }}>Chi phí năm nay</span>
              <strong>{formatTien(thongKe.chiPhiNam)}</strong>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col md={6}><Card><Statistic title="Tổng số phiếu" value={thongKe.tongSoPhieu} prefix={<ToolOutlined />} /></Card></Col>
            <Col md={6}><Card><Statistic title="Chờ xử lý" value={thongKe.soPhieuChoXuLy} valueStyle={{ color: '#faad14' }} /></Card></Col>
            <Col md={6}><Card><Statistic title="Đang xử lý" value={thongKe.soPhieuDangXuLy} valueStyle={{ color: '#1890ff' }} /></Card></Col>
            <Col md={6}><Card><Statistic title="Hoàn thành" value={thongKe.soPhieuHoanThanh} valueStyle={{ color: '#52c41a' }} /></Card></Col>
          </Row>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col sm={12} md={8}><Card><Statistic title="Tổng chi phí" value={thongKe.tongChiPhi} precision={0} suffix="đ" valueStyle={{ color: '#cf1322' }} /></Card></Col>
            <Col sm={12} md={8}><Card><Statistic title="Chi phí tháng này" value={thongKe.chiPhiThang} precision={0} suffix="đ" /></Card></Col>
            <Col sm={12} md={8}><Card><Statistic title="Chi phí năm nay" value={thongKe.chiPhiNam} precision={0} suffix="đ" /></Card></Col>
          </Row>
        </>
      ))}

      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 16,
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', flexWrap: 'wrap', gap: 8, flex: 1 }}>
          <Select placeholder="Lọc theo trạng thái" style={{ width: isMobile ? '100%' : 200 }} allowClear value={filterTrangThai} onChange={setFilterTrangThai}>
            <Select.Option value="CHOXULY">Chờ xử lý</Select.Option>
            <Select.Option value="DANGXULY">Đang xử lý</Select.Option>
            <Select.Option value="HOANTHANH">Hoàn thành</Select.Option>
            <Select.Option value="DAHUY">Đã hủy</Select.Option>
          </Select>
          <Input.Search placeholder="Tìm theo mã tài sản" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} onSearch={handleSearch} style={{ width: isMobile ? '100%' : 250 }} allowClear />
        </div>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 8 }}>
          <Button icon={<QrcodeOutlined />} onClick={handleQRScan} block={isMobile}>Quét QR</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} block={isMobile}>Tạo phiếu bảo trì</Button>
        </div>
      </div>

      {isMobile ? (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin />
            </div>
          ) : data.length === 0 ? (
            <Empty description="Không có phiếu bảo trì" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mobileData.map((record) => (
                <Card key={record.baotriId} size="small">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <Space size={6} wrap>
                      <strong>BT-{String(record.baotriId).padStart(4, '0')}</strong>
                      <Tag color={record.loaibaotri === 'DINHKY' ? 'blue' : 'orange'} style={{ marginInlineEnd: 0 }}>
                        {getLoaiBaoTriText(record.loaibaotri)}
                      </Tag>
                    </Space>
                    <Tag color={getTrangThaiColor(record.trangthaixuly)} style={{ marginInlineEnd: 0 }}>
                      {getTrangThaiText(record.trangthaixuly)}
                    </Tag>
                  </div>
                  <div style={{ marginTop: 8, fontWeight: 500 }}>
                    {record.mataisan} — {record.tentaisan}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 13 }}>
                    Ngày báo: {dayjs(record.ngaybao).format('DD/MM/YYYY')}
                  </div>
                  <div style={{ marginTop: 2, fontSize: 13 }}>
                    Chi phí: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.chiphi)}
                  </div>
                  {record.hotennguoibao && (
                    <div style={{ marginTop: 2, fontSize: 12, color: '#888' }}>Người báo: {record.hotennguoibao}</div>
                  )}
                  <Space style={{ marginTop: 8 }} wrap>
                    <Button size="small" icon={<EditOutlined />} onClick={() => handleUpdate(record)}>Cập nhật</Button>
                    <Popconfirm title="Xác nhận xóa" description="Bạn có chắc chắn muốn xóa phiếu bảo trì này?" onConfirm={() => handleDelete(record.baotriId)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
                      <Button size="small" danger icon={<DeleteOutlined />}>Xóa</Button>
                    </Popconfirm>
                  </Space>
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
            Tổng {data.length} phiếu
          </div>
        </div>
      ) : (
        <Table columns={columns} dataSource={data} rowKey="baotriId" loading={loading} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Tổng ${total} phiếu` }} />
      )}

      {/* Modal tao phieu bao tri */}
      <Modal title="Tạo phiếu bảo trì mới" open={isModalOpen} onCancel={() => { setIsModalOpen(false); form.resetFields(); setBaoTriMode('device'); setSelectedDonVi(null); setUnitAssetList([]); setSelectedAssets([]); }} width={isMobile ? '100%' : 800} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Chế độ bảo trì">
            <Radio.Group value={baoTriMode} onChange={handleModeChange}>
              <Radio value="device">Theo thiết bị</Radio>
              <Radio value="unit">Theo đơn vị</Radio>
            </Radio.Group>
          </Form.Item>

          {baoTriMode === 'device' ? (
            <Form.Item name="taisanId" label="Tài sản" rules={[{ required: true, message: 'Vui lòng chọn tài sản' }]}>
              <Select placeholder="Chọn tài sản" showSearch filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())} options={taiSanList.map((ts) => ({ value: ts.taisanId, label: `${ts.mataisan} - ${ts.tentaisan}` }))} />
            </Form.Item>
          ) : (
            <>
              <Form.Item label="Đơn vị" rules={[{ required: true, message: 'Vui lòng chọn đơn vị' }]}>
                <Select placeholder="Chọn đơn vị" value={selectedDonVi} onChange={handleDonViChange} showSearch filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())} options={donViList.map((dv) => ({ value: dv.donviId, label: `${dv.madonvi} - ${dv.tendonvi}` }))} />
              </Form.Item>

              {selectedDonVi && (
                <Form.Item label={`Danh sách tài sản (Đã chọn: ${selectedAssets.length})`}>
                  {loadingUnitAssets ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}><Spin tip="Đang tải danh sách tài sản..." /></div>
                  ) : unitAssetList.length === 0 ? (
                    <Alert message="Không có tài sản nào trong đơn vị này" type="info" />
                  ) : (
                    <>
                      <Space style={{ marginBottom: 8 }}>
                        <Button size="small" onClick={handleSelectAll}>Chọn tất cả</Button>
                        <Button size="small" onClick={handleDeselectAll}>Bỏ chọn tất cả</Button>
                        {selectedAssets.length > 100 && <Alert message="Vượt quá 100 tài sản!" type="warning" showIcon />}
                      </Space>
                      <div style={{ maxHeight: isMobile ? '240px' : '300px', overflowY: 'auto', border: '1px solid #d9d9d9', borderRadius: '4px', padding: '8px' }}>
                        {paginatedAssets.map((ts) => (
                          <div key={ts.taisanId} style={{ padding: '4px 0' }}>
                            <Checkbox checked={selectedAssets.includes(ts.taisanId)} onChange={(e) => handleAssetSelect(ts.taisanId, e.target.checked)}>
                              <strong>{ts.mataisan}</strong> - {ts.tentaisan} {ts.vitri && `(${ts.vitri.tenvitri})`}
                            </Checkbox>
                          </div>
                        ))}
                      </div>
                      {unitAssetList.length > pageSize && (
                        <Pagination current={assetPage} pageSize={pageSize} total={unitAssetList.length} onChange={setAssetPage} style={{ marginTop: 8, textAlign: 'center' }} showSizeChanger={false} />
                      )}
                    </>
                  )}
                </Form.Item>
              )}
            </>
          )}

          <Form.Item name="loaibaotri" label="Loại bảo trì" rules={[{ required: true, message: 'Vui lòng chọn loại bảo trì' }]}>
            <Select placeholder="Chọn loại bảo trì">
              <Select.Option value="SUACHUA">Sửa chữa</Select.Option>
              <Select.Option value="DINHKY">Định kỳ</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="ngaybao" label="Ngày báo" rules={[{ required: true, message: 'Vui lòng chọn ngày báo' }]}>
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="motahuhong" label="Mô tả vấn đề">
            <TextArea rows={4} placeholder="Nhập mô tả vấn đề cần bảo trì" />
          </Form.Item>

          <Form.Item name="chiphi" label="Chi phí dự kiến (VNĐ)">
            <InputNumber style={{ width: '100%' }} formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(value) => value.replace(/\$\s?|(,*)/g, '')} placeholder="Nhập chi phí" min={0} />
          </Form.Item>

          <Form.Item name="ngaybaotritieptheo" label="Ngày bảo trì tiếp theo">
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => { setIsModalOpen(false); form.resetFields(); setBaoTriMode('device'); setSelectedDonVi(null); setUnitAssetList([]); setSelectedAssets([]); }}>Hủy</Button>
              <Button type="primary" htmlType="submit">{baoTriMode === 'device' ? 'Tạo phiếu' : `Tạo ${selectedAssets.length} phiếu`}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal cap nhat */}
      <Modal title={`Cập nhật tiến độ bảo trì - Mã: BT-${String(editingId).padStart(4, '0')}`} open={isUpdateModalOpen} onCancel={() => { setIsUpdateModalOpen(false); updateForm.resetFields(); }} width={isMobile ? '100%' : 700} footer={null}>
        <Form form={updateForm} layout="vertical" onFinish={handleUpdateSubmit}>
          <Form.Item name="trangthaixuly" label="Trạng thái xử lý" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select placeholder="Chọn trạng thái">
              <Select.Option value="CHOXULY">Chờ xử lý</Select.Option>
              <Select.Option value="DANGXULY">Đang xử lý</Select.Option>
              <Select.Option value="HOANTHANH">Hoàn thành</Select.Option>
              <Select.Option value="DAHUY">Đã hủy</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="chiphi" label="Chi phí (VNĐ)">
            <InputNumber style={{ width: '100%' }} formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(value) => value.replace(/\$\s?|(,*)/g, '')} placeholder="Nhập chi phí" min={0} />
          </Form.Item>
          <Form.Item name="ketqua" label="Kết quả xử lý">
            <TextArea rows={4} placeholder="Nhập kết quả xử lý" />
          </Form.Item>
          <Form.Item name="ngayhoanthanh" label="Ngày hoàn thành">
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="ngaybaotritieptheo" label="Ngày bảo trì tiếp theo">
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => { setIsUpdateModalOpen(false); updateForm.resetFields(); }}>Hủy</Button>
              <Button type="primary" htmlType="submit">Cập nhật</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {isQRScannerOpen && <QRScannerModal visible={isQRScannerOpen} onClose={() => setIsQRScannerOpen(false)} onScan={handleQRScanned} />}
    </Card>
  )
}

export default BaoTri
