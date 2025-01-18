import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../lib/supabase';
import type { MissionType } from '../lib/types';

const missionTypeSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  estimated_duration: z.number()
    .min(1, 'Duration must be greater than 0')
    .max(1440, 'Duration cannot exceed 24 hours (1440 minutes)')
});

type FormData = z.infer<typeof missionTypeSchema>;

interface Props {
  missionType?: MissionType | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MissionTypeForm({ missionType, onClose, onSuccess }: Props) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(missionTypeSchema),
    defaultValues: missionType || {
      name: '',
      estimated_duration: 60
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Check for duplicate name
      const { data: existing } = await supabase
        .from('mission_types')
        .select('id')
        .eq('name', data.name)
        .neq('id', missionType?.id || 0)
        .single();

      if (existing) {
        setError('name', {
          type: 'manual',
          message: 'A mission type with this name already exists'
        });
        return;
      }

      if (missionType) {
        // Update existing mission type
        const { error: updateError } = await supabase
          .from('mission_types')
          .update(data)
          .eq('id', missionType.id);

        if (updateError) throw updateError;
      } else {
        // Create new mission type
        const { error: insertError } = await supabase
          .from('mission_types')
          .insert(data);

        if (insertError) throw insertError;
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving mission type:', error);
      alert('Failed to save mission type. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          {...register('name')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Estimated Duration (minutes)
        </label>
        <input
          type="number"
          {...register('estimated_duration', { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.estimated_duration && (
          <p className="mt-1 text-sm text-red-600">{errors.estimated_duration.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : missionType ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}