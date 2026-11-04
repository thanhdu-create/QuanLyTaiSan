import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Space, message, Select, Dropdown, Grid, Empty, Pagination, Spin, Card } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EllipsisOutlined } from '@ant-design/icons'
import viTriApi from '../../../api/vitriApi'
import donviApi from '../../../api/donviApi'
import ModalTitleWithCode from '../../../components/ModalTitleWithCode'
import { generateAutoCode } from '../../../hooks/useAutoCode'
import dayjs from 'dayjs'

const ViTriTab = () => {
  const [data, setData] = useState([])
  const [donViList, setDonViList] = useState([])
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
    fetchDonVi()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await viTriApi.getAll()
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
      message.error('Không thể tải danh sách đơn vị')
    }
  }

  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    // Generate auto code when adding
    const newCode = generateAutoCode('VT')
    form.setFieldsValue({ mavitri: newCode })
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditingId(record.vitriId)
    form.setFieldsValue({
      mavitri: record.mavitri,
      tenvitri: record.tenvitri,
      donviId: record.donvi?.donviId,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await viTriApi.delete(id)
      message.success('Xóa vị trí thành công')
      fetchData()
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể xóa vị trí')
    }
  }

  const handleConfirmDelete = (record) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa vị trí "${record.tenvitri}"?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => handleDelete(record.vitriId),
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

  const handleSubmit = async (values) => {
    try {
      const payload = {
        mavitri: values.mavitri,
        tenvitri: values.tenvitri,
        donviId: values.donviId,
      }

      if (editingId) {
        await viTriApi.update(editingId, payload)
        message.success('Cập nhật vị trí thành công')
      } else {
        await viTriApi.create(payload)
        message.success('Thêm vị trí thành công')
      }
      setIsModalOpen(false)
      form.resetFields()
      fetchData()
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'vitriId',
      key: 'vitriId',
      width: 60,
      responsive: ['lg'],
    },
    {
      title: 'Mã vị trí',
      dataIndex: 'mavitri',
      key: 'mavitri',
      width: 120,
    },
    {
      title: 'Tên vị trí',
      dataIndex: 'tenvitri',
      key: 'tenvitri',
      ellipsis: true,
    },
    {
      title: 'Đơn vị',
      dataIndex: ['donvi', 'tendonvi'],
      key: 'donvi',
      width: 150,
      ellipsis: true,
      render: (text, record) => record.donvi?.tendonvi || '-',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      responsive: ['lg'],
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-',
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
    <>
      <div style={{ marginBottom: 16, textAlign: isMobile ? 'left' : 'right' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          block={isMobile}
        >
          Thêm vị trí
        </Button>
      </div>

      {isMobile ? (
        <>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin />
            </div>
          ) : mobileData.length === 0 ? (
            <Empty description="Chưa có vị trí nào" />
          ) : (
            mobileData.map((record) => (
              <Card
                key={record.vitriId}
                size="small"
                style={{ marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                styles={{ body: { padding: 12 } }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>
                    {record.tenvitri}
                  </div>
                  <Dropdown menu={{ items: actionMenuItems(record) }} trigger={['click']} placement="bottomRight">
                    <Button type="text" size="small" icon={<EllipsisOutlined />} />
                  </Dropdown>
                </div>
                <div style={{ marginTop: 8, fontSize: 13, color: '#595959', display: 'grid', gap: 4 }}>
                  <div><span style={{ color: '#8c8c8c' }}>Mã:</span> {record.mavitri}</div>
                  <div><span style={{ color: '#8c8c8c' }}>Đơn vị:</span> {record.donvi?.tendonvi || '-'}</div>
                  <div><span style={{ color: '#8c8c8c' }}>Ngày tạo:</span> {record.createdAt ? dayjs(record.createdAt).format('DD/MM/YYYY HH:mm') : '-'}</div>
                </div>
              </Card>
            ))
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <span style={{ fontSize: 13, color: '#8c8c8c' }}>Tổng {data.length} vị trí</span>
            <Pagination
              simple
              current={safeMobilePage}
              pageSize={MOBILE_PAGE_SIZE}
              total={data.length}
              onChange={setMobilePage}
            />
          </div>
        </>
      ) : (
        <Table
          columns={columns}
          dataSource={data}
          rowKey="vitriId"
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} vị trí`,
          }}
        />
      )}

      <Modal
        title={
          <ModalTitleWithCode
            title={editingId ? 'Cập nhật vị trí' : 'Thêm vị trí'}
            code={form.getFieldValue('mavitri')}
            codeLabel="Mã VT"
            isEditMode={!!editingId}
          />
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        footer={null}
        width={isMobile ? '100%' : 600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item name="mavitri" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            name="tenvitri"
            label="Tên vị trí"
            rules={[
              { required: true, message: 'Vui lòng nhập tên vị trí' },
              { max: 150, message: 'Tên vị trí không được quá 150 ký tự' },
            ]}
          >
            <Input placeholder="Nhập tên vị trí" />
          </Form.Item>

          <Form.Item
            name="donviId"
            label="Đơn vị"
            rules={[
              { required: true, message: 'Vui lòng chọn đơn vị' },
            ]}
          >
            <Select
              placeholder="Chọn đơn vị"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={donViList.map(item => ({
                value: item.donviId,
                label: `${item.madonvi} - ${item.tendonvi}`,
              }))}
            />
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
    </>
  )
}

export default ViTriTab
