import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Form, Input, InputNumber, DatePicker, Select, Button, Card, message } from 'antd'
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import taisanApi from '../../api/taisanApi'
import loaiTaiSanApi from '../../api/loaiTaiSanApi'
import donViApi from '../../api/donviApi'
import viTriApi from '../../api/vitriApi'
import trangThaiApi from '../../api/trangthaiApi'
import dayjs from 'dayjs'

const { TextArea } = Input

const TaiSanForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [loaiTaiSanList, setLoaiTaiSanList] = useState([])
  const [donViList, setDonViList] = useState([])
  const [viTriList, setViTriList] = useState([])
  const [allViTriList, setAllViTriList] = useState([])
  const [trangThaiList, setTrangThaiList] = useState([])
  const [allTaiSan, setAllTaiSan] = useState([])
  const [autoMaTaiSan, setAutoMaTaiSan] = useState('')

  const isEditMode = !!id

  // Generate auto asset code for new assets
  useEffect(() => {
    if (!isEditMode) {
      const fetchAllAssets = async () => {
        try {
          const response = await taisanApi.getAll()
          setAllTaiSan(response)
          const nextCode = generateAssetCode(response)
          setAutoMaTaiSan(nextCode)
          form.setFieldValue('mataisan', nextCode)
        } catch (error) {
          console.error('Không thể tải danh sách tài sản:', error)
        }
      }
      fetchAllAssets()
    }
  }, [isEditMode, form])

  const generateAssetCode = (data) => {
    if (!data || data.length === 0) {
      return 'TS-0001'
    }
    
    // Find the highest number from existing asset codes
    const numbers = data
      .map(item => {
        const match = item.mataisan?.match(/TS-(\d+)/)
        return match ? parseInt(match[1]) : 0
      })
      .filter(num => num > 0)
    
    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0
    const nextNumber = maxNumber + 1
    
    return `TS-${String(nextNumber).padStart(4, '0')}`
  }

  // Load danh sách dropdown
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [loaiTaiSan, donVi, viTri, trangThai] = await Promise.all([
          loaiTaiSanApi.getAll(),
          donViApi.getAll(),
          viTriApi.getAll(),
          trangThaiApi.getAll(),
        ])
        setLoaiTaiSanList(loaiTaiSan)
        setDonViList(donVi)
        setAllViTriList(viTri)
        setViTriList(viTri)
        setTrangThaiList(trangThai)
      } catch (error) {
        message.error('Không thể tải dữ liệu danh mục')
      }
    }

    fetchDropdownData()
  }, [])

  // Load dữ liệu tài sản khi edit
  useEffect(() => {
    if (isEditMode) {
      const fetchTaiSan = async () => {
        try {
          setLoading(true)
          const data = await taisanApi.getById(id)
          form.setFieldsValue({
            mataisan: data.mataisan,
            tentaisan: data.tentaisan,
            loaitaisanId: data.loaitaisanId,
            thongsokythuat: data.thongsokythuat,
            ngaymua: data.ngaymua ? dayjs(data.ngaymua) : null,
            giatri: data.giatri,
            donviId: data.donviId,
            vitriId: data.vitriId,
            trangthaitaisanId: data.trangthaitaisanId,
          })
          
          // Filter vị trí theo đơn vị
          if (data.donviId) {
            const filteredViTri = allViTriList.filter(
              vt => vt.donvi?.donviId === data.donviId
            )
            setViTriList(filteredViTri)
          }
        } catch (error) {
          message.error('Không thể tải thông tin tài sản')
        } finally {
          setLoading(false)
        }
      }

      fetchTaiSan()
    }
  }, [id, isEditMode, form, allViTriList])

  // Khi chọn đơn vị, filter vị trí
  const handleDonViChange = (donviId) => {
    form.setFieldValue('vitriId', null)
    if (donviId) {
      const filteredViTri = allViTriList.filter(
        vt => vt.donvi?.donviId === donviId
      )
      setViTriList(filteredViTri)
    } else {
      setViTriList(allViTriList)
    }
  }

  const handleSubmit = async (values) => {
    try {
      setLoading(true)
      const payload = {
        ...values,
        ngaymua: values.ngaymua ? values.ngaymua.format('YYYY-MM-DD') : null,
      }
      
      // Remove donviId vì backend không cần field này
      delete payload.donviId

      if (isEditMode) {
        await taisanApi.update(id, payload)
        message.success('Cập nhật tài sản thành công')
      } else {
        await taisanApi.create(payload)
        message.success('Thêm tài sản thành công')
      }
      navigate('/taisan')
    } catch (error) {
      message.error(isEditMode ? 'Cập nhật thất bại' : 'Thêm mới thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{isEditMode ? 'Sửa Tài sản' : 'Thêm Tài sản mới'}</span>
          {!isEditMode && autoMaTaiSan && (
            <span style={{ fontSize: 14, fontWeight: 'normal', color: '#1890ff' }}>
              Mã TS: {autoMaTaiSan}
            </span>
          )}
        </div>
      }
      extra={
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/taisan')}>
          Quay lại
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        {/* Hidden field for auto-generated mataisan */}
        <Form.Item name="mataisan" hidden>
          <Input />
        </Form.Item>

        <Form.Item
          label="Tên tài sản"
          name="tentaisan"
          rules={[
            { required: true, message: 'Vui lòng nhập tên tài sản' },
            { max: 200, message: 'Tên tài sản không quá 200 ký tự' },
          ]}
        >
          <Input placeholder="Nhập tên tài sản" />
        </Form.Item>

        <Form.Item
          label="Loại tài sản"
          name="loaitaisanId"
          rules={[{ required: true, message: 'Vui lòng chọn loại tài sản' }]}
        >
          <Select placeholder="Chọn loại tài sản" allowClear>
            {loaiTaiSanList.map((loai) => (
              <Select.Option key={loai.loaitaisanId} value={loai.loaitaisanId}>
                {loai.tenloai}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Đơn vị"
          name="donviId"
        >
          <Select 
            placeholder="Chọn đơn vị" 
            allowClear
            onChange={handleDonViChange}
          >
            {donViList.map((donvi) => (
              <Select.Option key={donvi.donviId} value={donvi.donviId}>
                {donvi.tendonvi}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Vị trí"
          name="vitriId"
        >
          <Select placeholder="Chọn vị trí" allowClear>
            {viTriList.map((vitri) => (
              <Select.Option key={vitri.vitriId} value={vitri.vitriId}>
                {vitri.tenvitri}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Trạng thái"
          name="trangthaitaisanId"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
        >
          <Select placeholder="Chọn trạng thái" allowClear>
            {trangThaiList.map((tt) => (
              <Select.Option key={tt.trangthaitaisanId} value={tt.trangthaitaisanId}>
                {tt.tentrangthai}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Ngày nhập"
          name="ngaymua"
          rules={[{ required: true, message: 'Vui lòng chọn ngày nhập' }]}
        >
          <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Giá trị (VNĐ)"
          name="giatri"
          rules={[
            { required: true, message: 'Vui lòng nhập giá trị' },
            { type: 'number', min: 0, message: 'Giá trị phải lớn hơn hoặc bằng 0' },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Nhập giá trị"
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item
          label="Thông số kỹ thuật"
          name="thongsokythuat"
        >
          <TextArea rows={4} placeholder="Nhập thông số kỹ thuật" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={loading}
            size="large"
          >
            {isEditMode ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default TaiSanForm
