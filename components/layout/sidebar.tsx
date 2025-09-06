"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Upload, 
  FileText, 
  Calendar, 
  Download, 
  Settings,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  {
    name: 'Home',
    href: '/',
    icon: Home,
  },
  {
    name: 'Upload',
    href: '/upload',
    icon: Upload,
  },
  {
    name: 'Review',
    href: '/review',
    icon: FileText,
  },
  {
    name: 'Calendar',
    href: '/calendar',
    icon: Calendar,
  },
  {
    name: 'Export',
    href: '/export',
    icon: Download,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-muted border-r border-border">
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-heading text-fg">Syllabus</span>
        </Link>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-bg text-fg shadow-sm'
                  : 'text-fg/60 hover:bg-bg hover:text-fg'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-4 w-4 flex-shrink-0',
                  isActive ? 'text-fg' : 'text-fg/60 group-hover:text-fg'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
