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
  const normalized = content
    .replace(/\r\n?/g, '\n')
    .replace(/[\u00A0\t]+/g, ' ') // non-breaking spaces/tabs to spaces
    .replace(/\s+\-\s+(\d+%)/g, ' - $1'); // normalize space before percent
  const lines = normalized.split('\n').map(l => l.trim()).filter(line => line.length > 0);
  const result: ParseResult = {
    items: []
  };

  // Extract course info from first few lines
  const courseInfo = extractCourseInfo(lines.slice(0, 5).join(' '));
  Object.assign(result, courseInfo);

  // Parse each line for assignments, exams, etc. Only keep items that have a date
  for (const line of lines) {
    const items = parseLineForItems(line, { year: result.year }).filter(i => !!i.dueDate);
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
function parseLineForItems(line: string, context?: { year?: number }): ParsedItem[] {
  const items: ParsedItem[] = [];
  const trimmedLine = line.trim();
  
  if (trimmedLine.length < 10) return items; // Skip very short lines

  // Determine item type based on keywords
  const type = determineItemType(trimmedLine);
  if (!type) return items;

  // Extract due date using chrono-node (prefer explicit time when present)
  const dueDate = extractDueDate(trimmedLine, context?.year);
  if (!dueDate) return items; // enforce date presence

  // Extract title with date/weight segments removed
  const title = extractTitle(trimmedLine, type);
  
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
  
  if (/(final\s+exam|midterm|exam)/i.test(lowerText)) {
    return 'EXAM';
  }
  if (/\bquiz\b|\btest\b|reading\s+quiz/i.test(lowerText)) {
    return 'QUIZ';
  }
  if (/(project|deliverable|milestone|proposal|paper|presentation)/i.test(lowerText)) {
    return 'PROJECT';
  }
  if (/(assignment|homework|problem\s*set|\bpset\b|\bhw\b|lab\s*report|\blab\b)/i.test(lowerText)) {
    return 'ASSIGNMENT';
  }
  if (/(reading|read\s+chapter|chapters?)/i.test(lowerText)) {
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
  title = title.replace(/^\s*(assignment|homework|quiz|exam|final exam|midterm|project|lab\s*report|lab|reading)\s*\d*[:\-]?\s*/i, '');

  // Remove date phrases (due/on/by ...)
  title = title.replace(/\s+(due|on|by)\s+.+$/i, '');
  
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

  // Remove trailing weight phrases like "- 15% of grade"
  title = title.replace(/\s*-\s*\d+%\s+of\s+grade.*$/i, '');
  title = title.replace(/\s*\d+%\s+of\s+grade.*$/i, '');
  
  // Trim leftover punctuation/whitespace
  title = title.replace(/[\s:,-]+$/g, '');
  
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
  // "15% of grade" style already matched by percent regex
  
  return undefined;
}

/**
 * Extract a due date from the line. If year is not certain, use context year.
 * If time is missing, normalize to 00:00 (midnight); calendar layer will handle default due time.
 */
function extractDueDate(text: string, contextYear?: number): Date | undefined {
  const results = chrono.parse(text);
  if (results.length === 0 || !results[0].start) return undefined;
  const comp: any = results[0].start as any;
  const date: Date = comp.date();

  // If year is not certain but context provides one, set it
  try {
    if (typeof comp.isCertain === 'function' && !comp.isCertain('year') && contextYear) {
      date.setFullYear(contextYear);
    }
  } catch {}

  // If time not certain, normalize to midnight
  try {
    if (typeof comp.isCertain === 'function' && !comp.isCertain('hour')) {
      date.setHours(0, 0, 0, 0);
    }
  } catch {}

  return date;
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
