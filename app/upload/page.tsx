import { UploadCard } from "@/components/upload/upload-card";
import { PageShell, PageHeader } from "@/components/layout/page-shell";

export default function UploadPage() {
  return (
    <PageShell>
      <PageHeader
        title="Upload Syllabus"
        description="Upload your syllabus file and let AI extract assignments, exams, and deadlines."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Upload' }
        ]}
      />
      
      <div className="max-w-2xl mx-auto">
        <UploadCard />
      </div>
    </PageShell>
  );
}
