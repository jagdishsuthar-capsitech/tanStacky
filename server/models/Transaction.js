import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
    {
        type: { type: String, enum: ["expense", "income"], required: true, },
        description: { type: String, required: true, trim: true, minlength: 2, maxlength: 100, },
        amount: { type: Number, required: true, min: [Number.MIN_VALUE, "Amount must be greater than zero",], validate: { validator: Number.isFinite, message: "Enter a valid amount", }, },
        category: { type: String, required: true, trim: true, minlength: 1, },
        date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/, },
    }, { timestamps: true, }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
