import { google } from 'googleapis';
import { getServerSession } from 'next-auth';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDateTime: Date;
  endDateTime: Date;
  location?: string;
}

export class GoogleCalendarService {
  private calendar;

  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    this.calendar = google.calendar({ version: 'v3', auth });
  }

  /**
   * Create a calendar event
   */
  async createEvent(event: CalendarEvent): Promise<string> {
    try {
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: event.title,
          description: event.description,
          start: {
            dateTime: event.startDateTime.toISOString(),
            timeZone: 'America/New_York', // TODO: Make this configurable
          },
          end: {
            dateTime: event.endDateTime.toISOString(),
            timeZone: 'America/New_York',
          },
          location: event.location,
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 }, // 24 hours before
              { method: 'popup', minutes: 60 }, // 1 hour before
            ],
          },
        },
      });

      return response.data.id!;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw new Error('Failed to create calendar event');
    }
  }

  /**
   * Update a calendar event
   */
  async updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<void> {
    try {
      await this.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        requestBody: {
          summary: event.title,
          description: event.description,
          start: event.startDateTime ? {
            dateTime: event.startDateTime.toISOString(),
            timeZone: 'America/New_York',
          } : undefined,
          end: event.endDateTime ? {
            dateTime: event.endDateTime.toISOString(),
            timeZone: 'America/New_York',
          } : undefined,
          location: event.location,
        },
      });
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw new Error('Failed to update calendar event');
    }
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(eventId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw new Error('Failed to delete calendar event');
    }
  }

  /**
   * List calendar events in a date range
   */
  async listEvents(startDate: Date, endDate: Date): Promise<any[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Error listing calendar events:', error);
      throw new Error('Failed to list calendar events');
    }
  }

  /**
   * Check if we have calendar access
   */
  async checkAccess(): Promise<boolean> {
    try {
      await this.calendar.calendarList.list();
      return true;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Convert syllabus item to calendar event
 */
export function syllabusItemToCalendarEvent(item: any): CalendarEvent {
  const dueDate = new Date(item.dueDate);
  
  // If no specific time is set, default to 11:59 PM
  if (dueDate.getHours() === 0 && dueDate.getMinutes() === 0) {
    dueDate.setHours(23, 59, 0, 0);
  }

  // Create a 1-hour event ending at the due time
  const startDateTime = new Date(dueDate.getTime() - 60 * 60 * 1000);
  const endDateTime = dueDate;

  return {
    id: item.id,
    title: `${item.title} (${item.type})`,
    description: [
      item.description && `Description: ${item.description}`,
      item.weight && `Weight: ${item.weight}%`,
      item.sourceLine && `From syllabus: "${item.sourceLine}"`,
      `Confidence: ${Math.round(item.confidence * 100)}%`,
    ].filter(Boolean).join('\n'),
    startDateTime,
    endDateTime,
  };
}
