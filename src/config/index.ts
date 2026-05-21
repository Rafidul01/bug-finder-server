import dotenv from 'dotenv';
import path from 'path'

dotenv.config({
    path: path.join(process.cwd(), '.env')
});

const config={
    port: process.env.PORT,
    cunnction_string: process.env.CONNECTIONSTRING,
    jwt_secret: process.env.JWT_SECRET

}

export default config;