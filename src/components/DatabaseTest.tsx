import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function DatabaseTest() {
  const [missionTypes, setMissionTypes] = useState<{ id: number; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        const { data, error } = await supabase
          .from('mission_types')
          .select('id, name');
        
        if (error) throw error;
        setMissionTypes(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect to database');
      }
    }

    testConnection();
  }, []);

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Mission Types from Database:</h2>
      <ul className="list-disc pl-5">
        {missionTypes.map(type => (
          <li key={type.id}>{type.name}</li>
        ))}
      </ul>
    </div>
  );
}