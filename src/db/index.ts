import { Pool } from 'pg';
import config from '../config';
import e from 'express';

export const pool = new Pool({
    connectionString: config.cunnction_string
})
export const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(40) NOT NULL,
            email VARCHAR(40) NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role VARCHAR(20) DEFAULT 'contributor',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                
            )`);

        console.log('DB is connected successfully');
    } catch (error) {
        console.log(error);
    }
}
