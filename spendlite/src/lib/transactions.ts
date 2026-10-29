import { z } from 'zod'

const transactionSchema = z.object({
    key: z.string(),
    type: z.enum(['expense', 'income']),
    description: z.string(),
    amount: z.number().positive(),
    category: z.string(),
    date: z.string(),
})

export type Transaction = z.infer<typeof transactionSchema>

const STORAGE_KEY = 'spendlite-transactions'

// store data here
const initialTransactions: Transaction[] = []

function isBrowser() {
    return typeof window !== 'undefined'
}

export function getTransactions(): Transaction[] {
    if (!isBrowser()) return []

    try {
        const stored = localStorage.getItem(STORAGE_KEY)

        if (stored === null) {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(initialTransactions),
            )
            return initialTransactions
        }

        const parsed: unknown = JSON.parse(stored)
        const result = z.array(transactionSchema).safeParse(parsed)

        return result.success ? result.data : []
    } catch {
        return []
    }
}

export async function addTransaction(
    transaction: Omit<Transaction, 'key'>,
): Promise<Transaction[]> {
    const transactions = getTransactions()

    const newTransaction: Transaction = {
        ...transaction,
        key: crypto.randomUUID(),
    }

    const updated = [newTransaction, ...transactions]

    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    }

    return updated
}

export async function deleteTransaction(
    key: string,
): Promise<Transaction[]> {
    const updated = getTransactions().filter(
        (transaction) => transaction.key !== key,
    )

    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    }

    return updated
}