import {Router} from "express";
import {
    createMultipleTransactionController,
    createTransactionController,
    deleteTransactionController,
    getAllTransactionsController,
    getTransactionSummaryController
} from "../controllers/TransactionController";

const router = Router();

// create transaction
router.post('/', createTransactionController);  // /api/v1/transactions

// create multiple transactions
router.post('/bulk', createMultipleTransactionController);  // /api/v1/transactions/bulk

// get all transactions
router.get('/', getAllTransactionsController);  // /api/v1/transactions?userId={userId}

// delete transaction
router.delete('/', deleteTransactionController);  // /api/v1/transactions?transactionId={transactionId}

// transactions summary
router.get('/summary', getTransactionSummaryController);  // /api/v1/transactions/summary?userId={userId}

export default router;
