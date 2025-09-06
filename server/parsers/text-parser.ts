import * as chrono from 'chrono-node';

export interface ParsedItem {
  title: string;
  type: 'ASSIGNMENT' | 'EXAM' | 'QUIZ' | 'PROJECT' | 'READING' | 'EVENT' | 'DEADLINE';
  dueDate?: Date;
  weight?: number;
  description?: string;
  confidence: number;
  sourceLine: string;
}

export interface ParseResult {
  courseName?: string;
  instructor?: string;
  semester?: string;
  year?: number;
  items: ParsedItem[];
}

/**
 * Parse syllabus text content and extract structured information
 */
export function parseSyllabusText(content: string): ParseResult {
  const lines = content.split('\n').filter(line => line.trim().length > 0);
  const result: ParseResult = {
    items: []
  };

  // Extract course info from first few lines
  const courseInfo = extractCourseInfo(lines.slice(0, 5).join(' '));
  Object.assign(result, courseInfo);

  // Parse each line for assignments, exams, etc.
  for (const line of lines) {
    const items = parseLineForItems(line);
    result.items.push(...items);
  }

  return result;
}

/**
 * Extract course name, instructor, semester, year from text
 */
function extractCourseInfo(text: string): Partial<ParseResult> {
  const info: Partial<ParseResult> = {};
  
  // Course name patterns
  const coursePatterns = [
    /([A-Z]{2,4}\s*\d{3}[A-Z]?)\s*[-:]?\s*([^,\n]+)/i,
    /^([^,\n]+(?:course|class|seminar))/i,
    /^([A-Za-z\s]+\d+[A-Za-z]?)/
  ];

  for (const pattern of coursePatterns) {
    const match = text.match(pattern);
    if (match) {
      info.courseName = match[1].trim();
      break;
    }
  }

  // Instructor patterns
  const instructorPatterns = [
    /(?:professor|prof\.?|dr\.?|instructor)\s*:?\s*([a-z\s\.]+)/i,
    /taught\s+by\s+([a-z\s\.]+)/i
  ];

  for (const pattern of instructorPatterns) {
    const match = text.match(pattern);
    if (match) {
      info.instructor = match[1].trim();
      break;
    }
  }

  // Semester and year
  const semesterMatch = text.match(/(fall|spring|summer|winter)\s*(\d{4})/i);
  if (semesterMatch) {
    info.semester = semesterMatch[1];
    info.year = parseInt(semesterMatch[2]);
  }

  return info;
}

/**
 * Parse a single line for assignment/exam information
 */
function parseLineForItems(line: string): ParsedItem[] {
  const items: ParsedItem[] = [];
  const trimmedLine = line.trim();
  
  if (trimmedLine.length < 10) return items; // Skip very short lines

  // Determine item type based on keywords
  const type = determineItemType(trimmedLine);
  if (!type) return items;

  // Extract title (everything before "due" or date patterns)
  const title = extractTitle(trimmedLine, type);
  
  // Extract due date using chrono-node
  const dates = chrono.parse(trimmedLine);
  const dueDate = dates.length > 0 ? dates[0].start.date() : undefined;
  
  // Extract weight/percentage
  const weight = extractWeight(trimmedLine);
  
  // Calculate confidence based on various factors
  const confidence = calculateConfidence(trimmedLine, type, !!dueDate, !!weight);

  items.push({
    title: title || `${type.toLowerCase()} (untitled)`,
    type,
    dueDate,
    weight,
    confidence,
    sourceLine: trimmedLine,
    description: extractDescription(trimmedLine)
  });

  return items;
}

/**
 * Determine the type of academic item based on keywords
 */
function determineItemType(text: string): ParsedItem['type'] | null {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('exam') || lowerText.includes('final') || lowerText.includes('midterm')) {
    return 'EXAM';
  }
  if (lowerText.includes('quiz')) {
    return 'QUIZ';
  }
  if (lowerText.includes('project') || lowerText.includes('paper')) {
    return 'PROJECT';
  }
  if (lowerText.includes('assignment') || lowerText.includes('homework') || lowerText.includes('hw')) {
    return 'ASSIGNMENT';
  }
  if (lowerText.includes('reading') || lowerText.includes('read')) {
    return 'READING';
  }
  if (lowerText.includes('presentation') || lowerText.includes('class')) {
    return 'EVENT';
  }
  if (lowerText.includes('due') || lowerText.includes('deadline')) {
    return 'DEADLINE';
  }
  
  // If it has a date but no clear type, assume it's an assignment
  const hasDate = chrono.parse(text).length > 0;
  if (hasDate) {
    return 'ASSIGNMENT';
  }
  
  return null;
}

/**
 * Extract the title/name of the item
 */
function extractTitle(text: string, type: ParsedItem['type']): string {
  // Remove common prefixes
  let title = text.replace(/^\s*[-•]\s*/, '');
  
  // Extract everything before "due" or date patterns
  const dueIndex = title.toLowerCase().indexOf(' due');
  if (dueIndex > 0) {
    title = title.substring(0, dueIndex);
  }
  
  // Extract everything before percentage or weight
  const percentMatch = title.match(/^([^%]+)\s*-?\s*\d+%/);
  if (percentMatch) {
    title = percentMatch[1];
  }
  
  return title.trim() || `${type.toLowerCase()} item`;
}

/**
 * Extract weight/percentage from text
 */
function extractWeight(text: string): number | undefined {
  const percentMatch = text.match(/(\d+(?:\.\d+)?)\s*%/);
  if (percentMatch) {
    return parseFloat(percentMatch[1]);
  }
  
  const pointsMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:points?|pts?)/i);
  if (pointsMatch) {
    return parseFloat(pointsMatch[1]);
  }
  
  return undefined;
}

/**
 * Extract description from the line
 */
function extractDescription(text: string): string | undefined {
  // Look for text after a dash or colon that isn't a date or percentage
  const descMatch = text.match(/(?:[-:])\s*([^%\d]{10,})/);
  if (descMatch) {
    return descMatch[1].trim();
  }
  
  return undefined;
}

/**
 * Calculate confidence score based on various factors
 */
function calculateConfidence(
  text: string, 
  type: ParsedItem['type'], 
  hasDate: boolean, 
  hasWeight: boolean
): number {
  let confidence = 0.5; // Base confidence
  
  // Boost confidence for clear type indicators
  const lowerText = text.toLowerCase();
  if (lowerText.includes(type.toLowerCase())) {
    confidence += 0.2;
  }
  
  // Boost for having a date
  if (hasDate) {
    confidence += 0.2;
  }
  
  // Boost for having weight/points
  if (hasWeight) {
    confidence += 0.1;
  }
  
  // Boost for structured format (starts with number or bullet)
  if (/^\s*[\d•-]/.test(text)) {
    confidence += 0.1;
  }
  
  // Reduce confidence for very short or unclear text
  if (text.length < 20) {
    confidence -= 0.1;
  }
  
  return Math.min(Math.max(confidence, 0.1), 1.0);
}
