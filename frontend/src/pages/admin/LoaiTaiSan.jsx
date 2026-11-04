import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Space, message, Card, Dropdown, Grid, Empty, Pagination, Spin } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EllipsisOutlined } from '@ant-design/icons'
import loaiTaiSanApi from '../../api/loaiTaiSanApi'
import dayjs from 'dayjs'

const LoaiTaiSan = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form] = Form.useForm()

  const screens = Grid.useBreakpoint()
  // Phone: dưới breakpoint md (768px); tablet/desktop dùng bảng
  const isMobile = screens.md === false
  const [mobilePage, setMobilePage] = useState(1)
  const MOBILE_PAGE_SIZE = 10
  const mobileTotalPages = Math.max(1, Math.ceil(data.length / MOBILE_PAGE_SIZE))
  const safeMobilePage = Math.min(mobilePage, mobileTotalPages)
  const mobileData = data.slice((safeMobilePage - 1) * MOBILE_PAGE_SIZE, safeMobilePage * MOBILE_PAGE_SIZE)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await loaiTaiSanApi.getAll()
      setData(response.data)
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditingId(record.loaitaisanId)
    form.setFieldsValue({
      tenloai: record.tenloai
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await loaiTaiSanApi.delete(id)
      message.success('Xóa loại tài sản thành công')
      fetchData()
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể xóa loại tài sản')
    }
  }

  const handleSubmit = async (values) => {
    try {
      if (editingId) {
        await loaiTaiSanApi.update(editingId, values)
        message.success('Cập nhật loại tài sản thành công')
      } else {
        await loaiTaiSanApi.create(values)
        message.success('Thêm loại tài sản thành công')
      }
      setIsModalOpen(false)
      form.resetFields()
      fetchData()
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  const handleConfirmDelete = (record) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa loại tài sản này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => handleDelete(record.loaitaisanId),
    })
  }

  const actionMenuItems = (record) => [
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
      title: 'ID',
      dataIndex: 'loaitaisanId',
      key: 'loaitaisanId',
      width: 80,
    },
    {
      title: 'Tên loại tài sản',
      dataIndex: 'tenloai',
      key: 'tenloai',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-',
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-',
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
      title="Quản lý Loại Tài Sản"
      extra={!isMobile && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Thêm loại tài sản
        </Button>
      )}
      styles={{ body: { padding: isMobile ? 12 : 24 } }}
    >
      {isMobile && (
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} block style={{ marginBottom: 12 }}>
          Thêm loại tài sản
        </Button>
      )}

      {isMobile ? (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin />
            </div>
          ) : data.length === 0 ? (
            <Empty description="Không có loại tài sản" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mobileData.map((record) => (
                <Card key={record.loaitaisanId} size="small">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 500 }}>{record.tenloai}</div>
                      <div style={{ fontSize: 12, color: '#888' }}>ID: {record.loaitaisanId}</div>
                    </div>
                    <Dropdown
                      menu={{ items: actionMenuItems(record) }}
                      trigger={['click']}
                      placement="bottomRight"
                    >
                      <Button type="text" icon={<EllipsisOutlined />} />
                    </Dropdown>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 12, color: '#888' }}>
                    <div>Ngày tạo: {record.createdAt ? dayjs(record.createdAt).format('DD/MM/YYYY HH:mm') : '—'}</div>
                    <div>Ngày cập nhật: {record.updatedAt ? dayjs(record.updatedAt).format('DD/MM/YYYY HH:mm') : '—'}</div>
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
            Tổng {data.length} loại tài sản
          </div>
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={data}
          rowKey="loaitaisanId"
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} loại tài sản`,
          }}
        />
      )}

      <Modal
        title={editingId ? 'Cập nhật loại tài sản' : 'Thêm loại tài sản'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        width={isMobile ? '100%' : 520}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="tenloai"
            label="Tên loại tài sản"
            rules={[
              { required: true, message: 'Vui lòng nhập tên loại tài sản' },
              { max: 100, message: 'Tên loại tài sản không được quá 100 ký tự' },
            ]}
          >
            <Input placeholder="Nhập tên loại tài sản" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setIsModalOpen(false)
                form.resetFields()
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingId ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default LoaiTaiSan
