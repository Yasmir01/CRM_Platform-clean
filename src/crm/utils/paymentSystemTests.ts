// Comprehensive End-to-End Payment System Testing
// This module provides testing utilities for the entire payment flow

import { enhancedPaymentService } from '../services/EnhancedPaymentService';
import { bankAccountService } from '../services/BankAccountService';
import { PaymentEncryption, FraudDetection } from './paymentSecurity';
import { PCIComplianceValidator } from './pciComplianceValidator';

export interface TestResult {
  testName: string;
  passed: boolean;
  duration: number;
  details: string;
  errors?: string[];
}

export interface TestSuite {
  suiteName: string;
  results: TestResult[];
  overallPassed: boolean;
  totalDuration: number;
  passedCount: number;
  failedCount: number;
}

export class PaymentSystemTester {
  private static testData = {
    validTenantId: 'tenant_123',
    validBankAccount: {
      bankName: 'Test Bank',
      accountType: 'checking' as const,
      accountNumber: '1234567890',
      routingNumber: '021000021',
      accountHolderName: 'John Doe'
    },
    validPayment: {
      amount: 150000, // $1,500
      propertyId: 'prop_123',
      tenantId: 'tenant_123',
      dueDate: new Date().toISOString(),
      description: 'Monthly rent payment'
    },
    securityContext: {
      sessionId: 'sess_123',
      userAgent: 'TestAgent/1.0',
      ipAddress: '192.168.1.1',
      timestamp: Date.now(),
      userId: 'user_123',
      protocol: 'https',
      tlsVersion: 1.3,
      userRole: 'tenant',
      permissions: ['payment:create'],
      authenticated: true,
      authMethod: 'mfa',
      auditLogging: true
    }
  };

  /**
   * Run comprehensive payment system tests
   */
  static async runFullTestSuite(): Promise<TestSuite[]> {
    console.log('🚀 Starting comprehensive payment system test suite...');
    
    const suites: TestSuite[] = [];

    // Test bank account management
    suites.push(await this.testBankAccountManagement());
    
    // Test payment processing
    suites.push(await this.testPaymentProcessing());
    
    // Test security features
    suites.push(await this.testSecurityFeatures());
    
    // Test compliance validation
    suites.push(await this.testComplianceValidation());
    
    // Test integration flows
    suites.push(await this.testIntegrationFlows());

    // Generate summary
    this.generateTestSummary(suites);

    return suites;
  }

  /**
   * Test bank account management functionality
   */
  private static async testBankAccountManagement(): Promise<TestSuite> {
    const results: TestResult[] = [];
    const startTime = Date.now();

    // Test 1: Connect bank account
    try {
      const start = Date.now();
      const mockPlaidResult = {
        publicToken: 'test_token',
        metadata: {
          institution: { name: 'Test Bank', institution_id: 'ins_123' },
          accounts: [{
            id: 'acc_123',
            name: 'Checking',
            type: 'depository',
            subtype: 'checking',
            mask: '1234'
          }],
          link_session_id: 'link_123'
        }
      };

      const connection = await bankAccountService.connectBankAccount(
        this.testData.validTenantId,
        mockPlaidResult,
        'acc_123'
      );

      results.push({
        testName: 'Connect Bank Account',
        passed: connection && connection.id ? true : false,
        duration: Date.now() - start,
        details: `Bank connection created with ID: ${connection.id}`
      });
    } catch (error) {
      results.push({
        testName: 'Connect Bank Account',
        passed: false,
        duration: Date.now() - startTime,
        details: 'Failed to connect bank account',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }

    // Test 2: Verify bank account
    try {
      const start = Date.now();
      const connections = await bankAccountService.getBankConnections(this.testData.validTenantId);
      
      if (connections.length > 0) {
        const verification = await bankAccountService.initiateVerification(connections[0].id, 'instant');
        
        results.push({
          testName: 'Bank Account Verification',
          passed: verification && verification.status === 'pending',
          duration: Date.now() - start,
          details: `Verification initiated with status: ${verification.status}`
        });
      } else {
        results.push({
          testName: 'Bank Account Verification',
          passed: false,
          duration: Date.now() - start,
          details: 'No bank connections found for verification',
          errors: ['No bank connections available']
        });
      }
    } catch (error) {
      results.push({
        testName: 'Bank Account Verification',
        passed: false,
        duration: Date.now() - startTime,
        details: 'Failed to verify bank account',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }

    // Test 3: Validate bank account information
    try {
      const start = Date.now();
      const validation = await bankAccountService.validateBankAccount(
        this.testData.validBankAccount.routingNumber,
        this.testData.validBankAccount.accountNumber
      );

      results.push({
        testName: 'Bank Account Validation',
        passed: validation.routingNumber.isValid,
        duration: Date.now() - start,
        details: `Routing number validation: ${validation.routingNumber.isValid ? 'passed' : 'failed'}`
      });
    } catch (error) {
      results.push({
        testName: 'Bank Account Validation',
        passed: false,
        duration: Date.now() - startTime,
        details: 'Failed to validate bank account',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }

    const totalDuration = Date.now() - startTime;
    const passedCount = results.filter(r => r.passed).length;

    return {
      suiteName: 'Bank Account Management',
      results,
      overallPassed: passedCount === results.length,
      totalDuration,
      passedCount,
      failedCount: results.length - passedCount
    };
  }

  /**
   * Test payment processing functionality
   */
  private static async testPaymentProcessing(): Promise<TestSuite> {
    const results: TestResult[] = [];
    const startTime = Date.now();

    // Test 1: Create rent payment
    try {
      const start = Date.now();
      const payment = await enhancedPaymentService.createRentPayment(this.testData.validPayment);

      results.push({
        testName: 'Create Rent Payment',
        passed: payment && payment.id ? true : false,
        duration: Date.now() - start,
        details: `Payment created with ID: ${payment.id}, Amount: ${payment.amount}`
      });
    } catch (error) {
      results.push({
        testName: 'Create Rent Payment',
        passed: false,
        duration: Date.now() - startTime,
        details: 'Failed to create rent payment',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }

    // Test 2: Process ACH payment
    try {
      const start = Date.now();
      const paymentMethods = await enhancedPaymentService.getPaymentMethods(this.testData.validTenantId);
      const bankMethod = paymentMethods.find(pm => pm.type === 'ach');

      if (bankMethod) {
        const payments = await enhancedPaymentService.getRentPayments(this.testData.validTenantId);
        const testPayment = payments[0];

        if (testPayment) {
          const processResult = await enhancedPaymentService.processPayment(testPayment.id, bankMethod.id);
          
          results.push({
            testName: 'Process ACH Payment',
            passed: processResult && processResult.transactionId ? true : false,
            duration: Date.now() - start,
            details: `ACH payment processed: ${processResult.transactionId}`
          });
        } else {
          results.push({
            testName: 'Process ACH Payment',
            passed: false,
            duration: Date.now() - start,
            details: 'No payment found to process',
            errors: ['No payments available for processing']
          });
        }
      } else {
        results.push({
          testName: 'Process ACH Payment',
          passed: false,
          duration: Date.now() - start,
          details: 'No ACH payment method found',
          errors: ['No ACH payment method available']
        });
      }
    } catch (error) {
      results.push({
        testName: 'Process ACH Payment',
        passed: false,
        duration: Date.now() - startTime,
        details: 'Failed to process ACH payment',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }

    // Test 3: Payment routing
    try {
      const start = Date.now();
      const routes = await enhancedPaymentService.getPaymentRoutes();
      
      results.push({
        testName: 'Payment Routing',
        passed: Array.isArray(routes),
        duration: Date.now() - start,
        details: `Found ${routes.length} payment routes`
      });
    } catch (error) {
      results.push({
        testName: 'Payment Routing',
        passed: false,
        duration: Date.now() - startTime,
        details: 'Failed to get payment routes',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }

    const totalDuration = Date.now() - startTime;
    const passedCount = results.filter(r => r.passed).length;

    return {
      suiteName: 'Payment Processing',
      results,
      overallPassed: passedCount === results.length,
      totalDuration,
      passedCount,
      failedCount: results.length - passedCount
    };
  }

  /**
   * Test security features
   */
  private static async testSecurityFeatures(): Promise<TestSuite> {
    const results: TestResult[] = [];
    const startTime = Date.now();

    // Test 1: Payment data encryption
    try {
      const start = Date.now();
      const testData = 'sensitive_payment_data_123';
      const encrypted = await PaymentEncryption.encryptPaymentData(testData);
      const decrypted = await PaymentEncryption.decryptPaymentData(encrypted);

      results.push({
        testName: 'Payment Data Encryption',
        passed: decrypted === testData,
        duration: Date.now() - start,
        details: `Encryption/decryption ${decrypted === testData ? 'successful' : 'failed'}`
      });
    } catch (error) {
      results.push({
        testName: 'Payment Data Encryption',
        passed: false,
        duration: Date.now() - startTime,
        details: 'Encryption test failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }

    // Test 2: Fraud detection
    try {
      const start = Date.now();
      const riskResult = FraudDetection.assessTransactionRisk(
        this.testData.validPayment,
        this.testData.securityContext
      );

      results.push({
        testName: 'Fraud Detection',
        passed: typeof riskResult.riskScore === 'number' && riskResult.riskScore >= 0,
        duration: Date.now() - start,
        details: `Risk score: ${riskResult.riskScore}, Flags: ${riskResult.flags.length}`
      });
    } catch (error) {
      results.push({
        testName: 'Fraud Detection',
        passed: false,
        duration: Date.now() - startTime,
        details: 'Fraud detection test failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }

    // Test 3: Data masking
    try {
      const start = Date.now();
      const cardNumber = '4111111111111111';
      const masked = PaymentEncryption.maskPaymentData(cardNumber, 'card');
      const expected = '•••• •••• •••• 1111';

      results.push({
        testName: 'Data Masking',
        passed: masked === expected,
        duration: Date.now() - start,
        details: `Masked result: ${masked}`
      });
    } catch (error) {
      results.push({
        testName: 'Data Masking',
        passed: false,
        duration: Date.now() - startTime,
        details: 'Data masking test failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }

    const totalDuration = Date.now() - startTime;
    const passedCount = results.filter(r => r.passed).length;

    return {
      suiteName: 'Security Features',
      results,
      overallPassed: passedCount === results.length,
      totalDuration,
      passedCount,
      failedCount: results.length - passedCount
    };
  }

  /**
   * Test compliance validation
   */
  private static async testComplianceValidation(): Promise<TestSuite> {
    const results: TestResult[] = [];
    const startTime = Date.now();

    // Test 1: PCI compliance check
    try {
      const start = Date.now();
      const complianceResult = PCIComplianceValidator.validatePCICompliance(
        { amount: 100, encrypted: true },
        this.testData.securityContext
      );

      results.push({
        testName: 'PCI Compliance Validation',
        passed: complianceResult.securityScore > 0,
        duration: Date.now() - start,
        details: `Security score: ${complianceResult.securityScore}, Violations: ${complianceResult.violations.length}`
      });
    } catch (error) {
      results.push({
        testName: 'PCI Compliance Validation',
        passed: false,
        duration: Date.now() - startTime,
        details: 'PCI compliance test failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }

    // Test 2: Quick compliance check
    try {
      const start = Date.now();
      const quickCheck = PCIComplianceValidator.quickComplianceCheck({ amount: 100, encrypted: true });

      results.push({
        testName: 'Quick Compliance Check',
        passed: quickCheck === true,
        duration: Date.now() - start,
        details: `Quick check result: ${quickCheck ? 'passed' : 'failed'}`
      });
    } catch (error) {
      results.push({
        testName: 'Quick Compliance Check',
        passed: false,
        duration: Date.now() - startTime,
        details: 'Quick compliance test failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }

    const totalDuration = Date.now() - startTime;
    const passedCount = results.filter(r => r.passed).length;

    return {
      suiteName: 'Compliance Validation',
      results,
      overallPassed: passedCount === results.length,
      totalDuration,
      passedCount,
      failedCount: results.length - passedCount
    };
  }

  /**
   * Test integration flows
   */
  private static async testIntegrationFlows(): Promise<TestSuite> {
    const results: TestResult[] = [];
    const startTime = Date.now();

    // Test 1: End-to-end payment flow
    try {
      const start = Date.now();
      
      // Create payment
      const payment = await enhancedPaymentService.createRentPayment(this.testData.validPayment);
      
      // Get payment methods
      const methods = await enhancedPaymentService.getPaymentMethods(this.testData.validTenantId);
      
      // Check if payment was created and methods are available
      const success = payment && payment.id && methods && methods.length > 0;

      results.push({
        testName: 'End-to-End Payment Flow',
        passed: success,
        duration: Date.now() - start,
        details: `Payment: ${payment?.id}, Methods: ${methods?.length || 0}`
      });
    } catch (error) {
      results.push({
        testName: 'End-to-End Payment Flow',
        passed: false,
        duration: Date.now() - startTime,
        details: 'End-to-end flow test failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }

    // Test 2: Bank account integration
    try {
      const start = Date.now();
      const connections = await bankAccountService.getBankConnections(this.testData.validTenantId);
      const businessAccounts = await bankAccountService.getBusinessBankAccounts();

      results.push({
        testName: 'Bank Account Integration',
        passed: Array.isArray(connections) && Array.isArray(businessAccounts),
        duration: Date.now() - start,
        details: `Connections: ${connections.length}, Business accounts: ${businessAccounts.length}`
      });
    } catch (error) {
      results.push({
        testName: 'Bank Account Integration',
        passed: false,
        duration: Date.now() - startTime,
        details: 'Bank integration test failed',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }

    const totalDuration = Date.now() - startTime;
    const passedCount = results.filter(r => r.passed).length;

    return {
      suiteName: 'Integration Flows',
      results,
      overallPassed: passedCount === results.length,
      totalDuration,
      passedCount,
      failedCount: results.length - passedCount
    };
  }

  /**
   * Generate test summary report
   */
  private static generateTestSummary(suites: TestSuite[]): void {
    console.log('\n🎯 PAYMENT SYSTEM TEST SUMMARY');
    console.log('='.repeat(50));
    
    let totalPassed = 0;
    let totalFailed = 0;
    let totalDuration = 0;

    suites.forEach(suite => {
      totalPassed += suite.passedCount;
      totalFailed += suite.failedCount;
      totalDuration += suite.totalDuration;

      const status = suite.overallPassed ? '✅' : '❌';
      console.log(`${status} ${suite.suiteName}: ${suite.passedCount}/${suite.passedCount + suite.failedCount} tests passed (${suite.totalDuration}ms)`);
      
      if (!suite.overallPassed) {
        suite.results.filter(r => !r.passed).forEach(result => {
          console.log(`   ❌ ${result.testName}: ${result.details}`);
          if (result.errors) {
            result.errors.forEach(error => console.log(`      Error: ${error}`));
          }
        });
      }
    });

    console.log('='.repeat(50));
    console.log(`Overall: ${totalPassed}/${totalPassed + totalFailed} tests passed`);
    console.log(`Total duration: ${totalDuration}ms`);
    console.log(`Success rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(2)}%`);
    
    if (totalFailed === 0) {
      console.log('🎉 ALL TESTS PASSED! Payment system is ready for production.');
    } else {
      console.log(`⚠️  ${totalFailed} tests failed. Please review and fix issues before deployment.`);
    }
  }

  /**
   * Run specific test suite
   */
  static async runTestSuite(suiteName: string): Promise<TestSuite> {
    switch (suiteName) {
      case 'bank':
        return this.testBankAccountManagement();
      case 'payment':
        return this.testPaymentProcessing();
      case 'security':
        return this.testSecurityFeatures();
      case 'compliance':
        return this.testComplianceValidation();
      case 'integration':
        return this.testIntegrationFlows();
      default:
        throw new Error(`Unknown test suite: ${suiteName}`);
    }
  }
}
