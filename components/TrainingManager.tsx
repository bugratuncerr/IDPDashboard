import { useState, useEffect } from 'react';
import { Plus, X, Search, Calendar, Clock, Users, Target, Zap, Trash2, Edit2, GripVertical } from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';
import { toast } from 'sonner';

interface Exercise {
  id: string;
  name: string;
  intensity: string;
}

interface Player {
  id: string;
  firstName: string;
  lastName: string;
}

interface Training {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  focus: string;
  intensity: 'Low' | 'Medium' | 'High';
  availablePlayers: string[];
  absentPlayers: string[];
  exercises: string[]; // Exercise IDs in order
  isCustom: boolean;
}

interface DraggableExerciseProps {
  exercise: Exercise;
  index: number;
  moveExercise: (dragIndex: number, hoverIndex: number) => void;
  onRemove: () => void;
}

function DraggableExercise({ exercise, index, moveExercise, onRemove }: DraggableExerciseProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'exercise',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'exercise',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveExercise(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center gap-3 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-move" />
      <div className="flex-1">
        <p className="text-gray-900 dark:text-gray-100">{exercise.name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Intensity: {exercise.intensity}</p>
      </div>
      <button
        onClick={onRemove}
        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function TrainingManager() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<Training>>({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '11:00',
    focus: '',
    intensity: 'Medium',
    availablePlayers: [],
    absentPlayers: [],
    exercises: []
  });

  // Mock data - in real app, load from API/localStorage
  const mockExercises: Exercise[] = [
    { id: 'ex1', name: 'Rondo 4v2', intensity: 'Medium' },
    { id: 'ex2', name: 'Finishing in the Box', intensity: 'High' },
    { id: 'ex3', name: 'Passing Patterns', intensity: 'Low' }
  ];

  const mockPlayers: Player[] = [
    { id: 'p1', firstName: 'John', lastName: 'Smith' },
    { id: 'p2', firstName: 'Michael', lastName: 'Johnson' },
    { id: 'p3', firstName: 'David', lastName: 'Williams' },
    { id: 'p4', firstName: 'James', lastName: 'Brown' }
  ];

  // Load trainings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('trainings');
    if (saved) {
      setTrainings(JSON.parse(saved));
    }
  }, []);

  // Save trainings to localStorage
  useEffect(() => {
    localStorage.setItem('trainings', JSON.stringify(trainings));
  }, [trainings]);

  const filteredTrainings = trainings.filter(training =>
    training.focus.toLowerCase().includes(searchQuery.toLowerCase()) ||
    training.date.includes(searchQuery)
  );

  const handleCreateTraining = () => {
    if (!formData.date || !formData.startTime || !formData.endTime || !formData.focus) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newTraining: Training = {
      id: `training-${Date.now()}`,
      date: formData.date!,
      startTime: formData.startTime!,
      endTime: formData.endTime!,
      focus: formData.focus!,
      intensity: formData.intensity || 'Medium',
      availablePlayers: formData.availablePlayers || [],
      absentPlayers: formData.absentPlayers || [],
      exercises: formData.exercises || [],
      isCustom: true
    };

    setTrainings([...trainings, newTraining]);
    toast.success('Training session created successfully!');
    resetForm();
  };

  const handleEditTraining = () => {
    if (!formData.date || !formData.startTime || !formData.endTime || !formData.focus || !selectedTraining) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedTraining: Training = {
      ...selectedTraining,
      date: formData.date!,
      startTime: formData.startTime!,
      endTime: formData.endTime!,
      focus: formData.focus!,
      intensity: formData.intensity || 'Medium',
      availablePlayers: formData.availablePlayers || [],
      absentPlayers: formData.absentPlayers || [],
      exercises: formData.exercises || []
    };

    setTrainings(trainings.map(t => t.id === selectedTraining.id ? updatedTraining : t));
    setSelectedTraining(updatedTraining);
    toast.success('Training session updated successfully!');
    setIsEditing(false);
  };

  const handleDeleteTraining = (id: string) => {
    setTrainings(trainings.filter(t => t.id !== id));
    setSelectedTraining(null);
    toast.success('Training session deleted successfully!');
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '11:00',
      focus: '',
      intensity: 'Medium',
      availablePlayers: [],
      absentPlayers: [],
      exercises: []
    });
    setShowCreateModal(false);
  };

  const startEditing = (training: Training) => {
    setFormData({
      date: training.date,
      startTime: training.startTime,
      endTime: training.endTime,
      focus: training.focus,
      intensity: training.intensity,
      availablePlayers: training.availablePlayers,
      absentPlayers: training.absentPlayers,
      exercises: training.exercises
    });
    setIsEditing(true);
  };

  const togglePlayer = (playerId: string, list: 'available' | 'absent') => {
    if (list === 'available') {
      const current = formData.availablePlayers || [];
      if (current.includes(playerId)) {
        setFormData({ ...formData, availablePlayers: current.filter(id => id !== playerId) });
      } else {
        // Remove from absent if adding to available
        const absent = (formData.absentPlayers || []).filter(id => id !== playerId);
        setFormData({ ...formData, availablePlayers: [...current, playerId], absentPlayers: absent });
      }
    } else {
      const current = formData.absentPlayers || [];
      if (current.includes(playerId)) {
        setFormData({ ...formData, absentPlayers: current.filter(id => id !== playerId) });
      } else {
        // Remove from available if adding to absent
        const available = (formData.availablePlayers || []).filter(id => id !== playerId);
        setFormData({ ...formData, absentPlayers: [...current, playerId], availablePlayers: available });
      }
    }
  };

  const addExercise = (exerciseId: string) => {
    const current = formData.exercises || [];
    if (!current.includes(exerciseId)) {
      setFormData({ ...formData, exercises: [...current, exerciseId] });
    }
  };

  const removeExercise = (index: number) => {
    const current = formData.exercises || [];
    setFormData({ ...formData, exercises: current.filter((_, i) => i !== index) });
  };

  const moveExercise = (dragIndex: number, hoverIndex: number) => {
    const current = [...(formData.exercises || [])];
    const [removed] = current.splice(dragIndex, 1);
    current.splice(hoverIndex, 0, removed);
    setFormData({ ...formData, exercises: current });
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
          <h1 className="text-3xl text-gray-900 dark:text-gray-100 mb-2">Training Sessions</h1>
          <p className="text-gray-600 dark:text-gray-400">Plan and manage training sessions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Training
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
            placeholder="Search training sessions..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Training List */}
      <div className="space-y-4">
        {filteredTrainings.map((training) => (
          <button
            key={training.id}
            onClick={() => setSelectedTraining(training)}
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer text-left"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg text-gray-900 dark:text-gray-100">{training.focus}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${getIntensityColor(training.intensity)}`}>
                    {training.intensity}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(training.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {training.startTime} - {training.endTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {training.availablePlayers.length} players
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    {training.exercises.length} exercises
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}

        {filteredTrainings.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
            <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">No training sessions found</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedTraining && !isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-gray-900 dark:text-gray-100">{selectedTraining.focus}</h2>
              <div className="flex items-center gap-2">
                {selectedTraining.isCustom && (
                  <>
                    <button
                      onClick={() => startEditing(selectedTraining)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTraining(selectedTraining.id)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedTraining(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 dark:text-gray-300" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Date</h4>
                  <p className="text-gray-900 dark:text-gray-100">{new Date(selectedTraining.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Time</h4>
                  <p className="text-gray-900 dark:text-gray-100">{selectedTraining.startTime} - {selectedTraining.endTime}</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Intensity</h4>
                  <span className={`inline-block px-3 py-1 rounded text-sm ${getIntensityColor(selectedTraining.intensity)}`}>
                    {selectedTraining.intensity}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Available Players</h4>
                  <p className="text-gray-900 dark:text-gray-100">{selectedTraining.availablePlayers.length} players</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2">Exercises ({selectedTraining.exercises.length})</h4>
                <div className="space-y-2">
                  {selectedTraining.exercises.map((exId, idx) => {
                    const exercise = mockExercises.find(ex => ex.id === exId);
                    return exercise ? (
                      <div key={idx} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400 text-sm">{idx + 1}.</span>
                          <p className="text-gray-900 dark:text-gray-100">{exercise.name}</p>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || isEditing) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-gray-900 dark:text-gray-100">
                {isEditing ? 'Edit Training Session' : 'Create New Training Session'}
              </h2>
              <button
                onClick={() => {
                  if (isEditing) {
                    setIsEditing(false);
                  } else {
                    resetForm();
                  }
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 dark:text-gray-300" />
              </button>
            </div>

            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); isEditing ? handleEditTraining() : handleCreateTraining(); }}>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Start Time *</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">End Time *</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Focus *</label>
                  <input
                    type="text"
                    value={formData.focus}
                    onChange={(e) => setFormData({ ...formData, focus: e.target.value })}
                    placeholder="e.g., Possession and Build-up Play"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

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
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Available Players</label>
                <div className="flex flex-wrap gap-2">
                  {mockPlayers.map((player) => (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => togglePlayer(player.id, 'available')}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        formData.availablePlayers?.includes(player.id)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {player.firstName} {player.lastName}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Absent Players</label>
                <div className="flex flex-wrap gap-2">
                  {mockPlayers.map((player) => (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => togglePlayer(player.id, 'absent')}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        formData.absentPlayers?.includes(player.id)
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {player.firstName} {player.lastName}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Exercises (Drag to reorder)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Available Exercises</p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {mockExercises.map((exercise) => (
                        <button
                          key={exercise.id}
                          type="button"
                          onClick={() => addExercise(exercise.id)}
                          disabled={formData.exercises?.includes(exercise.id)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            formData.exercises?.includes(exercise.id)
                              ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:border-blue-300 dark:hover:border-blue-600'
                          }`}
                        >
                          {exercise.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Selected Exercises ({formData.exercises?.length || 0})</p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {(formData.exercises || []).map((exId, index) => {
                        const exercise = mockExercises.find(ex => ex.id === exId);
                        return exercise ? (
                          <DraggableExercise
                            key={`${exId}-${index}`}
                            exercise={exercise}
                            index={index}
                            moveExercise={moveExercise}
                            onRemove={() => removeExercise(index)}
                          />
                        ) : null;
                      })}
                      {(!formData.exercises || formData.exercises.length === 0) && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No exercises selected</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    if (isEditing) {
                      setIsEditing(false);
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
                  {isEditing ? 'Update Training' : 'Create Training'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}