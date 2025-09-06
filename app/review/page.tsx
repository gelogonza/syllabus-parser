import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Upload } from "lucide-react";

export default function ReviewIndexPage() {
  return (
    <PageShell>
      <PageHeader
        title="Review Syllabi"
        description="Review and edit your uploaded syllabi and extracted tasks."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Review' }
        ]}
      />
      
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-fg/40" />
            </div>
            <h3 className="text-lg font-heading text-fg mb-2">No syllabi uploaded yet</h3>
            <p className="text-fg/60">
              Upload your first syllabus to get started with task extraction and review.
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
