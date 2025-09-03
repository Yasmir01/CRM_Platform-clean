import * as React from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Paper,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import GavelIcon from '@mui/icons-material/Gavel';
import SecurityIcon from '@mui/icons-material/Security';
import HomeIcon from '@mui/icons-material/Home';
import PaymentIcon from '@mui/icons-material/Payment';
import PolicyIcon from '@mui/icons-material/Policy';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';;
import RichTextEditor from "./RichTextEditor";

interface TermsSection {
  id: string;
  title: string;
  content: string;
  required: boolean;
  order: number;
  type: "standard" | "custom";
}

interface TermsAndConditionsProps {
  onAccept: (acceptedTerms: string[]) => void;
  onDecline: () => void;
  customTerms?: TermsSection[];
  showEditor?: boolean;
  onTermsUpdate?: (terms: TermsSection[]) => void;
  applicationFee?: number;
  propertyAddress?: string;
  companyName?: string;
}

const defaultTermsSections: TermsSection[] = [
  {
    id: "application_process",
    title: "Application Process",
    content: `<p>By submitting this rental application, I understand and agree that:</p>
    <ul>
      <li>This application does not guarantee approval or the right to lease the property</li>
      <li>All information provided must be true, complete, and accurate</li>
      <li>Any false or misleading information may result in application denial</li>
      <li>The application fee is non-refundable regardless of approval status</li>
      <li>Processing time may take 1-3 business days</li>
    </ul>`,
    required: true,
    order: 1,
    type: "standard"
  },
  {
    id: "background_credit_check",
    title: "Background and Credit Check Authorization",
    content: `<p>I hereby authorize the landlord/property manager to:</p>
    <ul>
      <li>Obtain credit reports from credit reporting agencies</li>
      <li>Conduct background checks including criminal history</li>
      <li>Verify employment and income information</li>
      <li>Contact previous landlords and personal references</li>
      <li>Verify any other information provided in this application</li>
    </ul>
    <p>I understand that this authorization will remain in effect for 90 days from the date signed.</p>`,
    required: true,
    order: 2,
    type: "standard"
  },
  {
    id: "financial_requirements",
    title: "Financial Requirements",
    content: `<p>I understand the following financial requirements:</p>
    <ul>
      <li>Monthly gross income must be at least 3 times the monthly rent</li>
      <li>Security deposit equal to one month's rent is required</li>
      <li>First month's rent is due at lease signing</li>
      <li>Additional deposits may be required for pets or other circumstances</li>
      <li>All payments must be made in certified funds at lease signing</li>
    </ul>`,
    required: true,
    order: 3,
    type: "standard"
  },
  {
    id: "occupancy_guidelines",
    title: "Occupancy Guidelines",
    content: `<p>Regarding occupancy of the rental property:</p>
    <ul>
      <li>Only persons listed on the application may occupy the premises</li>
      <li>Maximum occupancy limits will be enforced as per local housing codes</li>
      <li>All adult occupants (18+) must complete separate applications</li>
      <li>Subletting or assignment is prohibited without written consent</li>
      <li>Guests may not stay more than 14 days in any 30-day period</li>
    </ul>`,
    required: true,
    order: 4,
    type: "standard"
  },
  {
    id: "pet_policy",
    title: "Pet Policy",
    content: `<p>Pet-related terms and conditions:</p>
    <ul>
      <li>Pets are subject to approval and additional deposit/rent</li>
      <li>Pet deposit is typically $200-$500 per pet</li>
      <li>Monthly pet rent may apply</li>
      <li>All pets must be registered and up-to-date on vaccinations</li>
      <li>Service animals and emotional support animals are handled per Fair Housing laws</li>
      <li>Unauthorized pets may result in lease termination</li>
    </ul>`,
    required: false,
    order: 5,
    type: "standard"
  },
  {
    id: "fair_housing",
    title: "Fair Housing Statement",
    content: `<p>Equal Housing Opportunity:</p>
    <p>We do not discriminate based on race, color, religion, sex, handicap, familial status, national origin, sexual orientation, or gender identity. All applications are processed in accordance with federal, state, and local fair housing laws.</p>
    <p>Reasonable accommodations will be made for qualified individuals with disabilities.</p>`,
    required: true,
    order: 6,
    type: "standard"
  },
  {
    id: "data_privacy",
    title: "Privacy and Data Protection",
    content: `<p>Information collected in this application:</p>
    <ul>
      <li>Will be used solely for rental qualification purposes</li>
      <li>May be shared with credit agencies, background check services, and references</li>
      <li>Will be stored securely and in compliance with privacy laws</li>
      <li>Will be retained per legal requirements and company policy</li>
      <li>May be used to contact you regarding your application status</li>
    </ul>`,
    required: true,
    order: 7,
    type: "standard"
  },
  {
    id: "legal_acknowledgment",
    title: "Legal Acknowledgment",
    content: `<p>By submitting this application, I acknowledge that:</p>
    <ul>
      <li>I have read and understood all terms and conditions</li>
      <li>My electronic signature has the same legal effect as a handwritten signature</li>
      <li>This application is governed by the laws of the state where the property is located</li>
      <li>Any disputes will be resolved according to the jurisdiction's legal procedures</li>
      <li>I am legally authorized to enter into a rental agreement</li>
    </ul>`,
    required: true,
    order: 8,
    type: "standard"
  }
];

export default function TermsAndConditions({
  onAccept,
  onDecline,
  customTerms,
  showEditor = false,
  onTermsUpdate,
  applicationFee,
  propertyAddress,
  companyName = "Property Management Company"
}: TermsAndConditionsProps) {
  const [allTerms, setAllTerms] = React.useState<TermsSection[]>(() => {
    const terms = customTerms && customTerms.length > 0 ? customTerms : defaultTermsSections;
    return terms.sort((a, b) => a.order - b.order);
  });
  
  const [acceptedTerms, setAcceptedTerms] = React.useState<string[]>([]);
  const [isEditing, setIsEditing] = React.useState(showEditor);
  const [editingSection, setEditingSection] = React.useState<TermsSection | null>(null);
  const [newSectionDialog, setNewSectionDialog] = React.useState(false);
  const [newSection, setNewSection] = React.useState<Partial<TermsSection>>({
    title: "",
    content: "",
    required: false,
    type: "custom"
  });

  const requiredTerms = allTerms.filter(term => term.required);
  const allRequiredAccepted = requiredTerms.every(term => acceptedTerms.includes(term.id));

  const handleTermAcceptance = (termId: string, accepted: boolean) => {
    setAcceptedTerms(prev => {
      if (accepted) {
        return [...prev, termId];
      } else {
        return prev.filter(id => id !== termId);
      }
    });
  };

  const handleAcceptAll = () => {
    if (allRequiredAccepted) {
      onAccept(acceptedTerms);
    }
  };

  const handleAddSection = () => {
    if (newSection.title && newSection.content) {
      const section: TermsSection = {
        id: `custom_${Date.now()}`,
        title: newSection.title,
        content: newSection.content,
        required: newSection.required || false,
        order: allTerms.length + 1,
        type: "custom"
      };
      
      const updatedTerms = [...allTerms, section].sort((a, b) => a.order - b.order);
      setAllTerms(updatedTerms);
      onTermsUpdate?.(updatedTerms);
      
      setNewSection({ title: "", content: "", required: false, type: "custom" });
      setNewSectionDialog(false);
    }
  };

  const handleEditSection = (section: TermsSection) => {
    setEditingSection(section);
  };

  const handleSaveSection = () => {
    if (editingSection) {
      const updatedTerms = allTerms.map(term => 
        term.id === editingSection.id ? editingSection : term
      );
      setAllTerms(updatedTerms);
      onTermsUpdate?.(updatedTerms);
      setEditingSection(null);
    }
  };

  const handleDeleteSection = (sectionId: string) => {
    const updatedTerms = allTerms.filter(term => term.id !== sectionId);
    setAllTerms(updatedTerms);
    onTermsUpdate?.(updatedTerms);
  };

  const getCompanyVariables = () => ({
    COMPANY_NAME: companyName,
    PROPERTY_ADDRESS: propertyAddress || "[Property Address]",
    APPLICATION_FEE: applicationFee ? `$${applicationFee}` : "[Application Fee]",
    CURRENT_DATE: new Date().toLocaleDateString(),
  });

  const replaceVariables = (content: string) => {
    const variables = getCompanyVariables();
    let replacedContent = content;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      replacedContent = replacedContent.replace(regex, value);
    });
    
    return replacedContent;
  };

  if (isEditing) {
    return (
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5">Edit Terms and Conditions</Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setNewSectionDialog(true)}
            >
              Add Section
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => setIsEditing(false)}
            >
              Save Changes
            </Button>
          </Stack>
        </Stack>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Use variables like {"{COMPANY_NAME}"}, {"{PROPERTY_ADDRESS}"}, {"{APPLICATION_FEE}"}, and {"{CURRENT_DATE}"} to automatically populate information.
          </Typography>
        </Alert>

        {allTerms.map((section) => (
          <Card key={section.id} sx={{ mb: 2 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h6">{section.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {section.type === "custom" ? "Custom Section" : "Standard Section"} 
                    {section.required && " • Required"}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <IconButton size="small" onClick={() => handleEditSection(section)}>
                    <EditIcon />
                  </IconButton>
                  {section.type === "custom" && (
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => handleDeleteSection(section.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Stack>
              </Stack>
              
              <Box 
                dangerouslySetInnerHTML={{ 
                  __html: replaceVariables(section.content) 
                }} 
                sx={{ 
                  "& ul": { pl: 2 }, 
                  "& li": { mb: 0.5 },
                  "& p": { mb: 1 }
                }}
              />
            </CardContent>
          </Card>
        ))}

        {/* Edit Section Dialog */}
        <Dialog open={!!editingSection} onClose={() => setEditingSection(null)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Section: {editingSection?.title}</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Section Title"
                value={editingSection?.title || ""}
                onChange={(e) => setEditingSection(prev => 
                  prev ? { ...prev, title: e.target.value } : null
                )}
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editingSection?.required || false}
                    onChange={(e) => setEditingSection(prev => 
                      prev ? { ...prev, required: e.target.checked } : null
                    )}
                  />
                }
                label="Required (users must accept this section)"
              />
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>Content</Typography>
                <RichTextEditor
                  value={editingSection?.content || ""}
                  onChange={(content) => setEditingSection(prev => 
                    prev ? { ...prev, content } : null
                  )}
                  placeholder="Enter section content..."
                />
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingSection(null)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveSection}>Save Changes</Button>
          </DialogActions>
        </Dialog>

        {/* Add Section Dialog */}
        <Dialog open={newSectionDialog} onClose={() => setNewSectionDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Add New Section</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Section Title"
                value={newSection.title}
                onChange={(e) => setNewSection(prev => ({ ...prev, title: e.target.value }))}
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newSection.required || false}
                    onChange={(e) => setNewSection(prev => ({ ...prev, required: e.target.checked }))}
                  />
                }
                label="Required (users must accept this section)"
              />
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>Content</Typography>
                <RichTextEditor
                  value={newSection.content || ""}
                  onChange={(content) => setNewSection(prev => ({ ...prev, content }))}
                  placeholder="Enter section content..."
                />
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNewSectionDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleAddSection}>Add Section</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <GavelIcon color="primary" sx={{ fontSize: 32 }} />
        <Box>
          <Typography variant="h5" gutterBottom>
            Terms and Conditions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please review and accept the following terms to continue with your application
          </Typography>
        </Box>
      </Stack>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Important:</strong> Please read all sections carefully. 
          {requiredTerms.length > 0 && ` You must accept all ${requiredTerms.length} required sections to proceed.`}
        </Typography>
      </Alert>

      {allTerms.map((section) => (
        <Accordion key={section.id} sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ width: "100%" }}>
              <Box sx={{ display: "flex", alignItems: "center", color: "primary.main" }}>
                {section.id.includes("background") && <SecurityIcon />}
                {section.id.includes("financial") && <PaymentIcon />}
                {section.id.includes("occupancy") && <HomeIcon />}
                {section.id.includes("privacy") && <SecurityIcon />}
                {section.id.includes("legal") && <GavelIcon />}
                {!["background", "financial", "occupancy", "privacy", "legal"].some(key => section.id.includes(key)) && <PolicyIcon />}
              </Box>
              
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6">{section.title}</Typography>
                {section.required && (
                  <Typography variant="caption" color="error">
                    Required
                  </Typography>
                )}
              </Box>
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={acceptedTerms.includes(section.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleTermAcceptance(section.id, e.target.checked);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                }
                label="Accept"
                sx={{ mr: 2 }}
                onClick={(e) => e.stopPropagation()}
              />
            </Stack>
          </AccordionSummary>
          
          <AccordionDetails>
            <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
              <Box 
                dangerouslySetInnerHTML={{ 
                  __html: replaceVariables(section.content) 
                }} 
                sx={{ 
                  "& ul": { pl: 2 }, 
                  "& li": { mb: 0.5 },
                  "& p": { mb: 1 }
                }}
              />
            </Paper>
          </AccordionDetails>
        </Accordion>
      ))}

      <Divider sx={{ my: 3 }} />

      {/* Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Summary</Typography>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between">
              <Typography>Total Sections:</Typography>
              <Typography fontWeight="medium">{allTerms.length}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography>Required Sections:</Typography>
              <Typography fontWeight="medium">{requiredTerms.length}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography>Accepted:</Typography>
              <Typography fontWeight="medium" color={allRequiredAccepted ? "success.main" : "error.main"}>
                {acceptedTerms.length} / {allTerms.length}
              </Typography>
            </Stack>
          </Stack>
          
          {!allRequiredAccepted && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              You must accept all required sections before proceeding.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button variant="outlined" onClick={onDecline}>
          Decline
        </Button>
        <Button 
          variant="contained" 
          onClick={handleAcceptAll}
          disabled={!allRequiredAccepted}
        >
          Accept Terms & Continue
        </Button>
      </Stack>
    </Box>
  );
}
