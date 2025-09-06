"use client";

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, AlertCircle, Clock, ExternalLink } from 'lucide-react';

interface GoogleCalendarSyncProps {
  syllabusId: string;
  onSyncComplete?: () => void;
}

interface SyncItem {
  id: string;
  title: string;
  type: string;
  dueDate: string;
  weight?: number;
  confidence: number;
}

interface SyncStatus {
  hasGoogleCalendar: boolean;
  syllabus: {
    id: string;
    title: string;
    courseName: string;
  };
  items: SyncItem[];
}

export function GoogleCalendarSync({ syllabusId, onSyncComplete }: GoogleCalendarSyncProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDryRun, setIsDryRun] = useState(true);
  const [syncResults, setSyncResults] = useState<any>(null);

  useEffect(() => {
    if (isOpen && syllabusId) {
      fetchSyncStatus();
    }
  }, [isOpen, syllabusId]);

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch(`/api/google/sync/${syllabusId}`);
      if (response.ok) {
        const data = await response.json();
        setSyncStatus(data);
        setSelectedItems(data.items.map((item: SyncItem) => item.id));
      }
    } catch (error) {
      console.error('Error fetching sync status:', error);
    }
  };

  const handleSync = async (dryRun = true) => {
    if (!syncStatus) return;

    setIsLoading(true);
    setIsDryRun(dryRun);

    try {
      const response = await fetch(`/api/google/sync/${syllabusId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dryRun,
          selectedItemIds: selectedItems,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSyncResults(result);
        if (!dryRun) {
          onSyncComplete?.();
        }
      } else {
        alert(result.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('Sync failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleAllItems = () => {
    if (!syncStatus) return;
    
    if (selectedItems.length === syncStatus.items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(syncStatus.items.map(item => item.id));
    }
  };

  if (!session) {
    return (
      <div className="text-center p-6">
        <Calendar className="h-12 w-12 text-fg/40 mx-auto mb-4" />
        <h3 className="font-heading text-fg mb-2">Sign in Required</h3>
        <p className="text-fg/60 mb-4">
          Sign in with Google to sync your tasks to Google Calendar
        </p>
        <Button onClick={() => signIn('google')}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Sign in with Google
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="w-full"
      >
        <Calendar className="mr-2 h-4 w-4" />
        Sync to Google Calendar
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Google Calendar Sync
            </DialogTitle>
          </DialogHeader>

          {!syncStatus ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-fg/60">Loading sync status...</p>
            </div>
          ) : !syncStatus.hasGoogleCalendar ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="font-heading text-fg mb-2">Google Calendar Not Connected</h3>
              <p className="text-fg/60 mb-4">
                You need to connect your Google account with Calendar permissions
              </p>
              <Button onClick={() => signIn('google')}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Connect Google Calendar
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Course Info */}
              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-heading text-fg">{syncStatus.syllabus.courseName}</h3>
                <p className="text-sm text-fg/60">{syncStatus.syllabus.title}</p>
              </div>

              {/* Item Selection */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-fg">
                    Select items to sync ({selectedItems.length}/{syncStatus.items.length})
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAllItems}
                  >
                    {selectedItems.length === syncStatus.items.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {syncStatus.items.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedItems.includes(item.id)
                          ? 'border-accent bg-accent/5'
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => toggleItemSelection(item.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        className="form-checkbox"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-fg truncate">{item.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-fg/60">
                          <span>{new Date(item.dueDate).toLocaleDateString()}</span>
                          {item.weight && <span>{item.weight}%</span>}
                          <span>
                            {item.confidence >= 0.8 ? '🟢' : item.confidence >= 0.5 ? '🟡' : '🔴'} 
                            {Math.round(item.confidence * 100)}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sync Results */}
              {syncResults && (
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    {syncResults.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                    )}
                    <h4 className="font-medium text-fg">
                      {isDryRun ? 'Preview Results' : 'Sync Results'}
                    </h4>
                  </div>
                  <p className="text-sm text-fg/70 mb-3">{syncResults.message}</p>
                  
                  {syncResults.results.errors.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-red-600">Errors:</p>
                      {syncResults.results.errors.map((error: string, index: number) => (
                        <p key={index} className="text-xs text-red-600">• {error}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Close
                </Button>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleSync(true)}
                    disabled={isLoading || selectedItems.length === 0}
                  >
                    {isLoading && isDryRun ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Previewing...
                      </>
                    ) : (
                      'Preview Sync'
                    )}
                  </Button>
                  <Button
                    onClick={() => handleSync(false)}
                    disabled={isLoading || selectedItems.length === 0}
                  >
                    {isLoading && !isDryRun ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      'Sync to Calendar'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
