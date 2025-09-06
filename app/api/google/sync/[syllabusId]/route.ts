import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { GoogleCalendarService, syllabusItemToCalendarEvent } from '@/lib/services/google-calendar';
import { getLimiter } from '@/lib/rate-limit';

export async function POST(
  request: NextRequest,
  { params }: { params: { syllabusId: string } }
) {
  try {
    const limiter = getLimiter();
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rate = await limiter.limit(`gcal:${ip}`);
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user and check if they have Google Calendar access
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        accounts: {
          where: { provider: 'google' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const googleAccount = user.accounts.find(account => account.provider === 'google');
    if (!googleAccount?.access_token) {
      return NextResponse.json({ 
        error: 'Google Calendar not connected. Please sign in with Google first.' 
      }, { status: 400 });
    }

    // Get syllabus with items
    const syllabus = await prisma.syllabus.findUnique({
      where: { 
        id: params.syllabusId,
        userId: user.id 
      },
      include: {
        items: {
          where: {
            dueDate: {
              not: null
            }
          }
        }
      }
    });

    if (!syllabus) {
      return NextResponse.json({ error: 'Syllabus not found' }, { status: 404 });
    }

    // Initialize Google Calendar service
    const calendarService = new GoogleCalendarService(googleAccount.access_token);

    // Check if we have calendar access
    const hasAccess = await calendarService.checkAccess();
    if (!hasAccess) {
      return NextResponse.json({ 
        error: 'Google Calendar access denied or token expired. Please reconnect your Google account.' 
      }, { status: 400 });
    }

    // Parse request body for options
    const body = await request.json().catch(() => ({}));
    const { dryRun = false, selectedItemIds } = body;

    // Filter items if specific ones were selected
    let itemsToSync = syllabus.items;
    if (selectedItemIds && Array.isArray(selectedItemIds)) {
      itemsToSync = syllabus.items.filter(item => selectedItemIds.includes(item.id));
    }

    const results = {
      total: itemsToSync.length,
      created: 0,
      errors: [] as string[],
      events: [] as any[]
    };

    // Convert and create calendar events
    for (const item of itemsToSync) {
      try {
        const calendarEvent = syllabusItemToCalendarEvent(item);
        
        if (dryRun) {
          // For dry run, just return what would be created
          results.events.push({
            id: item.id,
            title: calendarEvent.title,
            startDateTime: calendarEvent.startDateTime,
            endDateTime: calendarEvent.endDateTime,
            description: calendarEvent.description
          });
          results.created++;
        } else {
          // Actually create the event
          const googleEventId = await calendarService.createEvent(calendarEvent);
          
          // Store the Google event ID for future updates/deletions
          await prisma.syllabusItem.update({
            where: { id: item.id },
            data: {
              // We'll add a googleEventId field later if needed
              description: item.description ? 
                `${item.description}\n[Google Event ID: ${googleEventId}]` : 
                `[Google Event ID: ${googleEventId}]`
            }
          });

          results.events.push({
            id: item.id,
            googleEventId,
            title: calendarEvent.title,
            startDateTime: calendarEvent.startDateTime,
            endDateTime: calendarEvent.endDateTime
          });
          results.created++;
        }
      } catch (error) {
        console.error(`Error syncing item ${item.id}:`, error);
        results.errors.push(`Failed to sync "${item.title}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Log the sync operation
    await prisma.auditLog.create({
      data: {
        action: dryRun ? 'GOOGLE_CALENDAR_DRY_RUN' : 'GOOGLE_CALENDAR_SYNC',
        entity: 'SYLLABUS',
        entityId: syllabus.id,
        changes: {
          itemCount: results.total,
          createdCount: results.created,
          errorCount: results.errors.length,
          dryRun
        },
        userId: user.id,
        syllabusId: syllabus.id
      }
    });

    return NextResponse.json({
      success: true,
      message: dryRun ? 
        `Dry run completed. ${results.created} events would be created.` :
        `Successfully synced ${results.created} events to Google Calendar.`,
      results
    });

  } catch (error) {
    console.error('Google Calendar sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error during sync' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { syllabusId: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        accounts: {
          where: { provider: 'google' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const googleAccount = user.accounts.find(account => account.provider === 'google');
    const hasGoogleCalendar = !!googleAccount?.access_token;

    // Get syllabus with items for preview
    const syllabus = await prisma.syllabus.findUnique({
      where: { 
        id: params.syllabusId,
        userId: user.id 
      },
      include: {
        items: {
          where: {
            dueDate: {
              not: null
            }
          }
        }
      }
    });

    if (!syllabus) {
      return NextResponse.json({ error: 'Syllabus not found' }, { status: 404 });
    }

    return NextResponse.json({
      hasGoogleCalendar,
      syllabus: {
        id: syllabus.id,
        title: syllabus.title,
        courseName: syllabus.courseName
      },
      items: syllabus.items.map(item => ({
        id: item.id,
        title: item.title,
        type: item.type,
        dueDate: item.dueDate,
        weight: item.weight,
        confidence: item.confidence
      }))
    });

  } catch (error) {
    console.error('Error getting sync status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
