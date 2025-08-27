import { TokenService } from './TokenService';
import { PasswordService } from './PasswordService';
import { DatabaseUserService } from './DatabaseUserService';

export interface PasswordResetRequest {
  email: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  resetToken?: string; // Only for demo/testing
}

export interface PasswordChangeRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordChangeResponse {
  success: boolean;
  message: string;
}

export class PasswordResetService {
  private static readonly PROJECT_ID = 'broad-forest-44850860';
  private static readonly MAX_RESET_ATTEMPTS = 5; // Max attempts per hour
  private static readonly RESET_COOLDOWN = 15 * 60 * 1000; // 15 minutes between requests

  /**
   * Initiate password reset process
   */
  static async initiatePasswordReset(request: PasswordResetRequest): Promise<PasswordResetResponse> {
    try {
      const { email, ipAddress, userAgent } = request;

      // Validate email format
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return {
          success: false,
          message: 'Please enter a valid email address'
        };
      }

      // Check rate limiting
      const canRequest = await this.checkResetRateLimit(email, ipAddress);
      if (!canRequest) {
        return {
          success: false,
          message: 'Too many reset attempts. Please wait before trying again.'
        };
      }

      // Check if user exists (in production, don't reveal if email exists)
      const userExists = await this.checkUserExists(email);
      
      // Always return success to prevent email enumeration
      // In production, send email only if user exists
      if (userExists) {
        const resetToken = await this.generateResetToken(email);
        await this.sendPasswordResetEmail(email, resetToken);
        await this.logResetAttempt(email, ipAddress, userAgent, true);
      } else {
        // Log failed attempt but don't reveal user doesn't exist
        await this.logResetAttempt(email, ipAddress, userAgent, false);
      }

      return {
        success: true,
        message: 'If an account with that email exists, you will receive password reset instructions.',
        resetToken: userExists ? await this.generateResetToken(email) : undefined // Only for demo
      };

    } catch (error) {
      console.error('Password reset initiation error:', error);
      return {
        success: false,
        message: 'Unable to process password reset request. Please try again later.'
      };
    }
  }

  /**
   * Verify reset token and change password
   */
  static async changePasswordWithToken(request: PasswordChangeRequest): Promise<PasswordChangeResponse> {
    try {
      const { token, newPassword, confirmPassword } = request;

      // Validate passwords match
      if (newPassword !== confirmPassword) {
        return {
          success: false,
          message: 'Passwords do not match'
        };
      }

      // Validate password strength
      const passwordValidation = PasswordService.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          message: `Password requirements not met: ${passwordValidation.errors.join(', ')}`
        };
      }

      // Verify reset token
      const tokenData = TokenService.verifyPasswordResetToken(token);
      if (!tokenData) {
        return {
          success: false,
          message: 'Invalid or expired reset token. Please request a new password reset.'
        };
      }

      // Check if token has been used
      const tokenUsed = await this.checkTokenUsed(token);
      if (tokenUsed) {
        return {
          success: false,
          message: 'This reset token has already been used. Please request a new password reset.'
        };
      }

      // Update password in database
      const passwordHash = await PasswordService.hashPassword(newPassword);
      const updateSuccess = await this.updateUserPassword(tokenData.userId, passwordHash);
      
      if (!updateSuccess) {
        return {
          success: false,
          message: 'Failed to update password. Please try again.'
        };
      }

      // Mark token as used
      await this.markTokenAsUsed(token);

      // Invalidate all user sessions for security
      await this.invalidateAllUserSessions(tokenData.userId);

      // Log password change
      await this.logPasswordChange(tokenData.userId, tokenData.email);

      // Send confirmation email
      await this.sendPasswordChangeConfirmation(tokenData.email);

      return {
        success: true,
        message: 'Password has been successfully updated. Please log in with your new password.'
      };

    } catch (error) {
      console.error('Password change error:', error);
      return {
        success: false,
        message: 'Unable to change password. Please try again later.'
      };
    }
  }

  /**
   * Validate reset token without using it
   */
  static async validateResetToken(token: string): Promise<{ valid: boolean; email?: string; expiresAt?: Date }> {
    try {
      const tokenData = TokenService.verifyPasswordResetToken(token);
      if (!tokenData) {
        return { valid: false };
      }

      const tokenUsed = await this.checkTokenUsed(token);
      if (tokenUsed) {
        return { valid: false };
      }

      const expiresAt = TokenService.getTokenExpiration(token);
      
      return {
        valid: true,
        email: tokenData.email,
        expiresAt: expiresAt || undefined
      };

    } catch (error) {
      console.error('Token validation error:', error);
      return { valid: false };
    }
  }

  // Private helper methods

  private static async checkResetRateLimit(email: string, ipAddress?: string): Promise<boolean> {
    try {
      // In production, check database for recent reset attempts
      // For now, return true (no rate limiting in demo)
      return true;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return false;
    }
  }

  private static async checkUserExists(email: string): Promise<boolean> {
    try {
      // Check database for user
      const sql = `SELECT id FROM users WHERE email = $1 AND status = 'Active'`;
      
      // Mock check - in production, use real database query
      const mockUsers = [
        'superadmin@propcrm.com',
        'admin@propcrm.com', 
        'alex@acmecrm.com',
        'yasmir01@pm.me'
      ];
      
      return mockUsers.includes(email.toLowerCase());
    } catch (error) {
      console.error('User existence check error:', error);
      return false;
    }
  }

  private static async generateResetToken(email: string): Promise<string> {
    try {
      // Get user ID (in production, query database)
      const userId = 'mock-user-id'; // Replace with real user ID lookup
      
      const token = TokenService.generatePasswordResetToken(userId, email);
      
      // Store token in database with expiration
      await this.storeResetToken(userId, token);
      
      return token;
    } catch (error) {
      console.error('Token generation error:', error);
      throw error;
    }
  }

  private static async storeResetToken(userId: string, token: string): Promise<void> {
    try {
      const tokenHash = TokenService.hashToken(token);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      
      const sql = `
        UPDATE users 
        SET password_reset_token = $1, password_reset_expires = $2
        WHERE id = $3
      `;
      
      // Mock storage - in production, use real database update
      console.log('Reset token stored for user:', userId);
    } catch (error) {
      console.error('Token storage error:', error);
      throw error;
    }
  }

  private static async checkTokenUsed(token: string): Promise<boolean> {
    try {
      // In production, check if token has been used
      // For demo, assume tokens are not used
      return false;
    } catch (error) {
      console.error('Token usage check error:', error);
      return true; // Assume used on error for security
    }
  }

  private static async markTokenAsUsed(token: string): Promise<void> {
    try {
      // In production, mark token as used in database
      console.log('Token marked as used:', token.substring(0, 10) + '...');
    } catch (error) {
      console.error('Token marking error:', error);
    }
  }

  private static async updateUserPassword(userId: string, passwordHash: string): Promise<boolean> {
    try {
      const sql = `
        UPDATE users 
        SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `;
      
      // Mock update - in production, use real database update
      console.log('Password updated for user:', userId);
      return true;
    } catch (error) {
      console.error('Password update error:', error);
      return false;
    }
  }

  private static async invalidateAllUserSessions(userId: string): Promise<void> {
    try {
      const sql = `DELETE FROM user_sessions WHERE user_id = $1`;
      
      // Mock session invalidation
      console.log('All sessions invalidated for user:', userId);
    } catch (error) {
      console.error('Session invalidation error:', error);
    }
  }

  private static async logResetAttempt(email: string, ipAddress?: string, userAgent?: string, success: boolean = true): Promise<void> {
    try {
      const sql = `
        INSERT INTO audit_logs (user_id, action, resource, details, ip_address, user_agent)
        VALUES (NULL, 'password_reset_request', 'auth', $1, $2, $3)
      `;
      
      const details = {
        email,
        success,
        timestamp: new Date().toISOString()
      };
      
      // Mock logging
      console.log('Password reset attempt logged:', details);
    } catch (error) {
      console.error('Reset attempt logging error:', error);
    }
  }

  private static async logPasswordChange(userId: string, email: string): Promise<void> {
    try {
      const sql = `
        INSERT INTO audit_logs (user_id, action, resource, details)
        VALUES ($1, 'password_changed', 'auth', $2)
      `;
      
      const details = {
        email,
        timestamp: new Date().toISOString(),
        method: 'reset_token'
      };
      
      // Mock logging
      console.log('Password change logged for user:', userId);
    } catch (error) {
      console.error('Password change logging error:', error);
    }
  }

  private static async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    try {
      // In production, integrate with email service (SendGrid, AWS SES, etc.)
      const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;
      
      const emailContent = {
        to: email,
        subject: 'PropCRM Password Reset Request',
        html: this.getPasswordResetEmailTemplate(resetUrl),
        text: `Reset your PropCRM password by visiting: ${resetUrl}`
      };
      
      // Mock email sending
      console.log('Password reset email sent to:', email);
      console.log('Reset URL:', resetUrl);
      
      // In demo mode, show reset link in console for testing
      if (process.env.NODE_ENV === 'development') {
        console.log('🔗 Demo Reset Link:', resetUrl);
      }
    } catch (error) {
      console.error('Email sending error:', error);
    }
  }

  private static async sendPasswordChangeConfirmation(email: string): Promise<void> {
    try {
      const emailContent = {
        to: email,
        subject: 'PropCRM Password Changed Successfully',
        html: this.getPasswordChangeConfirmationTemplate(),
        text: 'Your PropCRM password has been successfully changed. If you did not make this change, please contact support immediately.'
      };
      
      // Mock email sending
      console.log('Password change confirmation sent to:', email);
    } catch (error) {
      console.error('Confirmation email error:', error);
    }
  }

  private static getPasswordResetEmailTemplate(resetUrl: string): string {
    return `
      <h2>Reset Your PropCRM Password</h2>
      <p>You recently requested to reset your password for your PropCRM account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="background-color: #1976d2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset Password</a>
      <p>This link will expire in 1 hour for security reasons.</p>
      <p>If you didn't request this password reset, please ignore this email.</p>
      <p>Best regards,<br>The PropCRM Team</p>
    `;
  }

  private static getPasswordChangeConfirmationTemplate(): string {
    return `
      <h2>Password Changed Successfully</h2>
      <p>Your PropCRM password has been successfully changed.</p>
      <p>If you made this change, no further action is required.</p>
      <p>If you did not make this change, please contact our support team immediately.</p>
      <p>Best regards,<br>The PropCRM Team</p>
    `;
  }
}
