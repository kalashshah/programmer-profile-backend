import * as dotenv from 'dotenv';
dotenv.config();

export const { DATABASE_URL, SECRET_KEY, EMAIL, EMAIL_PASSWORD } = process.env;
