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
        // Validate file size
        if (file.size > this.MAX_FILE_SIZE) {
          return {
            success: false,
            error: `File "${file.name}" is too large. Maximum size is ${this.MAX_FILE_SIZE / 1024 / 1024}MB`
          };
        }

        // Validate file type
        if (!this.isValidFileType(file.type)) {
          return {
            success: false,
            error: `File type "${file.type}" is not supported for "${file.name}"`
          };
        }

        // Convert file to base64
        const dataUrl = await this.fileToDataUrl(file);
        
        // Generate preview for images
        let preview: string | undefined;
        if (this.isImageFile(file.type)) {
          preview = await this.generateImagePreview(file);
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
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        // Calculate dimensions maintaining aspect ratio
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        // Draw and convert to data URL
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
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
  private static isImageFile(type: string): boolean {
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
