import { useState, useEffect, useMemo } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Tag,
  Space,
  message,
  Card,
  Drawer,
  Descriptions,
  Timeline,
  Alert,
  Spin,
  Segmented,
  Grid,
  Pagination,
  Empty,
} from 'antd'
import {
  PlusOutlined,
  EyeOutlined,
  HistoryOutlined,
  SwapOutlined,
  UserOutlined,
  TeamOutlined,
  LockOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import luanChuyenApi from '../../api/luanchuyenApi'
import taiSanApi from '../../api/taiSanApi'
import nguoiDungApi from '../../api/nguoidungApi'
import donViApi from '../../api/donviApi'
import viTriApi from '../../api/vitriApi'
import { useAuth } from '../../hooks/useAuth'

const { TextArea } = Input
const { RangePicker } = DatePicker

const LOAI_PHIEU = {
  BANGIAO: { text: 'Bàn giao', color: 'blue' },
  THUHOI: { text: 'Thu hồi', color: 'orange' },
  DIEUCHUYEN: { text: 'Điều chuyển', color: 'purple' },
}

const formatMaPhieu = (id) => `LC-${String(id).padStart(4, '0')}`

// Bên giao/nhận: ưu tiên người, nếu không thì đơn vị
const tenBenGiao = (p) =>
  p.tenNguoiGiao || (p.tenDonViGiao ? `${p.tenDonViGiao} (đơn vị)` : '—')
const tenBenNhan = (p) =>
  p.tenNguoiNhan || (p.tenDonViNhan ? `${p.tenDonViNhan} (đơn vị)` : '—')

const LuanChuyen = () => {
  const { user } = useAuth()
  const screens = Grid.useBreakpoint()
  // Phone: dưới breakpoint md (768px); tablet/desktop dùng bảng
  const isMobile = screens.md === false

  // Danh sách phiếu + phân trang (server-side)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  // Bộ lọc
  const [filterLoaiphieu, setFilterLoaiphieu] = useState(null)
  const [filterDateRange, setFilterDateRange] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')

  // Modal tạo phiếu
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [taiSanList, setTaiSanList] = useState([])
  const [nguoiDungList, setNguoiDungList] = useState([])
  const [donViList, setDonViList] = useState([])
  const [selectedTaiSan, setSelectedTaiSan] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()
  const loaiphieu = Form.useWatch('loaiphieu', form)
  const loaiBenGiao = Form.useWatch('loaiBenGiao', form)
  const loaiBenNhan = Form.useWatch('loaiBenNhan', form)

  // Bàn giao / Điều chuyển + đơn vị nhận: chuỗi chọn đơn vị lồng nhau (cha -> con)
  // + vị trí thuộc đơn vị cuối
  const [donViNhanChain, setDonViNhanChain] = useState([])
  const [viTriNhanList, setViTriNhanList] = useState([])

  // Điều chuyển: đơn vị giao khóa theo vị trí hiện tại của tài sản
  const khoaDonViGiao = loaiphieu === 'DIEUCHUYEN' && !!selectedTaiSan?.donviId

  // Drawer chi tiết + lịch sử
  const [detailRecord, setDetailRecord] = useState(null)
  const [historyTaiSan, setHistoryTaiSan] = useState(null)
  const [historyList, setHistoryList] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    fetchData(1, pagination.pageSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchData = async (page = 1, size = pagination.pageSize, overrides = {}) => {
    try {
      setLoading(true)
      const loai = overrides.loaiphieu !== undefined ? overrides.loaiphieu : filterLoaiphieu
      const range = overrides.dateRange !== undefined ? overrides.dateRange : filterDateRange
      const keyword = overrides.keyword !== undefined ? overrides.keyword : searchKeyword
      const response = await luanChuyenApi.getAll({
        page: page - 1,
        size,
        loaiphieu: loai || undefined,
        keyword: keyword || undefined,
        tuNgay: range?.[0]?.format('YYYY-MM-DD'),
        denNgay: range?.[1]?.format('YYYY-MM-DD'),
      })
      setData(response.data.content || [])
      setPagination({
        current: response.data.number + 1,
        pageSize: response.data.size,
        total: response.data.totalElements,
      })
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể tải danh sách phiếu')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = async () => {
    form.resetFields()
    form.setFieldsValue({
      loaiphieu: 'BANGIAO',
      loaiBenGiao: 'nguoi',
      loaiBenNhan: 'nguoi',
      ngaythuchien: dayjs(),
      nguoigiaoId: user?.nguoidungId,
      nguoinhanId: user?.nguoidungId,
    })
    setSelectedTaiSan(null)
    setDonViNhanChain([])
    setViTriNhanList([])
    setIsModalOpen(true)
    try {
      const [tsRes, ndRes, dvRes] = await Promise.all([
        taiSanApi.getAll(),
        nguoiDungApi.getAll({ hoatdong: true }),
        donViApi.getAll(),
      ])
      setTaiSanList((tsRes.data || []).filter((ts) => !ts.daxoa))
      setNguoiDungList(ndRes.data || [])
      setDonViList(dvRes.data || [])
    } catch (error) {
      message.error('Không thể tải dữ liệu cho form tạo phiếu')
    }
  }

  const handleLoaiPhieuChange = (value) => {
    form.setFieldsValue({
      taisanId: undefined,
      nguoigiaoId: value === 'DIEUCHUYEN' ? undefined : user?.nguoidungId,
      donvigiaoId: undefined,
      nguoinhanId: user?.nguoidungId,
      donvinhanId: undefined,
      loaiBenGiao: value === 'DIEUCHUYEN' ? 'donvi' : 'nguoi',
      loaiBenNhan: 'nguoi',
      vitriId: undefined,
    })
    setSelectedTaiSan(null)
    setDonViNhanChain([])
    setViTriNhanList([])
  }

  const handleTaiSanChange = (taisanId) => {
    const ts = taiSanList.find((t) => t.taisanId === taisanId) || null
    setSelectedTaiSan(ts)
    if (loaiphieu === 'THUHOI' && form.getFieldValue('loaiBenGiao') === 'nguoi') {
      form.setFieldsValue({ nguoigiaoId: ts?.nguoisudungId })
    }
    if (loaiphieu === 'DIEUCHUYEN') {
      // Bên giao tự đổ từ đơn vị của vị trí hiện tại của tài sản
      form.setFieldsValue({
        loaiBenGiao: 'donvi',
        nguoigiaoId: undefined,
        donvigiaoId: ts?.donviId,
        vitriId: undefined,
      })
    }
  }

  const handleLoaiBenGiaoChange = () => {
    form.setFieldsValue({ nguoigiaoId: undefined, donvigiaoId: undefined })
    if (loaiphieu === 'THUHOI' && selectedTaiSan) {
      form.setFieldsValue({ nguoigiaoId: selectedTaiSan.nguoisudungId })
    }
  }

  const handleLoaiBenNhanChange = () => {
    form.setFieldsValue({ nguoinhanId: undefined, donvinhanId: undefined, vitriId: undefined })
    setDonViNhanChain([])
    setViTriNhanList([])
  }

  // Cây đơn vị: gom đơn vị con theo đơn vị cha (không có cha trong danh sách => đơn vị gốc)
  const donViChildrenMap = useMemo(() => {
    const idSet = new Set(donViList.map((dv) => dv.donviId))
    const map = new Map()
    donViList.forEach((dv) => {
      const pid = dv.donviCha?.donviId
      const key = pid && idSet.has(pid) ? pid : null
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(dv)
    })
    return map
  }, [donViList])

  const toDonViOptions = (list) =>
    list.map((dv) => ({ value: dv.donviId, label: `${dv.madonvi} - ${dv.tendonvi}` }))

  const tenDonViById = (id) => donViList.find((dv) => dv.donviId === id)?.tendonvi

  const handleChainDonViNhanChange = (level, value) => {
    const next = donViNhanChain.slice(0, level)
    if (value) next.push(value)
    setDonViNhanChain(next)
    // Chuỗi select lồng nhau không đăng ký name, giá trị đơn vị cuối lấy từ state khi submit
    form.setFieldsValue({ vitriId: undefined })
    const lastId = next.length > 0 ? next[next.length - 1] : undefined
    if (lastId) {
      viTriApi.getByDonVi(lastId)
        .then((res) => setViTriNhanList(res.data || []))
        .catch(() => setViTriNhanList([]))
    } else {
      setViTriNhanList([])
    }
  }

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true)
      const submitData = {
        loaiphieu: values.loaiphieu,
        taisanId: values.taisanId,
        ngaythuchien: values.ngaythuchien?.format('YYYY-MM-DD'),
        lydo: values.lydo,
      }
      // Mọi loại phiếu đều bắt buộc bên giao + bên nhận
      if (values.loaiBenGiao === 'donvi') {
        submitData.donvigiaoId = values.donvigiaoId
      } else {
        submitData.nguoigiaoId = values.nguoigiaoId
      }
      if (values.loaiBenNhan === 'donvi') {
        if (values.loaiphieu === 'BANGIAO' || values.loaiphieu === 'DIEUCHUYEN') {
          // Đơn vị cuối cùng trong chuỗi chọn lồng nhau; dừng ở cấp nào cũng hợp lệ
          const donvinhanId = donViNhanChain[donViNhanChain.length - 1]
          if (!donvinhanId) {
            message.error('Vui lòng chọn đơn vị nhận')
            return
          }
          if (values.loaiphieu === 'DIEUCHUYEN' && donvinhanId === values.donvigiaoId) {
            message.error('Đơn vị nhận trùng với đơn vị giao')
            return
          }
          submitData.donvinhanId = donvinhanId
          if (values.vitriId) submitData.vitriId = values.vitriId
        } else {
          submitData.donvinhanId = values.donvinhanId
        }
      } else {
        submitData.nguoinhanId = values.nguoinhanId
      }
      await luanChuyenApi.create(submitData)
      message.success('Tạo phiếu luân chuyển thành công')
      setIsModalOpen(false)
      fetchData(1)
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể tạo phiếu luân chuyển')
    } finally {
      setSubmitting(false)
    }
  }

  const openHistory = async (record) => {
    setHistoryTaiSan(record)
    setHistoryList([])
    setHistoryLoading(true)
    try {
      const response = await luanChuyenApi.getByTaisan(record.taisanId)
      setHistoryList(response.data || [])
    } catch (error) {
      message.error('Không thể tải lịch sử luân chuyển')
    } finally {
      setHistoryLoading(false)
    }
  }

  const nguoiDonViOptions = nguoiDungList.map((nd) => ({
    value: nd.nguoidungId,
    label: `${nd.hoten} (${nd.tendangnhap})`,
  }))
  const donViOptions = donViList.map((dv) => ({
    value: dv.donviId,
    label: `${dv.madonvi} - ${dv.tendonvi}`,
  }))
  // Điều chuyển: không cho chọn lại chính vị trí hiện tại của tài sản
  const viTriNhanOptions = viTriNhanList
    .filter((vt) => !(loaiphieu === 'DIEUCHUYEN' && vt.vitriId === selectedTaiSan?.vitriId))
    .map((vt) => ({ value: vt.vitriId, label: `${vt.mavitri} - ${vt.tenvitri}` }))

  const columns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'luanchuyenId',
      key: 'luanchuyenId',
      width: 100,
      render: (id) => formatMaPhieu(id),
    },
    {
      title: 'Loại phiếu',
      dataIndex: 'loaiphieu',
      key: 'loaiphieu',
      width: 110,
      render: (loai) => {
        const info = LOAI_PHIEU[loai] || {}
        return <Tag color={info.color}>{info.text || loai}</Tag>
      },
    },
    {
      title: 'Tài sản',
      key: 'taisan',
      width: 220,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.mataisan}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{record.tentaisan}</div>
        </div>
      ),
    },
    {
      title: 'Bên giao → Bên nhận',
      key: 'nguoi',
      width: 240,
      render: (_, record) => (
        <span>
          {tenBenGiao(record)}
          {' → '}
          <strong>{tenBenNhan(record)}</strong>
        </span>
      ),
    },
    {
      title: 'Vị trí',
      key: 'vitri',
      width: 180,
      responsive: ['lg'],
      render: (_, record) =>
        record.tenViTri ? (
          <div>
            <div>{record.tenViTri}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{record.tenDonVi}</div>
          </div>
        ) : (
          '—'
        ),
    },
    {
      title: 'Ngày thực hiện',
      dataIndex: 'ngaythuchien',
      key: 'ngaythuchien',
      width: 120,
      render: (date) => (date ? dayjs(date).format('DD/MM/YYYY') : '—'),
    },
    {
      title: 'Lý do',
      dataIndex: 'lydo',
      key: 'lydo',
      responsive: ['xl'],
      ellipsis: true,
      render: (lydo) => lydo || '—',
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 170,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setDetailRecord(record)}>
            Chi tiết
          </Button>
          <Button type="link" size="small" icon={<HistoryOutlined />} onClick={() => openHistory(record)}>
            Lịch sử
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <Card
      title={
        <Space>
          <SwapOutlined />
          Quản lý Luân chuyển
        </Space>
      }
      styles={{ body: { padding: isMobile ? 12 : 24 } }}
    >
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
          <Select
            placeholder="Lọc theo loại phiếu"
            style={{ width: isMobile ? '100%' : 180 }}
            allowClear
            value={filterLoaiphieu}
            onChange={(value) => {
              setFilterLoaiphieu(value)
              fetchData(1, pagination.pageSize, { loaiphieu: value })
            }}
          >
            <Select.Option value="BANGIAO">Bàn giao</Select.Option>
            <Select.Option value="THUHOI">Thu hồi</Select.Option>
            <Select.Option value="DIEUCHUYEN">Điều chuyển</Select.Option>
          </Select>
          <RangePicker
            format="DD/MM/YYYY"
            style={{ width: isMobile ? '100%' : undefined }}
            value={filterDateRange}
            onChange={(range) => {
              setFilterDateRange(range)
              fetchData(1, pagination.pageSize, { dateRange: range })
            }}
          />
          <Input.Search
            placeholder="Tìm theo mã/tên tài sản"
            allowClear
            style={{ width: isMobile ? '100%' : 250 }}
            onSearch={(value) => {
              setSearchKeyword(value)
              fetchData(1, pagination.pageSize, { keyword: value })
            }}
          />
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal} block={isMobile}>
          Tạo phiếu
        </Button>
      </div>

      {isMobile ? (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin />
            </div>
          ) : data.length === 0 ? (
            <Empty description="Không có phiếu luân chuyển" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.map((record) => (
                <Card key={record.luanchuyenId} size="small">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <Space size={6} wrap>
                      <Tag color={LOAI_PHIEU[record.loaiphieu]?.color} style={{ marginInlineEnd: 0 }}>
                        {LOAI_PHIEU[record.loaiphieu]?.text || record.loaiphieu}
                      </Tag>
                      <strong>{formatMaPhieu(record.luanchuyenId)}</strong>
                    </Space>
                    <span style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap' }}>
                      {record.ngaythuchien ? dayjs(record.ngaythuchien).format('DD/MM/YYYY') : '—'}
                    </span>
                  </div>
                  <div style={{ marginTop: 8, fontWeight: 500 }}>
                    {record.mataisan} — {record.tentaisan}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 13 }}>
                    {tenBenGiao(record)} → <strong>{tenBenNhan(record)}</strong>
                  </div>
                  {record.tenViTri && (
                    <div style={{ marginTop: 2, fontSize: 12, color: '#888' }}>
                      Vị trí: {record.tenViTri}
                      {record.tenDonVi ? ` — ${record.tenDonVi}` : ''}
                    </div>
                  )}
                  {record.lydo && (
                    <div style={{ marginTop: 2, fontSize: 12, color: '#888', fontStyle: 'italic' }}>{record.lydo}</div>
                  )}
                  <Space style={{ marginTop: 8 }} wrap>
                    <Button size="small" icon={<EyeOutlined />} onClick={() => setDetailRecord(record)}>
                      Chi tiết
                    </Button>
                    <Button size="small" icon={<HistoryOutlined />} onClick={() => openHistory(record)}>
                      Lịch sử
                    </Button>
                  </Space>
                </Card>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <Pagination
              size="small"
              simple
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={(page) => fetchData(page, pagination.pageSize)}
            />
          </div>
          <div style={{ textAlign: 'center', color: '#888', fontSize: 12, marginTop: 8 }}>
            Tổng {pagination.total} phiếu
          </div>
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={data}
          rowKey="luanchuyenId"
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} phiếu`,
            onChange: (page, size) => fetchData(page, size),
          }}
        />
      )}

      {/* Modal tạo phiếu */}
      <Modal
        title="Tạo phiếu luân chuyển"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={isMobile ? '100%' : 640}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="loaiphieu" label="Loại phiếu" rules={[{ required: true, message: 'Vui lòng chọn loại phiếu' }]}>
            <Select onChange={handleLoaiPhieuChange}>
              <Select.Option value="BANGIAO">Bàn giao</Select.Option>
              <Select.Option value="THUHOI">Thu hồi</Select.Option>
              <Select.Option value="DIEUCHUYEN">Điều chuyển</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="taisanId" label="Tài sản" rules={[{ required: true, message: 'Vui lòng chọn tài sản' }]}>
            <Select
              placeholder="Chọn tài sản"
              showSearch
              optionFilterProp="label"
              onChange={handleTaiSanChange}
              options={taiSanList.map((ts) => ({
                value: ts.taisanId,
                label: `${ts.mataisan} - ${ts.tentaisan} [${ts.tentrangthai}]`,
              }))}
              notFoundContent="Không có tài sản"
            />
          </Form.Item>

          {selectedTaiSan && (
            <Alert
              style={{ marginBottom: 16 }}
              type="info"
              showIcon
              message={`Trạng thái: ${selectedTaiSan.tentrangthai}`}
              description={
                <div style={{ fontSize: 13 }}>
                  <div>
                    <strong>{selectedTaiSan.mataisan}</strong> — {selectedTaiSan.tentaisan}
                  </div>
                  <div>
                    Đơn vị hiện tại: <strong>{selectedTaiSan.tendonvi || '—'}</strong>
                    {' — '}Vị trí: <strong>{selectedTaiSan.tenvitri || '—'}</strong>
                  </div>
                  <div>
                    Người đang giữ: <strong>{selectedTaiSan.tennguoisudung || '—'}</strong>
                  </div>
                </div>
              }
            />
          )}

          {/* Bên giao / Bên nhận: bắt buộc với mọi loại phiếu */}
          <Form.Item name="loaiBenGiao" label="Bên giao" style={{ marginBottom: 8 }}>
            <Segmented
              onChange={handleLoaiBenGiaoChange}
              disabled={loaiphieu === 'DIEUCHUYEN'}
              options={[
                { value: 'nguoi', icon: <UserOutlined />, label: 'Người giao' },
                { value: 'donvi', icon: <TeamOutlined />, label: 'Đơn vị giao' },
              ]}
            />
          </Form.Item>
          {loaiBenGiao === 'donvi' ? (
            <Form.Item
              name="donvigiaoId"
              label="Đơn vị giao"
              rules={[{ required: true, message: 'Vui lòng chọn đơn vị giao' }]}
              extra={khoaDonViGiao ? <><LockOutlined /> Khóa theo vị trí hiện tại của tài sản</> : undefined}
            >
              <Select
                placeholder="Chọn đơn vị giao"
                disabled={khoaDonViGiao}
                showSearch
                optionFilterProp="label"
                options={donViOptions}
              />
            </Form.Item>
          ) : (
            <Form.Item
              name="nguoigiaoId"
              label="Người giao"
              rules={[{ required: true, message: loaiphieu === 'THUHOI' ? 'Không xác định được người đang giữ — hãy chọn Đơn vị giao' : 'Vui lòng chọn người giao' }]}
            >
              <Select
                placeholder="Chọn người giao"
                showSearch
                optionFilterProp="label"
                disabled={loaiphieu === 'THUHOI'}
                options={nguoiDonViOptions}
              />
            </Form.Item>
          )}

          <Form.Item name="loaiBenNhan" label="Bên nhận" style={{ marginBottom: 8 }}>
            <Segmented
              onChange={handleLoaiBenNhanChange}
              options={[
                { value: 'nguoi', icon: <UserOutlined />, label: 'Người nhận' },
                { value: 'donvi', icon: <TeamOutlined />, label: 'Đơn vị nhận' },
              ]}
            />
          </Form.Item>
          {loaiBenNhan === 'donvi' ? (
            loaiphieu === 'BANGIAO' || loaiphieu === 'DIEUCHUYEN' ? (
              <>
                <Form.Item
                  label="Đơn vị nhận"
                  required
                  style={{ marginBottom: 8 }}
                  extra="Chọn đơn vị cha, có thể chọn tiếp đơn vị con rồi dừng ở bất kỳ cấp nào"
                >
                  <Select
                    placeholder="Chọn đơn vị cha"
                    showSearch
                    optionFilterProp="label"
                    allowClear
                    value={donViNhanChain[0]}
                    onChange={(v) => handleChainDonViNhanChange(0, v)}
                    options={toDonViOptions(donViChildrenMap.get(null) || [])}
                  />
                </Form.Item>
                {donViNhanChain.map((donviId, idx) => {
                  const children = donViChildrenMap.get(donviId) || []
                  if (children.length === 0) return null
                  return (
                    <Form.Item key={donviId} label="Đơn vị con" style={{ marginBottom: 8 }}>
                      <Select
                        placeholder="Chọn đơn vị con (không bắt buộc)"
                        showSearch
                        optionFilterProp="label"
                        allowClear
                        value={donViNhanChain[idx + 1]}
                        onChange={(v) => handleChainDonViNhanChange(idx + 1, v)}
                        options={toDonViOptions(children)}
                      />
                    </Form.Item>
                  )
                })}
                {donViNhanChain.length > 0 && (
                  <Form.Item name="vitriId" label="Vị trí cụ thể (không bắt buộc)" style={{ marginBottom: 8 }}>
                    <Select
                      placeholder={`Chọn vị trí thuộc ${tenDonViById(donViNhanChain[donViNhanChain.length - 1]) || 'đơn vị đã chọn'}`}
                      showSearch
                      optionFilterProp="label"
                      allowClear
                      options={viTriNhanOptions}
                      notFoundContent="Đơn vị này chưa có vị trí"
                    />
                  </Form.Item>
                )}
              </>
            ) : (
              <Form.Item name="donvinhanId" label="Đơn vị nhận" rules={[{ required: true, message: 'Vui lòng chọn đơn vị nhận' }]}>
                <Select
                  placeholder="Chọn đơn vị nhận"
                  showSearch
                  optionFilterProp="label"
                  options={donViOptions}
                />
              </Form.Item>
            )
          ) : (
            <Form.Item name="nguoinhanId" label="Người nhận" rules={[{ required: true, message: 'Vui lòng chọn người nhận' }]}>
              <Select
                placeholder="Chọn người nhận"
                showSearch
                optionFilterProp="label"
                options={nguoiDonViOptions}
              />
            </Form.Item>
          )}

          <Form.Item name="ngaythuchien" label="Ngày thực hiện" rules={[{ required: true, message: 'Vui lòng chọn ngày thực hiện' }]}>
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} disabledDate={(d) => d && d.isAfter(dayjs(), 'day')} />
          </Form.Item>

          <Form.Item name="lydo" label="Lý do" rules={[{ max: 500, message: 'Lý do tối đa 500 ký tự' }]}>
            <TextArea rows={3} placeholder="Nhập lý do bàn giao / thu hồi / điều chuyển" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Tạo phiếu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Drawer chi tiết phiếu */}
      <Drawer
        title={detailRecord ? `Chi tiết phiếu ${formatMaPhieu(detailRecord.luanchuyenId)}` : ''}
        open={!!detailRecord}
        onClose={() => setDetailRecord(null)}
        width={isMobile ? '100%' : 480}
      >
        {detailRecord && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Loại phiếu">
              <Tag color={LOAI_PHIEU[detailRecord.loaiphieu]?.color}>
                {LOAI_PHIEU[detailRecord.loaiphieu]?.text || detailRecord.loaiphieu}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tài sản">
              <a href={`/assets/${detailRecord.taisanId}`}>
                {detailRecord.mataisan} - {detailRecord.tentaisan}
              </a>
            </Descriptions.Item>
            <Descriptions.Item label="Bên giao">{tenBenGiao(detailRecord)}</Descriptions.Item>
            <Descriptions.Item label="Bên nhận">{tenBenNhan(detailRecord)}</Descriptions.Item>
            <Descriptions.Item label="Vị trí">
              {detailRecord.tenViTri ? `${detailRecord.tenViTri} (${detailRecord.tenDonVi || '—'})` : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày thực hiện">
              {detailRecord.ngaythuchien ? dayjs(detailRecord.ngaythuchien).format('DD/MM/YYYY') : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Lý do">{detailRecord.lydo || '—'}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      {/* Drawer lịch sử luân chuyển theo tài sản */}
      <Drawer
        title={historyTaiSan ? `Lịch sử luân chuyển - ${historyTaiSan.mataisan}` : ''}
        open={!!historyTaiSan}
        onClose={() => setHistoryTaiSan(null)}
        width={isMobile ? '100%' : 520}
      >
        {historyLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin />
          </div>
        ) : historyList.length === 0 ? (
          <Alert type="info" message="Tài sản này chưa có lịch sử luân chuyển" />
        ) : (
          <Timeline
            items={historyList.map((p) => ({
              color: LOAI_PHIEU[p.loaiphieu]?.color || 'gray',
              children: (
                <div>
                  <div>
                    <Tag color={LOAI_PHIEU[p.loaiphieu]?.color}>
                      {LOAI_PHIEU[p.loaiphieu]?.text || p.loaiphieu}
                    </Tag>
                    <span style={{ color: '#888' }}>
                      {p.ngaythuchien ? dayjs(p.ngaythuchien).format('DD/MM/YYYY') : ''}
                    </span>
                  </div>
                  <div>
                    {tenBenGiao(p)} → <strong>{tenBenNhan(p)}</strong>
                  </div>
                  {p.tenViTri && (
                    <div style={{ fontSize: 12, color: '#888' }}>Vị trí mới: {p.tenViTri}</div>
                  )}
                  {p.lydo && <div style={{ fontStyle: 'italic', color: '#555' }}>{p.lydo}</div>}
                </div>
              ),
            }))}
          />
        )}
      </Drawer>
    </Card>
  )
}

export default LuanChuyen
