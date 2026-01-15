import { useState, useEffect } from 'react';
import { Plus, X, Search, Edit2, Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Exercise {
  id: string;
  name: string;
  equipment: string[];
  setup: string;
  description: string;
  variations: string;
  intensity: 'Low' | 'Medium' | 'High';
  goalkeepers: number;
  coachingPoints: string;
  linkedPrinciples?: string[];
  linkedBasics?: string[];
  mediaUrl?: string;
  mediaType?: 'image' | 'pdf' | 'video';
  isCustom: boolean;
}

interface Basic {
  id: string;
  name: string;
}

interface Principle {
  id: string;
  name: string;
}

interface Tactic {
  id: string;
  name: string;
}

const equipmentOptions = [
  'Balls',
  'Cones',
  'Bibs/Vests',
  'Goals',
  'Hurdles',
  'Poles',
  'Agility Ladder',
  'Markers',
  'Mannequins',
  'Mini Goals'
];

const mockExercises: Exercise[] = [
  {
    id: 'ex1',
    name: 'Rondo 4v2',
    equipment: ['Balls', 'Cones', 'Bibs/Vests'],
    setup: 'Create a 10x10 yard square with cones. 4 players on the outside, 2 defenders in the middle.',
    description: 'Possession drill where 4 attackers maintain possession against 2 defenders in a confined space.',
    variations: 'Increase to 5v2 or 6v2, reduce space, add 2-touch limit, or require one-touch play.',
    intensity: 'Medium',
    goalkeepers: 0,
    coachingPoints: 'Quick movement off the ball, body shape to receive, quality of first touch, communication.',
    isCustom: false
  },
  {
    id: 'ex2',
    name: 'Finishing in the Box',
    equipment: ['Balls', 'Goals', 'Cones'],
    setup: 'Set up crosses from both flanks into the penalty box. Position players at various spots in the box.',
    description: 'Players practice finishing from crosses delivered from wide positions.',
    variations: 'Change crossing positions, add defenders, vary delivery (ground/air), goalkeeper opposition.',
    intensity: 'High',
    goalkeepers: 1,
    coachingPoints: 'Timing of run, body position, technique selection (volley/header), anticipation.',
    isCustom: false
  }
];

export default function ExercisesLibrary() {
  const [exercises, setExercises] = useState<Exercise[]>(mockExercises);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  
  // Search states for multi-selects
  const [basicsSearch, setBasicsSearch] = useState('');
  const [principlesSearch, setPrinciplesSearch] = useState('');
  const [tacticsSearch, setTacticsSearch] = useState('');

  // Form state
  const [formData, setFormData] = useState<Partial<Exercise>>({
    name: '',
    equipment: [],
    setup: '',
    description: '',
    variations: '',
    intensity: 'Medium',
    goalkeepers: 0,
    coachingPoints: '',
    linkedPrinciples: [],
    linkedBasics: []
  });

  // Load exercises from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('exercises');
    if (saved) {
      const parsed = JSON.parse(saved);
      setExercises([...mockExercises, ...parsed.filter((ex: Exercise) => ex.isCustom)]);
    }

    // Load basics, principles, and tactics from localStorage
    const savedBasics = localStorage.getItem('customBasics');
    if (savedBasics) {
      const parsedBasics = JSON.parse(savedBasics);
      setAvailableBasics([...availableBasics, ...parsedBasics.map((b: any) => ({ id: b.id, name: b.name }))]);
    }

    const savedPrinciples = localStorage.getItem('customPrinciples');
    if (savedPrinciples) {
      const parsedPrinciples = JSON.parse(savedPrinciples);
      setAvailablePrinciples([...availablePrinciples, ...parsedPrinciples.map((p: any) => ({ id: p.id, name: p.name }))]);
    }

    const savedTactics = localStorage.getItem('customTactics');
    if (savedTactics) {
      const parsedTactics = JSON.parse(savedTactics);
      setAvailableTactics([...availableTactics, ...parsedTactics.map((t: any) => ({ id: t.id, name: t.name }))]);
    }
  }, []);

  // Save exercises to localStorage
  useEffect(() => {
    const customExercises = exercises.filter(ex => ex.isCustom);
    localStorage.setItem('exercises', JSON.stringify(customExercises));
  }, [exercises]);

  // Mock data - in real app, load from localStorage or API
  const [availableBasics, setAvailableBasics] = useState<Basic[]>([
    { id: 'b1', name: 'Passing Accuracy' },
    { id: 'b2', name: 'Ball Control' },
    { id: 'b3', name: 'Shooting Technique' }
  ]);

  const [availablePrinciples, setAvailablePrinciples] = useState<Principle[]>([
    { id: 'p1', name: 'Possession-Based Play' },
    { id: 'p2', name: 'High Pressing' },
    { id: 'p3', name: 'Quick Transitions' }
  ]);

  const [availableTactics, setAvailableTactics] = useState<Tactic[]>([
    { id: 't1', name: 'Counter-Attack' },
    { id: 't2', name: 'Defensive Shape' },
    { id: 't3', name: 'Offside Trap' }
  ]);

  const filteredExercises = exercises.filter(ex =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateExercise = () => {
    if (!formData.name || !formData.description) {
      toast.error('Please fill in required fields');
      return;
    }

    const newExercise: Exercise = {
      id: `custom-${Date.now()}`,
      name: formData.name,
      equipment: formData.equipment || [],
      setup: formData.setup || '',
      description: formData.description || '',
      variations: formData.variations || '',
      intensity: formData.intensity || 'Medium',
      goalkeepers: formData.goalkeepers || 0,
      coachingPoints: formData.coachingPoints || '',
      linkedPrinciples: formData.linkedPrinciples || [],
      linkedBasics: formData.linkedBasics || [],
      mediaUrl: mediaPreview || undefined,
      isCustom: true
    };

    setExercises([...exercises, newExercise]);
    toast.success('Exercise created successfully!');
    resetForm();
  };

  const handleEditExercise = () => {
    if (!formData.name || !formData.description || !selectedExercise) {
      toast.error('Please fill in required fields');
      return;
    }

    const updatedExercise: Exercise = {
      ...selectedExercise,
      name: formData.name,
      equipment: formData.equipment || [],
      setup: formData.setup || '',
      description: formData.description || '',
      variations: formData.variations || '',
      intensity: formData.intensity || 'Medium',
      goalkeepers: formData.goalkeepers || 0,
      coachingPoints: formData.coachingPoints || '',
      linkedPrinciples: formData.linkedPrinciples || [],
      linkedBasics: formData.linkedBasics || [],
      mediaUrl: mediaPreview || selectedExercise.mediaUrl
    };

    setExercises(exercises.map(ex => ex.id === selectedExercise.id ? updatedExercise : ex));
    setSelectedExercise(updatedExercise);
    toast.success('Exercise updated successfully!');
    setIsEditing(false);
    setMediaPreview(null);
  };

  const handleDeleteExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
    setSelectedExercise(null);
    toast.success('Exercise deleted successfully!');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      equipment: [],
      setup: '',
      description: '',
      variations: '',
      intensity: 'Medium',
      goalkeepers: 0,
      coachingPoints: '',
      linkedPrinciples: [],
      linkedBasics: []
    });
    setMediaPreview(null);
    setShowCreateModal(false);
  };

  const startEditing = (exercise: Exercise) => {
    setFormData({
      name: exercise.name,
      equipment: exercise.equipment,
      setup: exercise.setup,
      description: exercise.description,
      variations: exercise.variations,
      intensity: exercise.intensity,
      goalkeepers: exercise.goalkeepers,
      coachingPoints: exercise.coachingPoints,
      linkedPrinciples: exercise.linkedPrinciples || [],
      linkedBasics: exercise.linkedBasics || []
    });
    setMediaPreview(exercise.mediaUrl || null);
    setIsEditing(true);
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

  const toggleEquipment = (item: string) => {
    const current = formData.equipment || [];
    if (current.includes(item)) {
      setFormData({ ...formData, equipment: current.filter(e => e !== item) });
    } else {
      setFormData({ ...formData, equipment: [...current, item] });
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'Low': return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
      case 'Medium': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300';
      case 'High': return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-gray-900 dark:text-gray-100 mb-2">Exercises Library</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage training exercises and drills</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Exercise
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
            placeholder="Search exercises..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Exercises List */}
      <div className="grid grid-cols-2 gap-6">
        {filteredExercises.map((exercise) => (
          <button
            key={exercise.id}
            onClick={() => setSelectedExercise(exercise)}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer text-left"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg text-gray-900 dark:text-gray-100 flex-1">{exercise.name}</h3>
              <span className={`px-2 py-1 rounded text-xs ${getIntensityColor(exercise.intensity)}`}>
                {exercise.intensity}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{exercise.description}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {exercise.equipment.slice(0, 3).map((item, idx) => (
                <span key={idx} className="px-2 py-1 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">
                  {item}
                </span>
              ))}
              {exercise.equipment.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">+{exercise.equipment.length - 3} more</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedExercise && !isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-gray-900 dark:text-gray-100">{selectedExercise.name}</h2>
              <div className="flex items-center gap-2">
                {selectedExercise.isCustom && (
                  <>
                    <button
                      onClick={() => startEditing(selectedExercise)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteExercise(selectedExercise.id)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 dark:text-gray-300" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Intensity</h4>
                  <span className={`inline-block px-3 py-1 rounded text-sm ${getIntensityColor(selectedExercise.intensity)}`}>
                    {selectedExercise.intensity}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Goalkeepers</h4>
                  <p className="text-gray-900 dark:text-gray-100">{selectedExercise.goalkeepers}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Description</h4>
                <p className="text-gray-900 dark:text-gray-100 leading-relaxed">{selectedExercise.description}</p>
              </div>

              <div>
                <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Equipment</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedExercise.equipment.map((item, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Setup</h4>
                <p className="text-gray-900 dark:text-gray-100 leading-relaxed">{selectedExercise.setup}</p>
              </div>

              <div>
                <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Variations</h4>
                <p className="text-gray-900 dark:text-gray-100 leading-relaxed">{selectedExercise.variations}</p>
              </div>

              <div>
                <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Coaching Points</h4>
                <p className="text-gray-900 dark:text-gray-100 leading-relaxed">{selectedExercise.coachingPoints}</p>
              </div>

              {selectedExercise.mediaUrl && (
                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Media</h4>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <img src={selectedExercise.mediaUrl} alt="Exercise media" className="w-full h-64 object-cover" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || isEditing) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-gray-900 dark:text-gray-100">
                {isEditing ? 'Edit Exercise' : 'Create New Exercise'}
              </h2>
              <button
                onClick={() => {
                  if (isEditing) {
                    setIsEditing(false);
                    setMediaPreview(null);
                  } else {
                    resetForm();
                  }
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 dark:text-gray-300" />
              </button>
            </div>

            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); isEditing ? handleEditExercise() : handleCreateExercise(); }}>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Exercise Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Rondo 4v2"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Equipment</label>
                <div className="flex flex-wrap gap-2">
                  {equipmentOptions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleEquipment(item)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        formData.equipment?.includes(item)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Intensity *</label>
                  <select
                    value={formData.intensity}
                    onChange={(e) => setFormData({ ...formData, intensity: e.target.value as 'Low' | 'Medium' | 'High' })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Goalkeepers</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.goalkeepers}
                    onChange={(e) => setFormData({ ...formData, goalkeepers: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the exercise..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Setup</label>
                <textarea
                  value={formData.setup}
                  onChange={(e) => setFormData({ ...formData, setup: e.target.value })}
                  placeholder="How to set up the exercise..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Variations</label>
                <textarea
                  value={formData.variations}
                  onChange={(e) => setFormData({ ...formData, variations: e.target.value })}
                  placeholder="Different ways to run the exercise..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Coaching Points</label>
                <textarea
                  value={formData.coachingPoints}
                  onChange={(e) => setFormData({ ...formData, coachingPoints: e.target.value })}
                  placeholder="Key points to emphasize..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Related Basics (Optional) {formData.linkedBasics && formData.linkedBasics.length > 0 && (
                    <span className="text-blue-600 dark:text-blue-400">({formData.linkedBasics.length} selected)</span>
                  )}
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <div className="p-2 border-b border-gray-300 dark:border-gray-600">
                    <div className="relative">
                      <Search className="w-3 h-3 text-gray-400 dark:text-gray-500 absolute left-2 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={basicsSearch}
                        onChange={(e) => setBasicsSearch(e.target.value)}
                        placeholder="Search basics..."
                        className="w-full pl-7 pr-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="p-3 max-h-40 overflow-y-auto">
                    {availableBasics
                      .filter(basic => basic.name.toLowerCase().includes(basicsSearch.toLowerCase()))
                      .map((basic) => (
                        <label key={basic.id} className="flex items-center gap-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.linkedBasics?.includes(basic.id) || false}
                            onChange={(e) => {
                              const current = formData.linkedBasics || [];
                              if (e.target.checked) {
                                setFormData({ ...formData, linkedBasics: [...current, basic.id] });
                              } else {
                                setFormData({ ...formData, linkedBasics: current.filter(id => id !== basic.id) });
                              }
                            }}
                            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-900 dark:text-gray-100">{basic.name}</span>
                        </label>
                      ))}
                    {availableBasics.filter(basic => basic.name.toLowerCase().includes(basicsSearch.toLowerCase())).length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">No basics found</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Related Principles (Optional) {formData.linkedPrinciples && formData.linkedPrinciples.length > 0 && (
                    <span className="text-blue-600 dark:text-blue-400">({formData.linkedPrinciples.length} selected)</span>
                  )}
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <div className="p-2 border-b border-gray-300 dark:border-gray-600">
                    <div className="relative">
                      <Search className="w-3 h-3 text-gray-400 dark:text-gray-500 absolute left-2 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={principlesSearch}
                        onChange={(e) => setPrinciplesSearch(e.target.value)}
                        placeholder="Search principles..."
                        className="w-full pl-7 pr-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="p-3 max-h-40 overflow-y-auto">
                    {availablePrinciples
                      .filter(principle => principle.name.toLowerCase().includes(principlesSearch.toLowerCase()))
                      .map((principle) => (
                        <label key={principle.id} className="flex items-center gap-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.linkedPrinciples?.includes(principle.id) || false}
                            onChange={(e) => {
                              const current = formData.linkedPrinciples || [];
                              if (e.target.checked) {
                                setFormData({ ...formData, linkedPrinciples: [...current, principle.id] });
                              } else {
                                setFormData({ ...formData, linkedPrinciples: current.filter(id => id !== principle.id) });
                              }
                            }}
                            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-900 dark:text-gray-100">{principle.name}</span>
                        </label>
                      ))}
                    {availablePrinciples.filter(principle => principle.name.toLowerCase().includes(principlesSearch.toLowerCase())).length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">No principles found</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Related Tactics (Optional) {formData.linkedBasics?.filter(id => availableTactics.some(t => t.id === id)).length > 0 && (
                    <span className="text-blue-600 dark:text-blue-400">({formData.linkedBasics?.filter(id => availableTactics.some(t => t.id === id)).length} selected)</span>
                  )}
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
                  <div className="p-2 border-b border-gray-300 dark:border-gray-600">
                    <div className="relative">
                      <Search className="w-3 h-3 text-gray-400 dark:text-gray-500 absolute left-2 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={tacticsSearch}
                        onChange={(e) => setTacticsSearch(e.target.value)}
                        placeholder="Search tactics..."
                        className="w-full pl-7 pr-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="p-3 max-h-40 overflow-y-auto">
                    {availableTactics
                      .filter(tactic => tactic.name.toLowerCase().includes(tacticsSearch.toLowerCase()))
                      .map((tactic) => (
                        <label key={tactic.id} className="flex items-center gap-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(formData.linkedBasics?.includes(tactic.id) || false)}
                            onChange={(e) => {
                              const current = formData.linkedBasics || [];
                              if (e.target.checked) {
                                setFormData({ ...formData, linkedBasics: [...current, tactic.id] });
                              } else {
                                setFormData({ ...formData, linkedBasics: current.filter(id => id !== tactic.id) });
                              }
                            }}
                            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-900 dark:text-gray-100">{tactic.name}</span>
                        </label>
                      ))}
                    {availableTactics.filter(tactic => tactic.name.toLowerCase().includes(tacticsSearch.toLowerCase())).length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">No tactics found</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Media (Optional)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*,video/*,.pdf"
                    onChange={handleMediaUpload}
                    className="hidden"
                    id="media-upload"
                  />
                  <label
                    htmlFor="media-upload"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Upload File
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
                    <img src={mediaPreview} alt="Preview" className="w-full h-48 object-cover" />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    if (isEditing) {
                      setIsEditing(false);
                      setMediaPreview(null);
                    } else {
                      resetForm();
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isEditing ? 'Update Exercise' : 'Create Exercise'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}