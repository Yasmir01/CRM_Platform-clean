import * as React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tooltip,
  Grid
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Description as DocumentIcon,
  Image as ImageIcon,
  Close as CloseIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { FileStorageService, StoredFile } from '../services/FileStorageService';

interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  fileTypes?: string[];
  maxFiles?: number;
  maxFileSize?: number;
  description?: string;
}

interface EnhancedFileUploadFieldProps {
  field: FormField;
  currentFiles: StoredFile[];
  onFilesChange: (files: StoredFile[]) => void;
  error?: string;
}

const EnhancedFileUploadField: React.FC<EnhancedFileUploadFieldProps> = ({
  field,
  currentFiles,
  onFilesChange,
  error
}) => {
  const [isUploading, setIsUploading] = React.useState(false);
  const [previewFile, setPreviewFile] = React.useState<StoredFile | null>(null);
  const [expandedPreviews, setExpandedPreviews] = React.useState<Set<string>>(new Set());

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: field.fileTypes ? 
      field.fileTypes.reduce((acc, type) => {
        acc[`.${type}`] = [];
        return acc;
      }, {} as any) : 
      FileStorageService.getDropzoneAccept(),
    maxFiles: field.maxFiles || 5,
    maxSize: (field.maxFileSize || 10) * 1024 * 1024,
    onDrop: async (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        const error = rejection.errors[0];
        alert(`File upload error: ${error.message}`);
        return;
      }

      setIsUploading(true);
      
      try {
        const result = await FileStorageService.processFiles(acceptedFiles);
        
        if (result.success && result.files) {
          // Handle max files limit
          const maxFiles = field.maxFiles || 5;
          let updatedFiles = result.files;
          
          if (maxFiles > 1) {
            // Append new files but respect max limit
            updatedFiles = [...currentFiles, ...result.files].slice(0, maxFiles);
          }
          
          onFilesChange(updatedFiles);
        } else {
          alert(result.error || 'Failed to upload files');
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('An error occurred while uploading files');
      } finally {
        setIsUploading(false);
      }
    }
  });

  const handleRemoveFile = (fileId: string) => {
    const updatedFiles = currentFiles.filter(file => file.id !== fileId);
    onFilesChange(updatedFiles);
  };

  const handlePreviewFile = (file: StoredFile) => {
    setPreviewFile(file);
  };

  const togglePreviewExpansion = (fileId: string) => {
    setExpandedPreviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const renderFilePreview = (file: StoredFile) => {
    const isExpanded = expandedPreviews.has(file.id);
    
    return (
      <Card key={file.id} variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            {/* File Icon/Preview */}
            <Box
              sx={{
                width: 60,
                height: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'hidden',
                bgcolor: 'grey.50'
              }}
            >
              {FileStorageService.isImageFile(file.type, file.name) ? (
                (file.preview || file.dataUrl) ? (
                  <Box
                    component="img"
                    src={file.dataUrl || file.preview} // Prefer dataUrl over preview
                    alt={file.name}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: 1
                    }}
                    onLoad={() => {
                      console.log('Thumbnail loaded successfully for:', file.name);
                    }}
                    onError={(e) => {
                      console.warn('Thumbnail failed to load for:', file.name, {
                        hasDataUrl: !!file.dataUrl,
                        hasPreview: !!file.preview,
                        fileType: file.type,
                        fileSize: file.size
                      });

                      // Replace with fallback icon
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';

                      // Create fallback icon
                      const parentBox = target.parentElement;
                      if (parentBox) {
                        parentBox.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: #999;"><span style="font-size: 24px;">🖼️</span></div>';
                      }
                    }}
                  />
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                    <ImageIcon sx={{ fontSize: 40, color: 'grey.400' }} />
                  </Box>
                )
              ) : FileStorageService.isPdfFile(file.type) ? (
                <PdfIcon sx={{ fontSize: 40, color: 'error.main' }} />
              ) : FileStorageService.isDocumentFile(file.type) ? (
                <DocumentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              ) : (
                <AttachFileIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
              )}
            </Box>

            {/* File Info */}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="body2" noWrap title={file.name}>
                {file.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {FileStorageService.formatFileSize(file.size)} �� {file.type}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {FileStorageService.getFileTypeIcon(file.type)} {new Date(file.lastModified).toLocaleDateString()}
              </Typography>
            </Box>

            {/* Actions */}
            <Stack direction="row" spacing={1}>
              {FileStorageService.isImageFile(file.type, file.name) && (
                <Tooltip title={isExpanded ? "Collapse Preview" : "Expand Preview"}>
                  <IconButton size="small" onClick={() => togglePreviewExpansion(file.id)}>
                    {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
                  </IconButton>
                </Tooltip>
              )}
              
              <Tooltip title="View Full Size">
                <IconButton size="small" onClick={() => handlePreviewFile(file)}>
                  <ViewIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Download">
                <IconButton size="small" onClick={() => FileStorageService.downloadFile(file)}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Remove">
                <IconButton size="small" color="error" onClick={() => handleRemoveFile(file.id)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {/* Expanded Preview for Images */}
          {isExpanded && FileStorageService.isImageFile(file.type, file.name) && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Image Preview
              </Typography>
              {file.dataUrl || file.preview ? (
                <Box
                  component="img"
                  src={file.dataUrl || file.preview}
                  alt={file.name}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: 300,
                    objectFit: 'contain',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'white'
                  }}
                  onError={(e) => {
                    console.error('Image preview failed to load for:', file.name, {
                      hasDataUrl: !!file.dataUrl,
                      hasPreview: !!file.preview,
                      dataUrlLength: file.dataUrl?.length || 0,
                      previewLength: file.preview?.length || 0,
                      fileType: file.type
                    });

                    // Hide the broken image and show fallback
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';

                    // Show fallback message in parent container
                    const parentContainer = target.parentElement;
                    if (parentContainer) {
                      const fallbackDiv = document.createElement('div');
                      fallbackDiv.style.cssText = `
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 200px;
                        background-color: #f5f5f5;
                        border: 2px dashed #ddd;
                        border-radius: 8px;
                        color: #666;
                        text-align: center;
                        padding: 20px;
                      `;
                      fallbackDiv.innerHTML = `
                        <div style="font-size: 32px; margin-bottom: 8px;">📄</div>
                        <div style="font-weight: bold; margin-bottom: 4px;">${file.name}</div>
                        <div style="font-size: 12px;">Preview not available</div>
                      `;
                      parentContainer.appendChild(fallbackDiv);
                    }
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: 400,
                    height: 200,
                    border: '2px dashed',
                    borderColor: 'grey.300',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.50',
                    margin: '0 auto'
                  }}
                >
                  <Stack spacing={1} alignItems="center">
                    <ImageIcon sx={{ fontSize: 32, color: 'grey.400' }} />
                    <Typography variant="body2" color="text.secondary">
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Image preview unavailable
                    </Typography>
                  </Stack>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="body1" gutterBottom>
        {field.label} {field.required && "*"}
      </Typography>

      {/* Upload Drop Zone */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          border: "2px dashed",
          borderColor: error ? "error.main" : isDragActive ? "primary.main" : "grey.300",
          textAlign: "center",
          cursor: isUploading ? "not-allowed" : "pointer",
          bgcolor: isDragActive ? "action.hover" : "background.paper",
          "&:hover": isUploading ? {} : { bgcolor: "action.hover" },
          position: 'relative'
        }}
      >
        <input {...getInputProps()} disabled={isUploading} />
        
        {isUploading ? (
          <Stack spacing={2} alignItems="center">
            <CircularProgress />
            <Typography color="text.secondary">Processing files...</Typography>
          </Stack>
        ) : (
          <>
            <UploadIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
            <Typography color="text.secondary">
              {isDragActive ? "Drop files here..." : "Drag & drop files here or click to browse"}
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              {field.fileTypes && `Accepted: ${field.fileTypes.join(", ")}`}
              {field.maxFiles && ` • Max ${field.maxFiles} files`}
              {field.maxFileSize && ` • Max ${field.maxFileSize}MB per file`}
            </Typography>
          </>
        )}
      </Paper>

      {/* Current Files */}
      {currentFiles.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Uploaded Files ({currentFiles.length}{field.maxFiles ? `/${field.maxFiles}` : ''}):
          </Typography>
          
          {currentFiles.map(file => renderFilePreview(file))}
          
          {currentFiles.length === field.maxFiles && (
            <Alert severity="info" sx={{ mt: 1 }}>
              Maximum number of files reached. Remove a file to upload more.
            </Alert>
          )}
        </Box>
      )}

      {/* Error/Description */}
      {(error || field.description) && (
        <Typography variant="caption" color={error ? "error" : "text.secondary"} sx={{ mt: 1, display: "block" }}>
          {error || field.description}
        </Typography>
      )}

      {/* Full Size Preview Dialog */}
      <Dialog
        open={!!previewFile}
        onClose={() => setPreviewFile(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6">{previewFile?.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {previewFile && FileStorageService.formatFileSize(previewFile.size)} • {previewFile?.type}
              </Typography>
            </Box>
            <IconButton onClick={() => setPreviewFile(null)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        
        <DialogContent>
          {previewFile && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              {FileStorageService.isImageFile(previewFile.type, previewFile.name) ? (
                <Box
                  component="img"
                  src={previewFile.dataUrl}
                  alt={previewFile.name}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    objectFit: 'contain',
                    borderRadius: 1
                  }}
                />
              ) : FileStorageService.isPdfFile(previewFile.type) ? (
                <Box>
                  <PdfIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
                  <Typography>
                    PDF preview not available. Click download to view the file.
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <DocumentIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                  <Typography>
                    Preview not available for this file type. Click download to view the file.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setPreviewFile(null)}>Close</Button>
          {previewFile && (
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => {
                FileStorageService.downloadFile(previewFile);
                setPreviewFile(null);
              }}
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnhancedFileUploadField;
