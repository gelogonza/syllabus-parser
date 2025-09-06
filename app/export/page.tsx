"use client";

import { useState, useEffect } from 'react';
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Upload, Download, Calendar, ExternalLink } from "lucide-react";

interface Syllabus {
  id: string;
  title: string;
  courseName: string;
  items: any[];
}

export default function ExportPage() {
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd fetch user's syllabi
    // For now, let's check localStorage or use a simple fetch
    fetchSyllabi();
  }, []);

  const fetchSyllabi = async () => {
    try {
      // This is a simplified version - in production you'd have proper user management
      // For now, we'll just show any syllabi that exist
      setLoading(false);
    } catch (error) {
      console.error('Error fetching syllabi:', error);
      setLoading(false);
    }
  };

  const handleDownloadICS = async (syllabusId: string, courseName: string) => {
    try {
      const response = await fetch(`/api/syllabi/${syllabusId}/ics`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${courseName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.ics`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <PageShell>
        <PageHeader
          title="Export & Sync"
          description="Export your tasks to calendar formats or sync with Google Calendar."
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Export' }
          ]}
        />
        <div className="text-center py-12">
          <p className="text-fg/60">Loading...</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Export & Sync"
        description="Export your tasks to calendar formats or sync with Google Calendar."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Export' }
        ]}
      />
      
      <div className="space-y-8">
        {/* Quick Export Section */}
        <div className="bg-bg border border-border rounded-lg p-6">
          <h3 className="font-heading text-fg mb-4">Quick Export</h3>
          <p className="text-fg/60 mb-4">
            Export all your syllabi or individual courses to calendar files.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium text-fg">Recent Syllabus</p>
                <p className="text-sm text-fg/60">Latest uploaded syllabus</p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Get the most recent syllabus ID from URL or localStorage
                    const recentId = localStorage.getItem('recentSyllabusId');
                    if (recentId) {
                      handleDownloadICS(recentId, 'recent-syllabus');
                    } else {
                      alert('No recent syllabus found. Please upload one first.');
                    }
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download ICS
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Add to Google Calendar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-bg border border-border rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Download className="h-5 w-5 text-accent mr-2" />
              <h3 className="font-heading text-fg">ICS File Export</h3>
            </div>
            <p className="text-fg/60 mb-4">
              Download calendar files that work with any calendar application.
            </p>
            <ul className="text-sm text-fg/60 space-y-1 mb-4">
              <li>• Compatible with Apple Calendar, Outlook, Thunderbird</li>
              <li>• Includes due dates, descriptions, and weights</li>
              <li>• Automatic reminders for assignments and exams</li>
            </ul>
            <Link href="/review">
              <Button variant="outline" className="w-full">
                View Tasks to Export
              </Button>
            </Link>
          </div>

          <div className="bg-bg border border-border rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 text-accent mr-2" />
              <h3 className="font-heading text-fg">Google Calendar Sync</h3>
            </div>
            <p className="text-fg/60 mb-4">
              Directly sync your tasks with Google Calendar for automatic updates.
            </p>
            <ul className="text-sm text-fg/60 space-y-1 mb-4">
              <li>• Two-way synchronization</li>
              <li>• Automatic updates when you edit tasks</li>
              <li>• Smart conflict resolution</li>
            </ul>
            <Button variant="outline" className="w-full" disabled>
              <ExternalLink className="mr-2 h-4 w-4" />
              Connect Google Calendar
              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Coming Soon
              </span>
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-muted rounded-lg p-6">
          <h3 className="font-heading text-fg mb-3">How to use exported files</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-fg/70">
            <div>
              <h4 className="font-medium text-fg mb-2">Apple Calendar</h4>
              <p>Double-click the .ics file or drag it into Calendar app.</p>
            </div>
            <div>
              <h4 className="font-medium text-fg mb-2">Google Calendar</h4>
              <p>Go to Settings → Import & export → Import, then select your .ics file.</p>
            </div>
            <div>
              <h4 className="font-medium text-fg mb-2">Outlook</h4>
              <p>Go to File → Open & Export → Import/Export, then choose Calendar file.</p>
            </div>
          </div>
        </div>

        {/* No syllabi state */}
        {syllabi.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-fg/40" />
                </div>
                <h3 className="text-lg font-heading text-fg mb-2">No syllabi to export</h3>
                <p className="text-fg/60">
                  Upload and review a syllabus first to export your tasks and deadlines.
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
        )}
      </div>
    </PageShell>
  );
}
