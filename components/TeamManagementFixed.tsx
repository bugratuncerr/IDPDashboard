import { useState } from 'react';
import { Search, Filter, Eye, Edit2, X, TrendingUp, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Player {
  id: number;
  name: string;
  position: string;
  number: number;
  attendance: number;
  performance: number;
  status: 'active' | 'injured' | 'away';
}

const mockPlayers: Player[] = [
  { id: 1, name: 'Alex Johnson', position: 'Forward', number: 9, attendance: 95, performance: 88, status: 'active' },
  { id: 2, name: 'Sam Martinez', position: 'Midfielder', number: 10, attendance: 92, performance: 90, status: 'active' },
  { id: 3, name: 'Jordan Lee', position: 'Defender', number: 4, attendance: 88, performance: 85, status: 'active' },
  { id: 4, name: 'Taylor Brown', position: 'Goalkeeper', number: 1, attendance: 100, performance: 92, status: 'active' },
  { id: 5, name: 'Casey Wilson', position: 'Midfielder', number: 8, attendance: 85, performance: 82, status: 'injured' },
  { id: 6, name: 'Morgan Davis', position: 'Forward', number: 11, attendance: 90, performance: 87, status: 'active' },
  { id: 7, name: 'River Thompson', position: 'Defender', number: 5, attendance: 78, performance: 80, status: 'away' },
  { id: 8, name: 'Avery Garcia', position: 'Midfielder', number: 7, attendance: 94, performance: 89, status: 'active' },
];

const performanceData = [
  { session: 'S1', score: 75 },
  { session: 'S2', score: 78 },
  { session: 'S3', score: 82 },
  { session: 'S4', score: 85 },
  { session: 'S5', score: 88 },
  { session: 'S6', score: 90 },
];

export default function TeamManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  const filteredPlayers = mockPlayers.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
      case 'injured': return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
      case 'away': return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-gray-900 dark:text-gray-100 mb-2">Team & Player Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your team roster and player profiles</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search players by name or position..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Players Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Position</th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Attendance</th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Performance</th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredPlayers.map((player) => (
              <tr key={player.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{player.number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{player.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{player.position}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{player.attendance}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{player.performance}%</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs capitalize ${getStatusColor(player.status)}`}>
                    {player.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedPlayer(player)}
                      className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      title="View Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingPlayer(player);
                        setShowEditModal(true);
                      }}
                      className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                      title="Edit Player"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Player Profile Sidebar */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md h-full overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-xl text-gray-900 dark:text-gray-100">Player Profile</h2>
              <button
                onClick={() => setSelectedPlayer(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 dark:text-gray-300" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Player Info */}
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl">
                  {selectedPlayer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-xl text-gray-900 dark:text-gray-100">{selectedPlayer.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{selectedPlayer.position}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm capitalize ${getStatusColor(selectedPlayer.status)}`}>
                  {selectedPlayer.status}
                </span>
              </div>

              {/* Personal Info */}
              <div className="space-y-3">
                <h4 className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">Personal Info</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Jersey Number</p>
                    <p className="text-gray-900 dark:text-gray-100">#{selectedPlayer.number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Position</p>
                    <p className="text-gray-900 dark:text-gray-100">{selectedPlayer.position}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Height</p>
                    <p className="text-gray-900 dark:text-gray-100">5'11"</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Weight</p>
                    <p className="text-gray-900 dark:text-gray-100">165 lbs</p>
                  </div>
                </div>
              </div>

              {/* KPI Summary */}
              <div className="space-y-3">
                <h4 className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Performance Metrics
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Attendance</p>
                    <p className="text-2xl text-blue-600 dark:text-blue-400">{selectedPlayer.attendance}%</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Performance</p>
                    <p className="text-2xl text-green-600 dark:text-green-400">{selectedPlayer.performance}%</p>
                  </div>
                </div>
              </div>

              {/* Performance Chart */}
              <div className="space-y-3">
                <h4 className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">Performance Trend</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="session" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Attendance History */}
              <div className="space-y-3">
                <h4 className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Recent Attendance
                </h4>
                <div className="space-y-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
                    <div key={day} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{day}, Dec {18 - index}</span>
                      <span className={`px-2 py-1 rounded text-xs ${index === 2 ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'}`}>
                        {index === 2 ? 'Absent' : 'Present'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Player Modal */}
      {showEditModal && editingPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-gray-900 dark:text-gray-100">Edit Player</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 dark:text-gray-300" />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  defaultValue={editingPlayer.name}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Position</label>
                <select
                  defaultValue={editingPlayer.position}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Goalkeeper">Goalkeeper</option>
                  <option value="Defender">Defender</option>
                  <option value="Midfielder">Midfielder</option>
                  <option value="Forward">Forward</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Jersey Number</label>
                <input
                  type="number"
                  defaultValue={editingPlayer.number}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select
                  defaultValue={editingPlayer.status}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="injured">Injured</option>
                  <option value="away">Away</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPlayer(null);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
