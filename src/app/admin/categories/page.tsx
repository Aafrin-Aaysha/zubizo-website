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
    LayoutGrid,
    Hash,
    Layers,
    ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [displayOrder, setDisplayOrder] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            toast.error('Failed to load categories');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const url = editingCategory
            ? `/api/categories/${editingCategory._id}`
            : '/api/categories';
        const method = editingCategory ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, displayOrder, isActive }),
            });

            if (res.ok) {
                toast.success(editingCategory ? 'Category updated' : 'Category created');
                router.refresh();
                fetchCategories();
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

    const deleteCategory = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category? All designs under it will remain but become uncategorized.')) return;

        try {
            const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Category deleted');
                router.refresh();
                fetchCategories();
            }
        } catch (error) {
            toast.error('Failed to delete category');
        }
    };

    const openModal = (category: any = null) => {
        if (category) {
            setEditingCategory(category);
            setName(category.name);
            setDescription(category.description || '');
            setDisplayOrder(category.displayOrder);
            setIsActive(category.isActive);
        } else {
            setEditingCategory(null);
            setName('');
            setDescription('');
            setDisplayOrder(categories.length);
            setIsActive(true);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    return (
        <div className="space-y-10 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-charcoal tracking-tight">Category Collections</h1>
                    <p className="text-gray-500 mt-1 font-medium">Organize your designs into beautiful thematic collections.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-lavender hover:bg-[#9a6ab5] text-white px-8 py-3.5 rounded-2xl font-black shadow-xl shadow-lavender/20 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                >
                    <Plus size={20} />
                    New Collection
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left: Stats & Search */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-lavender transition-colors" size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search collections..."
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-lavender/10 focus:border-lavender transition-all font-bold"
                            />
                        </div>
                        <div className="pt-4 space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Categories</span>
                                <span className="text-xl font-black text-charcoal">{categories.length}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-lavender/10">
                                <span className="text-xs font-black text-lavender uppercase tracking-widest">Active</span>
                                <span className="text-xl font-black text-lavender">{categories.filter(c => c.isActive).length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Category List */}
                <div className="lg:col-span-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AnimatePresence mode="popLayout">
                            {isLoading ? (
                                [...Array(4)].map((_, i) => (
                                    <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-100 animate-pulse h-48" />
                                ))
                            ) : filteredCategories.map((category) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={category._id}
                                    className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-lavender/5 transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openModal(category)} className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-lavender transition-colors border border-gray-100"><Edit2 size={16} /></button>
                                        <button onClick={() => deleteCategory(category._id)} className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors border border-gray-100"><Trash2 size={16} /></button>
                                    </div>

                                    <div className="flex flex-col h-full">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-lavender/5 text-lavender flex items-center justify-center font-black text-xs border border-lavender/10">
                                                {category.displayOrder}
                                            </div>
                                            <div className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                                category.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"
                                            )}>
                                                {category.isActive ? 'Active' : 'Hidden'}
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-black text-charcoal mb-2">{category.name}</h3>
                                        <p className="text-sm text-gray-400 font-medium mb-6 line-clamp-2">/catalog/{category.slug}</p>

                                        <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-50">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-gray-50 rounded-lg text-gray-400 group-hover:text-lavender transition-colors"><Layers size={14} /></div>
                                                <span className="text-xs font-black text-gray-900 group-hover:text-lavender transition-colors uppercase tracking-widest">{category.designCount || 0} Designs</span>
                                            </div>
                                            <ChevronRight size={18} className="text-gray-300 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={closeModal} className="fixed inset-0 bg-charcoal/40 backdrop-blur-md z-[100]"
                        />
                        <motion.div
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[110] shadow-2xl flex flex-col"
                        >
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-charcoal">{editingCategory ? 'Update Collection' : 'New Collection'}</h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Group your works of art</p>
                                </div>
                                <button onClick={closeModal} className="w-10 h-10 hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-8">
                                <div>
                                    <label className="text-[10px] font-black text-charcoal uppercase tracking-widest mb-1.5 block">Collection Name</label>
                                    <input
                                        type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                        className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-lavender outline-none transition-all font-bold text-charcoal"
                                        placeholder="e.g., Traditional Nikah"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-charcoal uppercase tracking-widest mb-1.5 block">Description</label>
                                    <textarea
                                        value={description} onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-lavender outline-none transition-all font-medium text-gray-600 h-24 resize-none"
                                        placeholder="Briefly describe this collection..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-charcoal uppercase tracking-widest mb-1.5 block">Display Order</label>
                                        <input
                                            type="number"
                                            required
                                            value={displayOrder === 0 ? '' : displayOrder}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setDisplayOrder(val === '' ? 0 : parseInt(val) || 0);
                                            }}
                                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                            className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-lavender outline-none transition-all font-black text-charcoal"
                                        />
                                    </div>
                                    <div className="flex flex-col justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setIsActive(!isActive)}
                                            className={cn(
                                                "w-full h-[3.5rem] rounded-2xl border transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest",
                                                isActive ? "bg-green-50 text-green-600 border-green-100" : "bg-gray-50 text-gray-400 border-gray-100"
                                            )}
                                        >
                                            <div className={cn("w-2 h-2 rounded-full", isActive ? "bg-green-500" : "bg-gray-300")} />
                                            {isActive ? 'Visible' : 'Hidden'}
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-10">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-charcoal hover:bg-black text-white font-black py-5 rounded-2xl shadow-xl shadow-charcoal/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-70"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (editingCategory ? 'Update Collection' : 'Publish Collection')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
