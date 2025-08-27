import { TokenService } from './TokenService';

export interface EmailVerificationRequest {
  email: string;
  userId?: string;
}

export interface EmailVerificationResponse {
  success: boolean;
  message: string;
  verificationToken?: string; // Only for demo/testing
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  userId?: string;
  email?: string;
}

export class EmailVerificationService {
  private static readonly PROJECT_ID = 'broad-forest-44850860';
  private static readonly MAX_VERIFICATION_ATTEMPTS = 3; // Max resend attempts per day
  private static readonly RESEND_COOLDOWN = 10 * 60 * 1000; // 10 minutes between resends

  /**
   * Send email verification link
   */
  static async sendVerificationEmail(request: EmailVerificationRequest): Promise<EmailVerificationResponse> {
    try {
      const { email, userId } = request;

      // Validate email format
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return {
          success: false,
          message: 'Please enter a valid email address'
        };
      }

      // Check if user exists and needs verification
      const user = await this.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user doesn't exist
        return {
          success: true,
          message: 'If an account with that email exists, a verification link has been sent.'
        };
      }

      if (user.emailVerified) {
        return {
          success: false,
          message: 'Email address is already verified'
        };
      }

      // Check rate limiting
      const canSend = await this.checkVerificationRateLimit(email);
      if (!canSend) {
        return {
          success: false,
          message: 'Too many verification attempts. Please wait before requesting another verification email.'
        };
      }

      // Generate verification token
      const verificationToken = TokenService.generateEmailVerificationToken(user.id, email);
      
      // Store token in database
      await this.storeVerificationToken(user.id, verificationToken);

      // Send verification email
      await this.sendVerificationEmailMessage(email, verificationToken);

      // Log verification attempt
      await this.logVerificationAttempt(user.id, email);

      return {
        success: true,
        message: 'Verification email sent successfully. Please check your inbox and spam folder.',
        verificationToken: verificationToken // Only for demo
      };

    } catch (error) {
      console.error('Email verification sending error:', error);
      return {
        success: false,
        message: 'Unable to send verification email. Please try again later.'
      };
    }
  }

  /**
   * Verify email with token
   */
  static async verifyEmail(request: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    try {
      const { token } = request;

      if (!token) {
        return {
          success: false,
          message: 'Verification token is required'
        };
      }

      // Verify token
      const tokenData = TokenService.verifyEmailVerificationToken(token);
      if (!tokenData) {
        return {
          success: false,
          message: 'Invalid or expired verification token. Please request a new verification email.'
        };
      }

      // Check if token has been used
      const tokenUsed = await this.checkTokenUsed(token);
      if (tokenUsed) {
        return {
          success: false,
          message: 'This verification token has already been used.'
        };
      }

      // Verify user exists and needs verification
      const user = await this.getUserById(tokenData.userId);
      if (!user) {
        return {
          success: false,
          message: 'User account not found. Please contact support.'
        };
      }

      if (user.emailVerified) {
        return {
          success: true,
          message: 'Email address is already verified'
        };
      }

      // Update user email verification status
      const updateSuccess = await this.markEmailAsVerified(tokenData.userId);
      if (!updateSuccess) {
        return {
          success: false,
          message: 'Failed to verify email. Please try again.'
        };
      }

      // Mark token as used
      await this.markTokenAsUsed(token);

      // Log successful verification
      await this.logEmailVerification(tokenData.userId, tokenData.email);

      // Send welcome email
      await this.sendWelcomeEmail(tokenData.email, user.firstName);

      return {
        success: true,
        message: 'Email verified successfully! Your account is now active.',
        userId: tokenData.userId,
        email: tokenData.email
      };

    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        message: 'Unable to verify email. Please try again later.'
      };
    }
  }

  /**
   * Check verification status
   */
  static async checkVerificationStatus(userId: string): Promise<{ verified: boolean; email?: string }> {
    try {
      const user = await this.getUserById(userId);
      return {
        verified: user?.emailVerified || false,
        email: user?.email
      };
    } catch (error) {
      console.error('Verification status check error:', error);
      return { verified: false };
    }
  }

  /**
   * Resend verification email
   */
  static async resendVerification(email: string): Promise<EmailVerificationResponse> {
    return this.sendVerificationEmail({ email });
  }

  // Private helper methods

  private static async getUserByEmail(email: string): Promise<any> {
    try {
      // Mock user lookup - in production, query database
      const mockUsers = [
        {
          id: 'user-1',
          email: 'superadmin@propcrm.com',
          firstName: 'Super',
          emailVerified: true
        },
        {
          id: 'user-2', 
          email: 'newuser@propcrm.com',
          firstName: 'New',
          emailVerified: false
        },
        {
          id: 'user-3',
          email: 'yasmir01@pm.me',
          firstName: 'Sam',
          emailVerified: false
        }
      ];

      return mockUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
    } catch (error) {
      console.error('User lookup error:', error);
      return null;
    }
  }

  private static async getUserById(userId: string): Promise<any> {
    try {
      // Mock user lookup - in production, query database
      const user = await this.getUserByEmail(''); // Simplified for demo
      return user?.id === userId ? user : null;
    } catch (error) {
      console.error('User lookup by ID error:', error);
      return null;
    }
  }

  private static async checkVerificationRateLimit(email: string): Promise<boolean> {
    try {
      // In production, check database for recent verification attempts
      // For demo, always allow
      return true;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return false;
    }
  }

  private static async storeVerificationToken(userId: string, token: string): Promise<void> {
    try {
      const tokenHash = TokenService.hashToken(token);
      const sql = `
        UPDATE users 
        SET email_verification_token = $1
        WHERE id = $2
      `;
      
      // Mock storage - in production, use real database update
      console.log('Verification token stored for user:', userId);
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

  private static async markEmailAsVerified(userId: string): Promise<boolean> {
    try {
      const sql = `
        UPDATE users 
        SET email_verified = true, email_verification_token = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `;
      
      // Mock update - in production, use real database update
      console.log('Email marked as verified for user:', userId);
      return true;
    } catch (error) {
      console.error('Email verification update error:', error);
      return false;
    }
  }

  private static async markTokenAsUsed(token: string): Promise<void> {
    try {
      // In production, mark token as used in database
      console.log('Verification token marked as used:', token.substring(0, 10) + '...');
    } catch (error) {
      console.error('Token marking error:', error);
    }
  }

  private static async logVerificationAttempt(userId: string, email: string): Promise<void> {
    try {
      const sql = `
        INSERT INTO audit_logs (user_id, action, resource, details)
        VALUES ($1, 'email_verification_sent', 'auth', $2)
      `;
      
      const details = {
        email,
        timestamp: new Date().toISOString()
      };
      
      // Mock logging
      console.log('Email verification attempt logged for user:', userId);
    } catch (error) {
      console.error('Verification attempt logging error:', error);
    }
  }

  private static async logEmailVerification(userId: string, email: string): Promise<void> {
    try {
      const sql = `
        INSERT INTO audit_logs (user_id, action, resource, details)
        VALUES ($1, 'email_verified', 'auth', $2)
      `;
      
      const details = {
        email,
        timestamp: new Date().toISOString()
      };
      
      // Mock logging
      console.log('Email verification logged for user:', userId);
    } catch (error) {
      console.error('Email verification logging error:', error);
    }
  }

  private static async sendVerificationEmailMessage(email: string, verificationToken: string): Promise<void> {
    try {
      // In production, integrate with email service (SendGrid, AWS SES, etc.)
      const verificationUrl = `${window.location.origin}/verify-email?token=${verificationToken}`;
      
      const emailContent = {
        to: email,
        subject: 'Verify Your PropCRM Email Address',
        html: this.getVerificationEmailTemplate(verificationUrl),
        text: `Please verify your PropCRM email by visiting: ${verificationUrl}`
      };
      
      // Mock email sending
      console.log('Verification email sent to:', email);
      console.log('Verification URL:', verificationUrl);
      
      // In demo mode, show verification link in console for testing
      if (process.env.NODE_ENV === 'development') {
        console.log('🔗 Demo Verification Link:', verificationUrl);
      }
    } catch (error) {
      console.error('Verification email sending error:', error);
    }
  }

  private static async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    try {
      const emailContent = {
        to: email,
        subject: 'Welcome to PropCRM!',
        html: this.getWelcomeEmailTemplate(firstName),
        text: `Welcome to PropCRM, ${firstName}! Your email has been verified and your account is now active.`
      };
      
      // Mock email sending
      console.log('Welcome email sent to:', email);
    } catch (error) {
      console.error('Welcome email error:', error);
    }
  }

  private static getVerificationEmailTemplate(verificationUrl: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">Verify Your Email Address</h2>
        <p>Thank you for signing up for PropCRM! Please verify your email address to activate your account.</p>
        <p>Click the button below to verify your email:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #1976d2; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>This verification link will expire in 24 hours for security reasons.</p>
        <p>If you didn't create an account with PropCRM, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          Best regards,<br>
          The PropCRM Team
        </p>
      </div>
    `;
  }

  private static getWelcomeEmailTemplate(firstName: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">Welcome to PropCRM, ${firstName}!</h2>
        <p>Your email has been successfully verified and your account is now active.</p>
        <p>You can now access all features of the PropCRM property management system:</p>
        <ul>
          <li>Manage properties and tenants</li>
          <li>Track maintenance requests</li>
          <li>Generate reports and analytics</li>
          <li>Communicate with tenants and staff</li>
          <li>And much more!</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${window.location.origin}/crm" style="background-color: #1976d2; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Access Your Dashboard
          </a>
        </div>
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          Best regards,<br>
          The PropCRM Team
        </p>
      </div>
    `;
  }
}
