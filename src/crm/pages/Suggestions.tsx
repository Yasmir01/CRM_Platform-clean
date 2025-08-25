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

  // Check if user has admin privileges (you can adjust this logic based on your auth system)
  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin' || isManagementMode;

  // Calculate tab indices dynamically
  const tabs = [];
  let currentIndex = 0;

  // Always show "All Suggestions"
  tabs.push({ label: "All Suggestions", index: currentIndex++ });

  // Show "My Suggestions" if user is logged in
  let myTabIndex = -1;
  if (user) {
    myTabIndex = currentIndex++;
    tabs.push({ label: "My Suggestions", index: myTabIndex });
  }

  // Show "Admin Panel" if user is admin
  let adminTabIndex = -1;
  if (isAdmin) {
    adminTabIndex = currentIndex++;
    tabs.push({ label: "Admin Panel", index: adminTabIndex });
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Reset tab value if current tab is no longer available
  React.useEffect(() => {
    const maxTabIndex = tabs.length - 1;
    if (tabValue > maxTabIndex) {
      setTabValue(0); // Reset to first tab
    }
  }, [user, isAdmin, tabValue, tabs.length]); // Re-run when user or admin status changes

  const handleSubmissionSuccess = () => {
    setRefreshKey(prev => prev + 1); // Force refresh of suggestion list
  };

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
            <Tab label="My Suggestions" id={`suggestion-tab-${myTabIndex}`} aria-controls={`suggestion-tabpanel-${myTabIndex}`} />
          )}
          {isAdmin && (
            <Tab
              label="Admin Panel"
              id={`suggestion-tab-${adminTabIndex}`}
              aria-controls={`suggestion-tabpanel-${adminTabIndex}`}
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

      {user && myTabIndex >= 0 && (
        <TabPanel value={tabValue} index={myTabIndex}>
          <MySuggestions userId={user.id} refreshKey={refreshKey} />
        </TabPanel>
      )}

      {isAdmin && adminTabIndex >= 0 && (
        <TabPanel value={tabValue} index={adminTabIndex}>
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
