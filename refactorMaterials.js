const fs = require('fs');

const code = "use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, X, Loader2, Image as ImageIcon, ChevronLeft, Layers, ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const PRIMARY_CATEGORIES = ["Envelopes", "Wax Seals", "Chart Sheets", "Ribbons", "Paper Types"];

export default function MaterialsPage() {
    const [materials, setMaterials] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    // View State
    const [activeCategory, setActiveCategory] = useState(PRIMARY_CATEGORIES[0]);
    const [selectedParent, setSelectedParent] = useState<any>(null);

    // Form State
    const [name, setName] = useState('');
    const [category, setCategory] = useState(PRIMARY_CATEGORIES[0]);
    const [imageUrl, setImageUrl] = useState('');
    const [parentMaterialId, setParentMaterialId] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/materials');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            
            // Map legacy categories to new structure
            const mappedData = data.map((m: any) => {
                if (m.category === 'Envelope Shape') return { ...m, category: 'Envelopes' };
                if (m.category === 'Envelope Color') return { ...m, category: 'Envelopes', isSubOption: true };
                if (m.category === 'Wax Seal') return { ...m, category: 'Wax Seals' };
                if (m.category === 'Ribbon') return { ...m, category: 'Ribbons' };
                if (m.category === 'Paper Type') return { ...m, category: 'Paper Types' };
                return m;
            });
            
            setMaterials(Array.isArray(mappedData) ? mappedData : []);
        } catch (error) {
            toast.error('Failed to load materials');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.url) {
                setImageUrl(data.url);
                toast.success('Image uploaded!');
            } else {
                toast.error('Upload failed');
            }
        } catch (error) {
            toast.error('Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            name,
            category,
            imageUrl,
            parentMaterialId: parentMaterialId || null,
            isActive
        };

        try {
            const url = editingMaterial ? '/api/admin/materials/' + editingMaterial._id : '/api/admin/materials';
            const method = editingMaterial ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast.success(editingMaterial ? 'Material updated!' : 'Material added!');
                setIsModalOpen(false);
                fetchMaterials();
            } else {
                toast.error('Failed to save material');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this material?')) return;

        try {
            const res = await fetch('/api/admin/materials/' + id, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Material deleted!');
                fetchMaterials();
                if (selectedParent && selectedParent._id === id) setSelectedParent(null);
            } else {
                toast.error('Failed to delete material');
            }
        } catch (error) {
            toast.error('Something went wrong');
        }
    };

    const openModal = (material: any = null, forceParentId: string = '') => {
        setEditingMaterial(material);
        if (material) {
            setName(material.name);
            setCategory(material.category);
            setImageUrl(material.imageUrl);
            setParentMaterialId(material.parentMaterialId?._id || material.parentMaterialId || '');
            setIsActive(material.isActive);
        } else {
            setName('');
            setCategory(activeCategory);
            setImageUrl('');
            setParentMaterialId(forceParentId || (selectedParent ? selectedParent._id : ''));
            setIsActive(true);
        }
        setIsModalOpen(true);
    };

    // Filter Logic
    const parents = materials.filter(m => !m.parentMaterialId && m.category === activeCategory);
    const childrenOfSelected = selectedParent ? materials.filter(m => 
        (m.parentMaterialId?._id === selectedParent._id || m.parentMaterialId === selectedParent._id)
    ) : [];

    const displayItems = selectedParent ? childrenOfSelected : parents;
    const filteredItems = displayItems.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

    // When changing tabs, clear selected parent
    const handleTabChange = (cat: string) => {
        setActiveCategory(cat);
        setSelectedParent(null);
        setSearchQuery('');
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-serif text-[#6E4B8B] mb-2 flex items-center gap-3">
                        <ImageIcon className="text-[#6E4B8B]/50" />
                        Materials & Options
                    </h1>
                    <p className="text-slate-500">Manage {selectedParent ? \\ variants\ : 'your design materials hierarchically'}.</p>
                </div>
                <div className="flex gap-2">
                    {selectedParent && (
                        <button 
                            onClick={() => setSelectedParent(null)}
                            className="flex items-center gap-2 bg-white text-slate-500 border border-slate-200 px-5 py-3 rounded-xl hover:bg-slate-50 transition-all font-bold uppercase tracking-wider text-xs"
                        >
                            <ChevronLeft size={16} /> Back
                        </button>
                    )}
                    <button 
                        onClick={() => openModal(null, selectedParent ? selectedParent._id : '')}
                        className="flex items-center gap-2 bg-[#6E4B8B] text-white px-6 py-3 rounded-xl hover:bg-[#5a3d72] transition-all font-bold uppercase tracking-wider text-xs shadow-md hover:shadow-lg"
                    >
                        <Plus size={16} /> {selectedParent ? 'Add Variant' : 'Add Material'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            {!selectedParent && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {PRIMARY_CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => handleTabChange(cat)}
                            className={\px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap \\}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {/* Search */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                <Search className="text-slate-400" size={20} />
                <input 
                    type="text" 
                    placeholder={\Search \...\}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none focus:outline-none text-slate-700 font-medium"
                />
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-[#6E4B8B]" size={40} />
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <ImageIcon className="mx-auto text-slate-300 mb-4" size={48} />
                    <h3 className="text-lg font-bold text-charcoal mb-2">No {selectedParent ? 'Variants' : 'Materials'} Found</h3>
                    <p className="text-slate-500 mb-6 text-sm">You haven't added any {selectedParent ? \ariants for \\ : activeCategory} yet.</p>
                    <button 
                        onClick={() => openModal()}
                        className="text-[#6E4B8B] font-bold hover:underline text-sm"
                    >
                        + Add Your First {selectedParent ? 'Variant' : 'Material'}
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {filteredItems.map(material => {
                        // Count children if it's a parent
                        const childrenCount = materials.filter(m => m.parentMaterialId?._id === material._id || m.parentMaterialId === material._id).length;

                        return (
                            <div key={material._id} className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                                {/* Hover Actions */}
                                <div className="absolute inset-0 bg-black/50 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 z-10 p-4">
                                    {!selectedParent && (
                                        <button 
                                            onClick={() => setSelectedParent(material)}
                                            className="w-full bg-white text-charcoal font-black text-[10px] uppercase tracking-widest py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Layers size={14} /> Manage Variants ({childrenCount})
                                        </button>
                                    )}
                                    <div className="flex gap-2 w-full">
                                        <button 
                                            onClick={() => openModal(material)}
                                            className="flex-1 bg-white text-lavender font-bold py-2 rounded-lg hover:bg-gray-100 transition-colors flex justify-center"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(material._id)}
                                            className="flex-1 bg-white text-red-500 font-bold py-2 rounded-lg hover:bg-gray-100 transition-colors flex justify-center"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="aspect-square relative overflow-hidden bg-slate-50">
                                    {material.imageUrl ? (
                                        <img src={material.imageUrl} alt={material.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="text-slate-200" size={32} />
                                        </div>
                                    )}
                                    {!material.isActive && (
                                        <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded">Inactive</div>
                                    )}
                                </div>
                                <div className="p-4 text-center">
                                    <h3 className="font-bold text-slate-800 text-sm">{material.name}</h3>
                                    {!selectedParent && (
                                        <p className="text-[10px] text-slate-400 font-medium mt-1">{childrenCount} Variants</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 md:p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h2 className="text-2xl font-serif text-[#6E4B8B]">{editingMaterial ? 'Update Material' : 'Add Material'}</h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                        {selectedParent ? \Variant for \\ : activeCategory}
                                    </p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 hover:bg-white rounded-xl flex items-center justify-center transition-colors shadow-sm border border-gray-100"><X size={20} /></button>
                            </div>

                            <div className="p-6 md:p-8 overflow-y-auto">
                                <form id="material-form" onSubmit={handleSubmit} className="space-y-6">
                                    
                                    {/* Name & Category */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-charcoal uppercase tracking-widest block">Name</label>
                                            <input
                                                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-lavender outline-none transition-all font-bold text-sm"
                                                placeholder={selectedParent ? "e.g., Ruby Red" : "e.g., Square Pouch"}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-charcoal uppercase tracking-widest block">Category</label>
                                            <select
                                                value={category} onChange={(e) => setCategory(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-lavender outline-none transition-all font-bold text-sm"
                                                disabled={!!selectedParent}
                                            >
                                                {PRIMARY_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Parent Linkage */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-charcoal uppercase tracking-widest block flex items-center justify-between">
                                            Parent Material (Optional)
                                            <span className="text-gray-400 font-medium">For hierarchical linking</span>
                                        </label>
                                        <select
                                            value={parentMaterialId} onChange={(e) => setParentMaterialId(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-lavender outline-none transition-all font-bold text-sm"
                                            disabled={!!selectedParent} // Fixed if managing variants
                                        >
                                            <option value="">-- None (Top Level) --</option>
                                            {materials.filter(m => !m.parentMaterialId && m._id !== editingMaterial?._id).map(m => (
                                                <option key={m._id} value={m._id}>{m.name} ({m.category})</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Image Upload */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-charcoal uppercase tracking-widest block">Reference Image</label>
                                        <div className="flex items-center gap-4">
                                            {imageUrl && (
                                                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 relative group">
                                                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => setImageUrl('')} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                                                </div>
                                            )}
                                            <div className="flex-1 relative">
                                                <input
                                                    type="file" accept="image/*" onChange={handleUpload}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    disabled={isUploading}
                                                />
                                                <div className={\w-full px-4 py-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all \\}>
                                                    {isUploading ? <Loader2 className="animate-spin text-lavender" size={24} /> : <ImagePlus className="text-lavender" size={24} />}
                                                    <span className="text-xs font-bold text-charcoal">{isUploading ? 'Uploading...' : 'Click to upload image'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer select-none">
                                        <div className="relative">
                                            <input type="checkbox" className="sr-only peer" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-charcoal uppercase tracking-widest">Active Status</div>
                                            <div className="text-[10px] text-gray-500">Inactive materials are hidden from users.</div>
                                        </div>
                                    </label>
                                </form>
                            </div>

                            <div className="p-6 md:p-8 border-t border-gray-50 flex items-center justify-end gap-3 bg-white">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-charcoal transition-colors">Cancel</button>
                                <button 
                                    type="submit" form="material-form" disabled={isSubmitting}
                                    className="bg-charcoal hover:bg-black text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-charcoal/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : (editingMaterial ? 'Update' : 'Publish')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
;

fs.writeFileSync('src/app/admin/materials/page.tsx', code, 'utf8');
console.log('Successfully wrote refactored MaterialsPage.');
