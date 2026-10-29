import express from "express";
import { addTransaction, deleteTransaction, getTransaction, getTransactions, updateTransaction } from "../controllers/transactionController.js";

const transactionRouter = express.Router();

transactionRouter.get("/", getTransactions);
transactionRouter.get("/:id", getTransaction);
transactionRouter.post("/", addTransaction);
transactionRouter.put("/:id", updateTransaction);
transactionRouter.delete("/:id", deleteTransaction);

export default transactionRouter;
