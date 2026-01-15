import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Save, X, Edit2, BookOpen, Lightbulb, Trophy, Calendar, Search } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Item {
  id: string;
  name: string;
  description: string;
  type: 'basic' | 'principle' | 'tactic';
  difficulty?: string;
  notes?: string;
  diagramUrl?: string;
}

interface TrainingPlan {
  id: string;
  name: string;
  description: string;
  basics: Item[];
  principles: Item[];
  tactics: Item[];
  createdAt: string;
  isCustom: boolean;
}

const mockBasics: Item[] = [
  { id: 'b1', name: 'Passing Accuracy', description: 'Focus on short and long passing techniques', type: 'basic', difficulty: 'Beginner' },
  { id: 'b2', name: 'Ball Control', description: 'First touch and dribbling fundamentals', type: 'basic', difficulty: 'Beginner' },
  { id: 'b3', name: 'Shooting Technique', description: 'Proper shooting form and power', type: 'basic', difficulty: 'Intermediate' },
  { id: 'b4', name: 'Heading', description: 'Defensive and attacking headers', type: 'basic', difficulty: 'Intermediate' },
];

const mockPrinciples: Item[] = [
  { id: 'p1', name: 'Possession-Based Play', description: 'Maintain control of the ball to dominate the game', type: 'principle', notes: 'Emphasize patience and composure' },
  { id: 'p2', name: 'High Pressing', description: 'Win the ball back quickly in opponent\'s half', type: 'principle', notes: 'Requires fitness and coordination' },
  { id: 'p3', name: 'Quick Transitions', description: 'Rapid switch from defense to attack', type: 'principle', notes: 'Focus on speed of thought' },
];

const mockTactics: Item[] = [
  { id: 't1', name: '4-4-2 Formation', description: 'Classic balanced formation', type: 'tactic', notes: 'Strong in both defense and attack' },
  { id: 't2', name: '4-3-3 Attack', description: 'Offensive formation with wide play', type: 'tactic', notes: 'Ideal for possession teams' },
  { id: 't3', name: 'Counter-Attack', description: 'Fast breaks after winning possession', type: 'tactic', notes: 'Requires pace and precision' },
];

export default function TrainingPlans() {
  const [basicsExpanded, setBasicsExpanded] = useState(true);
  const [principlesExpanded, setPrinciplesExpanded] = useState(true);
  const [tacticsExpanded, setTacticsExpanded] = useState(true);
  const [selectedBasics, setSelectedBasics] = useState<Item[]>([]);
  const [selectedPrinciples, setSelectedPrinciples] = useState<Item[]>([]);
  const [selectedTactics, setSelectedTactics] = useState<Item[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [trainingName, setTrainingName] = useState('');
  const [trainingDescription, setTrainingDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TrainingPlan | null>(null);
  
  // Search states
  const [basicsSearch, setBasicsSearch] = useState('');
  const [principlesSearch, setPrinciplesSearch] = useState('');
  const [tacticsSearch, setTacticsSearch] = useState('');

  // Load training plans from localStorage on mount
  useEffect(() => {
    const savedPlans = localStorage.getItem('trainingPlans');
    if (savedPlans) {
      setTrainingPlans(JSON.parse(savedPlans));
    }
  }, []);

  // Save training plans to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('trainingPlans', JSON.stringify(trainingPlans));
  }, [trainingPlans]);

  // Load custom basics, principles, and tactics from localStorage
  const [customBasics, setCustomBasics] = useState<Item[]>([]);
  const [customPrinciples, setCustomPrinciples] = useState<Item[]>([]);
  const [customTactics, setCustomTactics] = useState<Item[]>([]);

  useEffect(() => {
    const savedBasics = localStorage.getItem('customBasics');
    if (savedBasics) {
      const parsedBasics = JSON.parse(savedBasics);
      setCustomBasics(parsedBasics.map((b: any) => ({ ...b, type: 'basic' as const })));
    }

    const savedPrinciples = localStorage.getItem('customPrinciples');
    if (savedPrinciples) {
      const parsedPrinciples = JSON.parse(savedPrinciples);
      setCustomPrinciples(parsedPrinciples.map((p: any) => ({ ...p, type: 'principle' as const })));
    }

    const savedTactics = localStorage.getItem('customTactics');
    if (savedTactics) {
      const parsedTactics = JSON.parse(savedTactics);
      setCustomTactics(parsedTactics.map((t: any) => ({ ...t, type: 'tactic' as const })));
    }
  }, []);

  const allBasics = [...mockBasics, ...customBasics];
  const allPrinciples = [...mockPrinciples, ...customPrinciples];
  const allTactics = [...mockTactics, ...customTactics];

  const toggleBasicSelection = (item: Item) => {
    if (selectedBasics.find(b => b.id === item.id)) {
      setSelectedBasics(selectedBasics.filter(b => b.id !== item.id));
    } else {
      setSelectedBasics([...selectedBasics, item]);
    }
  };

  const togglePrincipleSelection = (item: Item) => {
    if (selectedPrinciples.find(p => p.id === item.id)) {
      setSelectedPrinciples(selectedPrinciples.filter(p => p.id !== item.id));
    } else {
      setSelectedPrinciples([...selectedPrinciples, item]);
    }
  };

  const toggleTacticSelection = (item: Item) => {
    if (selectedTactics.find(t => t.id === item.id)) {
      setSelectedTactics(selectedTactics.filter(t => t.id !== item.id));
    } else {
      setSelectedTactics([...selectedTactics, item]);
    }
  };

  const handleCreateTraining = () => {
    if (selectedBasics.length === 0 && selectedPrinciples.length === 0 && selectedTactics.length === 0) {
      toast.error('Please select at least one item');
      return;
    }
    setShowCreateModal(true);
  };

  const handleSaveTraining = () => {
    if (!trainingName.trim()) {
      toast.error('Please enter a training plan name');
      return;
    }

    const newPlan: TrainingPlan = {
      id: Date.now().toString(),
      name: trainingName,
      description: trainingDescription,
      basics: selectedBasics,
      principles: selectedPrinciples,
      tactics: selectedTactics,
      createdAt: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      isCustom: true,
    };

    setTrainingPlans([newPlan, ...trainingPlans]);
    toast.success('Training plan created successfully!');
    setShowCreateModal(false);
    setTrainingName('');
    setTrainingDescription('');
    setSelectedBasics([]);
    setSelectedPrinciples([]);
    setSelectedTactics([]);
    setActiveTab('manage');
  };

  const handleDeletePlan = (planId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTrainingPlans(trainingPlans.filter(p => p.id !== planId));
    if (selectedPlan?.id === planId) {
      setSelectedPlan(null);
    }
    toast.success('Training plan deleted');
  };

  const handleEditPlan = (plan: TrainingPlan, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPlan(plan);
    setSelectedBasics(plan.basics);
    setSelectedPrinciples(plan.principles);
    setSelectedTactics(plan.tactics);
    setTrainingName(plan.name);
    setTrainingDescription(plan.description);
    setIsEditing(true);
    setActiveTab('create');
  };

  const handleUpdateTraining = () => {
    if (!trainingName.trim()) {
      toast.error('Please enter a training plan name');
      return;
    }

    if (!editingPlan) return;

    const updatedPlan: TrainingPlan = {
      ...editingPlan,
      name: trainingName,
      description: trainingDescription,
      basics: selectedBasics,
      principles: selectedPrinciples,
      tactics: selectedTactics,
    };

    setTrainingPlans(trainingPlans.map(p => p.id === editingPlan.id ? updatedPlan : p));
    toast.success('Training plan updated successfully!');
    setIsEditing(false);
    setEditingPlan(null);
    setTrainingName('');
    setTrainingDescription('');
    setSelectedBasics([]);
    setSelectedPrinciples([]);
    setSelectedTactics([]);
    setActiveTab('manage');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingPlan(null);
    setTrainingName('');
    setTrainingDescription('');
    setSelectedBasics([]);
    setSelectedPrinciples([]);
    setSelectedTactics([]);
  };

  const isItemSelected = (item: Item, type: 'basic' | 'principle' | 'tactic') => {
    switch (type) {
      case 'basic':
        return selectedBasics.some(b => b.id === item.id);
      case 'principle':
        return selectedPrinciples.some(p => p.id === item.id);
      case 'tactic':
        return selectedTactics.some(t => t.id === item.id);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'basic': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/30';
      case 'principle': return 'border-l-purple-500 bg-purple-50 dark:bg-purple-950/30';
      case 'tactic': return 'border-l-green-500 bg-green-50 dark:bg-green-950/30';
      default: return 'border-l-gray-500';
    }
  };

  const totalSelected = selectedBasics.length + selectedPrinciples.length + selectedTactics.length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl text-gray-900 dark:text-gray-100 mb-2">Training Plans</h1>
          <p className="text-gray-600 dark:text-gray-400">Create and manage reusable training plans</p>
        </div>
        {activeTab === 'create' && !isEditing && (
          <button
            onClick={handleCreateTraining}
            disabled={totalSelected === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            Create Training Plan
          </button>
        )}
        {isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancelEdit}
              className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleUpdateTraining}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Update Training Plan
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setActiveTab('create')}
          className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'create'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Plus className="w-4 h-4" />
          {isEditing ? 'Edit Plan' : 'Create Plan'}
        </button>
        <button
          onClick={() => {
            setActiveTab('manage');
            if (isEditing) {
              handleCancelEdit();
            }
          }}
          className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'manage'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Manage Plans
          {trainingPlans.length > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs">
              {trainingPlans.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'create' ? (
        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel - Selection Lists */}
          <div className="col-span-4 space-y-4">
            {/* Basics */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setBasicsExpanded(!basicsExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {basicsExpanded ? <ChevronDown className="w-5 h-5 dark:text-gray-300" /> : <ChevronRight className="w-5 h-5 dark:text-gray-300" />}
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-gray-900 dark:text-gray-100">Basics</h3>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">
                    {selectedBasics.length}/{allBasics.length}
                  </span>
                </div>
              </button>
              {basicsExpanded && (
                <div className="p-4 pt-0 space-y-2 max-h-64 overflow-y-auto">
                  <div className="relative mb-3">
                    <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      value={basicsSearch}
                      onChange={(e) => setBasicsSearch(e.target.value)}
                      placeholder="Search basics..."
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {allBasics
                    .filter(item => item.name.toLowerCase().includes(basicsSearch.toLowerCase()) || item.description.toLowerCase().includes(basicsSearch.toLowerCase()))
                    .map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleBasicSelection(item)}
                        className={`border-l-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all ${
                          getTypeColor(item.type)
                        } ${
                          isItemSelected(item, 'basic') ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm text-gray-900 dark:text-gray-100 mb-1 truncate">{item.name}</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{item.description}</p>
                          </div>
                          {isItemSelected(item, 'basic') && (
                            <div className="w-5 h-5 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Principles */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setPrinciplesExpanded(!principlesExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {principlesExpanded ? <ChevronDown className="w-5 h-5 dark:text-gray-300" /> : <ChevronRight className="w-5 h-5 dark:text-gray-300" />}
                  <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-gray-900 dark:text-gray-100">Principles</h3>
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-xs">
                    {selectedPrinciples.length}/{allPrinciples.length}
                  </span>
                </div>
              </button>
              {principlesExpanded && (
                <div className="p-4 pt-0 space-y-2 max-h-64 overflow-y-auto">
                  <div className="relative mb-3">
                    <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      value={principlesSearch}
                      onChange={(e) => setPrinciplesSearch(e.target.value)}
                      placeholder="Search principles..."
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {allPrinciples
                    .filter(item => item.name.toLowerCase().includes(principlesSearch.toLowerCase()) || item.description.toLowerCase().includes(principlesSearch.toLowerCase()))
                    .map((item) => (
                      <div
                        key={item.id}
                        onClick={() => togglePrincipleSelection(item)}
                        className={`border-l-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all ${
                          getTypeColor(item.type)
                        } ${
                          isItemSelected(item, 'principle') ? 'ring-2 ring-purple-500 dark:ring-purple-400' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm text-gray-900 dark:text-gray-100 mb-1 truncate">{item.name}</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{item.description}</p>
                          </div>
                          {isItemSelected(item, 'principle') && (
                            <div className="w-5 h-5 bg-purple-600 dark:bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Tactics */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setTacticsExpanded(!tacticsExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {tacticsExpanded ? <ChevronDown className="w-5 h-5 dark:text-gray-300" /> : <ChevronRight className="w-5 h-5 dark:text-gray-300" />}
                  <Trophy className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h3 className="text-gray-900 dark:text-gray-100">Tactics</h3>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs">
                    {selectedTactics.length}/{allTactics.length}
                  </span>
                </div>
              </button>
              {tacticsExpanded && (
                <div className="p-4 pt-0 space-y-2 max-h-64 overflow-y-auto">
                  <div className="relative mb-3">
                    <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      value={tacticsSearch}
                      onChange={(e) => setTacticsSearch(e.target.value)}
                      placeholder="Search tactics..."
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {allTactics
                    .filter(item => item.name.toLowerCase().includes(tacticsSearch.toLowerCase()) || item.description.toLowerCase().includes(tacticsSearch.toLowerCase()))
                    .map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleTacticSelection(item)}
                        className={`border-l-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all ${
                          getTypeColor(item.type)
                        } ${
                          isItemSelected(item, 'tactic') ? 'ring-2 ring-green-500 dark:ring-green-400' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm text-gray-900 dark:text-gray-100 mb-1 truncate">{item.name}</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{item.description}</p>
                          </div>
                          {isItemSelected(item, 'tactic') && (
                            <div className="w-5 h-5 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Selected Items Preview */}
          <div className="col-span-8">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-gray-900 dark:text-gray-100 mb-1">Selected Items</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Choose items from the left to build your training plan</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Items</p>
                  <p className="text-2xl text-gray-900 dark:text-gray-100">{totalSelected}</p>
                </div>
              </div>

              <div className="min-h-[500px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 space-y-4">
                {totalSelected === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Select items from the left to create your training plan</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {selectedBasics.length > 0 && (
                      <div>
                        <h4 className="text-sm text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          Basics ({selectedBasics.length})
                        </h4>
                        <div className="space-y-2">
                          {selectedBasics.map((item) => (
                            <div key={item.id} className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                              <h5 className="text-sm text-gray-900 dark:text-gray-100 mb-1">{item.name}</h5>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{item.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedPrinciples.length > 0 && (
                      <div>
                        <h4 className="text-sm text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          Principles ({selectedPrinciples.length})
                        </h4>
                        <div className="space-y-2">
                          {selectedPrinciples.map((item) => (
                            <div key={item.id} className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                              <h5 className="text-sm text-gray-900 dark:text-gray-100 mb-1">{item.name}</h5>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{item.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedTactics.length > 0 && (
                      <div>
                        <h4 className="text-sm text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-green-600 dark:text-green-400" />
                          Tactics ({selectedTactics.length})
                        </h4>
                        <div className="space-y-2">
                          {selectedTactics.map((item) => (
                            <div key={item.id} className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3">
                              <h5 className="text-sm text-gray-900 dark:text-gray-100 mb-1">{item.name}</h5>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{item.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-gray-900 dark:text-gray-100 mb-4">Your Training Plans</h3>
          {trainingPlans.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No training plans created yet</p>
              <button
                onClick={() => setActiveTab('create')}
                className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
              >
                Create your first training plan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trainingPlans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(selectedPlan?.id === plan.id ? null : plan)}
                  className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-gray-900 dark:text-gray-100 font-medium">{plan.name}</h4>
                    <div className="flex items-center gap-1">
                      {plan.isCustom && (
                        <button
                          onClick={(e) => handleEditPlan(plan, e)}
                          className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDeletePlan(plan.id, e)}
                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {plan.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{plan.description}</p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap text-xs mb-2">
                    {plan.basics.length > 0 && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                        {plan.basics.length} Basics
                      </span>
                    )}
                    {plan.principles.length > 0 && (
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded">
                        {plan.principles.length} Principles
                      </span>
                    )}
                    {plan.tactics.length > 0 && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                        {plan.tactics.length} Tactics
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-500">{plan.createdAt}</p>

                  {selectedPlan?.id === plan.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                      {plan.basics.length > 0 && (
                        <div>
                          <h5 className="text-xs text-gray-500 dark:text-gray-400 mb-1">Basics</h5>
                          <div className="space-y-1">
                            {plan.basics.map((item) => (
                              <div key={item.id} className="text-xs text-gray-700 dark:text-gray-300">• {item.name}</div>
                            ))}
                          </div>
                        </div>
                      )}
                      {plan.principles.length > 0 && (
                        <div>
                          <h5 className="text-xs text-gray-500 dark:text-gray-400 mb-1">Principles</h5>
                          <div className="space-y-1">
                            {plan.principles.map((item) => (
                              <div key={item.id} className="text-xs text-gray-700 dark:text-gray-300">• {item.name}</div>
                            ))}
                          </div>
                        </div>
                      )}
                      {plan.tactics.length > 0 && (
                        <div>
                          <h5 className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tactics</h5>
                          <div className="space-y-1">
                            {plan.tactics.map((item) => (
                              <div key={item.id} className="text-xs text-gray-700 dark:text-gray-300">• {item.name}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create/Save Training Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-gray-900 dark:text-gray-100">Create Training Plan</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 dark:text-gray-300" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Training Plan Name</label>
                <input
                  type="text"
                  value={trainingName}
                  onChange={(e) => setTrainingName(e.target.value)}
                  placeholder="e.g., Attacking Play & Tactics"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Description (Optional)</label>
                <textarea
                  value={trainingDescription}
                  onChange={(e) => setTrainingDescription(e.target.value)}
                  placeholder="Brief description of this training plan..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Basics</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">{selectedBasics.length}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Principles</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">{selectedPrinciples.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tactics</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">{selectedTactics.length}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTraining}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}