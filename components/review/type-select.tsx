"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

const ITEM_TYPES = [
  { value: 'ASSIGNMENT', label: 'Assignment', color: 'bg-blue-100 text-blue-800' },
  { value: 'EXAM', label: 'Exam', color: 'bg-red-100 text-red-800' },
  { value: 'QUIZ', label: 'Quiz', color: 'bg-orange-100 text-orange-800' },
  { value: 'PROJECT', label: 'Project', color: 'bg-purple-100 text-purple-800' },
  { value: 'READING', label: 'Reading', color: 'bg-green-100 text-green-800' },
  { value: 'EVENT', label: 'Event', color: 'bg-gray-100 text-gray-800' },
  { value: 'DEADLINE', label: 'Deadline', color: 'bg-yellow-100 text-yellow-800' },
];

interface TypeSelectProps {
  value: string;
  onSave: (value: string) => void;
}

export function TypeSelect({ value, onSave }: TypeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentType = ITEM_TYPES.find(type => type.value === value);

  const handleSelect = (newValue: string) => {
    if (newValue !== value) {
      onSave(newValue);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'h-8 px-2 text-xs font-medium rounded-full justify-between min-w-[80px]',
          currentType?.color || 'bg-gray-100 text-gray-800'
        )}
      >
        {currentType?.label || 'Unknown'}
        <ChevronDown className="h-3 w-3 ml-1" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 z-20 bg-bg border border-border rounded-lg shadow-lg py-1 min-w-[120px]">
            {ITEM_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => handleSelect(type.value)}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors',
                  value === type.value && 'bg-muted'
                )}
              >
                <span
                  className={cn(
                    'inline-block px-2 py-1 rounded-full text-xs font-medium',
                    type.color
                  )}
                >
                  {type.label}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
