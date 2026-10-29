import { Button, Space, Table, Tag, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, } from '@ant-design/icons'
import dayjs from 'dayjs'
import type { Transaction } from '../schemas/transactionSchema'

type Props = {
    transactions: Transaction[]
    dark: boolean
    loading: boolean
    onDelete: (transaction: Transaction) => void
}

const money = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount)

export default function TransactionTable({ transactions, dark, loading, onDelete, }: Props) {
    const columns: TableColumnsType<Transaction> = [
        {
            title: 'Transaction',
            dataIndex: 'description',
            key: 'description',
            render: (description, record) => (
                <Space>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${record.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {record.type === 'income' ? (
                            <ArrowUpOutlined />
                        ) : (
                            <ArrowDownOutlined />
                        )}
                    </div>
                    <Typography.Text strong>{description}</Typography.Text>
                </Space >
            ),
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (category, record) => (
                <Tag color={record.type === 'income' ? 'green' : 'default'}>
                    {category}
                </Tag>
            ),
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date: string) =>
                dayjs(date).isValid()
                    ? dayjs(date).format('DD MMM YYYY')
                    : 'Invalid date',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right',
            render: (amount: number, record) => (
                <Typography.Text strong style={{ color: record.type === 'income' ? '#16a34a' : dark ? '#fb923c' : '#ea580c', }}>
                    {record.type === 'income' ? '+' : '−'}
                    {money(amount)}
                </Typography.Text>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            align: 'right',
            render: (_value, record) => (
                <Button
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    aria-label={`Delete ${record.description}`}
                    onClick={() => onDelete(record)}
                />
            ),
        },
    ]

    return (
        <Table<Transaction>
            columns={columns}
            dataSource={transactions}
            rowKey="key"
            loading={loading}
            pagination={{
                pageSize: 5,
                showSizeChanger: false,
            }}
            scroll={{ x: 650 }}
            locale={{
                emptyText: 'No transactions yet. Add your first one!',
            }}
        />
    )
}