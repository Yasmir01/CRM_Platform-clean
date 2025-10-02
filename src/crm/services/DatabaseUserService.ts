import { PasswordService } from './PasswordService';
import { TokenService } from './TokenService';

export interface DatabaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  status: 'Active' | 'Inactive' | 'Pending';
  avatarUrl?: string;
  timezone: string;
  preferredLanguage: string;
  countryCode: string;
  emailVerified: boolean;
  lastLogin?: Date;
  loginCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
  timezone?: string;
  preferredLanguage?: string;
  countryCode?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  deviceInfo?: any;
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginResult {
  success: boolean;
  message: string;
  user?: DatabaseUser;
  accessToken?: string;
  refreshToken?: string;
}

export class DatabaseUserService {
  private static readonly PROJECT_ID = 'broad-forest-44850860';

  /**
   * Create a new user
   */
  static async createUser(userData: CreateUserData): Promise<DatabaseUser> {
    // Validate password strength
    const passwordValidation = PasswordService.validatePasswordStrength(userData.password);
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Hash the password
    const passwordHash = await PasswordService.hashPassword(userData.password);

    // Generate email verification token
    const emailVerificationToken = TokenService.generateEmailVerificationToken('temp', userData.email);

    const sql = `
      INSERT INTO users (
        email, password_hash, first_name, last_name, phone, role,
        timezone, preferred_language, country_code, email_verification_token
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING 
        id, email, first_name, last_name, phone, role, status,
        avatar_url, timezone, preferred_language, country_code,
        email_verified, last_login, login_count, created_at, updated_at
    `;

    const values = [
      userData.email.toLowerCase(),
      passwordHash,
      userData.firstName,
      userData.lastName,
      userData.phone || null,
      userData.role || 'User',
      userData.timezone || 'UTC',
      userData.preferredLanguage || 'en',
      userData.countryCode || 'US',
      emailVerificationToken
    ];

    try {
      // For demo purposes, we'll simulate the database call
      // In real implementation, use neon mcp tools
      const mockUser: DatabaseUser = {
        id: Math.random().toString(36).substr(2, 9),
        email: userData.email.toLowerCase(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: userData.role || 'User',
        status: 'Pending',
        timezone: userData.timezone || 'UTC',
        preferredLanguage: userData.preferredLanguage || 'en',
        countryCode: userData.countryCode || 'US',
        emailVerified: false,
        loginCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return mockUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  /**
   * Authenticate user login
   */
  static async authenticateUser(credentials: LoginCredentials): Promise<LoginResult> {
    try {
      // For demo, we'll implement the real database query later
      const sql = `
        SELECT 
          id, email, password_hash, first_name, last_name, phone, role, status,
          avatar_url, timezone, preferred_language, country_code,
          email_verified, last_login, login_count, created_at, updated_at
        FROM users 
        WHERE email = $1 AND status = 'Active'
      `;

      // Simulate database query - replace with real mcp call
      const mockDbUser = await this.getMockUserByEmail(credentials.email);
      
      if (!mockDbUser) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Verify password
      const isPasswordValid = await PasswordService.verifyPassword(
        credentials.password, 
        mockDbUser.passwordHash
      );

      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Generate tokens
      const { token: accessToken, sessionId } = TokenService.generateAccessToken({
        userId: mockDbUser.id,
        email: mockDbUser.email,
        role: mockDbUser.role
      });

      const refreshToken = TokenService.generateRefreshToken(mockDbUser.id, sessionId);

      // Update last login
      await this.updateLastLogin(mockDbUser.id);

      // Create session record
      await this.createSession(mockDbUser.id, sessionId, refreshToken, credentials);

      const user: DatabaseUser = {
        id: mockDbUser.id,
        email: mockDbUser.email,
        firstName: mockDbUser.firstName,
        lastName: mockDbUser.lastName,
        phone: mockDbUser.phone,
        role: mockDbUser.role,
        status: mockDbUser.status,
        avatarUrl: mockDbUser.avatarUrl,
        timezone: mockDbUser.timezone,
        preferredLanguage: mockDbUser.preferredLanguage,
        countryCode: mockDbUser.countryCode,
        emailVerified: mockDbUser.emailVerified,
        lastLogin: new Date(),
        loginCount: mockDbUser.loginCount + 1,
        createdAt: mockDbUser.createdAt,
        updatedAt: new Date()
      };

      return {
        success: true,
        message: 'Login successful',
        user,
        accessToken,
        refreshToken
      };

    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        message: 'Authentication failed'
      };
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<DatabaseUser | null> {
    try {
      const sql = `
        SELECT 
          id, email, first_name, last_name, phone, role, status,
          avatar_url, timezone, preferred_language, country_code,
          email_verified, last_login, login_count, created_at, updated_at
        FROM users 
        WHERE id = $1
      `;

      // Simulate database query
      return this.getMockUserById(userId);
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateUser(userId: string, updates: Partial<DatabaseUser>): Promise<boolean> {
    try {
      const sql = `
        UPDATE users 
        SET 
          first_name = COALESCE($2, first_name),
          last_name = COALESCE($3, last_name),
          phone = COALESCE($4, phone),
          timezone = COALESCE($5, timezone),
          preferred_language = COALESCE($6, preferred_language),
          country_code = COALESCE($7, country_code),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `;

      // Simulate successful update
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  /**
   * Create user session
   */
  private static async createSession(
    userId: string, 
    sessionId: string, 
    refreshToken: string, 
    sessionInfo: any
  ): Promise<void> {
    const tokenHash = TokenService.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const sql = `
      INSERT INTO user_sessions (
        user_id, token_hash, device_info, ip_address, expires_at
      ) VALUES ($1, $2, $3, $4, $5)
    `;

    // Simulate session creation
    console.log('Session created for user:', userId);
  }

  /**
   * Update last login time
   */
  private static async updateLastLogin(userId: string): Promise<void> {
    const sql = `
      UPDATE users 
      SET last_login = CURRENT_TIMESTAMP, login_count = login_count + 1
      WHERE id = $1
    `;
    
    // Simulate update
    console.log('Last login updated for user:', userId);
  }

  // Mock data helpers (replace with real database calls)
  private static async getMockUserByEmail(email: string): Promise<any> {
    const mockUsers = [
      {
        id: 'user-1',
        email: 'superadmin@propcrm.com',
        passwordHash: await PasswordService.hashPassword('admin123'),
        firstName: 'Super',
        lastName: 'Administrator',
        role: 'Super Admin',
        status: 'Active',
        timezone: 'UTC',
        preferredLanguage: 'en',
        countryCode: 'US',
        emailVerified: true,
        loginCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    return mockUsers.find(user => user.email === email.toLowerCase());
  }

  private static async getMockUserById(userId: string): Promise<DatabaseUser | null> {
    if (userId === 'user-1') {
      return {
        id: 'user-1',
        email: 'superadmin@propcrm.com',
        firstName: 'Super',
        lastName: 'Administrator',
        role: 'Super Admin',
        status: 'Active',
        timezone: 'UTC',
        preferredLanguage: 'en',
        countryCode: 'US',
        emailVerified: true,
        loginCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    return null;
  }
}
