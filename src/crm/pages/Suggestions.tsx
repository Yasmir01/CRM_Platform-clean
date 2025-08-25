import React, { useState } from 'react';
import { Box, Typography, Button, Tab, Tabs, Alert } from '@mui/material';
import { Add, AdminPanelSettings } from '@mui/icons-material';
import SuggestionBox from '../components/SuggestionBox';
import SuggestionSubmissionForm from '../components/SuggestionSubmissionForm';
import SuggestionAdminPanel from '../components/SuggestionAdminPanel';
import { useAuth } from '../contexts/AuthContext';
import { useMode } from '../contexts/ModeContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`suggestion-tabpanel-${index}`}
      aria-labelledby={`suggestion-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Suggestions() {
  const { user } = useAuth();
  const { isManagementMode } = useMode();
  const [tabValue, setTabValue] = useState(0);
  const [submissionFormOpen, setSubmissionFormOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSubmissionSuccess = () => {
    setRefreshKey(prev => prev + 1); // Force refresh of suggestion list
  };

  // Check if user has admin privileges (you can adjust this logic based on your auth system)
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin' || isManagementMode;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Suggestion Box
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setSubmissionFormOpen(true)}
            disabled={!user}
          >
            New Suggestion
          </Button>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Share your ideas to help improve our CRM system. Vote on suggestions from other users to help prioritize development.
        </Typography>

        {!user && (
          <Alert severity="info" sx={{ mb: 2 }}>
            You need to be logged in to submit suggestions and vote. View existing suggestions below.
          </Alert>
        )}

        <Tabs value={tabValue} onChange={handleTabChange} aria-label="suggestion tabs">
          <Tab label="All Suggestions" id="suggestion-tab-0" aria-controls="suggestion-tabpanel-0" />
          {user && (
            <Tab label="My Suggestions" id="suggestion-tab-1" aria-controls="suggestion-tabpanel-1" />
          )}
          {isAdmin && (
            <Tab 
              label="Admin Panel" 
              id="suggestion-tab-2" 
              aria-controls="suggestion-tabpanel-2"
              icon={<AdminPanelSettings />}
              iconPosition="start"
            />
          )}
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <SuggestionBox 
          key={`all-${refreshKey}`}
          onCreateNew={() => setSubmissionFormOpen(true)}
        />
      </TabPanel>

      {user && (
        <TabPanel value={tabValue} index={1}>
          <MySuggestions userId={user.id} refreshKey={refreshKey} />
        </TabPanel>
      )}

      {isAdmin && (
        <TabPanel value={tabValue} index={isAdmin ? (user ? 2 : 1) : -1}>
          <SuggestionAdminPanel onRefresh={() => setRefreshKey(prev => prev + 1)} />
        </TabPanel>
      )}

      {/* Submission Form Dialog */}
      <SuggestionSubmissionForm
        open={submissionFormOpen}
        onClose={() => setSubmissionFormOpen(false)}
        onSubmit={handleSubmissionSuccess}
      />
    </Box>
  );
}

// Component for user's own suggestions
function MySuggestions({ userId, refreshKey }: { userId: string; refreshKey: number }) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const loadMySuggestions = async () => {
      try {
        const { suggestionService } = await import('../services/SuggestionService');
        const allSuggestions = suggestionService.getAllSuggestions();
        const mySuggestions = allSuggestions.filter(s => s.submittedBy === userId);
        setSuggestions(mySuggestions);
      } catch (error) {
        console.error('Error loading user suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMySuggestions();
  }, [userId, refreshKey]);

  if (loading) {
    return <Typography>Loading your suggestions...</Typography>;
  }

  if (suggestions.length === 0) {
    return (
      <Alert severity="info">
        You haven't submitted any suggestions yet. Click "New Suggestion" to share your ideas!
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Your Suggestions ({suggestions.length})
      </Typography>
      <SuggestionBox key={`my-${refreshKey}`} />
    </Box>
  );
}

// Simple admin panel placeholder - you can expand this
function AdminSuggestionPanel({ refreshKey }: { refreshKey: number }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Admin Panel
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Admin features coming soon: bulk status updates, priority management, analytics dashboard, and more.
      </Alert>
      <SuggestionBox key={`admin-${refreshKey}`} />
    </Box>
  );
}
