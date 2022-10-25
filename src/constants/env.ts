import * as dotenv from 'dotenv';
dotenv.config();

export const {
  DATABASE_URL,
  SECRET_KEY,
  EMAIL,
  EMAIL_PASSWORD,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_SECRET_KEY,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;
