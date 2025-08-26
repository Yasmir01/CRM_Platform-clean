import QRCode from 'qrcode';

export interface QRCodeCustomization {
  foregroundColor: string;
  backgroundColor: string;
  gradientEnabled: boolean;
  gradientColors: string[];
  logoUrl?: string;
  logoSize: number;
  style: string;
  pattern: string;
  eyeStyle: string;
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

        if (customization.gradientEnabled && customization.gradientColors && customization.gradientColors.length >= 2) {
          // Create gradient background
          const gradient = ctx.createLinearGradient(0, 0, size, size);
          gradient.addColorStop(0, customization.gradientColors[0] || customization.foregroundColor);
          gradient.addColorStop(1, customization.gradientColors[1] || customization.backgroundColor);
          
          // Fill background
          ctx.fillStyle = customization.backgroundColor;
          ctx.fillRect(0, 0, size, size);
          
          // Draw QR image
          ctx.drawImage(qrImage, 0, 0, size, size);
          
          // Apply gradient to QR modules
          ctx.globalCompositeOperation = 'source-in';
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, size, size);
          
          // Reset composite operation
          ctx.globalCompositeOperation = 'source-over';
        } else {
          // Fill background
          ctx.fillStyle = customization.backgroundColor;
          ctx.fillRect(0, 0, size, size);
          
          // Draw QR with custom colors
          ctx.drawImage(qrImage, 0, 0, size, size);
          
          // Apply foreground color to QR modules
          if (customization.foregroundColor !== '#000000') {
            ctx.globalCompositeOperation = 'source-in';
            ctx.fillStyle = customization.foregroundColor;
            ctx.fillRect(0, 0, size, size);
            ctx.globalCompositeOperation = 'source-over';
          }
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
