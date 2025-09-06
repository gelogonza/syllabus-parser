"use client";

import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Percent, FileText, Edit } from 'lucide-react';

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

interface EventPopoverProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (event: CalendarEvent) => void;
}

const typeLabels = {
  ASSIGNMENT: 'Assignment',
  EXAM: 'Exam',
  QUIZ: 'Quiz',
  PROJECT: 'Project',
  READING: 'Reading',
  EVENT: 'Event',
  DEADLINE: 'Deadline',
};

const typeColors = {
  ASSIGNMENT: 'bg-blue-100 text-blue-800',
  EXAM: 'bg-red-100 text-red-800',
  QUIZ: 'bg-orange-100 text-orange-800',
  PROJECT: 'bg-purple-100 text-purple-800',
  READING: 'bg-green-100 text-green-800',
  EVENT: 'bg-gray-100 text-gray-800',
  DEADLINE: 'bg-yellow-100 text-yellow-800',
};

export function EventPopover({ event, isOpen, onClose, onEdit }: EventPopoverProps) {
  if (!event) return null;

  const confidenceLabel = event.confidence >= 0.8 ? 'High' : event.confidence >= 0.5 ? 'Medium' : 'Low';
  const confidenceColor = event.confidence >= 0.8 ? 'text-green-600' : event.confidence >= 0.5 ? 'text-yellow-600' : 'text-red-600';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-heading text-fg mb-2 pr-2">
                {event.title}
              </DialogTitle>
              <div className="flex items-center space-x-2 mb-4">
                <Badge className={typeColors[event.type]}>
                  {typeLabels[event.type]}
                </Badge>
                <span className={`text-sm font-medium ${confidenceColor}`}>
                  {confidenceLabel} Confidence
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Date and Time */}
          <div className="flex items-center space-x-3">
            <Calendar className="h-4 w-4 text-fg/60 flex-shrink-0" />
            <div>
              <div className="font-medium text-fg">
                {format(event.dueDate, 'EEEE, MMMM d, yyyy')}
              </div>
              <div className="text-sm text-fg/60">
                {format(event.dueDate, 'h:mm a')}
              </div>
            </div>
          </div>

          {/* Weight */}
          {event.weight && (
            <div className="flex items-center space-x-3">
              <Percent className="h-4 w-4 text-fg/60 flex-shrink-0" />
              <div>
                <div className="font-medium text-fg">{event.weight}% of grade</div>
              </div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="flex items-start space-x-3">
              <FileText className="h-4 w-4 text-fg/60 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm text-fg">{event.description}</div>
              </div>
            </div>
          )}

          {/* Source Line */}
          {event.sourceLine && (
            <div className="bg-muted rounded-lg p-3">
              <div className="text-xs text-fg/60 mb-1">Original text:</div>
              <div className="text-sm text-fg/80 italic">"{event.sourceLine}"</div>
            </div>
          )}

          {/* Time until due */}
          <div className="flex items-center space-x-3">
            <Clock className="h-4 w-4 text-fg/60 flex-shrink-0" />
            <div className="text-sm text-fg/60">
              {event.dueDate > new Date() ? (
                <>Due {getRelativeTime(event.dueDate)}</>
              ) : (
                <span className="text-red-600">Overdue</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button onClick={() => onEdit(event)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffDays > 0) {
    return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  } else {
    return 'soon';
  }
}
