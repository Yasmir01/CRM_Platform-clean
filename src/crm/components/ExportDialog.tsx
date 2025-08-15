import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio,
  TextField,
  Stack,
  Typography,
  Chip,
  Alert,
  Box,
  LinearProgress
} from '@mui/material';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import { exportData, ExportFormat, ExportOptions } from '../utils/exportUtils';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  data: any[];
  title: string;
  defaultFilename?: string;
}

const formatOptions: { value: ExportFormat; label: string; description: string }[] = [
  { value: 'csv', label: 'CSV', description: 'Comma-separated values, compatible with Excel' },
  { value: 'excel', label: 'Excel', description: 'Microsoft Excel format (.xlsx)' },
  { value: 'json', label: 'JSON', description: 'JavaScript Object Notation, developer-friendly' },
  { value: 'pdf', label: 'PDF', description: 'Portable Document Format, printable' }
];

export default function ExportDialog({ open, onClose, data, title, defaultFilename }: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = React.useState<ExportFormat>('csv');
  const [filename, setFilename] = React.useState(defaultFilename || 'export');
  const [includeHeaders, setIncludeHeaders] = React.useState(true);
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async () => {
    if (!data || data.length === 0) {
      alert('No data available to export');
      return;
    }

    setIsExporting(true);

    const exportOptions: ExportOptions = {
      format: selectedFormat,
      filename: filename,
      includeHeaders: includeHeaders
    };

    try {
      await exportData(data, exportOptions);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    if (!isExporting) {
      onClose();
    }
  };

  React.useEffect(() => {
    if (open && defaultFilename) {
      setFilename(defaultFilename);
    }
  }, [open, defaultFilename]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <FileDownloadRoundedIcon />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Export {title}</Typography>
        </Stack>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Export Summary */}
          <Alert severity="info">
            <Typography variant="body2">
              Ready to export <strong>{data?.length || 0}</strong> records from {title.toLowerCase()}.
            </Typography>
          </Alert>

          {/* Format Selection */}
          <FormControl component="fieldset">
            <FormLabel component="legend">Export Format</FormLabel>
            <RadioGroup
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
            >
              {formatOptions.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {option.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.description}
                      </Typography>
                    </Box>
                  }
                />
              ))}
            </RadioGroup>
          </FormControl>

          {/* Filename */}
          <TextField
            label="Filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            fullWidth
            helperText={`File will be saved as: ${filename}.${selectedFormat}`}
          />

          {/* Options */}
          <FormControl component="fieldset">
            <FormLabel component="legend">Export Options</FormLabel>
            <FormControlLabel
              control={
                <Radio
                  checked={includeHeaders}
                  onChange={(e) => setIncludeHeaders(e.target.checked)}
                />
              }
              label="Include column headers"
            />
          </FormControl>

          {/* Preview */}
          {data && data.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Data Preview:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {Object.keys(data[0]).slice(0, 5).map((key) => (
                  <Chip key={key} label={key} size="small" variant="outlined" />
                ))}
                {Object.keys(data[0]).length > 5 && (
                  <Chip label={`+${Object.keys(data[0]).length - 5} more`} size="small" />
                )}
              </Box>
            </Box>
          )}

          {/* Progress */}
          {isExporting && (
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Preparing export...
              </Typography>
              <LinearProgress />
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isExporting}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleExport}
          disabled={isExporting || !data || data.length === 0}
          startIcon={<FileDownloadRoundedIcon />}
        >
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
