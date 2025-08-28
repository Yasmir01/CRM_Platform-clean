// Bulk upload utility functions for CRM data
export type ImportFormat = 'csv' | 'json' | 'excel';

export interface ImportOptions {
  format: ImportFormat;
  validateData?: boolean;
  skipErrors?: boolean;
  updateExisting?: boolean;
}

export interface ImportResult {
  success: boolean;
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  errors: ImportError[];
  data: any[];
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  data?: any;
}

// CSV parsing function
export function parseCSV(content: string): any[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
  const data: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    data.push(row);
  }

  return data;
}

// Parse a single CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// Property validation functions
export interface PropertyData {
  name: string;
  address: string;
  type: 'Apartment' | 'House' | 'Condo' | 'Townhome' | 'Commercial';
  units: number;
  monthlyRent: number;
  securityDeposit?: number;
  managerId?: string;
  description?: string;
  amenities?: string;
  squareFootage?: number;
  bedrooms?: number;
  bathrooms?: number;
  petPolicy?: string;
  petDeposit?: number;
  petFee?: number;
  parkingSpaces?: number;
}

export function validatePropertyData(data: any[], existingProperties: any[] = []): ImportResult {
  const errors: ImportError[] = [];
  const validData: PropertyData[] = [];
  
  data.forEach((row, index) => {
    const rowNumber = index + 2; // +2 because CSV has header and array is 0-indexed
    
    // Required fields validation
    if (!row.name || !row.name.trim()) {
      errors.push({ row: rowNumber, field: 'name', message: 'Property name is required' });
    }
    
    if (!row.address || !row.address.trim()) {
      errors.push({ row: rowNumber, field: 'address', message: 'Address is required' });
    }
    
    if (!row.type || !['Apartment', 'House', 'Condo', 'Townhome', 'Commercial'].includes(row.type)) {
      errors.push({ row: rowNumber, field: 'type', message: 'Type must be one of: Apartment, House, Condo, Townhome, Commercial' });
    }
    
    // Numeric field validation
    const units = parseInt(row.units);
    if (isNaN(units) || units < 1) {
      errors.push({ row: rowNumber, field: 'units', message: 'Units must be a positive number' });
    }
    
    const monthlyRent = parseFloat(row.monthlyRent);
    if (isNaN(monthlyRent) || monthlyRent < 0) {
      errors.push({ row: rowNumber, field: 'monthlyRent', message: 'Monthly rent must be a valid positive number' });
    }
    
    // Optional numeric fields
    const squareFootage = row.squareFootage ? parseInt(row.squareFootage) : undefined;
    if (row.squareFootage && (isNaN(squareFootage!) || squareFootage! < 0)) {
      errors.push({ row: rowNumber, field: 'squareFootage', message: 'Square footage must be a positive number' });
    }
    
    const bedrooms = row.bedrooms ? parseInt(row.bedrooms) : undefined;
    if (row.bedrooms && (isNaN(bedrooms!) || bedrooms! < 0)) {
      errors.push({ row: rowNumber, field: 'bedrooms', message: 'Bedrooms must be a positive number' });
    }
    
    const bathrooms = row.bathrooms ? parseFloat(row.bathrooms) : undefined;
    if (row.bathrooms && (isNaN(bathrooms!) || bathrooms! < 0)) {
      errors.push({ row: rowNumber, field: 'bathrooms', message: 'Bathrooms must be a positive number' });
    }
    
    // Check for duplicates
    const duplicate = existingProperties.find(p => 
      p.name.toLowerCase() === row.name.toLowerCase() && 
      p.address.toLowerCase() === row.address.toLowerCase()
    );
    if (duplicate) {
      errors.push({ row: rowNumber, message: `Property "${row.name}" at "${row.address}" already exists` });
    }
    
    // If no errors for this row, add to valid data
    const rowErrors = errors.filter(e => e.row === rowNumber);
    if (rowErrors.length === 0) {
      validData.push({
        name: row.name.trim(),
        address: row.address.trim(),
        type: row.type,
        units: units,
        monthlyRent: monthlyRent,
        securityDeposit: row.securityDeposit ? parseFloat(row.securityDeposit) : undefined,
        description: row.description?.trim() || '',
        amenities: row.amenities?.trim() || '',
        squareFootage: squareFootage,
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        petPolicy: row.petPolicy?.trim() || '',
        petDeposit: row.petDeposit ? parseFloat(row.petDeposit) : undefined,
        petFee: row.petFee ? parseFloat(row.petFee) : undefined,
        parkingSpaces: row.parkingSpaces ? parseInt(row.parkingSpaces) : undefined
      });
    }
  });
  
  return {
    success: errors.length === 0,
    totalRecords: data.length,
    successfulRecords: validData.length,
    failedRecords: errors.length,
    errors,
    data: validData
  };
}

// Contact validation functions
export interface ContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  position?: string;
  source?: string;
  status?: string;
  tags?: string[];
  notes?: string;
}

export function validateContactData(data: any[], existingContacts: any[] = []): ImportResult {
  const errors: ImportError[] = [];
  const validData: ContactData[] = [];
  
  data.forEach((row, index) => {
    const rowNumber = index + 2;
    
    // Required fields validation
    if (!row.firstName || !row.firstName.trim()) {
      errors.push({ row: rowNumber, field: 'firstName', message: 'First name is required' });
    }
    
    if (!row.lastName || !row.lastName.trim()) {
      errors.push({ row: rowNumber, field: 'lastName', message: 'Last name is required' });
    }
    
    if (!row.email || !row.email.trim()) {
      errors.push({ row: rowNumber, field: 'email', message: 'Email is required' });
    } else {
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.email)) {
        errors.push({ row: rowNumber, field: 'email', message: 'Invalid email format' });
      }
    }
    
    if (!row.phone || !row.phone.trim()) {
      errors.push({ row: rowNumber, field: 'phone', message: 'Phone number is required' });
    }
    
    // Check for duplicates
    const duplicate = existingContacts.find(c => c.email.toLowerCase() === row.email.toLowerCase());
    if (duplicate) {
      errors.push({ row: rowNumber, message: `Contact with email "${row.email}" already exists` });
    }
    
    // If no errors for this row, add to valid data
    const rowErrors = errors.filter(e => e.row === rowNumber);
    if (rowErrors.length === 0) {
      validData.push({
        firstName: row.firstName.trim(),
        lastName: row.lastName.trim(),
        email: row.email.trim().toLowerCase(),
        phone: row.phone.trim(),
        company: row.company?.trim() || '',
        position: row.position?.trim() || '',
        source: row.source?.trim() || 'Import',
        status: row.status?.trim() || 'Lead',
        tags: row.tags ? row.tags.split(',').map((tag: string) => tag.trim()) : [],
        notes: row.notes?.trim() || ''
      });
    }
  });
  
  return {
    success: errors.length === 0,
    totalRecords: data.length,
    successfulRecords: validData.length,
    failedRecords: errors.length,
    errors,
    data: validData
  };
}

// Tenant validation functions
export interface TenantData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyId?: string;
  propertyName?: string;
  unit?: string;
  leaseStart: string;
  leaseEnd: string;
  monthlyRent: number;
  emergencyContact?: string;
  emergencyPhone?: string;
}

export function validateTenantData(data: any[], existingTenants: any[] = [], properties: any[] = []): ImportResult {
  const errors: ImportError[] = [];
  const validData: TenantData[] = [];
  
  data.forEach((row, index) => {
    const rowNumber = index + 2;
    
    // Required fields validation
    if (!row.firstName || !row.firstName.trim()) {
      errors.push({ row: rowNumber, field: 'firstName', message: 'First name is required' });
    }
    
    if (!row.lastName || !row.lastName.trim()) {
      errors.push({ row: rowNumber, field: 'lastName', message: 'Last name is required' });
    }
    
    if (!row.email || !row.email.trim()) {
      errors.push({ row: rowNumber, field: 'email', message: 'Email is required' });
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.email)) {
        errors.push({ row: rowNumber, field: 'email', message: 'Invalid email format' });
      }
    }
    
    if (!row.phone || !row.phone.trim()) {
      errors.push({ row: rowNumber, field: 'phone', message: 'Phone number is required' });
    }
    
    // Date validation
    if (!row.leaseStart || !row.leaseStart.trim()) {
      errors.push({ row: rowNumber, field: 'leaseStart', message: 'Lease start date is required' });
    } else if (isNaN(Date.parse(row.leaseStart))) {
      errors.push({ row: rowNumber, field: 'leaseStart', message: 'Invalid lease start date format' });
    }
    
    if (!row.leaseEnd || !row.leaseEnd.trim()) {
      errors.push({ row: rowNumber, field: 'leaseEnd', message: 'Lease end date is required' });
    } else if (isNaN(Date.parse(row.leaseEnd))) {
      errors.push({ row: rowNumber, field: 'leaseEnd', message: 'Invalid lease end date format' });
    }
    
    // Monthly rent validation
    const monthlyRent = parseFloat(row.monthlyRent);
    if (isNaN(monthlyRent) || monthlyRent < 0) {
      errors.push({ row: rowNumber, field: 'monthlyRent', message: 'Monthly rent must be a valid positive number' });
    }
    
    // Property validation
    let propertyId = row.propertyId;
    if (!propertyId && row.propertyName) {
      const property = properties.find(p => p.name.toLowerCase() === row.propertyName.toLowerCase());
      if (property) {
        propertyId = property.id;
      } else {
        errors.push({ row: rowNumber, field: 'propertyName', message: `Property "${row.propertyName}" not found` });
      }
    }
    
    // Check for duplicates
    const duplicate = existingTenants.find(t => t.email.toLowerCase() === row.email.toLowerCase());
    if (duplicate) {
      errors.push({ row: rowNumber, message: `Tenant with email "${row.email}" already exists` });
    }
    
    // If no errors for this row, add to valid data
    const rowErrors = errors.filter(e => e.row === rowNumber);
    if (rowErrors.length === 0) {
      validData.push({
        firstName: row.firstName.trim(),
        lastName: row.lastName.trim(),
        email: row.email.trim().toLowerCase(),
        phone: row.phone.trim(),
        propertyId: propertyId,
        propertyName: row.propertyName?.trim(),
        unit: row.unit?.trim() || '',
        leaseStart: row.leaseStart.trim(),
        leaseEnd: row.leaseEnd.trim(),
        monthlyRent: monthlyRent,
        emergencyContact: row.emergencyContact?.trim() || '',
        emergencyPhone: row.emergencyPhone?.trim() || ''
      });
    }
  });
  
  return {
    success: errors.length === 0,
    totalRecords: data.length,
    successfulRecords: validData.length,
    failedRecords: errors.length,
    errors,
    data: validData
  };
}

// Template generation functions
export function generatePropertyTemplate(): string {
  const headers = [
    'name',
    'address', 
    'type',
    'units',
    'monthlyRent',
    'securityDeposit',
    'description',
    'amenities',
    'squareFootage',
    'bedrooms',
    'bathrooms',
    'petPolicy',
    'petDeposit',
    'petFee',
    'parkingSpaces'
  ];
  
  const sampleData = [
    'Sunset Apartments',
    '123 Main St, Los Angeles, CA 90210',
    'Apartment',
    '24',
    '2500',
    '2500',
    'Beautiful apartment complex with modern amenities',
    'Pool, Gym, Parking, Laundry',
    '850',
    '2',
    '1',
    'Cats allowed',
    '500',
    '50',
    '1'
  ];
  
  return [headers.join(','), sampleData.join(',')].join('\n');
}

export function generateContactTemplate(): string {
  const headers = [
    'firstName',
    'lastName',
    'email',
    'phone',
    'company',
    'position',
    'source',
    'status',
    'tags',
    'notes'
  ];
  
  const sampleData = [
    'John',
    'Doe',
    'john.doe@email.com',
    '(555) 123-4567',
    'Tech Solutions Inc',
    'Marketing Manager',
    'Website',
    'Lead',
    'VIP, Tech Industry',
    'Interested in premium services'
  ];
  
  return [headers.join(','), sampleData.join(',')].join('\n');
}

export function generateTenantTemplate(): string {
  const headers = [
    'firstName',
    'lastName',
    'email',
    'phone',
    'propertyName',
    'unit',
    'leaseStart',
    'leaseEnd',
    'monthlyRent',
    'emergencyContact',
    'emergencyPhone'
  ];
  
  const sampleData = [
    'Jane',
    'Smith',
    'jane.smith@email.com',
    '(555) 987-6543',
    'Sunset Apartments',
    '2A',
    '2024-01-01',
    '2024-12-31',
    '2500',
    'Mike Smith',
    '(555) 999-8888'
  ];
  
  return [headers.join(','), sampleData.join(',')].join('\n');
}

// File processing function
export function processUploadedFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        if (file.name.endsWith('.csv')) {
          const data = parseCSV(content);
          resolve(data);
        } else if (file.name.endsWith('.json')) {
          const data = JSON.parse(content);
          resolve(Array.isArray(data) ? data : [data]);
        } else {
          reject(new Error('Unsupported file format. Please use CSV or JSON files.'));
        }
      } catch (error) {
        reject(new Error('Failed to parse file: ' + (error as Error).message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}
