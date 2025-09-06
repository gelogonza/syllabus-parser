import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { Upload, FileText, Calendar, Download } from "lucide-react";

export default function Home() {
  return (
    <PageShell>
      <PageHeader
        title="Syllabus Importer"
        description="Transform your syllabus into actionable tasks and calendar events with AI-powered parsing and smart scheduling."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left side - Introduction */}
        <div className="space-y-6">
          <div className="prose prose-gray max-w-none">
            <h2 className="text-lg font-heading text-fg mb-4">How it works</h2>
            <ol className="space-y-3 text-fg/80">
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-sm font-medium">1</span>
                <span>Upload your syllabus (PDF, DOCX, or TXT)</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-sm font-medium">2</span>
                <span>AI extracts assignments, exams, and deadlines</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-sm font-medium">3</span>
                <span>Review and edit the extracted tasks</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-sm font-medium">4</span>
                <span>Export to calendar or download as ICS file</span>
              </li>
            </ol>
          </div>

          <div className="bg-muted rounded-lg p-6">
            <h3 className="font-heading text-fg mb-3">Supported formats</h3>
            <ul className="text-sm text-fg/70 space-y-1">
              <li>• PDF documents</li>
              <li>• Microsoft Word (.docx)</li>
              <li>• Plain text (.txt)</li>
              <li>• Files up to 10MB</li>
            </ul>
          </div>
        </div>

        {/* Right side - Quick actions */}
        <div className="space-y-4">
          <div className="bg-bg border border-border rounded-lg p-6">
            <h3 className="font-heading text-fg mb-4">Quick Start</h3>
            
            <div className="space-y-3">
              <Link href="/upload" className="block">
                <Button className="w-full justify-start h-12" size="lg">
                  <Upload className="mr-3 h-4 w-4" />
                  Upload Syllabus
                </Button>
              </Link>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Link href="/review">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Review
                  </Button>
                </Link>
                
                <Link href="/calendar">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Calendar
                  </Button>
                </Link>
                
                <Link href="/export">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-6">
            <h3 className="font-heading text-fg mb-3">Features</h3>
            <ul className="text-sm text-fg/70 space-y-2">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                <span>AI-powered text extraction</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                <span>Smart date recognition</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                <span>Confidence scoring</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                <span>Google Calendar sync</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                <span>ICS file export</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                <span>Keyboard shortcuts</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-sm text-fg/50">
          Press <kbd className="px-2 py-1 text-xs bg-muted border border-border rounded">Cmd/Ctrl + K</kbd> for quick actions
        </p>
      </div>
    </PageShell>
  );
}