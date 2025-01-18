import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Alert, AlertDescription } from './ui/alert';
import EmployeeForm from './EmployeeForm';
import type { Employee } from '../lib/types';

export default function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('employees')
        .select('*')
        .order('last_name');

      if (fetchError) throw fetchError;
      setEmployees(data || []);
    } catch (err) {
      setError('Failed to load employees');
      console.error('Error loading employees:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowForm(true);
  };

  const handleDelete = async (employeeId: string) => {
    try {
      // Check if employee is assigned to any active missions
      const { data: activeMissions } = await supabase
        .from('mission_employees')
        .select('mission_id')
        .eq('employee_id', employeeId)
        .limit(1);

      if (activeMissions && activeMissions.length > 0) {
        alert('Cannot delete employee - they are assigned to one or more missions.');
        return;
      }

      const { error: deleteError } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId);

      if (deleteError) throw deleteError;

      loadEmployees();
    } catch (err) {
      console.error('Error deleting employee:', err);
      alert('Failed to delete employee. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading employees...</div>;
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
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        <button
          onClick={() => {
            setSelectedEmployee(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Employee
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <EmployeeForm
            employee={selectedEmployee}
            onClose={() => {
              setShowForm(false);
              setSelectedEmployee(null);
            }}
            onSuccess={() => {
              loadEmployees();
              setShowForm(false);
              setSelectedEmployee(null);
            }}
          />
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {employees.map((employee) => (
            <li key={employee.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {employee.first_name} {employee.last_name}
                  </h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(employee)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="Edit employee"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(employee.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete employee"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {employees.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No employees found. Add one to get started.
          </div>
        )}
      </div>
    </div>
  );
}