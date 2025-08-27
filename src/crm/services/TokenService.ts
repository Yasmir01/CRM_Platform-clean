import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface SessionInfo {
  deviceInfo?: any;
  ipAddress?: string;
  userAgent?: string;
}

export class TokenService {
  // In production, these should be environment variables
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'crm-super-secret-key-change-in-production';
  private static readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'crm-refresh-secret-key-change-in-production';
  
  // Token expiration times
  private static readonly ACCESS_TOKEN_EXPIRES = '15m'; // 15 minutes
  private static readonly REFRESH_TOKEN_EXPIRES = '7d'; // 7 days
  private static readonly RESET_TOKEN_EXPIRES = '1h'; // 1 hour
  private static readonly VERIFICATION_TOKEN_EXPIRES = '24h'; // 24 hours

  /**
   * Generate access token (short-lived)
   */
  static generateAccessToken(payload: Omit<TokenPayload, 'sessionId'>): { token: string; sessionId: string } {
    const sessionId = uuidv4();
    const tokenPayload: TokenPayload = {
      ...payload,
      sessionId
    };

    const token = jwt.sign(tokenPayload, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRES,
      issuer: 'propcrm',
      audience: 'propcrm-users'
    });

    return { token, sessionId };
  }

  /**
   * Generate refresh token (long-lived)
   */
  static generateRefreshToken(userId: string, sessionId: string): string {
    const payload = {
      userId,
      sessionId,
      type: 'refresh'
    };

    return jwt.sign(payload, this.JWT_REFRESH_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES,
      issuer: 'propcrm',
      audience: 'propcrm-users'
    });
  }

  /**
   * Generate password reset token
   */
  static generatePasswordResetToken(userId: string, email: string): string {
    const payload = {
      userId,
      email,
      type: 'password_reset',
      nonce: uuidv4() // Prevent token reuse
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.RESET_TOKEN_EXPIRES,
      issuer: 'propcrm',
      audience: 'propcrm-reset'
    });
  }

  /**
   * Generate email verification token
   */
  static generateEmailVerificationToken(userId: string, email: string): string {
    const payload = {
      userId,
      email,
      type: 'email_verification',
      nonce: uuidv4()
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.VERIFICATION_TOKEN_EXPIRES,
      issuer: 'propcrm',
      audience: 'propcrm-verify'
    });
  }

  /**
   * Verify and decode access token
   */
  static verifyAccessToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        issuer: 'propcrm',
        audience: 'propcrm-users'
      }) as TokenPayload;

      return decoded;
    } catch (error) {
      console.error('Access token verification failed:', error);
      return null;
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): { userId: string; sessionId: string } | null {
    try {
      const decoded = jwt.verify(token, this.JWT_REFRESH_SECRET, {
        issuer: 'propcrm',
        audience: 'propcrm-users'
      }) as any;

      if (decoded.type !== 'refresh') {
        return null;
      }

      return {
        userId: decoded.userId,
        sessionId: decoded.sessionId
      };
    } catch (error) {
      console.error('Refresh token verification failed:', error);
      return null;
    }
  }

  /**
   * Verify password reset token
   */
  static verifyPasswordResetToken(token: string): { userId: string; email: string } | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        issuer: 'propcrm',
        audience: 'propcrm-reset'
      }) as any;

      if (decoded.type !== 'password_reset') {
        return null;
      }

      return {
        userId: decoded.userId,
        email: decoded.email
      };
    } catch (error) {
      console.error('Password reset token verification failed:', error);
      return null;
    }
  }

  /**
   * Verify email verification token
   */
  static verifyEmailVerificationToken(token: string): { userId: string; email: string } | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        issuer: 'propcrm',
        audience: 'propcrm-verify'
      }) as any;

      if (decoded.type !== 'email_verification') {
        return null;
      }

      return {
        userId: decoded.userId,
        email: decoded.email
      };
    } catch (error) {
      console.error('Email verification token verification failed:', error);
      return null;
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Get token expiration time
   */
  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    const expiration = this.getTokenExpiration(token);
    return expiration ? expiration < new Date() : true;
  }

  /**
   * Generate a hash for storing session tokens securely
   */
  static hashToken(token: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
