import { useState, useEffect } from 'react';
import { Search, Plus, X, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Tactic {
  id: string;
  name: string;
  formation: string;
  description: string;
  diagramUrl?: string; 
  suggestedDrills?: string; // Newline separated
  isCustom: boolean;
}

const mockTactics: Tactic[] = [
  { 
    id: 't1', 
    name: 'Counter-Attack 4-3-3', 
    formation: '4-3-3', 
    description: 'Sit deep and break fast with wingers.',
    suggestedDrills: 'Transition Rondo\nCounter Attack 3v2',
    isCustom: false 
  },
];

export default function TacticsLibrary() {
  const [tactics, setTactics] = useState<Tactic[]>(mockTactics);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', formation: '4-3-3', description: '', suggestedDrills: '' });

  useEffect(() => {
    fetch('http://127.0.0.1:8000/tactics')
      .then(res => res.json())
      .then(data => {
        const dbItems = data.map((item: any) => ({ 
            id: item.id,
            name: item.name,
            formation: item.formation,
            description: item.description,
            suggestedDrills: item.suggested_drills || '', 
            isCustom: true 
        }));
        setTactics([...mockTactics, ...dbItems]);
      })
      .catch(() => toast.error("Backend offline"));
  }, []);

  const handleSave = async () => {
    if (!formData.name) return toast.error('Name required');
    try {
      let response;
      const payload = { 
          name: formData.name, 
          formation: formData.formation, 
          description: formData.description,
          suggested_drills: formData.suggestedDrills
      };
      
      if (isEditing && formData.id && !formData.id.startsWith('t')) {
        response = await fetch(`http://127.0.0.1:8000/tactics/${formData.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('http://127.0.0.1:8000/tactics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        const saved = await response.json();
        const newItem = { 
            id: saved.id,
            name: saved.name,
            formation: saved.formation,
            description: saved.description,
            suggestedDrills: saved.suggested_drills || '',
            isCustom: true 
        };
        
        if (isEditing) {
            setTactics(prev => prev.map(t => t.id === newItem.id ? newItem : t));
            toast.success('Updated successfully!');
        } else {
            setTactics(prev => [...prev, newItem]);
            toast.success('Created successfully!');
        }
        closeModal();
      }
    } catch {
      toast.error('Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    if (id.startsWith('t')) {
        setTactics(prev => prev.filter(t => t.id !== id));
        return;
    }
    await fetch(`http://127.0.0.1:8000/tactics/${id}`, { method: 'DELETE' });
    setTactics(prev => prev.filter(t => t.id !== id));
    toast.success('Deleted');
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setIsEditing(false);
    setFormData({ id: '', name: '', formation: '4-3-3', description: '', suggestedDrills: '' });
  };

  const openEdit = (t: Tactic) => {
    setFormData({ 
        id: t.id, 
        name: t.name, 
        formation: t.formation, 
        description: t.description,
        suggestedDrills: t.suggestedDrills || ''
    });
    setIsEditing(true);
    setShowCreateModal(true);
  };

  const filteredTactics = tactics.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold dark:text-white">Tactics Library</h1><p className="text-gray-400 mt-1">Systems & Formations</p></div>
        <button onClick={() => setShowCreateModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex gap-2 items-center shadow-lg transition-colors">
            <Plus size={18}/> Create Tactic
        </button>
      </div>

      <div className="bg-white dark:bg-[#1e2330] border border-gray-200 dark:border-slate-800 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#151922] border border-gray-200 dark:border-slate-800 rounded-lg px-4 py-2.5">
            <Search className="text-slate-400" size={18} />
            <input className="bg-transparent w-full outline-none dark:text-slate-200 placeholder-slate-500" 
                placeholder="Search tactics..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTactics.map((t) => (
          <div key={t.id} className="bg-white dark:bg-[#1e2330] border border-gray-200 dark:border-slate-800 rounded-xl p-5 hover:shadow-2xl hover:border-green-500/20 transition-all group relative flex flex-col h-full">
            
            {/* Visual Pitch Header */}
            <div className="bg-[#1a3d2f]/60 border border-[#2d5e4a] rounded-lg h-32 mb-5 flex items-center justify-center relative overflow-hidden shrink-0">
                <div className="absolute inset-3 border border-[#4ade80]/10 rounded"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-[#4ade80]/10 rounded-full"></div>
                <div className="absolute top-0 bottom-0 left-1/2 border-l border-[#4ade80]/10"></div>
                
                <div className="text-center z-10">
                    <span className="text-3xl font-bold text-[#4ade80] block tracking-tight drop-shadow-lg">{t.formation}</span>
                    <span className="text-[10px] uppercase text-[#4ade80]/60 tracking-[0.2em] font-medium mt-1">Formation Layout</span>
                </div>
            </div>

            {/* Description Area */}
            <div className="mb-4 px-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{t.name}</h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-3">{t.description}</p>
            </div>

            {/* Suggested Drills Box - Fixed spacing (Removed mt-auto) */}
            {t.suggestedDrills && (
                <div className="bg-[#11141d] border border-white/5 rounded-md p-4 mt-2 mb-8">
                    <h4 className="text-orange-500 text-[10px] uppercase font-bold tracking-widest mb-3">Suggested Drills</h4>
                    <div className="space-y-2">
                        {t.suggestedDrills.split('\n').map((d, i) => d.trim() && (
                            <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                                <span className="text-orange-500/50 mt-[3px] text-[8px]">●</span>
                                <span>{d}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ACTION BUTTONS - Floating, Bottom Right */}
            {t.isCustom && (
                <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                     <button 
                        onClick={(e) => { e.stopPropagation(); openEdit(t); }} 
                        className="p-2 text-slate-400 bg-[#1e2330] hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors border border-slate-700/50 shadow-lg" 
                        title="Edit"
                     >
                        <Edit2 size={14} />
                     </button>
                     <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }} 
                        className="p-2 text-slate-400 bg-[#1e2330] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-slate-700/50 shadow-lg" 
                        title="Delete"
                     >
                        <Trash2 size={14} />
                     </button>
                </div>
            )}
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
            <div className="bg-[#1e2330] p-6 rounded-xl w-full max-w-md text-white border border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between mb-6 border-b border-slate-700 pb-4">
                    <h2 className="text-xl font-bold">{isEditing ? 'Edit Tactic' : 'New Tactic'}</h2>
                    <button onClick={closeModal}><X className="text-slate-400 hover:text-white transition-colors"/></button>
                </div>
                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Name</label>
                        <input className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-green-500 outline-none transition-colors"
                            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Counter Attack" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Formation</label>
                        <select className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-green-500 outline-none transition-colors"
                            value={formData.formation} onChange={e => setFormData({...formData, formation: e.target.value})}>
                            <option>4-3-3</option><option>4-4-2</option><option>3-5-2</option><option>4-2-3-1</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Description</label>
                        <textarea className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-green-500 outline-none resize-none h-24 transition-colors"
                            value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase text-orange-400">Suggested Drills (One per line)</label>
                        <textarea className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-orange-500 outline-none resize-none h-20 transition-colors"
                            value={formData.suggestedDrills} onChange={e => setFormData({...formData, suggestedDrills: e.target.value})} placeholder="Rondo&#10;Small Sided Game" />
                    </div>
                </div>
                <div className="flex gap-3 mt-8">
                    <button onClick={closeModal} className="flex-1 py-2.5 border border-slate-600 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors">Cancel</button>
                    <button onClick={handleSave} className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 rounded-lg text-white font-medium shadow-lg transition-colors">Save</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}