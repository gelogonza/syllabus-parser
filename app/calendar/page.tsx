"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { CalendarView } from "@/components/calendar/calendar-view";
import { EventPopover } from "@/components/calendar/event-popover";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Upload, Calendar } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  type: 'ASSIGNMENT' | 'EXAM' | 'QUIZ' | 'PROJECT' | 'READING' | 'EVENT' | 'DEADLINE';
  dueDate: Date;
  weight?: number;
  description?: string;
  confidence: number;
  sourceLine?: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'month' | 'week'>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  
  const searchParams = useSearchParams();
  const syllabusId = searchParams.get('syllabus');

  useEffect(() => {
    fetchEvents();
  }, [syllabusId]);

  const fetchEvents = async () => {
    try {
      if (syllabusId) {
        // Fetch specific syllabus
        const response = await fetch(`/api/syllabi/${syllabusId}`);
        if (response.ok) {
          const syllabus = await response.json();
          const calendarEvents = syllabus.items
            .filter((item: any) => item.dueDate)
            .map((item: any) => ({
              id: item.id,
              title: item.title,
              type: item.type,
              dueDate: new Date(item.dueDate),
              weight: item.weight,
              description: item.description,
              confidence: item.confidence,
              sourceLine: item.sourceLine,
            }));
          setEvents(calendarEvents);
        }
      } else {
        // Try to get recent syllabus from localStorage
        const recentId = localStorage.getItem('recentSyllabusId');
        if (recentId) {
          const response = await fetch(`/api/syllabi/${recentId}`);
          if (response.ok) {
            const syllabus = await response.json();
            const calendarEvents = syllabus.items
              .filter((item: any) => item.dueDate)
              .map((item: any) => ({
                id: item.id,
                title: item.title,
                type: item.type,
                dueDate: new Date(item.dueDate),
                weight: item.weight,
                description: item.description,
                confidence: item.confidence,
                sourceLine: item.sourceLine,
              }));
            setEvents(calendarEvents);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsPopoverOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    // Navigate to review page with this item focused
    window.location.href = `/review/${syllabusId || localStorage.getItem('recentSyllabusId')}?focus=${event.id}`;
  };

  if (loading) {
    return (
      <PageShell>
        <PageHeader
          title="Calendar View"
          description="View your tasks and deadlines in a calendar format."
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Calendar' }
          ]}
        />
        <div className="text-center py-12">
          <p className="text-fg/60">Loading calendar...</p>
        </div>
      </PageShell>
    );
  }

  if (events.length === 0) {
    return (
      <PageShell>
        <PageHeader
          title="Calendar View"
          description="View your tasks and deadlines in a calendar format."
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Calendar' }
          ]}
        />
        
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-fg/40" />
              </div>
              <h3 className="text-lg font-heading text-fg mb-2">No tasks to display</h3>
              <p className="text-fg/60">
                Upload a syllabus to see your assignments and deadlines in calendar view.
              </p>
            </div>
            
            <Link href="/upload">
              <Button size="lg">
                <Upload className="mr-2 h-4 w-4" />
                Upload Syllabus
              </Button>
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Calendar View"
        description={`${events.length} tasks and deadlines from your syllabus.`}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Calendar' }
        ]}
      />
      
      <div className="space-y-6">
        <CalendarView
          events={events}
          view={view}
          onViewChange={setView}
          onEventClick={handleEventClick}
        />

        {/* Legend */}
        <div className="bg-muted rounded-lg p-4">
          <h3 className="font-heading text-fg mb-3">Legend</h3>
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
              <span className="text-fg/70">Assignments</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
              <span className="text-fg/70">Exams</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></div>
              <span className="text-fg/70">Quizzes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-100 border border-purple-200 rounded"></div>
              <span className="text-fg/70">Projects</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
              <span className="text-fg/70">Readings</span>
            </div>
          </div>
        </div>
      </div>

      <EventPopover
        event={selectedEvent}
        isOpen={isPopoverOpen}
        onClose={() => setIsPopoverOpen(false)}
        onEdit={handleEditEvent}
      />
    </PageShell>
  );
}
