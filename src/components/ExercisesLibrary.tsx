import { useState, useEffect } from 'react';
import { Plus, X, Search, Edit2, Trash2, Upload, Check, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

// --- Types ---
interface Exercise {
  id: string;
  name: string;
  intensity: 'Low' | 'Medium' | 'High';
  description: string;
  setup: string;
  variations: string;
  coachingPoints: string;
  goalkeepers: number;
  equipment: string[];
  linkedBasics: string[];
  linkedPrinciples: string[];
  linkedTactics: string[];
  mediaUrl?: string;
  isCustom: boolean;
}

interface SelectorItem { id: string; name: string; }

const mockExercises: Exercise[] = [
  {
    id: 'ex1',
    name: 'Rondo 4v2',
    equipment: ['Balls', 'Cones', 'Bibs/Vests'],
    setup: 'Create a 10x10 yard square with cones.',
    description: 'Possession drill where 4 attackers maintain possession against 2 defenders in a confined space.',
    variations: '5v2, One touch limit.',
    intensity: 'Medium',
    goalkeepers: 0,
    coachingPoints: 'Quick movement, body shape, first touch.',
    linkedBasics: ['Passing Accuracy'],
    linkedPrinciples: [],
    linkedTactics: [],
    isCustom: false
  },
];

const equipmentOptions = [
  'Balls', 'Cones', 'Bibs/Vests', 'Goals', 'Hurdles', 
  'Poles', 'Agility Ladder', 'Markers', 'Mannequins', 'Mini Goals'
];

export default function ExercisesLibrary() {
  const [exercises, setExercises] = useState<Exercise[]>(mockExercises);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  // Selector Lists
  const [allBasics, setAllBasics] = useState<SelectorItem[]>([]);
  const [allPrinciples, setAllPrinciples] = useState<SelectorItem[]>([]);
  const [allTactics, setAllTactics] = useState<SelectorItem[]>([]);
  
  const [basicsSearch, setBasicsSearch] = useState('');
  const [principlesSearch, setPrinciplesSearch] = useState('');
  const [tacticsSearch, setTacticsSearch] = useState('');

  const [formData, setFormData] = useState<Exercise>({
    id: '', name: '', intensity: 'Medium', description: '', setup: '',
    variations: '', coachingPoints: '', goalkeepers: 0,
    equipment: [], linkedBasics: [], linkedPrinciples: [], linkedTactics: [], isCustom: true, mediaUrl: ''
  });

  // --- 1. LOAD DATA ---
  useEffect(() => {
    fetch('http://127.0.0.1:8000/exercises')
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          intensity: item.intensity,
          setup: item.setup || '',
          variations: item.variations || '',
          coachingPoints: item.coaching_points || '',
          goalkeepers: item.goalkeepers || 0,
          equipment: item.equipment ? item.equipment.split(',') : [],
          linkedBasics: item.linked_basics ? item.linked_basics.split(',') : [],
          linkedPrinciples: item.linked_principles ? item.linked_principles.split(',') : [],
          linkedTactics: item.linked_tactics ? item.linked_tactics.split(',') : [],
          isCustom: true,
          mediaUrl: item.media_url
        }));
        setExercises([...mockExercises, ...formatted]);
      })
      .catch(() => {
        toast.error("Backend offline - Showing mocks only");
        setExercises(mockExercises);
      });

      const fetchSelectors = async () => {
        try {
            const [bRes, pRes, tRes] = await Promise.all([
                fetch('http://127.0.0.1:8000/basics'),
                fetch('http://127.0.0.1:8000/principles'),
                fetch('http://127.0.0.1:8000/tactics')
            ]);
            if(bRes.ok) setAllBasics(await bRes.json());
            if(pRes.ok) setAllPrinciples(await pRes.json());
            if(tRes.ok) setAllTactics(await tRes.json());
        } catch (e) {
            console.error("Failed to load selector lists", e);
        }
      };
      fetchSelectors();
  }, []);

  // --- 2. SAVE DATA ---
  const handleSave = async () => {
    if (!formData.name || !formData.description) {
      toast.error('Name and Description are required');
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      intensity: formData.intensity,
      setup: formData.setup,
      variations: formData.variations,
      coaching_points: formData.coachingPoints,
      goalkeepers: formData.goalkeepers,
      equipment: formData.equipment.join(','),
      linked_basics: formData.linkedBasics.join(','),
      linked_principles: formData.linkedPrinciples.join(','),
      linked_tactics: formData.linkedTactics.join(','),
      media_url: mediaPreview || formData.mediaUrl
    };

    try {
      let response;
      if (isEditing && formData.id && !formData.id.startsWith('ex')) {
        response = await fetch(`http://127.0.0.1:8000/exercises/${formData.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('http://127.0.0.1:8000/exercises', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
      }

      if (!response.ok) throw new Error('Server Error');

      const savedRaw = await response.json();
      const savedFormatted: Exercise = {
          ...formData,
          id: savedRaw.id,
          isCustom: true,
          mediaUrl: savedRaw.media_url
      };

      if (isEditing) {
        setExercises(prev => prev.map(ex => ex.id === savedFormatted.id ? savedFormatted : ex));
        toast.success('Exercise Updated!');
      } else {
        setExercises(prev => [...prev, savedFormatted]);
        toast.success('Exercise Created!');
      }
      
      closeModal();
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  // --- 3. DELETE ---
  const handleDeleteExercise = async (id: string) => {
    if (id.startsWith('ex')) {
        setExercises(prev => prev.filter(ex => ex.id !== id));
        toast.success('Mock exercise removed');
        setSelectedExercise(null);
        return;
    }

    try {
        const response = await fetch(`http://127.0.0.1:8000/exercises/${id}`, { method: 'DELETE' });
        if (response.ok) {
            setExercises(prev => prev.filter(ex => ex.id !== id));
            toast.success('Exercise deleted');
            setSelectedExercise(null);
        } else {
            toast.error('Failed to delete');
        }
    } catch (e) {
        toast.error('Connection failed');
    }
  };

  // --- UI Helpers ---
  const resetForm = () => {
    setFormData({
      id: '', name: '', intensity: 'Medium', description: '', setup: '',
      variations: '', coachingPoints: '', goalkeepers: 0,
      equipment: [], linkedBasics: [], linkedPrinciples: [], linkedTactics: [], isCustom: true, mediaUrl: ''
    });
    setMediaPreview(null);
    setBasicsSearch(''); setPrinciplesSearch(''); setTacticsSearch('');
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setIsEditing(false);
    setSelectedExercise(null);
    resetForm();
  };

  const openEditModal = (ex: Exercise) => {
    setFormData(ex);
    setMediaPreview(ex.mediaUrl || null);
    setIsEditing(true);
    setShowCreateModal(true);
  };

  const toggleSelection = (field: 'equipment' | 'linkedBasics' | 'linkedPrinciples' | 'linkedTactics', item: string) => {
    const list = formData[field];
    const newList = list.includes(item) ? list.filter(i => i !== item) : [...list, item];
    setFormData({ ...formData, [field]: newList });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setMediaPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const filteredExercises = exercises.filter(ex => 
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold dark:text-white">Exercises Library</h1><p className="text-gray-400 mt-1">Manage training exercises and drills</p></div>
        <button onClick={() => {resetForm(); setShowCreateModal(true)}} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex gap-2 items-center hover:bg-blue-700 transition-colors shadow-lg">
          <Plus size={18} /> Create Exercise
        </button>
      </div>

      <div className="bg-white dark:bg-[#1e2330] border border-gray-200 dark:border-slate-800 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#151922] border border-gray-200 dark:border-slate-800 rounded-lg px-4 py-2.5">
            <Search className="text-slate-400" size={18} />
            <input className="bg-transparent w-full outline-none dark:text-slate-200 placeholder-slate-500" 
                placeholder="Search exercises..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map(ex => (
          <div key={ex.id} onClick={() => setSelectedExercise(ex)} className="group bg-white dark:bg-[#1e2330] p-6 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-blue-500/30 transition-all cursor-pointer shadow-sm hover:shadow-xl flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg dark:text-slate-100 group-hover:text-blue-400 transition-colors">{ex.name}</h3>
                <span className={`px-2.5 py-1 rounded text-xs font-medium border border-[#3b3226] bg-[#2a2218] text-amber-500`}>{ex.intensity}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-3 mb-5 leading-relaxed">{ex.description}</p>
            <div className="flex flex-wrap gap-2 mt-auto">
                {ex.equipment.slice(0,3).map((e, i) => <span key={i} className="text-[11px] bg-[#151922] text-slate-400 px-2.5 py-1.5 rounded border border-slate-700/50">{e}</span>)}
                {ex.equipment.length > 3 && <span className="text-[11px] text-slate-500 pt-1">+{ex.equipment.length - 3}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* DETAIL MODAL (Matching Figma Style) */}
      {selectedExercise && !showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-8" onClick={closeModal}>
          <div className="bg-[#1e2330] rounded-xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-700" onClick={e => e.stopPropagation()}>
            <button onClick={closeModal} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors z-10"><X size={24} /></button>
            
            {/* Header with Edit/Delete Icons next to Title */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-3xl font-bold text-white">{selectedExercise.name}</h2>
                    {selectedExercise.isCustom && (
                        <div className="flex gap-2 ml-2">
                            {/* UPDATED: Buttons now slate-500 by default, colored on hover */}
                            <button 
                                onClick={() => openEditModal(selectedExercise)} 
                                className="p-1.5 text-slate-500 hover:text-blue-500 hover:bg-blue-500/10 rounded transition-colors"
                                title="Edit"
                            >
                                <Edit2 size={20} />
                            </button>
                            <button 
                                onClick={() => handleDeleteExercise(selectedExercise.id)} 
                                className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                title="Delete"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    )}
                </div>
                {/* Badges */}
                <div className="flex gap-3">
                    <span className="px-3 py-1 bg-[#2a2218] border border-[#3b3226] text-amber-500 text-sm rounded font-medium">{selectedExercise.intensity} Intensity</span>
                    <span className="px-3 py-1 bg-[#151922] border border-slate-700 text-slate-300 text-sm rounded font-medium">{selectedExercise.goalkeepers} Goalkeepers</span>
                </div>
            </div>

            <div className="space-y-6">
                {[
                    { label: 'DESCRIPTION', value: selectedExercise.description },
                    { label: 'SETUP', value: selectedExercise.setup },
                    { label: 'COACHING POINTS', value: selectedExercise.coachingPoints },
                ].map(section => section.value && (
                    <div key={section.label}>
                        <h4 className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-2">{section.label}</h4>
                        <div className="bg-[#11141d] border border-white/5 rounded-lg p-4 text-slate-300 text-sm leading-relaxed">
                            {section.value}
                        </div>
                    </div>
                ))}

                {/* Related Items */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    {[
                        { label: 'RELATED BASICS', items: selectedExercise.linkedBasics },
                        { label: 'RELATED PRINCIPLES', items: selectedExercise.linkedPrinciples },
                        { label: 'RELATED TACTICS', items: selectedExercise.linkedTactics },
                    ].map(section => (
                        <div key={section.label}>
                            <h4 className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-2">{section.label}</h4>
                            <div className="flex flex-wrap gap-2">
                                {section.items.length > 0 ? section.items.map(item => (
                                    <span key={item} className="px-3 py-1.5 bg-[#151922] border border-slate-700 text-slate-300 text-xs rounded hover:border-slate-500 transition-colors cursor-default">
                                        {item}
                                    </span>
                                )) : <span className="text-xs text-slate-600 italic">None selected</span>}
                            </div>
                        </div>
                    ))}
                </div>

                {selectedExercise.equipment.length > 0 && (
                    <div className="pt-2">
                        <h4 className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-2">EQUIPMENT</h4>
                        <div className="flex flex-wrap gap-2">
                            {selectedExercise.equipment.map(e => (
                                <span key={e} className="px-3 py-1.5 bg-[#151922] border border-slate-700 text-slate-400 text-xs rounded">
                                    {e}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {selectedExercise.mediaUrl && (
                    <div className="pt-2">
                        <h4 className="text-xs uppercase tracking-widest font-bold text-slate-500 mb-2">MEDIA</h4>
                        <img src={selectedExercise.mediaUrl} alt="Exercise Media" className="rounded-lg max-h-64 object-cover border border-slate-700" />
                    </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT FORM MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-[#1e2330] rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 text-white border border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                <h2 className="text-xl font-bold">{isEditing ? 'Edit Exercise' : 'Create New Exercise'}</h2>
                <button onClick={closeModal} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>

            <div className="space-y-5">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Name *</label>
                    <input className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none transition-colors"
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Rondo 4v2" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Intensity</label>
                        <select className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none transition-colors"
                            value={formData.intensity} onChange={e => setFormData({...formData, intensity: e.target.value as any})}>
                            <option>Low</option><option>Medium</option><option>High</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Goalkeepers</label>
                        <input type="number" className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none transition-colors"
                            value={formData.goalkeepers} onChange={e => setFormData({...formData, goalkeepers: parseInt(e.target.value) || 0})} />
                    </div>
                </div>

                {['Description', 'Setup', 'Variations', 'Coaching Points'].map(field => (
                    <div key={field}>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">{field} {field === 'Description' && '*'}</label>
                        <textarea className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none resize-none h-24 transition-colors"
                            value={(formData as any)[field === 'Coaching Points' ? 'coachingPoints' : field.toLowerCase()]}
                            onChange={e => setFormData({...formData, [field === 'Coaching Points' ? 'coachingPoints' : field.toLowerCase()]: e.target.value})}
                        />
                    </div>
                ))}

                <div className="pt-2">
                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase">Equipment</label>
                    <div className="flex flex-wrap gap-2">
                        {equipmentOptions.map(item => (
                            <button key={item} type="button" onClick={() => toggleSelection('equipment', item)}
                                className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                                    formData.equipment.includes(item) 
                                    ? 'bg-blue-600 border-blue-500 text-white' 
                                    : 'bg-[#151922] border-slate-700 text-slate-400 hover:border-slate-500'
                                }`}>
                                {item}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Related Items Selection */}
                <div className="space-y-4 pt-2">
                    {[
                        { label: 'Related Basics', list: allBasics, field: 'linkedBasics' as const, search: basicsSearch, setSearch: setBasicsSearch },
                        { label: 'Related Principles', list: allPrinciples, field: 'linkedPrinciples' as const, search: principlesSearch, setSearch: setPrinciplesSearch },
                        { label: 'Related Tactics', list: allTactics, field: 'linkedTactics' as const, search: tacticsSearch, setSearch: setTacticsSearch },
                    ].map(section => (
                        <div key={section.label}>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">{section.label}</label>
                            <div className="bg-[#151922] border border-slate-700 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2 border-b border-slate-700 pb-2">
                                    <Search size={14} className="text-slate-500"/>
                                    <input className="bg-transparent outline-none text-sm w-full text-slate-300 placeholder-slate-600" 
                                        placeholder="Search..." value={section.search} onChange={e => section.setSearch(e.target.value)} />
                                </div>
                                <div className="max-h-24 overflow-y-auto space-y-1 custom-scrollbar">
                                    {section.list.filter(item => item.name.toLowerCase().includes(section.search.toLowerCase())).map(item => (
                                        <label key={item.id} className="flex items-center gap-3 cursor-pointer hover:bg-slate-800 p-2 rounded transition-colors group">
                                            <div className={`w-4 h-4 border rounded flex items-center justify-center transition-all ${
                                                formData[section.field].includes(item.name) ? 'bg-blue-600 border-blue-600' : 'border-slate-600 group-hover:border-slate-500'
                                            }`}>
                                                {formData[section.field].includes(item.name) && <Check size={12} />}
                                            </div>
                                            <span className="text-sm text-slate-300">{item.name}</span>
                                            <input type="checkbox" className="hidden" 
                                                checked={formData[section.field].includes(item.name)} 
                                                onChange={() => toggleSelection(section.field, item.name)} 
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-2">
                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase">Media</label>
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 px-4 py-2 bg-[#151922] border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-800 cursor-pointer transition-colors">
                            <Upload size={16} /> Upload
                            <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
                        </label>
                        {mediaPreview && <span className="text-xs text-green-400 flex items-center gap-1"><Image as ImageIcon size={12}/> Selected</span>}
                    </div>
                </div>
            </div>

            <div className="flex gap-3 mt-8 border-t border-slate-700 pt-4">
                <button onClick={closeModal} className="flex-1 py-2.5 border border-slate-600 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors">Cancel</button>
                <button onClick={handleSave} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg">
                    {isEditing ? 'Update Exercise' : 'Create Exercise'}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}