import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Grid,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControlLabel,
  Switch,
  Slider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  LinearProgress,
  Tooltip,
  Badge,
  Avatar
} from '@mui/material';
import CameraIcon from '@mui/icons-material/CameraAlt';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import ScannerIcon from '@mui/icons-material/Scanner';
import CropIcon from '@mui/icons-material/CropFree';
import StraightenIcon from '@mui/icons-material/Straighten';
import BrightnessIcon from '@mui/icons-material/Brightness6';
import ContrastIcon from '@mui/icons-material/Contrast';
import FilterIcon from '@mui/icons-material/FilterBAndW';
import RotateIcon from '@mui/icons-material/Rotate90DegreesCcw';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import RefreshIcon from '@mui/icons-material/Refresh';
import UploadIcon from '@mui/icons-material/Upload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import CameraEnhanceIcon from '@mui/icons-material/CameraEnhance';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import FlipCameraIcon from '@mui/icons-material/FlipCameraAndroid';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FlashOffIcon from '@mui/icons-material/FlashOff';
import GridOnIcon from '@mui/icons-material/GridOn';
import GridOffIcon from '@mui/icons-material/GridOff';;
import { documentSecurityService } from '../services/DocumentSecurityService';
import { uniformTooltipStyles } from '../utils/formStyles';

interface CaptureSettings {
  resolution: 'low' | 'medium' | 'high' | 'ultra';
  format: 'jpeg' | 'png' | 'webp';
  quality: number;
  autoEnhance: boolean;
  autoStraighten: boolean;
  gridLines: boolean;
  flashMode: 'auto' | 'on' | 'off';
  facingMode: 'environment' | 'user';
}

interface ImageFilter {
  id: string;
  name: string;
  description: string;
  apply: (canvas: HTMLCanvasElement) => void;
}

interface CapturedImage {
  id: string;
  dataUrl: string;
  timestamp: string;
  metadata: {
    width: number;
    height: number;
    size: number;
    settings: CaptureSettings;
  };
  processing: {
    enhanced: boolean;
    straightened: boolean;
    cropped: boolean;
    filtered: boolean;
  };
}

interface MobileDocumentCaptureProps {
  open: boolean;
  onClose: () => void;
  entityId?: string;
  entityType?: string;
  onDocumentCaptured?: (document: any) => void;
}

const resolutionSettings = {
  low: { width: 1280, height: 720 },
  medium: { width: 1920, height: 1080 },
  high: { width: 2560, height: 1440 },
  ultra: { width: 3840, height: 2160 }
};

const imageFilters: ImageFilter[] = [
  {
    id: 'none',
    name: 'Original',
    description: 'No filter applied',
    apply: () => {}
  },
  {
    id: 'grayscale',
    name: 'Grayscale',
    description: 'Convert to black and white',
    apply: (canvas) => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }
        ctx.putImageData(imageData, 0, 0);
      }
    }
  },
  {
    id: 'highContrast',
    name: 'High Contrast',
    description: 'Increase contrast for text documents',
    apply: (canvas) => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          data[i] = data[i] > 128 ? 255 : 0;
          data[i + 1] = data[i + 1] > 128 ? 255 : 0;
          data[i + 2] = data[i + 2] > 128 ? 255 : 0;
        }
        ctx.putImageData(imageData, 0, 0);
      }
    }
  },
  {
    id: 'sepia',
    name: 'Sepia',
    description: 'Vintage sepia tone',
    apply: (canvas) => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
          data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
          data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
        }
        ctx.putImageData(imageData, 0, 0);
      }
    }
  }
];

export default function MobileDocumentCapture({
  open,
  onClose,
  entityId,
  entityType,
  onDocumentCaptured
}: MobileDocumentCaptureProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [cameraActive, setCameraActive] = React.useState(false);
  const [capturedImages, setCapturedImages] = React.useState<CapturedImage[]>([]);
  const [selectedImage, setSelectedImage] = React.useState<CapturedImage | null>(null);
  const [processing, setProcessing] = React.useState(false);
  const [currentTab, setCurrentTab] = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  
  // Camera settings
  const [settings, setSettings] = React.useState<CaptureSettings>({
    resolution: 'high',
    format: 'jpeg',
    quality: 90,
    autoEnhance: true,
    autoStraighten: true,
    gridLines: true,
    flashMode: 'auto',
    facingMode: 'environment'
  });

  // Image processing settings
  const [brightness, setBrightness] = React.useState(100);
  const [contrast, setContrast] = React.useState(100);
  const [saturation, setSaturation] = React.useState(100);
  const [selectedFilter, setSelectedFilter] = React.useState('none');
  const [cropArea, setCropArea] = React.useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Document metadata
  const [documentData, setDocumentData] = React.useState({
    name: '',
    category: 'Other',
    tags: '',
    description: '',
    isConfidential: false
  });

  const [stream, setStream] = React.useState<MediaStream | null>(null);

  React.useEffect(() => {
    if (open && currentStep === 0) {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [open, currentStep]);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: settings.facingMode,
          width: { ideal: resolutionSettings[settings.resolution].width },
          height: { ideal: resolutionSettings[settings.resolution].height }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Apply auto-enhancements if enabled
    if (settings.autoEnhance) {
      applyAutoEnhancement(canvas);
    }

    // Convert to data URL
    const dataUrl = canvas.toDataURL(`image/${settings.format}`, settings.quality / 100);

    // Create captured image object
    const capturedImage: CapturedImage = {
      id: `capture_${Date.now()}`,
      dataUrl,
      timestamp: new Date().toISOString(),
      metadata: {
        width: canvas.width,
        height: canvas.height,
        size: dataUrl.length,
        settings: { ...settings }
      },
      processing: {
        enhanced: settings.autoEnhance,
        straightened: false,
        cropped: false,
        filtered: false
      }
    };

    setCapturedImages(prev => [...prev, capturedImage]);
    setSelectedImage(capturedImage);
    setCurrentStep(1);
  };

  const applyAutoEnhancement = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Auto contrast enhancement
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Calculate histogram
    const histogram = new Array(256).fill(0);
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      histogram[Math.floor(brightness)]++;
    }

    // Find min and max brightness
    let min = 0, max = 255;
    for (let i = 0; i < 256; i++) {
      if (histogram[i] > 0) {
        min = i;
        break;
      }
    }
    for (let i = 255; i >= 0; i--) {
      if (histogram[i] > 0) {
        max = i;
        break;
      }
    }

    // Apply contrast stretching
    const range = max - min;
    if (range > 0) {
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.max(0, Math.min(255, ((data[i] - min) / range) * 255));
        data[i + 1] = Math.max(0, Math.min(255, ((data[i + 1] - min) / range) * 255));
        data[i + 2] = Math.max(0, Math.min(255, ((data[i + 2] - min) / range) * 255));
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const applyImageProcessing = () => {
    if (!selectedImage || !canvasRef.current) return;

    setProcessing(true);

    setTimeout(() => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        // Clear canvas and set size
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Apply brightness, contrast, saturation
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
        ctx.drawImage(img, 0, 0);
        
        // Reset filter
        ctx.filter = 'none';

        // Apply selected filter
        const filter = imageFilters.find(f => f.id === selectedFilter);
        if (filter && filter.id !== 'none') {
          filter.apply(canvas);
        }

        // Update the image data
        const newDataUrl = canvas.toDataURL(`image/${settings.format}`, settings.quality / 100);
        
        const updatedImage: CapturedImage = {
          ...selectedImage,
          dataUrl: newDataUrl,
          processing: {
            ...selectedImage.processing,
            filtered: selectedFilter !== 'none'
          }
        };

        setSelectedImage(updatedImage);
        setCapturedImages(prev => 
          prev.map(img => img.id === selectedImage.id ? updatedImage : img)
        );

        setProcessing(false);
      };

      img.src = selectedImage.dataUrl;
    }, 500);
  };

  const rotateImage = (degrees: number) => {
    if (!selectedImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions after rotation
      const radians = (degrees * Math.PI) / 180;
      const newWidth = Math.abs(img.width * Math.cos(radians)) + Math.abs(img.height * Math.sin(radians));
      const newHeight = Math.abs(img.width * Math.sin(radians)) + Math.abs(img.height * Math.cos(radians));

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Clear and rotate
      ctx.clearRect(0, 0, newWidth, newHeight);
      ctx.translate(newWidth / 2, newHeight / 2);
      ctx.rotate(radians);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      // Update image
      const newDataUrl = canvas.toDataURL(`image/${settings.format}`, settings.quality / 100);
      const updatedImage = { ...selectedImage, dataUrl: newDataUrl };
      setSelectedImage(updatedImage);
      setCapturedImages(prev => 
        prev.map(img => img.id === selectedImage.id ? updatedImage : img)
      );
    };

    img.src = selectedImage.dataUrl;
  };

  const saveDocument = async () => {
    if (!selectedImage) return;

    setProcessing(true);

    try {
      // Convert data URL to blob
      const response = await fetch(selectedImage.dataUrl);
      const blob = await response.blob();
      
      // Create File object
      const file = new File([blob], `${documentData.name || 'captured_document'}.${settings.format}`, {
        type: `image/${settings.format}`
      });

      // Encrypt and save using document security service
      const metadata = {
        category: documentData.category,
        entityId: entityId || 'mobile_capture',
        entityType: entityType || 'mobile_capture',
        tags: documentData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        description: `${documentData.description} (Mobile Capture - ${new Date().toLocaleString()})`,
        isConfidential: documentData.isConfidential,
        userId: 'current_user',
        userEmail: 'user@example.com'
      };

      const secureDocument = await documentSecurityService.encryptDocument(file, metadata);

      if (onDocumentCaptured) {
        onDocumentCaptured(secureDocument);
      }

      // Reset state and close
      setCurrentStep(0);
      setCapturedImages([]);
      setSelectedImage(null);
      setDocumentData({
        name: '',
        category: 'Other',
        tags: '',
        description: '',
        isConfidential: false
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Failed to save document. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const switchCamera = () => {
    setSettings(prev => ({
      ...prev,
      facingMode: prev.facingMode === 'environment' ? 'user' : 'environment'
    }));
    
    stopCamera();
    setTimeout(startCamera, 100);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const renderCameraView = () => (
    <Stack spacing={2} sx={{ height: '100%' }}>
      {/* Camera Controls */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={1}>
          <Tooltip title="Switch Camera" sx={uniformTooltipStyles}>
            <span style={{ display: 'inline-block' }}>
              <IconButton onClick={switchCamera} disabled={!cameraActive}>
                <FlipCameraIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={`Flash: ${settings.flashMode}`} sx={uniformTooltipStyles}>
            <IconButton onClick={() => setSettings(prev => ({ 
              ...prev, 
              flashMode: prev.flashMode === 'auto' ? 'on' : prev.flashMode === 'on' ? 'off' : 'auto' 
            }))}>
              {settings.flashMode === 'off' ? <FlashOffIcon /> : <FlashOnIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Grid Lines" sx={uniformTooltipStyles}>
            <IconButton onClick={() => setSettings(prev => ({ ...prev, gridLines: !prev.gridLines }))}>
              {settings.gridLines ? <GridOnIcon /> : <GridOffIcon />}
            </IconButton>
          </Tooltip>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Chip 
            label={`${settings.resolution.toUpperCase()}`} 
            size="small" 
            color="primary" 
          />
          <Tooltip title="Fullscreen" sx={uniformTooltipStyles}>
            <IconButton onClick={toggleFullscreen}>
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Camera Viewport */}
      <Box 
        sx={{ 
          position: 'relative', 
          flex: 1,
          border: 2,
          borderColor: 'primary.main',
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'black'
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        
        {/* Grid overlay */}
        {settings.gridLines && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.3) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.3) 1px, transparent 1px)
              `,
              backgroundSize: '33.33% 33.33%',
              pointerEvents: 'none'
            }}
          />
        )}

        {/* Capture button overlay */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10
          }}
        >
          <IconButton
            onClick={captureImage}
            disabled={!cameraActive}
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'white',
              border: 4,
              borderColor: 'primary.main',
              '&:hover': {
                bgcolor: 'grey.100'
              }
            }}
          >
            <PhotoCameraIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          </IconButton>
        </Box>
      </Box>

      {/* Camera Settings */}
      <Stack direction="row" spacing={2} justifyContent="center">
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Resolution</InputLabel>
          <Select
            value={settings.resolution}
            label="Resolution"
            onChange={(e) => setSettings(prev => ({ ...prev, resolution: e.target.value as any }))}
          >
            <MenuItem value="low">Low (720p)</MenuItem>
            <MenuItem value="medium">Medium (1080p)</MenuItem>
            <MenuItem value="high">High (1440p)</MenuItem>
            <MenuItem value="ultra">Ultra (4K)</MenuItem>
          </Select>
        </FormControl>
        
        <FormControlLabel
          control={
            <Switch
              checked={settings.autoEnhance}
              onChange={(e) => setSettings(prev => ({ ...prev, autoEnhance: e.target.checked }))}
            />
          }
          label="Auto Enhance"
        />
      </Stack>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Stack>
  );

  const renderImageProcessing = () => (
    <Stack spacing={3}>
      {/* Tabs for different processing options */}
      <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
        <Tab label="Adjust" />
        <Tab label="Filters" />
        <Tab label="Crop & Rotate" />
      </Tabs>

      {/* Image Preview */}
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        {selectedImage && (
          <img
            src={selectedImage.dataUrl}
            alt="Captured document"
            style={{
              maxWidth: '100%',
              maxHeight: '300px',
              border: '2px solid #ccc',
              borderRadius: '8px'
            }}
          />
        )}
      </Box>

      {/* Processing Controls */}
      {currentTab === 0 && (
        <Stack spacing={3}>
          <Box>
            <Typography gutterBottom>Brightness: {brightness}%</Typography>
            <Slider
              value={brightness}
              onChange={(_, value) => setBrightness(value as number)}
              min={50}
              max={150}
              step={5}
            />
          </Box>
          
          <Box>
            <Typography gutterBottom>Contrast: {contrast}%</Typography>
            <Slider
              value={contrast}
              onChange={(_, value) => setContrast(value as number)}
              min={50}
              max={200}
              step={5}
            />
          </Box>
          
          <Box>
            <Typography gutterBottom>Saturation: {saturation}%</Typography>
            <Slider
              value={saturation}
              onChange={(_, value) => setSaturation(value as number)}
              min={0}
              max={200}
              step={5}
            />
          </Box>
        </Stack>
      )}

      {currentTab === 1 && (
        <Grid container spacing={2}>
          {imageFilters.map((filter) => (
            <Grid item xs={6} sm={4} key={filter.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: selectedFilter === filter.id ? 2 : 1,
                  borderColor: selectedFilter === filter.id ? 'primary.main' : 'divider'
                }}
                onClick={() => setSelectedFilter(filter.id)}
              >
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="subtitle2">{filter.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {filter.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {currentTab === 2 && (
        <Stack spacing={2}>
          <Typography variant="h6">Rotate</Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              startIcon={<RotateIcon />}
              onClick={() => rotateImage(-90)}
            >
              Rotate Left
            </Button>
            <Button
              variant="outlined"
              startIcon={<RotateIcon sx={{ transform: 'scaleX(-1)' }} />}
              onClick={() => rotateImage(90)}
            >
              Rotate Right
            </Button>
          </Stack>
          
          <Typography variant="h6">Auto Straighten</Typography>
          <Button
            variant="outlined"
            startIcon={<StraightenIcon />}
            onClick={() => {
              // Auto-straighten functionality would go here
              alert('Auto-straighten feature coming soon!');
            }}
          >
            Auto Straighten
          </Button>
        </Stack>
      )}

      {/* Apply Processing Button */}
      <Button
        variant="contained"
        onClick={applyImageProcessing}
        disabled={processing}
        startIcon={processing ? <CircularProgress size={20} /> : <AutoFixHighIcon />}
        fullWidth
      >
        {processing ? 'Processing...' : 'Apply Changes'}
      </Button>
    </Stack>
  );

  const renderDocumentDetails = () => (
    <Stack spacing={3}>
      <Typography variant="h6">Document Information</Typography>
      
      <TextField
        label="Document Name"
        value={documentData.name}
        onChange={(e) => setDocumentData({ ...documentData, name: e.target.value })}
        placeholder="Enter document name"
        required
      />
      
      <FormControl fullWidth required>
        <InputLabel>Category</InputLabel>
        <Select
          value={documentData.category}
          label="Category"
          onChange={(e) => setDocumentData({ ...documentData, category: e.target.value })}
        >
          <MenuItem value="Lease">Lease</MenuItem>
          <MenuItem value="Insurance">Insurance</MenuItem>
          <MenuItem value="Inspection">Inspection</MenuItem>
          <MenuItem value="Maintenance">Maintenance</MenuItem>
          <MenuItem value="Legal">Legal</MenuItem>
          <MenuItem value="Financial">Financial</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </Select>
      </FormControl>
      
      <TextField
        label="Tags"
        value={documentData.tags}
        onChange={(e) => setDocumentData({ ...documentData, tags: e.target.value })}
        placeholder="Enter tags separated by commas"
        helperText="Tags help with organization and search"
      />
      
      <TextField
        label="Description"
        value={documentData.description}
        onChange={(e) => setDocumentData({ ...documentData, description: e.target.value })}
        multiline
        rows={3}
        placeholder="Optional description"
      />
      
      <FormControlLabel
        control={
          <Switch
            checked={documentData.isConfidential}
            onChange={(e) => setDocumentData({ ...documentData, isConfidential: e.target.checked })}
          />
        }
        label="Mark as Confidential"
      />

      {/* Captured Images Preview */}
      {capturedImages.length > 1 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>Captured Images</Typography>
          <Stack direction="row" spacing={1} sx={{ overflowX: 'auto' }}>
            {capturedImages.map((image) => (
              <Box
                key={image.id}
                onClick={() => setSelectedImage(image)}
                sx={{
                  minWidth: 80,
                  height: 80,
                  border: selectedImage?.id === image.id ? 2 : 1,
                  borderColor: selectedImage?.id === image.id ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
              >
                <img
                  src={image.dataUrl}
                  alt="Captured"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );

  const steps = [
    {
      label: 'Capture',
      content: renderCameraView()
    },
    {
      label: 'Process',
      content: renderImageProcessing()
    },
    {
      label: 'Save',
      content: renderDocumentDetails()
    }
  ];

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isFullscreen}
      PaperProps={{
        sx: {
          height: isFullscreen ? '100vh' : '90vh',
          m: isFullscreen ? 0 : 2
        }
      }}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <DocumentScannerIcon />
            </Avatar>
            <Typography variant="h6">Mobile Document Capture</Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Chip icon={<SmartphoneIcon />} label="Mobile Optimized" size="small" />
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Stack>
      </DialogTitle>
      
      <DialogContent sx={{ p: 2, height: '100%', overflow: 'hidden' }}>
        <Stack spacing={2} sx={{ height: '100%' }}>
          {/* Progress Stepper */}
          <Stepper activeStep={currentStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step Content */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {steps[currentStep].content}
          </Box>
        </Stack>
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          Back
        </Button>
        
        {currentStep < steps.length - 1 ? (
          <Button 
            variant="contained"
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={currentStep === 0 && capturedImages.length === 0}
          >
            Next
          </Button>
        ) : (
          <Button 
            variant="contained"
            onClick={saveDocument}
            disabled={processing || !documentData.name.trim()}
            startIcon={processing ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {processing ? 'Saving...' : 'Save Document'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
