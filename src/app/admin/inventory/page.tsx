'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Plus, 
    Search, 
    AlertTriangle, 
    Package, 
    TrendingDown, 
    Edit, 
    Trash2, 
    Loader2, 
    ArrowUpRight,
    Filter,
    X,
    Save,
    History
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
}

export default function InventoryPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [adminFilter, setAdminFilter] = useState('all');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
 
    // Form states
    const [formData, setFormData] = useState({
        name: '', 
        category: 'Core Materials', 
        usageType: 'manual', 
        usageValue: 1, 
        currentStock: 0, 
        unit: 'pcs', 
        defaultPrice: 0, 
        lowStockThreshold: 10, 
        applyToAll: false,
        size: '',
        gsm: '',
        trackInventory: true
    });
    const [editFormData, setEditFormData] = useState<any>(null);
    const [syncToAll, setSyncToAll] = useState(false);
    const [restockAmount, setRestockAmount] = useState(0);

    const { data: adminData = null } = useQuery<{role: string, id: string} | null>({
        queryKey: ['adminAccount'],
        queryFn: async () => {
            const res = await fetch('/api/admin/account');
            return res.ok ? res.json() : null;
        }
    });

    const { data: allAdmins = [] } = useQuery<any[]>({
        queryKey: ['allAdmins'],
        queryFn: async () => {
            const res = await fetch('/api/admin/list');
            return res.ok ? res.json() : [];
        },
        enabled: adminData?.role === 'super-admin'
    });

    const { data: materials = [], isLoading } = useQuery<Material[]>({
        queryKey: ['inventory'],
        queryFn: async () => {
            const res = await fetch('/api/admin/inventory');
            if (!res.ok) throw new Error('Failed to load inventory');
            return res.json();
        }
    });

    const addMutation = useMutation({
        mutationFn: async (payload: any) => {
            const res = await fetch('/api/admin/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error((await res.json()).message || 'Failed to add material');
            return res.json();
        },
        onSuccess: () => {
            toast.success('Material added successfully');
            setIsAddModalOpen(false);
            setFormData({ 
                name: '', 
                category: 'Core Materials', 
                usageType: 'manual', 
                usageValue: 1, 
                currentStock: 0, 
                unit: 'pcs', 
                defaultPrice: 0, 
                lowStockThreshold: 10, 
                applyToAll: false,
                size: '',
                gsm: '',
                trackInventory: true
            });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
        },
        onError: (err: any) => toast.error(err.message)
    });

    const handleAddMaterial = (e: React.FormEvent) => {
        e.preventDefault();
        addMutation.mutate({
            ...formData,
            usageValue: Number(formData.usageValue) || 1,
            currentStock: Number(formData.currentStock) || 0,
            defaultPrice: Number(formData.defaultPrice) || 0,
            lowStockThreshold: Number(formData.lowStockThreshold) || 10
        });
    };

    const restockMutation = useMutation({
        mutationFn: async ({ id, amount }: { id: string, amount: number }) => {
            const res = await fetch(`/api/admin/inventory/${id}`, {
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

    const handleRestock = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMaterial) return;
        restockMutation.mutate({ id: selectedMaterial._id, amount: Number(restockAmount) });
    };

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/admin/inventory/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete material');
        },
        onSuccess: () => {
            toast.success('Material deleted');
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
        },
        onError: () => toast.error('Failed to delete material')
    });

    const handleDelete = (id: string) => {
        if (!confirm('Are you sure you want to delete this material?')) return;
        deleteMutation.mutate(id);
    };

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string, data: any }) => {
            const res = await fetch(`/api/admin/inventory/${id}`, {
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

    const handleUpdateMaterial = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editFormData || !selectedMaterial) return;
        updateMutation.mutate({ id: selectedMaterial._id, data: { ...editFormData, syncToAll } });
    };

    const isActionLoading = addMutation.isPending || restockMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

    const filteredMaterials = materials.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (m.adminName && m.adminName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (m.category && m.category.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesAdmin = adminFilter === 'all' || m.adminName === adminFilter;
        
        return matchesSearch && matchesAdmin;
    });

    const uniqueAdmins = adminData?.role === 'super-admin' 
        ? allAdmins.map(a => a.name) 
        : Array.from(new Set(materials.map(m => m.adminName).filter(Boolean))) as string[];

    const lowStockCount = materials.filter(m => m.currentStock <= m.lowStockThreshold && m.usageType !== 'manual').length;
    const totalValue = materials.reduce((acc, m) => acc + (m.currentStock * m.defaultPrice), 0);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
                    <p className="text-gray-500 mt-1">Track material stock levels and manage procurement costs.</p>
                </div>
                <div className="flex items-center gap-3">
                    {adminData?.role === 'super-admin' && (
                        <select 
                            value={adminFilter}
                            onChange={(e) => setAdminFilter(e.target.value)}
                            className="px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-charcoal outline-none focus:ring-2 focus:ring-purple-100"
                        >
                            <option value="all">All Admins</option>
                            {uniqueAdmins.map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    )}
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-[#1a1c23] hover:bg-black text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95"
                    >
                        <Plus size={20} />
                        Add New Material
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5"
                >
                    <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Items</p>
                        <h3 className="text-2xl font-bold text-gray-900">{materials.length}</h3>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5"
                >
                    <div className={lowStockCount > 0 ? "p-4 bg-amber-50 text-amber-600 rounded-2xl animate-pulse" : "p-4 bg-green-50 text-green-600 rounded-2xl"}>
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Low Stock Alerts</p>
                        <h3 className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-amber-600' : 'text-gray-900'}`}>{lowStockCount}</h3>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5"
                >
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                        <TrendingDown size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Stock Value</p>
                        <h3 className="text-2xl font-bold text-gray-900">₹{totalValue.toLocaleString()}</h3>
                    </div>
                </motion.div>
            </div>

            {/* Inventory List */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search materials..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200">
                            <Filter size={18} />
                        </button>
                        <button onClick={() => queryClient.invalidateQueries({ queryKey: ['inventory'] })} className="p-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200">
                            <History size={18} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Item Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">In Stock</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Logic</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Dflt Price</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <Loader2 className="animate-spin text-purple-500 mx-auto" size={32} />
                                        <p className="text-gray-400 mt-2">Loading inventory...</p>
                                    </td>
                                </tr>
                            ) : filteredMaterials.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        No materials found.
                                    </td>
                                </tr>
                            ) : (
                                filteredMaterials.map((material) => {
                                    const isLowStock = material.currentStock <= material.lowStockThreshold;
                                    return (
                                        <motion.tr 
                                            key={material._id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-gray-50/50 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{material.name}</div>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{material.category} {material.adminName ? `• ${material.adminName}` : ''}</span>
                                                    {(material.size || material.gsm) && (
                                                        <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-md font-bold border border-purple-100 flex items-center gap-1">
                                                            {material.size && <span>{material.size}</span>}
                                                            {material.size && material.gsm && <span>•</span>}
                                                            {material.gsm && <span>{material.gsm}gsm</span>}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    {material.trackInventory !== false ? (
                                                        <>
                                                            <span className={`font-bold ${isLowStock && material.usageType !== 'manual' ? 'text-amber-600' : 'text-gray-900'}`}>
                                                                {material.currentStock} {material.unit}
                                                            </span>
                                                            {isLowStock && material.usageType !== 'manual' && (
                                                                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-tight flex items-center gap-1">
                                                                    <AlertTriangle size={10} /> Low Stock (Thr: {material.lowStockThreshold})
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-black uppercase tracking-widest border border-blue-100 w-fit">
                                                            Outsourced
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-lavender">{material.usageType}</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Val: {material.usageValue}</div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-600 italic">₹{material.defaultPrice}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => { setSelectedMaterial(material); setRestockAmount(0); setIsRestockModalOpen(true); }}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="Adjust Stock"
                                                    >
                                                        <ArrowUpRight size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => { 
                                                            setSelectedMaterial(material); 
                                                            setEditFormData({
                                                                name: material.name,
                                                                category: material.category,
                                                                usageType: material.usageType,
                                                                usageValue: material.usageValue,
                                                                unit: material.unit,
                                                                defaultPrice: material.defaultPrice,
                                                                lowStockThreshold: material.lowStockThreshold,
                                                                size: material.size || '',
                                                                gsm: material.gsm || '',
                                                                trackInventory: material.trackInventory !== undefined ? material.trackInventory : true
                                                            });
                                                            setSyncToAll(false);
                                                            setIsEditModalOpen(true); 
                                                        }}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(material._id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[40px] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl relative z-10 p-8"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 leading-tight">Add New Material</h2>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleAddMaterial} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Material Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all font-medium"
                                        placeholder="e.g., Wax Seal, Satin Ribbon"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Category</label>
                                        <select 
                                            value={formData.category}
                                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-purple-400 transition-all font-medium"
                                        >
                                            <option value="Core Materials">Core Materials</option>
                                            <option value="Envelopes">Envelopes</option>
                                            <option value="Chart Sheets">Chart Sheets</option>
                                            <option value="Packaging">Packaging</option>
                                            <option value="Add-ons">Add-ons</option>
                                            <option value="Card Types">Card Types</option>
                                            <option value="Vellum Paper">Vellum Paper</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Usage Type</label>
                                        <select 
                                            value={formData.usageType}
                                            onChange={(e) => setFormData({...formData, usageType: e.target.value})}
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-purple-400 transition-all font-medium"
                                        >
                                            <option value="manual">Manual</option>
                                            <option value="per_card">Per Card</option>
                                            <option value="ratio">Ratio</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Size (e.g., A4, 5x7)</label>
                                        <input 
                                            type="text" 
                                            value={formData.size}
                                            onChange={(e) => setFormData({...formData, size: e.target.value})}
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-purple-400 transition-all font-medium"
                                            placeholder="Standard/A4"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">GSM (e.g., 300)</label>
                                        <input 
                                            type="text" 
                                            value={formData.gsm}
                                            onChange={(e) => setFormData({...formData, gsm: e.target.value})}
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-purple-400 transition-all font-medium"
                                            placeholder="300"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <input 
                                        type="checkbox" 
                                        id="trackInventory"
                                        checked={formData.trackInventory}
                                        onChange={(e) => setFormData({...formData, trackInventory: e.target.checked})}
                                        className="w-5 h-5 rounded accent-emerald-600"
                                    />
                                    <label htmlFor="trackInventory" className="text-sm font-bold text-emerald-900">
                                        Track Stock Inventory (Turn off for outsourced cards)
                                    </label>
                                </div>
                                {formData.trackInventory && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-gray-700 ml-1">Initial Stock</label>
                                            <input 
                                                type="number" 
                                                value={formData.currentStock === 0 ? '' : formData.currentStock}
                                                onChange={(e) => setFormData({...formData, currentStock: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                                                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-purple-400 transition-all font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">Unit</label>
                                            <select 
                                                value={formData.unit}
                                                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-purple-400 transition-all font-medium"
                                            >
                                                <option value="pcs">Pieces (pcs)</option>
                                                <option value="kg">Kilograms (kg)</option>
                                                <option value="sheets">Sheets</option>
                                                <option value="meters">Meters</option>
                                                <option value="rolls">Rolls</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                                {!formData.trackInventory && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Unit</label>
                                        <select 
                                            value={formData.unit}
                                            onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-purple-400 transition-all font-medium"
                                        >
                                            <option value="pcs">Pieces (pcs)</option>
                                            <option value="kg">Kilograms (kg)</option>
                                            <option value="sheets">Sheets</option>
                                            <option value="meters">Meters</option>
                                            <option value="rolls">Rolls</option>
                                        </select>
                                    </div>
                                )}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-gray-700 ml-1">Default Price (₹)</label>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            value={formData.defaultPrice === 0 ? '' : formData.defaultPrice}
                                            onChange={(e) => setFormData({...formData, defaultPrice: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-purple-400 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-gray-700 ml-1">Logic Val (e.g. 0.066)</label>
                                        <input 
                                            type="number" 
                                            step="0.0001"
                                            value={formData.usageValue === 0 ? '' : formData.usageValue}
                                            onChange={(e) => setFormData({...formData, usageValue: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-purple-400 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-gray-700 ml-1">Low Thrsh</label>
                                        <input 
                                            type="number" 
                                            value={formData.lowStockThreshold === 0 ? '' : formData.lowStockThreshold}
                                            onChange={(e) => setFormData({...formData, lowStockThreshold: e.target.value === '' ? 0 : parseInt(e.target.value)})}
                                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-purple-400 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                                {adminData?.role === 'super-admin' && (
                                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                        <input 
                                            type="checkbox" 
                                            id="applyToAll"
                                            checked={formData.applyToAll}
                                            onChange={(e) => setFormData({...formData, applyToAll: e.target.checked})}
                                            className="w-5 h-5 rounded accent-purple-600"
                                        />
                                        <label htmlFor="applyToAll" className="text-sm font-bold text-purple-900">
                                            Create for all Admins (Standardized List)
                                        </label>
                                    </div>
                                )}
                                <button 
                                    type="submit"
                                    disabled={isActionLoading}
                                    className="w-full py-5 bg-[#1a1c23] hover:bg-black text-white rounded-[32px] font-bold text-lg shadow-xl shadow-purple-900/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {isActionLoading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                    Save Material
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {isRestockModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsRestockModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[40px] w-full max-w-sm overflow-hidden shadow-2xl relative z-10 p-8"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Adjust Stock</h2>
                            <p className="text-gray-500 mb-8 border-l-4 border-emerald-400 pl-4">Add or reduce stock for <span className="font-bold text-gray-900">{selectedMaterial?.name}</span></p>
                            <form onSubmit={handleRestock} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Amount to Add/Reduce (Use - for reduction)</label>
                                    <input 
                                        type="number" 
                                        required
                                        autoFocus
                                        value={restockAmount === 0 ? '' : restockAmount}
                                        onChange={(e) => setRestockAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                                        onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                        className="w-full px-6 py-6 bg-emerald-50/50 border border-emerald-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 transition-all font-bold text-2xl text-emerald-700 text-center"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center text-sm">
                                    <span className="text-gray-500">New Balance:</span>
                                    <span className="font-bold text-gray-900">{(selectedMaterial?.currentStock || 0) + (Number(restockAmount) || 0)} {selectedMaterial?.unit}</span>
                                </div>
                                <button 
                                    type="submit"
                                    disabled={isActionLoading || !restockAmount || Number(restockAmount) === 0 || ((selectedMaterial?.currentStock || 0) + Number(restockAmount) < 0)}
                                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[32px] font-bold text-lg shadow-xl shadow-emerald-900/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {isActionLoading ? <Loader2 className="animate-spin" /> : <Plus size={22} />}
                                    Confirm Adjustment
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
                {isEditModalOpen && selectedMaterial && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[40px] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl relative z-10 p-8"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 leading-tight">Edit Material</h2>
                                <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleUpdateMaterial} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Material Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={editFormData.name}
                                        onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                                        className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all font-medium"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Category</label>
                                        <select 
                                            value={editFormData.category}
                                            onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-purple-400 transition-all font-medium"
                                        >
                                            <option value="Core Materials">Core Materials</option>
                                            <option value="Envelopes">Envelopes</option>
                                            <option value="Chart Sheets">Chart Sheets</option>
                                            <option value="Packaging">Packaging</option>
                                            <option value="Add-ons">Add-ons</option>
                                            <option value="Card Types">Card Types</option>
                                            <option value="Vellum Paper">Vellum Paper</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Usage Type</label>
                                        <select 
                                            value={editFormData.usageType}
                                            onChange={(e) => setEditFormData({...editFormData, usageType: e.target.value})}
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-purple-400 transition-all font-medium"
                                        >
                                            <option value="manual">Manual</option>
                                            <option value="per_card">Per Card</option>
                                            <option value="ratio">Ratio</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Size (e.g., A4, 5x7)</label>
                                        <input 
                                            type="text" 
                                            value={editFormData.size}
                                            onChange={(e) => setEditFormData({...editFormData, size: e.target.value})}
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-purple-400 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">GSM (e.g., 300)</label>
                                        <input 
                                            type="text" 
                                            value={editFormData.gsm}
                                            onChange={(e) => setEditFormData({...editFormData, gsm: e.target.value})}
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-purple-400 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <input 
                                        type="checkbox" 
                                        id="editTrackInventory"
                                        checked={editFormData.trackInventory}
                                        onChange={(e) => setEditFormData({...editFormData, trackInventory: e.target.checked})}
                                        className="w-5 h-5 rounded accent-emerald-600"
                                    />
                                    <label htmlFor="editTrackInventory" className="text-sm font-bold text-emerald-900">
                                        Track Stock Inventory (Turn off for outsourced cards)
                                    </label>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-gray-700 ml-1">Default Price (₹)</label>
                                        <input 
                                            type="number" 
                                            value={editFormData.defaultPrice === 0 ? '' : editFormData.defaultPrice}
                                            onChange={(e) => setEditFormData({...editFormData, defaultPrice: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-purple-400 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-gray-700 ml-1">Logic Val</label>
                                        <input 
                                            type="number" 
                                            step="0.0001"
                                            value={editFormData.usageValue === 0 ? '' : editFormData.usageValue}
                                            onChange={(e) => setEditFormData({...editFormData, usageValue: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-purple-400 transition-all font-medium"
                                        />
                                    </div>
                                    {editFormData.trackInventory && (
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-gray-700 ml-1">Low Thrsh</label>
                                            <input 
                                                type="number" 
                                                value={editFormData.lowStockThreshold === 0 ? '' : editFormData.lowStockThreshold}
                                                onChange={(e) => setEditFormData({...editFormData, lowStockThreshold: e.target.value === '' ? 0 : parseInt(e.target.value)})}
                                                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-purple-400 transition-all font-medium"
                                            />
                                        </div>
                                    )}
                                </div>

                                {adminData?.role === 'super-admin' && (
                                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                        <input 
                                            type="checkbox" 
                                            id="syncToAll"
                                            checked={syncToAll}
                                            onChange={(e) => setSyncToAll(e.target.checked)}
                                            className="w-5 h-5 rounded accent-blue-600"
                                        />
                                        <label htmlFor="syncToAll" className="text-sm font-bold text-blue-900">
                                            Sync this Pricing/Logic to ALL Admins
                                        </label>
                                    </div>
                                )}

                                <button 
                                    type="submit"
                                    disabled={isActionLoading}
                                    className="w-full py-5 bg-[#1a1c23] hover:bg-black text-white rounded-[32px] font-bold text-lg shadow-xl shadow-purple-900/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {isActionLoading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                    Update Material
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

