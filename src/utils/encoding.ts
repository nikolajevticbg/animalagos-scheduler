/**
 * Utility functions for handling text encoding
 */

/**
 * Encodes a string using Latin-1 (ISO-8859-1) encoding
 * This is necessary for compatibility with older systems that don't handle UTF-8 properly
 */
export function latinEncode(str: string): string {
  if (!str) return '';

  // First normalize the string to composed form (NFC)
  const normalized = str.normalize('NFC');
  
  // Then perform character-by-character Latin-1 encoding
  return normalized
    .replace(/ç/g, '%E7') // Latin-1 encoding for ç
    .replace(/á/g, '%E1') // Latin-1 encoding for á
    .replace(/à/g, '%E0') // Latin-1 encoding for à
    .replace(/ã/g, '%E3') // Latin-1 encoding for ã
    .replace(/â/g, '%E2') // Latin-1 encoding for â
    .replace(/é/g, '%E9') // Latin-1 encoding for é
    .replace(/ê/g, '%EA') // Latin-1 encoding for ê
    .replace(/í/g, '%ED') // Latin-1 encoding for í
    .replace(/ó/g, '%F3') // Latin-1 encoding for ó
    .replace(/ô/g, '%F4') // Latin-1 encoding for ô
    .replace(/õ/g, '%F5') // Latin-1 encoding for õ
    .replace(/ú/g, '%FA') // Latin-1 encoding for ú
    .replace(/ü/g, '%FC') // Latin-1 encoding for ü
    .replace(/ñ/g, '%F1') // Latin-1 encoding for ñ
    .replace(/ /g, '%20'); // Space
}

/**
 * Builds a form data string with properly encoded parameters
 * Uses mixed encoding strategy (Latin-1 for specific fields, UTF-8 for others)
 */
export function buildFormData(
  data: Record<string, string>, 
  latinFields: string[] = []
): string {
  const formParams: string[] = [];
  
  for (const [key, value] of Object.entries(data)) {
    let encodedValue: string;
    
    if (latinFields.includes(key)) {
      // Use Latin-1 encoding for specified fields
      encodedValue = latinEncode(value);
    } else {
      // Use UTF-8 encoding for other fields
      encodedValue = encodeURIComponent(value);
    }
    
    formParams.push(`${encodeURIComponent(key)}=${encodedValue}`);
  }
  
  return formParams.join('&');
} 