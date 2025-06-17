import rateLimit from '../config/upstash';
import {NextFunction, Request, Response} from "express";
import {ApiResponse} from "../utils/ApiResponse";

const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {success} = await rateLimit.limit('react-native-wallet-rate-limiter');
        if (!success) {
            return res.status(429).send(new ApiResponse({
                success: false,
                errorMsg: 'Too many requests, please try again later',
            }));
        }
        next();
    } catch (error: any) {
        console.log('Error in rateLimiter middleware:'.red.bold, error);
        next(error);
    }
}

export default rateLimiter;
