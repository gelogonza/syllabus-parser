import { formatDate } from 'date-fns';

export interface ICSEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  url?: string;
}

/**
 * Generate ICS (iCalendar) content from events
 */
export function generateICS(events: ICSEvent[], calendarName: string = 'Syllabus Calendar'): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Syllabus Importer//EN',
    `X-WR-CALNAME:${calendarName}`,
    'X-WR-TIMEZONE:UTC',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  events.forEach(event => {
    const startDate = formatDateForICS(event.startDate);
    const endDate = event.endDate ? formatDateForICS(event.endDate) : formatDateForICS(new Date(event.startDate.getTime() + 60 * 60 * 1000)); // Default 1 hour duration
    
    ics.push(
      'BEGIN:VEVENT',
      `UID:${event.id}@syllabus-importer.com`,
      `DTSTAMP:${timestamp}`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${escapeICSText(event.title)}`,
      ...(event.description ? [`DESCRIPTION:${escapeICSText(event.description)}`] : []),
      ...(event.location ? [`LOCATION:${escapeICSText(event.location)}`] : []),
      ...(event.url ? [`URL:${event.url}`] : []),
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT'
    );
  });

  ics.push('END:VCALENDAR');
  
  return ics.join('\r\n');
}

/**
 * Format date for ICS format (YYYYMMDDTHHMMSSZ)
 */
function formatDateForICS(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Escape text for ICS format
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

/**
 * Convert syllabus items to ICS events
 */
export function syllabusItemsToICSEvents(items: any[]): ICSEvent[] {
  return items
    .filter(item => item.dueDate) // Only items with due dates
    .map(item => ({
      id: item.id,
      title: item.title,
      description: [
        item.description,
        item.weight ? `Weight: ${item.weight}%` : null,
        `Type: ${item.type.toLowerCase()}`,
        `Source: ${item.sourceLine}`
      ].filter(Boolean).join('\n'),
      startDate: new Date(item.dueDate),
      // For assignments/deadlines, make them all-day events ending at due time
      // For exams, make them 2-hour events
      endDate: item.type === 'EXAM' || item.type === 'QUIZ' 
        ? new Date(new Date(item.dueDate).getTime() + 2 * 60 * 60 * 1000)
        : new Date(item.dueDate),
    }));
}
