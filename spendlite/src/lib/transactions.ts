import { z } from 'zod'
import type { Transaction } from '../schemas/transactionSchema'

const transactionSchema = z.object({
    key: z.string(),
    type: z.enum(['expense', 'income']),
    description: z.string(),
    amount: z.number().positive().finite(),
    category: z.string(),
    date: z.string(),
})

const STORAGE_KEY = 'spendlite-transactions'

function isBrowser() {
    return typeof window !== 'undefined'
}

export function getTransactions(): Transaction[] {
    if (!isBrowser()) return []

    try {
        const stored = localStorage.getItem(STORAGE_KEY)

        if (!stored) return []

        const parsed: unknown = JSON.parse(stored)
        const result = z.array(transactionSchema).safeParse(parsed)

        return result.success ? result.data : []
    } catch {
        return []
    }
}

export async function addTransaction(transaction: Omit<Transaction, 'key'>,): Promise<Transaction[]> {
    const transactions = getTransactions()

    const newTransaction: Transaction = {
        ...transaction,
        key: crypto.randomUUID(),
    }

    const updated = [newTransaction, ...transactions]

    if (isBrowser()) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    }

    return updated
}

export async function updateTransaction(key: string, transaction: Omit<Transaction, 'key'>,): Promise<Transaction[]> {
    const transactions = getTransactions()

    const updated = transactions.map((item) =>
        item.key === key
            ? { ...transaction, key: item.key }
            : item,
    )

    if (isBrowser()) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    }

    return updated
}

export async function deleteTransaction(key: string,): Promise<Transaction[]> {
    const updated = getTransactions().filter(
        (transaction) => transaction.key !== key,
    )

    if (isBrowser()) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    }

    return updated
}