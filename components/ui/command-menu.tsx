"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  Upload, 
  FileText, 
  Calendar, 
  Download, 
  Settings,
  Search,
  Clock,
  Filter,
  Home
} from 'lucide-react';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string[];
}

export function CommandMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commands: Command[] = [
    {
      id: 'home',
      label: 'Go to Home',
      description: 'Navigate to the home page',
      icon: Home,
      action: () => {
        router.push('/');
        setIsOpen(false);
      },
      keywords: ['home', 'start', 'main'],
    },
    {
      id: 'upload',
      label: 'Upload Syllabus',
      description: 'Upload a new syllabus file',
      icon: Upload,
      action: () => {
        router.push('/upload');
        setIsOpen(false);
      },
      keywords: ['upload', 'new', 'file', 'add'],
    },
    {
      id: 'review',
      label: 'Review Tasks',
      description: 'Review and edit extracted tasks',
      icon: FileText,
      action: () => {
        router.push('/review');
        setIsOpen(false);
      },
      keywords: ['review', 'edit', 'tasks', 'assignments'],
    },
    {
      id: 'calendar',
      label: 'Calendar View',
      description: 'View tasks in calendar format',
      icon: Calendar,
      action: () => {
        router.push('/calendar');
        setIsOpen(false);
      },
      keywords: ['calendar', 'schedule', 'dates'],
    },
    {
      id: 'export',
      label: 'Export & Sync',
      description: 'Export to calendar or sync with Google',
      icon: Download,
      action: () => {
        router.push('/export');
        setIsOpen(false);
      },
      keywords: ['export', 'download', 'sync', 'google', 'ics'],
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'Configure app preferences',
      icon: Settings,
      action: () => {
        router.push('/settings');
        setIsOpen(false);
      },
      keywords: ['settings', 'preferences', 'config'],
    },
    {
      id: 'bulk-23-59',
      label: 'Set All Due Times to 23:59',
      description: 'Set default due time for all assignments',
      icon: Clock,
      action: () => {
        // This would need to be implemented with API call
        console.log('Bulk set due times to 23:59');
        setIsOpen(false);
      },
      keywords: ['bulk', 'time', '23:59', 'due', 'default'],
    },
    {
      id: 'filter-exams',
      label: 'Filter Exams Only',
      description: 'Show only exam items',
      icon: Filter,
      action: () => {
        router.push('/review?filter=EXAM');
        setIsOpen(false);
      },
      keywords: ['filter', 'exams', 'tests'],
    },
    {
      id: 'filter-assignments',
      label: 'Filter Assignments Only',
      description: 'Show only assignment items',
      icon: Filter,
      action: () => {
        router.push('/review?filter=ASSIGNMENT');
        setIsOpen(false);
      },
      keywords: ['filter', 'assignments', 'homework'],
    },
  ];

  const filteredCommands = commands.filter(command => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    return (
      command.label.toLowerCase().includes(searchLower) ||
      command.description?.toLowerCase().includes(searchLower) ||
      command.keywords?.some(keyword => keyword.includes(searchLower))
    );
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="border-b border-border">
          <div className="flex items-center px-4 py-3">
            <Search className="h-4 w-4 text-fg/40 mr-3" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type a command or search..."
              className="border-0 focus:ring-0 text-base bg-transparent"
              autoFocus
            />
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-fg/60">
              <p>No commands found</p>
              <p className="text-sm mt-1">Try searching for something else</p>
            </div>
          ) : (
            <div className="p-2">
              {filteredCommands.map((command, index) => (
                <button
                  key={command.id}
                  onClick={command.action}
                  className={cn(
                    "w-full flex items-center px-3 py-3 rounded-lg text-left transition-colors",
                    "hover:bg-muted focus:bg-muted focus:outline-none",
                    index === 0 && !search && "bg-muted" // Highlight first item
                  )}
                >
                  <command.icon className="h-4 w-4 text-fg/60 mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-fg">{command.label}</div>
                    {command.description && (
                      <div className="text-sm text-fg/60 truncate">
                        {command.description}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="border-t border-border px-4 py-2 text-xs text-fg/50 bg-muted/50">
          <div className="flex items-center justify-between">
            <span>Press Enter to select</span>
            <span>ESC to close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
