import QRCode from 'qrcode';

export interface QRCodeCustomization {
  foregroundColor: string;
  backgroundColor: string;
  gradientEnabled: boolean;
  gradientColors?: string[];
  logoUrl?: string;
  logoSize: number;
  style: "square" | "rounded" | "dots" | "circle";
  pattern: "square" | "circle" | "rounded";
  eyeStyle: "square" | "circle" | "rounded";
  frameStyle?: "none" | "simple" | "rounded" | "shadow";
  frameColor?: string;
  frameText?: string;
}

export const generateCanvasQRCode = async (
  content: string,
  customization: QRCodeCustomization,
  size: number = 300
): Promise<string> => {
  try {
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    canvas.width = size;
    canvas.height = size;

    // For gradient QR codes, we need canvas processing
    if (customization.gradientEnabled && customization.gradientColors && customization.gradientColors.length >= 2) {
      return await generateGradientQR(content, customization, canvas, ctx, size);
    } else {
      // For solid color QR codes, use direct generation
      return await generateSolidQR(content, customization, canvas, ctx, size);
    }
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

// Generate QR with solid colors
const generateSolidQR = async (
  content: string,
  customization: QRCodeCustomization,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  size: number
): Promise<string> => {
  // Generate QR with custom colors directly
  const qrDataUrl = await QRCode.toDataURL(content, {
    width: size,
    margin: 0,
    color: {
      dark: customization.foregroundColor,
      light: customization.backgroundColor
    },
    errorCorrectionLevel: 'M'
  });

  // If no logo, return directly
  if (!customization.logoUrl) {
    return qrDataUrl;
  }

  // If logo needed, draw on canvas
  return new Promise((resolve, reject) => {
    const qrImage = new Image();
    qrImage.crossOrigin = 'anonymous';
    
    qrImage.onload = () => {
      // Draw QR code
      ctx.drawImage(qrImage, 0, 0, size, size);
      
      // Add logo
      addLogo(ctx, customization, size, resolve, reject);
    };
    
    qrImage.onerror = () => reject(new Error('Failed to load QR image'));
    qrImage.src = qrDataUrl;
  });
};

// Generate QR with gradient colors
const generateGradientQR = async (
  content: string,
  customization: QRCodeCustomization,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  size: number
): Promise<string> => {
  // Generate QR with black on transparent
  const qrDataUrl = await QRCode.toDataURL(content, {
    width: size,
    margin: 0,
    color: {
      dark: '#000000',
      light: 'rgba(255,255,255,0)' // Transparent background
    },
    errorCorrectionLevel: 'M'
  });

  return new Promise((resolve, reject) => {
    const qrImage = new Image();
    qrImage.crossOrigin = 'anonymous';
    
    qrImage.onload = () => {
      // Fill canvas with background color first
      ctx.fillStyle = customization.backgroundColor;
      ctx.fillRect(0, 0, size, size);

      // Create and apply gradient
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, customization.gradientColors![0]);
      gradient.addColorStop(1, customization.gradientColors![1]);
      
      // Fill entire canvas with gradient
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      
      // Use QR image as mask - only keep gradient where QR modules are
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(qrImage, 0, 0, size, size);
      
      // Add background back where there are no QR modules
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = customization.backgroundColor;
      ctx.fillRect(0, 0, size, size);
      
      // Reset composite operation
      ctx.globalCompositeOperation = 'source-over';

      // Add logo if needed
      if (customization.logoUrl) {
        addLogo(ctx, customization, size, resolve, reject);
      } else {
        resolve(canvas.toDataURL('image/png'));
      }
    };
    
    qrImage.onerror = () => reject(new Error('Failed to load QR image'));
    qrImage.src = qrDataUrl;
  });
};

// Helper function to add logo
const addLogo = (
  ctx: CanvasRenderingContext2D,
  customization: QRCodeCustomization,
  size: number,
  resolve: (value: string) => void,
  reject: (reason?: any) => void
) => {
  if (!customization.logoUrl) {
    resolve(ctx.canvas.toDataURL('image/png'));
    return;
  }

  const logoImage = new Image();
  logoImage.crossOrigin = 'anonymous';
  
  logoImage.onload = () => {
    const logoSizePixels = (customization.logoSize / 100) * size;
    const logoX = (size - logoSizePixels) / 2;
    const logoY = (size - logoSizePixels) / 2;

    // Create white background for logo
    ctx.fillStyle = 'white';
    
    if (customization.eyeStyle === 'circle') {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, logoSizePixels / 2 + 5, 0, 2 * Math.PI);
      ctx.fill();
    } else if (customization.eyeStyle === 'rounded') {
      const radius = 8;
      ctx.beginPath();
      ctx.roundRect(logoX - 5, logoY - 5, logoSizePixels + 10, logoSizePixels + 10, radius);
      ctx.fill();
    } else {
      ctx.fillRect(logoX - 5, logoY - 5, logoSizePixels + 10, logoSizePixels + 10);
    }

    // Draw logo
    ctx.drawImage(logoImage, logoX, logoY, logoSizePixels, logoSizePixels);
    
    resolve(ctx.canvas.toDataURL('image/png'));
  };
  
  logoImage.onerror = () => {
    // If logo fails to load, just return without logo
    resolve(ctx.canvas.toDataURL('image/png'));
  };
  
  logoImage.src = customization.logoUrl;
};

// Fallback to external API if canvas generation fails
export const generateFallbackQRCode = (content: string, customization: QRCodeCustomization): string => {
  // Ensure URLs have proper protocol
  if (content && !content.startsWith("http://") && !content.startsWith("https://")) {
    content = "https://" + content.replace(/^(www\.)?/, "www.");
  }

  const baseUrl = "https://api.qrserver.com/v1/create-qr-code/";
  const params = new URLSearchParams({
    size: "300x300",
    data: content,
    color: customization.foregroundColor.replace("#", ""),
    bgcolor: customization.backgroundColor.replace("#", ""),
    margin: "0",
    format: "png",
    ecc: "M"
  });

  return `${baseUrl}?${params.toString()}`;
};
