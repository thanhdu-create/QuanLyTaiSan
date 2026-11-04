import { useState, useEffect } from 'react'
import { Tabs, Card, Grid } from 'antd'
import { ApartmentOutlined, EnvironmentOutlined } from '@ant-design/icons'
import DonViTab from './tabs/DonViTab'
import ViTriTab from './tabs/ViTriTab'

const DonViViTri = () => {
  const [activeTab, setActiveTab] = useState('donvi')
  const screens = Grid.useBreakpoint()
  // Phone: dưới breakpoint md (768px)
  const isMobile = screens.md === false

  const tabs = [
    {
      key: 'donvi',
      label: (
        <span>
          <ApartmentOutlined />
          Đơn vị
        </span>
      ),
      children: <DonViTab />,
    },
    {
      key: 'vitri',
      label: (
        <span>
          <EnvironmentOutlined />
          Vị trí
        </span>
      ),
      children: <ViTriTab />,
    },
  ]

  return (
    <Card
      title="Quản lý Đơn vị và Vị trí"
      styles={{ body: { padding: isMobile ? 12 : 24 } }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabs}
      />
    </Card>
  )
}

export default DonViViTri
