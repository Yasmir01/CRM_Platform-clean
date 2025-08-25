/**
 * Service for handling file uploads, storage, and previews in the CRM system
 * Converts files to base64 for localStorage persistence and provides preview functionality
 */

export interface StoredFile {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  dataUrl: string; // Base64 data URL for storage and preview
  preview?: string; // Thumbnail or preview data URL for images
}

export interface FileUploadResult {
  success: boolean;
  files?: StoredFile[];
  error?: string;
}

export class FileStorageService {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly SUPPORTED_TYPES = {
    images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    text: ['text/plain', 'text/csv'],
    archives: ['application/zip', 'application/x-rar-compressed']
  };

  /**
   * Process and store files for an application
   */
  static async processFiles(files: File[]): Promise<FileUploadResult> {
    try {
      const processedFiles: StoredFile[] = [];

      for (const file of files) {
        console.log('Processing file:', file.name, file.type, file.size);

        // Validate file object
        if (!file || !file.name || file.size === undefined) {
          return {
            success: false,
            error: 'Invalid file object provided'
          };
        }

        // Validate file name
        if (file.name.trim() === '') {
          return {
            success: false,
            error: 'File name cannot be empty'
          };
        }

        // Validate file size
        if (file.size === 0) {
          return {
            success: false,
            error: `File "${file.name}" is empty`
          };
        }

        if (file.size > this.MAX_FILE_SIZE) {
          return {
            success: false,
            error: `File "${file.name}" is too large. Maximum size is ${this.MAX_FILE_SIZE / 1024 / 1024}MB`
          };
        }

        // Validate file type
        if (!file.type) {
          console.warn('File type not detected for:', file.name, '- attempting to process anyway');
        } else if (!this.isValidFileType(file.type)) {
          return {
            success: false,
            error: `File type "${file.type}" is not supported for "${file.name}"`
          };
        }

        // Convert file to base64
        const dataUrl = await this.fileToDataUrl(file);
        console.log('Generated dataUrl for', file.name, ':', dataUrl.substring(0, 50) + '...');

        // Generate preview for images (use dataUrl as fallback)
        let preview: string | undefined;
        if (this.isImageFile(file.type)) {
          try {
            preview = await this.generateImagePreview(file);
            console.log('Generated preview for', file.name, ':', preview ? preview.substring(0, 50) + '...' : 'null');
          } catch (previewError) {
            console.warn('Failed to generate preview for', file.name, ', using dataUrl as fallback:', previewError);
            // For images, always ensure we have a preview - use the full dataUrl as fallback
            preview = dataUrl;
          }
        }

        // Ensure images always have a preview
        if (this.isImageFile(file.type) && !preview) {
          console.warn('No preview available for image', file.name, ', using dataUrl as preview');
          preview = dataUrl;
        }

        const storedFile: StoredFile = {
          id: this.generateFileId(),
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          dataUrl,
          preview
        };

        console.log('Created stored file:', storedFile.name, 'with dataUrl length:', storedFile.dataUrl.length);
        processedFiles.push(storedFile);
      }

      return {
        success: true,
        files: processedFiles
      };
    } catch (error) {
      console.error('Error processing files:', error);
      return {
        success: false,
        error: 'Failed to process files. Please try again.'
      };
    }
  }

  /**
   * Convert File object to base64 data URL
   */
  private static fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Generate preview thumbnail for images
   */
  private static generateImagePreview(file: File, maxWidth = 150, maxHeight = 150): Promise<string> {
    return new Promise((resolve, reject) => {
      // Set timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        console.warn('Image preview generation timed out for:', file.name);
        reject(new Error(`Preview generation timed out for ${file.name}`));
      }, 10000); // 10 second timeout

      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        clearTimeout(timeoutId);
        reject(new Error('Canvas context not available'));
        return;
      }

      img.onload = () => {
        try {
          clearTimeout(timeoutId);
          console.log('Image loaded for preview:', file.name, 'Original dimensions:', img.width, 'x', img.height);

          // Validate image dimensions
          if (img.width === 0 || img.height === 0) {
            throw new Error('Invalid image dimensions');
          }

          // Calculate dimensions maintaining aspect ratio
          const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
          const newWidth = Math.max(1, Math.floor(img.width * ratio));
          const newHeight = Math.max(1, Math.floor(img.height * ratio));

          canvas.width = newWidth;
          canvas.height = newHeight;

          // Clear canvas and draw image
          ctx.clearRect(0, 0, newWidth, newHeight);
          ctx.drawImage(img, 0, 0, newWidth, newHeight);

          // Convert to data URL with error handling
          const format = file.type === 'image/png' || file.type === 'image/webp' ? 'image/png' : 'image/jpeg';
          const quality = format === 'image/jpeg' ? 0.8 : undefined;
          const previewDataUrl = canvas.toDataURL(format, quality);

          // Validate generated data URL
          if (!previewDataUrl || previewDataUrl === 'data:,') {
            throw new Error('Failed to generate valid data URL');
          }

          console.log('Successfully generated preview for:', file.name, 'New dimensions:', newWidth, 'x', newHeight, 'Preview length:', previewDataUrl.length);

          // Clean up
          URL.revokeObjectURL(img.src);
          resolve(previewDataUrl);
        } catch (error) {
          clearTimeout(timeoutId);
          console.error('Error generating preview for', file.name, ':', error);
          URL.revokeObjectURL(img.src);
          reject(error);
        }
      };

      img.onerror = (error) => {
        clearTimeout(timeoutId);
        console.error('Image failed to load for preview:', file.name, error);
        URL.revokeObjectURL(img.src);
        reject(new Error(`Failed to load image: ${file.name} - ${error}`));
      };

      try {
        // Validate file before creating object URL
        if (!file || file.size === 0) {
          throw new Error('Invalid file object');
        }

        const objectUrl = URL.createObjectURL(file);
        console.log('Created object URL for preview:', file.name, objectUrl);

        // Set crossOrigin to handle CORS issues
        img.crossOrigin = 'anonymous';
        img.src = objectUrl;
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Failed to create object URL for', file.name, ':', error);
        reject(error);
      }
    });
  }

  /**
   * Check if file type is supported
   */
  private static isValidFileType(type: string): boolean {
    return Object.values(this.SUPPORTED_TYPES).some(types => types.includes(type));
  }

  /**
   * Check if file is an image
   */
  static isImageFile(type: string): boolean {
    return this.SUPPORTED_TYPES.images.includes(type);
  }

  /**
   * Check if file is a PDF
   */
  static isPdfFile(type: string): boolean {
    return type === 'application/pdf';
  }

  /**
   * Check if file is a document
   */
  static isDocumentFile(type: string): boolean {
    return this.SUPPORTED_TYPES.documents.includes(type);
  }

  /**
   * Generate unique file ID
   */
  private static generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file icon based on type
   */
  static getFileTypeIcon(type: string): string {
    if (this.isImageFile(type)) return '🖼️';
    if (this.isPdfFile(type)) return '📄';
    if (this.isDocumentFile(type)) return '📝';
    if (this.SUPPORTED_TYPES.text.includes(type)) return '📋';
    if (this.SUPPORTED_TYPES.archives.includes(type)) return '📦';
    return '📎';
  }

  /**
   * Download a stored file
   */
  static downloadFile(storedFile: StoredFile): void {
    const link = document.createElement('a');
    link.href = storedFile.dataUrl;
    link.download = storedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Get all supported file types for dropzone
   */
  static getSupportedFileTypes(): string[] {
    return Object.values(this.SUPPORTED_TYPES).flat();
  }

  /**
   * Create dropzone accept object
   */
  static getDropzoneAccept(): Record<string, string[]> {
    const accept: Record<string, string[]> = {};
    this.getSupportedFileTypes().forEach(type => {
      accept[type] = [];
    });
    return accept;
  }
}
