import { useState } from 'react';
import { Shield, Clock, Bell, Database } from 'lucide-react';

const settingsSections = [
  {
    name: 'Security',
    icon: Shield,
    settings: [
      { id: 'require-2fa', label: 'Require Two-Factor Authentication', type: 'toggle' },
      { id: 'session-timeout', label: 'Session Timeout (minutes)', type: 'number' }
    ]
  },
  {
    name: 'Preferences',
    icon: Clock,
    settings: [
      { id: 'default-duration', label: 'Default Mission Duration (minutes)', type: 'number' },
      { id: 'time-zone', label: 'Time Zone', type: 'select' }
    ]
  },
  {
    name: 'Notifications',
    icon: Bell,
    settings: [
      { id: 'email-notifications', label: 'Email Notifications', type: 'toggle' },
      { id: 'push-notifications', label: 'Push Notifications', type: 'toggle' }
    ]
  },
  {
    name: 'Data Management',
    icon: Database,
    settings: [
      { id: 'auto-archive', label: 'Auto-archive Completed Missions (days)', type: 'number' },
      { id: 'data-retention', label: 'Data Retention Period (months)', type: 'number' }
    ]
  }
];

export default function Settings() {
  const [formData, setFormData] = useState({});

  const handleChange = (id: string, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      <div className="space-y-8">
        {settingsSections.map((section) => (
          <div key={section.name} className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-6">
              <section.icon className="h-6 w-6 text-blue-600" />
              <h3 className="ml-3 text-lg font-medium text-gray-900">{section.name}</h3>
            </div>

            <div className="space-y-4">
              {section.settings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between">
                  <label htmlFor={setting.id} className="text-sm font-medium text-gray-700">
                    {setting.label}
                  </label>
                  {setting.type === 'toggle' ? (
                    <button
                      className={`${
                        formData[setting.id as keyof typeof formData]
                          ? 'bg-blue-600'
                          : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors`}
                      onClick={() => handleChange(setting.id, !formData[setting.id as keyof typeof formData])}
                    >
                      <span className={`${
                        formData[setting.id as keyof typeof formData] ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform mt-1`} />
                    </button>
                  ) : setting.type === 'number' ? (
                    <input
                      type="number"
                      id={setting.id}
                      className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      onChange={(e) => handleChange(setting.id, e.target.value)}
                    />
                  ) : setting.type === 'select' ? (
                    <select
                      id={setting.id}
                      className="mt-1 block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      onChange={(e) => handleChange(setting.id, e.target.value)}
                    >
                      <option>UTC</option>
                      <option>America/New_York</option>
                      <option>Europe/London</option>
                      <option>Asia/Tokyo</option>
                    </select>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Save Changes
        </button>
      </div>
    </div>
  );
}