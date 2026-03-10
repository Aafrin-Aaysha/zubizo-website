'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Loader2,
    Upload,
    LayoutGrid,
    List,
    ChevronLeft,
    ChevronRight,
    Info,
    Settings,
    Package as PackageIcon,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn, getStartingPrice } from '@/lib/utils';

export default function DesignsPage() {
    const router = useRouter();
    const [designs, setDesigns] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDesign, setEditingDesign] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Form State
    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        slug: '',
        description: '',
        categoryId: '',
        minQuantity: 50 as number | string,
        basePrice: 0 as number | string,
        packages: [] as any[],
        addOns: [] as any[],
        isTrending: false,
        isFeatured: false,
        isActive: true,
        images: [] as string[],
        videoUrl: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const [designsRes, catsRes] = await Promise.all([
                fetch('/api/designs?showInactive=true'),
                fetch('/api/categories')
            ]);
            const designsData = await designsRes.json();
            const catsData = await catsRes.json();
            setDesigns(Array.isArray(designsData) ? designsData : []);
            setCategories(Array.isArray(catsData) ? catsData : []);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (formData.name && formData.sku) {
            const generatedSlug = `${formData.name}-${formData.sku}`
                .toLowerCase()
                .replace(/[^\w ]+/g, '')
                .replace(/ +/g, '-');
            setFormData(prev => ({ ...prev, slug: generatedSlug }));
        }
    }, [formData.name, formData.sku, editingDesign]);

    const filteredDesigns = designs.filter(design => {
        const matchesSearch =
            design.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            design.sku.toLowerCase().includes(searchQuery.toLowerCase());

        const categoryId = design.categoryId?._id || design.categoryId;
        const matchesCategory = activeCategory === 'all' || categoryId === activeCategory;

        return matchesSearch && matchesCategory;
    });

    const totalPages = Math.ceil(filteredDesigns.length / itemsPerPage);
    const paginatedDesigns = filteredDesigns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, activeCategory]);

    const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsSubmitting(true);
        const uploadedUrls = type === 'image' ? [...formData.images] : [];

        for (let i = 0; i < files.length; i++) {
            const data = new FormData();
            data.append('file', files[i]);

            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: data
                });
                const result = await res.json();
                if (result.url) {
                    if (type === 'image') {
                        uploadedUrls.push(result.url);
                    } else {
                        setFormData(prev => ({ ...prev, videoUrl: result.url }));
                        toast.success('Video uploaded successfully');
                    }
                }
            } catch (error) {
                toast.error(`Failed to upload ${type}`);
            }
        }

        if (type === 'image') {
            setFormData(prev => ({ ...prev, images: uploadedUrls }));
        }
        setIsSubmitting(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.packages.length === 0) {
            toast.error('At least one package is required');
            return;
        }

        setIsSubmitting(true);
        const url = editingDesign ? `/api/designs/${editingDesign._id}` : '/api/designs';
        const method = editingDesign ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success(editingDesign ? 'Design updated' : 'Design created');
                router.refresh(); // Sync server components
                fetchInitialData();
                closeModal();
            } else {
                const error = await res.json();
                toast.error(error.message || 'Operation failed');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteDesign = async (id: string) => {
        if (!confirm('Are you sure you want to delete this design?')) return;

        try {
            const res = await fetch(`/api/designs/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Design deleted');
                router.refresh();
                fetchInitialData();
            }
        } catch (error) {
            toast.error('Failed to delete design');
        }
    };

    const addPackage = () => {
        setFormData({
            ...formData,
            packages: [...formData.packages, {
                title: '',
                inclusions: [],
                priceTiers: [{ minQty: 100, maxQty: null, pricePerCard: 0 }]
            }]
        });
    };

    const removePackage = (index: number) => {
        const pkgs = [...formData.packages];
        pkgs.splice(index, 1);
        setFormData({ ...formData, packages: pkgs });
    };

    const updatePackage = (index: number, field: string, value: any) => {
        const pkgs = [...formData.packages] as any[];
        pkgs[index] = { ...pkgs[index], [field]: value };
        setFormData({ ...formData, packages: pkgs });
    };

    const addTier = (pkgIdx: number) => {
        const pkgs = [...formData.packages] as any[];
        pkgs[pkgIdx].priceTiers = [...(pkgs[pkgIdx].priceTiers || []), { minQty: 1, maxQty: null, pricePerCard: 0 }];
        setFormData({ ...formData, packages: pkgs });
    };

    const removeTier = (pkgIdx: number, tierIdx: number) => {
        const pkgs = [...formData.packages] as any[];
        pkgs[pkgIdx].priceTiers = pkgs[pkgIdx].priceTiers.filter((_: any, i: number) => i !== tierIdx);
        setFormData({ ...formData, packages: pkgs });
    };

    const updateTier = (pkgIdx: number, tierIdx: number, field: string, value: any) => {
        const pkgs = [...formData.packages] as any[];
        const tiers = [...pkgs[pkgIdx].priceTiers];
        tiers[tierIdx] = { ...tiers[tierIdx], [field]: value };
        pkgs[pkgIdx].priceTiers = tiers;
        setFormData({ ...formData, packages: pkgs });
    };

    const addAddOn = () => {
        setFormData({
            ...formData,
            addOns: [...formData.addOns, { label: '', pricePerCard: 0, note: '' }]
        });
    };

    const removeAddOn = (idx: number) => {
        const newAddOns = formData.addOns.filter((_, i) => i !== idx);
        setFormData({ ...formData, addOns: newAddOns });
    };

    const updateAddOn = (idx: number, field: string, value: any) => {
        const newAddOns = [...formData.addOns] as any[];
        newAddOns[idx] = { ...newAddOns[idx], [field]: value };
        setFormData({ ...formData, addOns: newAddOns });
    };

    const openModal = (design: any = null) => {
        if (design) {
            setEditingDesign(design);
            setFormData({
                sku: design.sku || '',
                name: design.name || '',
                slug: design.slug || '',
                description: design.description || '',
                categoryId: design.categoryId?._id || design.categoryId || '',
                minQuantity: design.minQuantity || 50,
                basePrice: design.basePrice || 0,
                packages: (design.packages || []).map((p: any) => ({
                    title: p.title,
                    inclusions: p.inclusions || [],
                    priceTiers: p.priceTiers && p.priceTiers.length > 0
                        ? p.priceTiers
                        : [{ minQty: design.minQuantity || 50, maxQty: null, pricePerCard: p.pricePerCard || 0 }]
                })),
                addOns: design.addOns || [],
                isTrending: design.isTrending || false,
                isFeatured: design.isFeatured || false,
                isActive: design.isActive !== undefined ? design.isActive : true,
                images: design.images || [],
                videoUrl: design.videoUrl || ''
            });
        } else {
            setEditingDesign(null);
            setFormData({
                sku: '',
                name: '',
                slug: '',
                description: '',
                categoryId: categories[0]?._id || '',
                minQuantity: 100,
                basePrice: 0,
                packages: [{
                    title: 'Standard Package',
                    inclusions: [],
                    priceTiers: [{ minQty: 100, maxQty: null, pricePerCard: 0 }]
                }],
                addOns: [],
                isTrending: false,
                isFeatured: false,
                isActive: true,
                images: [],
                videoUrl: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingDesign(null);
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Design Management</h1>
                    <p className="text-gray-500 mt-1 font-medium">Manage your invitation catalogue and package pricing.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-lavender hover:bg-[#9a6ab5] text-white px-8 py-3.5 rounded-2xl font-black shadow-xl shadow-lavender/20 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                >
                    <Plus size={20} />
                    New Design
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-lavender transition-colors" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by SKU or Name..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-lavender/10 focus:border-lavender transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={cn(
                            "px-5 py-2.5 text-xs font-black rounded-xl transition-all border uppercase tracking-widest",
                            activeCategory === 'all'
                                ? "bg-lavender text-white border-lavender shadow-md shadow-lavender/20"
                                : "text-gray-500 bg-gray-50 border-gray-100 hover:border-lavender/30"
                        )}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat._id}
                            onClick={() => setActiveCategory(cat._id)}
                            className={cn(
                                "px-5 py-2.5 text-xs font-black rounded-xl transition-all border whitespace-nowrap uppercase tracking-widest",
                                activeCategory === cat._id
                                    ? "bg-lavender text-white border-lavender shadow-md shadow-lavender/20"
                                    : "text-gray-500 bg-gray-50 border-gray-100 hover:border-lavender/30"
                            )}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px] lg:min-w-0">
                        <thead className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5">Design</th>
                                <th className="px-8 py-5">SKU</th>
                                <th className="px-8 py-5">Category</th>
                                <th className="px-8 py-5">Packages</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-8 py-8"><div className="h-10 bg-gray-50 rounded-2xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : paginatedDesigns.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                                                <PackageIcon size={40} />
                                            </div>
                                            <p className="font-bold text-gray-900 text-lg">No designs found</p>
                                            <button onClick={() => openModal()} className="text-lavender font-bold hover:underline">Create your first design</button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedDesigns.map(design => (
                                    <tr key={design._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-100 overflow-hidden flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
                                                    {design.images?.[0] ? (
                                                        <img src={design.images[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300"><Upload size={16} /></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-charcoal">{design.name}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">/catalog/{design.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-black text-lavender bg-lavender/5 px-3 py-1.5 rounded-full border border-lavender/10 uppercase tracking-widest">
                                                {design.sku}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-sm font-bold text-gray-600">
                                                {design.categoryId?.name || design.categoryId || 'General'}
                                            </p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1">
                                                <p className="text-xs font-black text-gray-900">
                                                    ₹{getStartingPrice(design)}
                                                    <span className="text-[10px] text-gray-400 font-medium ml-1">Starting</span>
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                    {design.packages?.length || 0} Options
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                {design.isTrending && (
                                                    <div className="w-7 h-7 bg-amber-50 rounded-full flex items-center justify-center text-amber-500" title="Trending">
                                                        🔥
                                                    </div>
                                                )}
                                                {design.isFeatured && (
                                                    <div className="w-7 h-7 bg-purple-50 rounded-full flex items-center justify-center text-lavender" title="Featured">
                                                        ✨
                                                    </div>
                                                )}
                                                <div className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                    design.isActive ? "text-green-600 bg-green-50 border-green-100" : "text-gray-400 bg-gray-50 border-gray-100"
                                                )}>
                                                    {design.isActive ? 'Live' : 'Hidden'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openModal(design)} className="p-2.5 text-gray-400 hover:text-lavender hover:bg-lavender/5 rounded-xl transition-all border border-transparent hover:border-lavender/20">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => deleteDesign(design._id)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 p-8">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="w-12 h-12 rounded-2xl border border-gray-100 bg-white flex items-center justify-center text-gray-400 hover:text-lavender transition-all disabled:opacity-30"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm font-black text-gray-400 mx-4">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="w-12 h-12 rounded-2xl border border-gray-100 bg-white flex items-center justify-center text-gray-400 hover:text-lavender transition-all disabled:opacity-30"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Design Form Modal — Refactored to Centered Modal for better UX */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="absolute inset-0 bg-charcoal/40 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-5xl bg-gray-50 max-h-[90vh] shadow-2xl rounded-[2.5rem] flex flex-col overflow-hidden"
                        >
                            <div className="p-8 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-lavender/10 text-lavender flex items-center justify-center">
                                        <PackageIcon size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-charcoal">{editingDesign ? 'Update Design' : 'New Collection'}</h2>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Configure your artisanal invitation</p>
                                    </div>
                                </div>
                                <button onClick={closeModal} className="w-10 h-10 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors"><X size={20} /></button>
                            </div>

                            <form id="design-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                                    {/* Column 1: Core Details */}
                                    <div className="space-y-8">
                                        <section className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <Info size={14} /> Basic Information
                                            </h3>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2">
                                                    <label className="text-[10px] font-black text-charcoal uppercase tracking-widest mb-1.5 block">Design Name</label>
                                                    <input
                                                        type="text" required value={formData.name}
                                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                        className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-lavender outline-none transition-all font-bold text-charcoal"
                                                        placeholder="Vibrant Marigold..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-charcoal uppercase tracking-widest mb-1.5 block">SKU Code</label>
                                                    <input
                                                        type="text" required value={formData.sku}
                                                        onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                                        className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-lavender outline-none transition-all font-black text-charcoal"
                                                        placeholder="ZB_1001"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-charcoal uppercase tracking-widest mb-1.5 block">Slug URL</label>
                                                    <input
                                                        type="text" required value={formData.slug}
                                                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                                        className="w-full px-5 py-3.5 bg-gray-100/50 border border-transparent rounded-2xl text-gray-400 font-bold outline-none cursor-not-allowed"
                                                        readOnly
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-black text-charcoal uppercase tracking-widest mb-1.5 block">Category</label>
                                                <select
                                                    required value={formData.categoryId}
                                                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                                    className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-lavender outline-none transition-all font-bold text-charcoal appearance-none"
                                                >
                                                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-black text-charcoal uppercase tracking-widest mb-1.5 block">Description</label>
                                                <textarea
                                                    value={formData.description}
                                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                    className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-lavender outline-none transition-all font-medium text-gray-600 min-h-[120px] resize-none"
                                                    placeholder="Describe the elegance and craft..."
                                                />
                                            </div>
                                        </section>

                                        <section className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Settings size={14} /> Inventory & Status
                                                </h3>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-lavender/20 transition-all cursor-pointer"
                                                    onClick={() => setFormData({ ...formData, isTrending: !formData.isTrending })}>
                                                    <div>
                                                        <p className="font-bold text-charcoal text-sm">Mark as Trending</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Show in trending sections</p>
                                                    </div>
                                                    <div className={cn("w-10 h-6 rounded-full relative transition-all", formData.isTrending ? "bg-lavender" : "bg-gray-200")}>
                                                        <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", formData.isTrending ? "left-5" : "left-1")} />
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-lavender/20 transition-all cursor-pointer"
                                                    onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}>
                                                    <div>
                                                        <p className="font-bold text-charcoal text-sm">Mark as Featured</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Show in featured home page section</p>
                                                    </div>
                                                    <div className={cn("w-10 h-6 rounded-full relative transition-all", formData.isFeatured ? "bg-lavender" : "bg-gray-200")}>
                                                        <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", formData.isFeatured ? "left-5" : "left-1")} />
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-lavender/20 transition-all cursor-pointer"
                                                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}>
                                                    <div>
                                                        <p className="font-bold text-charcoal text-sm">Active & Visible</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Live on the public website</p>
                                                    </div>
                                                    <div className={cn("w-10 h-6 rounded-full relative transition-all", formData.isActive ? "bg-green-500" : "bg-gray-200")}>
                                                        <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", formData.isActive ? "left-5" : "left-1")} />
                                                    </div>
                                                </div>

                                                <div className="pt-2">
                                                    <label className="text-[10px] font-black text-charcoal uppercase tracking-widest mb-1.5 block">Minimum Order Quantity</label>
                                                    <input
                                                        type="number" required value={formData.minQuantity ?? ''}
                                                        onChange={e => setFormData({ ...formData, minQuantity: e.target.value === '' ? '' : parseInt(e.target.value) })}
                                                        className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-lavender outline-none transition-all font-black text-charcoal"
                                                    />
                                                </div>
                                            </div>
                                        </section>
                                    </div>

                                    {/* Column 2: Pricing & Packages */}
                                    <div className="space-y-8">
                                        <section className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <PackageIcon size={14} /> Package &amp; Pricing
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={addPackage}
                                                    className="text-lavender font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1"
                                                >
                                                    <Plus size={14} /> Add Package
                                                </button>
                                            </div>

                                            {formData.packages.length === 0 ? (
                                                <div className="py-10 border-2 border-dashed border-gray-100 rounded-[1.5rem] flex flex-col items-center justify-center gap-2 text-gray-300">
                                                    <AlertCircle size={32} strokeWidth={1.5} />
                                                    <p className="text-xs font-bold uppercase tracking-widest">No Packages Added</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    {(formData.packages as any[]).map((pkg: any, idx) => (
                                                        <div key={idx} className="p-5 bg-gray-50 rounded-[2rem] border border-transparent hover:border-lavender/10 relative group transition-all space-y-5">
                                                            <button
                                                                type="button"
                                                                onClick={() => removePackage(idx)}
                                                                className="absolute -top-2 -right-2 w-7 h-7 bg-white shadow-md border border-gray-100 rounded-full flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>

                                                            {/* Package Title */}
                                                            <div>
                                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Package Title</label>
                                                                <input
                                                                    type="text" required value={pkg.title}
                                                                    onChange={e => updatePackage(idx, 'title', e.target.value)}
                                                                    className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl font-bold text-charcoal text-sm outline-none focus:border-lavender"
                                                                    placeholder="Glass Invitation Premium..."
                                                                />
                                                            </div>

                                                            {/* Inclusions */}
                                                            <div className="space-y-2 bg-white/60 p-4 rounded-2xl border border-gray-100/50">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">What's Included</label>
                                                                    <button type="button" onClick={() => {
                                                                        const newInclusions = [...(pkg.inclusions || []), ''];
                                                                        updatePackage(idx, 'inclusions', newInclusions);
                                                                    }} className="text-lavender font-black text-[8px] uppercase tracking-wider hover:underline flex items-center gap-1">
                                                                        <Plus size={10} /> Add
                                                                    </button>
                                                                </div>
                                                                {(pkg.inclusions || []).map((inc: string, incIdx: number) => (
                                                                    <div key={incIdx} className="flex gap-2">
                                                                        <input
                                                                            type="text" required value={inc}
                                                                            onChange={e => {
                                                                                const newInc = [...pkg.inclusions];
                                                                                newInc[incIdx] = e.target.value;
                                                                                updatePackage(idx, 'inclusions', newInc);
                                                                            }}
                                                                            className="flex-1 px-3 py-1.5 bg-white border border-gray-100 rounded-lg text-xs font-medium text-gray-600 outline-none focus:border-lavender"
                                                                            placeholder="Portrait Premium Envelope..."
                                                                        />
                                                                        <button type="button" onClick={() => {
                                                                            const newInc = pkg.inclusions.filter((_: any, i: number) => i !== incIdx);
                                                                            updatePackage(idx, 'inclusions', newInc);
                                                                        }} className="p-1.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                                            <X size={14} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                                {(!pkg.inclusions || pkg.inclusions.length === 0) && (
                                                                    <p className="text-[9px] text-gray-300 italic">No inclusions yet</p>
                                                                )}
                                                            </div>

                                                            {/* Price Tiers */}
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Price Tiers</label>
                                                                    <button type="button" onClick={() => addTier(idx)} className="text-lavender font-black text-[8px] uppercase tracking-wider hover:underline flex items-center gap-1">
                                                                        <Plus size={10} /> Add Tier
                                                                    </button>
                                                                </div>
                                                                <div className="space-y-3">
                                                                    {(pkg.priceTiers || []).map((tier: any, tIdx: number) => (
                                                                        <div key={tIdx} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100 relative group/tier">
                                                                            <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 flex-1 w-full">
                                                                                <div className="space-y-1">
                                                                                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block pl-1">Min Qty</label>
                                                                                    <input
                                                                                        type="number" placeholder="Min" value={tier.minQty ?? ''}
                                                                                        onChange={e => updateTier(idx, tIdx, 'minQty', e.target.value === '' ? '' : parseInt(e.target.value))}
                                                                                        className="w-full sm:w-[100px] px-3 py-2 bg-gray-50 border border-transparent rounded-xl text-xs font-bold text-charcoal outline-none focus:bg-white focus:border-lavender transition-all"
                                                                                    />
                                                                                </div>
                                                                                <div className="space-y-1">
                                                                                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block pl-1">Max Qty</label>
                                                                                    <input
                                                                                        type="number" placeholder="Max" value={tier.maxQty ?? ''}
                                                                                        onChange={e => updateTier(idx, tIdx, 'maxQty', e.target.value === '' ? '' : parseInt(e.target.value))}
                                                                                        className="w-full sm:w-[100px] px-3 py-2 bg-gray-50 border border-transparent rounded-xl text-xs font-bold text-charcoal outline-none focus:bg-white focus:border-lavender transition-all"
                                                                                    />
                                                                                </div>
                                                                                <div className="hidden sm:block text-gray-300 text-[10px] mt-4">→</div>
                                                                                <div className="col-span-2 sm:col-auto space-y-1 flex-1 min-w-[100px]">
                                                                                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block pl-1">Price / Card</label>
                                                                                    <div className="relative">
                                                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                                                                                        <input
                                                                                            type="number" placeholder="0.00" value={tier.pricePerCard ?? ''}
                                                                                            onChange={e => updateTier(idx, tIdx, 'pricePerCard', e.target.value === '' ? '' : parseFloat(e.target.value))}
                                                                                            className="w-full px-8 py-2 bg-gray-50 border border-transparent rounded-xl text-xs font-black text-charcoal outline-none focus:bg-white focus:border-lavender transition-all"
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => removeTier(idx, tIdx)}
                                                                                className="absolute top-2 right-2 sm:relative sm:top-auto sm:right-auto p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0"
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                    {(!pkg.priceTiers || pkg.priceTiers.length === 0) && (
                                                                        <p className="text-[9px] text-gray-300 italic">No tiers. Add at least one tier.</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </section>

                                        {/* Add-ons section */}
                                        <section className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Plus size={14} /> Optional Add-ons
                                                </h3>
                                                <button type="button" onClick={addAddOn} className="text-lavender font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1">
                                                    <Plus size={14} /> Add
                                                </button>
                                            </div>

                                            {(formData.addOns as any[]).length === 0 ? (
                                                <p className="text-[10px] text-gray-400 italic">No add-ons (e.g., Feather, Colour upgrade)</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {(formData.addOns as any[]).map((addOn: any, idx: number) => (
                                                        <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 relative group/addon">
                                                            <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr_1fr] gap-3 flex-1 w-full">
                                                                <div className="space-y-1">
                                                                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block pl-1">Add-on Label</label>
                                                                    <input
                                                                        type="text" placeholder="Label (e.g. Feather Add-on)" value={addOn.label}
                                                                        onChange={e => updateAddOn(idx, 'label', e.target.value)}
                                                                        className="w-full px-4 py-2 bg-white border border-transparent rounded-xl text-xs font-bold text-charcoal outline-none focus:border-lavender transition-all"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block pl-1">Price / Card</label>
                                                                    <div className="relative">
                                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                                                                        <input
                                                                            type="number" placeholder="0" value={addOn.pricePerCard}
                                                                            onChange={e => updateAddOn(idx, 'pricePerCard', parseFloat(e.target.value) || 0)}
                                                                            className="w-full px-8 py-2 bg-white border border-transparent rounded-xl text-xs font-black text-charcoal outline-none focus:border-lavender transition-all"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest block pl-1">Internal Note</label>
                                                                    <input
                                                                        type="text" placeholder="Note (optional)" value={addOn.note}
                                                                        onChange={e => updateAddOn(idx, 'note', e.target.value)}
                                                                        className="w-full px-4 py-2 bg-white border border-transparent rounded-xl text-xs font-medium text-gray-500 outline-none focus:border-lavender transition-all"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeAddOn(idx)}
                                                                className="absolute top-2 right-2 sm:relative sm:top-auto sm:right-auto p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </section>

                                        <section className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <Upload size={14} /> Design Gallery
                                            </h3>

                                            <div className="grid grid-cols-3 gap-4">
                                                {formData.images.map((img, idx) => (
                                                    <div key={idx} className="aspect-[3/4] rounded-2xl overflow-hidden relative group border border-gray-100">
                                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-charcoal/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                type="button" onClick={() => {
                                                                    const images = [...formData.images];
                                                                    images.splice(idx, 1);
                                                                    setFormData({ ...formData, images });
                                                                }}
                                                                className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <label className="aspect-[3/4] rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-3 text-gray-300 hover:border-lavender hover:text-lavender transition-all cursor-pointer bg-gray-50/50">
                                                    <input type="file" multiple className="hidden" onChange={(e) => handleMediaUpload(e, 'image')} accept="image/*" />
                                                    <Upload size={24} strokeWidth={1.5} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-center">Add Images</span>
                                                </label>
                                            </div>

                                            <div className="pt-6 border-t border-gray-50">
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Video Highlight (Optional)</h4>
                                                {formData.videoUrl ? (
                                                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-100 bg-black group">
                                                        <video src={formData.videoUrl} className="w-full h-full object-cover" controls muted />
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, videoUrl: '' })}
                                                            className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-red-500 text-white rounded-lg flex items-center justify-center backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <label className="w-full h-32 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-2 text-gray-300 hover:border-lavender hover:text-lavender transition-all cursor-pointer bg-gray-50/50">
                                                        <input type="file" className="hidden" onChange={(e) => handleMediaUpload(e, 'video')} accept="video/*" />
                                                        <Upload size={20} strokeWidth={1.5} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Upload Video Reel</span>
                                                    </label>
                                                )}
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </form>

                            <div className="p-8 bg-white border-t border-gray-100 w-full flex items-center justify-between shrink-0">
                                <div className="hidden sm:flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
                                        <Check size={20} className="" />
                                    </div>
                                    <p className="text-xs font-bold text-gray-500">Auto-saved as draft in browser RAM</p>
                                </div>
                                <div className="flex gap-4 w-full sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 sm:flex-none px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:text-charcoal transition-colors"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        form="design-form"
                                        disabled={isSubmitting}
                                        className="flex-1 sm:flex-none px-10 py-4 bg-charcoal hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-charcoal/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingDesign ? 'Update Design' : 'Publish Design')}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Check({ size, className }: { size: number; className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M20 6 9 17l-5-5" />
        </svg>
    );
}
