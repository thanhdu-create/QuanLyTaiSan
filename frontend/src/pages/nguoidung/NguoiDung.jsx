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
  Switch,
  Tag,
  Dropdown,
  Grid,
  Empty,
  Pagination,
  Spin,
  Checkbox,
  Alert,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import nguoidungApi from '../../api/nguoidungApi'
import donviApi from '../../api/donviApi'
import { useAuth } from '../../hooks/useAuth'
import { PERMISSION_OPTIONS, getPermissionLabel } from '../../utils/permissions'
import dayjs from 'dayjs'

const VAI_TRO_OPTIONS = [
  { value: 'ADMIN', label: 'Quản trị viên' },
  { value: 'USER', label: 'Người dùng' },
]

const getVaiTroText = (vaitro) => (vaitro === 'ADMIN' ? 'Quản trị viên' : 'Người dùng')

const NguoiDung = () => {
  const [data, setData] = useState([])
  const [donViList, setDonViList] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterVaiTro, setFilterVaiTro] = useState(null)
  const [permissionUser, setPermissionUser] = useState(null)
  const [permissionCodes, setPermissionCodes] = useState([])
  const [savingPermission, setSavingPermission] = useState(false)
  const [form] = Form.useForm()

  const screens = Grid.useBreakpoint()
  // Phone: dưới breakpoint md (768px); tablet: md đến dưới lg (992px)
  const isMobile = screens.md === false
  const isTablet = screens.md === true && screens.lg === false
  const [mobilePage, setMobilePage] = useState(1)
  const MOBILE_PAGE_SIZE = 10

  const { user } = useAuth()

  useEffect(() => {
    fetchData()
    fetchDonVi()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await nguoidungApi.getAll()
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
    } catch (error) {
      console.error('Không thể tải danh sách đơn vị:', error)
    }
  }

  const filteredData = data.filter((nd) => {
    const kw = searchKeyword.trim().toLowerCase()
    const matchKeyword =
      !kw ||
      [nd.hoten, nd.tendangnhap, nd.email].some((value) =>
        (value || '').toLowerCase().includes(kw)
      )
    const matchVaiTro = !filterVaiTro || nd.vaitro === filterVaiTro
    return matchKeyword && matchVaiTro
  })

  const mobileTotalPages = Math.max(1, Math.ceil(filteredData.length / MOBILE_PAGE_SIZE))
  const safeMobilePage = Math.min(mobilePage, mobileTotalPages)
  const mobileData = filteredData.slice(
    (safeMobilePage - 1) * MOBILE_PAGE_SIZE,
    safeMobilePage * MOBILE_PAGE_SIZE
  )

  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({
      vaitro: 'USER',
      hoatdong: true,
    })
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditingId(record.nguoidungId)
    form.setFieldsValue({
      tendangnhap: record.tendangnhap,
      hoten: record.hoten,
      email: record.email,
      matkhau: '',
      vaitro: record.vaitro,
      donviId: record.donviId,
      hoatdong: record.hoatdong,
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    form.resetFields()
  }

  const openPermissionModal = (record) => {
    setPermissionUser(record)
    setPermissionCodes(record.quyenhan || [])
  }

  const closePermissionModal = () => {
    setPermissionUser(null)
    setPermissionCodes([])
  }

  const handleSavePermission = async () => {
    if (!permissionUser) {
      return
    }
    try {
      setSavingPermission(true)
      await nguoidungApi.updatePermissions(permissionUser.nguoidungId, permissionCodes)
      message.success('Cập nhật quyền truy cập thành công')
      closePermissionModal()
      fetchData()
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể cập nhật quyền truy cập')
    } finally {
      setSavingPermission(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await nguoidungApi.delete(id)
      message.success('Xóa người dùng thành công')
      fetchData()
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể xóa người dùng')
    }
  }

  const handleConfirmDelete = (record) => {
    if (record.nguoidungId === user?.nguoidungId) {
      message.warning('Không thể xóa tài khoản đang đăng nhập')
      return
    }
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa người dùng "${record.hoten}"?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => handleDelete(record.nguoidungId),
    })
  }

  const handleSubmit = async (values) => {
    try {
      const payload = {
        tendangnhap: values.tendangnhap,
        hoten: values.hoten,
        email: values.email || null,
        vaitro: values.vaitro,
        donviId: values.donviId || null,
        hoatdong: values.hoatdong ?? true,
      }
      if (values.matkhau) {
        payload.matkhau = values.matkhau
      }

      if (editingId) {
        await nguoidungApi.update(editingId, payload)
        message.success('Cập nhật người dùng thành công')
      } else {
        await nguoidungApi.create(payload)
        message.success('Thêm người dùng thành công')
      }
      closeModal()
      fetchData()
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  const actionMenuItems = (record) => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Sửa',
      onClick: () => handleEdit(record),
    },
    {
      key: 'permission',
      icon: <SafetyCertificateOutlined />,
      label: 'Phân quyền truy cập',
      onClick: () => openPermissionModal(record),
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

  const renderVaiTroTag = (vaitro) => (
    <Tag color={vaitro === 'ADMIN' ? 'red' : 'blue'}>{getVaiTroText(vaitro)}</Tag>
  )

  const renderHoatDongTag = (hoatdong) => (
    <Tag color={hoatdong ? 'green' : 'default'}>{hoatdong ? 'Hoạt động' : 'Đã khóa'}</Tag>
  )

  const columns = [
    {
      title: 'Họ tên',
      key: 'hoten',
      width: isTablet ? 300 : 240,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.hoten}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c', wordBreak: 'break-word' }}>
            {record.tendangnhap}
            {record.email ? ` · ${record.email}` : ''}
          </div>
          {isTablet && (
            <>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                Đơn vị: {record.tenDonVi || '-'}
              </div>
              <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {record.quyenhan?.length ? (
                  record.quyenhan.map((code) => (
                    <Tag key={code} color="cyan" style={{ marginInlineEnd: 0 }}>
                      {getPermissionLabel(code)}
                    </Tag>
                  ))
                ) : (
                  <span style={{ fontSize: 12, color: '#bfbfbf' }}>Chưa cấp quyền</span>
                )}
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'vaitro',
      key: 'vaitro',
      width: 130,
      render: (vaitro) => renderVaiTroTag(vaitro),
    },
    {
      title: 'Quyền truy cập',
      key: 'quyenhan',
      width: 220,
      responsive: ['lg'],
      render: (_, record) =>
        record.quyenhan?.length ? (
          <Space size={[0, 4]} wrap>
            {record.quyenhan.map((code) => (
              <Tag key={code} color="cyan">
                {getPermissionLabel(code)}
              </Tag>
            ))}
          </Space>
        ) : (
          <span style={{ color: '#8c8c8c' }}>Chưa cấp</span>
        ),
    },
    {
      title: 'Đơn vị',
      dataIndex: 'tenDonVi',
      key: 'tenDonVi',
      width: 170,
      ellipsis: true,
      responsive: ['lg'],
      render: (text) => text || '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'hoatdong',
      key: 'hoatdong',
      width: 120,
      render: (hoatdong) => renderHoatDongTag(hoatdong),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      responsive: ['lg'],
      render: (date) => (date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 80,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Dropdown menu={{ items: actionMenuItems(record) }} trigger={['click']} placement="bottomRight">
          <Button type="text" icon={<EllipsisOutlined />} />
        </Dropdown>
      ),
    },
  ]

  return (
    <Card title="Quản lý Người dùng" styles={{ body: { padding: isMobile ? 12 : 24 } }}>
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
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            flexWrap: 'wrap',
            gap: 8,
            flex: isMobile ? undefined : '1 1 420px',
          }}
        >
          <Input
            placeholder="Tìm theo họ tên, tên đăng nhập, email"
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value)
              setMobilePage(1)
            }}
            allowClear
            style={
              isMobile
                ? { width: '100%' }
                : { flex: '1 1 220px', minWidth: 200, maxWidth: 320 }
            }
          />
          <Select
            placeholder="Lọc theo vai trò"
            allowClear
            value={filterVaiTro}
            onChange={(value) => {
              setFilterVaiTro(value)
              setMobilePage(1)
            }}
            options={VAI_TRO_OPTIONS}
            style={isMobile ? { width: '100%' } : { flex: '0 0 180px' }}
          />
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          block={isMobile}
        >
          Thêm người dùng
        </Button>
      </div>

      {isMobile ? (
        <>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin />
            </div>
          ) : mobileData.length === 0 ? (
            <Empty description="Chưa có người dùng nào" />
          ) : (
            mobileData.map((record) => (
              <Card
                key={record.nguoidungId}
                size="small"
                style={{ marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                styles={{ body: { padding: 12 } }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{record.hoten}</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.tendangnhap}</div>
                  </div>
                  <Dropdown menu={{ items: actionMenuItems(record) }} trigger={['click']} placement="bottomRight">
                    <Button type="text" size="small" icon={<EllipsisOutlined />} />
                  </Dropdown>
                </div>
                <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {renderVaiTroTag(record.vaitro)}
                  {renderHoatDongTag(record.hoatdong)}
                </div>
                {record.quyenhan?.length > 0 && (
                  <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {record.quyenhan.map((code) => (
                      <Tag key={code} color="cyan" style={{ marginInlineEnd: 0 }}>
                        {getPermissionLabel(code)}
                      </Tag>
                    ))}
                  </div>
                )}
                <div style={{ marginTop: 8, fontSize: 13, color: '#595959', display: 'grid', gap: 4 }}>
                  <div><span style={{ color: '#8c8c8c' }}>Email:</span> {record.email || '-'}</div>
                  <div><span style={{ color: '#8c8c8c' }}>Đơn vị:</span> {record.tenDonVi || '-'}</div>
                  <div>
                    <span style={{ color: '#8c8c8c' }}>Ngày tạo:</span>{' '}
                    {record.createdAt ? dayjs(record.createdAt).format('DD/MM/YYYY HH:mm') : '-'}
                  </div>
                </div>
              </Card>
            ))
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <span style={{ fontSize: 13, color: '#8c8c8c' }}>Tổng {filteredData.length} người dùng</span>
            <Pagination
              simple
              current={safeMobilePage}
              pageSize={MOBILE_PAGE_SIZE}
              total={filteredData.length}
              onChange={setMobilePage}
            />
          </div>
        </>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="nguoidungId"
          loading={loading}
          size={isTablet ? 'small' : 'middle'}
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 10,
            simple: isTablet,
            showSizeChanger: !isTablet,
            showTotal: isTablet ? undefined : (total) => `Tổng ${total} người dùng`,
          }}
        />
      )}

      <Modal
        title={editingId ? 'Cập nhật người dùng' : 'Thêm người dùng'}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        width={isMobile ? '100%' : 560}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="hoten"
            label="Họ tên"
            rules={[
              { required: true, message: 'Vui lòng nhập họ tên' },
              { max: 100, message: 'Họ tên không được quá 100 ký tự' },
            ]}
          >
            <Input placeholder="Nhập họ tên" />
          </Form.Item>

          <Form.Item
            name="tendangnhap"
            label="Tên đăng nhập"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đăng nhập' },
              { max: 50, message: 'Tên đăng nhập không được quá 50 ký tự' },
            ]}
          >
            <Input placeholder="Nhập tên đăng nhập" disabled={!!editingId} />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            name="matkhau"
            label={editingId ? 'Mật khẩu mới' : 'Mật khẩu'}
            rules={[
              { required: !editingId, message: 'Vui lòng nhập mật khẩu' },
              {
                validator: (_, value) =>
                  !value || value.length >= 6
                    ? Promise.resolve()
                    : Promise.reject(new Error('Mật khẩu phải có ít nhất 6 ký tự')),
              },
            ]}
          >
            <Input.Password
              placeholder={editingId ? 'Để trống nếu không đổi mật khẩu' : 'Nhập mật khẩu'}
            />
          </Form.Item>

          <Form.Item
            name="vaitro"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select placeholder="Chọn vai trò" options={VAI_TRO_OPTIONS} />
          </Form.Item>

          <Form.Item name="donviId" label="Đơn vị">
            <Select
              placeholder="Chọn đơn vị (không bắt buộc)"
              allowClear
              showSearch
              optionFilterProp="label"
              options={donViList.map((dv) => ({
                value: dv.donviId,
                label: `${dv.madonvi} - ${dv.tendonvi}`,
              }))}
            />
          </Form.Item>

          {editingId && (
            <Form.Item name="hoatdong" label="Trạng thái hoạt động" valuePropName="checked">
              <Switch checkedChildren="Hoạt động" unCheckedChildren="Đã khóa" />
            </Form.Item>
          )}

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={closeModal}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingId ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Phân quyền truy cập"
        open={!!permissionUser}
        onCancel={closePermissionModal}
        onOk={handleSavePermission}
        okText="Lưu"
        cancelText="Hủy"
        confirmLoading={savingPermission}
        width={isMobile ? '100%' : 520}
      >
        {permissionUser && (
          <>
            <div style={{ marginBottom: 12 }}>
              Cấp quyền cho <strong>{permissionUser.hoten}</strong> ({permissionUser.tendangnhap})
            </div>
            {permissionUser.vaitro === 'ADMIN' ? (
              <Alert
                type="info"
                showIcon
                message="Tài khoản này là Quản trị viên nên đã có quyền truy cập tất cả các trang."
              />
            ) : (
              <>
                <div style={{ marginBottom: 8, color: '#595959' }}>
                  Chọn các trang admin mà người dùng được phép truy cập. Các trang này sẽ xuất hiện
                  trong sidebar khi họ đăng nhập bằng tài khoản của mình.
                </div>
                <Checkbox.Group
                  value={permissionCodes}
                  onChange={setPermissionCodes}
                  options={PERMISSION_OPTIONS}
                  style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                />
              </>
            )}
          </>
        )}
      </Modal>
    </Card>
  )
}

export default NguoiDung
