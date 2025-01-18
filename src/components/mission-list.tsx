import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

type Mission = {
  id: string;
  date: string;
  description: string | null;
  project: { name: string };
  mission_type: { name: string };
};

export default function MissionList() {
  const [missions, setMissions] = useState<Mission[]>([]);

  useEffect(() => {
    async function fetchMissions() {
      const { data } = await supabase
        .from('missions')
        .select(`
          id,
          date,
          description,
          project:projects(name),
          mission_type:mission_types(name)
        `)
        .order('date', { ascending: false });
      
      if (data) setMissions(data);
    }

    fetchMissions();
  }, []);

  return (
    <div className="space-y-4">
      {missions.map(mission => (
        <div key={mission.id} className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{mission.mission_type.name}</h3>
              <p className="text-sm text-gray-500">{mission.project.name}</p>
            </div>
            <time className="text-sm text-gray-500">
              {format(new Date(mission.date), 'PPp')}
            </time>
          </div>
          {mission.description && (
            <p className="mt-2 text-sm text-gray-600">{mission.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}