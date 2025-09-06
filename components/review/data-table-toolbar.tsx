"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Items' },
  { value: 'ASSIGNMENT', label: 'Assignments' },
  { value: 'EXAM', label: 'Exams' },
  { value: 'QUIZ', label: 'Quizzes' },
  { value: 'PROJECT', label: 'Projects' },
  { value: 'READING', label: 'Readings' },
  { value: 'EVENT', label: 'Events' },
  { value: 'DEADLINE', label: 'Deadlines' },
];

interface DataTableToolbarProps {
  selectedCount: number;
  totalCount: number;
  onBulkDelete: () => void;
  filterType: string;
  onFilterTypeChange: (value: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSelectAll: (selected: boolean) => void;
  isDeletePending: boolean;
}

export function DataTableToolbar({
  selectedCount,
  totalCount,
  onBulkDelete,
  filterType,
  onFilterTypeChange,
  searchQuery,
  onSearchChange,
  onSelectAll,
  isDeletePending,
}: DataTableToolbarProps) {
  return (
    <div className="flex items-center justify-between space-x-4 p-4 bg-muted rounded-lg">
      <div className="flex items-center space-x-4">
        {/* Selection info */}
        <div className="text-sm text-fg/70">
          {selectedCount > 0 ? (
            <span>
              {selectedCount} of {totalCount} selected
            </span>
          ) : (
            <span>{totalCount} items</span>
          )}
        </div>

        {/* Bulk actions */}
        {selectedCount > 0 && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkDelete}
              disabled={isDeletePending}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectAll(false)}
            >
              Clear Selection
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-fg/40" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 w-64"
          />
        </div>

        {/* Filter */}
        <div className="relative">
          <select
            value={filterType}
            onChange={(e) => onFilterTypeChange(e.target.value)}
            className={cn(
              'h-9 px-3 pr-8 text-sm border border-border rounded-lg bg-bg text-fg',
              'focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent',
              'appearance-none cursor-pointer'
            )}
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-fg/40 pointer-events-none" />
        </div>

        {/* Quick actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectAll(true)}
            disabled={totalCount === 0}
          >
            Select All
          </Button>
        </div>
      </div>
    </div>
  );
}
