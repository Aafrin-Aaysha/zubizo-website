const fs = require('fs');

const code = "use client";

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Plus, Search, AlertTriangle, Package, Edit2, Trash2, 
    Loader2, X, ChevronLeft, ShoppingBag, Layers 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Material {
    _id: string;
    adminName?: string;
    name: string;
    category: string;
    usageType: string;
    usageValue: number;
    currentStock: number;
    unit: string;
    defaultPrice: number;
    lowStockThreshold: number;
    lastRestockedAt: string;
    isActive: boolean;
    size?: string;
    gsm?: string;
    trackInventory?: boolean;
    parentMaterialId?: any; // The populated parent
}

const CATEGORY_META: Record<string, { label: string; icon: string }> = {
    'Envelopes': { label: 'Envelopes', icon: '✉️' },
    'Chart Sheets': { label: 'Chart Sheets', icon: '📊' },
    'Vellum Paper': { label: 'Vellum Papers', icon: '📜' },
    'Add-ons': { label: 'Wax Seals & Add-ons', icon: '🕯️' },
    'Core Materials': { label: 'Ribbons & Core', icon: '🎀' },
    'Card Types': { label: 'Cards & Inserts', icon: '🃏' },
    'Packaging': { label: 'Packaging & Box', icon: '📦' }
};

const PRIMARY_CATEGORIES = [
    'Envelopes', 'Chart Sheets', 'Vellum Paper', 'Add-ons', 
    'Core Materials', 'Card Types', 'Packaging'
];

export default function InventoryPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    
    // View States
    const [activeCategory, setActiveCategory] = useState<string>('Envelopes');
    const [selectedParent, setSelectedParent] = useState<Material | null>(null);
    
    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [restockAmount, setRestockAmount] = useState(0);

    const [addFlowData, setAddFlowData] = useState({
        name: '', category: 'Envelopes', currentStock: 0, 
        unit: 'pcs', defaultPrice: 0, lowStockThreshold: 10,
        size: '', gsm: '', trackInventory: true,
        parentMaterialId: ''
    });
    
    const [editFormData, setEditFormData] = useState<any>(null);

    const { data: materials = [], isLoading } = useQuery<Material[]>({
        queryKey: ['inventory'],
        queryFn: async () => {
            const res = await fetch('/api/admin/inventory');
            if (!res.ok) throw new Error('Failed to load inventory');
            return res.json();
        }
    });

    const restockMutation = useMutation({
        mutationFn: async ({ id, amount }: { id: string, amount: number }) => {
            const res = await fetch(\/api/admin/inventory/\\, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ restockAmount: amount })
            });
            if (!res.ok) throw new Error('Failed to update stock');
            return res.json();
        },
        onSuccess: () => {
            toast.success('Stock adjusted successfully');
            setIsRestockModalOpen(false);
            setRestockAmount(0);
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
        },
        onError: () => toast.error('Failed to update stock')
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(\/api/admin/inventory/\\, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete material');
        },
        onSuccess: () => {
            toast.success('Material deleted');
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
        },
        onError: () => toast.error('Failed to delete material')
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string, data: any }) => {
            const res = await fetch(\/api/admin/inventory/\\, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error('Failed to update material');
            return res.json();
        },
        onSuccess: () => {
            toast.success('Material updated successfully');
            setIsEditModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
        },
        onError: () => toast.error('Failed to update material')
    });

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(addFlowData)
            });
            if (!res.ok) throw new Error('Failed to create material');
            toast.success('Material created!');
            setIsAddModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
        } catch (err) {
            toast.error('Error creating material');
        }
    };

    const handleRestock = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMaterial) return;
        restockMutation.mutate({ id: selectedMaterial._id, amount: Number(restockAmount) });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editFormData || !selectedMaterial) return;
        updateMutation.mutate({ id: selectedMaterial._id, data: editFormData });
    };

    const handleDelete = (id: string) => {
        if (!confirm('Are you sure you want to delete this?')) return;
        deleteMutation.mutate(id);
    };

    // Calculate display materials
    const displayMaterials = materials.filter(m => {
        if (m.category !== activeCategory) return false;
        if (searchQuery) {
            return m.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        if (selectedParent) {
            // Show variants of this parent
            return m.parentMaterialId?._id === selectedParent._id || m.parentMaterialId === selectedParent._id;
        } else {
            // Show only parents or standalone materials
            return !m.parentMaterialId;
        }
    });

    const stats = React.useMemo(() => {
        let totalValuation = 0;
        let lowStockCount = 0;
        materials.forEach(m => {
            if (m.trackInventory && m.parentMaterialId) {
                totalValuation += m.currentStock * m.defaultPrice;
                if (m.currentStock <= m.lowStockThreshold) lowStockCount++;
            }
        });
        return { totalValuation, lowStockCount };
    }, [materials]);

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-12 text-slate-700 text-sm font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                    <h2 className="text-2xl font-normal text-charcoal">Inventory Management</h2>
                    <p className="text-slate-400 text-xs mt-1 font-medium">Track your materials, stock, and values hierarchically.</p>
                </div>
                <div className="flex items-center gap-2">
                    {selectedParent && (
                        <button 
                            onClick={() => setSelectedParent(null)}
                            className="flex items-center gap-2 bg-white text-slate-500 border border-slate-200 px-5 py-2.5 rounded-xl hover:bg-slate-50 font-bold text-xs"
                        >
                            <ChevronLeft size={16} /> Back to {activeCategory}
                        </button>
                    )}
                    <button 
                        onClick={() => {
                            setAddFlowData({ 
                                ...addFlowData, 
                                category: activeCategory,
                                parentMaterialId: selectedParent ? selectedParent._id : ''
                            });
                            setIsAddModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-5 py-2.5 bg-[#ae7fcb] hover:bg-[#9a6ab5] text-white font-bold rounded-xl text-xs transition-all shadow-md"
                    >
                        <Plus size={16} strokeWidth={2.5} />
                        {selectedParent ? 'Add Variant' : 'Add Material'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            {!isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Inventory Value</span>
                            <span className="text-2xl font-black text-slate-800 tracking-tight block">₹{stats.totalValuation.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-[#ae7fcb]">
                            <ShoppingBag size={22} />
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Low Stock Alerts</span>
                            <span className={\	ext-2xl font-black tracking-tight block \\}>
                                {stats.lowStockCount} Items
                            </span>
                        </div>
                        <div className={\w-12 h-12 rounded-xl flex items-center justify-center \\}>
                            <AlertTriangle size={22} />
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tracked Variants</span>
                            <span className="text-2xl font-black text-slate-800 tracking-tight block">
                                {materials.filter(m => m.parentMaterialId).length} Total
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-[#EDE8F6] flex items-center justify-center text-[#6E4B8B]">
                            <Package size={22} />
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            {!selectedParent && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {PRIMARY_CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => { setActiveCategory(cat); setSelectedParent(null); }}
                            className={\px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap \\}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {/* Header/Search */}
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

            {/* Content Grid */}
            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#ae7fcb]" size={40} /></div>
            ) : displayMaterials.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <Package className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-slate-500 font-bold">No items found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayMaterials.map(m => {
                        const isParent = !m.parentMaterialId;
                        const children = materials.filter(child => child.parentMaterialId?._id === m._id || child.parentMaterialId === m._id);
                        
                        let totalStock = 0;
                        let totalValue = 0;
                        let isLowStock = false;

                        if (isParent) {
                            children.forEach(c => {
                                totalStock += c.currentStock;
                                totalValue += c.currentStock * c.defaultPrice;
                                if (c.currentStock <= c.lowStockThreshold) isLowStock = true;
                            });
                        } else {
                            totalStock = m.currentStock;
                            totalValue = m.currentStock * m.defaultPrice;
                            isLowStock = m.currentStock <= m.lowStockThreshold;
                        }

                        return (
                            <div key={m._id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-xl transition-all group flex flex-col justify-between">
                                <div>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                                            {isParent ? <Layers className="text-slate-400" size={24} /> : <div className="w-8 h-8 rounded-full shadow-inner" style={{ backgroundColor: m.name.toLowerCase().includes('blue') ? '#60a5fa' : m.name.toLowerCase().includes('red') ? '#f87171' : '#e2e8f0' }} />}
                                        </div>
                                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setSelectedMaterial(m); setEditFormData(m); setIsEditModalOpen(true); }} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><Edit2 size={14} /></button>
                                            <button onClick={() => handleDelete(m._id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{m.name}</h3>
                                    {isParent ? (
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{children.length} Variants</p>
                                    ) : (
                                        <div className="text-[11px] text-slate-500 font-medium mt-1">
                                            ₹{m.defaultPrice} / {m.unit}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-50">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Total Stock</span>
                                            <span className={\	ext-sm font-black \\}>
                                                {totalStock} {isParent ? 'Items' : m.unit}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Valuation</span>
                                            <span className="text-sm font-black text-slate-800">₹{totalValue.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                    
                                    {isParent ? (
                                        <button 
                                            onClick={() => setSelectedParent(m)}
                                            className="w-full py-2.5 bg-slate-50 hover:bg-[#ae7fcb] text-slate-600 hover:text-white rounded-xl text-xs font-bold transition-colors"
                                        >
                                            Manage Variants
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => { setSelectedMaterial(m); setIsRestockModalOpen(true); }}
                                            className="w-full py-2.5 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-xl text-xs font-bold transition-colors border border-transparent hover:border-emerald-200"
                                        >
                                            Adjust Stock
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modals */}
            <AnimatePresence>
                {/* Add Modal */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold">Add {selectedParent ? 'Variant' : 'Material'}</h3>
                                <button onClick={() => setIsAddModalOpen(false)}><X size={20} className="text-slate-400 hover:text-slate-700" /></button>
                            </div>
                            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Name</label>
                                    <input type="text" required value={addFlowData.name} onChange={e => setAddFlowData({...addFlowData, name: e.target.value})} className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#ae7fcb]" placeholder="e.g. Navy Blue" />
                                </div>
                                {selectedParent && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">Unit Price (₹)</label>
                                                <input type="number" required value={addFlowData.defaultPrice} onChange={e => setAddFlowData({...addFlowData, defaultPrice: Number(e.target.value)})} className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#ae7fcb]" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase">Initial Stock</label>
                                                <input type="number" required value={addFlowData.currentStock} onChange={e => setAddFlowData({...addFlowData, currentStock: Number(e.target.value)})} className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#ae7fcb]" />
                                            </div>
                                        </div>
                                    </>
                                )}
                                <button type="submit" className="w-full py-3 mt-4 bg-[#ae7fcb] hover:bg-[#9a6ab5] text-white font-bold rounded-xl transition-colors">Save</button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Restock Modal */}
                {isRestockModalOpen && selectedMaterial && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold">Adjust Stock: {selectedMaterial.name}</h3>
                                <button onClick={() => setIsRestockModalOpen(false)}><X size={20} className="text-slate-400 hover:text-slate-700" /></button>
                            </div>
                            <form onSubmit={handleRestock} className="p-6 space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Amount to add/remove</label>
                                    <input type="number" required value={restockAmount} onChange={e => setRestockAmount(Number(e.target.value))} className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-lg font-bold text-center" placeholder="+/- amount" />
                                    <p className="text-[10px] text-slate-400 mt-2 text-center">Current: {selectedMaterial.currentStock}. New: {selectedMaterial.currentStock + restockAmount}</p>
                                </div>
                                <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors">Confirm Adjustment</button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Edit Modal */}
                {isEditModalOpen && editFormData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold">Edit Properties</h3>
                                <button onClick={() => setIsEditModalOpen(false)}><X size={20} className="text-slate-400 hover:text-slate-700" /></button>
                            </div>
                            <form onSubmit={handleUpdate} className="p-6 space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Name</label>
                                    <input type="text" required value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#ae7fcb]" />
                                </div>
                                {!selectedParent && (
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                                        <select value={editFormData.category} onChange={e => setEditFormData({...editFormData, category: e.target.value})} className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#ae7fcb]">
                                            {PRIMARY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                )}
                                {editFormData.parentMaterialId && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase">Price (₹)</label>
                                            <input type="number" value={editFormData.defaultPrice} onChange={e => setEditFormData({...editFormData, defaultPrice: Number(e.target.value)})} className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#ae7fcb]" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase">Low Alert</label>
                                            <input type="number" value={editFormData.lowStockThreshold} onChange={e => setEditFormData({...editFormData, lowStockThreshold: Number(e.target.value)})} className="w-full mt-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#ae7fcb]" />
                                        </div>
                                    </div>
                                )}
                                <button type="submit" className="w-full py-3 mt-4 bg-[#ae7fcb] hover:bg-[#9a6ab5] text-white font-bold rounded-xl transition-colors">Update Items</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
;

fs.writeFileSync('src/app/admin/inventory/page.tsx', code, 'utf8');
console.log('Refactored inventory page');
