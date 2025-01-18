import { useState } from 'react';
import { BarChart2, Clock, Users, Calendar } from 'lucide-react';

const reportTypes = [
  {
    name: 'Mission Performance',
    icon: BarChart2,
    description: 'View mission completion rates and time variance analysis'
  },
  {
    name: 'Time Tracking',
    icon: Clock,
    description: 'Analyze actual vs estimated time spent on tasks'
  },
  {
    name: 'Resource Utilization',
    icon: Users,
    description: 'Track employee assignments and team composition patterns'
  },
  {
    name: 'Mission Calendar',
    icon: Calendar,
    description: 'View mission distribution and scheduling patterns'
  }
];

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Reports</h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {reportTypes.map((report) => (
          <button
            key={report.name}
            onClick={() => setSelectedReport(report.name)}
            className={`${
              selectedReport === report.name
                ? 'ring-2 ring-blue-500'
                : 'hover:border-blue-300'
            } p-6 bg-white rounded-lg shadow border transition-all`}
          >
            <div className="flex items-center">
              <report.icon className="h-8 w-8 text-blue-600" />
              <div className="ml-4 text-left">
                <h3 className="text-lg font-medium text-gray-900">{report.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{report.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedReport && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow">
          <p className="text-gray-500">Report view for {selectedReport} will be implemented here.</p>
        </div>
      )}
    </div>
  );
}