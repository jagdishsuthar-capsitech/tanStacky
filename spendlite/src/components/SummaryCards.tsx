import { Card, Col, Row, Statistic, Typography } from 'antd'
import { ArrowDownOutlined, ArrowUpOutlined, WalletOutlined, } from '@ant-design/icons'

type Props = {
    income: number
    expenses: number
    balance: number
}

const money = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount)

export default function SummaryCards({ income, expenses, balance, }: Props) {
    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={8}>
                <Card>
                    <Statistic
                        title="Total balance"
                        value={balance}
                        formatter={(value) => money(Number(value))}
                        prefix={<WalletOutlined />}
                        styles={{
                            content: {
                                fontWeight: 700,
                                color: balance < 0 ? '#ef4444' : undefined,
                            },
                        }}
                    />
                    <Typography.Text type="secondary">
                        Income minus expenses
                    </Typography.Text>
                </Card>
            </Col>

            <Col xs={24} sm={12} lg={8}>
                <Card>
                    <Statistic
                        title="Total income"
                        value={income}
                        formatter={(value) => money(Number(value))}
                        prefix={<ArrowUpOutlined />}
                        styles={{ content: { color: '#16a34a' } }}
                    />
                    <Typography.Text type="secondary">
                        All recorded income
                    </Typography.Text>
                </Card>
            </Col>

            <Col xs={24} sm={12} lg={8}>
                <Card>
                    <Statistic
                        title="Total expenses"
                        value={expenses}
                        formatter={(value) => money(Number(value))}
                        prefix={<ArrowDownOutlined />}
                        styles={{ content: { color: '#f97316' } }}
                    />
                    <Typography.Text type="secondary">
                        All recorded expenses
                    </Typography.Text>
                </Card>
            </Col>
        </Row>
    )
}