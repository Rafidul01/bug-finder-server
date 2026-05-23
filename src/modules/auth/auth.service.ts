import bcrypt from 'bcrypt';
import { pool } from '../../db';
import type { Iuser } from './auth.interface';
import jwt from 'jsonwebtoken';
import config from '../../config';
import AppError from '../../utility/AppError';
const registerUserIntoDB = async (payload : Iuser) =>{
    const {name,email,password,role} = payload;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(`
        INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4) 
        RETURNING *
    `,[name,email,hashedPassword,role]);

    delete result.rows[0].password

    return result.rows[0];
}

const loginUserIntoDB = async (payload: {
    email: string;
    password: string;
}) =>{

    const {email,password} = payload;

    const userData = await pool.query(`
        SELECT * FROM users WHERE email = $1
    `,[email]);

    if(userData.rows.length === 0) throw new AppError('User not found',404);
    const user = userData.rows[0];  
    const isPasswordMatch = await bcrypt.compare(password,user.password);
    if(!isPasswordMatch){
        throw new AppError('Invalid password',401);
    }

    const jwtpayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    const accesstoke = jwt.sign(jwtpayload,config.jwt_secret as string,{
        expiresIn: '1d'
    });
    delete user.password

    return {
       token: accesstoke, user
    }

}

export const authService = {
    registerUserIntoDB,
    loginUserIntoDB
}