import { useEffect, useState } from 'react';
import { format, isToday, subDays, parseISO } from 'date-fns';
import { Plus, ChevronRight, ChevronDown } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import MissionForm from './MissionForm';
import { fetchMissions } from '../lib/api';
import type { Mission } from '../lib/types';

type GroupedMissions = {
  [key: string]: Mission[];
};

const getMissionStatus = (tasks: Mission['tasks']) => {
  if (!tasks?.length) return 'red';
  
  const allCompleted = tasks.every(task => task.status_id === 4); // Completed
  if (allCompleted) return 'green';
  
  const hasStarted = tasks.some(task => task.status_id !== 1); // Not New
  return hasStarted ? 'orange' : 'red';
};

const statusColors = {
  red: 'bg-red-100',
  orange: 'bg-orange-100',
  green: 'bg-green-100'
};

export default function MissionList() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [groupedMissions, setGroupedMissions] = useState<GroupedMissions>({});
  const [expandedDates, setExpandedDates] = useState<string[]>([]);
  const [expandedMissionId, setExpandedMissionId] = useState<string | null>(null);
  const [showNewMissionForm, setShowNewMissionForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMissions = async () => {
    try {
      setIsLoading(true);
      const data = await fetchMissions();
      setMissions(data);
      
      const grouped = data.reduce((acc: GroupedMissions, mission) => {
        const date = format(parseISO(mission.date), 'yyyy-MM-dd');
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(mission);
        return acc;
      }, {});
      
      setGroupedMissions(grouped);
      
      const today = format(new Date(), 'yyyy-MM-dd');
      if (grouped[today]) {
        setExpandedDates([today]);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load missions');
      console.error('Error loading missions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMissions();
  }, []);

  const toggleDateExpand = (date: string) => {
    setExpandedDates(prev => 
      prev.includes(date) 
        ? prev.filter(d => d !== date)
        : [...prev, date]
    );
  };

  const toggleMissionExpand = (missionId: string) => {
    setExpandedMissionId(prev => prev === missionId ? null : missionId);
  };

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) {
      return 'Today';
    }
    return format(date, 'EEEE, MMMM d');
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading missions...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const dates = Object.keys(groupedMissions)
    .filter(date => {
      const missionDate = parseISO(date);
      const sevenDaysAgo = subDays(new Date(), 7);
      return missionDate >= sevenDaysAgo;
    })
    .sort((a, b) => parseISO(b).getTime() - parseISO(a).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Missions</h1>
        <button
          onClick={() => setShowNewMissionForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={20} />
          New Mission
        </button>
      </div>

      {showNewMissionForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <MissionForm
            onClose={() => setShowNewMissionForm(false)}
            onSuccess={() => {
              loadMissions();
              setShowNewMissionForm(false);
            }}
          />
        </div>
      )}

      <div className="space-y-4">
        {dates.map((date) => (
          <div key={date} className="bg-white rounded-lg shadow">
            <div
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => toggleDateExpand(date)}
            >
              <div className="flex items-center gap-4">
                {expandedDates.includes(date) ? (
                  <ChevronDown className="text-gray-500" />
                ) : (
                  <ChevronRight className="text-gray-500" />
                )}
                <h2 className="font-semibold text-gray-900">
                  {getDateLabel(date)}
                </h2>
                <span className="text-sm text-gray-500">
                  {groupedMissions[date].length} mission{groupedMissions[date].length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {expandedDates.includes(date) && (
              <div className="border-t border-gray-100">
                {groupedMissions[date].map((mission) => {
                  const status = getMissionStatus(mission.tasks);
                  const teamLeader = mission.employees?.find(emp => emp.is_team_leader);
                  
                  return (
                    <div key={`${mission.id}-${date}`}>
                      <div
                        className="p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleMissionExpand(mission.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {mission.mission_type.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {mission.project.name}
                            </p>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
                            {teamLeader && (
                              <p className="text-sm text-gray-600">
                                {teamLeader.first_name} {teamLeader.last_name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {expandedMissionId === mission.id && (
                        <div className="p-4 bg-gray-50 border-b">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-700">Duration</h4>
                              <p className="mt-1">{mission.estimated_duration} minutes</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-700">Team</h4>
                              <div className="mt-1 flex flex-wrap gap-2">
                                {mission.employees?.map((emp) => (
                                  <span
                                    key={emp.id}
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                      ${emp.is_team_leader ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}
                                  >
                                    {emp.first_name} {emp.last_name}
                                    {emp.is_team_leader && ' (Leader)'}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {mission.description && (
                              <div className="col-span-2">
                                <h4 className="text-sm font-medium text-gray-700">Description</h4>
                                <p className="mt-1 text-sm text-gray-600">{mission.description}</p>
                              </div>
                            )}
                            <div className="col-span-2">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Tasks</h4>
                              <div className="space-y-2">
                                {mission.tasks?.map((task) => (
                                  <div
                                    key={task.id}
                                    className="flex items-center justify-between p-3 bg-white rounded-md"
                                  >
                                    <div className="flex items-center gap-4">
                                      <span className="text-gray-500 text-sm">{task.ord}.</span>
                                      <span>{task.description}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <span className={`px-2 py-1 rounded-full text-xs ${
                                        task.status_id === 1 ? 'bg-gray-100 text-gray-800' :
                                        task.status_id === 2 ? 'bg-blue-100 text-blue-800' :
                                        task.status_id === 3 ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                      }`}>
                                        {task.status_id === 1 ? 'New' :
                                         task.status_id === 2 ? 'In Progress' :
                                         task.status_id === 3 ? 'Paused' :
                                         'Completed'}
                                      </span>
                                      <span className="text-sm text-gray-500">
                                        {task.estimated_duration} min
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {dates.length === 0 && (
        <Alert>
          <AlertDescription>
            No missions found in the last 7 days. Create a new mission to get started.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}