"use client";

import { cn } from '@/lib/utils';

interface ConfidenceBadgeProps {
  confidence: number;
}

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const percentage = Math.round(confidence * 100);
  
  let color = 'bg-green-100 text-green-800';
  let label = 'High';
  
  if (confidence < 0.5) {
    color = 'bg-red-100 text-red-800';
    label = 'Low';
  } else if (confidence < 0.8) {
    color = 'bg-yellow-100 text-yellow-800';
    label = 'Medium';
  }

  return (
    <div className="flex items-center space-x-2">
      <span
        className={cn(
          'inline-block px-2 py-1 rounded-full text-xs font-medium',
          color
        )}
        title={`Confidence: ${percentage}%`}
      >
        {label}
      </span>
      <span className="text-xs text-fg/50">
        {percentage}%
      </span>
    </div>
  );
}
