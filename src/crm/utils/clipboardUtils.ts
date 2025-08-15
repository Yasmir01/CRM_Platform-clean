/**
 * Robust clipboard utilities with fallback mechanisms
 * Handles various browser limitations and permission issues
 */

export interface CopyOptions {
  successMessage?: string;
  errorMessage?: string;
  showFallbackDialog?: boolean;
}

/**
 * Main copy function with comprehensive fallback mechanisms
 */
export const copyToClipboard = async (
  text: string,
  options: CopyOptions = {}
): Promise<boolean> => {
  const {
    successMessage = 'Content copied to clipboard!',
    errorMessage = 'Failed to copy content to clipboard.',
    showFallbackDialog = true
  } = options;

  // Ensure text is not empty
  if (!text || typeof text !== 'string') {
    console.warn('Cannot copy empty or invalid text');
    if (errorMessage) {
      alert('No content to copy');
    }
    return false;
  }

  try {
    // Method 1: Modern Clipboard API (preferred)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      if (successMessage) {
        // Use a more user-friendly notification instead of alert
        showCopyNotification(successMessage);
      }
      return true;
    }
  } catch (err) {
    console.warn('Clipboard API failed, trying fallback:', err);
  }

  // Method 2: execCommand fallback
  try {
    const success = copyWithExecCommand(text);
    if (success) {
      if (successMessage) {
        showCopyNotification(successMessage);
      }
      return true;
    }
  } catch (err) {
    console.warn('execCommand failed, trying manual fallback:', err);
  }

  // Method 3: Manual selection fallback
  if (showFallbackDialog) {
    showManualCopyDialog(text);
    return true; // We showed the dialog, consider it handled
  } else {
    if (errorMessage) {
      showCopyNotification(errorMessage, 'error');
    }
    return false;
  }
};

/**
 * Copy using the deprecated but widely supported execCommand
 */
const copyWithExecCommand = (text: string): boolean => {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  
  // Make the textarea out of viewport
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  textArea.style.opacity = '0';
  textArea.style.pointerEvents = 'none';
  textArea.style.zIndex = '-1';
  textArea.setAttribute('readonly', '');
  
  document.body.appendChild(textArea);
  
  try {
    textArea.focus();
    textArea.select();
    
    // For mobile devices
    textArea.setSelectionRange(0, 99999);
    
    const successful = document.execCommand('copy');
    return successful;
  } finally {
    document.body.removeChild(textArea);
  }
};

/**
 * Show a modal dialog for manual copying when all else fails
 */
const showManualCopyDialog = (text: string): void => {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  // Create container
  const container = document.createElement('div');
  container.style.cssText = `
    background-color: white;
    padding: 24px;
    border-radius: 8px;
    max-width: 90%;
    max-height: 80%;
    overflow: auto;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    position: relative;
  `;

  // Create title
  const title = document.createElement('h3');
  title.textContent = 'Copy Content Manually';
  title.style.cssText = `
    margin: 0 0 16px 0;
    color: #333;
    font-size: 18px;
    font-weight: 600;
  `;

  // Create instruction
  const instruction = document.createElement('p');
  instruction.textContent = 'Please select all text below and copy it manually (Ctrl+C or ⌘+C):';
  instruction.style.cssText = `
    margin: 0 0 16px 0;
    color: #666;
    font-size: 14px;
    line-height: 1.4;
  `;

  // Create textarea
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.readOnly = true;
  textArea.style.cssText = `
    width: 100%;
    min-height: 120px;
    max-height: 300px;
    padding: 12px;
    border: 2px solid #e1e5e9;
    border-radius: 6px;
    font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
    font-size: 13px;
    line-height: 1.4;
    resize: vertical;
    outline: none;
    background-color: #f8f9fa;
  `;

  // Create buttons container
  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 20px;
  `;

  // Create select all button
  const selectAllButton = document.createElement('button');
  selectAllButton.textContent = 'Select All';
  selectAllButton.style.cssText = `
    padding: 8px 16px;
    background-color: #6c757d;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s;
  `;
  selectAllButton.onmouseover = () => {
    selectAllButton.style.backgroundColor = '#5a6268';
  };
  selectAllButton.onmouseout = () => {
    selectAllButton.style.backgroundColor = '#6c757d';
  };

  // Create close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.style.cssText = `
    padding: 8px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s;
  `;
  closeButton.onmouseover = () => {
    closeButton.style.backgroundColor = '#0056b3';
  };
  closeButton.onmouseout = () => {
    closeButton.style.backgroundColor = '#007bff';
  };

  // Event handlers
  selectAllButton.onclick = () => {
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length);
  };

  closeButton.onclick = () => {
    document.body.removeChild(overlay);
  };

  overlay.onclick = (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  };

  // Handle escape key
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      document.body.removeChild(overlay);
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  // Assemble the dialog
  buttonContainer.appendChild(selectAllButton);
  buttonContainer.appendChild(closeButton);
  
  container.appendChild(title);
  container.appendChild(instruction);
  container.appendChild(textArea);
  container.appendChild(buttonContainer);
  
  overlay.appendChild(container);
  document.body.appendChild(overlay);

  // Auto-select the text
  setTimeout(() => {
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length);
  }, 100);
};

/**
 * Quick copy function for simple use cases
 */
export const quickCopy = (text: string, message?: string): Promise<boolean> => {
  return copyToClipboard(text, { 
    successMessage: message || 'Copied!',
    showFallbackDialog: true 
  });
};

/**
 * Silent copy function that doesn't show alerts
 */
export const silentCopy = (text: string): Promise<boolean> => {
  return copyToClipboard(text, {
    successMessage: undefined,
    errorMessage: undefined,
    showFallbackDialog: false
  });
};

/**
 * Show a non-intrusive copy notification
 */
const showCopyNotification = (message: string, type: 'success' | 'error' = 'success'): void => {
  // Create notification element
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: ${ type === 'success' ? '#4caf50' : '#f44336' };
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10001;
    transform: translateX(400px);
    transition: transform 0.3s ease-in-out;
    max-width: 300px;
    word-wrap: break-word;
  `;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 10);

  // Animate out and remove
  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
};

export default { copyToClipboard, quickCopy, silentCopy };
