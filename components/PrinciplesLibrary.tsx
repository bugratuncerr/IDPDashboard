import { useState } from 'react';
import { Search, Plus, X, Edit2, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface Principle {
  id: string;
  name: string;
  gamePhase: 'In Possession' | 'Transition After Losing Possession' | 'Out of Possession' | 'Transition After Winning Possession' | 'Set Pieces';
  description: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'pdf' | 'video';
}

const mockPrinciples: Principle[] = [
  {
    id: 'p1',
    name: 'Possession-Based Play',
    gamePhase: 'In Possession',
    description: 'Maintain control of the ball to dominate the game. By keeping possession, we dictate the tempo, tire the opposition, and create opportunities through patient build-up play.'
  },
  {
    id: 'p2',
    name: 'High Pressing',
    gamePhase: 'Transition After Losing Possession',
    description: 'Win the ball back quickly in the opponent\'s half. Apply immediate pressure when we lose possession to regain it in dangerous areas and create quick scoring opportunities.'
  },
  {
    id: 'p3',
    name: 'Quick Transitions',
    gamePhase: 'Transition After Winning Possession',
    description: 'Rapid switch from defense to attack. The first few seconds after winning the ball are crucial for creating goal-scoring opportunities.'
  },
  {
    id: 'p4',
    name: 'Defensive Shape',
    gamePhase: 'Out of Possession',
    description: 'Maintain compact and organized defensive structure. Proper positioning and coordination make it difficult for opponents to penetrate and create chances.'
  },
  {
    id: 'p5',
    name: 'Playing Out from the Back',
    gamePhase: 'In Possession',
    description: 'Build attacks from the goalkeeper and defenders. This creates numerical superiority in the first phase and allows better control of the game.'
  },
];

export default function PrinciplesLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrinciple, setSelectedPrinciple] = useState<Principle | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [newPrinciple, setNewPrinciple] = useState({ name: '', gamePhase: 'In Possession', description: '' });
  const [diagramPreview, setDiagramPreview] = useState<string | null>(null);
  const [customPrinciples, setCustomPrinciples] = useState<Principle[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrinciple, setEditedPrinciple] = useState<Principle | null>(null);

  const allPrinciples = [...mockPrinciples, ...customPrinciples];

  const filteredPrinciples = allPrinciples.filter(principle =>
    principle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    principle.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePrinciple = () => {
    if (!newPrinciple.name || !newPrinciple.description) {
      toast.error('Please fill in all fields');
      return;
    }
    
    const createdPrinciple: Principle = {
      id: `custom-${Date.now()}`,
      name: newPrinciple.name,
      gamePhase: newPrinciple.gamePhase,
      description: newPrinciple.description,
      mediaUrl: diagramPreview || undefined,
      mediaType: diagramPreview ? 'image' : undefined,
    };
    
    setCustomPrinciples([...customPrinciples, createdPrinciple]);
    toast.success('Principle created successfully!');
    setShowCreateModal(false);
    setNewPrinciple({ name: '', gamePhase: 'In Possession', description: '' });
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

  const handleEditPrinciple = () => {
    if (!editedPrinciple) return;
    
    const updatedPrinciples = customPrinciples.map(principle =>
      principle.id === editedPrinciple.id ? { ...editedPrinciple, mediaUrl: diagramPreview || editedPrinciple.mediaUrl, mediaType: diagramPreview ? 'image' : editedPrinciple.mediaType } : principle
    );
    
    setCustomPrinciples(updatedPrinciples);
    setSelectedPrinciple({ ...editedPrinciple, mediaUrl: diagramPreview || editedPrinciple.mediaUrl, mediaType: diagramPreview ? 'image' : editedPrinciple.mediaType });
    setIsEditing(false);
    setDiagramPreview(null);
    toast.success('Principle updated successfully!');
  };

  const startEditing = () => {
    if (selectedPrinciple && selectedPrinciple.id.startsWith('custom-')) {
      setEditedPrinciple({ ...selectedPrinciple });
      setDiagramPreview(selectedPrinciple.mediaUrl || null);
      setIsEditing(true);
    } else {
      toast.error('Only custom principles can be edited');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-gray-900 dark:text-gray-100 mb-2">Principles Library</h1>
          <p className="text-gray-600 dark:text-gray-400">Your coaching philosophy and core beliefs</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Principle
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
            placeholder="Search principles..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Principles List */}
      <div className="space-y-4">
        {filteredPrinciples.map((principle) => (
          <button
            key={principle.id}
            onClick={() => setSelectedPrinciple(principle)}
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all cursor-pointer text-left"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg text-gray-900 dark:text-gray-100">{principle.name}</h3>
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-xs">
                    {principle.gamePhase}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{principle.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedPrinciple && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-gray-900 dark:text-gray-100">{selectedPrinciple.name}</h2>
              <div className="flex items-center gap-2">
                {selectedPrinciple.id.startsWith('custom-') && (
                  <button
                    onClick={startEditing}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedPrinciple(null);
                    setEditingNotes(false);
                    setIsEditing(false);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 dark:text-gray-300" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Game Phase</h4>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-sm">
                  {selectedPrinciple.gamePhase}
                </span>
              </div>

              <div>
                <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Description</h4>
                <p className="text-gray-900 dark:text-gray-100 leading-relaxed">{selectedPrinciple.description}</p>
              </div>

              {selectedPrinciple.mediaUrl && (
                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Media</h4>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <img src={selectedPrinciple.mediaUrl} alt={`${selectedPrinciple.name} media`} className="w-full h-64 object-cover" />
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm text-gray-500">Coaching Notes</h4>
                  <button
                    onClick={() => setEditingNotes(!editingNotes)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 className="w-3 h-3" />
                    {editingNotes ? 'Save' : 'Edit'}
                  </button>
                </div>
                {editingNotes ? (
                  <textarea
                    defaultValue={selectedPrinciple.description}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={5}
                    placeholder="Add your coaching notes..."
                  />
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-gray-900">{selectedPrinciple.description}</p>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm text-gray-500 mb-3">Implementation Tips</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-gray-900">Introduce the principle gradually in training sessions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-gray-900">Use video analysis to demonstrate successful application</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-gray-900">Reinforce through consistent messaging and feedback</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-gray-900">Review and adjust based on team performance</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setSelectedPrinciple(null);
                  setEditingNotes(false);
                  setIsEditing(false);
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Principle Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-gray-900 dark:text-gray-100">Create New Principle</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 dark:text-gray-300" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleCreatePrinciple(); }}>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={newPrinciple.name}
                  onChange={(e) => setNewPrinciple({ ...newPrinciple, name: e.target.value })}
                  placeholder="e.g., Counter-Pressing"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Game Phase</label>
                <select
                  value={newPrinciple.gamePhase}
                  onChange={(e) => setNewPrinciple({ ...newPrinciple, gamePhase: e.target.value as 'In Possession' | 'Transition After Losing Possession' | 'Out of Possession' | 'Transition After Winning Possession' | 'Set Pieces' })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="In Possession">In Possession</option>
                  <option value="Transition After Losing Possession">Transition After Losing Possession</option>
                  <option value="Out of Possession">Out of Possession</option>
                  <option value="Transition After Winning Possession">Transition After Winning Possession</option>
                  <option value="Set Pieces">Set Pieces</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  value={newPrinciple.description}
                  onChange={(e) => setNewPrinciple({ ...newPrinciple, description: e.target.value })}
                  placeholder="Describe your coaching philosophy for this principle..."
                  rows={5}
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
                    id="principle-diagram-upload"
                  />
                  <label
                    htmlFor="principle-diagram-upload"
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
                  onClick={() => setShowCreateModal(false)}
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

      {/* Edit Principle Modal */}
      {isEditing && editedPrinciple && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-gray-900">Edit Principle</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleEditPrinciple(); }}>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={editedPrinciple.name}
                  onChange={(e) => setEditedPrinciple({ ...editedPrinciple, name: e.target.value })}
                  placeholder="e.g., Counter-Pressing"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Game Phase</label>
                <select
                  value={editedPrinciple.gamePhase}
                  onChange={(e) => setEditedPrinciple({ ...editedPrinciple, gamePhase: e.target.value as 'In Possession' | 'Transition After Losing Possession' | 'Out of Possession' | 'Transition After Winning Possession' | 'Set Pieces' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="In Possession">In Possession</option>
                  <option value="Transition After Losing Possession">Transition After Losing Possession</option>
                  <option value="Out of Possession">Out of Possession</option>
                  <option value="Transition After Winning Possession">Transition After Winning Possession</option>
                  <option value="Set Pieces">Set Pieces</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Description</label>
                <textarea
                  value={editedPrinciple.description}
                  onChange={(e) => setEditedPrinciple({ ...editedPrinciple, description: e.target.value })}
                  placeholder="Describe your coaching philosophy for this principle..."
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Diagram (Optional)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleDiagramUpload}
                    className="hidden"
                    id="principle-diagram-upload-edit"
                  />
                  <label
                    htmlFor="principle-diagram-upload-edit"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Diagram
                  </label>
                  {diagramPreview && (
                    <button
                      type="button"
                      onClick={() => setDiagramPreview(null)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {diagramPreview && (
                  <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
                    <img src={diagramPreview} alt="Diagram preview" className="w-full h-48 object-cover" />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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