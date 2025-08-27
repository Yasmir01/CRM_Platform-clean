// Browser-compatible password service (replaces bcrypt for frontend development)

export class PasswordService {
  private static readonly MIN_PASSWORD_LENGTH = 8;

  /**
   * Hash a password (browser-compatible simulation)
   * Note: In production, password hashing should be done server-side
   */
  static async hashPassword(password: string): Promise<string> {
    if (!password || password.length < this.MIN_PASSWORD_LENGTH) {
      throw new Error(`Password must be at least ${this.MIN_PASSWORD_LENGTH} characters long`);
    }
    
    // For development, use a simple hash simulation
    // In production, this would be handled by server-side bcrypt
    const salt = this.generateSalt();
    const hash = await this.simpleHash(password + salt);
    return `$dev$${salt}$${hash}`;
  }

  /**
   * Verify a password against its hash (browser-compatible simulation)
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) {
      return false;
    }
    
    try {
      // Handle development hash format
      if (hash.startsWith('$dev$')) {
        const parts = hash.split('$');
        if (parts.length !== 4) return false;
        
        const salt = parts[2];
        const storedHash = parts[3];
        const computedHash = await this.simpleHash(password + salt);
        
        return computedHash === storedHash;
      }
      
      // For demo purposes, also accept plain text passwords (development only)
      if (process.env.NODE_ENV === 'development') {
        return password === hash;
      }
      
      return false;
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
    score: number;
  } {
    const errors: string[] = [];
    let score = 0;

    // Length check
    if (password.length < this.MIN_PASSWORD_LENGTH) {
      errors.push(`Password must be at least ${this.MIN_PASSWORD_LENGTH} characters long`);
    } else {
      score += 1;
    }

    // Character type checks
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else {
      score += 1;
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    } else {
      score += 1;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    } else {
      score += 1;
    }

    // Additional length bonus
    if (password.length >= 12) {
      score += 1;
    }

    return {
      isValid: errors.length === 0,
      errors,
      score: Math.min(score, 5)
    };
  }

  /**
   * Generate a secure random password
   */
  static generateSecurePassword(length: number = 16): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    
    let password = '';
    
    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest with random characters
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Generate a temporary password for password reset
   */
  static generateTemporaryPassword(): string {
    return this.generateSecurePassword(12);
  }

  // Private helper methods for browser-compatible hashing

  /**
   * Generate a simple salt for development
   */
  private static generateSalt(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let salt = '';
    for (let i = 0; i < 16; i++) {
      salt += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return salt;
  }

  /**
   * Simple hash function for browser compatibility (development only)
   */
  private static async simpleHash(input: string): Promise<string> {
    // Use Web Crypto API if available, otherwise fallback to simple hash
    if (crypto && crypto.subtle) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (error) {
        // Fallback to simple hash if Web Crypto API fails
      }
    }
    
    // Simple fallback hash (not cryptographically secure - development only)
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }
}
