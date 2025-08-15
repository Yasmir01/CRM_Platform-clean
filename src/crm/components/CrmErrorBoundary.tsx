import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Alert,
  AlertTitle,
  Collapse,
  IconButton,
} from '@mui/material';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

class CrmErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error,
      errorInfo: null,
      showDetails: false,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CRM Error Boundary caught an error:', error, errorInfo);
    
    // Log error to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReload = () => {
    // Clear error state and reload
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
    
    // Force a full page reload as last resort
    window.location.reload();
  };

  private handleRetry = () => {
    // Try to recover by clearing the error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  private toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            bgcolor: 'background.default',
            p: 3,
          }}
        >
          <Card sx={{ maxWidth: 600, width: '100%' }}>
            <CardContent>
              <Stack spacing={3} alignItems="center">
                <ErrorOutlineRoundedIcon 
                  sx={{ 
                    fontSize: 80, 
                    color: 'error.main',
                    mb: 2 
                  }} 
                />
                
                <Typography variant="h4" component="h1" textAlign="center" gutterBottom>
                  Oops! Something went wrong
                </Typography>
                
                <Typography variant="body1" textAlign="center" color="text.secondary">
                  The CRM encountered an unexpected error and couldn't load properly. 
                  This helps prevent the entire application from going blank.
                </Typography>

                <Alert severity="error" sx={{ width: '100%' }}>
                  <AlertTitle>Error Details</AlertTitle>
                  {this.state.error?.message || 'An unknown error occurred'}
                </Alert>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<RefreshRoundedIcon />}
                    onClick={this.handleRetry}
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshRoundedIcon />}
                    onClick={this.handleReload}
                  >
                    Reload Page
                  </Button>
                </Stack>

                {/* Technical Details */}
                <Box sx={{ width: '100%' }}>
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<BugReportRoundedIcon />}
                    endIcon={this.state.showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    onClick={this.toggleDetails}
                    sx={{ color: 'text.secondary' }}
                  >
                    Technical Details
                  </Button>
                  
                  <Collapse in={this.state.showDetails}>
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                      <Typography variant="caption" component="pre" sx={{ 
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        maxHeight: 200,
                        overflow: 'auto',
                      }}>
                        {this.state.error?.stack || 'No stack trace available'}
                        {this.state.errorInfo?.componentStack && (
                          `\n\nComponent Stack:${this.state.errorInfo.componentStack}`
                        )}
                      </Typography>
                    </Box>
                  </Collapse>
                </Box>

                <Typography variant="caption" color="text.secondary" textAlign="center">
                  If this problem persists, please contact support with the technical details above.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default CrmErrorBoundary;
