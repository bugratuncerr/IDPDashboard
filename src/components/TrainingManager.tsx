import { useState, useEffect } from 'react';
import { Plus, X, Calendar, Clock, Trash2, Edit2, User, Activity } from 'lucide-react';
import { toast } from 'sonner';

// --- Interfaces ---
interface Player {
  id: string;
  name: string;
}

interface Exercise {
  id: string;
  name: string;
}

interface TrainingSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  focus: string;
  intensity: string;
  selectedPlayers: string[]; // List of IDs
  selectedExercises: string[]; // List of IDs
}

export default function TrainingManager() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '11:00',
    focus: '',
    intensity: 'Medium',
    selectedPlayerIds: [] as string[],
    selectedExerciseIds: [] as string[]
  });

  // --- 1. LOAD DATA ---
  useEffect(() => {
    const fetchData = async () => {
        try {
            // Fetch Sessions
            const sRes = await fetch('http://127.0.0.1:8000/training_sessions');
            if (sRes.ok) {
                const data = await sRes.json();
                setSessions(data.map((s: any) => ({
                    id: s.id,
                    date: s.date,
                    startTime: s.start_time,
                    endTime: s.end_time,
                    focus: s.focus,
                    intensity: s.intensity,
                    selectedPlayers: s.selected_players ? s.selected_players.split(',') : [],
                    selectedExercises: s.selected_exercises ? s.selected_exercises.split(',') : []
                })));
            }

            // Fetch Players (for selection list)
            const pRes = await fetch('http://127.0.0.1:8000/players');
            if (pRes.ok) setAllPlayers(await pRes.json());

            // Fetch Exercises (for selection list)
            const eRes = await fetch('http://127.0.0.1:8000/exercises');
            if (eRes.ok) setAllExercises(await eRes.json());

        } catch (e) {
            toast.error("Failed to load data");
        }
    };
    fetchData();
  }, []);

  // Set default players when opening create modal
  useEffect(() => {
      if (showCreateModal && !isEditing && allPlayers.length > 0) {
          setFormData(prev => ({ ...prev, selectedPlayerIds: allPlayers.map(p => p.id) }));
      }
  }, [showCreateModal, isEditing, allPlayers]);

  // --- 2. ACTIONS ---
  const handleSave = async () => {
    if (!formData.focus) return toast.error("Focus is required");

    const payload = {
        date: formData.date,
        start_time: formData.startTime,
        end_time: formData.endTime,
        focus: formData.focus,
        intensity: formData.intensity,
        selected_players: formData.selectedPlayerIds.join(','),
        selected_exercises: formData.selectedExerciseIds.join(',')
    };

    try {
        let res;
        if (isEditing && editingId) {
            res = await fetch(`http://127.0.0.1:8000/training_sessions/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            res = await fetch('http://127.0.0.1:8000/training_sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        if (res.ok) {
            const saved = await res.json();
            const newItem = {
                id: saved.id,
                date: saved.date,
                startTime: saved.start_time,
                endTime: saved.end_time,
                focus: saved.focus,
                intensity: saved.intensity,
                selectedPlayers: saved.selected_players ? saved.selected_players.split(',') : [],
                selectedExercises: saved.selected_exercises ? saved.selected_exercises.split(',') : []
            };

            if (isEditing) {
                setSessions(prev => prev.map(s => s.id === newItem.id ? newItem : s));
                toast.success("Session Updated");
            } else {
                setSessions(prev => [...prev, newItem]);
                toast.success("Session Created");
            }
            closeModal();
        }
    } catch {
        toast.error("Save failed");
    }
  };

  const handleDelete = async (id: string) => {
      await fetch(`http://127.0.0.1:8000/training_sessions/${id}`, { method: 'DELETE' });
      setSessions(prev => prev.filter(s => s.id !== id));
      toast.success("Deleted");
  };

  // --- 3. UI HELPERS ---
  const openCreate = () => {
      setIsEditing(false);
      setEditingId(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '11:00',
        focus: '',
        intensity: 'Medium',
        selectedPlayerIds: allPlayers.map(p => p.id),
        selectedExerciseIds: []
      });
      setShowCreateModal(true);
  };

  const openEdit = (s: TrainingSession) => {
      setIsEditing(true);
      setEditingId(s.id);
      setFormData({
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        focus: s.focus,
        intensity: s.intensity,
        selectedPlayerIds: s.selectedPlayers,
        selectedExerciseIds: s.selectedExercises
      });
      setShowCreateModal(true);
  };

  const closeModal = () => setShowCreateModal(false);

  const togglePlayer = (id: string) => {
      setFormData(prev => {
          const exists = prev.selectedPlayerIds.includes(id);
          return {
              ...prev,
              selectedPlayerIds: exists 
                ? prev.selectedPlayerIds.filter(pid => pid !== id)
                : [...prev.selectedPlayerIds, id]
          };
      });
  };

  const toggleExercise = (id: string) => {
      setFormData(prev => {
          const exists = prev.selectedExerciseIds.includes(id);
          return {
              ...prev,
              selectedExerciseIds: exists 
                ? prev.selectedExerciseIds.filter(eid => eid !== id)
                : [...prev.selectedExerciseIds, id]
          };
      });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Training Sessions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Plan and manage team training</p>
        </div>
        <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex gap-2 items-center shadow-lg transition-colors">
          <Plus size={18} /> Create Training
        </button>
      </div>

      <div className="space-y-4">
        {sessions.map(s => (
            <div key={s.id} className="bg-white dark:bg-[#1e2330] border border-gray-200 dark:border-slate-800 rounded-xl p-6 flex justify-between items-center shadow-sm hover:shadow-lg transition-all group">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold dark:text-white">{s.focus}</h3>
                        <span className="text-xs px-2.5 py-1 rounded bg-[#252a3a] border border-[#303649] text-blue-300 font-medium">
                            {s.intensity}
                        </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-slate-400">
                        <span className="flex items-center gap-2"><Calendar size={15} className="text-slate-500"/> {s.date}</span>
                        <span className="flex items-center gap-2"><Clock size={15} className="text-slate-500"/> {s.startTime} - {s.endTime}</span>
                        <span className="flex items-center gap-2"><Activity size={15} className="text-slate-500"/> {s.selectedExercises.length} Exercises</span>
                        <span className="flex items-center gap-2"><User size={15} className="text-slate-500"/> {s.selectedPlayers.length} Players</span>
                    </div>
                </div>
                
                {/* Action Buttons - Simple Icons */}
                <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2">
                    <button 
                        onClick={() => openEdit(s)} 
                        className="text-slate-500 hover:text-blue-500 transition-colors" 
                        title="Edit"
                    >
                        <Edit2 size={18}/>
                    </button>
                    <button 
                        onClick={() => handleDelete(s.id)} 
                        className="text-slate-500 hover:text-red-500 transition-colors" 
                        title="Delete"
                    >
                        <Trash2 size={18}/>
                    </button>
                </div>
            </div>
        ))}
        {sessions.length === 0 && <div className="text-center py-10 text-slate-500">No training sessions scheduled.</div>}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-[#1e2330] rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 text-white border border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            
            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                <h2 className="text-xl font-bold">{isEditing ? 'Edit Training Session' : 'Create New Training Session'}</h2>
                <button onClick={closeModal}><X className="text-slate-400 hover:text-white transition-colors"/></button>
            </div>

            {/* Date & Time Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Date *</label>
                    <input type="date" className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none transition-colors text-slate-200"
                        value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Start Time *</label>
                    <input type="time" className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none transition-colors text-slate-200"
                        value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">End Time *</label>
                    <input type="time" className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none transition-colors text-slate-200"
                        value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                </div>
            </div>

            {/* Focus & Intensity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Focus *</label>
                    <input className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none transition-colors text-slate-200 placeholder-slate-600"
                        placeholder="e.g., Possession and Build-up Play" value={formData.focus} onChange={e => setFormData({...formData, focus: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Intensity *</label>
                    <select className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none transition-colors text-slate-200"
                        value={formData.intensity} onChange={e => setFormData({...formData, intensity: e.target.value})}>
                        <option>Low</option><option>Medium</option><option>High</option>
                    </select>
                </div>
            </div>

            {/* Players Selection */}
            <div className="mb-6 space-y-4">
                {/* Available / Present */}
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase">Available Players</label>
                    <div className="flex flex-wrap gap-2">
                        {formData.selectedPlayerIds.map(id => {
                            const p = allPlayers.find(pl => pl.id === id);
                            return p ? (
                                <button key={id} onClick={() => togglePlayer(id)} 
                                    className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-xs text-white border border-slate-600 transition-colors">
                                    {p.name}
                                </button>
                            ) : null;
                        })}
                        {formData.selectedPlayerIds.length === 0 && <span className="text-xs text-slate-500 italic">No players selected</span>}
                    </div>
                </div>
                
                {/* Absent */}
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase">Absent Players</label>
                    <div className="flex flex-wrap gap-2">
                        {allPlayers.filter(p => !formData.selectedPlayerIds.includes(p.id)).map(p => (
                            <button key={p.id} onClick={() => togglePlayer(p.id)} 
                                className="px-3 py-1.5 rounded bg-[#151922] hover:bg-slate-800 text-xs text-slate-500 border border-slate-700 transition-colors">
                                {p.name}
                            </button>
                        ))}
                        {allPlayers.length > 0 && allPlayers.filter(p => !formData.selectedPlayerIds.includes(p.id)).length === 0 && (
                            <span className="text-xs text-slate-500 italic">All players available</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Exercise Selection */}
            <div className="grid grid-cols-2 gap-6 mb-2">
                {/* Available Exercises */}
                <div className="flex flex-col h-64">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Available Exercises</label>
                    <div className="bg-[#151922] border border-slate-700 rounded-lg p-2 flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                        {allExercises.filter(ex => !formData.selectedExerciseIds.includes(ex.id)).map(ex => (
                            <div key={ex.id} onClick={() => toggleExercise(ex.id)}
                                className="p-2.5 rounded bg-slate-800/40 hover:bg-slate-700 cursor-pointer text-sm flex justify-between items-center group transition-colors border border-transparent hover:border-slate-600">
                                <span className="text-slate-300">{ex.name}</span>
                                <Plus size={14} className="text-slate-500 group-hover:text-blue-400"/>
                            </div>
                        ))}
                        {allExercises.length === 0 && <p className="text-xs text-slate-500 p-2">No exercises created yet.</p>}
                    </div>
                </div>

                {/* Selected Exercises */}
                <div className="flex flex-col h-64">
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Selected Exercises ({formData.selectedExerciseIds.length})</label>
                    <div className="bg-[#151922] border border-slate-700 rounded-lg p-2 flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                        {formData.selectedExerciseIds.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                                <Activity size={24} className="opacity-20"/>
                                <span className="text-xs">No exercises selected</span>
                            </div>
                        )}
                        {formData.selectedExerciseIds.map(id => {
                            const ex = allExercises.find(e => e.id === id);
                            return ex ? (
                                <div key={id} onClick={() => toggleExercise(id)}
                                    className="p-2.5 rounded bg-slate-700 hover:bg-slate-600 cursor-pointer text-sm flex justify-between items-center group border-l-2 border-blue-500 shadow-sm">
                                    <span className="text-white">{ex.name}</span>
                                    <X size={14} className="text-slate-400 group-hover:text-red-400"/>
                                </div>
                            ) : null;
                        })}
                    </div>
                </div>
            </div>

            <div className="flex gap-3 border-t border-slate-700 pt-6 mt-4">
                <button onClick={closeModal} className="flex-1 py-3 border border-slate-600 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors font-medium">
                    Cancel
                </button>
                <button onClick={handleSave} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-900/20">
                    {isEditing ? 'Update Training' : 'Create Training'}
                </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}