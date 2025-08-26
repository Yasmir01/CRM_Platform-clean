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

    // Generate QR code data URL from external API first
    const qrDataUrl = await QRCode.toDataURL(content, {
      width: size,
      margin: 0,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Load the QR image
    const qrImage = new Image();
    qrImage.crossOrigin = 'anonymous';
    
    return new Promise((resolve, reject) => {
      qrImage.onload = () => {
        // Clear canvas
        ctx.clearRect(0, 0, size, size);

        // Fill background first
        ctx.fillStyle = customization.backgroundColor;
        ctx.fillRect(0, 0, size, size);

        // Create a temporary canvas to process the QR image
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        tempCanvas.width = size;
        tempCanvas.height = size;

        // Draw QR image to temp canvas
        tempCtx.drawImage(qrImage, 0, 0, size, size);

        // Get image data to identify QR modules (black pixels)
        const imageData = tempCtx.getImageData(0, 0, size, size);
        const data = imageData.data;

        // Process each pixel
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // If pixel is dark (QR module), make it transparent so we can fill with our color
          // If pixel is light (background), make it fully transparent
          if (r < 128 && g < 128 && b < 128) {
            // Dark pixel - this is a QR module, keep it but make it black
            data[i] = 0;     // R
            data[i + 1] = 0; // G
            data[i + 2] = 0; // B
            data[i + 3] = 255; // A - fully opaque
          } else {
            // Light pixel - make it transparent
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
            data[i + 3] = 0; // A - fully transparent
          }
        }

        // Put the processed image data back
        tempCtx.putImageData(imageData, 0, 0);

        if (customization.gradientEnabled && customization.gradientColors && customization.gradientColors.length >= 2) {
          // Create gradient for QR modules
          const gradient = ctx.createLinearGradient(0, 0, size, size);
          gradient.addColorStop(0, customization.gradientColors[0] || customization.foregroundColor);
          gradient.addColorStop(1, customization.gradientColors[1] || customization.backgroundColor);

          // Fill the main canvas with gradient
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, size, size);

          // Use destination-in to only keep gradient where QR modules are
          ctx.globalCompositeOperation = 'destination-in';
          ctx.drawImage(tempCanvas, 0, 0, size, size);

          // Reset composite operation and add background back
          ctx.globalCompositeOperation = 'destination-over';
          ctx.fillStyle = customization.backgroundColor;
          ctx.fillRect(0, 0, size, size);

          // Reset composite operation
          ctx.globalCompositeOperation = 'source-over';
        } else {
          // For solid color QR codes
          // Fill with foreground color
          ctx.fillStyle = customization.foregroundColor;
          ctx.fillRect(0, 0, size, size);

          // Use destination-in to only keep color where QR modules are
          ctx.globalCompositeOperation = 'destination-in';
          ctx.drawImage(tempCanvas, 0, 0, size, size);

          // Reset composite operation and add background back
          ctx.globalCompositeOperation = 'destination-over';
          ctx.fillStyle = customization.backgroundColor;
          ctx.fillRect(0, 0, size, size);

          // Reset composite operation
          ctx.globalCompositeOperation = 'source-over';
        }

        // Add logo if provided
        if (customization.logoUrl) {
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
            
            resolve(canvas.toDataURL('image/png'));
          };
          logoImage.onerror = () => {
            // If logo fails to load, just return without logo
            resolve(canvas.toDataURL('image/png'));
          };
          logoImage.src = customization.logoUrl;
        } else {
          resolve(canvas.toDataURL('image/png'));
        }
      };
      
      qrImage.onerror = () => {
        reject(new Error('Failed to load QR image'));
      };
      
      qrImage.src = qrDataUrl;
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
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
