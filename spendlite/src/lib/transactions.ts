import type { Transaction } from "../schemas/transactionSchema";

const API_URL = process.env.API_URL || "http://localhost:5000/api/transactions";

type TransactionInput = Omit<Transaction, "key">;

async function request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "API request failed");
    }

    return response.json() as Promise<T>;
}

export const getTransactions = () =>
    request<Transaction[]>(API_URL);

export const addTransaction = async (transaction: TransactionInput): Promise<Transaction[]> => {
    await request<Transaction>(API_URL, {
        method: "POST",
        body: JSON.stringify(transaction),
    });

    return getTransactions();
};

export const updateTransaction = async (key: string, transaction: TransactionInput): Promise<Transaction[]> => {
    await request<Transaction>(`${API_URL}/${key}`, {
        method: "PUT",
        body: JSON.stringify(transaction),
    });

    return getTransactions();
};

export const deleteTransaction = async (key: string): Promise<Transaction[]> => {
    await request<{ message: string }>(`${API_URL}/${key}`, {
        method: "DELETE",
    });

    return getTransactions();
};
