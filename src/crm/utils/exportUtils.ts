// Export utility functions for CRM data
export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeHeaders?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Convert data to CSV format
export function convertToCSV(data: any[], headers?: string[]): string {
  if (!data || data.length === 0) return '';

  const csvHeaders = headers || Object.keys(data[0]);
  const csvRows = data.map(row => 
    csvHeaders.map(header => {
      const value = row[header];
      // Handle values that might contain commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',')
  );

  return [csvHeaders.join(','), ...csvRows].join('\n');
}

// Convert data to JSON format
export function convertToJSON(data: any[]): string {
  return JSON.stringify(data, null, 2);
}

// Download data as a file
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Main export function
export async function exportData(data: any[], options: ExportOptions): Promise<void> {
  const timestamp = new Date().toISOString().split('T')[0];
  const baseFilename = options.filename || `crm-export-${timestamp}`;

  try {
    switch (options.format) {
      case 'csv':
        const csvContent = convertToCSV(data);
        downloadFile(csvContent, `${baseFilename}.csv`, 'text/csv');
        break;

      case 'json':
        const jsonContent = convertToJSON(data);
        downloadFile(jsonContent, `${baseFilename}.json`, 'application/json');
        break;

      case 'excel':
        // For Excel, we'll use CSV format with .xlsx extension
        // In a real implementation, you'd use a library like SheetJS
        const excelContent = convertToCSV(data);
        downloadFile(excelContent, `${baseFilename}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        alert('Excel export uses CSV format. For full Excel features, consider integrating SheetJS library.');
        break;

      case 'pdf':
        // For PDF, we'll create a simple text version
        // In a real implementation, you'd use a library like jsPDF
        const pdfContent = generatePDFContent(data);
        downloadFile(pdfContent, `${baseFilename}.pdf`, 'application/pdf');
        alert('PDF export is simplified. For full PDF features, consider integrating jsPDF library.');
        break;

      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  } catch (error) {
    console.error('Export failed:', error);
    alert('Export failed. Please try again.');
  }
}

// Generate simple PDF content (text-based)
function generatePDFContent(data: any[]): string {
  if (!data || data.length === 0) return 'No data to export';

  const headers = Object.keys(data[0]);
  let content = 'CRM Data Export\n';
  content += '=================\n\n';
  
  data.forEach((item, index) => {
    content += `Record ${index + 1}:\n`;
    headers.forEach(header => {
      content += `${header}: ${item[header] || 'N/A'}\n`;
    });
    content += '\n';
  });

  return content;
}

// Export specific data types with predefined formats
export const exportPropertiesData = (properties: any[]) => {
  const formattedData = properties.map(property => ({
    'Property Name': property.name,
    'Address': property.address,
    'Type': property.type,
    'Units': property.units,
    'Occupancy': property.occupancy,
    'Monthly Rent': `$${property.monthlyRent}`,
    'Status': property.status,
    'Manager': property.manager,
    'Tenant': property.tenant || 'N/A'
  }));

  return formattedData;
};

export const exportTenantsData = (tenants: any[]) => {
  const formattedData = tenants.map(tenant => ({
    'Name': tenant.name,
    'Email': tenant.email,
    'Phone': tenant.phone,
    'Property': tenant.property,
    'Unit': tenant.unit,
    'Lease Start': tenant.leaseStart,
    'Lease End': tenant.leaseEnd,
    'Monthly Rent': `$${tenant.monthlyRent}`,
    'Status': tenant.status
  }));

  return formattedData;
};

export const exportTasksData = (tasks: any[]) => {
  const formattedData = tasks.map(task => ({
    'Title': task.title,
    'Description': task.description,
    'Assigned To': task.assignedTo,
    'Priority': task.priority,
    'Status': task.status,
    'Due Date': task.dueDate,
    'Category': task.category,
    'Property': task.property || 'N/A',
    'Created Date': task.createdDate
  }));

  return formattedData;
};

export const exportWorkOrdersData = (workOrders: any[]) => {
  const formattedData = workOrders.map(workOrder => ({
    'Title': workOrder.title,
    'Description': workOrder.description,
    'Property': workOrder.property,
    'Unit': workOrder.unit,
    'Priority': workOrder.priority,
    'Status': workOrder.status,
    'Assigned To': workOrder.assignedTo,
    'Created Date': workOrder.createdDate,
    'Due Date': workOrder.dueDate,
    'Estimated Cost': workOrder.estimatedCost ? `$${workOrder.estimatedCost}` : 'N/A'
  }));

  return formattedData;
};
