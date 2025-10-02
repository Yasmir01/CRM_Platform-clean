/**
 * Utility functions for handling applicant names consistently across the application
 */

/**
 * Extracts applicant name from form data using various field name patterns and template metadata
 * @param formData - The form data object
 * @param formFields - Optional template form fields to check labels
 * @returns The applicant name or undefined if no valid name is found
 */
export function getApplicantNameFromFormData(
  formData: Record<string, any>,
  formFields?: any[]
): string | undefined {
  if (!formData) return undefined;

  // Extended list of field names to check for direct name fields
  const directNameFields = [
    'applicant_name', 'applicantName',
    'full_name', 'fullName', 'name',
    'tenant_name', 'tenantName',
    'applicant_full_name', 'applicantFullName',
    'contact_name', 'contactName'
  ];

  // Check for direct name fields
  for (const fieldName of directNameFields) {
    const value = formData[fieldName];
    if (value && typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  // Extended list of first/last name field combinations
  const firstNameFields = [
    'first_name', 'firstName',
    'tenant_first_name', 'tenantFirstName',
    'applicant_first_name', 'applicantFirstName'
  ];

  const lastNameFields = [
    'last_name', 'lastName',
    'tenant_last_name', 'tenantLastName',
    'applicant_last_name', 'applicantLastName'
  ];

  // Try to construct from first/last name combinations
  for (const firstField of firstNameFields) {
    for (const lastField of lastNameFields) {
      const firstName = formData[firstField];
      const lastName = formData[lastField];

      if (firstName || lastName) {
        const nameParts = [firstName, lastName]
          .filter(part => part && typeof part === 'string' && part.trim())
          .map(part => part.trim());

        if (nameParts.length > 0) {
          return nameParts.join(' ');
        }
      }
    }
  }

  // If we have form fields metadata, try to find name fields by label
  if (formFields && Array.isArray(formFields)) {
    // Look for full name fields by label
    const fullNameField = formFields.find(field =>
      field.label &&
      /\b(full.?name|applicant.?name|tenant.?name|name)\b/i.test(field.label) &&
      !/\b(first|last|middle|emergency|contact|spouse|employer)\b/i.test(field.label)
    );

    if (fullNameField && formData[fullNameField.id]) {
      const value = formData[fullNameField.id];
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }

    // Look for first/last name fields by label
    const firstNameField = formFields.find(field =>
      field.label && /\b(first.?name|given.?name)\b/i.test(field.label)
    );

    const lastNameField = formFields.find(field =>
      field.label && /\b(last.?name|family.?name|surname)\b/i.test(field.label)
    );

    if (firstNameField || lastNameField) {
      const firstName = firstNameField ? formData[firstNameField.id] : '';
      const lastName = lastNameField ? formData[lastNameField.id] : '';

      const nameParts = [firstName, lastName]
        .filter(part => part && typeof part === 'string' && part.trim())
        .map(part => part.trim());

      if (nameParts.length > 0) {
        return nameParts.join(' ');
      }
    }
  }

  return undefined;
}

/**
 * Gets a display-ready applicant name with fallback
 * @param formData - The form data object
 * @param fallback - The fallback text to use if no name is found (default: "Unknown Applicant")
 * @param formFields - Optional template form fields to check labels
 * @returns The applicant name or fallback text
 */
export function getDisplayApplicantName(
  formData: Record<string, any>,
  fallback: string = "Unknown Applicant",
  formFields?: any[]
): string {
  return getApplicantNameFromFormData(formData, formFields) || fallback;
}

/**
 * Normalizes applicant name from any source (direct name or form data)
 * @param applicantName - Existing applicant name
 * @param formData - Form data to fall back to
 * @param fallback - Final fallback text
 * @param formFields - Optional template form fields to check labels
 * @returns Normalized applicant name
 */
export function normalizeApplicantName(
  applicantName?: string,
  formData?: Record<string, any>,
  fallback: string = "Unknown Applicant",
  formFields?: any[]
): string {
  // If we have a valid applicant name that isn't a placeholder, use it
  if (applicantName &&
      typeof applicantName === 'string' &&
      applicantName.trim() &&
      !applicantName.toLowerCase().includes('undefined') &&
      applicantName !== 'Unknown Applicant') {
    return applicantName.trim();
  }

  // Otherwise try to get from form data
  if (formData) {
    const nameFromForm = getApplicantNameFromFormData(formData, formFields);
    if (nameFromForm) {
      return nameFromForm;
    }
  }

  return fallback;
}
