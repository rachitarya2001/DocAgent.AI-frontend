
/**
 * Removes timestamp prefix from document names for display
 * Converts "1753557716602-filename.pdf" to "filename.pdf"
 * @param fileName - The full filename with timestamp prefix
 * @returns Clean filename without timestamp
 */
export const formatDocumentName = (fileName: string): string => {
    // Handle file paths - extract just the filename
    const fileNameOnly = fileName.split('\\').pop() || fileName.split('/').pop() || fileName;

    // Remove timestamp prefix (numbers followed by hyphen at start)
    return fileNameOnly.replace(/^\d+-/, '');
};

/**
 * Formats file size from bytes to MB with 2 decimal places
 * @param bytes - File size in bytes
 * @returns Formatted string like "2.45 MB"
 */
export const formatFileSize = (bytes: number): string => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
};

/**
 * Formats date string to localized date
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
};