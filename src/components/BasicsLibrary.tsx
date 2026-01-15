import { useState } from 'react';
import { Search, Grid, List, Plus, X, Upload, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Basic {
  id: string;
  name: string;
  description: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'pdf' | 'video';
}

const mockBasics: Basic[] = [
  { id: 'b1', name: 'Passing Accuracy', description: 'Develop short and long passing techniques with emphasis on accuracy and weight of pass' },
  { id: 'b2', name: 'Ball Control', description: 'First touch training and close ball control in tight spaces' },
  { id: 'b3', name: 'Shooting Technique', description: 'Proper body positioning, contact point, and follow-through for powerful and accurate shots' },
  { id: 'b4', name: 'Heading', description: 'Defensive and attacking headers with proper timing and technique' },
  { id: 'b5', name: 'Dribbling Skills', description: 'Ball manipulation, changes of direction, and beating defenders 1v1' },
  { id: 'b6', name: 'Defensive Positioning', description: 'Reading the game, maintaining shape, and positioning to intercept or tackle' },
  { id: 'b7', name: 'Crossing', description: 'Delivering accurate crosses from wide positions into dangerous areas' },
  { id: 'b8', name: 'Goalkeeping Basics', description: 'Proper stance, handling, and positioning for goalkeepers' },
];

export default function BasicsLibrary() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBasic, setSelectedBasic] = useState<Basic | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBasic, setNewBasic] = useState({ name: '', description: '' });
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [customBasics, setCustomBasics] = useState<Basic[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBasic, setEditedBasic] = useState<Basic | null>(null);

  const allBasics = [...mockBasics, ...customBasics];

  const filteredBasics = allBasics.filter(basic => {
    const matchesSearch = basic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      basic.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleCreateBasic = () => {
    if (!newBasic.name || !newBasic.description) {
      toast.error('Please fill in all fields');
      return;
    }
    
    const createdBasic: Basic = {
      id: `custom-${Date.now()}`,
      name: newBasic.name,
      description: newBasic.description,
      mediaUrl: mediaPreview || undefined,
      mediaType: mediaPreview ? 'image' : undefined,
    };
    
    setCustomBasics([...customBasics, createdBasic]);
    toast.success('Basic created successfully!');
    setShowCreateModal(false);
    setNewBasic({ name: '', description: '' });
    setMediaPreview(null);
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditBasic = () => {
    if (!editedBasic) return;
    
    const updatedBasics = customBasics.map(basic =>
      basic.id === editedBasic.id ? { ...editedBasic, mediaUrl: mediaPreview || editedBasic.mediaUrl } : basic
    );
    
    setCustomBasics(updatedBasics);
    setSelectedBasic({ ...editedBasic, mediaUrl: mediaPreview || editedBasic.mediaUrl });
    setIsEditing(false);
    setMediaPreview(null);
    toast.success('Basic updated successfully!');
  };

  const startEditing = () => {
    if (selectedBasic && selectedBasic.id.startsWith('custom-')) {
      setEditedBasic({ ...selectedBasic });
      setMediaPreview(selectedBasic.mediaUrl || null);
      setIsEditing(true);
    } else {
      toast.error('Only custom basics can be edited');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-gray-900 dark:text-gray-100 mb-2">Basics Library</h1>
          <p className="text-gray-600 dark:text-gray-400">Fundamental concepts and techniques</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Basic
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search basics..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid/List View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-3 gap-6">
          {filteredBasics.map((basic) => (
            <button
              key={basic.id}
              onClick={() => setSelectedBasic(basic)}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-gray-900 dark:text-gray-100 flex-1">{basic.name}</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">{basic.description}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredBasics.map((basic) => (
              <button
                key={basic.id}
                onClick={() => setSelectedBasic(basic)}
                className="w-full p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-gray-900 dark:text-gray-100">{basic.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{basic.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedBasic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-gray-900 dark:text-gray-100">{selectedBasic.name}</h2>
              <div className="flex items-center gap-2">
                {selectedBasic.id.startsWith('custom-') && (
                  <button
                    onClick={startEditing}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedBasic(null);
                    setIsEditing(false);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 dark:text-gray-300" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Description</h4>
                <p className="text-gray-900 dark:text-gray-100">{selectedBasic.description}</p>
              </div>

              {selectedBasic.mediaUrl && (
                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Media</h4>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <img src={selectedBasic.mediaUrl} alt={`${selectedBasic.name} diagram`} className="w-full h-64 object-cover" />
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Key Points</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-900 dark:text-gray-100">
                  <li>Focus on proper technique and form</li>
                  <li>Build progressively from simple to complex</li>
                  <li>Provide clear demonstrations and feedback</li>
                  <li>Adapt difficulty based on player skill level</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Equipment Needed</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-sm">Balls</span>
                  <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-sm">Cones</span>
                  <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-sm">Training Vests</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedBasic(null);
                  setIsEditing(false);
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Basic Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-gray-900 dark:text-gray-100">Create New Basic</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 dark:text-gray-300" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleCreateBasic(); }}>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={newBasic.name}
                  onChange={(e) => setNewBasic({ ...newBasic, name: e.target.value })}
                  placeholder="e.g., Passing Accuracy"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  value={newBasic.description}
                  onChange={(e) => setNewBasic({ ...newBasic, description: e.target.value })}
                  placeholder="Describe the basic skill or concept..."
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
                    onChange={handleMediaUpload}
                    className="hidden"
                    id="diagram-upload"
                  />
                  <label
                    htmlFor="diagram-upload"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Diagram
                  </label>
                  {mediaPreview && (
                    <button
                      type="button"
                      onClick={() => setMediaPreview(null)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {mediaPreview && (
                  <div className="mt-3 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <img src={mediaPreview} alt="Diagram preview" className="w-full h-48 object-cover" />
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

      {/* Edit Basic Modal */}
      {isEditing && editedBasic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-gray-900 dark:text-gray-100">Edit Basic</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 dark:text-gray-300" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleEditBasic(); }}>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={editedBasic.name}
                  onChange={(e) => setEditedBasic({ ...editedBasic, name: e.target.value })}
                  placeholder="e.g., Passing Accuracy"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  value={editedBasic.description}
                  onChange={(e) => setEditedBasic({ ...editedBasic, description: e.target.value })}
                  placeholder="Describe the basic skill or concept..."
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
                    onChange={handleMediaUpload}
                    className="hidden"
                    id="diagram-upload"
                  />
                  <label
                    htmlFor="diagram-upload"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Diagram
                  </label>
                  {mediaPreview && (
                    <button
                      type="button"
                      onClick={() => setMediaPreview(null)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {mediaPreview && (
                  <div className="mt-3 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <img src={mediaPreview} alt="Diagram preview" className="w-full h-48 object-cover" />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
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