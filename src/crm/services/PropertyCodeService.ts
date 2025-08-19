import { PropertyCodeGenerator } from '../utils/propertyCodeGenerator';
import { LocalStorageService } from './LocalStorageService';

/**
 * Service for managing property codes across the CRM system
 */
export class PropertyCodeService {
  private static instance: PropertyCodeService;
  
  private constructor() {
    this.initializeExistingCodes();
  }

  public static getInstance(): PropertyCodeService {
    if (!PropertyCodeService.instance) {
      PropertyCodeService.instance = new PropertyCodeService();
    }
    return PropertyCodeService.instance;
  }

  /**
   * Initialize the property code generator with existing codes from the system
   */
  public initializeExistingCodes(): void {
    try {
      const properties = LocalStorageService.getProperties();
      const applications = LocalStorageService.getApplications();
      
      const existingCodes: string[] = [];
      
      // Collect codes from properties
      properties.forEach(property => {
        if (property.propertyCode && PropertyCodeGenerator.isValidCode(property.propertyCode)) {
          existingCodes.push(property.propertyCode);
        }
      });
      
      // Collect codes from applications
      applications.forEach(application => {
        if (application.propertyCode && PropertyCodeGenerator.isValidCode(application.propertyCode)) {
          existingCodes.push(application.propertyCode);
        }
      });
      
      // Initialize the generator with existing codes
      PropertyCodeGenerator.initializeWithExistingCodes(existingCodes);
      
      console.log(`Initialized PropertyCodeService with ${existingCodes.length} existing codes`);
    } catch (error) {
      console.error('Error initializing existing property codes:', error);
    }
  }

  /**
   * Assign a property code to a property if it doesn't have one
   */
  public assignPropertyCode(propertyId: string): string {
    try {
      const properties = LocalStorageService.getProperties();
      const property = properties.find(p => p.id === propertyId);
      
      if (!property) {
        throw new Error(`Property with ID ${propertyId} not found`);
      }
      
      // If property already has a valid code, return it
      if (property.propertyCode && PropertyCodeGenerator.isValidCode(property.propertyCode)) {
        return property.propertyCode;
      }
      
      // Generate new code
      const newCode = PropertyCodeGenerator.generateCode();
      
      // Update property with new code
      const updatedProperties = properties.map(p => 
        p.id === propertyId ? { ...p, propertyCode: newCode } : p
      );
      
      LocalStorageService.saveProperties(updatedProperties);
      
      console.log(`Assigned property code ${newCode} to property ${propertyId}`);
      return newCode;
    } catch (error) {
      console.error('Error assigning property code:', error);
      // Fallback to a simple code if generation fails
      return `ERR${Math.floor(Math.random() * 1000)}`;
    }
  }

  /**
   * Get property code for a property, generating one if needed
   */
  public getPropertyCode(propertyId: string): string {
    return this.assignPropertyCode(propertyId);
  }

  /**
   * Validate and format a property code for display
   */
  public formatPropertyCode(code: string): string {
    if (PropertyCodeGenerator.isValidCode(code)) {
      return PropertyCodeGenerator.formatCodeForDisplay(code);
    }
    return code;
  }

  /**
   * Generate codes for all properties that don't have them
   */
  public generateMissingCodes(): { updated: number; errors: string[] } {
    const errors: string[] = [];
    let updated = 0;
    
    try {
      const properties = LocalStorageService.getProperties();
      const updatedProperties = properties.map(property => {
        try {
          if (!property.propertyCode || !PropertyCodeGenerator.isValidCode(property.propertyCode)) {
            const newCode = PropertyCodeGenerator.generateCode();
            updated++;
            return { ...property, propertyCode: newCode };
          }
          return property;
        } catch (error) {
          errors.push(`Failed to generate code for property ${property.id}: ${error}`);
          return property;
        }
      });
      
      if (updated > 0) {
        LocalStorageService.saveProperties(updatedProperties);
      }
      
      console.log(`Generated ${updated} missing property codes`);
      return { updated, errors };
    } catch (error) {
      errors.push(`System error: ${error}`);
      return { updated: 0, errors };
    }
  }

  /**
   * Get statistics about property codes in the system
   */
  public getCodeStatistics(): {
    totalProperties: number;
    propertiesWithCodes: number;
    propertiesWithoutCodes: number;
    validCodes: number;
    invalidCodes: number;
    allCodes: string[];
  } {
    try {
      const properties = LocalStorageService.getProperties();
      
      let propertiesWithCodes = 0;
      let validCodes = 0;
      let invalidCodes = 0;
      const allCodes: string[] = [];
      
      properties.forEach(property => {
        if (property.propertyCode) {
          propertiesWithCodes++;
          allCodes.push(property.propertyCode);
          
          if (PropertyCodeGenerator.isValidCode(property.propertyCode)) {
            validCodes++;
          } else {
            invalidCodes++;
          }
        }
      });
      
      return {
        totalProperties: properties.length,
        propertiesWithCodes,
        propertiesWithoutCodes: properties.length - propertiesWithCodes,
        validCodes,
        invalidCodes,
        allCodes
      };
    } catch (error) {
      console.error('Error getting code statistics:', error);
      return {
        totalProperties: 0,
        propertiesWithCodes: 0,
        propertiesWithoutCodes: 0,
        validCodes: 0,
        invalidCodes: 0,
        allCodes: []
      };
    }
  }

  /**
   * Find property by code
   */
  public findPropertyByCode(code: string): any | null {
    try {
      const properties = LocalStorageService.getProperties();
      return properties.find(p => p.propertyCode === code) || null;
    } catch (error) {
      console.error('Error finding property by code:', error);
      return null;
    }
  }

  /**
   * Update an existing property code (use with caution)
   */
  public updatePropertyCode(propertyId: string, newCode: string): boolean {
    try {
      if (!PropertyCodeGenerator.isValidCode(newCode)) {
        throw new Error('Invalid property code format');
      }
      
      // Check if code is already in use
      const existingProperty = this.findPropertyByCode(newCode);
      if (existingProperty && existingProperty.id !== propertyId) {
        throw new Error('Property code is already in use');
      }
      
      const properties = LocalStorageService.getProperties();
      const property = properties.find(p => p.id === propertyId);
      
      if (!property) {
        throw new Error(`Property with ID ${propertyId} not found`);
      }
      
      // Release old code if it exists
      if (property.propertyCode) {
        PropertyCodeGenerator.releaseCode(property.propertyCode);
      }
      
      // Register new code
      PropertyCodeGenerator.registerExistingCode(newCode);
      
      // Update property
      const updatedProperties = properties.map(p => 
        p.id === propertyId ? { ...p, propertyCode: newCode } : p
      );
      
      LocalStorageService.saveProperties(updatedProperties);
      
      console.log(`Updated property code for ${propertyId} to ${newCode}`);
      return true;
    } catch (error) {
      console.error('Error updating property code:', error);
      return false;
    }
  }
}

// Auto-initialize the service
PropertyCodeService.getInstance();
