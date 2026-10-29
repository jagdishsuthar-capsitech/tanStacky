import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { App, Button, Card, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useThemeMode } from '../components/ThemeProvider'
import DashboardHeader from '../components/DashboardHeader'
import SummaryCards from '../components/SummaryCards'
import TransactionTable from '../components/TransactionTable'
import TransactionModal from '../components/TransactionModal'
import { getTransactions, addTransaction, deleteTransaction, } from '../lib/transactions'
import { transactionSchema } from '../schemas/transactionSchema'
import type { Transaction } from '../schemas/transactionSchema'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

function Dashboard() {
  const { mode, toggleTheme } = useThemeMode()
  const { message, modal } = App.useApp()
  const queryClient = useQueryClient()
  const dark = mode === 'dark'

  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: transactions = [], isLoading, isError } = useQuery({
    queryKey: ['transactions'],
    queryFn: getTransactions,
  })

  const addMutation = useMutation({
    mutationFn: addTransaction,
    onSuccess: (updatedTransactions) => {
      queryClient.setQueryData(['transactions'], updatedTransactions)
      message.success('Transaction added successfully!')
      setIsModalOpen(false)
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
    .filter((item) => item.type === 'income')
    .reduce((total, item) => total + item.amount, 0)

  const expenses = transactions
    .filter((item) => item.type === 'expense')
    .reduce((total, item) => total + item.amount, 0)

  const balance = income - expenses

  function handleSubmit(values: {
    type: 'expense' | 'income'
    description: string
    amount: number
    category: string
    date: import('dayjs').Dayjs
  }) {
    const result = transactionSchema.safeParse({
      ...values,
      description: values.description.trim(),
      date: values.date?.format('YYYY-MM-DD') ?? '',
    })

    if (!result.success) {
      message.error(result.error.issues[0]?.message ?? 'Invalid transaction')
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

  return (
    <main className={`min-h-screen ${dark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-10">
        <DashboardHeader
          dark={dark}
          onToggleTheme={toggleTheme}
          onAddTransaction={() => setIsModalOpen(true)}
        />

        <section className="mb-8">
          <Typography.Title level={2}>Dashboard</Typography.Title>
          <Typography.Paragraph type="secondary">
            Here's how your money is looking.
          </Typography.Paragraph>
        </section>

        <SummaryCards
          income={income}
          expenses={expenses}
          balance={balance}
        />

        <section className="mt-8">
          <Card
            title="Recent transactions"
            extra={
              <Button
                type="primary"
                ghost
                icon={<PlusOutlined />}
                onClick={() => setIsModalOpen(true)}
              >
                Add new
              </Button>
            }
          >
            {isError ? (
              <Typography.Text type="danger">
                Could not load transactions. Please refresh the page.
              </Typography.Text>
            ) : (
              <TransactionTable
                transactions={transactions}
                dark={dark}
                loading={
                  isLoading ||
                  addMutation.isPending ||
                  deleteMutation.isPending
                }
                onDelete={handleDelete}
              />
            )}
          </Card>
        </section>

        <footer className="mt-8 text-center">
          <Typography.Text type="secondary">
            SpendLite · Spend smarter, live better.
          </Typography.Text>
        </footer>

        <TransactionModal
          open={isModalOpen}
          saving={addMutation.isPending}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
        />
      </div>
    </main>
  )
}