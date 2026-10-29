import { z } from "zod";

export const transactionSchema = z.object({
    type: z.enum(["expense", "income"]),

    description: z
        .string()
        .trim()
        .min(2, "Description must contain at least 2 characters")
        .max(100, "Description cannot exceed 100 characters"),

    amount: z
        .number({ error: "Please enter a valid amount" })
        .positive("Amount must be greater than zero")
        .finite("Enter a valid amount"),

    category: z
        .string()
        .trim()
        .min(1, "Please select a category"),

    date: z
        .string()
        .min(1, "Please select a date")
        .refine(
            (value) =>
                /^\d{4}-\d{2}-\d{2}$/.test(value) &&
                !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) &&
                new Date(`${value}T00:00:00Z`)
                    .toISOString()
                    .startsWith(value),
            "Please enter a valid date in YYYY-MM-DD format"
        ),
});
