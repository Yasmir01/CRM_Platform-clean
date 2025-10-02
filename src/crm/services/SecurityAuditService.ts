export interface AuditLogEntry {
  id?: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'auth' | 'user' | 'data' | 'system' | 'security';
}

export interface SecurityEvent {
  type: string;
  userId?: string;
  details: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  ipAddress?: string;
  userAgent?: string;
}

export interface SessionInfo {
  sessionId: string;
  userId: string;
  deviceInfo: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastUsed: Date;
  expiresAt: Date;
  isActive: boolean;
}

export class SecurityAuditService {
  private static readonly PROJECT_ID = 'broad-forest-44850860';
  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes
  private static readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Log security event to audit trail
   */
  static async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      const auditEntry: AuditLogEntry = {
        userId: event.userId,
        action: event.type,
        resource: 'security',
        details: {
          ...event.details,
          eventType: event.type,
          timestamp: new Date().toISOString()
        },
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        timestamp: new Date(),
        severity: event.severity || 'medium',
        category: 'security'
      };

      await this.writeAuditLog(auditEntry);

      // Check for suspicious activity
      await this.analyzeSuspiciousActivity(event);

    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Log authentication events
   */
  static async logAuthEvent(
    action: 'login_success' | 'login_failure' | 'logout' | 'password_change' | 'account_locked',
    userId?: string,
    details: Record<string, any> = {},
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const severity = this.getAuthEventSeverity(action);
    
    await this.logSecurityEvent({
      type: action,
      userId,
      details: {
        ...details,
        action
      },
      severity,
      ipAddress,
      userAgent
    });
  }

  /**
   * Log user management events
   */
  static async logUserEvent(
    action: 'user_created' | 'user_updated' | 'user_deleted' | 'role_changed' | 'permissions_changed',
    targetUserId: string,
    adminUserId?: string,
    details: Record<string, any> = {},
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logSecurityEvent({
      type: action,
      userId: adminUserId,
      details: {
        ...details,
        targetUserId,
        action
      },
      severity: 'medium',
      ipAddress,
      userAgent
    });
  }

  /**
   * Log data access events
   */
  static async logDataEvent(
    action: 'data_accessed' | 'data_modified' | 'data_deleted' | 'data_exported',
    userId: string,
    resourceType: string,
    resourceId: string,
    details: Record<string, any> = {},
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.logSecurityEvent({
      type: action,
      userId,
      details: {
        ...details,
        resourceType,
        resourceId,
        action
      },
      severity: this.getDataEventSeverity(action),
      ipAddress,
      userAgent
    });
  }

  /**
   * Check for failed login attempts and potential brute force
   */
  static async checkFailedLoginAttempts(email: string, ipAddress?: string): Promise<{
    isLocked: boolean;
    remainingAttempts: number;
    lockoutEndTime?: Date;
  }> {
    try {
      // Get recent failed attempts for this email/IP
      const recentAttempts = await this.getRecentFailedAttempts(email, ipAddress);
      
      const now = new Date();
      const lockoutEndTime = new Date(now.getTime() - this.LOCKOUT_DURATION);
      
      // Filter attempts within lockout period
      const recentFailures = recentAttempts.filter(attempt => 
        attempt.timestamp > lockoutEndTime
      );

      const remainingAttempts = Math.max(0, this.MAX_LOGIN_ATTEMPTS - recentFailures.length);
      const isLocked = recentFailures.length >= this.MAX_LOGIN_ATTEMPTS;

      if (isLocked) {
        // Log account lockout
        await this.logAuthEvent('account_locked', undefined, {
          email,
          attemptCount: recentFailures.length,
          lockoutDuration: this.LOCKOUT_DURATION
        }, ipAddress);
      }

      return {
        isLocked,
        remainingAttempts,
        lockoutEndTime: isLocked ? new Date(now.getTime() + this.LOCKOUT_DURATION) : undefined
      };

    } catch (error) {
      console.error('Failed to check login attempts:', error);
      return { isLocked: false, remainingAttempts: this.MAX_LOGIN_ATTEMPTS };
    }
  }

  /**
   * Create new user session
   */
  static async createSession(
    sessionId: string,
    userId: string,
    deviceInfo: Record<string, any>,
    ipAddress: string,
    userAgent: string,
    refreshToken: string
  ): Promise<boolean> {
    try {
      const tokenHash = require('crypto').createHash('sha256').update(refreshToken).digest('hex');
      const expiresAt = new Date(Date.now() + this.SESSION_TIMEOUT);

      const sql = `
        INSERT INTO user_sessions (
          id, user_id, token_hash, device_info, ip_address, expires_at, created_at, last_used
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;

      // Mock session creation - in production, use real database
      console.log('Session created:', { sessionId, userId, deviceInfo, ipAddress });

      // Log session creation
      await this.logSecurityEvent({
        type: 'session_created',
        userId,
        details: {
          sessionId,
          deviceInfo,
          expiresAt: expiresAt.toISOString()
        },
        severity: 'low',
        ipAddress,
        userAgent
      });

      return true;
    } catch (error) {
      console.error('Failed to create session:', error);
      return false;
    }
  }

  /**
   * Update session last used time
   */
  static async updateSessionActivity(sessionId: string, ipAddress?: string): Promise<void> {
    try {
      const sql = `
        UPDATE user_sessions 
        SET last_used = CURRENT_TIMESTAMP, ip_address = COALESCE($2, ip_address)
        WHERE id = $1
      `;

      // Mock session update
      console.log('Session activity updated:', sessionId);
    } catch (error) {
      console.error('Failed to update session activity:', error);
    }
  }

  /**
   * Invalidate user session
   */
  static async invalidateSession(sessionId: string, reason: string = 'logout'): Promise<void> {
    try {
      const sql = `DELETE FROM user_sessions WHERE id = $1`;

      // Mock session invalidation
      console.log('Session invalidated:', sessionId, 'Reason:', reason);

      // Log session termination
      await this.logSecurityEvent({
        type: 'session_terminated',
        details: {
          sessionId,
          reason
        },
        severity: 'low'
      });
    } catch (error) {
      console.error('Failed to invalidate session:', error);
    }
  }

  /**
   * Get active sessions for user
   */
  static async getUserSessions(userId: string): Promise<SessionInfo[]> {
    try {
      const sql = `
        SELECT id, user_id, device_info, ip_address, created_at, last_used, expires_at
        FROM user_sessions 
        WHERE user_id = $1 AND expires_at > CURRENT_TIMESTAMP
        ORDER BY last_used DESC
      `;

      // Mock sessions data
      const mockSessions: SessionInfo[] = [
        {
          sessionId: 'session-1',
          userId,
          deviceInfo: { platform: 'Web', browser: 'Chrome' },
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          createdAt: new Date(),
          lastUsed: new Date(),
          expiresAt: new Date(Date.now() + this.SESSION_TIMEOUT),
          isActive: true
        }
      ];

      return mockSessions;
    } catch (error) {
      console.error('Failed to get user sessions:', error);
      return [];
    }
  }

  /**
   * Clean up expired sessions
   */
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      const sql = `DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP`;

      // Mock cleanup
      const deletedCount = Math.floor(Math.random() * 10);
      console.log('Cleaned up expired sessions:', deletedCount);

      return deletedCount;
    } catch (error) {
      console.error('Failed to cleanup expired sessions:', error);
      return 0;
    }
  }

  /**
   * Get audit logs with filtering
   */
  static async getAuditLogs(filters: {
    userId?: string;
    action?: string;
    category?: string;
    severity?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: AuditLogEntry[]; total: number }> {
    try {
      // Mock audit logs data
      const mockLogs: AuditLogEntry[] = [
        {
          id: '1',
          userId: 'user-1',
          action: 'login_success',
          resource: 'auth',
          details: { email: 'admin@propcrm.com' },
          ipAddress: '192.168.1.100',
          timestamp: new Date(),
          severity: 'low',
          category: 'auth'
        },
        {
          id: '2',
          userId: 'user-1',
          action: 'user_created',
          resource: 'user_management',
          resourceId: 'user-2',
          details: { newUserEmail: 'newuser@propcrm.com' },
          ipAddress: '192.168.1.100',
          timestamp: new Date(Date.now() - 3600000),
          severity: 'medium',
          category: 'user'
        }
      ];

      return {
        logs: mockLogs,
        total: mockLogs.length
      };
    } catch (error) {
      console.error('Failed to get audit logs:', error);
      return { logs: [], total: 0 };
    }
  }

  // Private helper methods

  private static async writeAuditLog(entry: AuditLogEntry): Promise<void> {
    try {
      const sql = `
        INSERT INTO audit_logs (
          user_id, action, resource, resource_id, details, ip_address, user_agent, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;

      // Mock audit log writing
      console.log('Audit log written:', {
        action: entry.action,
        resource: entry.resource,
        severity: entry.severity,
        userId: entry.userId
      });
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }

  private static async getRecentFailedAttempts(email: string, ipAddress?: string): Promise<AuditLogEntry[]> {
    try {
      // Mock failed attempts data
      return [];
    } catch (error) {
      console.error('Failed to get recent failed attempts:', error);
      return [];
    }
  }

  private static async analyzeSuspiciousActivity(event: SecurityEvent): Promise<void> {
    try {
      // Analyze patterns for:
      // - Multiple failed logins from same IP
      // - Login from unusual locations
      // - Unusual access patterns
      // - Multiple simultaneous sessions
      
      const suspiciousPatterns = [
        'rapid_login_attempts',
        'unusual_location',
        'multiple_sessions',
        'privilege_escalation'
      ];

      // Mock suspicious activity detection
      if (event.type === 'login_failure' && event.ipAddress) {
        console.log('Analyzing suspicious activity for IP:', event.ipAddress);
      }
    } catch (error) {
      console.error('Failed to analyze suspicious activity:', error);
    }
  }

  private static getAuthEventSeverity(action: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (action) {
      case 'login_success':
      case 'logout':
        return 'low';
      case 'login_failure':
        return 'medium';
      case 'password_change':
        return 'medium';
      case 'account_locked':
        return 'high';
      default:
        return 'medium';
    }
  }

  private static getDataEventSeverity(action: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (action) {
      case 'data_accessed':
        return 'low';
      case 'data_modified':
        return 'medium';
      case 'data_deleted':
        return 'high';
      case 'data_exported':
        return 'medium';
      default:
        return 'medium';
    }
  }
}
