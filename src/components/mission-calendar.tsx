import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { format, startOfWeek, addDays } from 'date-fns';

type Mission = {
  id: string;
  date: string;
  mission_type: { name: string };
};

export default function MissionCalendar() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const startDate = startOfWeek(new Date());
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  useEffect(() => {
    async function fetchMissions() {
      const { data } = await supabase
        .from('missions')
        .select('id, date, mission_type:mission_types(name)')
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(addDays(startDate, 6), 'yyyy-MM-dd'))
        .order('date');
      
      if (data) setMissions(data);
    }

    fetchMissions();
  }, []);

  return (
    <div className="grid grid-cols-7 gap-2">
      {weekDays.map(day => (
        <div key={day.toString()} className="border rounded-lg p-2">
          <div className="text-sm font-medium mb-2">
            {format(day, 'EEE d')}
          </div>
          <div className="space-y-1">
            {missions
              .filter(mission => 
                format(new Date(mission.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
              )
              .map(mission => (
                <div 
                  key={mission.id}
                  className="text-xs p-1 bg-blue-100 rounded"
                >
                  {mission.mission_type.name}
                </div>
              ))
            }
          </div>
        </div>
      ))}
    </div>
  );
}