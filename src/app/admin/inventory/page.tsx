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
    X,
    Save,
    History,
    ChevronRight,
    ChevronDown,
    Tag,
    Calendar,
    ShoppingBag
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

const CATEGORY_META: Record<string, { label: string; icon: string }> = {
    'Envelopes': { label: 'Envelopes', icon: '✉️' },
    'Chart Sheets': { label: 'Chart Sheets', icon: '📊' },
    'Vellum Paper': { label: 'Vellum Papers', icon: '📜' },
    'Add-ons': { label: 'Wax Seals & Add-ons', icon: '🕯️' },
    'Core Materials': { label: 'Ribbons & Core', icon: '🎀' },
    'Card Types': { label: 'Cards & Inserts', icon: '🃏' },
    'Packaging': { label: 'Packaging & Box', icon: '📦' }
};

const COLOR_MAP: Record<string, string> = {
    'white': '#ffffff',
    'ivory': '#fffff0',
    'blue': '#60a5fa',
    'purple': '#c084fc',
    'green': '#4ade80',
    'maroon': '#800000',
    'marron': '#800000',
    'red': '#f87171',
    'black': '#1e293b',
    'brown': '#b45309',
    'craft brown': '#d97706',
    'craftbrown': '#d97706',
    'lavender': '#e9d5ff',
    'pink': '#f472b6',
    'gold': '#fbbf24',
    'silver': '#cbd5e1',
    'orange': '#fb923c',
    'yellow': '#facc15',
    'navy': '#1e3a8a',
    'emerald': '#10b981',
    'teal': '#14b8a6',
    'gray': '#94a3b8',
    'grey': '#94a3b8'
};

const getColorStyle = (variantName: string) => {
    const key = variantName.toLowerCase().trim();
    if (COLOR_MAP[key]) return COLOR_MAP[key];
    const match = Object.keys(COLOR_MAP).find(k => key.includes(k));
    if (match) return COLOR_MAP[match];
    return null;
};

const parseMaterialName = (fullName: string) => {
    const parts = fullName.split(/\s*-\s*/);
    const materialName = parts[0].trim();
    const variantName = parts.length > 1 ? parts.slice(1).join(' - ').trim() : 'Default';
    return { materialName, variantName };
};

const HighlightText = ({ text, search }: { text: string; search: string }) => {
    if (!search) return <span>{text}</span>;
    const regex = new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
        <span>
            {parts.map((part, i) => 
                regex.test(part) ? (
                    <mark key={i} className="bg-purple-100 text-[#a855f7] font-bold px-0.5 rounded">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </span>
    );
};

export default function InventoryPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
    const [adminFilter, setAdminFilter] = useState('all');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    // Explorer selected states
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [activeMaterial, setActiveMaterial] = useState<string | null>(null);
    
    // Mobile accordion state
    const [mobileExpandedMat, setMobileExpandedMat] = useState<string | null>(null);

    // Responsive helper
    const [windowWidth, setWindowWidth] = useState(1024);
    useEffect(() => {
        setWindowWidth(window.innerWidth);
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const isMobile = windowWidth < 1024;

    // Add flow modal state
    const [addFlowStep, setAddFlowStep] = useState(1);
    const [addFlowData, setAddFlowData] = useState({
        category: 'Core Materials',
        materialName: '',
        variantType: 'Color',
        variantValuesText: '',
        variantValuesList: [] as string[],
        unit: 'pcs',
        currentStock: 0,
        defaultPrice: 0,
        lowStockThreshold: 10,
        trackInventory: true,
        size: '',
        gsm: '',
        applyToAll: false
    });
    const [isSubmittingAddFlow, setIsSubmittingAddFlow] = useState(false);

    // Edit form states
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
        if (!confirm('Are you sure you want to delete this variant?')) return;
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

    const isActionLoading = restockMutation.isPending || updateMutation.isPending || deleteMutation.isPending || isSubmittingAddFlow;

    // Filter & Process Hierarchical Grouping
    const filteredMaterials = materials.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (m.adminName && m.adminName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (m.category && m.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (m.size && m.size.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (m.gsm && m.gsm.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesAdmin = adminFilter === 'all' || m.adminName === adminFilter;
        
        return matchesSearch && matchesAdmin;
    });

    const getGroupedData = (rawMaterials: Material[]) => {
        const categoriesMap: Record<string, {
            name: string;
            label: string;
            icon: string;
            materialsMap: Record<string, {
                name: string;
                variants: (Material & { variantName: string })[];
            }>;
        }> = {};

        rawMaterials.forEach(item => {
            const cat = item.category || 'Core Materials';
            const meta = CATEGORY_META[cat] || { label: cat, icon: '📦' };

            if (!categoriesMap[cat]) {
                categoriesMap[cat] = {
                    name: cat,
                    label: meta.label,
                    icon: meta.icon,
                    materialsMap: {}
                };
            }

            const { materialName, variantName } = parseMaterialName(item.name);
            const catGroup = categoriesMap[cat];

            if (!catGroup.materialsMap[materialName]) {
                catGroup.materialsMap[materialName] = {
                    name: materialName,
                    variants: []
                };
            }

            catGroup.materialsMap[materialName].variants.push({
                ...item,
                variantName
            });
        });

        return Object.values(categoriesMap).map(cat => {
            const materialsList = Object.values(cat.materialsMap).map(mat => ({
                name: mat.name,
                variants: mat.variants.sort((a, b) => a.variantName.localeCompare(b.variantName))
            })).sort((a, b) => a.name.localeCompare(b.name));

            const totalMaterials = materialsList.length;
            let totalVariants = 0;
            let totalStockValue = 0;

            materialsList.forEach(mat => {
                totalVariants += mat.variants.length;
                mat.variants.forEach(v => {
                    if (v.trackInventory !== false) {
                        totalStockValue += (v.currentStock * v.defaultPrice);
                    }
                });
            });

            return {
                name: cat.name,
                label: cat.label,
                icon: cat.icon,
                materials: materialsList,
                totalMaterials,
                totalVariants,
                totalStockValue
            };
        }).sort((a, b) => a.label.localeCompare(b.label));
    };

    const groupedData = getGroupedData(filteredMaterials);

    // Auto-select first material when category is clicked
    useEffect(() => {
        if (activeCategory) {
            const currentCat = groupedData.find(c => c.name === activeCategory);
            if (currentCat) {
                if (!activeMaterial || !currentCat.materials.find(m => m.name === activeMaterial)) {
                    if (currentCat.materials.length > 0) {
                        setActiveMaterial(currentCat.materials[0].name);
                    } else {
                        setActiveMaterial(null);
                    }
                }
            } else {
                setActiveCategory(null);
                setActiveMaterial(null);
            }
        } else {
            setActiveMaterial(null);
        }
    }, [filteredMaterials, activeCategory, activeMaterial]);

    const activeCatData = groupedData.find(c => c.name === activeCategory);
    const activeMatData = activeCatData?.materials.find(m => m.name === activeMaterial);

    const lowStockCount = materials.filter(m => m.currentStock <= m.lowStockThreshold && m.usageType !== 'manual').length;
    const totalValue = materials.reduce((acc, m) => acc + (m.currentStock * m.defaultPrice), 0);
    const lowStockMaterials = materials.filter(m => m.currentStock <= m.lowStockThreshold && m.usageType !== 'manual' && m.isActive !== false);

    const uniqueAdmins = adminData?.role === 'super-admin' 
        ? allAdmins.map(a => a.name) 
        : Array.from(new Set(materials.map(m => m.adminName).filter(Boolean))) as string[];

    // Add Flow handlers
    const addTag = () => {
        const val = addFlowData.variantValuesText.trim().replace(/,/g, '');
        if (val && !addFlowData.variantValuesList.includes(val)) {
            setAddFlowData({
                ...addFlowData,
                variantValuesList: [...addFlowData.variantValuesList, val],
                variantValuesText: ''
            });
        }
    };

    const removeTag = (tag: string) => {
        setAddFlowData({
            ...addFlowData,
            variantValuesList: addFlowData.variantValuesList.filter(t => t !== tag)
        });
    };

    const handleAddFlowSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!addFlowData.materialName) {
            toast.error("Please specify a material name");
            return;
        }

        const variantsToCreate = addFlowData.variantValuesList.length > 0 
            ? addFlowData.variantValuesList 
            : ['Default'];
            
        setIsSubmittingAddFlow(true);
        let successCount = 0;
        
        try {
            for (const variantVal of variantsToCreate) {
                const finalName = variantVal === 'Default' 
                    ? addFlowData.materialName 
                    : `${addFlowData.materialName} - ${variantVal}`;
                    
                const payload = {
                    name: finalName,
                    category: addFlowData.category,
                    usageType: 'manual',
                    usageValue: 1,
                    currentStock: Number(addFlowData.currentStock) || 0,
                    unit: addFlowData.unit,
                    defaultPrice: Number(addFlowData.defaultPrice) || 0,
                    lowStockThreshold: Number(addFlowData.lowStockThreshold) || 10,
                    size: addFlowData.size,
                    gsm: addFlowData.gsm,
                    trackInventory: addFlowData.trackInventory,
                    applyToAll: addFlowData.applyToAll
                };
                
                const res = await fetch('/api/admin/inventory', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.message || `Failed to create variant ${variantVal}`);
                }
                successCount++;
            }
            
            toast.success(`Successfully created ${successCount} variant(s)!`);
            setIsAddModalOpen(false);
            setAddFlowStep(1);
            setAddFlowData({
                category: 'Core Materials',
                materialName: '',
                variantType: 'Color',
                variantValuesText: '',
                variantValuesList: [],
                unit: 'pcs',
                currentStock: 0,
                defaultPrice: 0,
                lowStockThreshold: 10,
                trackInventory: true,
                size: '',
                gsm: '',
                applyToAll: false
            });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
        } catch (err: any) {
            toast.error(err.message || "Failed to create materials");
        } finally {
            setIsSubmittingAddFlow(false);
        }
    };

    const getMockHistory = (material: Material) => {
        const baseDate = material.lastRestockedAt ? new Date(material.lastRestockedAt) : new Date();
        return [
            {
                date: baseDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                user: material.adminName || 'Afrose S',
                action: 'Stock Adjustment',
                detail: `Adjusted current balance to ${material.currentStock} ${material.unit}`,
                type: 'adjust'
            },
            {
                date: new Date(baseDate.getTime() - 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                user: 'System Sync',
                action: 'Invoice Deduction',
                detail: `Deducted 12 ${material.unit} for Order #1054`,
                type: 'deduct'
            },
            {
                date: new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                user: material.adminName || 'Afrose S',
                action: 'Manual Restock',
                detail: `Added 100 ${material.unit} to inventory`,
                type: 'restock'
            }
        ];
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-12 text-slate-700 text-sm font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 leading-tight">Inventory Management</h1>
                    <p className="text-slate-400 text-xs mt-0.5 font-medium">Track your luxury studio materials, sheets, and envelopes with premium variants hierarchy.</p>
                </div>
                <div className="flex items-center gap-3">
                    {adminData?.role === 'super-admin' && (
                        <select 
                            value={adminFilter}
                            onChange={(e) => setAdminFilter(e.target.value)}
                            className="px-4 py-2.5 bg-white border border-purple-100 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-purple-100 transition-all cursor-pointer shadow-sm"
                        >
                            <option value="all">All Admin Accounts</option>
                            {uniqueAdmins.map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    )}
                    <button 
                        onClick={() => { setAddFlowStep(1); setIsAddModalOpen(true); }}
                        className="flex items-center gap-1.5 px-5 py-2.5 bg-[#a855f7] hover:bg-[#9333ea] text-white font-bold rounded-xl text-xs transition-all shadow-sm active:scale-[0.98]"
                    >
                        <Plus size={16} strokeWidth={2.5} />
                        Add Material
                    </button>
                </div>
            </div>

            {/* Dashboard Search & Highlights */}
            <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Search materials, variants, sizes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-purple-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-50 focus:border-[#a855f7] transition-all text-xs font-medium shadow-sm placeholder:text-slate-400"
                />
            </div>

            {/* Low Stock Separate Alerts */}
            {lowStockMaterials.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-50/50 border border-amber-100/50 rounded-2xl p-5 shadow-sm"
                >
                    <h3 className="text-amber-800 text-[10px] font-black flex items-center gap-1.5 mb-3 uppercase tracking-wider">
                        <AlertTriangle size={14} className="text-amber-500 animate-pulse" />
                        Low Stock Alert ({lowStockCount})
                    </h3>
                    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-amber-200">
                        {lowStockMaterials.map(m => (
                            <div 
                                key={m._id} 
                                onClick={() => {
                                    const { materialName } = parseMaterialName(m.name);
                                    setActiveCategory(m.category);
                                    setActiveMaterial(materialName);
                                }}
                                className="bg-white border border-amber-100/30 p-3.5 rounded-xl flex items-center justify-between min-w-[240px] shadow-sm hover:shadow cursor-pointer transition-all active:scale-[0.98]"
                            >
                                <div>
                                    <div className="font-bold text-slate-700 text-xs">{m.name}</div>
                                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{m.category}</div>
                                </div>
                                <div className="text-right pl-3 shrink-0">
                                    <div className="text-amber-600 font-extrabold text-xs">{m.currentStock} {m.unit}</div>
                                    <div className="text-[9px] text-slate-400 font-medium">Thr: {m.lowStockThreshold}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Drill-down Navigation Logic */}
            {isLoading ? (
                <div className="bg-white rounded-[24px] border border-purple-50 p-16 text-center shadow-sm">
                    <Loader2 className="animate-spin text-[#a855f7] mx-auto" size={32} />
                    <p className="text-slate-400 mt-3 font-bold text-sm">Loading Inventory Explorer...</p>
                </div>
            ) : filteredMaterials.length === 0 ? (
                <div className="bg-white rounded-[24px] border border-purple-50 p-16 text-center shadow-sm">
                    <ShoppingBag className="text-purple-200 mx-auto mb-3" size={32} />
                    <p className="text-slate-400 font-bold text-sm">No matching items or categories found.</p>
                </div>
            ) : activeCategory === null ? (
                /* VIEW 1: Categories Grid */
                <div className="space-y-4">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Categories</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {groupedData.map(cat => (
                            <motion.div
                                key={cat.name}
                                onClick={() => setActiveCategory(cat.name)}
                                whileHover={{ scale: 1.01, y: -2 }}
                                className="p-5 bg-white border border-purple-50 rounded-[20px] cursor-pointer transition-all duration-300 shadow-sm hover:border-purple-200 hover:shadow-md flex flex-col justify-between min-h-[140px] relative overflow-hidden"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl bg-purple-50/50 w-10 h-10 flex items-center justify-center rounded-xl border border-purple-50">{cat.icon}</span>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-xs">
                                                <HighlightText text={cat.label} search={searchQuery} />
                                            </h3>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                                                {cat.totalMaterials} materials • {cat.totalVariants} variants
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-end border-t border-purple-50/30 pt-3 mt-4 text-[10px]">
                                    <span className="text-slate-400 font-bold uppercase tracking-wider">Stock Value</span>
                                    <span className="font-extrabold text-[#a855f7]">₹{cat.totalStockValue.toLocaleString()}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ) : (
                /* VIEW 2: Inside Category Detail (Materials & Variants Explorer) */
                <div className="space-y-5">
                    {/* Category Detail Navigation Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white border border-purple-50 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setActiveCategory(null)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all active:scale-[0.98]"
                            >
                                ← Categories
                            </button>
                            <span className="text-slate-300">|</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xl">{activeCatData?.icon}</span>
                                <h2 className="text-sm font-bold text-slate-800">{activeCatData?.label}</h2>
                                <span className="text-[9px] font-bold text-[#a855f7] bg-purple-50/50 px-2 py-0.5 rounded-full uppercase">
                                    ₹{(activeCatData?.totalStockValue || 0).toLocaleString()} Value
                                </span>
                            </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {(activeCatData?.materials || []).length} materials listed
                        </span>
                    </div>

                    {isMobile ? (
                        /* Mobile View inside Category: Accordion list of materials */
                        <div className="space-y-3">
                            {activeCatData?.materials.map(mat => {
                                const isMatExpanded = mobileExpandedMat === mat.name;
                                return (
                                    <div key={mat.name} className="bg-white rounded-xl border border-purple-50/70 overflow-hidden shadow-sm">
                                        <button 
                                            onClick={() => setMobileExpandedMat(isMatExpanded ? null : mat.name)}
                                            className="w-full flex items-center justify-between p-4 hover:bg-purple-50/10 transition-colors text-left"
                                        >
                                            <span className="font-bold text-slate-700 text-xs">{mat.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{mat.variants.length} variations</span>
                                                {isMatExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                                            </div>
                                        </button>

                                        {isMatExpanded && (
                                            <div className="border-t border-purple-50/30 bg-purple-50/5 p-3 space-y-2">
                                                {mat.variants.map(variant => {
                                                    const colorStyle = getColorStyle(variant.variantName);
                                                    const isVariantLow = variant.currentStock <= variant.lowStockThreshold;
                                                    return (
                                                        <div key={variant._id} className="bg-white border border-purple-50/50 p-3.5 rounded-xl space-y-3">
                                                            <div className="flex justify-between items-center">
                                                                <div className="flex items-center gap-2">
                                                                    {variant.variantName !== 'Default' && (
                                                                        colorStyle ? (
                                                                            <span className="w-4 h-4 rounded-full border border-purple-200 shadow-sm shrink-0" style={{ backgroundColor: colorStyle }} />
                                                                        ) : (
                                                                            <Tag size={12} className="text-purple-400 shrink-0" />
                                                                        )
                                                                    )}
                                                                    <span className="font-extrabold text-slate-700 text-xs">{variant.variantName}</span>
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    <button 
                                                                        onClick={() => { setSelectedMaterial(variant); setRestockAmount(0); setIsRestockModalOpen(true); }}
                                                                        className="p-1 text-emerald-650 bg-emerald-50 rounded hover:bg-emerald-100 transition-colors"
                                                                    >
                                                                        <ArrowUpRight size={12} />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => { 
                                                                            setSelectedMaterial(variant); 
                                                                            setEditFormData({
                                                                                name: variant.name,
                                                                                category: variant.category,
                                                                                usageType: variant.usageType,
                                                                                usageValue: variant.usageValue,
                                                                                unit: variant.unit,
                                                                                defaultPrice: variant.defaultPrice,
                                                                                lowStockThreshold: variant.lowStockThreshold,
                                                                                size: variant.size || '',
                                                                                gsm: variant.gsm || '',
                                                                                trackInventory: variant.trackInventory !== undefined ? variant.trackInventory : true
                                                                            });
                                                                            setSyncToAll(false);
                                                                            setIsEditModalOpen(true); 
                                                                        }}
                                                                        className="p-1 text-blue-650 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                                                                    >
                                                                        <Edit size={12} />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => { setSelectedMaterial(variant); setIsHistoryModalOpen(true); }}
                                                                        className="p-1 text-purple-650 bg-purple-50 rounded hover:bg-purple-100 transition-colors"
                                                                    >
                                                                        <History size={12} />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleDelete(variant._id)}
                                                                        className="p-1 text-red-500 bg-red-50 rounded hover:bg-red-100 transition-colors"
                                                                    >
                                                                        <Trash2 size={12} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-purple-50/30 text-[9px]">
                                                                <div>
                                                                    <span className="text-slate-400 font-bold block uppercase tracking-wider">Stock</span>
                                                                    <span className={`font-black ${isVariantLow && variant.trackInventory ? 'text-amber-500' : 'text-slate-700'}`}>
                                                                        {variant.trackInventory ? `${variant.currentStock} ${variant.unit}` : 'Outsourced'}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-slate-400 font-bold block uppercase tracking-wider">Cost</span>
                                                                    <span className="font-extrabold text-slate-700">₹{variant.defaultPrice}</span>
                                                                </div>
                                                                <div>
                                                                    <span className="text-slate-400 font-bold block uppercase tracking-wider">Value</span>
                                                                    <span className="font-extrabold text-slate-700">₹{variant.trackInventory ? (variant.currentStock * variant.defaultPrice).toLocaleString() : '-'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Desktop Category Explorer: 2-Column (Left: Materials, Right: Variants) */
                        <div className="grid grid-cols-12 gap-6 items-start">
                            {/* Column 1: Materials */}
                            <div className="col-span-5 space-y-3">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-450 px-1">Materials</h3>
                                <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                                    {activeCatData?.materials.map(mat => {
                                        const isSelected = activeMaterial === mat.name;
                                        return (
                                            <div
                                                key={mat.name}
                                                onClick={() => setActiveMaterial(mat.name)}
                                                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border flex items-center justify-between ${
                                                    isSelected 
                                                        ? 'bg-white border-purple-200 shadow-sm shadow-purple-500/5' 
                                                        : 'bg-white/60 border-purple-50/50 hover:border-purple-200/30'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#a855f7]' : 'bg-slate-300'}`} />
                                                    <div>
                                                        <h4 className="font-extrabold text-slate-700 text-xs">
                                                            <HighlightText text={mat.name} search={searchQuery} />
                                                        </h4>
                                                        {mat.variants.length > 0 && (
                                                            <p className="text-[9px] text-slate-400 font-medium uppercase mt-0.5">
                                                                {mat.variants[0].size || mat.variants[0].gsm ? `${mat.variants[0].size || ''} ${mat.variants[0].gsm ? `• ${mat.variants[0].gsm}gsm` : ''}` : ''}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="text-[9px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">
                                                    {mat.variants.length} variant{mat.variants.length > 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Column 2: Variants & Stock Details */}
                            <div className="col-span-7 space-y-3">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-450 px-1">Variants & Stock</h3>
                                
                                {activeMatData ? (
                                    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                                        {activeMatData.variants.map(variant => {
                                            const colorStyle = getColorStyle(variant.variantName);
                                            const isLow = variant.currentStock <= variant.lowStockThreshold;
                                            const isDefaultVariant = variant.variantName === 'Default';
                                            return (
                                                <div 
                                                    key={variant._id} 
                                                    className="bg-white border border-purple-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 space-y-3 relative group"
                                                >
                                                    <div className="flex justify-between items-center gap-3">
                                                        <div className="flex items-center gap-2">
                                                            {!isDefaultVariant && (
                                                                colorStyle ? (
                                                                    <span className="w-4.5 h-4.5 rounded-full border border-purple-200 shadow-sm shrink-0" style={{ backgroundColor: colorStyle }} />
                                                                ) : (
                                                                    <Tag size={13} className="text-purple-400 shrink-0" />
                                                                )
                                                            )}
                                                            <div>
                                                                <div className="font-extrabold text-slate-700 text-xs">
                                                                    <HighlightText text={variant.variantName} search={searchQuery} />
                                                                </div>
                                                                {variant.adminName && (
                                                                    <div className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Admin: {variant.adminName}</div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Actions Panel */}
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={() => { setSelectedMaterial(variant); setRestockAmount(0); setIsRestockModalOpen(true); }}
                                                                className="p-1.5 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                                                                title="Adjust Stock"
                                                            >
                                                                <ArrowUpRight size={13} />
                                                            </button>
                                                            <button 
                                                                onClick={() => { 
                                                                    setSelectedMaterial(variant); 
                                                                    setEditFormData({
                                                                        name: variant.name,
                                                                        category: variant.category,
                                                                        usageType: variant.usageType,
                                                                        usageValue: variant.usageValue,
                                                                        unit: variant.unit,
                                                                        defaultPrice: variant.defaultPrice,
                                                                        lowStockThreshold: variant.lowStockThreshold,
                                                                        size: variant.size || '',
                                                                        gsm: variant.gsm || '',
                                                                        trackInventory: variant.trackInventory !== undefined ? variant.trackInventory : true
                                                                    });
                                                                    setSyncToAll(false);
                                                                    setIsEditModalOpen(true); 
                                                                }}
                                                                className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                                title="Edit Properties"
                                                            >
                                                                <Edit size={13} />
                                                            </button>
                                                            <button 
                                                                onClick={() => { setSelectedMaterial(variant); setIsHistoryModalOpen(true); }}
                                                                className="p-1.5 text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                                                                title="Stock History"
                                                            >
                                                                <History size={13} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(variant._id)}
                                                                className="p-1.5 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                                title="Delete variant"
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Values Grid */}
                                                    <div className="grid grid-cols-3 gap-3 border-t border-purple-50/30 pt-3 text-[10px] font-semibold">
                                                        <div>
                                                            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Stock</span>
                                                            {variant.trackInventory !== false ? (
                                                                <div>
                                                                    <span className={`font-black ${isLow ? 'text-amber-500' : 'text-slate-700'}`}>
                                                                        {variant.currentStock}
                                                                    </span>
                                                                    <span className="text-slate-400 text-[9px] ml-0.5">{variant.unit}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-[8px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-blue-100">Outsource</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Cost</span>
                                                            <span className="text-slate-700 font-extrabold">₹{variant.defaultPrice}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Stock Value</span>
                                                            <span className="font-extrabold text-[#a855f7]">
                                                                {variant.trackInventory !== false ? `₹${(variant.currentStock * variant.defaultPrice).toLocaleString()}` : '—'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center text-slate-400 text-xs">
                                        Select a material on the left to review variations.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            <AnimatePresence>
                {/* 4-Step Add Material Modal */}
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
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl relative z-10 p-6 text-slate-700 text-xs"
                        >
                            <div className="flex items-center justify-between mb-5 border-b border-purple-50/50 pb-3">
                                <div>
                                    <h2 className="text-base font-bold text-slate-800 leading-tight">Add New Material</h2>
                                    <p className="text-slate-400 text-[9px] uppercase font-bold tracking-wider mt-0.5">Step {addFlowStep} of 4</p>
                                </div>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="w-full bg-slate-100 h-1 rounded-full mb-6 overflow-hidden">
                                <div 
                                    className="bg-[#a855f7] h-full transition-all duration-300"
                                    style={{ width: `${(addFlowStep / 4) * 100}%` }}
                                />
                            </div>

                            <form onSubmit={handleAddFlowSubmit} className="space-y-5">
                                {addFlowStep === 1 && (
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold text-slate-800 uppercase tracking-wider block">Step 1: Select Category</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {Object.keys(CATEGORY_META).map(catKey => {
                                                const catInfo = CATEGORY_META[catKey];
                                                const isSelected = addFlowData.category === catKey;
                                                return (
                                                    <div 
                                                        key={catKey}
                                                        onClick={() => setAddFlowData({ ...addFlowData, category: catKey })}
                                                        className={`p-3.5 rounded-xl border cursor-pointer text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                                                            isSelected 
                                                                ? 'border-[#a855f7] bg-purple-50/20 font-extrabold text-[#a855f7]' 
                                                                : 'border-purple-50/50 hover:border-purple-200/50 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        <span className="text-2xl">{catInfo.icon}</span>
                                                        <span className="text-[11px] font-bold">{catInfo.label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {addFlowStep === 2 && (
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-slate-800 uppercase tracking-wider block">Step 2: General Details</label>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400">Material Name (Base Name)</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={addFlowData.materialName}
                                                onChange={(e) => setAddFlowData({...addFlowData, materialName: e.target.value})}
                                                className="w-full px-4 py-3 bg-slate-50 border border-purple-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-[#a855f7] transition-all font-semibold text-xs"
                                                placeholder="e.g., Landscape Envelope, Satin Ribbon"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400">Size (optional)</label>
                                                <input 
                                                    type="text" 
                                                    value={addFlowData.size}
                                                    onChange={(e) => setAddFlowData({...addFlowData, size: e.target.value})}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-purple-50 rounded-xl focus:outline-none text-xs font-medium"
                                                    placeholder="e.g. A4, A5"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400">GSM (optional)</label>
                                                <input 
                                                    type="text" 
                                                    value={addFlowData.gsm}
                                                    onChange={(e) => setAddFlowData({...addFlowData, gsm: e.target.value})}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-purple-50 rounded-xl focus:outline-none text-xs font-medium"
                                                    placeholder="e.g. 300, 250"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {addFlowStep === 3 && (
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-slate-800 uppercase tracking-wider block">Step 3: Define Variants</label>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400">Variant Type</label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {['Color', 'Design', 'Size', 'Texture', 'Finish', 'Custom'].map(type => {
                                                    const isSelected = addFlowData.variantType === type;
                                                    return (
                                                        <button
                                                            key={type}
                                                            type="button"
                                                            onClick={() => setAddFlowData({ ...addFlowData, variantType: type })}
                                                            className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                                                                isSelected 
                                                                    ? 'bg-[#a855f7] border-[#a855f7] text-white' 
                                                                    : 'bg-white border-purple-50 text-slate-600 hover:border-purple-200'
                                                            }`}
                                                        >
                                                            {type}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400">Variant Values (Type and enter/comma to add)</label>
                                            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-purple-50 rounded-xl min-h-[44px] items-center">
                                                {addFlowData.variantValuesList.map(tag => (
                                                    <span 
                                                        key={tag}
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-purple-100 text-purple-700 rounded-md text-[10px] font-bold"
                                                    >
                                                        {tag}
                                                        <button 
                                                            type="button" 
                                                            onClick={() => removeTag(tag)}
                                                            className="hover:bg-purple-200 rounded-full p-0.5"
                                                        >
                                                            <X size={8} />
                                                        </button>
                                                    </span>
                                                ))}
                                                <input 
                                                    type="text"
                                                    value={addFlowData.variantValuesText}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val.endsWith(',')) {
                                                            addTag();
                                                        } else {
                                                            setAddFlowData({ ...addFlowData, variantValuesText: val });
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            addTag();
                                                        }
                                                    }}
                                                    className="flex-1 bg-transparent focus:outline-none text-xs font-semibold pl-1 min-w-[100px]"
                                                    placeholder="Type value..."
                                                />
                                            </div>
                                            <span className="text-[9px] text-slate-400 block font-medium">Leave blank for no sub-variants (creates a default variant).</span>
                                        </div>
                                    </div>
                                )}

                                {addFlowStep === 4 && (
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-slate-800 uppercase tracking-wider block">Step 4: Stock & Defaults</label>
                                        
                                        <div className="flex items-center gap-2 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                                            <input 
                                                type="checkbox" 
                                                id="flowTrackInventory"
                                                checked={addFlowData.trackInventory}
                                                onChange={(e) => setAddFlowData({...addFlowData, trackInventory: e.target.checked})}
                                                className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                                            />
                                            <label htmlFor="flowTrackInventory" className="text-[10px] font-bold text-emerald-900 cursor-pointer">
                                                Track Stock Inventory (Turn off for outsourced items)
                                            </label>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400">Unit Type</label>
                                                <select 
                                                    value={addFlowData.unit}
                                                    onChange={(e) => setAddFlowData({...addFlowData, unit: e.target.value})}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-purple-50 rounded-xl focus:outline-none font-semibold text-xs cursor-pointer"
                                                >
                                                    <option value="pcs">Pieces (pcs)</option>
                                                    <option value="kg">Kilograms (kg)</option>
                                                    <option value="sheets">Sheets</option>
                                                    <option value="meters">Meters</option>
                                                    <option value="rolls">Rolls</option>
                                                </select>
                                            </div>
                                            {addFlowData.trackInventory && (
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-slate-400">Initial Stock</label>
                                                    <input 
                                                        type="number" 
                                                        value={addFlowData.currentStock || ''}
                                                        onChange={(e) => setAddFlowData({...addFlowData, currentStock: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                                                        className="w-full px-4 py-2.5 bg-slate-50 border border-purple-50 rounded-xl focus:outline-none font-semibold text-xs"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400">Default Cost (₹)</label>
                                                <input 
                                                    type="number" 
                                                    step="0.01"
                                                    value={addFlowData.defaultPrice || ''}
                                                    onChange={(e) => setAddFlowData({...addFlowData, defaultPrice: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                                                    className="w-full px-4 py-2.5 bg-slate-50 border border-purple-50 rounded-xl focus:outline-none font-semibold text-xs"
                                                />
                                            </div>
                                            {addFlowData.trackInventory && (
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-slate-400">Low Stock Threshold</label>
                                                    <input 
                                                        type="number" 
                                                        value={addFlowData.lowStockThreshold || ''}
                                                        onChange={(e) => setAddFlowData({...addFlowData, lowStockThreshold: e.target.value === '' ? 0 : parseInt(e.target.value)})}
                                                        className="w-full px-4 py-2.5 bg-slate-50 border border-purple-50 rounded-xl focus:outline-none font-semibold text-xs"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {adminData?.role === 'super-admin' && (
                                            <div className="flex items-center gap-2.5 p-3 bg-purple-50/50 rounded-xl border border-purple-100/50">
                                                <input 
                                                    type="checkbox" 
                                                    id="flowApplyToAll"
                                                    checked={addFlowData.applyToAll}
                                                    onChange={(e) => setAddFlowData({...addFlowData, applyToAll: e.target.checked})}
                                                    className="w-4.5 h-4.5 rounded accent-purple-600 cursor-pointer"
                                                />
                                                <label htmlFor="flowApplyToAll" className="text-[10px] font-bold text-purple-900 cursor-pointer">
                                                    Create for all Admins (Standardized List)
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Step Navigation Actions */}
                                <div className="flex items-center justify-between border-t border-purple-50/50 pt-4 mt-4">
                                    {addFlowStep > 1 ? (
                                        <button 
                                            type="button"
                                            onClick={() => setAddFlowStep(addFlowStep - 1)}
                                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-colors"
                                        >
                                            Previous
                                        </button>
                                    ) : (
                                        <div />
                                    )}

                                    {addFlowStep < 4 ? (
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                if (addFlowStep === 2 && !addFlowData.materialName) {
                                                    toast.error("Please enter a material name");
                                                    return;
                                                }
                                                setAddFlowStep(addFlowStep + 1);
                                            }}
                                            className="px-5 py-2.5 bg-slate-800 hover:bg-black text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition-colors"
                                        >
                                            Next
                                        </button>
                                    ) : (
                                        <button 
                                            type="submit"
                                            disabled={isActionLoading}
                                            className="px-6 py-2.5 bg-[#a855f7] hover:bg-[#9333ea] text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all shadow flex items-center gap-1.5"
                                        >
                                            {isActionLoading ? <Loader2 className="animate-spin" size={12} /> : <Save size={12} />}
                                            Create Material
                                        </button>
                                    )}
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Adjust Stock Restock Modal */}
                {isRestockModalOpen && selectedMaterial && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsRestockModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative z-10 p-6 text-slate-700 text-xs"
                        >
                            <h2 className="text-base font-bold text-slate-800 mb-1 leading-tight">Adjust Stock</h2>
                            <p className="text-slate-500 mb-6 border-l-4 border-emerald-400 pl-3 font-semibold text-[10px]">
                                Add or reduce stock for <span className="font-bold text-slate-800 block mt-0.5">{selectedMaterial.name}</span>
                            </p>
                            <form onSubmit={handleRestock} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 ml-1">Amount to Add/Reduce (negative sign to subtract)</label>
                                    <input 
                                        type="number" 
                                        required
                                        autoFocus
                                        value={restockAmount === 0 ? '' : restockAmount}
                                        onChange={(e) => setRestockAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                                        className="w-full px-5 py-4 bg-emerald-50/20 border border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-50 focus:border-emerald-400 transition-all font-bold text-2xl text-emerald-700 text-center"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center text-[10px] font-semibold">
                                    <span className="text-slate-500">New Balance:</span>
                                    <span className="font-black text-slate-700">{(selectedMaterial.currentStock || 0) + (Number(restockAmount) || 0)} {selectedMaterial.unit}</span>
                                </div>
                                <button 
                                    type="submit"
                                    disabled={isActionLoading || !restockAmount || Number(restockAmount) === 0 || ((selectedMaterial.currentStock || 0) + Number(restockAmount) < 0)}
                                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                                >
                                    {isActionLoading ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
                                    Confirm Adjustment
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Edit Material Modal */}
                {isEditModalOpen && selectedMaterial && editFormData && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl relative z-10 p-6 text-slate-700 text-xs"
                        >
                            <div className="flex items-center justify-between mb-5 border-b border-purple-50/50 pb-3">
                                <h2 className="text-base font-bold text-slate-800 leading-tight">Edit Variant Properties</h2>
                                <button onClick={() => setIsEditModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleUpdateMaterial} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400">Variant Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={editFormData.name}
                                        onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-purple-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-[#a855f7] transition-all font-semibold"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400">Category</label>
                                        <select 
                                            value={editFormData.category}
                                            onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-purple-50 rounded-xl focus:outline-none font-semibold text-xs cursor-pointer"
                                        >
                                            {Object.keys(CATEGORY_META).map(catKey => (
                                                <option key={catKey} value={catKey}>{CATEGORY_META[catKey].label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400">Usage Type</label>
                                        <select 
                                            value={editFormData.usageType}
                                            onChange={(e) => setEditFormData({...editFormData, usageType: e.target.value})}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-purple-50 rounded-xl focus:outline-none font-semibold text-xs cursor-pointer"
                                        >
                                            <option value="manual">Manual</option>
                                            <option value="per_card">Per Card</option>
                                            <option value="ratio">Ratio</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400">Size</label>
                                        <input 
                                            type="text" 
                                            value={editFormData.size}
                                            onChange={(e) => setEditFormData({...editFormData, size: e.target.value})}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-purple-50 rounded-xl focus:outline-none font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400">GSM</label>
                                        <input 
                                            type="text" 
                                            value={editFormData.gsm}
                                            onChange={(e) => setEditFormData({...editFormData, gsm: e.target.value})}
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-purple-50 rounded-xl focus:outline-none font-semibold"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                                    <input 
                                        type="checkbox" 
                                        id="editTrackInventory"
                                        checked={editFormData.trackInventory}
                                        onChange={(e) => setEditFormData({...editFormData, trackInventory: e.target.checked})}
                                        className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                                    />
                                    <label htmlFor="editTrackInventory" className="text-[10px] font-bold text-emerald-900 cursor-pointer">
                                        Track Stock Inventory (Turn off for outsourced items)
                                    </label>
                                </div>
                                <div className="grid grid-cols-3 gap-3 font-semibold">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold text-slate-400">Cost (₹)</label>
                                        <input 
                                            type="number" 
                                            value={editFormData.defaultPrice === 0 ? '' : editFormData.defaultPrice}
                                            onChange={(e) => setEditFormData({...editFormData, defaultPrice: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                                            className="w-full px-4 py-2 bg-slate-50 border border-purple-50 rounded-xl focus:outline-none text-xs font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-bold text-slate-400">Logic Val</label>
                                        <input 
                                            type="number" 
                                            step="0.0001"
                                            value={editFormData.usageValue === 0 ? '' : editFormData.usageValue}
                                            onChange={(e) => setEditFormData({...editFormData, usageValue: e.target.value === '' ? 0 : parseFloat(e.target.value)})}
                                            className="w-full px-4 py-2 bg-slate-50 border border-purple-50 rounded-xl focus:outline-none text-xs font-semibold"
                                        />
                                    </div>
                                    {editFormData.trackInventory && (
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-bold text-slate-400">Low Stock Thrsh</label>
                                            <input 
                                                type="number" 
                                                value={editFormData.lowStockThreshold === 0 ? '' : editFormData.lowStockThreshold}
                                                onChange={(e) => setEditFormData({...editFormData, lowStockThreshold: e.target.value === '' ? 0 : parseInt(e.target.value)})}
                                                className="w-full px-4 py-2 bg-slate-50 border border-purple-50 rounded-xl focus:outline-none text-xs font-semibold"
                                            />
                                        </div>
                                    )}
                                </div>

                                {adminData?.role === 'super-admin' && (
                                    <div className="flex items-center gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                                        <input 
                                            type="checkbox" 
                                            id="editSyncToAll"
                                            checked={syncToAll}
                                            onChange={(e) => setSyncToAll(e.target.checked)}
                                            className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                                        />
                                        <label htmlFor="editSyncToAll" className="text-[10px] font-bold text-blue-900 cursor-pointer">
                                            Sync this Pricing/Logic to ALL Admins
                                        </label>
                                    </div>
                                )}

                                <button 
                                    type="submit"
                                    disabled={isActionLoading}
                                    className="w-full py-3.5 bg-[#a855f7] hover:bg-[#9333ea] text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                                >
                                    {isActionLoading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                                    Update Material
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Stock History Modal */}
                {isHistoryModalOpen && selectedMaterial && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsHistoryModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative z-10 p-6 text-slate-700 text-xs"
                        >
                            <div className="flex items-center justify-between mb-6 border-b border-purple-50/50 pb-3">
                                <div>
                                    <h2 className="text-base font-bold text-slate-800 leading-tight">Stock Activity Log</h2>
                                    <p className="text-slate-450 text-[9px] font-bold uppercase tracking-wider mt-0.5">{selectedMaterial.name}</p>
                                </div>
                                <button onClick={() => setIsHistoryModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-5">
                                {getMockHistory(selectedMaterial).map((log, index) => (
                                    <div key={index} className="flex gap-3 relative">
                                        {index < 2 && (
                                            <div className="absolute left-[13px] top-6 bottom-[-20px] w-0.5 bg-purple-50" />
                                        )}
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 z-10 ${
                                            log.type === 'restock' ? 'bg-emerald-100 text-emerald-700' :
                                            log.type === 'deduct' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'
                                        }`}>
                                            {log.type === 'restock' ? '↓' : log.type === 'deduct' ? '↑' : '⚙️'}
                                        </div>
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-extrabold text-slate-800 text-xs">{log.action}</span>
                                                <span className="text-[8px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">{log.user}</span>
                                            </div>
                                            <p className="text-slate-500 font-semibold text-xs leading-normal">{log.detail}</p>
                                            <div className="flex items-center gap-1 text-[8px] text-slate-400 pt-0.5">
                                                <Calendar size={10} />
                                                <span>{log.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button 
                                onClick={() => setIsHistoryModalOpen(false)}
                                className="w-full mt-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-colors"
                            >
                                Close Log
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
