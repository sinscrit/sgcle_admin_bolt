import { useState } from 'react';
import { Plus, Edit2, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

// Sample data types
type Employee = {
  id: string;
  name: string;
  isTeamLeader: boolean;
};

type Task = {
  id: number;
  ord: number;
  description: string;
  status: string;
  estimatedDuration: number;
};

type Mission = {
  id: string;
  date: string;
  missionType: string;
  estimatedDuration: number;
  project: string;
  description: string;
  employees: Employee[];
  tasks: Task[];
};

// Sample data
const sampleMissions: Mission[] = [
  {
    id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
    date: '2025-01-07 09:00:00',
    missionType: 'Site Inspection',
    estimatedDuration: 120,
    project: 'Downtown Plaza Renovation',
    description: 'Initial plaza inspection',
    employees: [
      { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'John Smith', isTeamLeader: true },
      { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', name: 'Sarah Johnson', isTeamLeader: false }
    ],
    tasks: [
      { id: 1, ord: 1, description: 'Initial site assessment', status: 'new', estimatedDuration: 30 },
      { id: 2, ord: 2, description: 'Structure inspection', status: 'new', estimatedDuration: 45 },
      { id: 3, ord: 3, description: 'Documentation and reporting', status: 'new', estimatedDuration: 45 }
    ]
  },
  {
    id: 'f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
    date: '2025-01-07 13:00:00',
    missionType: 'Equipment Maintenance',
    estimatedDuration: 180,
    project: 'Hospital Wing Extension',
    description: 'Hospital equipment check',
    employees: [
      { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', name: 'Michael Brown', isTeamLeader: true },
      { id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', name: 'Emily Davis', isTeamLeader: false }
    ],
    tasks: [
      { id: 4, ord: 1, description: 'Equipment diagnostic', status: 'new', estimatedDuration: 45 },
      { id: 5, ord: 2, description: 'Maintenance procedure', status: 'new', estimatedDuration: 90 },
      { id: 6, ord: 3, description: 'Testing and validation', status: 'new', estimatedDuration: 45 }
    ]
  }
];

export default function MissionManagement() {
  const [missions, setMissions] = useState<Mission[]>(sampleMissions);
  const [expandedMissionId, setExpandedMissionId] = useState<string | null>(null);
  const [showNewMissionForm, setShowNewMissionForm] = useState(false);

  const toggleMissionExpand = (missionId: string) => {
    setExpandedMissionId(expandedMissionId === missionId ? null : missionId);
  };

  const deleteMission = (missionId: string) => {
    setMissions(missions.filter(mission => mission.id !== missionId));
  };

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-yellow-100 text-yellow-800',
      blocked: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || colors.new;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mission Management</h1>
        <button
          onClick={() => setShowNewMissionForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={20} />
          New Mission
        </button>
      </div>

      {showNewMissionForm && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Create New Mission</h2>
          <form className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input type="datetime-local" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mission Type</label>
              <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option>Site Inspection</option>
                <option>Equipment Maintenance</option>
                <option>Safety Audit</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" rows={3}></textarea>
            </div>
            <div className="col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewMissionForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Mission
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {missions.map((mission) => (
          <div key={mission.id} className="bg-white rounded-lg shadow">
            <div
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => toggleMissionExpand(mission.id)}
            >
              <div className="flex items-center gap-4">
                {expandedMissionId === mission.id ? (
                  <ChevronDown className="text-gray-500" />
                ) : (
                  <ChevronRight className="text-gray-500" />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{mission.missionType}</h3>
                  <p className="text-sm text-gray-500">{mission.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-500 hover:text-blue-600">
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMission(mission.id);
                  }}
                  className="p-2 text-gray-500 hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {expandedMissionId === mission.id && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Project</h4>
                    <p className="text-gray-900">{mission.project}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Duration</h4>
                    <p className="text-gray-900">{mission.estimatedDuration} minutes</p>
                  </div>
                  <div className="col-span-2">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Description</h4>
                    <p className="text-gray-900">{mission.description}</p>
                  </div>
                  
                  <div className="col-span-2">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Team</h4>
                    <div className="flex flex-wrap gap-2">
                      {mission.employees.map((employee) => (
                        <div
                          key={employee.id}
                          className={`px-3 py-1 rounded-full text-sm ${
                            employee.isTeamLeader
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {employee.name} {employee.isTeamLeader && '(Leader)'}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Tasks</h4>
                    <div className="space-y-2">
                      {mission.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-gray-500 text-sm">{task.ord}.</span>
                            <span>{task.description}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                            <span className="text-sm text-gray-500">{task.estimatedDuration} min</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {missions.length === 0 && (
        <Alert>
          <AlertDescription>
            No missions found. Create a new mission to get started.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}