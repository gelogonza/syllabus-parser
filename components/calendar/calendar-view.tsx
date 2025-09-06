"use client";

import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'ASSIGNMENT' | 'EXAM' | 'QUIZ' | 'PROJECT' | 'READING' | 'EVENT' | 'DEADLINE';
  dueDate: Date;
  weight?: number;
  description?: string;
  confidence: number;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  view: 'month' | 'week';
  onViewChange: (view: 'month' | 'week') => void;
  onEventClick?: (event: CalendarEvent) => void;
}

const typeColors = {
  ASSIGNMENT: 'bg-blue-100 text-blue-800 border-blue-200',
  EXAM: 'bg-red-100 text-red-800 border-red-200',
  QUIZ: 'bg-orange-100 text-orange-800 border-orange-200',
  PROJECT: 'bg-purple-100 text-purple-800 border-purple-200',
  READING: 'bg-green-100 text-green-800 border-green-200',
  EVENT: 'bg-gray-100 text-gray-800 border-gray-200',
  DEADLINE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

export function CalendarView({ events, view, onViewChange, onEventClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { calendarDays, monthYear } = useMemo(() => {
    if (view === 'month') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const startDate = startOfWeek(monthStart);
      const endDate = endOfWeek(monthEnd);

      const days = [];
      let day = startDate;
      while (day <= endDate) {
        days.push(day);
        day = addDays(day, 1);
      }

      return {
        calendarDays: days,
        monthYear: format(currentDate, 'MMMM yyyy')
      };
    } else {
      // Week view
      const weekStart = startOfWeek(currentDate);
      const days = [];
      for (let i = 0; i < 7; i++) {
        days.push(addDays(weekStart, i));
      }

      return {
        calendarDays: days,
        monthYear: format(currentDate, 'MMMM yyyy')
      };
    }
  }, [currentDate, view]);

  const getEventsForDay = (day: Date) => {
    return events.filter(event => 
      isSameDay(startOfDay(event.dueDate), startOfDay(day))
    );
  };

  const navigatePrevious = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, -7));
    }
  };

  const navigateNext = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 7));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="bg-bg border border-border rounded-lg overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-heading text-fg">{monthYear}</h2>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={navigatePrevious}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="h-8 px-3 text-xs"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={navigateNext}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={view === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewChange('month')}
          >
            Month
          </Button>
          <Button
            variant={view === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewChange('week')}
          >
            Week
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {view === 'month' ? (
          <MonthView 
            calendarDays={calendarDays}
            currentDate={currentDate}
            getEventsForDay={getEventsForDay}
            onEventClick={onEventClick}
          />
        ) : (
          <WeekView 
            calendarDays={calendarDays}
            getEventsForDay={getEventsForDay}
            onEventClick={onEventClick}
          />
        )}
      </div>
    </div>
  );
}

function MonthView({ 
  calendarDays, 
  currentDate, 
  getEventsForDay, 
  onEventClick 
}: {
  calendarDays: Date[];
  currentDate: Date;
  getEventsForDay: (day: Date) => CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}) {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
      {/* Week day headers */}
      {weekDays.map(day => (
        <div key={day} className="bg-muted p-3 text-center text-sm font-medium text-fg/70">
          {day}
        </div>
      ))}

      {/* Calendar days */}
      {calendarDays.map((day, idx) => {
        const dayEvents = getEventsForDay(day);
        const isCurrentMonth = isSameMonth(day, currentDate);
        const isToday = isSameDay(day, new Date());

        return (
          <div
            key={idx}
            className={cn(
              "bg-bg min-h-[120px] p-2 border-border",
              !isCurrentMonth && "bg-muted/30 text-fg/40"
            )}
          >
            <div className={cn(
              "text-sm font-medium mb-2",
              isToday && "bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
            )}>
              {format(day, 'd')}
            </div>

            <div className="space-y-1">
              {dayEvents.slice(0, 3).map(event => (
                <EventItem 
                  key={event.id} 
                  event={event} 
                  onClick={onEventClick}
                  compact
                />
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-fg/60">
                  +{dayEvents.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WeekView({ 
  calendarDays, 
  getEventsForDay, 
  onEventClick 
}: {
  calendarDays: Date[];
  getEventsForDay: (day: Date) => CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}) {
  return (
    <div className="grid grid-cols-7 gap-4">
      {calendarDays.map(day => {
        const dayEvents = getEventsForDay(day);
        const isToday = isSameDay(day, new Date());

        return (
          <div key={day.toISOString()} className="space-y-3">
            <div className="text-center">
              <div className="text-sm text-fg/60 font-medium">
                {format(day, 'EEE')}
              </div>
              <div className={cn(
                "text-lg font-medium",
                isToday && "bg-accent text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto"
              )}>
                {format(day, 'd')}
              </div>
            </div>

            <div className="space-y-2">
              {dayEvents.map(event => (
                <EventItem 
                  key={event.id} 
                  event={event} 
                  onClick={onEventClick}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EventItem({ 
  event, 
  onClick, 
  compact = false 
}: { 
  event: CalendarEvent; 
  onClick?: (event: CalendarEvent) => void;
  compact?: boolean;
}) {
  return (
    <button
      onClick={() => onClick?.(event)}
      className={cn(
        "w-full text-left p-2 rounded border text-xs transition-colors hover:opacity-80",
        typeColors[event.type],
        compact && "p-1"
      )}
    >
      <div className="font-medium truncate">{event.title}</div>
      {!compact && (
        <>
          <div className="text-xs opacity-75">
            {format(event.dueDate, 'h:mm a')}
          </div>
          {event.weight && (
            <div className="text-xs opacity-75">
              {event.weight}%
            </div>
          )}
        </>
      )}
    </button>
  );
}
