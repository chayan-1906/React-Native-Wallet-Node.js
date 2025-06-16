import {Request, Response} from "express";
import {ApiResponse} from "../utils/ApiResponse";
import {sql} from "../config/db";
import {generateInvalidCode, generateMissingCode, generateNotFoundCode} from "../utils/generateErrorCodes";

const createTransactionController = async (req: Request, res: Response) => {
    try {
        const {userId, title, amount, category}: { userId: number, title: string, amount: number, category: 'expense' | 'income' } = req.body;

        if (!userId) {
            return res.status(400).send(new ApiResponse({
                success: false,
                errorCode: generateMissingCode('userId'),
                errorMsg: 'User ID is missing',
            }));
        }
        if (!title) {
            return res.status(400).send(new ApiResponse({
                success: false,
                errorCode: generateMissingCode('title'),
                errorMsg: 'Title is missing',
            }));
        }
        if (amount === undefined) {
            return res.status(400).send(new ApiResponse({
                success: false,
                errorCode: generateMissingCode('amount'),
                errorMsg: 'Amount is missing',
            }));
        }
        if (!category) {
            return res.status(400).send(new ApiResponse({
                success: false,
                errorCode: generateMissingCode('category'),
                errorMsg: 'Category is missing',
            }));
        }

        const calculatedAmount: number = category === 'expense' ? -Math.abs(amount) : Math.abs(amount);

        const transaction = await sql`
            INSERT INTO transactions(user_id, title, amount, category)
            VALUES (${userId}, ${title}, ${calculatedAmount}, ${category}) RETURNING *
        `;
        console.log('transaction created:'.green.bold, transaction[0]);

        return res.status(201).send(new ApiResponse({
            success: true,
            message: 'Transaction created',
            transaction: {
                ...transaction[0],
                amount: Math.abs(transaction[0].amount),
            },
        }));
    } catch (error: any) {
        console.error('Error inside createTransactionController:'.red.bold, error);
        res.status(500).send(new ApiResponse({
            success: false,
            error,
            errorMsg: 'Something went wrong',
        }));
    }
}

const createMultipleTransactionController = async (req: Request, res: Response) => {
    try {
        const {transactions}: { transactions: { userId: number, title: string, amount: number, category: 'income' | 'expense' }[] } = req.body;

        if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
            return res.status(400).send(new ApiResponse({
                success: false,
                errorCode: generateMissingCode('transactions'),
                errorMsg: 'Transactions array is missing or empty',
            }));
        }

        for (let i = 0; i < transactions.length; i++) {
            const {userId, title, amount, category} = transactions[i];
            if (!userId) {
                return res.status(400).send(new ApiResponse({
                    success: false,
                    errorCode: generateMissingCode(`transactions[${i}].userId`),
                    errorMsg: `Transaction #${i + 1}: userId is missing`,
                }));
            }
            if (!title) {
                return res.status(400).send(new ApiResponse({
                    success: false,
                    errorCode: generateMissingCode(`transactions[${i}].title`),
                    errorMsg: `Transaction #${i + 1}: title is missing`,
                }));
            }
            if (amount === undefined || amount === 0) {
                return res.status(400).send(new ApiResponse({
                    success: false,
                    errorCode: generateMissingCode(`transactions[${i}].amount`),
                    errorMsg: `Transaction #${i + 1}: amount is missing or zero`,
                }));
            }
            if (!category) {
                return res.status(400).send(new ApiResponse({
                    success: false,
                    errorCode: generateMissingCode(`transactions[${i}].category`),
                    errorMsg: `Transaction #${i + 1}: category is missing`,
                }));
            }
        }
        const payload = transactions.map(tx => ({
            user_id: tx.userId!,
            title: tx.title!,
            amount: tx.category === 'expense' ? -Math.abs(tx.amount!) : Math.abs(tx.amount!),
            category: tx.category!,
        }));

        const insertedRows = await sql`
            INSERT INTO transactions (user_id, title, amount, category)
            SELECT t.user_id,
                   t.title,
                   t.amount,
                   t.category
            FROM json_populate_recordset(NULL::transactions, ${JSON.stringify(payload)}::json) AS t RETURNING *;
        `;

        const sanitized = insertedRows.map(r => ({
            ...r,
            amount: Math.abs(r.amount),
        }));

        return res.status(201).send(new ApiResponse({
            success: true,
            message: `${sanitized.length} transactions created`,
            transactions: sanitized,
        }));
    } catch (error: any) {
        console.error('Error inside createMultipleTransactionController:'.red.bold, error);
        return res.status(500).send(new ApiResponse({
            success: false,
            error,
            errorMsg: 'Something went wrong while creating multiple transactions',
        }));
    }
};

const getAllTransactionsController = async (req: Request, res: Response) => {
    try {
        const {userId} = req.query;
        if (!userId) {
            return res.status(400).send(new ApiResponse({
                success: false,
                errorCode: generateMissingCode('userId'),
                errorMsg: 'User ID is missing',
            }));
        }

        const transactions = await sql`
            SELECT *
            FROM transactions
            WHERE user_id = ${userId}
            ORDER BY created_at
        `;

        res.status(200).send(new ApiResponse({
            success: true,
            message: 'Transactions fetched',
            transactions,
        }));
    } catch (error: any) {
        console.error('Error inside getAllTransactionsController:'.red.bold, error);
        res.status(500).send(new ApiResponse({
            success: false,
            error,
            errorMsg: 'Something went wrong',
        }));
    }
}

const deleteTransactionController = async (req: Request, res: Response) => {
    try {
        const {transactionId} = req.query;
        if (!transactionId) {
            return res.status(400).send(new ApiResponse({
                success: false,
                errorCode: generateMissingCode('transactionId'),
                errorMsg: 'Transaction ID is missing',
            }));
        }
        if (isNaN(parseInt(<string>transactionId))) {
            return res.status(400).send(new ApiResponse({
                success: false,
                errorCode: generateInvalidCode('transactionId'),
                errorMsg: 'Transaction ID must be a number',
            }));
        }

        const deletedTransaction = await sql`
            DELETE
            FROM transactions
            WHERE id = ${transactionId} RETURNING *
        `;
        if (deletedTransaction.length === 0) {
            return res.status(404).send(new ApiResponse({
                success: false,
                errorCode: generateNotFoundCode('transaction'),
                errorMsg: 'Transaction not found',
            }));
        }

        res.status(200).send(new ApiResponse({
            success: true,
            message: 'Transaction deleted',
        }));
    } catch (error: any) {
        console.error('Error inside deleteTransactionController:'.red.bold, error);
        res.status(500).send(new ApiResponse({
            success: false,
            error,
            errorMsg: 'Something went wrong',
        }));
    }
}

const getTransactionSummaryController = async (req: Request, res: Response) => {
    try {
        const {userId} = req.query;
        if (!userId) {
            return res.status(400).send(new ApiResponse({
                success: false,
                errorCode: generateMissingCode('userId'),
                errorMsg: 'User ID is missing',
            }));
        }

        /*const balanceResult = await sql`
            SELECT COALESCE(SUM(amount), 0) as balance
            FROM transactions
            WHERE user_id = ${userId}
        `;

        const incomeResult = await sql`
            SELECT COALESCE(SUM(amount), 0) as income
            FROM transactions
            WHERE user_id = ${userId}
              AND amount > 0
        `;

        const expenseResult = await sql`
            SELECT COALESCE(SUM(amount), 0) as expenses
            FROM transactions
            WHERE user_id = ${userId}
              AND amount < 0
        `;*/

        const [balanceResult, incomeResult, expenseResult] = await Promise.all([
            sql`SELECT COALESCE(SUM(amount), 0) as balance
                FROM transactions
                WHERE user_id = ${userId}`,
            sql`SELECT COALESCE(SUM(amount), 0) as income
                FROM transactions
                WHERE user_id = ${userId}
                  AND amount > 0`,
            sql`SELECT COALESCE(SUM(amount), 0) as expense
                FROM transactions
                WHERE user_id = ${userId}
                  AND amount < 0`,
        ]);

        res.status(200).send(new ApiResponse({
            success: true,
            message: 'Transaction summary fetched',
            balance: Math.abs(balanceResult[0].balance),
            income: Math.abs(incomeResult[0].income),
            expense: Math.abs(expenseResult[0].expense),
        }));
    } catch (error: any) {
        console.error('Error inside getTransactionSummaryController:'.red.bold, error);
        res.status(500).send(new ApiResponse({
            success: false,
            error,
            errorMsg: 'Something went wrong',
        }));
    }
}

export {createTransactionController, createMultipleTransactionController, getAllTransactionsController, deleteTransactionController, getTransactionSummaryController}
