import {neon} from "@neondatabase/serverless";
import {DATABASE_URL} from "./config";

// Creates a SQL Connection using our DB URL
export const sql = neon(DATABASE_URL!);

export async function initDB() {
    try {
        await sql`CREATE TABLE IF NOT EXISTS transactions
        (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            category VARCHAR(255) NOT NULL,
            created_at DATE NOT NULL DEFAULT CURRENT_DATE
        )`;

        console.log('Database initialized successfully'.green.bold);
    } catch (error: any) {
        console.error('Error initializing DB'.red.bold, error)
        process.exit(1);
    }
}
