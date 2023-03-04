import { sign } from 'jsonwebtoken';
export const secretKey = process.env.JWT_SECRET_KEY || '1234';

const generateWebToken = (payload) => {
  return sign(payload, secretKey);
};

export default generateWebToken;
