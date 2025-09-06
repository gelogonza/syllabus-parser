"use client";

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatDateTimeLocal } from '@/lib/utils';

interface DateCellProps {
  value: string | null;
  onSave: (value: string | null) => void;
}

export function DateCell({ value, onSave }: DateCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const handleEdit = () => {
    if (value) {
      const date = new Date(value);
      setEditValue(formatDateTimeLocal(date));
    } else {
      setEditValue('');
    }
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editValue) {
      onSave(new Date(editValue).toISOString());
    } else {
      onSave(null);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <Input
          type="datetime-local"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 text-sm w-48"
          autoFocus
        />
        <div className="flex space-x-1">
          <Button
            size="sm"
            onClick={handleSave}
            className="h-6 px-2 text-xs"
          >
            Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            className="h-6 px-2 text-xs"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  const displayValue = value ? format(parseISO(value), 'MMM d, yyyy h:mm a') : '';
  const isPastDue = value ? new Date(value) < new Date() : false;

  return (
    <div
      onClick={handleEdit}
      className={cn(
        'min-h-[32px] px-2 py-1 rounded cursor-pointer hover:bg-muted/50 transition-colors flex items-center space-x-2',
        !value && 'text-fg/40',
        isPastDue && 'text-red-600'
      )}
      title="Click to edit date"
    >
      <Calendar className="h-3 w-3 flex-shrink-0" />
      <span className="text-sm">
        {displayValue || 'No due date'}
      </span>
    </div>
  );
}
