/**
 * Utility for generating unique 6-digit property codes
 * Format: 3 letters followed by 3 numbers (e.g., ABC123)
 */

export class PropertyCodeGenerator {
  private static usedCodes = new Set<string>();

  /**
   * Generates a unique 6-digit property code
   * Format: 3 letters + 3 numbers (e.g., ABC123)
   */
  static generateCode(): string {
    let code: string;
    let attempts = 0;
    const maxAttempts = 1000;

    do {
      code = this.createRandomCode();
      attempts++;
      
      if (attempts > maxAttempts) {
        throw new Error('Unable to generate unique property code after maximum attempts');
      }
    } while (this.usedCodes.has(code));

    this.usedCodes.add(code);
    return code;
  }

  /**
   * Creates a random 6-digit code with 3 letters + 3 numbers
   */
  private static createRandomCode(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    
    let letterPart = '';
    let numberPart = '';
    
    // Generate 3 random letters
    for (let i = 0; i < 3; i++) {
      letterPart += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    // Generate 3 random numbers
    for (let i = 0; i < 3; i++) {
      numberPart += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    return letterPart + numberPart;
  }

  /**
   * Validates if a code follows the correct format
   */
  static isValidCode(code: string): boolean {
    if (!code || code.length !== 6) return false;
    
    const letterPart = code.substring(0, 3);
    const numberPart = code.substring(3, 6);
    
    // Check if first 3 characters are letters
    if (!/^[A-Z]{3}$/.test(letterPart)) return false;
    
    // Check if last 3 characters are numbers
    if (!/^[0-9]{3}$/.test(numberPart)) return false;
    
    return true;
  }

  /**
   * Registers an existing code to prevent duplicates
   */
  static registerExistingCode(code: string): boolean {
    if (!this.isValidCode(code)) return false;
    
    this.usedCodes.add(code);
    return true;
  }

  /**
   * Removes a code from the used codes set (for cleanup)
   */
  static releaseCode(code: string): boolean {
    return this.usedCodes.delete(code);
  }

  /**
   * Gets all used codes (for debugging/management)
   */
  static getUsedCodes(): string[] {
    return Array.from(this.usedCodes);
  }

  /**
   * Clears all used codes (for testing)
   */
  static clearUsedCodes(): void {
    this.usedCodes.clear();
  }

  /**
   * Initializes the generator with existing property codes from the system
   */
  static initializeWithExistingCodes(existingCodes: string[]): void {
    this.clearUsedCodes();
    existingCodes.forEach(code => {
      if (this.isValidCode(code)) {
        this.usedCodes.add(code);
      }
    });
  }

  /**
   * Generates multiple unique codes at once
   */
  static generateMultipleCodes(count: number): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(this.generateCode());
    }
    return codes;
  }

  /**
   * Formats a code for display (adds hyphen between letters and numbers)
   */
  static formatCodeForDisplay(code: string): string {
    if (!this.isValidCode(code)) return code;
    return `${code.substring(0, 3)}-${code.substring(3, 6)}`;
  }

  /**
   * Removes formatting from a display code
   */
  static unformatCode(formattedCode: string): string {
    return formattedCode.replace('-', '');
  }
}

// Initialize with some default codes to avoid conflicts
PropertyCodeGenerator.registerExistingCode('ABC123');
PropertyCodeGenerator.registerExistingCode('XYZ789');
PropertyCodeGenerator.registerExistingCode('DEF456');
