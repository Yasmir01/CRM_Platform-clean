/**
 * Utility functions for handling applicant names consistently across the application
 */

/**
 * Extracts applicant name from form data, handling both snake_case and camelCase field names
 * @param formData - The form data object
 * @returns The applicant name or undefined if no valid name is found
 */
export function getApplicantNameFromFormData(formData: Record<string, any>): string | undefined {
  if (!formData) return undefined;

  // First check for direct applicant name field
  const directName = formData.applicant_name || formData.applicantName;
  if (directName && typeof directName === 'string' && directName.trim()) {
    return directName.trim();
  }

  // Then try to construct from first/last name (check both naming conventions)
  const firstName = formData.first_name || formData.firstName;
  const lastName = formData.last_name || formData.lastName;

  const nameParts = [firstName, lastName]
    .filter(part => part && typeof part === 'string' && part.trim())
    .map(part => part.trim());

  if (nameParts.length > 0) {
    return nameParts.join(' ');
  }

  return undefined;
}

/**
 * Gets a display-ready applicant name with fallback
 * @param formData - The form data object
 * @param fallback - The fallback text to use if no name is found (default: "Unknown Applicant")
 * @returns The applicant name or fallback text
 */
export function getDisplayApplicantName(
  formData: Record<string, any>, 
  fallback: string = "Unknown Applicant"
): string {
  return getApplicantNameFromFormData(formData) || fallback;
}

/**
 * Normalizes applicant name from any source (direct name or form data)
 * @param applicantName - Existing applicant name
 * @param formData - Form data to fall back to
 * @param fallback - Final fallback text
 * @returns Normalized applicant name
 */
export function normalizeApplicantName(
  applicantName?: string,
  formData?: Record<string, any>,
  fallback: string = "Unknown Applicant"
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
    const nameFromForm = getApplicantNameFromFormData(formData);
    if (nameFromForm) {
      return nameFromForm;
    }
  }

  return fallback;
}
