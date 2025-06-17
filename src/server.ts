import express from 'express';
import 'colors';
import cors from 'cors';
import morgan from 'morgan';
import {PORT} from "./config/config";
import {initDB} from "./config/db";
import rateLimiter from "./middleware/rateLimiter";
import transactionRoutes from "./routes/TransactionRoutes";

// rest object
const app = express();

// middlewares
app.use(cors());
app.use(rateLimiter);
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/v1/transactions', transactionRoutes);

app.get('/', function (req, res) {
    return res.status(200).send('<h1>Welcome to React Native Wallet Server</h1>');
});

const port = PORT || 4000;

initDB().then(() => {
    app.listen(port, () => {
        console.log(`Server Running on ${port}`.gray.bold);
    });
});
