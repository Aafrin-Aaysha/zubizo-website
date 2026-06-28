'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
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
    AlertCircle,
    Zap,
    Star,
    ArrowLeft,
    ArrowRight,
    Sliders
} from 'lucide-react';
import { SortableImageGrid } from '@/components/SortableImageGrid';
import toast from 'react-hot-toast';
import { cn, getStartingPrice } from '@/lib/utils';

export default function DesignsPage() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDesign, setEditingDesign] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [activeFormTab, setActiveFormTab] = useState<'Details' | 'Pricing' | 'Media'>('Details');
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
        materials: [] as any[],
        isTrending: false,
        isFeatured: false,
        isNewArrival: false,
        isActive: true,
        images: [] as string[],
        videoUrl: '',
        demoUrl: '',
        options: {
            hasEnvelope: false,
            hasRibbon: false,
            hasWaxSeal: false,
            hasChart: false,
            displayModelColours: '',
            envelopeTierBSurcharge: 3,
            envelopeTierCSurcharge: 6,
            ribbonPremiumSurcharge: 2,
            images: {} as { [key: string]: string }
        }
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: designs = [], isLoading: designsLoading } = useQuery<any[]>({
        queryKey: ['designs'],
        queryFn: async () => {
            const res = await fetch('/api/designs?showInactive=true');
            if (!res.ok) throw new Error('Failed to load designs');
            return res.json();
        }
    });

    const { data: categories = [], isLoading: categoriesLoading } = useQuery<any[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await fetch('/api/categories');
            if (!res.ok) throw new Error('Failed to load categories');
            return res.json();
        }
    });

    const { data: inventory = [] } = useQuery<any[]>({
        queryKey: ['inventory'],
        queryFn: async () => {
            const res = await fetch('/api/admin/inventory');
            if (!res.ok) throw new Error('Failed to load inventory');
            return res.json();
        }
    });

    const isLoading = designsLoading || categoriesLoading;

    useEffect(() => {
        if (formData.name && formData.sku) {
            const generatedSlug = `${formData.name}-${formData.sku}`
                .toLowerCase()
                .replace(/[^\w ]+/g, '')
                .replace(/ +/g, '-');
            setFormData(prev => ({ ...prev, slug: generatedSlug }));
        }
    }, [formData.name, formData.sku, editingDesign]);

    const nonDigitalCategories = categories.filter(c => !["Digital E-Invite", "Premium E-Website"].includes(c.name));

    let filteredDesigns = designs.filter(design => {
        const categoryName = design.categoryId?.name || "";
        if (["Digital E-Invite", "Premium E-Website"].includes(categoryName)) return false;

        const matchesSearch =
            design.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            design.sku.toLowerCase().includes(searchQuery.toLowerCase());

        const categoryId = design.categoryId?._id || design.categoryId;
        const matchesCategory = activeCategory === 'all' || categoryId === activeCategory;

        let matchesStatus = true;
        if (filterStatus === 'best-seller') matchesStatus = design.isTrending === true;
        if (filterStatus === 'trending') matchesStatus = design.isFeatured === true;
        if (filterStatus === 'new-arrival') matchesStatus = design.isNewArrival === true;
        if (filterStatus === 'active') matchesStatus = design.isActive === true;
        if (filterStatus === 'draft') matchesStatus = design.isActive === false;

        return matchesSearch && matchesCategory && matchesStatus;
    });

    filteredDesigns = filteredDesigns.sort((a, b) => {
        if (sortBy === 'price-high') return getStartingPrice(b) - getStartingPrice(a);
        if (sortBy === 'price-low') return getStartingPrice(a) - getStartingPrice(b);
        if (sortBy === 'oldest') return String(a.sku).localeCompare(String(b.sku));
        return String(b.sku).localeCompare(String(a.sku)); // Default newest
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

    const saveMutation = useMutation({
        mutationFn: async ({ isEditing, url, method, data }: any) => {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                 const error = await res.json();
                 throw new Error(error.message || 'Operation failed');
            }
            return res.json();
        },
        onSuccess: (_, { isEditing }) => {
            toast.success(isEditing ? 'Design updated' : 'Design created');
            queryClient.invalidateQueries({ queryKey: ['designs'] });
            router.refresh();
            closeModal();
            setFormData(prev => ({ ...prev, images: [], videoUrl: '', demoUrl: '' })); // reset form state carefully if needed
        },
        onError: (err: any) => toast.error(err.message),
        onSettled: () => setIsSubmitting(false)
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.categoryId) {
            toast.error('No categories found. Please create at least one category in Categories management before adding designs.');
            return;
        }

        if (formData.packages.length === 0) {
            toast.error('At least one package is required');
            return;
        }

        setIsSubmitting(true);
        const isEditing = !!editingDesign;
        const url = isEditing ? `/api/designs/${editingDesign._id}` : '/api/designs';
        const method = isEditing ? 'PUT' : 'POST';

        const payload = {
            ...formData,
            materials: formData.materials?.filter((m: any) => m.materialId) || [],
            addOns: formData.addOns?.filter((a: any) => a.label && a.label.trim() !== '') || [],
        };

        saveMutation.mutate({ isEditing, url, method, data: payload });
    };

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/designs/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete design');
            return res.json();
        },
        onSuccess: () => {
            toast.success('Design deleted');
            queryClient.invalidateQueries({ queryKey: ['designs'] });
            router.refresh();
        },
        onError: () => toast.error('Failed to delete design')
    });

    const deleteDesign = async (id: string) => {
        if (!confirm('Are you sure you want to delete this design?')) return;
        deleteMutation.mutate(id);
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
            addOns: [...formData.addOns, { label: '', pricePerCard: 0, isFixedPrice: false, note: '' }]
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
                materials: design.materials?.map((m: any) => ({ materialId: m.materialId?._id || m.materialId, quantityPerCard: m.quantityPerCard })) || [],
                isTrending: design.isTrending || false,
                isFeatured: design.isFeatured || false,
                isNewArrival: design.isNewArrival || false,
                isActive: design.isActive !== undefined ? design.isActive : true,
                images: design.images || [],
                videoUrl: design.videoUrl || '',
                demoUrl: design.demoUrl || '',
                options: {
                    hasEnvelope: design.options?.hasEnvelope || false,
                    hasRibbon: design.options?.hasRibbon || false,
                    hasWaxSeal: design.options?.hasWaxSeal || false,
                    hasChart: design.options?.hasChart || false,
                    displayModelColours: design.options?.displayModelColours || '',
                    envelopeTierBSurcharge: design.options?.envelopeTierBSurcharge !== undefined ? design.options.envelopeTierBSurcharge : 3,
                    envelopeTierCSurcharge: design.options?.envelopeTierCSurcharge !== undefined ? design.options.envelopeTierCSurcharge : 6,
                    ribbonPremiumSurcharge: design.options?.ribbonPremiumSurcharge !== undefined ? design.options.ribbonPremiumSurcharge : 2,
                    images: design.options?.images || {}
                }
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
                materials: [],
                isTrending: false,
                isFeatured: false,
                isNewArrival: false,
                isActive: true,
                images: [],
                videoUrl: '',
                demoUrl: '',
                options: {
                    hasEnvelope: false,
                    hasRibbon: false,
                    hasWaxSeal: false,
                    hasChart: false,
                    displayModelColours: '',
                    envelopeTierBSurcharge: 3,
                    envelopeTierCSurcharge: 6,
                    ribbonPremiumSurcharge: 2,
                    images: {}
                }
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
                    <h2 className="text-2xl font-normal text-charcoal">Design Management</h2>
                    <p className="text-gray-500 mt-1 font-medium">Manage your invitation catalogue and package pricing.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/bulk-import"
                        className="bg-white border border-gray-200 hover:border-lavender text-charcoal px-6 py-3.5 rounded-2xl font-bold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                    >
                        <Zap size={18} />
                        Bulk Import
                    </Link>
                    <button
                        onClick={() => openModal()}
                        className="bg-lavender hover:bg-[#9a6ab5] text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-lavender/20 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                    >
                        <Plus size={20} />
                        New Design
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col gap-4">
                {/* Top Row: Categories */}
                <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 scrollbar-hide">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={cn(
                            "px-5 py-2.5 text-xs font-bold rounded-xl transition-all border uppercase tracking-widest shrink-0",
                            activeCategory === 'all'
                                ? "bg-lavender text-white border-lavender shadow-md shadow-lavender/20"
                                : "text-gray-500 bg-gray-50 border-gray-100 hover:border-lavender/30"
                        )}
                    >
                        All
                    </button>
                    {nonDigitalCategories.map(cat => (
                        <button
                            key={cat._id}
                            onClick={() => setActiveCategory(cat._id)}
                            className={cn(
                                "px-5 py-2.5 text-xs font-bold rounded-xl transition-all border whitespace-nowrap uppercase tracking-widest shrink-0",
                                activeCategory === cat._id
                                    ? "bg-lavender text-white border-lavender shadow-md shadow-lavender/20"
                                    : "text-gray-500 bg-gray-50 border-gray-100 hover:border-lavender/30"
                            )}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Bottom Row: Search, Status, Sort */}
                <div className="flex flex-col xl:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-4 w-full">
                    <div className="relative w-full xl:w-96 group shrink-0">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6E4B8B] group-focus-within:text-lavender transition-colors" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by SKU or Name..."
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

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                {/* Desktop View Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px] lg:min-w-0">
                        <thead className="bg-gray-50/50 text-[#6E4B8B] text-[10px] font-bold uppercase tracking-widest border-b border-gray-100">
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
                                                    <p className="text-[10px] font-bold text-[#6E4B8B] uppercase tracking-widest">/catalog/{design.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-bold text-lavender bg-lavender/5 px-3 py-1.5 rounded-full border border-lavender/10 uppercase tracking-widest">
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
                                                <p className="text-xs font-bold text-gray-900">
                                                    ₹{getStartingPrice(design)}
                                                    <span className="text-[10px] text-[#6E4B8B] font-medium ml-1">Starting</span>
                                                </p>
                                                <p className="text-[10px] text-[#6E4B8B] font-bold uppercase tracking-wider">
                                                    {design.packages?.length || 0} Options
                                                </p>
                                            </div>
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
                                                    {design.isActive ? 'Live' : 'Hidden'}
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
                                <PackageIcon size={32} />
                            </div>
                            <p className="font-bold text-gray-900">No designs found</p>
                            <button onClick={() => openModal()} className="text-lavender font-bold hover:underline text-sm mt-1">Create your first design</button>
                        </div>
                    ) : (
                        paginatedDesigns.map(design => (
                            <div key={design._id} className="bg-gray-50/40 p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-100 overflow-hidden flex-shrink-0 shadow-sm">
                                        {design.images?.[0] ? (
                                            <img src={design.images[0]} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300"><Upload size={16} /></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-charcoal text-sm truncate">{design.name}</p>
                                        <p className="text-[10px] font-bold text-[#6E4B8B] uppercase tracking-widest truncate">/catalog/{design.slug}</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="text-[10px] font-bold text-lavender bg-lavender/5 px-2.5 py-1 rounded-full border border-lavender/10 uppercase tracking-widest">
                                                {design.sku}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-500 bg-white px-2.5 py-1 rounded-full border border-gray-100">
                                                {design.categoryId?.name || design.categoryId || 'General'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between border-t border-gray-100/60 pt-3">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-[#6E4B8B] font-bold uppercase tracking-wider">Starting Price</span>
                                        <span className="text-sm font-bold text-gray-900">
                                            ₹{getStartingPrice(design)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {design.isTrending && <span className="text-sm" title="Best Seller">🔥</span>}
                                        {design.isFeatured && <span className="text-sm" title="Trending">⭐</span>}
                                        {design.isNewArrival && <span className="text-sm" title="New Arrival">✨</span>}
                                        <div className={cn(
                                            "px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border",
                                            design.isActive ? "text-green-600 bg-green-50 border-green-100" : "text-[#6E4B8B] bg-gray-50 border-gray-100"
                                        )}>
                                            {design.isActive ? 'Live' : 'Hidden'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 border-t border-gray-100/60 pt-3">
                                    <button 
                                        type="button"
                                        onClick={() => openModal(design)} 
                                        className="flex-1 py-3 bg-lavender/10 hover:bg-lavender/25 text-lavender rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all border border-lavender/15"
                                    >
                                        <Edit2 size={14} /> Edit
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => deleteDesign(design._id)} 
                                        className="p-3 bg-red-50 text-red-400 hover:text-red-500 hover:bg-red-100 rounded-2xl transition-all border border-red-100 hover:border-red-200"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 p-8 border-t border-gray-50">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="w-12 h-12 rounded-2xl border border-gray-100 bg-white flex items-center justify-center text-[#6E4B8B] hover:text-lavender transition-all disabled:opacity-30"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm font-bold text-[#6E4B8B] mx-4">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="w-12 h-12 rounded-2xl border border-gray-100 bg-white flex items-center justify-center text-[#6E4B8B] hover:text-lavender transition-all disabled:opacity-30"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Design Form Modal — Refactored to Centered Modal for better UX */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[110] flex overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="absolute inset-0 bg-charcoal/40 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, x: '100%' }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative ml-auto w-full max-w-2xl bg-gray-50 h-full shadow-2xl flex flex-col overflow-hidden"
                        >
                            <div className="p-6 md:p-8 bg-white border-b border-gray-100 flex flex-col shrink-0">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-lavender/10 text-lavender flex items-center justify-center">
                                            <PackageIcon size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl md:text-2xl font-normal text-charcoal">{editingDesign ? 'Update Design' : 'New Collection'}</h2>
                                            <p className="text-[10px] md:text-xs text-[#6E4B8B] font-bold uppercase tracking-widest mt-1">Configure your artisanal invitation</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={closeModal} className="w-10 h-10 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors"><X size={20} /></button>
                                </div>
                                
                                {/* Tabs */}
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {['Details', 'Pricing', 'Media'].map((tab) => (
                                        <button
                                            key={tab}
                                            type="button"
                                            onClick={() => setActiveFormTab(tab as any)}
                                            className={cn(
                                                "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                                                activeFormTab === tab 
                                                ? "bg-lavender text-white shadow-md" 
                                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                            )}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <form id="design-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-8">
                                <div className="max-w-xl mx-auto space-y-8">
                                    {/* DETAILS TAB */}
                                    {activeFormTab === 'Details' && (
                                        <div className="space-y-8 animate-in fade-in duration-500">
                                            <section className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-5">
                                                <div className="text-[10px] font-bold text-[#6E4B8B] uppercase tracking-widest flex items-center gap-2">
                                                    <Info size={14} /> Basic Information
                                                </div>
                                                
                                                <div className="space-y-5">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-charcoal uppercase tracking-widest mb-1.5 block">Design Name</label>
                                                        <input
                                                            type="text" required value={formData.name}
                                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                            className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-lavender outline-none transition-all font-bold text-charcoal"
                                                            placeholder="Vibrant Marigold..."
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-5">
                                                        <div>
                                                            <label className="text-[10px] font-bold text-charcoal uppercase tracking-widest mb-1.5 block">SKU Code</label>
                                                            <input
                                                                type="text" required value={formData.sku}
                                                                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                                                className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-lavender outline-none transition-all font-bold text-charcoal"
                                                                placeholder="ZB_1001"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-bold text-charcoal uppercase tracking-widest mb-1.5 block">Slug URL</label>
                                                            <input
                                                                type="text" required value={formData.slug}
                                                                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                                                className="w-full px-5 py-3.5 bg-gray-100/50 border border-transparent rounded-2xl text-[#6E4B8B] font-bold outline-none cursor-not-allowed"
                                                                readOnly
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] font-bold text-charcoal uppercase tracking-widest mb-1.5 block">Category</label>
                                                        <select
                                                            required value={formData.categoryId}
                                                            onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                                            className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-lavender outline-none transition-all font-bold text-charcoal appearance-none"
                                                        >
                                                            {nonDigitalCategories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="text-[10px] font-bold text-charcoal uppercase tracking-widest mb-1.5 block">Description</label>
                                                        <textarea
                                                            value={formData.description}
                                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                            className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-lavender outline-none transition-all font-medium text-gray-600 min-h-[120px] resize-none"
                                                            placeholder="Describe the elegance and craft..."
                                                        />
                                                    </div>
                                                </div>
                                            </section>

                                            <section className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-[10px] font-bold text-[#6E4B8B] uppercase tracking-widest flex items-center gap-2">
                                                        <Settings size={14} /> Inventory & Status
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
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

                                                <div className="pt-4 border-t border-gray-50 space-y-4">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-charcoal uppercase tracking-widest mb-2 block">Visibility</label>
                                                        <button type="button" onClick={() => setFormData({ ...formData, isActive: !formData.isActive })} className={cn("w-full px-5 py-4 rounded-[1.25rem] border-2 flex items-center justify-between transition-all", formData.isActive ? "border-green-100 bg-green-50/50 text-green-700" : "border-gray-100 bg-gray-50 text-[#6E4B8B]")}>
                                                            <span className="font-bold text-xs">{formData.isActive ? 'Active on Catalog' : 'Save as Draft'}</span>
                                                            <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", formData.isActive ? "bg-green-500" : "bg-gray-300")} />
                                                        </button>
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="text-[10px] font-bold text-charcoal uppercase tracking-widest mb-1.5 block">Minimum Order Quantity</label>
                                                        <input
                                                            type="number" required value={formData.minQuantity === 0 ? '' : formData.minQuantity}
                                                            onChange={e => setFormData({ ...formData, minQuantity: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                                                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                                            className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-lavender outline-none transition-all font-bold text-charcoal"
                                                        />
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                    )}

                                    {/* PRICING TAB */}
                                    {activeFormTab === 'Pricing' && (
                                        <div className="space-y-8 animate-in fade-in duration-500">
                                            <section className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-[10px] font-bold text-[#6E4B8B] uppercase tracking-widest flex items-center gap-2">
                                                        <PackageIcon size={14} /> Packages & Pricing
                                                    </div>
                                                    <button type="button" onClick={addPackage} className="text-[10px] font-bold text-lavender hover:text-charcoal uppercase tracking-widest flex items-center gap-1 transition-colors">
                                                        <Plus size={12} /> Add Package
                                                    </button>
                                                </div>
                                                
                                                <div className="space-y-6">
                                                    {formData.packages.map((pkg, pkgIndex) => (
                                                        <div key={pkgIndex} className="p-5 bg-gray-50/50 rounded-[1.5rem] border border-gray-100 space-y-5 relative group">
                                                            {formData.packages.length > 1 && (
                                                                <button type="button" onClick={() => removePackage(pkgIndex)} className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-50 hover:scale-110 shadow-sm transition-all z-10"><Trash2 size={14} /></button>
                                                            )}
                                                            <div>
                                                                <label className="text-[9px] font-bold text-[#6E4B8B] uppercase tracking-widest mb-1.5 block">Package Title</label>
                                                                <input type="text" required value={pkg.title} onChange={e => { const newPkgs = [...formData.packages]; newPkgs[pkgIndex].title = e.target.value; setFormData({ ...formData, packages: newPkgs }); }} className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl focus:border-lavender outline-none font-bold text-sm text-charcoal" placeholder="e.g. Premium Board" />
                                                            </div>

                                                            <div>
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <label className="text-[9px] font-bold text-[#6E4B8B] uppercase tracking-widest">What's Included</label>
                                                                    <button type="button" onClick={() => { const newPkgs = [...formData.packages]; newPkgs[pkgIndex].inclusions.push(''); setFormData({ ...formData, packages: newPkgs }); }} className="text-[9px] font-bold text-lavender hover:text-charcoal uppercase tracking-widest flex items-center gap-1"><Plus size={10} /> Add</button>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    {pkg.inclusions.map((inc: string, incIndex: number) => (
                                                                        <div key={incIndex} className="flex gap-2">
                                                                            <input type="text" required value={inc} onChange={e => { const newPkgs = [...formData.packages]; newPkgs[pkgIndex].inclusions[incIndex] = e.target.value; setFormData({ ...formData, packages: newPkgs }); }} className="flex-1 px-4 py-2.5 bg-white border border-gray-100 rounded-xl focus:border-lavender outline-none text-xs text-charcoal" placeholder="e.g. Single Side Print + Cover Print" />
                                                                            <button type="button" onClick={() => { const newPkgs = [...formData.packages]; newPkgs[pkgIndex].inclusions.splice(incIndex, 1); setFormData({ ...formData, packages: newPkgs }); }} className="w-10 flex items-center justify-center text-red-300 hover:text-red-500 bg-white border border-gray-100 rounded-xl"><X size={14} /></button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div className="pt-2">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <label className="text-[9px] font-bold text-[#6E4B8B] uppercase tracking-widest">Price Tiers</label>
                                                                    <button type="button" onClick={() => addPriceTier(pkgIndex)} className="text-[9px] font-bold text-lavender hover:text-charcoal uppercase tracking-widest flex items-center gap-1"><Plus size={10} /> Add Tier</button>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div className="grid grid-cols-12 gap-2 px-1">
                                                                        <div className="col-span-3 text-[8px] font-bold text-gray-400 uppercase tracking-widest">Min Qty</div>
                                                                        <div className="col-span-3 text-[8px] font-bold text-gray-400 uppercase tracking-widest">Max Qty</div>
                                                                        <div className="col-span-1"></div>
                                                                        <div className="col-span-4 text-[8px] font-bold text-gray-400 uppercase tracking-widest">Price / Card</div>
                                                                    </div>
                                                                    {pkg.priceTiers.map((tier: any, tierIndex: number) => (
                                                                        <div key={tierIndex} className="grid grid-cols-12 gap-2 items-center">
                                                                            <input type="number" required value={tier.minQty === 0 ? '' : tier.minQty} onChange={e => { const newPkgs = [...formData.packages]; newPkgs[pkgIndex].priceTiers[tierIndex].minQty = e.target.value === '' ? 0 : parseInt(e.target.value); setFormData({ ...formData, packages: newPkgs }); }} onWheel={(e) => (e.target as HTMLInputElement).blur()} className="col-span-3 px-3 py-2.5 bg-white border border-gray-100 rounded-xl outline-none font-bold text-xs text-center focus:border-lavender" placeholder="Min" />
                                                                            <input type="number" value={tier.maxQty === null ? '' : tier.maxQty} onChange={e => { const newPkgs = [...formData.packages]; newPkgs[pkgIndex].priceTiers[tierIndex].maxQty = e.target.value === '' ? null : parseInt(e.target.value); setFormData({ ...formData, packages: newPkgs }); }} onWheel={(e) => (e.target as HTMLInputElement).blur()} className="col-span-3 px-3 py-2.5 bg-white border border-gray-100 rounded-xl outline-none font-bold text-xs text-center focus:border-lavender" placeholder="Max" />
                                                                            <div className="col-span-1 flex justify-center text-gray-300"><ArrowRight size={12} /></div>
                                                                            <div className="col-span-4 relative">
                                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₹</span>
                                                                                <input type="number" required value={tier.pricePerCard === 0 ? '' : tier.pricePerCard} onChange={e => { const newPkgs = [...formData.packages]; newPkgs[pkgIndex].priceTiers[tierIndex].pricePerCard = e.target.value === '' ? 0 : parseInt(e.target.value); setFormData({ ...formData, packages: newPkgs }); }} onWheel={(e) => (e.target as HTMLInputElement).blur()} className="w-full pl-7 pr-3 py-2.5 bg-white border border-gray-100 rounded-xl outline-none font-bold text-xs focus:border-lavender" placeholder="Price" />
                                                                            </div>
                                                                            <div className="col-span-1 flex justify-center">
                                                                                <button type="button" onClick={() => removePriceTier(pkgIndex, tierIndex)} className="text-red-300 hover:text-red-500"><Trash2 size={14} /></button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>

                                            <section className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-[10px] font-bold text-[#6E4B8B] uppercase tracking-widest flex items-center gap-2">
                                                        <Plus size={14} /> Optional Add-ons
                                                    </div>
                                                    <button type="button" onClick={addAddOn} className="text-[10px] font-bold text-lavender hover:text-charcoal uppercase tracking-widest flex items-center gap-1 transition-colors">
                                                        <Plus size={12} /> Add Custom
                                                    </button>
                                                </div>
                                                
                                                {formData.addOns.length === 0 ? (
                                                    <p className="text-[10px] text-[#6E4B8B] italic">No add-ons configured.</p>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {formData.addOns.map((addon, index) => (
                                                            <div key={index} className="flex flex-col sm:flex-row gap-3 bg-gray-50 p-4 rounded-[1.25rem] border border-gray-100 group/addon">
                                                                <div className="flex-1 space-y-3">
                                                                    <input type="text" required value={addon.label || ''} onChange={e => { const newAddOns = [...formData.addOns]; newAddOns[index].label = e.target.value; setFormData({ ...formData, addOns: newAddOns }); }} className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl outline-none text-xs font-bold focus:border-lavender" placeholder="Add-on Name (e.g. Venue Map)" />
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="relative w-32">
                                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₹</span>
                                                                            <input type="number" required value={addon.pricePerCard === 0 ? '' : addon.pricePerCard} onChange={e => { const newAddOns = [...formData.addOns]; newAddOns[index].pricePerCard = e.target.value === '' ? 0 : parseInt(e.target.value); setFormData({ ...formData, addOns: newAddOns }); }} onWheel={(e) => (e.target as HTMLInputElement).blur()} className="w-full pl-7 pr-3 py-2 bg-white border border-gray-100 rounded-xl outline-none font-bold text-xs focus:border-lavender" placeholder="Price" />
                                                                        </div>
                                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                                            <input type="checkbox" checked={addon.isFixedPrice} onChange={e => { const newAddOns = [...formData.addOns]; newAddOns[index].isFixedPrice = e.target.checked; setFormData({ ...formData, addOns: newAddOns }); }} className="w-3.5 h-3.5 text-lavender rounded border-gray-300 focus:ring-lavender" />
                                                                            <span className="text-[10px] font-bold text-[#6E4B8B] uppercase tracking-widest">One Time (Fixed)</span>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                <button type="button" onClick={() => removeAddOn(index)} className="self-start sm:self-center p-2 text-red-300 hover:text-red-500 hover:bg-white rounded-xl transition-all"><Trash2 size={16} /></button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </section>
                                        </div>
                                    )}

                                    {/* MEDIA TAB */}
                                    {activeFormTab === 'Media' && (
                                        <div className="space-y-8 animate-in fade-in duration-500">
                                            <section className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                                                <div className="text-[10px] font-bold text-[#6E4B8B] uppercase tracking-widest flex items-center gap-2">
                                                    <Upload size={14} /> Showcase Images
                                                </div>
                                                <SortableImageGrid 
                                                    images={formData.images} 
                                                    onChange={(images) => setFormData({ ...formData, images })} 
                                                    onUpload={(e) => handleMediaUpload(e, 'image')} 
                                                />
                                            </section>
                                        </div>
                                    )}
                                </div>
                            </form>

                            <div className="p-6 md:p-8 bg-white border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center shrink-0 gap-4">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <div className="w-5 h-5 rounded-full bg-green-50 text-green-500 flex items-center justify-center"><Check size={12} /></div>
                                    Auto-saved as draft
                                </div>
                                <div className="flex w-full sm:w-auto items-center gap-4">
                                    <button type="button" onClick={closeModal} className="flex-1 sm:flex-none px-8 py-4 font-bold text-[10px] uppercase tracking-widest text-[#6E4B8B] hover:text-charcoal transition-colors">Discard</button>
                                    <button 
                                        type="submit" 
                                        form="design-form" 
                                        disabled={isSubmitting}
                                        className="flex-1 sm:flex-none px-10 py-4 bg-charcoal hover:bg-black text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-charcoal/20 transition-all flex items-center justify-center gap-2"
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
