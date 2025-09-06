import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateICS, syllabusItemsToICSEvents } from '@/lib/utils/ics';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const syllabus = await prisma.syllabus.findUnique({
      where: { id },
      include: {
        items: {
          where: {
            dueDate: {
              not: null
            }
          },
          orderBy: [
            { dueDate: 'asc' },
            { createdAt: 'asc' }
          ]
        },
      },
    });

    if (!syllabus) {
      return NextResponse.json(
        { error: 'Syllabus not found' },
        { status: 404 }
      );
    }

    // Convert syllabus items to ICS events
    const events = syllabusItemsToICSEvents(syllabus.items);
    
    // Generate ICS content
    const calendarName = `${syllabus.courseName || 'Course'} - ${syllabus.title}`;
    const icsContent = generateICS(events, calendarName);
    
    // Create filename
    const filename = `${syllabus.courseName || 'syllabus'}.ics`
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '_');

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('ICS export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
