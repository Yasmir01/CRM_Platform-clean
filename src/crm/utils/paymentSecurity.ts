// Payment Security and Encryption Utilities
// This module provides security measures for payment processing

export interface SecurityConfig {
  encryptionEnabled: boolean;
  tokenizationEnabled: boolean;
  pciCompliance: boolean;
  fraudDetection: boolean;
  riskAssessment: boolean;
}

export interface PaymentSecurityContext {
  sessionId: string;
  userAgent: string;
  ipAddress: string;
  timestamp: number;
  deviceFingerprint?: string;
}

export interface SecurityValidationResult {
  isValid: boolean;
  riskScore: number;
  flags: SecurityFlag[];
  recommendations: string[];
}

export interface SecurityFlag {
  type: 'fraud' | 'suspicious' | 'velocity' | 'location' | 'device';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: number;
}

// Encryption utility class
export class PaymentEncryption {
  private static readonly ALGORITHM = 'AES-256-GCM';
  private static readonly KEY_LENGTH = 32; // 256 bits
  private static readonly IV_LENGTH = 16;

  /**
   * Encrypt sensitive payment data
   * In production, use proper encryption libraries and HSM
   */
  static async encryptPaymentData(data: string, key?: string): Promise<string> {
    // Simulate encryption - in production use proper crypto libraries
    const timestamp = Date.now();
    const mockEncrypted = btoa(`encrypted_${timestamp}_${data}`);
    return mockEncrypted;
  }

  /**
   * Decrypt payment data
   */
  static async decryptPaymentData(encryptedData: string, key?: string): Promise<string> {
    try {
      // Simulate decryption
      const decoded = atob(encryptedData);
      const parts = decoded.split('_');
      if (parts.length >= 3 && parts[0] === 'encrypted') {
        return parts.slice(2).join('_');
      }
      throw new Error('Invalid encrypted data format');
    } catch (error) {
      throw new Error('Decryption failed');
    }
  }

  /**
   * Generate secure token for payment method storage
   */
  static generatePaymentToken(paymentData: any): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    return `tok_${timestamp}_${randomString}`;
  }

  /**
   * Mask sensitive payment information for display
   */
  static maskPaymentData(data: string, type: 'card' | 'bank' | 'routing'): string {
    switch (type) {
      case 'card':
        return data.length >= 4 ? `•••• •••• •••• ${data.slice(-4)}` : '•••• ••••';
      case 'bank':
        return data.length >= 4 ? `•••••${data.slice(-4)}` : '•••••••';
      case 'routing':
        return data.length >= 4 ? `•••••${data.slice(-4)}` : '•••••••';
      default:
        return '••••••••';
    }
  }
}

// PCI DSS Compliance utilities
export class PCICompliance {
  /**
   * Validate if payment data meets PCI DSS requirements
   */
  static validatePCICompliance(paymentData: any): boolean {
    // Check for sensitive data in logs or storage
    const sensitivePatterns = [
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card numbers
      /\b\d{3,4}\b/, // CVV codes (in certain contexts)
      /\btrack[12]\b/i // Magnetic stripe data
    ];

    const dataString = JSON.stringify(paymentData);
    return !sensitivePatterns.some(pattern => pattern.test(dataString));
  }

  /**
   * Sanitize payment data for logging or storage
   */
  static sanitizePaymentData(data: any): any {
    const sanitized = { ...data };
    
    // Remove or mask sensitive fields
    if (sanitized.cardNumber) {
      sanitized.cardNumber = PaymentEncryption.maskPaymentData(sanitized.cardNumber, 'card');
    }
    if (sanitized.cvv) {
      delete sanitized.cvv;
    }
    if (sanitized.accountNumber) {
      sanitized.accountNumber = PaymentEncryption.maskPaymentData(sanitized.accountNumber, 'bank');
    }
    if (sanitized.routingNumber) {
      sanitized.routingNumber = PaymentEncryption.maskPaymentData(sanitized.routingNumber, 'routing');
    }

    return sanitized;
  }
}

// Fraud Detection and Risk Assessment
export class FraudDetection {
  private static readonly RISK_THRESHOLDS = {
    low: 0.3,
    medium: 0.6,
    high: 0.8
  };

  /**
   * Assess risk level for a payment transaction
   */
  static assessTransactionRisk(
    paymentData: any,
    context: PaymentSecurityContext,
    userHistory?: any[]
  ): SecurityValidationResult {
    const flags: SecurityFlag[] = [];
    let riskScore = 0;

    // Amount-based risk assessment
    const amount = paymentData.amount || 0;
    if (amount > 5000) {
      riskScore += 0.3;
      flags.push({
        type: 'suspicious',
        severity: 'medium',
        description: 'High transaction amount',
        timestamp: Date.now()
      });
    }

    // Velocity checks (multiple transactions in short time)
    if (userHistory && userHistory.length > 3) {
      const recentTransactions = userHistory.filter(
        tx => Date.now() - new Date(tx.createdAt).getTime() < 3600000 // 1 hour
      );
      
      if (recentTransactions.length > 3) {
        riskScore += 0.4;
        flags.push({
          type: 'velocity',
          severity: 'high',
          description: 'Multiple transactions in short time period',
          timestamp: Date.now()
        });
      }
    }

    // Geographic risk assessment
    if (this.isHighRiskLocation(context.ipAddress)) {
      riskScore += 0.2;
      flags.push({
        type: 'location',
        severity: 'medium',
        description: 'Transaction from high-risk location',
        timestamp: Date.now()
      });
    }

    // Device fingerprint analysis
    if (context.deviceFingerprint && this.isNewDevice(context.deviceFingerprint)) {
      riskScore += 0.1;
      flags.push({
        type: 'device',
        severity: 'low',
        description: 'Transaction from new device',
        timestamp: Date.now()
      });
    }

    // Generate recommendations
    const recommendations = this.generateSecurityRecommendations(riskScore, flags);

    return {
      isValid: riskScore < this.RISK_THRESHOLDS.high,
      riskScore,
      flags,
      recommendations
    };
  }

  /**
   * Check if IP address is from a high-risk location
   */
  private static isHighRiskLocation(ipAddress: string): boolean {
    // In production, use a real geolocation and risk database
    // This is a simplified example
    const highRiskCountries = ['XX', 'YY']; // Mock country codes
    return Math.random() < 0.1; // 10% chance for demo purposes
  }

  /**
   * Check if device fingerprint represents a new device
   */
  private static isNewDevice(fingerprint: string): boolean {
    // In production, check against stored device fingerprints
    return Math.random() < 0.3; // 30% chance for demo purposes
  }

  /**
   * Generate security recommendations based on risk assessment
   */
  private static generateSecurityRecommendations(
    riskScore: number,
    flags: SecurityFlag[]
  ): string[] {
    const recommendations: string[] = [];

    if (riskScore > this.RISK_THRESHOLDS.high) {
      recommendations.push('Block transaction and require manual review');
      recommendations.push('Request additional verification from customer');
    } else if (riskScore > this.RISK_THRESHOLDS.medium) {
      recommendations.push('Apply additional verification steps');
      recommendations.push('Monitor transaction closely');
    } else if (riskScore > this.RISK_THRESHOLDS.low) {
      recommendations.push('Continue with standard processing');
      recommendations.push('Log transaction for pattern analysis');
    }

    // Specific recommendations based on flags
    flags.forEach(flag => {
      switch (flag.type) {
        case 'velocity':
          recommendations.push('Implement transaction limits for this user');
          break;
        case 'location':
          recommendations.push('Request location verification');
          break;
        case 'device':
          recommendations.push('Send device verification notification');
          break;
      }
    });

    return [...new Set(recommendations)]; // Remove duplicates
  }
}

// Security audit logging
export class SecurityAuditLogger {
  private static logs: SecurityLog[] = [];

  /**
   * Log security-related events
   */
  static logSecurityEvent(event: SecurityLog): void {
    this.logs.push({
      ...event,
      timestamp: Date.now()
    });

    // In production, send to secure logging service
    console.log('Security Event:', this.sanitizeLogData(event));
  }

  /**
   * Get security logs for analysis
   */
  static getSecurityLogs(
    startDate?: Date,
    endDate?: Date,
    eventType?: string
  ): SecurityLog[] {
    let filteredLogs = this.logs;

    if (startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= startDate.getTime());
    }

    if (endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= endDate.getTime());
    }

    if (eventType) {
      filteredLogs = filteredLogs.filter(log => log.eventType === eventType);
    }

    return filteredLogs.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Sanitize log data to remove sensitive information
   */
  private static sanitizeLogData(log: SecurityLog): SecurityLog {
    const sanitized = { ...log };
    
    if (sanitized.paymentData) {
      sanitized.paymentData = PCICompliance.sanitizePaymentData(sanitized.paymentData);
    }

    return sanitized;
  }
}

export interface SecurityLog {
  id?: string;
  eventType: 'payment_processed' | 'fraud_detected' | 'risk_assessment' | 'auth_failure' | 'data_access';
  userId?: string;
  paymentId?: string;
  riskScore?: number;
  securityFlags?: SecurityFlag[];
  paymentData?: any;
  context?: PaymentSecurityContext;
  result: 'success' | 'failure' | 'blocked' | 'flagged';
  message: string;
  timestamp: number;
}

// Input validation for payment forms
export class PaymentValidator {
  /**
   * Validate credit card number using Luhn algorithm
   */
  static validateCardNumber(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\D/g, '');
    
    if (cleaned.length < 13 || cleaned.length > 19) {
      return false;
    }

    // Luhn algorithm
    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Validate CVV code
   */
  static validateCVV(cvv: string, cardType?: string): boolean {
    const cleaned = cvv.replace(/\D/g, '');
    
    if (cardType === 'amex') {
      return cleaned.length === 4;
    }
    
    return cleaned.length === 3;
  }

  /**
   * Validate bank routing number
   */
  static validateRoutingNumber(routingNumber: string): boolean {
    const cleaned = routingNumber.replace(/\D/g, '');
    
    if (cleaned.length !== 9) {
      return false;
    }

    // ABA routing number checksum validation
    const digits = cleaned.split('').map(Number);
    const checksum = (
      7 * (digits[0] + digits[3] + digits[6]) +
      3 * (digits[1] + digits[4] + digits[7]) +
      9 * (digits[2] + digits[5])
    ) % 10;

    return checksum === digits[8];
  }

  /**
   * Validate bank account number
   */
  static validateAccountNumber(accountNumber: string): boolean {
    const cleaned = accountNumber.replace(/\D/g, '');
    return cleaned.length >= 4 && cleaned.length <= 17;
  }

  /**
   * Validate expiry date
   */
  static validateExpiryDate(month: string, year: string): boolean {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const expMonth = parseInt(month, 10);
    const expYear = parseInt(year, 10);

    if (expMonth < 1 || expMonth > 12) {
      return false;
    }

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      return false;
    }

    if (expYear > currentYear + 20) {
      return false;
    }

    return true;
  }
}

// Rate limiting for API endpoints
export class RateLimiter {
  private static attempts: Map<string, number[]> = new Map();
  private static readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private static readonly MAX_ATTEMPTS = 5;

  /**
   * Check if request should be rate limited
   */
  static isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    
    // Remove attempts outside the time window
    const validAttempts = attempts.filter(attempt => now - attempt < this.WINDOW_MS);
    
    // Update the attempts for this identifier
    this.attempts.set(identifier, validAttempts);
    
    return validAttempts.length >= this.MAX_ATTEMPTS;
  }

  /**
   * Record an attempt for rate limiting
   */
  static recordAttempt(identifier: string): void {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    attempts.push(now);
    this.attempts.set(identifier, attempts);
  }

  /**
   * Clear rate limiting data for an identifier
   */
  static clearAttempts(identifier: string): void {
    this.attempts.delete(identifier);
  }
}
