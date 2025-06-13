import express, {Request, Response} from 'express';
import 'colors';
import cors from 'cors';
import morgan from 'morgan';
import {PORT} from "./config/config";
import {initDB} from "./config/db";

// rest object
const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req: Request, res: Response): Response => {
    return res.status(200).send('<h1>Welcome to React Native Wallet Server</h1>');
});

// app.use('/api/v1/test', testRoutes);

const port = PORT || 4000;

initDB().then(() => {
    app.listen(port, () => {
        console.log(`Server Running on ${port}`.gray.bold);
    });
});
