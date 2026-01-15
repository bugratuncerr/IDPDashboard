import { useState, useEffect } from 'react';
import { Search, Plus, X, Edit2, Trash2, Image as ImageIcon, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface Basic {
  id: string;
  name: string;
  description: string;
  diagramUrl?: string; 
  isCustom: boolean;
}

const mockBasics: Basic[] = [
  { id: 'b1', name: 'Passing Accuracy', description: 'Techniques for short and long range passing.', isCustom: false },
];

export default function BasicsLibrary() {
  const [basics, setBasics] = useState<Basic[]>(mockBasics);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ id: '', name: '', description: '', diagramUrl: '' });

  useEffect(() => {
    fetch('http://127.0.0.1:8000/basics')
      .then(res => res.json())
      .then(data => {
        const dbItems = data.map((item: any) => ({ 
            id: item.id,
            name: item.name,
            description: item.description,
            diagramUrl: item.diagram_url, // Map snake_case
            isCustom: true 
        }));
        setBasics([...mockBasics, ...dbItems]);
      })
      .catch(() => toast.error("Backend offline - Showing mocks"));
  }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.description) return toast.error('Fill required fields');

    const payload = {
        name: formData.name,
        description: formData.description,
        diagram_url: mediaPreview || formData.diagramUrl 
    };

    try {
      let response;
      if (isEditing && formData.id && !formData.id.startsWith('b')) {
        response = await fetch(`http://127.0.0.1:8000/basics/${formData.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('http://127.0.0.1:8000/basics', {
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
            description: saved.description, 
            diagramUrl: saved.diagram_url,
            isCustom: true 
        };
        
        if (isEditing) {
            setBasics(prev => prev.map(b => b.id === newItem.id ? newItem : b));
            toast.success('Updated successfully!');
        } else {
            setBasics(prev => [...prev, newItem]);
            toast.success('Created successfully!');
        }
        closeModal();
      } else {
        toast.error('Server Error');
      }
    } catch {
      toast.error('Connection failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (id.startsWith('b')) {
        setBasics(prev => prev.filter(b => b.id !== id));
        return;
    }
    await fetch(`http://127.0.0.1:8000/basics/${id}`, { method: 'DELETE' });
    setBasics(prev => prev.filter(b => b.id !== id));
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
    setFormData({ id: '', name: '', description: '', diagramUrl: '' });
  };

  const openEdit = (basic: Basic) => {
    setFormData({ 
        id: basic.id, 
        name: basic.name, 
        description: basic.description, 
        diagramUrl: basic.diagramUrl || ''
    });
    setMediaPreview(basic.diagramUrl || null);
    setIsEditing(true);
    setShowCreateModal(true);
  };

  const filteredBasics = basics.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Basics Library</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Fundamental technical concepts</p>
        </div>
        <button onClick={() => { closeModal(); setShowCreateModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg transition-colors">
          <Plus size={18} /> Create Basic
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-[#1e2330] border border-gray-200 dark:border-slate-800 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#151922] border border-gray-200 dark:border-slate-800 rounded-lg px-4 py-2.5">
            <Search className="text-slate-400" size={18} />
            <input className="bg-transparent w-full outline-none dark:text-slate-200 placeholder-slate-500" 
                placeholder="Search basics..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBasics.map((basic) => (
          <div key={basic.id} className="bg-white dark:bg-[#1e2330] border border-gray-200 dark:border-slate-800 rounded-xl p-5 hover:shadow-2xl transition-all group flex flex-col h-full">
            
            {/* Visual Diagram Placeholder (Figma Style) */}
            <div className="bg-[#151922] rounded-lg h-32 mb-5 flex flex-col items-center justify-center border-2 border-dashed border-slate-700/50 text-slate-500 relative overflow-hidden shrink-0 group-hover:border-slate-600 transition-colors">
                {basic.diagramUrl ? (
                    <img src={basic.diagramUrl} alt="Diagram" className="w-full h-full object-contain p-2" />
                ) : (
                    <>
                        <ImageIcon size={20} className="mb-2 opacity-50" />
                        <span className="text-[10px] uppercase tracking-widest font-medium opacity-50">Technical Diagram</span>
                    </>
                )}
            </div>

            <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1.5">{basic.name}</h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-2">{basic.description}</p>
            </div>
            
            {/* Footer with Separator and Icons (Figma Style) */}
            {basic.isCustom && (
                <div className="mt-auto pt-4 border-t border-slate-800 flex justify-end gap-3">
                    <button 
                        onClick={(e) => { e.stopPropagation(); openEdit(basic); }} 
                        className="text-slate-500 hover:text-blue-500 transition-colors"
                        title="Edit"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(basic.id); }} 
                        className="text-slate-500 hover:text-red-500 transition-colors"
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
          <div className="bg-[#1e2330] rounded-xl w-full max-w-md p-6 text-white border border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
              <h2 className="text-xl font-bold">{isEditing ? 'Edit Basic' : 'Create Basic'}</h2>
              <button onClick={closeModal}><X className="text-slate-400 hover:text-white transition-colors" /></button>
            </div>
            
            <div className="space-y-5">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Name</label>
                    <input className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none transition-colors"
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Ball Control" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Description</label>
                    <textarea className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none resize-none h-32 transition-colors"
                        value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe the concept..." />
                </div>
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Media / Diagram</label>
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 px-4 py-2 bg-[#151922] border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-800 cursor-pointer transition-colors">
                            <Upload size={16} /> Upload Image/Video
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
                <button onClick={handleSave} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}