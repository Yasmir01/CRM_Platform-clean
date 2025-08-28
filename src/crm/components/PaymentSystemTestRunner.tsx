import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Paper,
  Divider
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  AccountBalance as BankIcon,
  Assessment as ComplianceIcon,
  IntegrationInstructions as IntegrationIcon
} from '@mui/icons-material';
import { PaymentSystemTester, TestSuite, TestResult } from '../utils/paymentSystemTests';

interface TestRunnerProps {
  onTestComplete?: (results: TestSuite[]) => void;
}

export const PaymentSystemTestRunner: React.FC<TestRunnerProps> = ({ onTestComplete }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestSuite[]>([]);
  const [currentSuite, setCurrentSuite] = useState<string>('');
  const [progress, setProgress] = useState(0);

  const suiteIcons = {
    'Bank Account Management': <BankIcon />,
    'Payment Processing': <PaymentIcon />,
    'Security Features': <SecurityIcon />,
    'Compliance Validation': <ComplianceIcon />,
    'Integration Flows': <IntegrationIcon />
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setProgress(0);

    try {
      // Run individual test suites with progress updates
      const suiteNames = ['bank', 'payment', 'security', 'compliance', 'integration'];
      const results: TestSuite[] = [];

      for (let i = 0; i < suiteNames.length; i++) {
        setCurrentSuite(suiteNames[i]);
        setProgress((i / suiteNames.length) * 100);
        
        const suite = await PaymentSystemTester.runTestSuite(suiteNames[i]);
        results.push(suite);
        setTestResults([...results]);
        
        // Small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setProgress(100);
      setCurrentSuite('');
      
      if (onTestComplete) {
        onTestComplete(results);
      }
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (passed: boolean) => {
    return passed ? 'success' : 'error';
  };

  const getStatusIcon = (passed: boolean) => {
    return passed ? <CheckIcon color="success" /> : <ErrorIcon color="error" />;
  };

  const calculateOverallStats = () => {
    const totalTests = testResults.reduce((sum, suite) => sum + suite.passedCount + suite.failedCount, 0);
    const totalPassed = testResults.reduce((sum, suite) => sum + suite.passedCount, 0);
    const totalDuration = testResults.reduce((sum, suite) => sum + suite.totalDuration, 0);
    const successRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;

    return { totalTests, totalPassed, totalDuration, successRate };
  };

  const stats = calculateOverallStats();

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Payment System Test Suite
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Comprehensive end-to-end testing of the payment and banking system including security, compliance, and integration validation.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              onClick={runTests}
              disabled={isRunning}
              startIcon={<PlayIcon />}
              size="large"
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
          </Box>

          {isRunning && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                {currentSuite ? `Running: ${currentSuite} tests...` : 'Initializing tests...'}
              </Typography>
              <LinearProgress variant="determinate" value={progress} />
            </Box>
          )}

          {testResults.length > 0 && (
            <>
              <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
                <Typography variant="h6" gutterBottom>
                  Test Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="text.secondary">
                      Total Tests
                    </Typography>
                    <Typography variant="h6">
                      {stats.totalTests}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="text.secondary">
                      Passed
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {stats.totalPassed}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="text.secondary">
                      Success Rate
                    </Typography>
                    <Typography variant="h6">
                      {stats.successRate.toFixed(1)}%
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="body2" color="text.secondary">
                      Duration
                    </Typography>
                    <Typography variant="h6">
                      {stats.totalDuration}ms
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {stats.successRate === 100 ? (
                <Alert severity="success" sx={{ mb: 3 }}>
                  🎉 All tests passed! The payment system is secure and ready for production.
                </Alert>
              ) : stats.successRate >= 80 ? (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  ⚠️ Most tests passed, but some issues need attention before production deployment.
                </Alert>
              ) : (
                <Alert severity="error" sx={{ mb: 3 }}>
                  ❌ Multiple test failures detected. System requires fixes before deployment.
                </Alert>
              )}

              <Typography variant="h6" gutterBottom>
                Test Results
              </Typography>

              {testResults.map((suite, index) => (
                <Accordion key={index} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      {suiteIcons[suite.suiteName as keyof typeof suiteIcons]}
                      <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                        {suite.suiteName}
                      </Typography>
                      <Chip
                        label={`${suite.passedCount}/${suite.passedCount + suite.failedCount}`}
                        color={getStatusColor(suite.overallPassed)}
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary">
                        {suite.totalDuration}ms
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {suite.results.map((result: TestResult, resultIndex: number) => (
                        <ListItem key={resultIndex}>
                          <ListItemIcon>
                            {getStatusIcon(result.passed)}
                          </ListItemIcon>
                          <ListItemText
                            primary={result.testName}
                            secondary={
                              <Box>
                                <Typography variant="body2" component="span">
                                  {result.details}
                                </Typography>
                                {result.errors && result.errors.length > 0 && (
                                  <Box sx={{ mt: 1 }}>
                                    {result.errors.map((error, errorIndex) => (
                                      <Typography
                                        key={errorIndex}
                                        variant="caption"
                                        color="error"
                                        component="div"
                                      >
                                        Error: {error}
                                      </Typography>
                                    ))}
                                  </Box>
                                )}
                                <Typography variant="caption" color="text.secondary" component="div">
                                  Duration: {result.duration}ms
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentSystemTestRunner;
