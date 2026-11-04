import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Descriptions, Spin, message, Tabs } from 'antd'
import taisanApi from '../../api/taisanApi'
import StatusTag from '../../components/StatusTag'
import QrImage from '../../components/QrImage'
import { formatCurrency, formatDate } from '../../utils/format'

const TaiSanDetail = () => {
  const { id } = useParams()
  const [taisan, setTaisan] = useState(null)
  const [lichsu, setLichsu] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [taisanData, lichsuData] = await Promise.all([
          taisanApi.getById(id),
          taisanApi.getLichSu(id),
        ])
        setTaisan(taisanData)
        setLichsu(lichsuData)
      } catch (error) {
        message.error('Không thể tải thông tin tài sản')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) {
    return <Spin size="large" />
  }

  if (!taisan) {
    return <div>Không tìm thấy tài sản</div>
  }

  const items = [
    {
      key: 'thongtin',
      label: 'Thông tin',
      children: (
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Mã tài sản">{taisan.mataisan}</Descriptions.Item>
          <Descriptions.Item label="Tên tài sản">{taisan.tentaisan}</Descriptions.Item>
          <Descriptions.Item label="Loại">{taisan.tenloai}</Descriptions.Item>
          <Descriptions.Item label="Đơn vị">{taisan.tendonvi || 'Chưa có'}</Descriptions.Item>
          <Descriptions.Item label="Vị trí">{taisan.tenvitri || 'Chưa có'}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <StatusTag status={taisan.tentrangthai} />
          </Descriptions.Item>
          <Descriptions.Item label="Giá trị">
            {formatCurrency(taisan.giatri)}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày nhập">
            {formatDate(taisan.ngaymua)}
          </Descriptions.Item>
          <Descriptions.Item label="Thông số kỹ thuật" span={2}>
            {taisan.thongsokythuat || 'Không có'}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'qrcode',
      label: 'Mã QR',
      children: <QrImage taisanId={id} />,
    },
    {
      key: 'lichsu',
      label: 'Lịch sử',
      children: (
        <div>
          {lichsu.length > 0 ? (
            lichsu.map((item, index) => (
              <Card key={index} style={{ marginBottom: 8 }}>
                <p><strong>{formatDate(item.ngayThucHien)}:</strong> {item.moTa}</p>
              </Card>
            ))
          ) : (
            <p>Chưa có lịch sử</p>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <h2>Chi tiết Tài sản</h2>
      <Tabs items={items} />
    </div>
  )
}

export default TaiSanDetail
