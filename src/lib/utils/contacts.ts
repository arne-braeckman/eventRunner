import type { Id } from "../../../convex/_generated/dataModel";

export interface Contact {
  _id: Id<"contacts">;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  leadSource: "WEBSITE" | "FACEBOOK" | "INSTAGRAM" | "LINKEDIN" | "REFERRAL" | "DIRECT" | "OTHER";
  leadHeat: "COLD" | "WARM" | "HOT";
  status: "UNQUALIFIED" | "PROSPECT" | "LEAD" | "QUALIFIED" | "CUSTOMER" | "LOST";
  notes?: string;
  assignedTo?: Id<"users">;
  createdAt: number;
  updatedAt: number;
}

export function exportContactsToCSV(contacts: Contact[]): void {
  // Define CSV headers
  const headers = [
    'Name',
    'Email', 
    'Phone',
    'Company',
    'Lead Source',
    'Lead Heat',
    'Status',
    'Notes',
    'Created Date',
    'Updated Date'
  ];

  // Convert contacts to CSV rows
  const csvRows = [
    headers.join(','),
    ...contacts.map(contact => [
      escapeCSVField(contact.name),
      escapeCSVField(contact.email),
      escapeCSVField(contact.phone || ''),
      escapeCSVField(contact.company || ''),
      escapeCSVField(contact.leadSource),
      escapeCSVField(contact.leadHeat),
      escapeCSVField(contact.status),
      escapeCSVField(contact.notes || ''),
      escapeCSVField(new Date(contact.createdAt).toLocaleDateString()),
      escapeCSVField(new Date(contact.updatedAt).toLocaleDateString())
    ].join(','))
  ];

  // Create CSV content
  const csvContent = csvRows.join('\n');

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const filename = `contacts-export-${timestamp}.csv`;

  // Create and trigger download
  downloadCSV(csvContent, filename);
}

function escapeCSVField(field: string): string {
  // Handle null/undefined
  if (!field) return '';
  
  // Convert to string and escape quotes
  const escaped = String(field).replace(/"/g, '""');
  
  // Wrap in quotes if contains comma, quote, or newline
  if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
    return `"${escaped}"`;
  }
  
  return escaped;
}

function downloadCSV(content: string, filename: string): void {
  // Create blob with UTF-8 BOM for proper Excel compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
}

export function processContactsInChunks<T>(
  contacts: Contact[],
  processor: (chunk: Contact[]) => T,
  chunkSize: number = 1000
): T[] {
  const results: T[] = [];
  
  for (let i = 0; i < contacts.length; i += chunkSize) {
    const chunk = contacts.slice(i, i + chunkSize);
    results.push(processor(chunk));
  }
  
  return results;
}