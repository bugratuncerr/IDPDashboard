import { useState, useEffect } from 'react';
import { Trash2, Clock, Save, X, GripVertical, Calendar, History, BookOpen, Lightbulb, Trophy, ChevronDown, Search } from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';
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

interface TimelineItem {
  id: string;
  trainingPlan: TrainingPlan;
  duration: number;
}

interface SavedSession {
  id: string;
  name: string;
  items: TimelineItem[];
  totalDuration: number;
  createdAt: string;
}

interface DraggableTrainingPlanProps {
  plan: TrainingPlan;
  onClick: () => void;
}

function DraggableTrainingPlan({ plan, onClick }: DraggableTrainingPlanProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'training-plan',
    item: { ...plan },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const totalItems = plan.basics.length + plan.principles.length + plan.tactics.length;

  return (
    <div
      ref={drag}
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start gap-2 mb-3">
        <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm text-gray-900 dark:text-gray-100 mb-1 font-medium">{plan.name}</h4>
          {plan.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">{plan.description}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap text-xs">
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
        </div>
      </div>
    </div>
  );
}

interface TimelineCardProps {
  item: TimelineItem;
  index: number;
  onRemove: (index: number) => void;
  onUpdateDuration: (index: number, duration: number) => void;
  onToggleExpand: (index: number) => void;
  isExpanded: boolean;
}

function TimelineCard({ item, index, onRemove, onUpdateDuration, onToggleExpand, isExpanded }: TimelineCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">#{index + 1}</span>
            <h4 className="text-sm text-gray-900 dark:text-gray-100 font-medium">{item.trainingPlan.name}</h4>
            <button
              onClick={() => onToggleExpand(index)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {item.trainingPlan.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{item.trainingPlan.description}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {item.trainingPlan.basics.length > 0 && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                {item.trainingPlan.basics.length} Basics
              </span>
            )}
            {item.trainingPlan.principles.length > 0 && (
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded">
                {item.trainingPlan.principles.length} Principles
              </span>
            )}
            {item.trainingPlan.tactics.length > 0 && (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                {item.trainingPlan.tactics.length} Tactics
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => onRemove(index)}
          className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
          {item.trainingPlan.basics.length > 0 && (
            <div>
              <h5 className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                Basics
              </h5>
              <div className="space-y-1">
                {item.trainingPlan.basics.map((basic) => (
                  <div key={basic.id} className="text-xs text-gray-700 dark:text-gray-300 pl-4">• {basic.name}</div>
                ))}
              </div>
            </div>
          )}
          {item.trainingPlan.principles.length > 0 && (
            <div>
              <h5 className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                <Lightbulb className="w-3 h-3" />
                Principles
              </h5>
              <div className="space-y-1">
                {item.trainingPlan.principles.map((principle) => (
                  <div key={principle.id} className="text-xs text-gray-700 dark:text-gray-300 pl-4">• {principle.name}</div>
                ))}
              </div>
            </div>
          )}
          {item.trainingPlan.tactics.length > 0 && (
            <div>
              <h5 className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                Tactics
              </h5>
              <div className="space-y-1">
                {item.trainingPlan.tactics.map((tactic) => (
                  <div key={tactic.id} className="text-xs text-gray-700 dark:text-gray-300 pl-4">• {tactic.name}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        <input
          type="number"
          value={item.duration}
          onChange={(e) => onUpdateDuration(index, parseInt(e.target.value) || 0)}
          className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="1"
          max="240"
        />
        <span className="text-xs text-gray-500 dark:text-gray-400">minutes</span>
      </div>
    </div>
  );
}

export default function SessionPlanner() {
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [activeTab, setActiveTab] = useState<'build' | 'history'>('build');
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Load training plans from localStorage
  useEffect(() => {
    const savedPlans = localStorage.getItem('trainingPlans');
    if (savedPlans) {
      setTrainingPlans(JSON.parse(savedPlans));
    }
  }, []);

  // Reload training plans when tab becomes active
  useEffect(() => {
    if (activeTab === 'build') {
      const savedPlans = localStorage.getItem('trainingPlans');
      if (savedPlans) {
        setTrainingPlans(JSON.parse(savedPlans));
      }
    }
  }, [activeTab]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'training-plan',
    drop: (plan: TrainingPlan) => {
      const newItem: TimelineItem = {
        id: `${plan.id}-${Date.now()}`,
        trainingPlan: plan,
        duration: 30,
      };
      setTimeline((prev) => [...prev, newItem]);
      toast.success(`Added ${plan.name} to session`);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }), []);

  const removeFromTimeline = (index: number) => {
    setTimeline(timeline.filter((_, i) => i !== index));
    toast.success('Removed from session');
  };

  const updateDuration = (index: number, duration: number) => {
    const updated = [...timeline];
    updated[index] = { ...updated[index], duration };
    setTimeline(updated);
  };

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const totalDuration = timeline.reduce((sum, item) => sum + item.duration, 0);

  const handleSaveSession = () => {
    if (!sessionName.trim()) {
      toast.error('Please enter a session name');
      return;
    }
    const newSession: SavedSession = {
      id: Date.now().toString(),
      name: sessionName,
      items: timeline,
      totalDuration,
      createdAt: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
    };
    setSavedSessions((prev) => [newSession, ...prev]);
    toast.success('Session saved successfully!');
    setShowSaveModal(false);
    setSessionName('');
    setActiveTab('history');
  };

  const handleLoadSession = (session: SavedSession) => {
    setTimeline(session.items);
    setActiveTab('build');
    toast.success(`Loaded session: ${session.name}`);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedSessions((prev) => prev.filter((s) => s.id !== sessionId));
    toast.success('Session deleted');
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl text-gray-900 dark:text-gray-100 mb-2">Session Planner</h1>
          <p className="text-gray-600 dark:text-gray-400">Build training sessions from your training plans</p>
        </div>
        <button
          onClick={() => setShowSaveModal(true)}
          disabled={timeline.length === 0}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          Save Session
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setActiveTab('build')}
          className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'build'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Build Session
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <History className="w-4 h-4" />
          Past Sessions
          {savedSessions.length > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs">
              {savedSessions.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'build' ? (
        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel - Training Plans */}
          <div className="col-span-4 space-y-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <h3 className="text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Available Training Plans
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs ml-auto">
                  {trainingPlans.length}
                </span>
              </h3>
              {trainingPlans.length > 0 && (
                <div className="relative mb-3">
                  <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search training plans..."
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {trainingPlans.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No training plans available</p>
                    <p className="text-xs mt-1">Create training plans in the Training tab</p>
                  </div>
                ) : (
                  trainingPlans
                    .filter((plan) =>
                      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      plan.description.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((plan) => (
                      <DraggableTrainingPlan
                        key={plan.id}
                        plan={plan}
                        onClick={() => setSelectedPlan(selectedPlan?.id === plan.id ? null : plan)}
                      />
                    ))
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Session Timeline */}
          <div className="col-span-8">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-gray-900 dark:text-gray-100 mb-1">Session Timeline</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Drag training plans from the left to build your session</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Duration</p>
                  <p className="text-2xl text-gray-900 dark:text-gray-100">{totalDuration} min</p>
                </div>
              </div>

              <div
                ref={drop}
                className={`min-h-[500px] border-2 border-dashed rounded-lg p-4 space-y-3 transition-colors ${
                  isOver ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {timeline.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                    <div className="text-center">
                      <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Drag training plans here to create your session</p>
                    </div>
                  </div>
                ) : (
                  timeline.map((item, index) => (
                    <TimelineCard
                      key={item.id}
                      item={item}
                      index={index}
                      onRemove={removeFromTimeline}
                      onUpdateDuration={updateDuration}
                      onToggleExpand={toggleExpand}
                      isExpanded={expandedItems.has(index)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-gray-900 dark:text-gray-100 mb-4">Saved Sessions</h3>
          {savedSessions.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No saved sessions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div>
                    <h4 className="text-sm text-gray-900 dark:text-gray-100 font-medium">{session.name}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {session.items.length} training plans - {session.totalDuration} min - {session.createdAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLoadSession(session)}
                      className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Training Plan Detail Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8" onClick={() => setSelectedPlan(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-gray-900 dark:text-gray-100">{selectedPlan.name}</h2>
              <button
                onClick={() => setSelectedPlan(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 dark:text-gray-300" />
              </button>
            </div>

            <div className="space-y-4">
              {selectedPlan.description && (
                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Description</h4>
                  <p className="text-gray-900 dark:text-gray-100">{selectedPlan.description}</p>
                </div>
              )}

              {selectedPlan.basics.length > 0 && (
                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Basics ({selectedPlan.basics.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedPlan.basics.map((item) => (
                      <div key={item.id} className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <h5 className="text-sm text-gray-900 dark:text-gray-100 mb-1">{item.name}</h5>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedPlan.principles.length > 0 && (
                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Principles ({selectedPlan.principles.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedPlan.principles.map((item) => (
                      <div key={item.id} className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                        <h5 className="text-sm text-gray-900 dark:text-gray-100 mb-1">{item.name}</h5>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedPlan.tactics.length > 0 && (
                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Tactics ({selectedPlan.tactics.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedPlan.tactics.map((item) => (
                      <div key={item.id} className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3">
                        <h5 className="text-sm text-gray-900 dark:text-gray-100 mb-1">{item.name}</h5>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const newItem: TimelineItem = {
                      id: `${selectedPlan.id}-${Date.now()}`,
                      trainingPlan: selectedPlan,
                      duration: 30,
                    };
                    setTimeline([...timeline, newItem]);
                    setSelectedPlan(null);
                    toast.success(`Added ${selectedPlan.name} to session`);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add to Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Session Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-gray-900 dark:text-gray-100">Save Session</h2>
              <button
                onClick={() => setShowSaveModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 dark:text-gray-300" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Session Name</label>
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="e.g., Weekly Training Session"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Training Plans</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">{timeline.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Duration</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">{totalDuration} minutes</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSession}
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