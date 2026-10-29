import { Button, Space, Typography } from 'antd'
import { MoonOutlined, PlusOutlined, SunOutlined, WalletOutlined, } from '@ant-design/icons'

type Props = {
    dark: boolean
    onToggleTheme: () => void
    onAddTransaction: () => void
}

export default function DashboardHeader({ dark, onToggleTheme, onAddTransaction, }: Props) {
    return (
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <Space size="middle">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-600 text-2xl text-white">
                    <WalletOutlined />
                </div>

                <div>
                    <Typography.Title level={3} style={{ margin: 0 }}>
                        SpendLite
                    </Typography.Title>
                    <Typography.Text type="secondary">
                        Your personal finance overview
                    </Typography.Text>
                </div>
            </Space>

            <Space wrap>
                <Button icon={dark ? <SunOutlined /> : <MoonOutlined />} onClick={onToggleTheme}>
                    {dark ? 'Light mode' : 'Dark mode'}
                </Button>

                <Button type="primary" icon={<PlusOutlined />} onClick={onAddTransaction}>
                    Add transaction
                </Button>
            </Space>
        </header>
    )
}