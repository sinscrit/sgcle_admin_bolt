/*
  # Initial Schema Setup for Mission Management System

  1. New Tables
    - `mission_types`: Types of missions with estimated durations
    - `projects`: Projects that missions belong to
    - `missions`: Main mission entries
    - `mission_types_tasks`: Template tasks for each mission type
    - `mission_tasks`: Actual tasks for each mission
    - `status_types`: Status options for tasks
    - `employees`: Employee information
    - `mission_employees`: Links employees to missions

  2. Security
    - RLS enabled on all tables
    - Basic read policies added
*/

-- Mission Types
CREATE TABLE IF NOT EXISTS mission_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  estimated_duration INTEGER NOT NULL
);

ALTER TABLE mission_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mission types are viewable by all users" ON mission_types
  FOR SELECT USING (true);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Projects are viewable by all users" ON projects
  FOR SELECT USING (true);

-- Missions
CREATE TABLE IF NOT EXISTS missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TIMESTAMPTZ NOT NULL,
  mission_type_id INTEGER REFERENCES mission_types(id),
  estimated_duration INTEGER NOT NULL,
  project_id INTEGER REFERENCES projects(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Missions are viewable by all users" ON missions
  FOR SELECT USING (true);

-- Status Types
CREATE TABLE IF NOT EXISTS status_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

ALTER TABLE status_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Status types are viewable by all users" ON status_types
  FOR SELECT USING (true);

-- Mission Types Tasks (Templates)
CREATE TABLE IF NOT EXISTS mission_types_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_type_id INTEGER REFERENCES mission_types(id),
  ord INTEGER NOT NULL,
  estimated_duration INTEGER NOT NULL,
  description TEXT NOT NULL
);

ALTER TABLE mission_types_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mission type tasks are viewable by all users" ON mission_types_tasks
  FOR SELECT USING (true);

-- Mission Tasks
CREATE TABLE IF NOT EXISTS mission_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES missions(id),
  ord INTEGER NOT NULL,
  estimated_duration INTEGER NOT NULL,
  description TEXT NOT NULL,
  status_id INTEGER REFERENCES status_types(id),
  start_stamp TIMESTAMPTZ,
  stop_stamp TIMESTAMPTZ,
  pause_stamp TIMESTAMPTZ,
  unpause_stamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE mission_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mission tasks are viewable by all users" ON mission_tasks
  FOR SELECT USING (true);

-- Employees
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees are viewable by all users" ON employees
  FOR SELECT USING (true);

-- Mission Employees
CREATE TABLE IF NOT EXISTS mission_employees (
  mission_id UUID REFERENCES missions(id),
  employee_id UUID REFERENCES employees(id),
  is_team_leader BOOLEAN DEFAULT false,
  PRIMARY KEY (mission_id, employee_id)
);

ALTER TABLE mission_employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mission employees are viewable by all users" ON mission_employees
  FOR SELECT USING (true);

-- Insert some initial data
INSERT INTO status_types (name) VALUES
  ('New'),
  ('In Progress'),
  ('Paused'),
  ('Completed');

INSERT INTO mission_types (name, estimated_duration) VALUES
  ('Maintenance', 120),
  ('Installation', 240),
  ('Inspection', 60),
  ('Repair', 180);

INSERT INTO projects (name, description) VALUES
  ('Project Alpha', 'Main production line maintenance'),
  ('Project Beta', 'New equipment installation'),
  ('Project Gamma', 'Safety inspections');