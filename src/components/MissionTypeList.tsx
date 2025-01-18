import { useEffect, useState } from 'react';
import { Plus, ListChecks } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { supabase } from '../lib/supabase';
import { MissionType } from '../lib/types';
import MissionTypeForm from './MissionTypeForm';
import TaskTemplateList from './TaskTemplateList';

export default function MissionTypeList() {
  const [missionTypes, setMissionTypes] = useState<MissionType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState<MissionType | null>(null);
  const [showTaskTemplates, setShowTaskTemplates] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMissionTypes = async () => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('mission_types')
        .select('*')
        .order('name');

      if (fetchError) throw fetchError;
      setMissionTypes(data || []);
    } catch (err) {
      setError('Failed to load mission types');
      console.error('Error loading mission types:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMissionTypes();
  }, []);

  const handleEdit = (missionType: MissionType) => {
    setSelectedType(missionType);
    setShowForm(true);
  };

  const handleManageTasks = (missionType: MissionType) => {
    setSelectedType(missionType);
    setShowTaskTemplates(true);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading mission types...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mission Types</h1>
        <button
          onClick={() => {
            setSelectedType(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={20} />
          New Mission Type
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <MissionTypeForm
            missionType={selectedType}
            onClose={() => {
              setShowForm(false);
              setSelectedType(null);
            }}
            onSuccess={() => {
              loadMissionTypes();
              setShowForm(false);
              setSelectedType(null);
            }}
          />
        </div>
      )}

      {showTaskTemplates && selectedType && (
        <div className="bg-white rounded-lg shadow p-6">
          <TaskTemplateList
            missionType={selectedType}
            onClose={() => {
              setShowTaskTemplates(false);
              setSelectedType(null);
            }}
          />
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {missionTypes.map((type) => (
            <li key={type.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{type.name}</h3>
                  <p className="text-sm text-gray-500">
                    Estimated duration: {type.estimated_duration} minutes
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleManageTasks(type)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <ListChecks size={16} />
                    Tasks
                  </button>
                  <button
                    onClick={() => handleEdit(type)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {missionTypes.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No mission types found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}