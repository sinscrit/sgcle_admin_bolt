import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainNavigation from './components/MainNavigation';
import MissionList from './components/MissionList';
import MissionTypeList from './components/MissionTypeList';
import EmployeeList from './components/EmployeeList';
import ProjectList from './components/ProjectList';
import Reports from './components/Reports';
import Settings from './components/Settings';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <MainNavigation />
        <main className="container py-6">
          <Routes>
            <Route path="/" element={<MissionList />} />
            <Route path="/missions" element={<MissionList />} />
            <Route path="/mission-types" element={<MissionTypeList />} />
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}