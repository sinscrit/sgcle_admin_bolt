export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string
          first_name: string
          last_name: string
          created_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          created_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          created_at?: string
        }
      }
      mission_employees: {
        Row: {
          mission_id: string
          employee_id: string
          is_team_leader: boolean
        }
        Insert: {
          mission_id: string
          employee_id: string
          is_team_leader?: boolean
        }
        Update: {
          mission_id?: string
          employee_id?: string
          is_team_leader?: boolean
        }
      }
      mission_tasks: {
        Row: {
          id: string
          mission_id: string
          ord: number
          estimated_duration: number
          description: string
          status_id: number
          start_stamp: string | null
          stop_stamp: string | null
          pause_stamp: string | null
          unpause_stamp: string | null
          created_at: string
        }
        Insert: {
          id?: string
          mission_id: string
          ord: number
          estimated_duration: number
          description: string
          status_id: number
          start_stamp?: string | null
          stop_stamp?: string | null
          pause_stamp?: string | null
          unpause_stamp?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          mission_id?: string
          ord?: number
          estimated_duration?: number
          description?: string
          status_id?: number
          start_stamp?: string | null
          stop_stamp?: string | null
          pause_stamp?: string | null
          unpause_stamp?: string | null
          created_at?: string
        }
      }
      mission_types: {
        Row: {
          id: number
          name: string
          estimated_duration: number
        }
        Insert: {
          id?: number
          name: string
          estimated_duration: number
        }
        Update: {
          id?: number
          name?: string
          estimated_duration?: number
        }
      }
      mission_types_tasks: {
        Row: {
          id: string
          mission_type_id: number
          ord: number
          estimated_duration: number
          description: string
        }
        Insert: {
          id?: string
          mission_type_id: number
          ord: number
          estimated_duration: number
          description: string
        }
        Update: {
          id?: string
          mission_type_id?: number
          ord?: number
          estimated_duration?: number
          description?: string
        }
      }
      missions: {
        Row: {
          id: string
          date: string
          mission_type_id: number
          estimated_duration: number
          project_id: number
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          mission_type_id: number
          estimated_duration: number
          project_id: number
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          mission_type_id?: number
          estimated_duration?: number
          project_id?: number
          description?: string | null
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: number
          name: string
          description: string | null
          client_id: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          client_id: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          client_id?: string
        }
      }
      status_types: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
      }
      config_clients: {
        Row: {
          id: string
          name: string
          client_logo: string | null
        }
        Insert: {
          id?: string
          name: string
          client_logo?: string | null
        }
        Update: {
          id?: string
          name?: string
          client_logo?: string | null
        }
      }
    }
  }
}