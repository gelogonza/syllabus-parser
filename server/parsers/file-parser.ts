// Use dynamic imports to avoid issues during module loading

/**
 * Extract text content from different file types
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const mimeType = file.type;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    switch (mimeType) {
      case 'application/pdf':
        return await extractFromPDF(buffer);
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return await extractFromDOCX(buffer);
      
      case 'text/plain':
        return await extractFromTXT(buffer);
      
      default:
        // Fallback: try to read as text
        return buffer.toString('utf-8');
    }
  } catch (error) {
    console.error(`Error extracting text from ${mimeType}:`, error);
    throw new Error(`Failed to extract text from ${mimeType} file`);
  }
}

/**
 * Extract text from PDF files
 */
async function extractFromPDF(buffer: Buffer): Promise<string> {
  // PDF parsing is temporarily disabled due to library issues
  // Users should convert PDFs to text or use the paste text feature
  throw new Error('PDF parsing is temporarily unavailable. Please convert your PDF to text and paste the content, or upload a .docx or .txt file instead.');
}

/**
 * Extract text from DOCX files
 */
async function extractFromDOCX(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to avoid module loading issues
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    
    if (result.messages.length > 0) {
      console.warn('DOCX parsing warnings:', result.messages);
    }
    
    return result.value;
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error('Failed to parse DOCX file. The file may be corrupted or in an unsupported format.');
  }
}

/**
 * Extract text from plain text files
 */
async function extractFromTXT(buffer: Buffer): Promise<string> {
  try {
    // Try UTF-8 first
    let text = buffer.toString('utf-8');
    
    // Check if the text contains replacement characters (indicating encoding issues)
    if (text.includes('\uFFFD')) {
      // Try other common encodings
      const encodings = ['latin1', 'ascii', 'utf16le'];
      
      for (const encoding of encodings) {
        try {
          text = buffer.toString(encoding as BufferEncoding);
          if (!text.includes('\uFFFD')) {
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }
    
    return text;
  } catch (error) {
    console.error('TXT parsing error:', error);
    throw new Error('Failed to parse text file. The file may be in an unsupported encoding.');
  }
}

/**
 * Validate file type and size before processing
 */
export function validateFile(file: File): { isValid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const supportedTypes = [
    // 'application/pdf', // Temporarily disabled due to library issues
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 10MB'
    };
  }

  if (!supportedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'File type not supported. Please upload DOCX or TXT files, or use the "Paste Text" option for PDF content.'
    };
  }

  return { isValid: true };
}

/**
 * Get file type description for user display
 */
export function getFileTypeDescription(mimeType: string): string {
  switch (mimeType) {
    case 'application/pdf':
      return 'PDF Document';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'Microsoft Word Document';
    case 'text/plain':
      return 'Plain Text File';
    default:
      return 'Unknown File Type';
  }
}
