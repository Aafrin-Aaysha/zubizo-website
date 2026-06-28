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
    PlayCircle,
    Star
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
    const [activeTab, setActiveTab] = useState<'Image' | 'Website'>('Image');
    const [sortBy, setSortBy] = useState('newest');
    const [filterStatus, setFilterStatus] = useState('all');
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
        isNewArrival: false,
        isActive: true,
        images: [] as string[],
        videoUrl: '',
        demoUrl: '',
        packageName: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchInitialData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const [designsRes, catsRes] = await Promise.all([
                fetch(`/api/designs?showInactive=true&_t=${Date.now()}`, { cache: 'no-store' }),
                fetch(`/api/categories?_t=${Date.now()}`, { cache: 'no-store' })
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

    let filteredDesigns = designs.filter(design => {
        const matchesSearch =
            design.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            design.sku.toLowerCase().includes(searchQuery.toLowerCase());

        const categoryName = design.categoryId?.name || "";
        
        let matchesTab = false;
        if (activeTab === 'Image') {
            matchesTab = categoryName === 'Digital E-Invite';
        } else {
            matchesTab = categoryName === 'Premium E-Website';
        }

        let matchesStatus = true;
        if (filterStatus === 'best-seller') matchesStatus = design.isTrending === true;
        if (filterStatus === 'trending') matchesStatus = design.isFeatured === true;
        if (filterStatus === 'new-arrival') matchesStatus = design.isNewArrival === true;
        if (filterStatus === 'active') matchesStatus = design.isActive === true;
        if (filterStatus === 'draft') matchesStatus = design.isActive === false;

        return matchesSearch && matchesTab && matchesStatus;
    });

    filteredDesigns = filteredDesigns.sort((a, b) => {
        if (sortBy === 'price-high') return (b.basePrice || 0) - (a.basePrice || 0);
        if (sortBy === 'price-low') return (a.basePrice || 0) - (b.basePrice || 0);
        if (sortBy === 'oldest') return String(a.sku).localeCompare(String(b.sku));
        return String(b.sku).localeCompare(String(a.sku)); // Default newest
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
                } else {
                    toast.error(result.message || `Failed to upload ${type}`);
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

    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.setData('imageIndex', index.toString());
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        const dragIndex = parseInt(e.dataTransfer.getData('imageIndex'));
        if (dragIndex === dropIndex || isNaN(dragIndex)) return;

        const newImages = [...formData.images];
        const [draggedImage] = newImages.splice(dragIndex, 1);
        newImages.splice(dropIndex, 0, draggedImage);

        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate categoryId is set
        if (!formData.categoryId) {
            toast.error('The required categories (Digital E-Invite / Premium E-Website) are missing from the database. Please ensure they exist in Categories management.');
            return;
        }

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
                isNewArrival: design.isNewArrival || false,
                isActive: design.isActive !== undefined ? design.isActive : true,
                images: design.images || [],
                videoUrl: design.videoUrl || '',
                demoUrl: design.demoUrl || '',
                packageName: design.packageName || ''
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
                isNewArrival: false,
                isActive: true,
                images: [],
                videoUrl: '',
                demoUrl: '',
                packageName: ''
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
                    <h2 className="text-2xl font-normal text-charcoal">Digital Invite Management</h2>
                    <p className="text-gray-500 mt-1 font-medium">Manage Image and Website Invitations.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => openModal()}
                        className="bg-lavender hover:bg-[#9a6ab5] text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-lavender/20 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                    >
                        <Plus size={20} />
                        New {activeTab} Invite
                    </button>
                </div>
            </div>

            {/* Tab Switched & Search */}
            <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col gap-4">
                {/* Top Row: Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 scrollbar-hide">
                    <button
                        onClick={() => setActiveTab('Image')}
                        className={cn(
                            "flex-1 md:flex-none xl:w-40 px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all shrink-0",
                            activeTab === 'Image' ? "bg-lavender text-white shadow-md shadow-lavender/20" : "bg-gray-50 text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <ImageIcon size={14} />
                        Image
                    </button>
                    <button
                        onClick={() => setActiveTab('Website')}
                        className={cn(
                            "flex-1 md:flex-none xl:w-40 px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all shrink-0",
                            activeTab === 'Website' ? "bg-lavender text-white shadow-md shadow-lavender/20" : "bg-gray-50 text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <Globe size={14} />
                        Website
                    </button>
                </div>

                {/* Bottom Row: Search, Status, Sort */}
                <div className="flex flex-col xl:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-4 w-full">
                    <div className="relative w-full xl:w-96 group shrink-0">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6E4B8B] group-focus-within:text-lavender transition-colors" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={`Search ${activeTab} invites by SKU or Name...`}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-charcoal focus:outline-none focus:ring-4 focus:ring-lavender/10 focus:border-lavender transition-all font-medium"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full sm:w-auto px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-lavender/10 focus:border-lavender text-charcoal font-bold cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="best-seller">Best Seller</option>
                            <option value="trending">Trending</option>
                            <option value="new-arrival">New Arrival</option>
                            <option value="active">Active</option>
                            <option value="draft">Draft</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full sm:w-auto px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-lavender/10 focus:border-lavender text-charcoal font-bold cursor-pointer"
                        >
                            <option value="newest">ID: Descending</option>
                            <option value="oldest">ID: Ascending</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="price-low">Price: Low to High</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Design List */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[#6E4B8B] text-[10px] font-bold uppercase tracking-widest border-b border-gray-100">
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
                                                     {design.packageName && (
                                                         <p className="text-[10px] font-bold text-[#6E4B8B] uppercase tracking-widest mt-0.5">
                                                             {design.packageName} Package • ₹{design.basePrice || getStartingPrice(design)}
                                                         </p>
                                                     )}
                                                 </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-xs font-bold text-lavender uppercase tracking-widest">{design.sku}</td>
                                        <td className="px-8 py-5">
                                            {activeTab === 'Website' ? (
                                                <a href={design.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-bold text-lavender hover:underline">
                                                    <ExternalLink size={14} /> View Live
                                                </a>
                                            ) : (
                                                <span className="text-xs font-medium text-gray-500">{design.images?.length || 0} Images</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-wrap gap-2 items-center">
                                                {design.isTrending && (
                                                    <span className="bg-orange-100 text-orange-800 text-[10px] px-2 py-0.5 rounded font-bold">Best Seller</span>
                                                )}
                                                {design.isFeatured && (
                                                    <span className="bg-lavender/10 text-lavender text-[10px] px-2 py-0.5 rounded font-bold">Trending</span>
                                                )}
                                                {design.isNewArrival && (
                                                    <span className="bg-[#ae7fcb] text-white text-[10px] px-2 py-0.5 rounded font-bold">New Arrival</span>
                                                )}
                                                <div className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                                                    design.isActive ? "text-green-600 bg-green-50 border-green-100" : "text-[#6E4B8B] bg-gray-50 border-gray-100"
                                                )}>
                                                    {design.isActive ? 'Active' : 'Draft'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openModal(design)} className="p-2.5 text-[#6E4B8B] hover:text-lavender hover:bg-lavender/5 rounded-xl transition-all border border-transparent hover:border-lavender/20">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => deleteDesign(design._id)} className="p-2.5 text-[#6E4B8B] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100">
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

                {/* Mobile/Tablet Card Layout */}
                <div className="md:hidden p-5 space-y-4">
                    {isLoading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse bg-gray-50 p-5 rounded-3xl border border-gray-100 h-40"></div>
                        ))
                    ) : paginatedDesigns.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mx-auto mb-4">
                                <Zap size={32} />
                            </div>
                            <p className="font-bold text-gray-900">No {activeTab} invites found</p>
                            <button onClick={() => openModal()} className="text-lavender font-bold hover:underline text-sm mt-1">Create your first invite</button>
                        </div>
                    ) : (
                        paginatedDesigns.map(design => (
                            <div key={design._id} className="bg-gray-50/40 p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-100 overflow-hidden flex-shrink-0 shadow-sm">
                                        {design.images?.[0] ? (
                                            <img src={design.images[0]} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={16} /></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-charcoal text-sm truncate">{design.name}</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="text-[10px] font-bold text-lavender bg-lavender/5 px-2.5 py-1 rounded-full border border-lavender/10 uppercase tracking-widest">
                                                {design.sku}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between border-t border-gray-100/60 pt-3">
                                    <div className="flex items-center gap-2">
                                        {design.isTrending && <span className="bg-orange-100 text-orange-800 text-[10px] px-2 py-0.5 rounded font-bold">Best Seller</span>}
                                        {design.isFeatured && <span className="bg-lavender/10 text-lavender text-[10px] px-2 py-0.5 rounded font-bold">Trending</span>}
                                        {design.isNewArrival && <span className="bg-[#ae7fcb] text-white text-[10px] px-2 py-0.5 rounded font-bold">New Arrival</span>}
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                                            design.isActive ? "text-green-600 bg-green-50 border-green-100" : "text-[#6E4B8B] bg-gray-50 border-gray-100"
                                        )}>
                                            {design.isActive ? 'Active' : 'Draft'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => openModal(design)} className="p-2 text-[#6E4B8B] hover:text-lavender hover:bg-lavender/5 rounded-xl transition-all">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => deleteDesign(design._id)} className="p-2 text-[#6E4B8B] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
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
                                        {activeTab === 'Image' ? <ImageIcon size={24} /> : <Globe size={24} />}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-normal text-charcoal">{editingDesign ? 'Edit' : 'Create'} {activeTab} Invite</h2>
                                        <p className="text-[10px] text-[#6E4B8B] font-bold uppercase tracking-widest mt-1">Specialized Digital Configuration</p>
                                    </div>
                                </div>
                                <button onClick={closeModal} className="w-10 h-10 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors"><X size={20} /></button>
                            </div>

                            <form id="digital-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    {/* Left Column */}
                                    <div className="space-y-8">
                                        <section className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-5">
                                             <div className="text-[10px] font-bold text-[#6E4B8B] uppercase tracking-widest flex items-center gap-2">
                                                <Info size={14} /> Essential Details
                                            </div>
                                            <div className="space-y-5">
                                                <div>
                                                    <label className="text-[10px] font-bold text-charcoal uppercase tracking-widest mb-2 block">Name</label>
                                                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-[1.25rem] focus:bg-white focus:border-lavender outline-none transition-all font-bold text-charcoal" placeholder="e.g. Royal Marigold" />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-charcoal uppercase tracking-widest mb-2 block">SKU</label>
                                                    <input type="text" required value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-[1.25rem] focus:bg-white focus:border-lavender outline-none transition-all font-bold uppercase" placeholder="ZT-001" />
                                                </div>
                                                
                                                {activeTab === 'Website' && (
                                                    <>
                                                        <div>
                                                            <label className="text-[10px] font-bold text-charcoal uppercase tracking-widest mb-2 block">Live Demo Link</label>
                                                            <input type="url" required value={formData.demoUrl} onChange={e => setFormData({ ...formData, demoUrl: e.target.value })} className="w-full px-5 py-4 bg-lavender/5 border-2 border-lavender/20 rounded-[1.25rem] focus:bg-white focus:border-lavender outline-none transition-all font-bold text-lavender text-xs" placeholder="https://..." />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-5">
                                                            <div>
                                                                <label className="text-[10px] font-bold text-charcoal uppercase tracking-widest mb-2 block">Package</label>
                                                                <select 
                                                                    required 
                                                                    value={formData.packageName} 
                                                                    onChange={e => setFormData({ ...formData, packageName: e.target.value })} 
                                                                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-[1.25rem] focus:bg-white focus:border-lavender outline-none transition-all font-bold text-charcoal"
                                                                >
                                                                    <option value="">Select Package</option>
                                                                    <option value="Starter">Starter</option>
                                                                    <option value="Value">Value</option>
                                                                    <option value="Premium">Premium</option>
                                                                    <option value="Ultra">Ultra</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] font-bold text-charcoal uppercase tracking-widest mb-2 block">Price (₹)</label>
                                                                <input 
                                                                    type="number" 
                                                                    required 
                                                                    value={formData.basePrice === 0 ? '' : formData.basePrice} 
                                                                    onChange={e => setFormData({ ...formData, basePrice: e.target.value === '' ? 0 : parseFloat(e.target.value) })} 
                                                                    onWheel={(e) => (e.target as HTMLInputElement).blur()} 
                                                                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-[1.25rem] focus:bg-white focus:border-lavender font-bold" 
                                                                    placeholder="e.g. 2499"
                                                                />
                                                            </div>
                                                        </div>
                                                    </>
                                                )}

                                                <div className="space-y-3 mb-6">
                                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-lavender/20 transition-all cursor-pointer"
                                                        onClick={() => setFormData({ ...formData, isNewArrival: !formData.isNewArrival })}>
                                                        <div>
                                                            <p className="font-bold text-charcoal text-sm">Mark as New Arrival</p>
                                                            <p className="text-[10px] text-[#6E4B8B] font-bold uppercase tracking-widest">Show in "Just Designed for You" section</p>
                                                        </div>
                                                        <div className={cn("w-10 h-6 rounded-full relative transition-all", formData.isNewArrival ? "bg-lavender" : "bg-gray-200")}>
                                                            <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", formData.isNewArrival ? "left-5" : "left-1")} />
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-lavender/20 transition-all cursor-pointer"
                                                        onClick={() => setFormData({ ...formData, isTrending: !formData.isTrending })}>
                                                        <div>
                                                            <p className="font-bold text-charcoal text-sm">Mark as Best Seller</p>
                                                            <p className="text-[10px] text-[#6E4B8B] font-bold uppercase tracking-widest">Show in best seller sections</p>
                                                        </div>
                                                        <div className={cn("w-10 h-6 rounded-full relative transition-all", formData.isTrending ? "bg-lavender" : "bg-gray-200")}>
                                                            <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", formData.isTrending ? "left-5" : "left-1")} />
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-lavender/20 transition-all cursor-pointer"
                                                        onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}>
                                                        <div>
                                                            <p className="font-bold text-charcoal text-sm">Mark as Trending</p>
                                                            <p className="text-[10px] text-[#6E4B8B] font-bold uppercase tracking-widest">Show in trending home page section</p>
                                                        </div>
                                                        <div className={cn("w-10 h-6 rounded-full relative transition-all", formData.isFeatured ? "bg-lavender" : "bg-gray-200")}>
                                                            <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", formData.isFeatured ? "left-5" : "left-1")} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-[10px] font-bold text-charcoal uppercase tracking-widest mb-2 block">Visibility</label>
                                                    <button type="button" onClick={() => setFormData({ ...formData, isActive: !formData.isActive })} className={cn("w-full px-5 py-4 rounded-[1.25rem] border-2 flex items-center justify-between transition-all", formData.isActive ? "border-green-100 bg-green-50/50 text-green-700" : "border-gray-100 bg-gray-50 text-[#6E4B8B]")}>
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
                                            <div className="text-[10px] font-bold text-[#6E4B8B] uppercase tracking-widest flex items-center gap-2">
                                                <ImageIcon size={14} /> Showcase Images
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                {formData.images.map((img, idx) => (
                                                    <div 
                                                        key={idx} 
                                                        className="aspect-[3/4] rounded-2xl overflow-hidden relative group border border-gray-50 bg-gray-50 cursor-move"
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, idx)}
                                                        onDragOver={handleDragOver}
                                                        onDrop={(e) => handleDrop(e, idx)}
                                                    >
                                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                                        <button type="button" onClick={() => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) })} className="absolute top-2 right-2 w-8 h-8 bg-black/60 backdrop-blur-md text-white rounded-xl flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all border border-white/20"><Trash2 size={14} /></button>
                                                        {idx > 0 && (
                                                            <button type="button" onClick={() => setFormData({ ...formData, images: [img, ...formData.images.filter((_, i) => i !== idx)] })} className="absolute top-2 right-12 w-8 h-8 bg-black/60 backdrop-blur-md text-white rounded-xl flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all border border-white/20 hover:text-yellow-400" title="Make Primary"><Star size={14} /></button>
                                                        )}
                                                    </div>
                                                ))}
                                                <label className="aspect-[3/4] rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-3 text-gray-300 hover:border-lavender hover:text-lavender transition-all cursor-pointer bg-gray-50/30 hover:bg-lavender/5 group">
                                                    <input type="file" multiple className="hidden" onChange={(e) => handleMediaUpload(e, 'image')} accept="image/*" />
                                                    <div className="w-10 h-10 rounded-full bg-white group-hover:bg-lavender/10 flex items-center justify-center shadow-sm transition-all">
                                                        <Plus size={20} />
                                                    </div>
                                                    <span className="text-[8px] font-bold uppercase text-center px-4 tracking-widest">Add {activeTab === 'Website' ? 'Mockups' : 'Designs'}</span>
                                                </label>
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </form>

                            <div className="p-8 bg-white border-t border-gray-100 flex justify-between items-center shrink-0">
                                <button onClick={closeModal} className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest text-[#6E4B8B] hover:text-charcoal transition-colors">Discard</button>
                                <button type="submit" form="digital-form" disabled={isSubmitting} className="px-10 py-4 bg-charcoal hover:bg-black text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-charcoal/20 transition-all flex items-center justify-center gap-3">
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
