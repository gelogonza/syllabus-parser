import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Upload, Calendar } from "lucide-react";

export default function CalendarPage() {
  return (
    <PageShell>
      <PageHeader
        title="Calendar View"
        description="View your tasks and deadlines in a calendar format."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Calendar' }
        ]}
      />
      
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-fg/40" />
            </div>
            <h3 className="text-lg font-heading text-fg mb-2">No tasks to display</h3>
            <p className="text-fg/60">
              Upload a syllabus to see your assignments and deadlines in calendar view.
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
    </PageShell>
  );
}
