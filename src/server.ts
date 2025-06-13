import express from 'express';
import 'colors';
import cors from 'cors';
import morgan from 'morgan';
import {Request, Response} from "express";
import {PORT} from "./config/config";

// rest object
const app = express();

// db connection
// connectDB();

// middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req: Request, res: Response): Response => {
    return res.status(200).send('<h1>Welcome to React Native Wallet Server</h1>');
});

// app.use('/api/v1/test', testRoutes);

const port = PORT || 4000;

app.listen(port, () => {
    console.log(`Server Running on ${port}`.gray.bold);
});
