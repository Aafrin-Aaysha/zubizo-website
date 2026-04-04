'use client';

import React, { useEffect, useState } from 'react';
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
    name: string;
    currentStock: number;
    unit: string;
    costPerUnit: number;
    lowStockThreshold: number;
    lastRestockedAt: string;
    isActive: boolean;
}

export default function InventoryPage() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        currentStock: 0,
        unit: 'pcs',
        costPerUnit: 0,
        lowStockThreshold: 10
    });
    const [restockAmount, setRestockAmount] = useState(0);

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/inventory');
            const data = await res.json();
            if (res.ok) setMaterials(data);
        } catch (error) {
            toast.error('Failed to load inventory');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddMaterial = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsActionLoading(true);
        try {
            const res = await fetch('/api/admin/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                toast.success('Material added successfully');
                setIsAddModalOpen(false);
                setFormData({ name: '', currentStock: 0, unit: 'pcs', costPerUnit: 0, lowStockThreshold: 10 });
                fetchMaterials();
            } else {
                const err = await res.json();
                toast.error(err.message || 'Failed to add material');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleRestock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMaterial) return;
        setIsActionLoading(true);
        try {
            const res = await fetch(`/api/admin/inventory/${selectedMaterial._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ restockAmount })
            });
            if (res.ok) {
                toast.success('Restocked successfully');
                setIsRestockModalOpen(false);
                setRestockAmount(0);
                fetchMaterials();
            }
        } catch (error) {
            toast.error('Failed to update stock');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this material?')) return;
        try {
            const res = await fetch(`/api/admin/inventory/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Material deleted');
                fetchMaterials();
            }
        } catch (error) {
            toast.error('Failed to delete material');
        }
    };

    const filteredMaterials = materials.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const lowStockCount = materials.filter(m => m.currentStock <= m.lowStockThreshold).length;
    const totalValue = materials.reduce((acc, m) => acc + (m.currentStock * m.costPerUnit), 0);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
                    <p className="text-gray-500 mt-1">Track material stock levels and manage procurement costs.</p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#1a1c23] hover:bg-black text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95"
                >
                    <Plus size={20} />
                    Add New Material
                </button>
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
                        <button onClick={fetchMaterials} className="p-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200">
                            <History size={18} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Material Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">In Stock</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cost/Unit</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Threshold</th>
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
                                            <td className="px-6 py-4 font-bold text-gray-900">{material.name}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className={`font-bold ${isLowStock ? 'text-amber-600' : 'text-gray-900'}`}>
                                                        {material.currentStock} {material.unit}
                                                    </span>
                                                    {isLowStock && (
                                                        <span className="text-[10px] text-amber-500 font-bold uppercase tracking-tight flex items-center gap-1">
                                                            <AlertTriangle size={10} /> Low Stock
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-600 italic">₹{material.costPerUnit}</td>
                                            <td className="px-6 py-4 font-medium text-gray-400">{material.lowStockThreshold}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => { setSelectedMaterial(material); setRestockAmount(0); setIsRestockModalOpen(true); }}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="Restock"
                                                    >
                                                        <ArrowUpRight size={18} />
                                                    </button>
                                                    <button 
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
                            className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl relative z-10 p-8"
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
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all font-medium"
                                        placeholder="e.g., Wax Seal, Satin Ribbon"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Initial Stock</label>
                                        <input 
                                            type="number" 
                                            value={formData.currentStock}
                                            onChange={(e) => setFormData({...formData, currentStock: parseInt(e.target.value)})}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-3xl focus:outline-none focus:border-purple-400 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Unit</label>
                                        <select 
                                            value={formData.unit}
                                            onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-3xl focus:outline-none focus:border-purple-400 transition-all font-medium"
                                        >
                                            <option value="pcs">Pieces (pcs)</option>
                                            <option value="kg">Kilograms (kg)</option>
                                            <option value="sheets">Sheets</option>
                                            <option value="meters">Meters</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Cost Per Unit (₹)</label>
                                        <input 
                                            type="number" 
                                            value={formData.costPerUnit}
                                            onChange={(e) => setFormData({...formData, costPerUnit: parseFloat(e.target.value)})}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-3xl focus:outline-none focus:border-purple-400 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Low Stock Threshold</label>
                                        <input 
                                            type="number" 
                                            value={formData.lowStockThreshold}
                                            onChange={(e) => setFormData({...formData, lowStockThreshold: parseInt(e.target.value)})}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-3xl focus:outline-none focus:border-purple-400 transition-all font-medium"
                                        />
                                    </div>
                                </div>
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
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Restock Material</h2>
                            <p className="text-gray-500 mb-8 border-l-4 border-emerald-400 pl-4">Add additional stock for <span className="font-bold text-gray-900">{selectedMaterial?.name}</span></p>
                            <form onSubmit={handleRestock} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Amount to Add ({selectedMaterial?.unit})</label>
                                    <input 
                                        type="number" 
                                        required
                                        autoFocus
                                        value={restockAmount}
                                        onChange={(e) => setRestockAmount(parseInt(e.target.value))}
                                        className="w-full px-6 py-6 bg-emerald-50/50 border border-emerald-100 rounded-3xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 transition-all font-bold text-2xl text-emerald-700 text-center"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center text-sm">
                                    <span className="text-gray-500">New Balance:</span>
                                    <span className="font-bold text-gray-900">{(selectedMaterial?.currentStock || 0) + restockAmount} {selectedMaterial?.unit}</span>
                                </div>
                                <button 
                                    type="submit"
                                    disabled={isActionLoading || restockAmount <= 0}
                                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[32px] font-bold text-lg shadow-xl shadow-emerald-900/10 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {isActionLoading ? <Loader2 className="animate-spin" /> : <Plus size={22} />}
                                    Confirm Restocking
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

