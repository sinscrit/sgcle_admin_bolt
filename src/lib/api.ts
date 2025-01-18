import { supabase } from './supabase';
import type { Mission, MissionType, Project, Employee } from './types';

export interface Client {
  client_id: string;  // primary key
  client_name: string | null;
  client_logo: string | null;
  client_city: string | null;
  client_country: string | null;
  created_at: string;
}

export async function fetchMissions(): Promise<Mission[]> {
  const { data, error } = await supabase
    .from('missions')
    .select(`
      *,
      mission_type:mission_types(*),
      project:projects(*),
      tasks:mission_tasks(
        *,
        status:status_types(*)
      ),
      employees:mission_employees!inner(
        is_team_leader,
        employee:employees(*)
      )
    `)
    .order('date', { ascending: false });

  if (error) throw error;

  // Transform the data to match the expected structure
  return (data || []).map(mission => ({
    ...mission,
    employees: mission.employees.map(emp => ({
      ...emp.employee,
      is_team_leader: emp.is_team_leader
    }))
  }));
}

export async function fetchMissionTypes(): Promise<MissionType[]> {
  const { data, error } = await supabase
    .from('mission_types')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function fetchProjects(): Promise<Project[]> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        config_clients!projects_client_id_fkey (*)
      `)
      .order('name');

    if (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }

    return (data || []).map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      project_type_id: project.project_type_id,
      client_id: project.client_id,
      client: project.config_clients ? {
        ...project.config_clients,
        client_logo: project.config_clients.client_logo ? `/static/images/${project.config_clients.client_logo}` : null
      } : null
    }));
  } catch (err) {
    console.error('Error in fetchProjects:', err);
    throw err;
  }
}

export async function fetchProjectById(id: number): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createProject(data: { 
  name: string; 
  description?: string | null;
  client_id: string;
}): Promise<Project> {
  const { data: project, error } = await supabase
    .from('projects')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return project;
}

export async function updateProject(
  id: number,
  data: {
    name?: string;
    description?: string | null;
    client_id?: string;
  }
): Promise<Project> {
  const { data: project, error } = await supabase
    .from('projects')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return project;
}

export async function deleteProject(id: number): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function fetchEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('last_name');

  if (error) throw error;
  return data || [];
}

export async function createMission(data: {
  date: string;
  mission_type_id: number;
  project_id: number;
  description?: string;
  employee_ids: string[];
  team_leader_id: string;
}) {
  const { mission_type_id, employee_ids, team_leader_id, ...missionData } = data;

  // 1. Get mission type details for estimated duration
  const { data: missionType } = await supabase
    .from('mission_types')
    .select('estimated_duration')
    .eq('id', mission_type_id)
    .single();

  if (!missionType) throw new Error('Mission type not found');

  // 2. Create the mission
  const { data: mission, error: missionError } = await supabase
    .from('missions')
    .insert({
      ...missionData,
      mission_type_id,
      estimated_duration: missionType.estimated_duration,
    })
    .select()
    .single();

  if (missionError) throw missionError;

  // 3. Assign employees
  const employeeAssignments = employee_ids.map(employee_id => ({
    mission_id: mission.id,
    employee_id,
    is_team_leader: employee_id === team_leader_id
  }));

  const { error: employeeError } = await supabase
    .from('mission_employees')
    .insert(employeeAssignments);

  if (employeeError) throw employeeError;

  // 4. Create tasks from template
  const { data: templateTasks } = await supabase
    .from('mission_types_tasks')
    .select('*')
    .eq('mission_type_id', mission_type_id)
    .order('ord');

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

  return mission;
}

export async function updateTaskStatus(
  taskId: string,
  statusId: number
) {
  const updates: Record<string, any> = {
    status_id: statusId
  };

  // Handle timestamps based on status
  switch (statusId) {
    case 2: // In Progress
      updates.start_stamp = new Date().toISOString();
      break;
    case 3: // Paused
      updates.pause_stamp = new Date().toISOString();
      break;
    case 4: // Completed
      updates.stop_stamp = new Date().toISOString();
      break;
  }

  const { error } = await supabase
    .from('mission_tasks')
    .update(updates)
    .eq('id', taskId);

  if (error) throw error;
}

export async function fetchClients(): Promise<Client[]> {
  try {
    const { data, error } = await supabase
      .from('config_clients')
      .select('*')
      .order('client_name');

    if (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }

    return (data || []).map(client => ({
      client_id: client.client_id,
      client_name: client.client_name,
      client_logo: client.client_logo ? `/static/images/${client.client_logo}` : null,
      client_city: client.client_city,
      client_country: client.client_country,
      created_at: client.created_at
    }));
  } catch (err) {
    console.error('Error in fetchClients:', err);
    throw err;
  }
}