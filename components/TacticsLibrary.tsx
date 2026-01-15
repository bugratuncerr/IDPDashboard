import { useState } from 'react';
import { Search, Plus, X, Clock, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface Tactic {
  id: string;
  name: string;
  formation: string;
  description: string;
  coachingPoints: string[];
  versions: { date: string; notes: string }[];
  diagramUrl?: string;
}

const mockTactics: Tactic[] = [
  {
    id: 't1',
    name: '4-4-2 Formation',
    formation: '4-4-2',
    description: 'Classic balanced formation with two banks of four. Provides solid defensive structure while maintaining attacking threat through two strikers.',
    coachingPoints: [
      'Midfielders must cover wide areas effectively',
      'Strikers should work in partnership',
      'Full-backs provide width in attack',
      'Central midfielders control tempo'
    ],
    versions: [
      { date: '2024-12-15', notes: 'Added focus on wide midfielder pressing triggers' },
      { date: '2024-11-20', notes: 'Initial version created' }
    ]
  },
  {
    id: 't2',
    name: '4-3-3 Attack',
    formation: '4-3-3',
    description: 'Offensive formation emphasizing width and possession. Three forwards stretch the defense while midfield triangle controls the center.',
    coachingPoints: [
      'Wingers stay wide to create space',
      'Central midfielder drops to support build-up',
      'Full-backs push high to overload flanks',
      'False 9 movement pulls defenders out of position'
    ],
    versions: [
      { date: '2024-12-10', notes: 'Modified winger positioning for better pressing' },
      { date: '2024-12-01', notes: 'Initial tactical setup' }
    ]
  },
  {
    id: 't3',
    name: 'Counter-Attack System',
    formation: 'Variable',
    description: 'Defensive solidity with rapid transitions. Absorb pressure then exploit spaces left by opposition with pace and precision.',
    coachingPoints: [
      'Maintain compact defensive shape',
      'Identify transition moments quickly',
      'Forward runs must be timed perfectly',
      'Quick passing into space is essential'
    ],
    versions: [
      { date: '2024-12-05', notes: 'Adjusted defensive line height' }
    ]
  },
  {
    id: 't4',
    name: '3-5-2 System',
    formation: '3-5-2',
    description: 'Three center-backs with wing-backs providing width. Strong in midfield while maintaining defensive security.',
    coachingPoints: [
      'Center-backs must be comfortable on the ball',
      'Wing-backs cover entire flank',
      'Central midfielders create numerical superiority',
      'Strikers press from front together'
    ],
    versions: [
      { date: '2024-12-12', notes: 'Initial version' }
    ]
  },
];

export default function TacticsLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTactic, setSelectedTactic] = useState<Tactic | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTactic, setNewTactic] = useState({ name: '', formation: '', description: '' });
  const [diagramPreview, setDiagramPreview] = useState<string | null>(null);
  const [customTactics, setCustomTactics] = useState<Tactic[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTactic, setEditedTactic] = useState<Tactic | null>(null);

  const allTactics = [...mockTactics, ...customTactics];

  const filteredTactics = allTactics.filter(tactic =>
    tactic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tactic.formation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTactic = () => {
    if (!newTactic.name || !newTactic.formation || !newTactic.description) {
      toast.error('Please fill in all fields');
      return;
    }
    
    const createdTactic: Tactic = {
      id: `custom-${Date.now()}`,
      name: newTactic.name,
      formation: newTactic.formation,
      description: newTactic.description,
      coachingPoints: [],
      versions: [{ 
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), 
        notes: 'Initial version created' 
      }],
      diagramUrl: diagramPreview || undefined,
    };
    
    setCustomTactics([...customTactics, createdTactic]);
    toast.success('Tactic created successfully!');
    setShowCreateModal(false);
    setNewTactic({ name: '', formation: '', description: '' });
    setDiagramPreview(null);
  };

  const handleDiagramUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDiagramPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditTactic = () => {
    if (!editedTactic) return;
    
    if (!editedTactic.name || !editedTactic.formation || !editedTactic.description) {
      toast.error('Please fill in all fields');
      return;
    }
    
    const updatedTactics = customTactics.map(tactic =>
      tactic.id === editedTactic.id ? { ...editedTactic, diagramUrl: diagramPreview || editedTactic.diagramUrl } : tactic
    );
    
    setCustomTactics(updatedTactics);
    setSelectedTactic({ ...editedTactic, diagramUrl: diagramPreview || editedTactic.diagramUrl });
    setIsEditing(false);
    setDiagramPreview(null);
    toast.success('Tactic updated successfully!');
  };

  const startEditing = () => {
    if (selectedTactic && selectedTactic.id.startsWith('custom-')) {
      setEditedTactic({ ...selectedTactic });
      setDiagramPreview(selectedTactic.diagramUrl || null);
      setIsEditing(true);
    } else {
      toast.error('Only custom tactics can be edited');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-gray-900 dark:text-gray-100 mb-2">Tactics Library</h1>
          <p className="text-gray-600 dark:text-gray-400">Formations and tactical systems</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Tactic
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tactics..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tactics Grid */}
      <div className="grid grid-cols-3 gap-6">
        {filteredTactics.map((tactic) => (
          <button
            key={tactic.id}
            onClick={() => setSelectedTactic(tactic)}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg hover:border-green-300 dark:hover:border-green-600 transition-all cursor-pointer"
          >
            <div className="bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900 dark:to-green-800 h-32 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-4xl text-green-700 dark:text-green-300 mb-1">{tactic.formation}</div>
                <div className="text-xs text-green-600 dark:text-green-400">Formation</div>
              </div>
            </div>
            <div className="p-4 text-left">
              <h3 className="text-gray-900 dark:text-gray-100 mb-2">{tactic.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{tactic.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedTactic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl text-gray-900 dark:text-gray-100">{selectedTactic.name}</h2>
                <span className="inline-block mt-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-sm">
                  {selectedTactic.formation}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {selectedTactic.id.startsWith('custom-') && (
                  <button
                    onClick={startEditing}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedTactic(null);
                    setIsEditing(false);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 dark:text-gray-300" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-3">Tactical Diagram</h4>
                  {selectedTactic.diagramUrl ? (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <img src={selectedTactic.diagramUrl} alt={`${selectedTactic.name} diagram`} className="w-full h-80 object-cover" />
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900 dark:to-green-800 border border-green-200 dark:border-green-700 rounded-lg h-80 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl text-green-700 dark:text-green-300 mb-2">{selectedTactic.formation}</div>
                        <div className="text-sm text-green-600 dark:text-green-400">Formation Layout</div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Description</h4>
                  <p className="text-gray-900 dark:text-gray-100">{selectedTactic.description}</p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-3">Coaching Points</h4>
                  <ul className="space-y-2">
                    {selectedTactic.coachingPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                        <span className="text-gray-900 dark:text-gray-100">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Version History
                  </h4>
                  <div className="space-y-3">
                    {selectedTactic.versions.map((version, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{version.date}</span>
                          <span className="text-xs text-blue-600 dark:text-blue-400">v{selectedTactic.versions.length - index}</span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{version.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                  <h4 className="text-sm text-yellow-800 dark:text-yellow-300 mb-2">Suggested Drills</h4>
                  <ul className="text-sm text-yellow-900 dark:text-yellow-200 space-y-1">
                    <li>• Positional rondos</li>
                    <li>• Formation-specific small-sided games</li>
                    <li>• Tactical walk-throughs</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedTactic(null);
                setIsEditing(false);
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-6"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Create Tactic Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-gray-900 dark:text-gray-100">Create New Tactic</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setDiagramPreview(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 dark:text-gray-300" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleCreateTactic(); }}>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={newTactic.name}
                  onChange={(e) => setNewTactic({ ...newTactic, name: e.target.value })}
                  placeholder="e.g., 4-3-3 Attack"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Formation</label>
                <input
                  type="text"
                  value={newTactic.formation}
                  onChange={(e) => setNewTactic({ ...newTactic, formation: e.target.value })}
                  placeholder="e.g., 4-3-3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  value={newTactic.description}
                  onChange={(e) => setNewTactic({ ...newTactic, description: e.target.value })}
                  placeholder="Describe the tactical system..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Diagram (Optional)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleDiagramUpload}
                    className="hidden"
                    id="tactic-diagram-upload"
                  />
                  <label
                    htmlFor="tactic-diagram-upload"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Diagram
                  </label>
                  {diagramPreview && (
                    <button
                      type="button"
                      onClick={() => setDiagramPreview(null)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {diagramPreview && (
                  <div className="mt-3 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <img src={diagramPreview} alt="Diagram preview" className="w-full h-48 object-cover" />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setDiagramPreview(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tactic Modal */}
      {isEditing && editedTactic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-gray-900 dark:text-gray-100">Edit Tactic</h2>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setDiagramPreview(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 dark:text-gray-300" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleEditTactic(); }}>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={editedTactic.name}
                  onChange={(e) => setEditedTactic({ ...editedTactic, name: e.target.value })}
                  placeholder="e.g., 4-3-3 Attack"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Formation</label>
                <input
                  type="text"
                  value={editedTactic.formation}
                  onChange={(e) => setEditedTactic({ ...editedTactic, formation: e.target.value })}
                  placeholder="e.g., 4-3-3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  value={editedTactic.description}
                  onChange={(e) => setEditedTactic({ ...editedTactic, description: e.target.value })}
                  placeholder="Describe the tactical system..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Diagram (Optional)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleDiagramUpload}
                    className="hidden"
                    id="tactic-diagram-upload-edit"
                  />
                  <label
                    htmlFor="tactic-diagram-upload-edit"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Diagram
                  </label>
                  {diagramPreview && (
                    <button
                      type="button"
                      onClick={() => setDiagramPreview(null)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {diagramPreview && (
                  <div className="mt-3 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <img src={diagramPreview} alt="Diagram preview" className="w-full h-48 object-cover" />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setDiagramPreview(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}