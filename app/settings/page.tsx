import { PageShell, PageHeader } from "@/components/layout/page-shell";

export default function SettingsPage() {
  return (
    <PageShell>
      <PageHeader
        title="Settings"
        description="Configure your preferences and account settings."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Settings' }
        ]}
      />
      
      <div className="max-w-2xl space-y-6">
        <div className="bg-bg border border-border rounded-lg p-6">
          <h3 className="font-heading text-fg mb-4">Parsing Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-fg">Default due time</p>
                <p className="text-sm text-fg/60">Set default time for assignments without specific times</p>
              </div>
              <select className="border border-border rounded-lg px-3 py-2 bg-bg text-fg">
                <option>11:59 PM</option>
                <option>5:00 PM</option>
                <option>9:00 AM</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-fg">Confidence threshold</p>
                <p className="text-sm text-fg/60">Minimum confidence for auto-acceptance</p>
              </div>
              <select className="border border-border rounded-lg px-3 py-2 bg-bg text-fg">
                <option>80%</option>
                <option>70%</option>
                <option>90%</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-bg border border-border rounded-lg p-6">
          <h3 className="font-heading text-fg mb-4">Export Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-fg">Default timezone</p>
                <p className="text-sm text-fg/60">Timezone for exported events</p>
              </div>
              <select className="border border-border rounded-lg px-3 py-2 bg-bg text-fg">
                <option>America/New_York</option>
                <option>America/Los_Angeles</option>
                <option>UTC</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-fg">Include descriptions</p>
                <p className="text-sm text-fg/60">Add task descriptions to calendar events</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded border-border" />
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
