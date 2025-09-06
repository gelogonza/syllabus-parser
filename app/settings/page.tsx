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
                <optgroup label="North America">
                  <option value="America/New_York">Eastern Time (New York)</option>
                  <option value="America/Chicago">Central Time (Chicago)</option>
                  <option value="America/Denver">Mountain Time (Denver)</option>
                  <option value="America/Los_Angeles">Pacific Time (Los Angeles)</option>
                  <option value="America/Anchorage">Alaska Time (Anchorage)</option>
                  <option value="Pacific/Honolulu">Hawaii Time (Honolulu)</option>
                  <option value="America/Toronto">Eastern Time (Toronto)</option>
                  <option value="America/Vancouver">Pacific Time (Vancouver)</option>
                </optgroup>
                <optgroup label="Europe">
                  <option value="Europe/London">GMT (London)</option>
                  <option value="Europe/Paris">CET (Paris)</option>
                  <option value="Europe/Berlin">CET (Berlin)</option>
                  <option value="Europe/Rome">CET (Rome)</option>
                  <option value="Europe/Madrid">CET (Madrid)</option>
                  <option value="Europe/Amsterdam">CET (Amsterdam)</option>
                  <option value="Europe/Stockholm">CET (Stockholm)</option>
                  <option value="Europe/Moscow">MSK (Moscow)</option>
                </optgroup>
                <optgroup label="Asia">
                  <option value="Asia/Tokyo">JST (Tokyo)</option>
                  <option value="Asia/Shanghai">CST (Shanghai)</option>
                  <option value="Asia/Hong_Kong">HKT (Hong Kong)</option>
                  <option value="Asia/Singapore">SGT (Singapore)</option>
                  <option value="Asia/Seoul">KST (Seoul)</option>
                  <option value="Asia/Mumbai">IST (Mumbai)</option>
                  <option value="Asia/Dubai">GST (Dubai)</option>
                </optgroup>
                <optgroup label="Australia & Pacific">
                  <option value="Australia/Sydney">AEDT (Sydney)</option>
                  <option value="Australia/Melbourne">AEDT (Melbourne)</option>
                  <option value="Australia/Perth">AWST (Perth)</option>
                  <option value="Pacific/Auckland">NZDT (Auckland)</option>
                </optgroup>
                <optgroup label="Other">
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                </optgroup>
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
