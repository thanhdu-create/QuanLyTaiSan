import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Space, message, Select, Segmented, Dropdown, Grid, Empty, Pagination, Spin, Card } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EllipsisOutlined, AppstoreOutlined, BankOutlined, ApartmentOutlined, HomeOutlined } from '@ant-design/icons'
import donviApi from '../../../api/donviApi'
import ModalTitleWithCode from '../../../components/ModalTitleWithCode'
import { generateAutoCode } from '../../../hooks/useAutoCode'
import dayjs from 'dayjs'

const DonViTab = () => {
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [capDonVi, setCapDonVi] = useState('ALL')
  const [form] = Form.useForm()

  const screens = Grid.useBreakpoint()
  // Phone: dưới breakpoint md (768px); tablet/desktop dùng bảng
  const isMobile = screens.md === false
  const [mobilePage, setMobilePage] = useState(1)
  const MOBILE_PAGE_SIZE = 10
  const mobileTotalPages = Math.max(1, Math.ceil(filteredData.length / MOBILE_PAGE_SIZE))
  const safeMobilePage = Math.min(mobilePage, mobileTotalPages)
  const mobileData = filteredData.slice((safeMobilePage - 1) * MOBILE_PAGE_SIZE, safeMobilePage * MOBILE_PAGE_SIZE)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterDataByCapDonVi()
  }, [capDonVi, data])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await donviApi.getAll()
      setData(response.data)
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const filterDataByCapDonVi = () => {
    let filtered = []
    
    // Helper function để xác định cấp độ của đơn vị
    const getCapDonVi = (donvi) => {
      if (!donvi.donviCha) {
        return 0 // Cấp trường
      }
      
      // Tìm đơn vị cha trong data để kiểm tra ông nội
      const cha = data.find(dv => dv.donviId === donvi.donviCha.donviId)
      if (!cha) {
        return 1 // Không tìm thấy cha, giả định là cấp khoa
      }
      
      if (!cha.donviCha) {
        return 1 // Cha không có cha => đây là cấp khoa
      }
      
      return 2 // Cha có cha => đây là cấp phòng ban
    }
    
    switch (capDonVi) {
      case 'ALL':
        filtered = data
        break
      case 'TRUONG':
        filtered = data.filter(dv => getCapDonVi(dv) === 0)
        break
      case 'KHOA':
        filtered = data.filter(dv => getCapDonVi(dv) === 1)
        break
      case 'PHONGBAN':
        filtered = data.filter(dv => getCapDonVi(dv) === 2)
        break
      default:
        filtered = data
    }
    
    setFilteredData(filtered)
    setMobilePage(1)
  }

  const handleCapDonViChange = (value) => {
    setCapDonVi(value)
    setMobilePage(1)
  }

  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    // Generate auto code when adding
    const newCode = generateAutoCode('DV')
    form.setFieldsValue({ madonvi: newCode })
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditingId(record.donviId)
    form.setFieldsValue({
      madonvi: record.madonvi,
      tendonvi: record.tendonvi,
      donvichaId: record.donviCha?.donviId,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await donviApi.delete(id)
      message.success('Xóa đơn vị thành công')
      fetchData()
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể xóa đơn vị')
    }
  }

  const handleConfirmDelete = (record) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa đơn vị "${record.tendonvi}"?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => handleDelete(record.donviId),
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
        madonvi: values.madonvi,
        tendonvi: values.tendonvi,
        donvichaId: values.donvichaId || null,
      }

      if (editingId) {
        await donviApi.update(editingId, payload)
        message.success('Cập nhật đơn vị thành công')
      } else {
        await donviApi.create(payload)
        message.success('Thêm đơn vị thành công')
      }
      setIsModalOpen(false)
      form.resetFields()
      fetchData()
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  // Filter out current editing item from parent selection
  const getParentOptions = () => {
    return data.filter(item => item.donviId !== editingId)
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'donviId',
      key: 'donviId',
      width: 60,
      responsive: ['lg'],
    },
    {
      title: 'Mã đơn vị',
      dataIndex: 'madonvi',
      key: 'madonvi',
      width: 120,
    },
    {
      title: 'Tên đơn vị',
      dataIndex: 'tendonvi',
      key: 'tendonvi',
      ellipsis: true,
    },
    {
      title: 'Đơn vị cha',
      dataIndex: ['donviCha', 'tendonvi'],
      key: 'donviCha',
      width: 150,
      ellipsis: true,
      render: (text) => text || '-',
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

  const capDonViOptions = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'TRUONG', label: 'Cấp Trường' },
    { value: 'KHOA', label: 'Cấp Khoa' },
    { value: 'PHONGBAN', label: 'Cấp Phòng ban' },
  ]

  return (
    <>
      <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }} size="middle">
        {isMobile ? (
          <>
            <Select
              value={capDonVi}
              onChange={handleCapDonViChange}
              options={capDonViOptions}
              style={{ width: '100%' }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              block
            >
              Thêm đơn vị
            </Button>
          </>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Segmented
              value={capDonVi}
              onChange={handleCapDonViChange}
              options={[
                {
                  label: (
                    <div style={{ padding: '4px 8px' }}>
                      <AppstoreOutlined style={{ marginRight: 6 }} />
                      Tất cả
                    </div>
                  ),
                  value: 'ALL',
                },
                {
                  label: (
                    <div style={{ padding: '4px 8px' }}>
                      <BankOutlined style={{ marginRight: 6 }} />
                      Cấp Trường
                    </div>
                  ),
                  value: 'TRUONG',
                },
                {
                  label: (
                    <div style={{ padding: '4px 8px' }}>
                      <ApartmentOutlined style={{ marginRight: 6 }} />
                      Cấp Khoa
                    </div>
                  ),
                  value: 'KHOA',
                },
                {
                  label: (
                    <div style={{ padding: '4px 8px' }}>
                      <HomeOutlined style={{ marginRight: 6 }} />
                      Cấp Phòng ban
                    </div>
                  ),
                  value: 'PHONGBAN',
                },
              ]}
            />

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Thêm đơn vị
            </Button>
          </div>
        )}

        <div style={{ fontSize: 14, color: '#8c8c8c' }}>
          Hiển thị: <strong>{filteredData.length}</strong> / {data.length} đơn vị
        </div>
      </Space>

      {isMobile ? (
        <>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin />
            </div>
          ) : mobileData.length === 0 ? (
            <Empty description="Chưa có đơn vị nào" />
          ) : (
            mobileData.map((record) => (
              <Card
                key={record.donviId}
                size="small"
                style={{ marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                styles={{ body: { padding: 12 } }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>
                    {record.tendonvi}
                  </div>
                  <Dropdown menu={{ items: actionMenuItems(record) }} trigger={['click']} placement="bottomRight">
                    <Button type="text" size="small" icon={<EllipsisOutlined />} />
                  </Dropdown>
                </div>
                <div style={{ marginTop: 8, fontSize: 13, color: '#595959', display: 'grid', gap: 4 }}>
                  <div><span style={{ color: '#8c8c8c' }}>Mã:</span> {record.madonvi}</div>
                  <div><span style={{ color: '#8c8c8c' }}>Đơn vị cha:</span> {record.donviCha?.tendonvi || '-'}</div>
                  <div><span style={{ color: '#8c8c8c' }}>Ngày tạo:</span> {record.createdAt ? dayjs(record.createdAt).format('DD/MM/YYYY HH:mm') : '-'}</div>
                </div>
              </Card>
            ))
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <span style={{ fontSize: 13, color: '#8c8c8c' }}>Tổng {filteredData.length} đơn vị</span>
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
          rowKey="donviId"
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đơn vị`,
          }}
        />
      )}

      <Modal
        title={
          <ModalTitleWithCode
            title={editingId ? 'Cập nhật đơn vị' : 'Thêm đơn vị'}
            code={form.getFieldValue('madonvi')}
            codeLabel="Mã ĐV"
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
          <Form.Item name="madonvi" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            name="tendonvi"
            label="Tên đơn vị"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đơn vị' },
              { max: 150, message: 'Tên đơn vị không được quá 150 ký tự' },
            ]}
          >
            <Input placeholder="Nhập tên đơn vị" />
          </Form.Item>

          <Form.Item
            name="donvichaId"
            label="Đơn vị cha"
          >
            <Select
              placeholder="Chọn đơn vị cha (không bắt buộc)"
              allowClear
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={getParentOptions().map(item => ({
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

export default DonViTab
