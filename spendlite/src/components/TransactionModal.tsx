import { useEffect } from 'react'
import { Button, DatePicker, Form, Input, InputNumber, Modal, Select, Typography, } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import type { TransactionFormValues } from '../schemas/transactionSchema'

type FormValues = Omit<TransactionFormValues, 'date'> & {
    date: Dayjs
}

type Props = {
    open: boolean
    saving: boolean
    onClose: () => void
    onSubmit: (values: FormValues) => void
}

const categories = ['Food', 'Transport', 'Shopping', 'Utilities', 'Lifestyle', 'Health', 'Education', 'Salary', 'Freelance', 'Other',]

export default function TransactionModal({ open, saving, onClose, onSubmit, }: Props) {
    const [form] = Form.useForm<FormValues>()

    useEffect(() => {
        if (open) {
            form.setFieldsValue({
                type: 'expense',
                date: dayjs(),
            })
        }
    }, [open, form])

    return (
        <Modal
            title="Add transaction"
            open={open}
            onCancel={onClose}
            footer={null}
            destroyOnHidden
        >
            <Typography.Paragraph type="secondary">
                Enter the details of your income or expense.
            </Typography.Paragraph>

            <Form<FormValues>
                form={form}
                layout="vertical"
                onFinish={onSubmit}
                requiredMark="optional"
                initialValues={{
                    type: 'expense',
                    date: dayjs(),
                }}
            >
                <Form.Item
                    label="Transaction type"
                    name="type"
                    rules={[{ required: true, message: 'Select a transaction type' }]}
                >
                    <Select
                        options={[
                            { label: 'Expense', value: 'expense' },
                            { label: 'Income', value: 'income' },
                        ]}
                    />
                </Form.Item>

                <Form.Item
                    label="Description"
                    name="description"
                    rules={[
                        { required: true, message: 'Enter a description' },
                        { min: 2, message: 'Enter at least 2 characters' },
                        { max: 100, message: 'Maximum 100 characters' },
                    ]}
                >
                    <Input placeholder="e.g. Grocery shopping" maxLength={100} />
                </Form.Item>

                <Form.Item
                    label="Amount (INR)"
                    name="amount"
                    rules={[
                        { required: true, message: 'Enter an amount' },
                        {
                            type: 'number',
                            min: 0.01,
                            message: 'Amount must be greater than zero',
                        },
                    ]}
                >
                    <InputNumber<number>
                        className="w-full"
                        min={0.01}
                        precision={2}
                        placeholder="Enter amount"
                        formatter={(value) =>
                            value == null
                                ? ''
                                : `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                        }
                        parser={(value) =>
                            Number((value ?? '').replace(/[₹,\s]/g, ''))
                        }
                    />
                </Form.Item>

                <Form.Item
                    label="Category"
                    name="category"
                    rules={[{ required: true, message: 'Select a category' }]}
                >
                    <Select
                        placeholder="Choose a category"
                        options={categories.map((category) => ({
                            label: category,
                            value: category,
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    label="Date"
                    name="date"
                    rules={[{ required: true, message: 'Select a date' }]}
                >
                    <DatePicker
                        className="w-full"
                        format="DD MMM YYYY"
                        disabledDate={(date) => date.isAfter(dayjs(), 'day')}
                    />
                </Form.Item>

                <div className="flex justify-end gap-2">
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="primary" htmlType="submit" loading={saving}>
                        Save transaction
                    </Button>
                </div>
            </Form>
        </Modal>
    )
}