import jwt from 'jsonwebtoken';
import { User } from '../entities/User.js';
import { config } from '../config.js';

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

export interface PasswordResetTokenPayload {
  tokenType: string;
  userId: number;
}

const JWT_EXPIRES_IN: string = config.jwtExpiresIn;
const JWT_SECRET: string = config.jwtSecret;

const JWT_REFRESH_EXPIRE_IN: string = config.jwtRefreshExpireIn;
const JWT_REFRESH_SECRET: string = config.jwtRefreshSecret;

export function generateAccessToken(user: User): string {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    issuer: 'express-crud-api',
    audience: 'express-crud-api-users',
  });
}

export function generatePasswordResetToken(userId: number): string {
  return jwt.sign({ userId, tokenType: 'password-reset' }, JWT_SECRET, {
    expiresIn: '1h' as jwt.SignOptions['expiresIn'],
  });
}

export function generateRefreshToken(user: User): string {
  const payload = {
    userId: user.id,
    tokenType: 'refresh',
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRE_IN as jwt.SignOptions['expiresIn'],
    issuer: 'express-crud-api',
    audience: 'express-crud-api-users',
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'express-crud-api',
      audience: 'express-crud-api-users',
    }) as JwtPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    throw new Error('Invalid access token');
  }
}

export function verifyPasswordResetToken(token: string): PasswordResetTokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as PasswordResetTokenPayload;
    if (decoded.tokenType !== 'password-reset') {
      throw new Error('Invalid password reset token type');
    }
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    throw new Error('Invalid password reset token');
  }
}

export function verifyRefreshToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'express-crud-api',
      audience: 'express-crud-api-users',
    }) as JwtPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    throw new Error('Invalid refresh token');
  }
}
