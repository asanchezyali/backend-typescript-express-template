import * as jwt from 'jsonwebtoken';
import { User } from '../entities/User.js';
import { config } from '../config.js';

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

export class JwtService {
  private static readonly JWT_EXPIRES_IN = config.jwtExpiresIn;
  private static readonly JWT_REFRESH_EXPIRES_IN = config.jwtRefreshExpireIn;
  private static readonly JWT_REFRESH_SECRET = config.jwtRefreshSecret;
  private static readonly JWT_SECRET = config.jwtSecret || 'defaultSecret';

  static generateAccessToken(user: User): string {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, this.JWT_SECRET as jwt.Secret, {
      expiresIn: this.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      issuer: 'express-crud-api',
      audience: 'express-crud-client',
    });
  }

  static generateRefreshToken(user: User): string {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.JWT_REFRESH_EXPIRES_IN,
      issuer: 'express-crud-api',
      audience: 'express-crud-client',
    });
  }

  static verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET, {
        issuer: 'express-crud-api',
        audience: 'express-crud-client',
      }) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  static verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.JWT_REFRESH_SECRET, {
        issuer: 'express-crud-api',
        audience: 'express-crud-client',
      }) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }
}
