import { Link, useLocation } from 'react-router-dom';
import { Calendar, Users, Briefcase, BarChart2, Settings, List } from 'lucide-react';

const navigation = [
  { name: 'Missions', icon: Calendar, href: '/missions' },
  { name: 'Mission Types', icon: List, href: '/mission-types' },
  { name: 'Employees', icon: Users, href: '/employees' },
  { name: 'Projects', icon: Briefcase, href: '/projects' },
  { name: 'Reports', icon: BarChart2, href: '/reports' },
  { name: 'Settings', icon: Settings, href: '/settings' },
];

export default function MainNav() {
  const location = useLocation();

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-900">
                Mission Management
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    location.pathname === item.href
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }
                    inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}