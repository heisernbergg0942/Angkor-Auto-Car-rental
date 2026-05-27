import { useState } from 'react';
import { Bell, Shield, Globe, CreditCard, Save, RotateCcw } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';

const sections = [
  {
    icon: Globe,
    title: 'General Settings',
    fields: [
      { label: 'Company Name',      type: 'text',   key: 'company_name',     defaultValue: 'Angkor Auto Car Rental' },
      { label: 'Support Email',     type: 'email',  key: 'support_email',    defaultValue: 'AngkorAuto@gmail.com' },
      { label: 'Default Currency',  type: 'select', key: 'currency',         options: ['USD ($)', 'EUR (€)', 'GBP (£)'] },
      { label: 'Timezone',          type: 'select', key: 'timezone',         options: ['Asia/Phnom_Penh', 'America/New_York', 'Europe/London', 'Asia/Tokyo'] },
    ],
  },
  {
    icon: Bell,
    title: 'Notifications',
    fields: [
      { label: 'Email Alerts',            type: 'toggle', key: 'email_alerts',      defaultChecked: true },
      { label: 'Maintenance Reminders',   type: 'toggle', key: 'maintenance_alerts', defaultChecked: true },
      { label: 'Overdue Rental Alerts',   type: 'toggle', key: 'overdue_alerts',    defaultChecked: true },
      { label: 'New Booking Alerts',      type: 'toggle', key: 'new_booking_alerts', defaultChecked: false },
    ],
  },
  {
    icon: CreditCard,
    title: 'Payment Settings',
    fields: [
      { label: 'Payment Gateway',      type: 'select', key: 'gateway',          options: ['Stripe', 'PayPal', 'Square'] },
      { label: 'Late Fee (%)',          type: 'number', key: 'late_fee',         defaultValue: '15' },
      { label: 'Security Deposit ($)', type: 'number', key: 'security_deposit', defaultValue: '500' },
    ],
  },
  {
    icon: Shield,
    title: 'Security',
    fields: [
      { label: 'Two-Factor Authentication',   type: 'toggle', key: '2fa',              defaultChecked: true },
      { label: 'Session Timeout (minutes)',   type: 'number', key: 'session_timeout',  defaultValue: '30' },
      { label: 'IP Whitelist',               type: 'text',   key: 'ip_whitelist',     defaultValue: '' },
    ],
  },
];

function buildDefaults() {
  const d = {};
  sections.forEach(({ fields }) =>
    fields.forEach(f => {
      d[f.key] = f.type === 'toggle' ? (f.defaultChecked ?? false) : (f.defaultValue ?? '');
    })
  );
  return d;
}

export default function SettingsPage() {
  const [values, setValues]   = useState(buildDefaults());
  const [saved,  setSaved]    = useState(false);

  const set = (key, val) => { setSaved(false); setValues(prev => ({ ...prev, [key]: val })); };

  const handleSave = () => {
    // In a real app, call API here
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setValues(buildDefaults());
    setSaved(false);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-800">System Settings</h1>
          <p className="text-xs text-gray-400 mt-0.5">Configure your car rental management platform.</p>
        </div>

        <div className="max-w-2xl space-y-4">
          {sections.map(({ icon: Icon, title, fields }) => (
            <div key={title} className="bg-white border border-gray-100 rounded-xl p-5">
              {/* Section header */}
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-[#edf7f2] flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[#2D6A4F]" />
                </div>
                <h2 className="font-bold text-gray-800 text-sm">{title}</h2>
              </div>

              {/* Fields */}
              <div className="space-y-4">
                {fields.map(field => (
                  <div key={field.key} className="flex items-center justify-between gap-4">
                    <label className="text-xs font-medium text-gray-600 shrink-0">{field.label}</label>

                    {field.type === 'toggle' ? (
                      <button
                        type="button"
                        onClick={() => set(field.key, !values[field.key])}
                        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                          values[field.key] ? 'bg-[#2D6A4F]' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                            values[field.key] ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    ) : field.type === 'select' ? (
                      <select
                        value={values[field.key]}
                        onChange={e => set(field.key, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2D6A4F] max-w-[220px] w-full"
                      >
                        {field.options.map(opt => <option key={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={values[field.key]}
                        onChange={e => set(field.key, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2D6A4F] max-w-[220px] w-full"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            {saved && (
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                ✓ Settings saved successfully
              </span>
            )}
            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 text-xs font-semibold bg-[#2D6A4F] text-white px-4 py-2 rounded-lg hover:bg-[#1B4332] transition-colors"
              >
                <Save className="w-3.5 h-3.5" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
