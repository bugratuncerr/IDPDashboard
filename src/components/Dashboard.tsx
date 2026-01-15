import { useState } from 'react';
import { Calendar, Users, TrendingUp, Plus, ChevronDown, Clock, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Page } from '../App';

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

const attendanceData = [
  { month: 'Jan', attendance: 85 },
  { month: 'Feb', attendance: 88 },
  { month: 'Mar', attendance: 92 },
  { month: 'Apr', attendance: 87 },
  { month: 'May', attendance: 90 },
  { month: 'Jun', attendance: 94 },
];

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [selectedTeam, setSelectedTeam] = useState('U-17 Premier Team');

  const teams = ['U-17 Premier Team', 'U-19 Development Squad', 'Women\'s First Team'];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-gray-900 dark:text-gray-100 mb-2">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back, Coach Martinez</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {teams.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => onNavigate('session-planner')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Session
          </button>

          <button
            onClick={() => onNavigate('team')}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Player
          </button>
        </div>
      </div>

      {/* Key Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => onNavigate('session-planner')}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Tomorrow</span>
          </div>
          <h3 className="text-gray-900 dark:text-gray-100 mb-2">Next Training Session</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Defensive Positioning & Counter-attacks</p>
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              4:00 PM - 6:00 PM
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Field A
            </span>
          </div>
        </button>

        <button
          onClick={() => onNavigate('match')}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Saturday</span>
          </div>
          <h3 className="text-gray-900 dark:text-gray-100 mb-2">Upcoming Match</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">vs. City Rovers FC</p>
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              10:00 AM
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Away
            </span>
          </div>
        </button>

        <button
          onClick={() => onNavigate('team')}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs text-green-600 dark:text-green-400">+3%</span>
          </div>
          <h3 className="text-gray-900 dark:text-gray-100 mb-2">Attendance Rate</h3>
          <p className="text-3xl text-gray-900 dark:text-gray-100 mb-1">94%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Last 30 days</p>
        </button>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-gray-900 dark:text-gray-100 mb-4">Attendance Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                formatter={(value: number) => [`${value}%`, 'Attendance']}
              />
              <Bar dataKey="attendance" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-gray-900 dark:text-gray-100 mb-4">Team Statistics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Training Sessions</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">24 this month</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Matches Played</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">8 / 10</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Players</span>
                <span className="text-sm text-gray-900 dark:text-gray-100">22 / 25</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl text-gray-900 dark:text-gray-100">6</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Wins</p>
                </div>
                <div>
                  <p className="text-2xl text-gray-900 dark:text-gray-100">1</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Draws</p>
                </div>
                <div>
                  <p className="text-2xl text-gray-900 dark:text-gray-100">1</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Losses</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
