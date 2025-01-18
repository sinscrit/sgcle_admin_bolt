import { Database } from './database.types';

export type Mission = Database['public']['Tables']['missions']['Row'] & {
  mission_type: Database['public']['Tables']['mission_types']['Row'];
  project: Database['public']['Tables']['projects']['Row'];
  tasks: Array<Database['public']['Tables']['mission_tasks']['Row']>;
  employees: Array<Database['public']['Tables']['employees']['Row'] & {
    is_team_leader: boolean;
  }>;
};

export type MissionType = Database['public']['Tables']['mission_types']['Row'];
export interface Project {
  id: number;
  name: string;
  description: string | null;
  project_type_id: number | null;
  client_id: string | null;
  client?: {
    id: number;
    client_id: string;
    client_name: string | null;
    client_logo: string | null;
    client_city: string | null;
    client_country: string | null;
  } | null;
}
export type Employee = Database['public']['Tables']['employees']['Row'];
export type Task = Database['public']['Tables']['mission_tasks']['Row'];