import { useState, useEffect } from 'react';
import { Search, Plus, X, Edit2, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Principle {
  id: string;
  name: string;
  gamePhase: string;
  description: string;
  coachingNotes?: string;
  implementationTips?: string;
  mediaUrl?: string;
  isCustom: boolean;
}

const mockPrinciples: Principle[] = [
  { 
    id: 'p1', 
    name: 'Possession-Based Play', 
    gamePhase: 'In Possession', 
    description: 'Maintain control of the ball to dominate the game.', 
    coachingNotes: 'Focus on triangles and player spacing.',
    implementationTips: 'Start with 4v2 rondos\nProgress to positional play games',
    isCustom: false 
  },
];

const GAME_PHASES = [
  "In Possession",
  "Transition After Losing Possession",
  "Out of Possession",
  "Transition After Winning Possession",
  "Set Pieces"
];

export default function PrinciplesLibrary() {
  const [principles, setPrinciples] = useState<Principle[]>(mockPrinciples);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ 
    id: '', 
    name: '', 
    gamePhase: 'In Possession', 
    description: '',
    coachingNotes: '',
    implementationTips: '',
    mediaUrl: ''
  });

  useEffect(() => {
    fetch('http://127.0.0.1:8000/principles')
      .then(res => res.json())
      .then(data => {
        const dbItems = data.map((item: any) => ({ 
            id: item.id,
            name: item.name,
            gamePhase: item.game_phase, 
            description: item.description,
            coachingNotes: item.coaching_notes || '',
            implementationTips: item.implementation_tips || '',
            mediaUrl: item.media_url,
            isCustom: true 
        }));
        setPrinciples([...mockPrinciples, ...dbItems]);
      })
      .catch(() => toast.error("Backend offline"));
  }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.description) return toast.error('Fill required fields');

    const payload = { 
        name: formData.name, 
        game_phase: formData.gamePhase, 
        description: formData.description, 
        coaching_notes: formData.coachingNotes,
        implementation_tips: formData.implementationTips,
        media_url: mediaPreview || formData.mediaUrl
    };

    try {
      let response;
      if (isEditing && formData.id && !formData.id.startsWith('p')) {
        response = await fetch(`http://127.0.0.1:8000/principles/${formData.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('http://127.0.0.1:8000/principles', {
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
            gamePhase: saved.game_phase,
            description: saved.description,
            coachingNotes: saved.coaching_notes,
            implementationTips: saved.implementation_tips,
            mediaUrl: saved.media_url,
            isCustom: true 
        };
        
        if (isEditing) {
            setPrinciples(prev => prev.map(p => p.id === newItem.id ? newItem : p));
            toast.success('Updated successfully!');
        } else {
            setPrinciples(prev => [...prev, newItem]);
            toast.success('Created successfully!');
        }
        closeModal();
      }
    } catch {
      toast.error('Connection failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (id.startsWith('p')) {
        setPrinciples(prev => prev.filter(p => p.id !== id));
        return;
    }
    await fetch(`http://127.0.0.1:8000/principles/${id}`, { method: 'DELETE' });
    setPrinciples(prev => prev.filter(p => p.id !== id));
    toast.success('Deleted');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setMediaPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setIsEditing(false);
    setMediaPreview(null);
    setFormData({ id: '', name: '', gamePhase: 'In Possession', description: '', coachingNotes: '', implementationTips: '', mediaUrl: '' });
  };

  const openEdit = (p: Principle) => {
    setFormData({ 
        id: p.id, 
        name: p.name, 
        gamePhase: p.gamePhase, 
        description: p.description,
        coachingNotes: p.coachingNotes || '',
        implementationTips: p.implementationTips || '',
        mediaUrl: p.mediaUrl || ''
    });
    setMediaPreview(p.mediaUrl || null);
    setIsEditing(true);
    setShowCreateModal(true);
  };

  const filteredPrinciples = principles.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const renderTips = (text?: string) => {
    if (!text) return null;
    return text.split('\n').map((tip, i) => tip.trim() && (
        <li key={i} className="flex items-start gap-3 mb-2 text-slate-400 text-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
            <span className="leading-relaxed">{tip}</span>
        </li>
    ));
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold dark:text-white">Principles Library</h1><p className="text-gray-400 mt-1">Tactical philosophy</p></div>
        <button onClick={() => setShowCreateModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex gap-2 items-center shadow-lg transition-colors">
            <Plus size={18}/> Create Principle
        </button>
      </div>

      <div className="bg-white dark:bg-[#1e2330] border border-gray-200 dark:border-slate-800 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#151922] border border-gray-200 dark:border-slate-800 rounded-lg px-4 py-2.5">
            <Search className="text-slate-400" size={18} />
            <input className="bg-transparent w-full outline-none dark:text-slate-200 placeholder-slate-500" 
                placeholder="Search principles..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <div className="space-y-4">
        {filteredPrinciples.map((p) => (
            <div key={p.id} className="bg-white dark:bg-[#1e2330] p-6 rounded-xl border border-gray-200 dark:border-slate-800 hover:shadow-xl hover:border-purple-500/20 transition-all group relative">
                
                {/* Header Section */}
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="text-xl font-bold dark:text-white mb-2">{p.name}</h3>
                        <span className="text-xs bg-[#2d2a3e] text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded font-medium inline-block">
                            {p.gamePhase}
                        </span>
                    </div>
                </div>

                <p className="text-gray-400 leading-relaxed text-sm mb-5">{p.description}</p>
                
                {/* COACHING NOTES (Yellow Box) */}
                {p.coachingNotes && (
                    <div className="mb-5 bg-[rgba(234,179,8,0.05)] border border-yellow-500/20 rounded-lg p-4">
                        <h4 className="text-yellow-500 text-[10px] uppercase font-bold tracking-widest mb-2">Coaching Note</h4>
                        <p className="text-yellow-200/80 text-sm leading-relaxed">{p.coachingNotes}</p>
                    </div>
                )}

                {/* IMPLEMENTATION TIPS (List) */}
                {p.implementationTips && (
                    <div className="border-t border-slate-800 pt-4">
                        <h4 className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-3">Implementation Tips</h4>
                        <ul className="space-y-1">{renderTips(p.implementationTips)}</ul>
                    </div>
                )}

                {/* MEDIA */}
                {p.mediaUrl && (
                    <div className="mt-5 border-t border-slate-800 pt-4">
                        <h4 className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-3">Attached Media</h4>
                        <img src={p.mediaUrl} alt="Principle Media" className="rounded-lg max-h-48 object-cover border border-slate-700/50" />
                    </div>
                )}

                {/* ACTION BUTTONS - BOTTOM RIGHT (Floating on Hover) */}
                {p.isCustom && (
                    <div className="absolute bottom-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                         <button 
                            onClick={(e) => { e.stopPropagation(); openEdit(p); }} 
                            className="p-2 text-slate-400 bg-[#1e2330] hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors border border-slate-700/50 shadow-lg"
                            title="Edit"
                         >
                            <Edit2 size={16} />
                         </button>
                         <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} 
                            className="p-2 text-slate-400 bg-[#1e2330] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-slate-700/50 shadow-lg"
                            title="Delete"
                         >
                            <Trash2 size={16} />
                         </button>
                    </div>
                )}
            </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
            <div className="bg-[#1e2330] p-6 rounded-xl w-full max-w-lg text-white border border-slate-700 shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between mb-6 border-b border-slate-700 pb-4">
                    <h2 className="text-xl font-bold">{isEditing ? 'Edit Principle' : 'New Principle'}</h2>
                    <button onClick={closeModal}><X className="text-slate-400 hover:text-white transition-colors"/></button>
                </div>
                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Name</label>
                        <input className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-purple-500 outline-none transition-colors"
                            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. High Press" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Phase</label>
                        <select className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-purple-500 outline-none transition-colors"
                            value={formData.gamePhase} onChange={e => setFormData({...formData, gamePhase: e.target.value})}>
                            {GAME_PHASES.map(phase => (
                                <option key={phase} value={phase}>{phase}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Description</label>
                        <textarea className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-purple-500 outline-none resize-none h-24 transition-colors"
                            value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Coaching Notes (Yellow Box)</label>
                        <textarea className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-yellow-500 outline-none resize-none h-20 transition-colors"
                            value={formData.coachingNotes} onChange={e => setFormData({...formData, coachingNotes: e.target.value})} placeholder="Key details to focus on..." />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Implementation Tips (One per line)</label>
                        <textarea className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none resize-none h-24 transition-colors"
                            value={formData.implementationTips} onChange={e => setFormData({...formData, implementationTips: e.target.value})} placeholder="Start with basics&#10;Progress to complex drills" />
                    </div>
                    {/* Media Upload */}
                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Media / Diagram</label>
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 px-4 py-2 bg-[#151922] border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-800 cursor-pointer transition-colors">
                                <Upload size={16} /> Upload File
                                <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
                            </label>
                            {mediaPreview && <span className="text-xs text-green-400 flex items-center gap-1"><Image as ImageIcon size={12}/> Selected</span>}
                        </div>
                        {mediaPreview && (
                            <div className="mt-2 h-32 bg-black/50 rounded-lg border border-slate-700 overflow-hidden flex items-center justify-center">
                                <img src={mediaPreview} alt="Preview" className="h-full object-contain" />
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex gap-3 mt-8">
                    <button onClick={closeModal} className="flex-1 py-2.5 border border-slate-600 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors">Cancel</button>
                    <button onClick={handleSave} className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-medium shadow-lg transition-colors">Save</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}