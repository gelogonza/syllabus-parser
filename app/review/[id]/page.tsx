"use client";

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { DataTable } from "@/components/review/data-table";
import { Button } from "@/components/ui/button";
import { Calendar, Download, RefreshCw } from "lucide-react";
import Link from "next/link";

async function fetchSyllabus(id: string) {
  const response = await fetch(`/api/syllabi/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch syllabus');
  }
  return response.json();
}

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const { data: syllabus, isLoading, error, refetch } = useQuery({
    queryKey: ['syllabus', id],
    queryFn: () => fetchSyllabus(id),
    refetchInterval: (data) => {
      // Poll every 2 seconds if still parsing
      return data?.status === 'PARSING' ? 2000 : false;
    },
  });

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-accent mx-auto mb-4" />
            <h3 className="text-lg font-heading text-fg mb-2">Loading syllabus...</h3>
            <p className="text-fg/60">Please wait while we fetch your data.</p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-heading text-fg mb-2">Error loading syllabus</h3>
            <p className="text-fg/60 mb-6">
              There was an error loading your syllabus. Please try again.
            </p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </PageShell>
    );
  }

  if (syllabus?.status === 'PARSING') {
    return (
      <PageShell>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-accent mx-auto mb-4" />
            <h3 className="text-lg font-heading text-fg mb-2">Parsing syllabus...</h3>
            <p className="text-fg/60">
              AI is extracting assignments, exams, and deadlines from your syllabus.
            </p>
            <p className="text-sm text-fg/50 mt-2">This usually takes 10-30 seconds.</p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (syllabus?.status === 'ERROR') {
    return (
      <PageShell>
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-heading text-fg mb-2">Parsing failed</h3>
            <p className="text-fg/60 mb-6">
              There was an error parsing your syllabus. Please try uploading again or contact support.
            </p>
            <div className="space-x-2">
              <Link href="/upload">
                <Button>Upload Again</Button>
              </Link>
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  const lowConfidenceItems = syllabus?.items?.filter((item: any) => item.confidence < 0.8) || [];

  return (
    <PageShell>
      <PageHeader
        title={syllabus?.title || 'Syllabus Review'}
        description={`${syllabus?.courseName || 'Unknown Course'} • ${syllabus?.items?.length || 0} items extracted`}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Review', href: '/review' },
          { label: syllabus?.title || 'Syllabus' }
        ]}
        actions={
          <div className="flex items-center space-x-2">
            <Link href={`/calendar?syllabus=${id}`}>
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                Calendar View
              </Button>
            </Link>
            <Link href={`/export?syllabus=${id}`}>
              <Button size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </Link>
          </div>
        }
      />

      {lowConfidenceItems.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-yellow-800">!</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Review needed</h3>
              <p className="text-sm text-yellow-700 mt-1">
                {lowConfidenceItems.length} item{lowConfidenceItems.length > 1 ? 's' : ''} need{lowConfidenceItems.length === 1 ? 's' : ''} your review. 
                These items have been flagged for low confidence and may need corrections.
              </p>
            </div>
          </div>
        </div>
      )}

      {syllabus?.items && syllabus.items.length > 0 ? (
        <DataTable 
          data={syllabus.items} 
          syllabusId={id}
        />
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-heading text-fg mb-2">No items found</h3>
            <p className="text-fg/60">
              No assignments, exams, or deadlines were extracted from this syllabus.
            </p>
          </div>
        </div>
      )}
    </PageShell>
  );
}
