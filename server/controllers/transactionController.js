import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import { transactionSchema } from "../schemas/transactionSchema.js";

const formatTransaction = (transaction) => ({
  key: transaction._id.toString(),
  type: transaction.type,
  description: transaction.description,
  amount: transaction.amount,
  category: transaction.category,
  date: transaction.date,
});

const validateId = (id) =>
  mongoose.isValidObjectId(id) && /^[a-f\d]{24}$/i.test(id);

// GET /api/transactions
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({
      createdAt: -1,
    });

    res.status(200).json(transactions.map(formatTransaction));
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch transactions",
    });
  }
};

// GET /api/transactions/:id
export const getTransaction = async (req, res) => {
  try {
    if (!validateId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid transaction ID",
      });
    }

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.status(200).json(formatTransaction(transaction));
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch transaction",
    });
  }
};

// POST /api/transactions
export const addTransaction = async (req, res) => {
  const result = transactionSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  try {
    const transaction = await Transaction.create(result.data);

    res.status(201).json(formatTransaction(transaction));
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to create transaction",
    });
  }
};

// PUT /api/transactions/:id
export const updateTransaction = async (req, res) => {
  if (!validateId(req.params.id)) {
    return res.status(400).json({
      message: "Invalid transaction ID",
    });
  }

  const result = transactionSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      result.data,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.status(200).json(formatTransaction(transaction));
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to update transaction",
    });
  }
};

// DELETE /api/transactions/:id
export const deleteTransaction = async (req, res) => {
  if (!validateId(req.params.id)) {
    return res.status(400).json({
      message: "Invalid transaction ID",
    });
  }

  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      message: "Transaction deleted successfully",
      key: transaction._id.toString(),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete transaction",
    });
  }
};
