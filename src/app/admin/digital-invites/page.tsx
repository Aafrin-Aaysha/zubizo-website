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
    ChevronLeft,
    ChevronRight,
    Info,
    Settings,
    Package as PackageIcon,
    AlertCircle,
    Zap,
    ExternalLink,
    Image as ImageIcon,
    Globe,
    PlayCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn, getStartingPrice } from '@/lib/utils';

export default function DigitalInvitesAdminPage() {
    const router = useRouter();
    const [designs, setDesigns] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDesign, setEditingDesign] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'Image' | 'Video' | 'Website'>('Image');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Form State
    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        slug: '',
        description: '',
        categoryId: '',
        minQuantity: 1 as number | string,
        basePrice: 0 as number | string,
        packages: [] as any[],
        addOns: [] as any[],
        isTrending: false,
        isFeatured: false,
        isActive: true,
        images: [] as string[],
        videoUrl: '',
        demoUrl: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchInitialData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const [designsRes, catsRes] = await Promise.all([
                fetch('/api/designs?showInactive=true'),
                fetch('/api/categories')
            ]);
            const designsData = await designsRes.json();
            const catsData = await catsRes.json();

            // Filter for Digital categories only
            const allCats = Array.isArray(catsData) ? catsData : [];
            const digitalCats = allCats.filter(c => 
                ["Digital E-Invite", "Premium E-Website"].includes(c.name)
            );
            setCategories(digitalCats);

            // Filter designs into digital only
            const digitalCatIds = digitalCats.map(c => c._id);
            const allDesigns = Array.isArray(designsData) ? designsData : [];
            const filteredDigital = allDesigns.filter(d => {
                const cid = d.categoryId?._id || d.categoryId;
                return digitalCatIds.includes(cid);
            });
            setDesigns(filteredDigital);
            
            // Set initial category in form if empty
            if (digitalCats.length > 0 && !formData.categoryId) {
                const defaultCat = activeTab === 'Website' 
                    ? digitalCats.find(c => c.name === 'Premium E-Website')
                    : digitalCats.find(c => c.name === 'Digital E-Invite');
                setFormData(prev => ({ ...prev, categoryId: defaultCat?._id || digitalCats[0]._id }));
            }
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    }, [formData.categoryId, activeTab]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    useEffect(() => {
        if (formData.name && formData.sku) {
            const generatedSlug = `${formData.name}-${formData.sku}`
                .toLowerCase()
                .replace(/[^\w ]+/g, '')
                .replace(/ +/g, '-');
            setFormData(prev => ({ ...prev, slug: generatedSlug }));
        }
    }, [formData.name, formData.sku]);

    const filteredDesigns = designs.filter(design => {
        const matchesSearch =
            design.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            design.sku.toLowerCase().includes(searchQuery.toLowerCase());

        const categoryName = design.categoryId?.name || "";
        
        let matchesTab = false;
        if (activeTab === 'Image') {
            matchesTab = categoryName === 'Digital E-Invite' && (!design.videoUrl || design.videoUrl.trim() === '');
        } else if (activeTab === 'Video') {
            matchesTab = categoryName === 'Digital E-Invite' && (design.videoUrl && design.videoUrl.trim() !== '');
        } else {
            matchesTab = categoryName === 'Premium E-Website';
        }

        return matchesSearch && matchesTab;
    });

    const totalPages = Math.ceil(filteredDesigns.length / itemsPerPage);
    const paginatedDesigns = filteredDesigns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, activeTab]);

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

        // Validate mandatory fields
        const currentCat = categories.find(c => c._id === formData.categoryId);
        if (currentCat?.name === 'Premium E-Website' && !formData.demoUrl) {
            toast.error('Demo Link is mandatory for E-Websites');
            return;
        }

        if (activeTab === 'Video' && !formData.videoUrl) {
            toast.error('Video file is mandatory for Video Invites');
            return;
        }

        // Ensure at least one package
        const finalData = { ...formData };
        if (finalData.packages.length === 0) {
            finalData.packages = [{
                title: activeTab === 'Website' ? 'Website Access' : 'Digital Delivery',
                inclusions: [activeTab === 'Website' ? 'Interactive Link' : 'JPEG/PNG/PDF Bundle'],
                priceTiers: [{ minQty: 1, maxQty: null, pricePerCard: 1 }]
            }];
        }

        setIsSubmitting(true);
        const url = editingDesign ? `/api/designs/${editingDesign._id}` : '/api/designs';
        const method = editingDesign ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalData),
            });

            if (res.ok) {
                toast.success(editingDesign ? 'Invite updated' : 'Invite created');
                router.refresh();
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
        if (!confirm('Are you sure you want to delete this digital invite?')) return;

        try {
            const res = await fetch(`/api/designs/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Invite deleted');
                fetchInitialData();
            }
        } catch (error) {
            toast.error('Failed to delete');
        }
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
                minQuantity: design.minQuantity || 1,
                basePrice: design.basePrice || 0,
                packages: design.packages || [],
                addOns: design.addOns || [],
                isTrending: design.isTrending || false,
                isFeatured: design.isFeatured || false,
                isActive: design.isActive !== undefined ? design.isActive : true,
                images: design.images || [],
                videoUrl: design.videoUrl || '',
                demoUrl: design.demoUrl || ''
            });
        } else {
            setEditingDesign(null);
            // Pre-select category based on active tab
            const targetCat = categories.find(c => 
                activeTab === 'Website' ? c.name === 'Premium E-Website' : c.name === 'Digital E-Invite'
            );
            setFormData({
                sku: '',
                name: '',
                slug: '',
                description: '',
                categoryId: targetCat?._id || categories[0]?._id || '',
                minQuantity: 1,
                basePrice: 0,
                packages: [],
                addOns: [],
                isTrending: false,
                isFeatured: false,
                isActive: true,
                images: [],
                videoUrl: '',
                demoUrl: ''
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
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Digital Invite Management</h1>
                    <p className="text-gray-500 mt-1 font-medium">Manage Image, Video, and Website Invitations.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => openModal()}
                        className="bg-lavender hover:bg-[#9a6ab5] text-white px-8 py-3.5 rounded-2xl font-black shadow-xl shadow-lavender/20 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                    >
                        <Plus size={20} />
                        New {activeTab} Invite
                    </button>
                </div>
            </div>

            {/* Tab Switched & Search */}
            <div className="flex flex-col xl:flex-row items-center gap-6">
                <div className="bg-gray-100 p-1.5 rounded-2xl flex items-center gap-1 w-full xl:w-auto">
                    <button
                        onClick={() => setActiveTab('Image')}
                        className={cn(
                            "flex-1 xl:w-40 px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                            activeTab === 'Image' ? "bg-white text-lavender shadow-sm" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        <ImageIcon size={14} />
                        Image
                    </button>
                    <button
                        onClick={() => setActiveTab('Video')}
                        className={cn(
                            "flex-1 xl:w-40 px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                            activeTab === 'Video' ? "bg-white text-lavender shadow-sm" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        <PlayCircle size={14} />
                        Video
                    </button>
                    <button
                        onClick={() => setActiveTab('Website')}
                        className={cn(
                            "flex-1 xl:w-40 px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                            activeTab === 'Website' ? "bg-white text-lavender shadow-sm" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        <Globe size={14} />
                        Website
                    </button>
                </div>

                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-lavender transition-colors" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search ${activeTab} invites by SKU or Name...`}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-lavender/10 focus:border-lavender transition-all font-medium shadow-sm"
                    />
                </div>
            </div>

            {/* Design List */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5">Invite</th>
                                <th className="px-8 py-5">SKU</th>
                                <th className="px-8 py-5">
                                    {activeTab === 'Image' && 'Photos'}
                                    {activeTab === 'Video' && 'Video Clip'}
                                    {activeTab === 'Website' && 'Live Link'}
                                </th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-8 py-8"><div className="h-10 bg-gray-50 rounded-2xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : paginatedDesigns.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                                                <Zap size={40} />
                                            </div>
                                            <p className="font-bold text-gray-900 text-lg">No {activeTab} invites found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedDesigns.map(design => (
                                    <tr key={design._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-100 overflow-hidden flex-shrink-0">
                                                    {design.images?.[0] ? (
                                                        <img src={design.images[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-200"><ImageIcon size={16} /></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-charcoal">{design.name}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">₹{design.basePrice || getStartingPrice(design)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-xs font-black text-lavender uppercase tracking-widest">{design.sku}</td>
                                        <td className="px-8 py-5">
                                            {activeTab === 'Website' ? (
                                                <a href={design.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-lavender hover:underline">
                                                    <ExternalLink size={14} /> View Live
                                                </a>
                                            ) : activeTab === 'Video' ? (
                                                <a href={design.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-blue-500 hover:underline">
                                                    <PlayCircle size={14} /> Play Video
                                                </a>
                                            ) : (
                                                <span className="text-xs font-medium text-gray-500">{design.images?.length || 0} Images</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className={cn(
                                                "inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                                design.isActive ? "text-green-600 bg-green-50 border-green-100" : "text-gray-400 bg-gray-50 border-gray-100"
                                            )}>
                                                {design.isActive ? 'Active' : 'Draft'}
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
            </div>

            {/* Specialized Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 overflow-hidden">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-charcoal/30 backdrop-blur-md" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-4xl bg-gray-50 max-h-[95vh] shadow-2xl rounded-[3rem] flex flex-col overflow-hidden"
                        >
                            <div className="p-8 bg-white border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-lavender/10 text-lavender flex items-center justify-center">
                                        {activeTab === 'Image' ? <ImageIcon size={24} /> : activeTab === 'Video' ? <PlayCircle size={24} /> : <Globe size={24} />}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-charcoal">{editingDesign ? 'Edit' : 'Create'} {activeTab} Invite</h2>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Specialized Digital Configuration</p>
                                    </div>
                                </div>
                                <button onClick={closeModal} className="w-10 h-10 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors"><X size={20} /></button>
                            </div>

                            <form id="digital-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    {/* Left Column */}
                                    <div className="space-y-8">
                                        <section className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-5">
                                             <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <Info size={14} /> Essential Details
                                            </h3>
                                            <div className="space-y-5">
                                                <div>
                                                    <label className="text-[10px] font-black text-charcoal uppercase tracking-widest mb-2 block">Name</label>
                                                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-[1.25rem] focus:bg-white focus:border-lavender outline-none transition-all font-bold text-charcoal" placeholder="e.g. Royal Marigold" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-5">
                                                    <div>
                                                        <label className="text-[10px] font-black text-charcoal uppercase tracking-widest mb-2 block">SKU</label>
                                                        <input type="text" required value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-[1.25rem] focus:bg-white focus:border-lavender outline-none transition-all font-black uppercase" placeholder="ZT-001" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black text-charcoal uppercase tracking-widest mb-2 block">Price (₹)</label>
                                                        <input type="number" required value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })} className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-[1.25rem] focus:bg-white focus:border-lavender font-black" />
                                                    </div>
                                                </div>
                                                
                                                {activeTab === 'Video' && (
                                                    <div>
                                                        <label className="text-[10px] font-black text-charcoal uppercase tracking-widest mb-2 block">Video Resource</label>
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-3">
                                                                <input type="text" value={formData.videoUrl} onChange={e => setFormData({ ...formData, videoUrl: e.target.value })} className="flex-1 px-5 py-4 bg-blue-50/50 border border-transparent rounded-[1.25rem] focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-blue-600 text-xs" placeholder="Video URL or Upload..." />
                                                                <label className="w-14 h-14 bg-white border border-gray-100 rounded-[1.25rem] flex items-center justify-center text-blue-500 hover:border-blue-300 cursor-pointer shadow-sm">
                                                                    <input type="file" className="hidden" onChange={(e) => handleMediaUpload(e, 'video')} accept="video/*" />
                                                                    <Upload size={20} />
                                                                </label>
                                                            </div>
                                                            {formData.videoUrl && (
                                                                <div className="px-4 py-2 bg-blue-50 rounded-xl flex items-center justify-between">
                                                                    <span className="text-[9px] font-black uppercase text-blue-400">Clip Linked</span>
                                                                    <button type="button" onClick={() => setFormData({ ...formData, videoUrl: '' })} className="text-blue-600 hover:text-red-500"><Trash2 size={14} /></button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {activeTab === 'Website' && (
                                                    <div>
                                                        <label className="text-[10px] font-black text-charcoal uppercase tracking-widest mb-2 block">Live Demo Link</label>
                                                        <input type="url" required value={formData.demoUrl} onChange={e => setFormData({ ...formData, demoUrl: e.target.value })} className="w-full px-5 py-4 bg-lavender/5 border-2 border-lavender/20 rounded-[1.25rem] focus:bg-white focus:border-lavender outline-none transition-all font-bold text-lavender text-xs" placeholder="https://..." />
                                                    </div>
                                                )}

                                                <div>
                                                    <label className="text-[10px] font-black text-charcoal uppercase tracking-widest mb-2 block">Visibility</label>
                                                    <button type="button" onClick={() => setFormData({ ...formData, isActive: !formData.isActive })} className={cn("w-full px-5 py-4 rounded-[1.25rem] border-2 flex items-center justify-between transition-all", formData.isActive ? "border-green-100 bg-green-50/50 text-green-700" : "border-gray-100 bg-gray-50 text-gray-400")}>
                                                        <span className="font-bold text-xs">{formData.isActive ? 'Active on Catalog' : 'Save as Draft'}</span>
                                                        <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", formData.isActive ? "bg-green-500" : "bg-gray-300")} />
                                                    </button>
                                                </div>
                                            </div>
                                        </section>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-8">
                                        <section className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <ImageIcon size={14} /> Showcase Images
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                {formData.images.map((img, idx) => (
                                                    <div key={idx} className="aspect-[3/4] rounded-2xl overflow-hidden relative group border border-gray-50 bg-gray-50">
                                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                                        <button type="button" onClick={() => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) })} className="absolute top-2 right-2 w-8 h-8 bg-black/60 backdrop-blur-md text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-white/20"><Trash2 size={14} /></button>
                                                    </div>
                                                ))}
                                                <label className="aspect-[3/4] rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-3 text-gray-300 hover:border-lavender hover:text-lavender transition-all cursor-pointer bg-gray-50/30 hover:bg-lavender/5 group">
                                                    <input type="file" multiple className="hidden" onChange={(e) => handleMediaUpload(e, 'image')} accept="image/*" />
                                                    <div className="w-10 h-10 rounded-full bg-white group-hover:bg-lavender/10 flex items-center justify-center shadow-sm transition-all">
                                                        <Plus size={20} />
                                                    </div>
                                                    <span className="text-[8px] font-black uppercase text-center px-4 tracking-widest">Add {activeTab === 'Website' ? 'Mockups' : 'Designs'}</span>
                                                </label>
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </form>

                            <div className="p-8 bg-white border-t border-gray-100 flex justify-between items-center shrink-0">
                                <button onClick={closeModal} className="px-8 py-4 font-black text-[10px] uppercase tracking-widest text-gray-400 hover:text-charcoal transition-colors">Discard</button>
                                <button type="submit" form="digital-form" disabled={isSubmitting} className="px-10 py-4 bg-charcoal hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-charcoal/20 transition-all flex items-center justify-center gap-3">
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingDesign ? 'Update Invite' : `Publish ${activeTab} Invite`)}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
