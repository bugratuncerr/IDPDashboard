import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit2, X, TrendingUp, Calendar, Plus, Upload, Trash2, Camera } from 'lucide-react';
import { toast } from 'sonner';

interface Player {
  id: string; // Changed to string for UUID compatibility
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  position: string;
  jerseyNumber: number;
  status: string;
  playerPhone: string;
  height: number;
  weight: number;
  motherName: string;
  motherPhone: string;
  fatherName: string;
  fatherPhone: string;
  imageUrl: string;
  attendance: number;
  performance: number;
}

// 1. MOCK DATA
const mockPlayers: Player[] = [
  { 
    id: 'm1', firstName: 'Alex', lastName: 'Johnson', dateOfBirth: '2005-03-15',
    position: 'Forward', jerseyNumber: 9, status: 'Active', playerPhone: '', 
    height: 175, weight: 70, motherName: '', motherPhone: '', fatherName: '', fatherPhone: '',
    imageUrl: '', attendance: 95, performance: 88
  },
  { 
    id: 'm2', firstName: 'Sam', lastName: 'Martinez', dateOfBirth: '2006-07-22',
    position: 'Midfielder', jerseyNumber: 10, status: 'Active', playerPhone: '', 
    height: 172, weight: 68, motherName: '', motherPhone: '', fatherName: '', fatherPhone: '',
    imageUrl: '', attendance: 92, performance: 90
  },
];

export default function TeamManagement() {
  const [players, setPlayers] = useState<Player[]>(mockPlayers);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState<Player>({
    id: '', firstName: '', lastName: '', dateOfBirth: '', position: 'Forward',
    jerseyNumber: 0, status: 'Active', playerPhone: '', height: 0, weight: 0,
    motherName: '', motherPhone: '', fatherName: '', fatherPhone: '', imageUrl: '',
    attendance: 0, performance: 0
  });

  // --- 2. LOAD DATA ---
  useEffect(() => {
    fetch('http://127.0.0.1:8000/players')
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
            // Map Snake_case from DB to CamelCase for Frontend
            const formatted = data.map((p: any) => ({
                id: p.id,
                firstName: p.first_name,
                lastName: p.last_name,
                dateOfBirth: p.date_of_birth,
                position: p.position,
                jerseyNumber: p.jersey_number,
                status: p.status,
                playerPhone: p.player_phone || '',
                height: p.height,
                weight: p.weight,
                motherName: p.mother_name || '',
                motherPhone: p.mother_phone || '',
                fatherName: p.father_name || '',
                fatherPhone: p.father_phone || '',
                imageUrl: p.image_url || '',
                attendance: p.attendance,
                performance: p.performance
            }));
            // Merge with mocks if needed, or just replace
            setPlayers(formatted);
        }
      })
      .catch(() => console.log("Backend offline - using mocks"));
  }, []);

  // --- 3. ACTIONS ---
  const handleSave = async () => {
    if (!formData.firstName || !formData.lastName) return toast.error('Name required');

    // Payload for Backend (snake_case)
    const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        date_of_birth: formData.dateOfBirth,
        position: formData.position,
        jersey_number: formData.jerseyNumber,
        status: formData.status,
        player_phone: formData.playerPhone,
        image_url: imagePreview || formData.imageUrl,
        height: formData.height,
        weight: formData.weight,
        mother_name: formData.motherName,
        mother_phone: formData.motherPhone,
        father_name: formData.fatherName,
        father_phone: formData.fatherPhone,
        attendance: formData.attendance,
        performance: formData.performance
    };

    try {
        let res;
        if (editingId && !editingId.startsWith('m')) {
            // UPDATE
            res = await fetch(`http://127.0.0.1:8000/players/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else if (!editingId) {
            // CREATE
            res = await fetch('http://127.0.0.1:8000/players', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        if (res && res.ok) {
            const saved = await res.json();
            const newItem = {
                id: saved.id,
                firstName: saved.first_name,
                lastName: saved.last_name,
                dateOfBirth: saved.date_of_birth,
                position: saved.position,
                jerseyNumber: saved.jersey_number,
                status: saved.status,
                playerPhone: saved.player_phone,
                height: saved.height,
                weight: saved.weight,
                motherName: saved.mother_name,
                motherPhone: saved.mother_phone,
                fatherName: saved.father_name,
                fatherPhone: saved.father_phone,
                imageUrl: saved.image_url,
                attendance: saved.attendance,
                performance: saved.performance
            };

            if (editingId) {
                setPlayers(prev => prev.map(p => p.id === newItem.id ? newItem : p));
                toast.success('Player updated');
            } else {
                setPlayers(prev => [...prev, newItem]);
                toast.success('Player created');
            }
            closeModal();
        } else {
            // Fallback for mocks
            if(editingId?.startsWith('m')) {
                toast.success('Mock player updated (local only)');
                setPlayers(prev => prev.map(p => p.id === editingId ? { ...formData, id: editingId } : p));
                closeModal();
            } else {
                toast.error('Save failed');
            }
        }
    } catch (e) {
        toast.error('Connection error');
    }
  };

  const handleDelete = async (id: string) => {
      if (!id.startsWith('m')) {
          await fetch(`http://127.0.0.1:8000/players/${id}`, { method: 'DELETE' });
      }
      setPlayers(prev => prev.filter(p => p.id !== id));
      toast.success('Player deleted');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const openCreate = () => {
      setEditingId(null);
      setImagePreview('');
      setFormData({
        id: '', firstName: '', lastName: '', dateOfBirth: '', position: 'Forward',
        jerseyNumber: 0, status: 'Active', playerPhone: '', height: 0, weight: 0,
        motherName: '', motherPhone: '', fatherName: '', fatherPhone: '', imageUrl: '',
        attendance: 0, performance: 0
      });
      setShowPlayerModal(true);
  };

  const openEdit = (player: Player) => {
      setEditingId(player.id);
      setFormData(player);
      setImagePreview(player.imageUrl);
      setShowPlayerModal(true);
  };

  const closeModal = () => setShowPlayerModal(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Injured': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'Away': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const filteredPlayers = players.filter(p => 
    p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Team Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage roster and player profiles</p>
        </div>
        <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg transition-colors">
          <Plus size={18} /> Create New Player
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-white dark:bg-[#1e2330] border border-gray-200 dark:border-slate-800 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#151922] border border-gray-200 dark:border-slate-800 rounded-lg px-4 py-2.5">
            <Search className="text-slate-400" size={18} />
            <input className="bg-transparent w-full outline-none dark:text-slate-200 placeholder-slate-500" 
                placeholder="Search players..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </div>

      {/* Players Table */}
      <div className="bg-white dark:bg-[#1e2330] border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-[#151922] border-b border-gray-200 dark:border-slate-800 text-xs uppercase text-gray-500 dark:text-slate-400 font-medium">
            <tr>
              <th className="px-6 py-4">#</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Position</th>
              <th className="px-6 py-4">Attendance</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
            {filteredPlayers.map((player) => (
              <tr key={player.id} className="hover:bg-gray-50 dark:hover:bg-[#252a3a] transition-colors group">
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-300">{player.jerseyNumber}</td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white font-bold overflow-hidden">
                            {player.imageUrl ? <img src={player.imageUrl} className="w-full h-full object-cover"/> : player.firstName[0]}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-slate-200">{player.firstName} {player.lastName}</span>
                    </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{player.position}</td>
                <td className="px-6 py-4">
                    <div className="w-24 bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${player.attendance}%` }}></div>
                    </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-medium border ${getStatusColor(player.status)}`}>
                    {player.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(player)} className="p-1.5 text-slate-500 hover:text-blue-500 transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(player.id)} className="p-1.5 text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPlayers.length === 0 && <div className="p-8 text-center text-slate-500">No players found.</div>}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showPlayerModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-[#1e2330] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 text-white border border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Player Profile' : 'Create New Player'}</h2>
              <button onClick={closeModal}><X className="text-slate-400 hover:text-white" /></button>
            </div>

            {/* Profile Photo Upload */}
            <div className="flex justify-center mb-8">
                <div className="relative group cursor-pointer">
                    <div className="w-24 h-24 rounded-full bg-[#151922] border-2 border-slate-700 flex items-center justify-center overflow-hidden">
                        {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover"/> : <span className="text-2xl text-blue-500 font-bold">?</span>}
                    </div>
                    <label className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full text-white hover:bg-blue-500 transition-colors cursor-pointer shadow-lg border-2 border-[#1e2330]">
                        <Camera size={14} />
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                </div>
            </div>

            <div className="space-y-6">
                {/* Basic Info */}
                <div>
                    <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-3">Basic Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">First Name *</label>
                            <input className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none transition-colors"
                                value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Last Name *</label>
                            <input className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none transition-colors"
                                value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Date of Birth</label>
                            <input type="date" className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none transition-colors text-slate-300"
                                value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Position</label>
                            <select className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none transition-colors"
                                value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})}>
                                <option>Forward</option><option>Midfielder</option><option>Defender</option><option>Goalkeeper</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Jersey Number</label>
                            <input type="number" className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none transition-colors"
                                value={formData.jerseyNumber} onChange={e => setFormData({...formData, jerseyNumber: parseInt(e.target.value) || 0})} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
                            <select className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none transition-colors"
                                value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                <option>Active</option><option>Injured</option><option>Away</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-3">Contact Information</h4>
                    <div className="w-full">
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Player's Mobile Phone</label>
                        <input className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none transition-colors"
                            placeholder="+1 (555) 000-0000" value={formData.playerPhone} onChange={e => setFormData({...formData, playerPhone: e.target.value})} />
                    </div>
                </div>

                {/* Parents Info */}
                <div>
                    <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-3">Parent Information</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Mother's Name</label>
                            <input className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none transition-colors"
                                value={formData.motherName} onChange={e => setFormData({...formData, motherName: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Mother's Phone</label>
                            <input className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none transition-colors"
                                value={formData.motherPhone} onChange={e => setFormData({...formData, motherPhone: e.target.value})} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Father's Name</label>
                            <input className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none transition-colors"
                                value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Father's Phone</label>
                            <input className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none transition-colors"
                                value={formData.fatherPhone} onChange={e => setFormData({...formData, fatherPhone: e.target.value})} />
                        </div>
                    </div>
                </div>

                {/* Physical Info */}
                <div>
                    <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-3">Physical Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Height (cm)</label>
                            <input type="number" className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none transition-colors"
                                value={formData.height} onChange={e => setFormData({...formData, height: parseInt(e.target.value) || 0})} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Weight (kg)</label>
                            <input type="number" className="w-full bg-[#151922] border border-slate-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none transition-colors"
                                value={formData.weight} onChange={e => setFormData({...formData, weight: parseInt(e.target.value) || 0})} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 mt-8 border-t border-slate-700 pt-4">
                <button onClick={closeModal} className="flex-1 py-3 border border-slate-600 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors font-medium">Cancel</button>
                <button onClick={handleSave} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium shadow-lg">
                    {editingId ? 'Update Player' : 'Create Player'}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}