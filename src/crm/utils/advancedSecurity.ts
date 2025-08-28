// Advanced Security Features for Payment System
// This module implements rate limiting, advanced fraud prevention, and automated security responses

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (context: any) => string;
}

export interface SecurityResponse {
  action: 'allow' | 'block' | 'review' | 'challenge';
  reason: string;
  riskScore: number;
  recommendations: string[];
  requiresManualReview: boolean;
}

export interface ThreatIntelligence {
  ipAddress: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  knownAttacks: string[];
  lastSeen: Date;
  country: string;
  isVpn: boolean;
  isTor: boolean;
}

interface RateLimitEntry {
  count: number;
  firstRequest: number;
  lastRequest: number;
}

export class AdvancedSecurityManager {
  private rateLimitStore: Map<string, RateLimitEntry> = new Map();
  private blockedIPs: Set<string> = new Set();
  private suspiciousPatterns: Map<string, number> = new Map();
  private threatIntelligence: Map<string, ThreatIntelligence> = new Map();

  /**
   * Advanced rate limiting with configurable rules
   */
  checkRateLimit(context: any, config: RateLimitConfig): boolean {
    const key = config.keyGenerator ? config.keyGenerator(context) : context.ipAddress;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    const entry = this.rateLimitStore.get(key);

    if (!entry) {
      this.rateLimitStore.set(key, {
        count: 1,
        firstRequest: now,
        lastRequest: now
      });
      return true;
    }

    // Clean up old entries
    if (entry.firstRequest < windowStart) {
      entry.count = 1;
      entry.firstRequest = now;
      entry.lastRequest = now;
      return true;
    }

    entry.count++;
    entry.lastRequest = now;

    if (entry.count > config.maxRequests) {
      this.addSuspiciousActivity(key, 'rate_limit_exceeded');
      return false;
    }

    return true;
  }

  /**
   * Advanced fraud detection with machine learning-like patterns
   */
  detectAdvancedFraud(paymentData: any, context: any, userHistory: any[]): SecurityResponse {
    let riskScore = 0;
    const reasons: string[] = [];
    const recommendations: string[] = [];

    // Velocity analysis
    const velocityRisk = this.analyzeVelocity(paymentData, userHistory);
    riskScore += velocityRisk.score;
    if (velocityRisk.isRisky) {
      reasons.push(velocityRisk.reason);
    }

    // Behavioral analysis
    const behaviorRisk = this.analyzeBehaviorPattern(paymentData, context, userHistory);
    riskScore += behaviorRisk.score;
    if (behaviorRisk.isRisky) {
      reasons.push(behaviorRisk.reason);
    }

    // Geolocation analysis
    const geoRisk = this.analyzeGeolocation(context);
    riskScore += geoRisk.score;
    if (geoRisk.isRisky) {
      reasons.push(geoRisk.reason);
    }

    // Device fingerprint analysis
    const deviceRisk = this.analyzeDeviceFingerprint(context);
    riskScore += deviceRisk.score;
    if (deviceRisk.isRisky) {
      reasons.push(deviceRisk.reason);
    }

    // Amount pattern analysis
    const amountRisk = this.analyzeAmountPattern(paymentData, userHistory);
    riskScore += amountRisk.score;
    if (amountRisk.isRisky) {
      reasons.push(amountRisk.reason);
    }

    // Time-based analysis
    const timeRisk = this.analyzeTimePattern(context, userHistory);
    riskScore += timeRisk.score;
    if (timeRisk.isRisky) {
      reasons.push(timeRisk.reason);
    }

    // Generate recommendations
    if (riskScore > 80) {
      recommendations.push('Block transaction immediately');
      recommendations.push('Require manual review');
      recommendations.push('Contact customer for verification');
    } else if (riskScore > 60) {
      recommendations.push('Require additional authentication');
      recommendations.push('Apply transaction hold');
      recommendations.push('Send verification email/SMS');
    } else if (riskScore > 40) {
      recommendations.push('Apply enhanced monitoring');
      recommendations.push('Request security questions');
    }

    // Determine action
    let action: SecurityResponse['action'] = 'allow';
    if (riskScore > 80) {
      action = 'block';
    } else if (riskScore > 60) {
      action = 'review';
    } else if (riskScore > 40) {
      action = 'challenge';
    }

    return {
      action,
      reason: reasons.join('; '),
      riskScore,
      recommendations,
      requiresManualReview: riskScore > 70
    };
  }

  /**
   * Analyze transaction velocity patterns
   */
  private analyzeVelocity(paymentData: any, userHistory: any[]) {
    const amount = paymentData.amount || 0;
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;

    // Recent transactions
    const recentTransactions = userHistory.filter(tx => 
      now - new Date(tx.createdAt).getTime() < oneHour
    );

    const dailyTransactions = userHistory.filter(tx => 
      now - new Date(tx.createdAt).getTime() < oneDay
    );

    const recentAmount = recentTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const dailyAmount = dailyTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);

    let score = 0;
    let isRisky = false;
    let reason = '';

    // Check for unusual velocity
    if (recentTransactions.length > 5) {
      score += 30;
      isRisky = true;
      reason = 'High transaction frequency in last hour';
    }

    if (recentAmount > 1000000) { // $10,000
      score += 25;
      isRisky = true;
      reason += (reason ? '; ' : '') + 'High transaction volume in last hour';
    }

    if (dailyAmount > 5000000) { // $50,000
      score += 20;
      isRisky = true;
      reason += (reason ? '; ' : '') + 'High daily transaction volume';
    }

    return { score, isRisky, reason };
  }

  /**
   * Analyze behavioral patterns
   */
  private analyzeBehaviorPattern(paymentData: any, context: any, userHistory: any[]) {
    let score = 0;
    let isRisky = false;
    let reason = '';

    // Check for unusual time patterns
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) {
      score += 10;
      reason = 'Transaction outside normal hours';
    }

    // Check for pattern deviations
    if (userHistory.length > 0) {
      const avgAmount = userHistory.reduce((sum, tx) => sum + (tx.amount || 0), 0) / userHistory.length;
      const currentAmount = paymentData.amount || 0;
      
      if (currentAmount > avgAmount * 5) {
        score += 25;
        isRisky = true;
        reason += (reason ? '; ' : '') + 'Transaction amount significantly higher than average';
      }
    }

    // Check for rapid payment method changes
    const recentMethods = userHistory
      .filter(tx => Date.now() - new Date(tx.createdAt).getTime() < 24 * 60 * 60 * 1000)
      .map(tx => tx.paymentMethodId);
    
    const uniqueMethods = [...new Set(recentMethods)];
    if (uniqueMethods.length > 3) {
      score += 20;
      isRisky = true;
      reason += (reason ? '; ' : '') + 'Multiple payment methods used recently';
    }

    return { score, isRisky, reason };
  }

  /**
   * Analyze geolocation risks
   */
  private analyzeGeolocation(context: any) {
    let score = 0;
    let isRisky = false;
    let reason = '';

    const threatIntel = this.threatIntelligence.get(context.ipAddress);
    
    if (threatIntel) {
      switch (threatIntel.riskLevel) {
        case 'critical':
          score += 50;
          isRisky = true;
          reason = 'IP address flagged as critical risk';
          break;
        case 'high':
          score += 35;
          isRisky = true;
          reason = 'IP address flagged as high risk';
          break;
        case 'medium':
          score += 20;
          reason = 'IP address flagged as medium risk';
          break;
      }

      if (threatIntel.isVpn || threatIntel.isTor) {
        score += 15;
        reason += (reason ? '; ' : '') + 'VPN/Tor usage detected';
      }
    }

    // Check if IP is in blocklist
    if (this.blockedIPs.has(context.ipAddress)) {
      score += 100;
      isRisky = true;
      reason = 'IP address is blocked';
    }

    return { score, isRisky, reason };
  }

  /**
   * Analyze device fingerprint
   */
  private analyzeDeviceFingerprint(context: any) {
    let score = 0;
    let isRisky = false;
    let reason = '';

    // Check for suspicious user agents
    const suspiciousUAPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /automated/i,
      /script/i
    ];

    if (suspiciousUAPatterns.some(pattern => pattern.test(context.userAgent))) {
      score += 40;
      isRisky = true;
      reason = 'Suspicious user agent detected';
    }

    // Check for missing or suspicious device fingerprint
    if (!context.deviceFingerprint) {
      score += 15;
      reason = 'Missing device fingerprint';
    } else if (context.deviceFingerprint.length < 10) {
      score += 25;
      isRisky = true;
      reason = 'Suspicious device fingerprint';
    }

    return { score, isRisky, reason };
  }

  /**
   * Analyze amount patterns
   */
  private analyzeAmountPattern(paymentData: any, userHistory: any[]) {
    let score = 0;
    let isRisky = false;
    let reason = '';

    const amount = paymentData.amount || 0;

    // Check for round numbers (potential fraud indicator)
    if (amount % 100000 === 0 && amount > 100000) { // Multiple of $1,000
      score += 15;
      reason = 'Round number amount';
    }

    // Check for amount just under reporting thresholds
    const reportingThresholds = [1000000, 500000, 300000]; // $10k, $5k, $3k
    for (const threshold of reportingThresholds) {
      if (amount >= threshold - 5000 && amount < threshold) {
        score += 20;
        isRisky = true;
        reason = 'Amount just under reporting threshold';
        break;
      }
    }

    // Check for incrementally increasing amounts
    if (userHistory.length >= 3) {
      const recentAmounts = userHistory
        .slice(-3)
        .map(tx => tx.amount)
        .sort((a, b) => a - b);
      
      const isIncreasing = recentAmounts.every((amount, index) => 
        index === 0 || amount > recentAmounts[index - 1]
      );
      
      if (isIncreasing && amount > recentAmounts[recentAmounts.length - 1]) {
        score += 15;
        reason += (reason ? '; ' : '') + 'Incrementally increasing payment amounts';
      }
    }

    return { score, isRisky, reason };
  }

  /**
   * Analyze time-based patterns
   */
  private analyzeTimePattern(context: any, userHistory: any[]) {
    let score = 0;
    let isRisky = false;
    let reason = '';

    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();

    // Weekend late night transactions
    if ((dayOfWeek === 0 || dayOfWeek === 6) && (hour < 6 || hour > 22)) {
      score += 15;
      reason = 'Weekend late night transaction';
    }

    // Check for regular pattern deviations
    if (userHistory.length > 5) {
      const historicalHours = userHistory.map(tx => new Date(tx.createdAt).getHours());
      const avgHour = historicalHours.reduce((sum, h) => sum + h, 0) / historicalHours.length;
      
      if (Math.abs(hour - avgHour) > 8) {
        score += 10;
        reason += (reason ? '; ' : '') + 'Transaction time deviates from normal pattern';
      }
    }

    return { score, isRisky, reason };
  }

  /**
   * Add suspicious activity tracking
   */
  private addSuspiciousActivity(identifier: string, activity: string) {
    const current = this.suspiciousPatterns.get(identifier) || 0;
    this.suspiciousPatterns.set(identifier, current + 1);

    // Auto-block after threshold
    if (current + 1 >= 5) {
      this.blockedIPs.add(identifier);
      console.warn(`Auto-blocked ${identifier} due to suspicious activity: ${activity}`);
    }
  }

  /**
   * Automated security response system
   */
  async executeSecurityResponse(response: SecurityResponse, context: any): Promise<void> {
    switch (response.action) {
      case 'block':
        await this.blockTransaction(context, response.reason);
        break;
      case 'review':
        await this.flagForReview(context, response);
        break;
      case 'challenge':
        await this.initiateChallenge(context, response);
        break;
      case 'allow':
        await this.logAllowedTransaction(context, response);
        break;
    }
  }

  private async blockTransaction(context: any, reason: string): Promise<void> {
    // Add IP to blocklist temporarily
    this.blockedIPs.add(context.ipAddress);
    
    // Log security event
    console.error(`SECURITY BLOCK: Transaction blocked for ${context.ipAddress}. Reason: ${reason}`);
    
    // Send alert to security team
    await this.sendSecurityAlert('critical', `Transaction blocked: ${reason}`, context);
  }

  private async flagForReview(context: any, response: SecurityResponse): Promise<void> {
    // Flag transaction for manual review
    console.warn(`SECURITY REVIEW: Transaction flagged for review. Risk score: ${response.riskScore}`);
    
    // Send to review queue
    await this.addToReviewQueue(context, response);
  }

  private async initiateChallenge(context: any, response: SecurityResponse): Promise<void> {
    // Initiate additional verification challenge
    console.info(`SECURITY CHALLENGE: Additional verification required. Risk score: ${response.riskScore}`);
    
    // Send challenge notification
    await this.sendChallengeNotification(context, response);
  }

  private async logAllowedTransaction(context: any, response: SecurityResponse): Promise<void> {
    console.log(`SECURITY ALLOW: Transaction approved. Risk score: ${response.riskScore}`);
  }

  private async sendSecurityAlert(severity: string, message: string, context: any): Promise<void> {
    // In production, send to security monitoring system
    console.log(`SECURITY ALERT [${severity.toUpperCase()}]: ${message}`);
  }

  private async addToReviewQueue(context: any, response: SecurityResponse): Promise<void> {
    // In production, add to manual review queue
    console.log('Transaction added to manual review queue');
  }

  private async sendChallengeNotification(context: any, response: SecurityResponse): Promise<void> {
    // In production, send SMS/email challenge
    console.log('Challenge notification sent to user');
  }

  /**
   * Update threat intelligence
   */
  updateThreatIntelligence(ipAddress: string, threatData: ThreatIntelligence): void {
    this.threatIntelligence.set(ipAddress, threatData);
  }

  /**
   * Cleanup old rate limit entries
   */
  cleanupRateLimits(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [key, entry] of this.rateLimitStore.entries()) {
      if (now - entry.lastRequest > maxAge) {
        this.rateLimitStore.delete(key);
      }
    }
  }

  /**
   * Get security statistics
   */
  getSecurityStats() {
    return {
      rateLimitEntries: this.rateLimitStore.size,
      blockedIPs: this.blockedIPs.size,
      suspiciousPatterns: this.suspiciousPatterns.size,
      threatIntelligenceEntries: this.threatIntelligence.size
    };
  }
}

// Export singleton instance
export const advancedSecurityManager = new AdvancedSecurityManager();

// Security middleware for payment processing
export const securityMiddleware = {
  /**
   * Pre-payment security check
   */
  async prePaymentCheck(paymentData: any, context: any, userHistory: any[] = []): Promise<SecurityResponse> {
    // Rate limiting check
    const rateLimitConfig: RateLimitConfig = {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 10, // 10 payments per hour
      keyGenerator: (ctx) => `${ctx.userId}_${ctx.ipAddress}`
    };

    if (!advancedSecurityManager.checkRateLimit(context, rateLimitConfig)) {
      return {
        action: 'block',
        reason: 'Rate limit exceeded',
        riskScore: 100,
        recommendations: ['Wait before attempting another payment'],
        requiresManualReview: true
      };
    }

    // Advanced fraud detection
    const fraudResult = advancedSecurityManager.detectAdvancedFraud(paymentData, context, userHistory);
    
    // Execute automated response
    await advancedSecurityManager.executeSecurityResponse(fraudResult, context);
    
    return fraudResult;
  },

  /**
   * Post-payment security monitoring
   */
  async postPaymentMonitoring(paymentData: any, context: any, result: any): Promise<void> {
    // Log successful payment for pattern analysis
    console.log('Payment completed successfully, updating security patterns');
    
    // Update user behavior patterns
    // In production, this would update ML models
  }
};
