import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { MissionType } from '../lib/types';
import { Alert, AlertDescription } from './ui/alert';

interface TaskTemplate {
  id: string;
  mission_type_id: number;
  ord: number;
  estimated_duration: number;
  description: string;
}

interface Props {
  missionType: MissionType;
  onClose: () => void;
}

export default function TaskTemplateList({ missionType, onClose }: Props) {
  const [tasks, setTasks] = useState<TaskTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    description: '',
    estimated_duration: 30
  });

  useEffect(() => {
    loadTasks();
  }, [missionType.id]);

  const loadTasks = async () => {
    const { data } = await supabase
      .from('mission_types_tasks')
      .select('*')
      .eq('mission_type_id', missionType.id)
      .order('ord');
    
    if (data) setTasks(data);
    setIsLoading(false);
  };

  const handleAddTask = async () => {
    if (!newTask.description.trim()) return;

    const nextOrd = tasks.length > 0 
      ? Math.max(...tasks.map(t => t.ord)) + 1 
      : 1;

    const { error } = await supabase
      .from('mission_types_tasks')
      .insert({
        mission_type_id: missionType.id,
        description: newTask.description,
        estimated_duration: newTask.estimated_duration,
        ord: nextOrd
      });

    if (error) {
      console.error('Error adding task:', error);
      return;
    }

    setNewTask({ description: '', estimated_duration: 30 });
    loadTasks();
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<TaskTemplate>) => {
    const { error } = await supabase
      .from('mission_types_tasks')
      .update(updates)
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task:', error);
      return;
    }

    loadTasks();
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setError(null);

      // Check for active missions of this mission type
      const { data: activeMissions, error: checkError } = await supabase
        .from('missions')
        .select(`
          id,
          mission_tasks!inner(
            id,
            status_id
          )
        `)
        .eq('mission_type_id', missionType.id)
        .eq('mission_tasks.status_id', 2); // In Progress status

      if (checkError) throw checkError;

      if (activeMissions && activeMissions.length > 0) {
        setError(`Cannot delete task - there are ${activeMissions.length} active mission(s) of this type`);
        return;
      }

      // Delete the task
      const { error: deleteError } = await supabase
        .from('mission_types_tasks')
        .delete()
        .eq('id', taskId);

      if (deleteError) throw deleteError;

      // Reorder remaining tasks
      const remainingTasks = tasks
        .filter(t => t.id !== taskId)
        .map((t, index) => ({
          ...t,
          ord: index + 1
        }));

      const { error: reorderError } = await supabase
        .from('mission_types_tasks')
        .upsert(remainingTasks);

      if (reorderError) throw reorderError;

      loadTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task. Please try again.');
    }
  };

  const handleMoveTask = async (taskId: string, direction: 'up' | 'down') => {
    const currentIndex = tasks.findIndex(t => t.id === taskId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === tasks.length - 1)
    ) {
      return;
    }

    const newTasks = [...tasks];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Swap ord values
    const tempOrd = newTasks[currentIndex].ord;
    newTasks[currentIndex].ord = newTasks[targetIndex].ord;
    newTasks[targetIndex].ord = tempOrd;

    // Update both tasks in database
    const { error } = await supabase
      .from('mission_types_tasks')
      .upsert([
        newTasks[currentIndex],
        newTasks[targetIndex]
      ]);

    if (error) {
      console.error('Error reordering tasks:', error);
      return;
    }

    loadTasks();
  };

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Task Templates for {missionType.name}
        </h3>
        <button
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMoveTask(task.id, 'up')}
                disabled={index === 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                ↑
              </button>
              <button
                onClick={() => handleMoveTask(task.id, 'down')}
                disabled={index === tasks.length - 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                ↓
              </button>
            </div>
            
            <div className="flex-1">
              <input
                type="text"
                value={task.description}
                onChange={(e) => handleUpdateTask(task.id, { description: e.target.value })}
                className="w-full bg-transparent border-0 focus:ring-0"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={task.estimated_duration}
                  onChange={(e) => handleUpdateTask(task.id, { 
                    estimated_duration: parseInt(e.target.value) || 0 
                  })}
                  className="w-20 text-right rounded-md border-gray-300"
                />
                <span className="text-sm text-gray-500">min</span>
              </div>
              
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="p-1 text-gray-400 hover:text-red-600"
                title="Delete task"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-4">
        <input
          type="text"
          value={newTask.description}
          onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
          placeholder="New task description"
          className="flex-1 rounded-md border-gray-300"
        />
        <input
          type="number"
          value={newTask.estimated_duration}
          onChange={(e) => setNewTask(prev => ({ 
            ...prev, 
            estimated_duration: parseInt(e.target.value) || 0 
          }))}
          className="w-20 rounded-md border-gray-300"
        />
        <button
          onClick={handleAddTask}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      <div className="mt-6 text-right">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Done
        </button>
      </div>
    </div>
  );
}