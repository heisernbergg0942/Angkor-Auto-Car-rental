import { Bell, Shield, Globe, CreditCard, Database, Save } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';

const sections = [
  {
    icon: Globe,
    title: 'General Settings',
    fields: [
      { label: 'Company Name', type: 'text', defaultValue: 'FleetStream Rental Systems' },
      { label: 'Support Email', type: 'email', defaultValue: 'support@fleetstream.com' },
      { label: 'Default Currency', type: 'select', options: ['USD ($)', 'EUR (€)', 'GBP (£)'] },
      { label: 'Timezone', type: 'select', options: ['America/Los_Angeles', 'America/New_York', 'Europe/London', 'Asia/Tokyo'] },
    ],
  },
  {
    icon: Bell,
    title: 'Notifications',
    fields: [
      { label: 'Email Alerts', type: 'toggle', defaultChecked: true },
      { label: 'Maintenance Reminders', type: 'toggle', defaultChecked: true },
      { label: 'Overdue Rental Alerts', type: 'toggle', defaultChecked: true },
      { label: 'New Bookings', type: 'toggle', defaultChecked: false },
    ],
  },
  {
    icon: CreditCard,
    title: 'Payment Settings',
    fields: [
      { label: 'Payment Gateway', type: 'select', options: ['Stripe', 'PayPal', 'Square'] },
      { label: 'Late Fee (%)', type: 'number', defaultValue: '15' },
      { label: 'Security Deposit ($)', type: 'number', defaultValue: '500' },
    ],
  },
  {
    icon: Shield,
    title: 'Security',
    fields: [
      { label: 'Two-Factor Authentication', type: 'toggle', defaultChecked: true },
      { label: 'Session Timeout (minutes)', type: 'number', defaultValue: '30' },
      { label: 'IP Whitelist', type: 'text', defaultValue: '' },
    ],
  },
];

export default function SettingsPage() {
  return (
    <AdminLayout>
      <div className="p-6 animate-fadeIn">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">System Settings</h1>
          <p className="text-slate-500 text-sm mt-0.5">Configure your fleet management platform.</p>
        </div>

        <div className="max-w-2xl space-y-6">
          {sections.map(({ icon: Icon, title, fields }) => (
            <div key={title} className="card p-5">
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-forest" />
                </div>
                <h2 className="font-bold text-slate-800">{title}</h2>
              </div>
              <div className="space-y-4">
                {fields.map(field => (
                  <div key={field.label} className="flex items-center justify-between gap-4">
                    <label className="text-sm font-medium text-slate-700 shrink-0">{field.label}</label>
                    {field.type === 'toggle' ? (
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={field.defaultChecked} className="sr-only peer" />
                        <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-forest after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                      </div>
                    ) : field.type === 'select' ? (
                      <select className="input-field text-sm max-w-xs">
                        {field.options.map(opt => <option key={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input type={field.type} defaultValue={field.defaultValue} className="input-field text-sm max-w-xs" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-end gap-3">
            <button className="btn-outline">Reset to Defaults</button>
            <button className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
