import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { fetchMissionTypes, fetchProjects, fetchEmployees, createMission } from '../lib/api';
import type { MissionType, Project, Employee } from '../lib/types';

const createMissionSchema = z.object({
  date: z.string(),
  mission_type_id: z.number(),
  project_id: z.number(),
  description: z.string().optional(),
  employee_ids: z.array(z.string()).min(1, 'At least one employee must be assigned'),
  team_leader_id: z.string()
});

type CreateMissionForm = z.infer<typeof createMissionSchema>;

interface MissionFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function MissionForm({ onClose, onSuccess }: MissionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [missionTypes, setMissionTypes] = useState<MissionType[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateMissionForm>({
    resolver: zodResolver(createMissionSchema),
    defaultValues: {
      employee_ids: []
    }
  });

  const selectedEmployeeIds = watch('employee_ids');

  useEffect(() => {
    async function loadFormData() {
      try {
        const [missionTypesData, projectsData, employeesData] = await Promise.all([
          fetchMissionTypes(),
          fetchProjects(),
          fetchEmployees()
        ]);

        setMissionTypes(missionTypesData);
        setProjects(projectsData);
        setEmployees(employeesData);
      } catch (error) {
        console.error('Error loading form data:', error);
      }
    }

    loadFormData();
  }, []);

  const onSubmit = async (data: CreateMissionForm) => {
    try {
      setIsLoading(true);
      await createMission(data);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating mission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Date and Time</label>
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
        <label className="block text-sm font-medium text-gray-700">Mission Type</label>
        <select
          {...register('mission_type_id', { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a mission type</option>
          {missionTypes.map(type => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select>
        {errors.mission_type_id && (
          <p className="mt-1 text-sm text-red-600">{errors.mission_type_id.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Project</label>
        <select
          {...register('project_id', { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a project</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
        {errors.project_id && (
          <p className="mt-1 text-sm text-red-600">{errors.project_id.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Team Members</label>
        <div className="mt-2 space-y-2">
          {employees.map(employee => (
            <label key={employee.id} className="flex items-center">
              <input
                type="checkbox"
                value={employee.id}
                {...register('employee_ids')}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <span className="ml-2">{employee.first_name} {employee.last_name}</span>
            </label>
          ))}
        </div>
        {errors.employee_ids && (
          <p className="mt-1 text-sm text-red-600">{errors.employee_ids.message}</p>
        )}
      </div>

      {selectedEmployeeIds.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Team Leader</label>
          <select
            {...register('team_leader_id')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select team leader</option>
            {employees
              .filter(emp => selectedEmployeeIds.includes(emp.id))
              .map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name}
                </option>
              ))}
          </select>
          {errors.team_leader_id && (
            <p className="mt-1 text-sm text-red-600">{errors.team_leader_id.message}</p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
        <textarea
          {...register('description')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          rows={3}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create Mission'}
        </button>
      </div>
    </form>
  );
}