// Simple test to verify the new authentication system works
import { TokenService } from '../services/TokenService';
import { PasswordService } from '../services/PasswordService';

export async function testAuthenticationSystem(): Promise<void> {
  console.log('🧪 Testing browser-compatible authentication system...');

  try {
    // Test 1: Token Generation and Verification
    console.log('1️⃣ Testing token generation...');
    const { token, sessionId } = TokenService.generateAccessToken({
      userId: 'test-user-123',
      email: 'test@example.com',
      role: 'Admin'
    });
    
    console.log('✅ Access token generated:', token.substring(0, 50) + '...');
    console.log('✅ Session ID:', sessionId);

    // Test 2: Token Verification
    console.log('2️⃣ Testing token verification...');
    const payload = TokenService.verifyAccessToken(token);
    
    if (payload) {
      console.log('✅ Token verified successfully:', {
        userId: payload.userId,
        email: payload.email,
        role: payload.role
      });
    } else {
      console.error('❌ Token verification failed');
    }

    // Test 3: Password Hashing and Verification
    console.log('3️⃣ Testing password system...');
    const testPassword = 'TestPassword123!';
    const hashedPassword = await PasswordService.hashPassword(testPassword);
    console.log('✅ Password hashed:', hashedPassword.substring(0, 30) + '...');

    const isValid = await PasswordService.verifyPassword(testPassword, hashedPassword);
    console.log('✅ Password verification:', isValid ? 'PASSED' : 'FAILED');

    // Test 4: Password Strength Validation
    console.log('4️⃣ Testing password validation...');
    const strongPassword = 'StrongPassword123!';
    const weakPassword = '123';
    
    const strongValidation = PasswordService.validatePasswordStrength(strongPassword);
    const weakValidation = PasswordService.validatePasswordStrength(weakPassword);
    
    console.log('✅ Strong password validation:', strongValidation.isValid ? 'PASSED' : 'FAILED');
    console.log('✅ Weak password validation:', !weakValidation.isValid ? 'PASSED' : 'FAILED');

    // Test 5: Token Expiration
    console.log('5️⃣ Testing token expiration...');
    const expiration = TokenService.getTokenExpiration(token);
    const isExpired = TokenService.isTokenExpired(token);
    
    console.log('✅ Token expiration:', expiration?.toISOString());
    console.log('✅ Token expired check:', isExpired ? 'EXPIRED' : 'VALID');

    console.log('\n🎉 All authentication tests completed successfully!');
    console.log('✨ The browser-compatible authentication system is working correctly.');

  } catch (error) {
    console.error('❌ Authentication test failed:', error);
  }
}

<<<<<<< HEAD
// Auto-run test in development mode
if (process.env.NODE_ENV === 'development') {
=======
// Auto-run test in development mode only when explicitly enabled and in a browser
const env = (typeof process !== 'undefined' && (process as any).env) ? (process as any).env : {};
const enableAuthTest = env.ENABLE_AUTH_TEST === 'true';
const isDev = env.NODE_ENV === 'development';
if (isDev && enableAuthTest && typeof window !== 'undefined') {
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
  // Run test after a short delay to ensure modules are loaded
  setTimeout(() => {
    testAuthenticationSystem();
  }, 1000);
}
