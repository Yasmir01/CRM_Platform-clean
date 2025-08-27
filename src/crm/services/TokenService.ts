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
  // Token expiration times (in milliseconds for frontend)
  private static readonly ACCESS_TOKEN_EXPIRES = 15 * 60 * 1000; // 15 minutes
  private static readonly REFRESH_TOKEN_EXPIRES = 7 * 24 * 60 * 60 * 1000; // 7 days
  private static readonly RESET_TOKEN_EXPIRES = 60 * 60 * 1000; // 1 hour
  private static readonly VERIFICATION_TOKEN_EXPIRES = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Generate access token (browser-compatible simulation)
   */
  static generateAccessToken(payload: Omit<TokenPayload, 'sessionId'>): { token: string; sessionId: string } {
    const sessionId = uuidv4();
    const now = Date.now();
    const exp = now + this.ACCESS_TOKEN_EXPIRES;
    
    const tokenPayload: TokenPayload = {
      ...payload,
      sessionId,
      iat: Math.floor(now / 1000),
      exp: Math.floor(exp / 1000)
    };

    // Create a browser-compatible token (Base64 encoded JSON for development)
    const token = this.createSimulatedToken(tokenPayload, 'access');
    return { token, sessionId };
  }

  /**
   * Generate refresh token (browser-compatible simulation)
   */
  static generateRefreshToken(userId: string, sessionId: string): string {
    const now = Date.now();
    const exp = now + this.REFRESH_TOKEN_EXPIRES;
    
    const payload = {
      userId,
      sessionId,
      type: 'refresh',
      iat: Math.floor(now / 1000),
      exp: Math.floor(exp / 1000)
    };

    return this.createSimulatedToken(payload, 'refresh');
  }

  /**
   * Generate password reset token
   */
  static generatePasswordResetToken(userId: string, email: string): string {
    const now = Date.now();
    const exp = now + this.RESET_TOKEN_EXPIRES;
    
    const payload = {
      userId,
      email,
      type: 'password_reset',
      nonce: uuidv4(),
      iat: Math.floor(now / 1000),
      exp: Math.floor(exp / 1000)
    };

    return this.createSimulatedToken(payload, 'reset');
  }

  /**
   * Generate email verification token
   */
  static generateEmailVerificationToken(userId: string, email: string): string {
    const now = Date.now();
    const exp = now + this.VERIFICATION_TOKEN_EXPIRES;
    
    const payload = {
      userId,
      email,
      type: 'email_verification',
      nonce: uuidv4(),
      iat: Math.floor(now / 1000),
      exp: Math.floor(exp / 1000)
    };

    return this.createSimulatedToken(payload, 'verify');
  }

  /**
   * Verify and decode access token
   */
  static verifyAccessToken(token: string): TokenPayload | null {
    try {
      const payload = this.parseSimulatedToken(token, 'access');
      
      if (!payload || this.isTokenExpired(payload)) {
        return null;
      }

      // Validate it's an access token
      if (payload.type && payload.type !== 'access') {
        return null;
      }

      return payload as TokenPayload;
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
      const payload = this.parseSimulatedToken(token, 'refresh');
      
      if (!payload || this.isTokenExpired(payload)) {
        return null;
      }

      if (payload.type !== 'refresh') {
        return null;
      }

      return {
        userId: payload.userId,
        sessionId: payload.sessionId
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
      const payload = this.parseSimulatedToken(token, 'reset');
      
      if (!payload || this.isTokenExpired(payload)) {
        return null;
      }

      if (payload.type !== 'password_reset') {
        return null;
      }

      return {
        userId: payload.userId,
        email: payload.email
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
      const payload = this.parseSimulatedToken(token, 'verify');
      
      if (!payload || this.isTokenExpired(payload)) {
        return null;
      }

      if (payload.type !== 'email_verification') {
        return null;
      }

      return {
        userId: payload.userId,
        email: payload.email
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
      const payload = this.parseSimulatedToken(token);
      if (payload && payload.exp) {
        return new Date(payload.exp * 1000);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(tokenOrPayload: string | any): boolean {
    try {
      let payload = tokenOrPayload;
      
      if (typeof tokenOrPayload === 'string') {
        payload = this.parseSimulatedToken(tokenOrPayload);
      }
      
      if (!payload || !payload.exp) {
        return true;
      }
      
      return payload.exp < Math.floor(Date.now() / 1000);
    } catch (error) {
      return true;
    }
  }

  /**
   * Generate a hash for storing session tokens securely (browser-compatible)
   */
  static hashToken(token: string): string {
    // Use a simple hash for browser compatibility
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Private helper methods for browser-compatible token simulation

  /**
   * Create a simulated token (Base64 encoded JSON for development)
   */
  private static createSimulatedToken(payload: any, type: string): string {
    const tokenData = {
      ...payload,
      type,
      iss: 'propcrm',
      aud: type === 'access' ? 'propcrm-users' : `propcrm-${type}`
    };

    // In development, use Base64 encoding for simplicity
    // In production, this would be generated by server-side JWT
    const encodedPayload = btoa(JSON.stringify(tokenData));
    const signature = this.createSimpleSignature(encodedPayload);
    
    return `crm_${type}.${encodedPayload}.${signature}`;
  }

  /**
   * Parse a simulated token
   */
  private static parseSimulatedToken(token: string, expectedType?: string): any {
    try {
      if (!token.includes('.')) {
        throw new Error('Invalid token format');
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token structure');
      }

      const [prefix, encodedPayload, signature] = parts;
      
      // Verify prefix
      if (expectedType && !prefix.startsWith(`crm_${expectedType}`)) {
        throw new Error('Invalid token type');
      }

      // Verify signature (simple check for development)
      const expectedSignature = this.createSimpleSignature(encodedPayload);
      if (signature !== expectedSignature) {
        throw new Error('Invalid token signature');
      }

      // Decode payload
      const payloadJson = atob(encodedPayload);
      return JSON.parse(payloadJson);
    } catch (error) {
      throw new Error(`Token parsing failed: ${error}`);
    }
  }

  /**
   * Create a simple signature for development (not cryptographically secure)
   */
  private static createSimpleSignature(data: string): string {
    let hash = 0;
    const secret = 'crm-dev-secret'; // Development only
    const combined = data + secret;
    
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(16);
  }
}
