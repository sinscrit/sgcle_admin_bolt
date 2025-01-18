import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../lib/supabase';

const createMissionSchema = z.object({
  date: z.string(),
  missionTypeId: z.number(),
  projectId: z.number(),
  description: z.string().optional(),
});

type CreateMissionForm = z.infer<typeof createMissionSchema>;

export default function CreateMission() {
  const [isLoading, setIsLoading] = useState(false);
  const [missionTypes, setMissionTypes] = useState<Array<{ id: number; name: string }>>([]);
  const [projects, setProjects] = useState<Array<{ id: number; name: string }>>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateMissionForm>({
    resolver: zodResolver(createMissionSchema),
  });

  useEffect(() => {
    async function fetchData() {
      const { data: missionTypesData } = await supabase
        .from('mission_types')
        .select('id, name');
      
      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, name');

      if (missionTypesData) setMissionTypes(missionTypesData);
      if (projectsData) setProjects(projectsData);
    }

    fetchData();
  }, []);

  const onSubmit = async (data: CreateMissionForm) => {
    try {
      setIsLoading(true);

      // 1. Get mission type details
      const { data: missionType } = await supabase
        .from('mission_types')
        .select('estimated_duration')
        .eq('id', data.missionTypeId)
        .single();

      if (!missionType) {
        throw new Error('Mission type not found');
      }

      // 2. Create the mission
      const { data: mission, error: missionError } = await supabase
        .from('missions')
        .insert({
          date: data.date,
          mission_type_id: data.missionTypeId,
          estimated_duration: missionType.estimated_duration,
          project_id: data.projectId,
          description: data.description,
        })
        .select()
        .single();

      if (missionError) throw missionError;

      // 3. Get template tasks
      const { data: templateTasks } = await supabase
        .from('mission_types_tasks')
        .select('*')
        .eq('mission_type_id', data.missionTypeId)
        .order('ord');

      // 4. Create mission tasks from template
      if (templateTasks && templateTasks.length > 0) {
        const missionTasks = templateTasks.map(task => ({
          mission_id: mission.id,
          ord: task.ord,
          estimated_duration: task.estimated_duration,
          description: task.description,
          status_id: 1, // 'new' status
        }));

        const { error: tasksError } = await supabase
          .from('mission_tasks')
          .insert(missionTasks);

        if (tasksError) throw tasksError;
      }

      alert('Mission created successfully!');
    } catch (error) {
      console.error('Error creating mission:', error);
      alert('Error creating mission. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Date and Time
        </label>
        <input
          type="datetime-local"
          {...register('date')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Mission Type
        </label>
        <select
          {...register('missionTypeId', { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a mission type</option>
          {missionTypes.map(type => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select>
        {errors.missionTypeId && (
          <p className="mt-1 text-sm text-red-600">{errors.missionTypeId.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Project
        </label>
        <select
          {...register('projectId', { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a project</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
        {errors.projectId && (
          <p className="mt-1 text-sm text-red-600">{errors.projectId.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description (Optional)
        </label>
        <textarea
          {...register('description')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          rows={3}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Creating...' : 'Create Mission'}
      </button>
    </form>
  );
}