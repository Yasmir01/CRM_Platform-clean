export function displayContactName(contact: any): string {
  if (!contact) return 'Unknown';
  if (typeof contact === 'string') return contact;
  if (contact.name && String(contact.name).trim()) return String(contact.name).trim();
  const first = contact.firstName || contact.first || '';
  const last = contact.lastName || '';
  const full = `${first} ${last}`.trim();
  if (full) return full;
  return contact.email || 'Unknown';
}

export default displayContactName;
