
import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { App, Button, Card, Col, DatePicker, Form, Input, InputNumber, Modal, Row, Select, Space, Statistic, Table, Tag, Typography } from 'antd'
import type { TableColumnsType } from 'antd'
import { ArrowDownOutlined, ArrowUpOutlined, MoonOutlined, PlusOutlined, SunOutlined, WalletOutlined, DeleteOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs, { type Dayjs } from 'dayjs'
import { z } from 'zod'
import { useThemeMode } from '../components/ThemeProvider'
import { getTransactions, addTransaction, deleteTransaction } from '../lib/transactions'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

const transactionSchema = z.object({
  type: z.enum(['expense', 'income']),
  description: z.string().trim().min(2, 'Description must contain at least 2 characters').max(100, 'Description cannot exceed 100 characters'),
  amount: z.number().positive('Amount must be greater than zero').finite('Enter a valid amount'),
  category: z.string().min(1, 'Please select a category'),
  date: z.string().min(1, 'Please select a date'),
})

type TransactionFormValues = {
  type: 'expense' | 'income'
  description: string
  amount: number
  category: string
  date: Dayjs
}

type Transaction = {
  key: string
  type: 'expense' | 'income'
  description: string
  amount: number
  category: string
  date: string
}

const money = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)

const formatDate = (date: string) => dayjs(date).format('DD MMM YYYY')

function Dashboard() {
  const { mode, toggleTheme } = useThemeMode()
  const { message, modal } = App.useApp()
  const queryClient = useQueryClient()
  const dark = mode === 'dark'

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm<TransactionFormValues>()

  const { data: transactions = [], isLoading, isError } = useQuery({
    queryKey: ['transactions'],
    queryFn: getTransactions,
  })

  const addMutation = useMutation({
    mutationFn: addTransaction,
    onSuccess: (updatedTransactions) => {
      queryClient.setQueryData(['transactions'], updatedTransactions)
      message.success('Transaction added successfully!')
      closeModal()
    },
    onError: () => {
      message.error('Could not save transaction. Please try again.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: (updatedTransactions) => {
      queryClient.setQueryData(['transactions'], updatedTransactions)
      message.success('Transaction deleted successfully!')
    },
    onError: () => {
      message.error('Could not delete transaction. Please try again.')
    },
  })

  const income = transactions
    .filter((item: Transaction) => item.type === 'income')
    .reduce((total: number, item: Transaction) => total + item.amount, 0)

  const expenses = transactions
    .filter((item: Transaction) => item.type === 'expense')
    .reduce((total: number, item: Transaction) => total + item.amount, 0)

  const balance = income - expenses

  function openModal() {
    form.resetFields()
    form.setFieldsValue({ type: 'expense', date: dayjs() })
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    form.resetFields()
  }

  function handleSubmit(values: TransactionFormValues) {
    const result = transactionSchema.safeParse({
      ...values,
      description: values.description,
      date: values.date?.format('YYYY-MM-DD') ?? '',
    })

    if (!result.success) {
      form.setFields(
        result.error.issues.map((issue) => ({
          name: issue.path[0] as keyof TransactionFormValues,
          errors: [issue.message],
        })),
      )
      return
    }

    addMutation.mutate(result.data)
  }

  function handleDelete(transaction: Transaction) {
    modal.confirm({
      title: 'Delete transaction?',
      content: `Are you sure you want to delete "${transaction.description}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => deleteMutation.mutate(transaction.key),
    })
  }

  const columns: TableColumnsType<Transaction> = [
    {
      title: 'Transaction',
      dataIndex: 'description',
      key: 'description',
      render: (description: string, record: Transaction) => (
        <Space>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${record.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
            {record.type === 'income' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          </div>
          <Typography.Text strong>{description}</Typography.Text>
        </Space>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string, record: Transaction) => <Tag color={record.type === 'income' ? 'green' : 'default'}>{category}</Tag>,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (amount: number, record: Transaction) => (
        <Typography.Text strong style={{ color: record.type === 'income' ? '#16a34a' : dark ? '#fb923c' : '#ea580c' }}>
          {record.type === 'income' ? '+' : '−'}{money(amount)}
        </Typography.Text>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: (_: unknown, record: Transaction) => (
        <Button danger type="text" icon={<DeleteOutlined />} aria-label={`Delete ${record.description}`} onClick={() => handleDelete(record)} />
      ),
    },
  ]

  return (
    <main className={`min-h-screen ${dark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-10">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Space size="middle">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-600 text-2xl text-white">
              <WalletOutlined />
            </div>
            <div>
              <Typography.Title level={3} style={{ margin: 0, color: 'inherit' }}>SpendLite</Typography.Title>
              <Typography.Text type="secondary">Your personal finance overview</Typography.Text>
            </div>
          </Space>

          <Space wrap>
            <Button icon={dark ? <SunOutlined /> : <MoonOutlined />} onClick={toggleTheme}>
              {dark ? 'Light mode' : 'Dark mode'}
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openModal}>
              Add transaction
            </Button>
          </Space>
        </header>

        <section className="mb-8">
          <Typography.Title level={2} style={{ color: 'inherit' }}>Dashboard</Typography.Title>
          <Typography.Paragraph type="secondary">Here's how your money is looking this month.</Typography.Paragraph>
        </section>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Card>
              <Statistic title="Total balance" value={balance} formatter={(value) => money(Number(value))} prefix={<WalletOutlined />} styles={{ content: { fontWeight: 700 } }} />
              <Typography.Text type="secondary">Income minus expenses</Typography.Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card>
              <Statistic title="Total income" value={income} formatter={(value) => money(Number(value))} prefix={<ArrowUpOutlined />} styles={{ content: { color: '#16a34a' } }} />
              <Typography.Text type="secondary">All recorded income</Typography.Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card>
              <Statistic title="Total expenses" value={expenses} formatter={(value) => money(Number(value))} prefix={<ArrowDownOutlined />} styles={{ content: { color: '#f97316' } }} />
              <Typography.Text type="secondary">All recorded expenses</Typography.Text>
            </Card>
          </Col>
        </Row>

        <section className="mt-8">
          <Card title="Recent transactions" extra={<Button type="primary" ghost onClick={openModal}><PlusOutlined /> Add new</Button>}>
            {isError ? (
              <Typography.Text type="danger">Could not load transactions. Please refresh the page.</Typography.Text>
            ) : (
              <Table<Transaction> columns={columns} dataSource={transactions} rowKey="key" loading={isLoading || addMutation.isPending || deleteMutation.isPending} pagination={{ pageSize: 5, showSizeChanger: false }} scroll={{ x: 650 }} locale={{ emptyText: 'No transactions yet. Add your first one!' }} />
            )}
          </Card>
        </section>

        <footer className="mt-8 text-center">
          <Typography.Text type="secondary">SpendLite · Spend smarter, live better.</Typography.Text>
        </footer>

        <Modal title="Add transaction" open={isModalOpen} onCancel={closeModal} footer={null} destroyOnHidden>
          <Typography.Paragraph type="secondary">Enter the details of your income or expense.</Typography.Paragraph>

          <Form<TransactionFormValues> form={form} layout="vertical" onFinish={handleSubmit} requiredMark="optional" initialValues={{ type: 'expense', date: dayjs() }}>
            <Form.Item label="Transaction type" name="type" rules={[{ required: true, message: 'Select a transaction type' }]}>
              <Select options={[{ label: 'Expense', value: 'expense' }, { label: 'Income', value: 'income' }]} />
            </Form.Item>

            <Form.Item label="Description" name="description" rules={[{ required: true, message: 'Enter a description' }, { min: 2, message: 'Enter at least 2 characters' }, { max: 100, message: 'Maximum 100 characters' }]}>
              <Input placeholder="e.g. Grocery shopping" maxLength={100} />
            </Form.Item>

            <Form.Item label="Amount (INR)" name="amount" rules={[{ required: true, message: 'Enter an amount' }, { type: 'number', min: 0.01, message: 'Amount must be greater than zero' }]}>
              <InputNumber<number> className="w-full" min={0.01} precision={2} placeholder="Enter amount" formatter={(value) => value == null ? '' : `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(value): number => Number((value ?? '').replace(/[₹,\s]/g, ''))} />
            </Form.Item>

            <Form.Item label="Category" name="category" rules={[{ required: true, message: 'Select a category' }]}>
              <Select placeholder="Choose a category" options={[{ label: 'Food', value: 'Food' }, { label: 'Transport', value: 'Transport' }, { label: 'Shopping', value: 'Shopping' }, { label: 'Utilities', value: 'Utilities' }, { label: 'Lifestyle', value: 'Lifestyle' }, { label: 'Health', value: 'Health' }, { label: 'Education', value: 'Education' }, { label: 'Salary', value: 'Salary' }, { label: 'Freelance', value: 'Freelance' }, { label: 'Other', value: 'Other' }]} />
            </Form.Item>

            <Form.Item label="Date" name="date" rules={[{ required: true, message: 'Select a date' }]}>
              <DatePicker className="w-full" format="DD MMM YYYY" disabledDate={(date) => date.isAfter(dayjs(), 'day')} />
            </Form.Item>

            <div className="flex justify-end gap-2">
              <Button onClick={closeModal}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={addMutation.isPending}>Save transaction</Button>
            </div>
          </Form>
        </Modal>
      </div>
    </main>
  )
}
