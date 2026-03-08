'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus,
    GripVertical,
    Eye,
    EyeOff,
    Edit2,
    Trash2,
    Save,
    RefreshCcw,
    Layout,
    Palette,
    X,
    ChevronRight,
    Settings2,
    Image as ImageIcon,
    Upload,
    ArrowRight
} from 'lucide-react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function HomepageBuilder() {
    const [sections, setSections] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingSection, setEditingSection] = useState<any>(null);

    useEffect(() => {
        fetchSections();
    }, []);

    const fetchSections = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/homepage/sections');
            const data = await res.json();
            setSections(data);
        } catch (error) {
            toast.error('Failed to load sections');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReorder = (newOrder: any[]) => {
        setSections(newOrder);
    };

    const saveOrder = async () => {
        setIsSaving(true);
        try {
            const updates = sections.map((s, idx) => ({ _id: s._id, order: idx }));
            const res = await fetch('/api/homepage/sections', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (res.ok) {
                toast.success('Layout saved successfully');
            } else {
                throw new Error();
            }
        } catch (error) {
            toast.error('Failed to save layout');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleVisibility = async (id: string, current: boolean) => {
        try {
            const res = await fetch(`/api/homepage/sections/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isVisible: !current })
            });
            if (res.ok) {
                setSections(sections.map(s => s._id === id ? { ...s, isVisible: !current } : s));
                toast.success(`Section ${!current ? 'enabled' : 'disabled'}`);
            }
        } catch (error) {
            toast.error('Failed to update visibility');
        }
    };

    const deleteSection = async (id: string) => {
        if (!confirm('Are you sure you want to delete this section?')) return;
        try {
            const res = await fetch(`/api/homepage/sections/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setSections(sections.filter(s => s._id !== id));
                toast.success('Section deleted');
            }
        } catch (error) {
            toast.error('Failed to delete section');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCcw className="w-8 h-8 text-[#ae7fcb] animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 font-serif">Homepage Builder</h1>
                    <p className="text-gray-500">Design and organize your website's home page sections.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={saveOrder}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#ae7fcb] text-white rounded-xl font-bold shadow-lg shadow-[#ae7fcb]/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                    >
                        <Save size={18} />
                        {isSaving ? 'Saving...' : 'Save Order'}
                    </button>
                </div>
            </div>

            <Reorder.Group
                axis="y"
                values={sections}
                onReorder={handleReorder}
                className="space-y-4"
            >
                {sections.map((section) => (
                    <SectionItem
                        key={section._id}
                        section={section}
                        onEdit={() => setEditingSection(section)}
                        onToggle={() => toggleVisibility(section._id, section.isVisible)}
                        onDelete={() => deleteSection(section._id)}
                    />
                ))}
            </Reorder.Group>

            {/* Editing Side Panel / Modal */}
            <AnimatePresence>
                {editingSection && (
                    <EditPanel
                        section={editingSection}
                        onClose={() => setEditingSection(null)}
                        onSave={async (updated: any) => {
                            try {
                                const res = await fetch(`/api/homepage/sections/${updated._id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(updated)
                                });
                                if (res.ok) {
                                    setSections(sections.map(s => s._id === updated._id ? updated : s));
                                    setEditingSection(null);
                                    toast.success('Section updated directly');
                                } else {
                                    toast.error('Failed to update section to database');
                                }
                            } catch (err) {
                                toast.error('Error saving section');
                            }
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function SectionItem({ section, onEdit, onToggle, onDelete }: any) {
    return (
        <Reorder.Item
            value={section}
            className={`bg-white rounded-2xl border ${section.isVisible ? 'border-gray-200 shadow-sm' : 'border-dashed border-gray-300 opacity-60'} overflow-hidden transition-all`}
        >
            <div className="flex items-center p-4 gap-4">
                <div className="cursor-grab active:cursor-grabbing text-gray-400 p-2 hover:bg-gray-50 rounded-lg">
                    <GripVertical size={20} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-[#ae7fcb]/10 text-[#ae7fcb] text-[10px] font-black uppercase tracking-wider rounded">
                            {section.sectionType}
                        </span>
                        {!section.isVisible && (
                            <span className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                <EyeOff size={12} />
                                Hidden
                            </span>
                        )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 truncate font-serif">{section.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onToggle}
                        className={`p-2 rounded-xl transition-all ${section.isVisible ? 'text-gray-400 hover:bg-gray-100' : 'text-[#ae7fcb] hover:bg-[#ae7fcb]/10'}`}
                        title={section.isVisible ? 'Disable Section' : 'Enable Section'}
                    >
                        {section.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button
                        onClick={onEdit}
                        className="p-2 text-gray-400 hover:text-[#ae7fcb] hover:bg-[#ae7fcb]/10 rounded-xl transition-all"
                        title="Edit Section"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Section"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </Reorder.Item>
    );
}

// Specialized Editor for Hero Section
const HeroEditor = ({ data, onChange }: { data: any, onChange: (newData: any) => void }) => {
    const slides = data?.slides || [];

    const updateSlide = (idx: number, field: string, value: any) => {
        const newSlides = [...slides];
        newSlides[idx] = { ...newSlides[idx], [field]: value };
        onChange({ ...data, slides: newSlides });
    };

    const addSlide = () => {
        onChange({ ...data, slides: [...slides, { image: '', tag: '', title: '', subtitle: '' }] });
    };

    const removeSlide = (idx: number) => {
        const newSlides = slides.filter((_: any, i: number) => i !== idx);
        onChange({ ...data, slides: newSlides });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Carousel Slides</h4>
                <button
                    onClick={addSlide}
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ae7fcb]/10 text-[#ae7fcb] hover:bg-[#ae7fcb] hover:text-white rounded-lg text-xs font-bold transition-all"
                >
                    <Plus size={14} /> Add Slide
                </button>
            </div>

            <div className="space-y-4">
                {slides.map((slide: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                        <button
                            onClick={() => removeSlide(idx)}
                            type="button"
                            className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                            <X size={14} />
                        </button>
                        <span className="text-[10px] font-black text-gray-400 mb-3 block uppercase tracking-widest">Slide {idx + 1}</span>

                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Image URL or Upload</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={slide.image || ''}
                                        onChange={(e) => updateSlide(idx, 'image', e.target.value)}
                                        className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#ae7fcb] outline-none"
                                        placeholder="/zubizo_invites/1.jpeg"
                                    />
                                    <label className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:border-[#ae7fcb] cursor-pointer transition-colors text-xs font-bold flex items-center gap-1">
                                        <Upload size={12} />
                                        <input type="file" className="hidden" accept="image/*" onChange={async e => {
                                            const file = e.target.files?.[0]; if (!file) return;
                                            const formData = new FormData(); formData.append('file', file);
                                            try {
                                                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                                                const result = await res.json();
                                                if (result.url) updateSlide(idx, 'image', result.url);
                                            } catch (err) { toast.error('Upload failed'); }
                                        }} />
                                    </label>
                                </div>
                                {slide.image && <img src={slide.image} alt="" className="mt-2 h-12 w-full object-cover rounded-lg border border-gray-100" />}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Tag Line</label>
                                    <input
                                        type="text"
                                        value={slide.tag || ''}
                                        onChange={(e) => updateSlide(idx, 'tag', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#ae7fcb] outline-none"
                                        placeholder="e.g. Luxury Collection"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Title</label>
                                    <input
                                        type="text"
                                        value={slide.title || ''}
                                        onChange={(e) => updateSlide(idx, 'title', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#ae7fcb] outline-none"
                                        placeholder="Carousel Title"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Subtitle</label>
                                <textarea
                                    rows={2}
                                    value={slide.subtitle || ''}
                                    onChange={(e) => updateSlide(idx, 'subtitle', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#ae7fcb] outline-none resize-none"
                                    placeholder="Detailed description..."
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const defaultSlabs = [
    { title: "Under ₹30", description: "Beautiful and affordable handcrafted invitations.", startingPrice: "Budget-Friendly", href: "/catalog?maxPrice=30", backgroundColor: "#F6F3FB" },
    { title: "Under ₹60", description: "Elegant options with premium finishes.", startingPrice: "Most Popular", href: "/catalog?maxPrice=60", backgroundColor: "#EFE9F8" },
    { title: "Under ₹90", description: "Luxurious designs with exquisite details.", startingPrice: "Premium Collection", href: "/catalog?maxPrice=90", backgroundColor: "#E9E0F6" },
    { title: "₹120+", description: "Bespoke couture and exclusive materials.", startingPrice: "Luxury Couture", href: "/catalog?minPrice=120", backgroundColor: "#E2D6F3" },
];

const PriceSlabEditor = ({ data, onChange }: { data: any, onChange: (newData: any) => void }) => {
    const slabs = (data?.slabs && data.slabs.length > 0) ? data.slabs : defaultSlabs;

    const updateSlab = (idx: number, field: string, value: any) => {
        const newSlabs = [...slabs];
        newSlabs[idx] = { ...newSlabs[idx], [field]: value };
        onChange({ ...data, slabs: newSlabs });
    };

    const addSlab = () => {
        onChange({ ...data, slabs: [...slabs, { title: '', startingPrice: '', description: '', href: '/catalog', backgroundColor: '#F6F3FB' }] });
    };

    const removeSlab = (idx: number) => {
        onChange({ ...data, slabs: slabs.filter((_: any, i: number) => i !== idx) });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Price Ranges</h4>
                <button
                    onClick={addSlab}
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ae7fcb]/10 text-[#ae7fcb] hover:bg-[#ae7fcb] hover:text-white rounded-lg text-xs font-bold transition-all"
                >
                    <Plus size={14} /> Add Range
                </button>
            </div>
            <div className="space-y-4">
                {slabs.map((slab: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3 relative group">
                        <button
                            onClick={() => removeSlab(idx)}
                            type="button"
                            className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                            <X size={14} />
                        </button>
                        <span className="text-[10px] font-black text-gray-400 block uppercase tracking-widest">Range {idx + 1}</span>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Title</label>
                                <input
                                    type="text"
                                    value={slab.title || ''}
                                    onChange={(e) => updateSlab(idx, 'title', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#ae7fcb] outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Label / Starting Price</label>
                                <input
                                    type="text"
                                    value={slab.startingPrice || ''}
                                    onChange={(e) => updateSlab(idx, 'startingPrice', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#ae7fcb] outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Link URL</label>
                                <input
                                    type="text"
                                    value={slab.href || ''}
                                    onChange={(e) => updateSlab(idx, 'href', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#ae7fcb] outline-none"
                                    placeholder="/catalog?maxPrice=30"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Card BG Color</label>
                                <input
                                    type="text"
                                    value={slab.backgroundColor || ''}
                                    onChange={(e) => updateSlab(idx, 'backgroundColor', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#ae7fcb] outline-none font-mono text-[11px]"
                                    placeholder="#F6F3FB"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Description</label>
                            <input
                                type="text"
                                value={slab.description || ''}
                                onChange={(e) => updateSlab(idx, 'description', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#ae7fcb] outline-none"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Specialized Editor for Our Story
const StoryEditor = ({ data, onChange }: { data: any, onChange: (newData: any) => void }) => {
    const highlights = data?.highlights || [];
    const paragraphs = data?.paragraphs || [];

    const updateHighlight = (idx: number, field: string, value: any) => {
        const newHighlights = [...highlights];
        newHighlights[idx] = { ...newHighlights[idx], [field]: value };
        onChange({ ...data, highlights: newHighlights });
    };

    const addHighlight = () => {
        onChange({ ...data, highlights: [...highlights, { title: '', description: '', icon: 'Heart' }] });
    };

    const removeHighlight = (idx: number) => {
        const newHighlights = highlights.filter((_: any, i: number) => i !== idx);
        onChange({ ...data, highlights: newHighlights });
    };

    const updateParagraph = (idx: number, text: string) => {
        const newParagraphs = [...paragraphs];
        newParagraphs[idx] = { ...newParagraphs[idx], text };
        onChange({ ...data, paragraphs: newParagraphs });
    };

    const addParagraph = () => {
        onChange({ ...data, paragraphs: [...paragraphs, { text: '', isHtml: true }] });
    };

    const removeParagraph = (idx: number) => {
        const newParagraphs = paragraphs.filter((_: any, i: number) => i !== idx);
        onChange({ ...data, paragraphs: newParagraphs });
    };

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Story Content</h4>
                    <button
                        onClick={addParagraph}
                        type="button"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ae7fcb]/10 text-[#ae7fcb] hover:bg-[#ae7fcb] hover:text-white rounded-lg text-xs font-bold transition-all"
                    >
                        <Plus size={14} /> Add Paragraph
                    </button>
                </div>
                {paragraphs.map((p: any, idx: number) => (
                    <div key={idx} className="relative group">
                        <button
                            onClick={() => removeParagraph(idx)}
                            type="button"
                            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                        >
                            <X size={14} />
                        </button>
                        <textarea
                            rows={3}
                            value={p.text || ''}
                            onChange={(e) => updateParagraph(idx, e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:border-[#ae7fcb] outline-none"
                            placeholder="HTML content supported... (use <span class='font-bold text-lavender'> for accents)"
                        />
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Features / Highlights</h4>
                    <button
                        onClick={addHighlight}
                        type="button"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ae7fcb]/10 text-[#ae7fcb] hover:bg-[#ae7fcb] hover:text-white rounded-lg text-xs font-bold transition-all"
                    >
                        <Plus size={14} /> Add Feature
                    </button>
                </div>

                <div className="space-y-4">
                    {highlights.map((item: any, idx: number) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                            <button
                                onClick={() => removeHighlight(idx)}
                                type="button"
                                className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                                <X size={14} />
                            </button>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Title</label>
                                    <input
                                        type="text"
                                        value={item.title || ''}
                                        onChange={(e) => updateHighlight(idx, 'title', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#ae7fcb] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Icon Name (Lucide)</label>
                                    <input
                                        type="text"
                                        value={item.icon || ''}
                                        onChange={(e) => updateHighlight(idx, 'icon', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#ae7fcb] outline-none"
                                        placeholder="Heart, Star, etc."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Description</label>
                                <textarea
                                    rows={2}
                                    value={item.description || ''}
                                    onChange={(e) => updateHighlight(idx, 'description', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#ae7fcb] outline-none resize-none"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Specialized Editor for Trending / Instagram
const TrendingEditor = ({ data, onChange }: { data: any, onChange: (newData: any) => void }) => {
    return (
        <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Social Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Instagram URL</label>
                    <input
                        type="text"
                        value={data?.instagramUrl || ''}
                        onChange={(e) => onChange({ ...data, instagramUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#ae7fcb] outline-none"
                        placeholder="https://instagram.com/..."
                    />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Autoplay Speed (seconds)</label>
                    <input
                        type="number"
                        value={data?.autoplaySpeed || 25}
                        onChange={(e) => onChange({ ...data, autoplaySpeed: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#ae7fcb] outline-none"
                    />
                </div>
            </div>
        </div>
    );
};

// Specialized Editor for Artisan Process
const ArtisanProcessEditor = ({ data, onChange }: { data: any, onChange: (newData: any) => void }) => {
    const steps = data?.steps || [];

    const updateStep = (idx: number, field: string, value: any) => {
        const newSteps = [...steps];
        newSteps[idx] = { ...newSteps[idx], [field]: value };
        onChange({ ...data, steps: newSteps });
    };

    const addStep = () => {
        onChange({ ...data, steps: [...steps, { title: '', description: '', icon: 'Feather' }] });
    };

    const removeStep = (idx: number) => {
        const newSteps = steps.filter((_: any, i: number) => i !== idx);
        onChange({ ...data, steps: newSteps });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Process Steps</h4>
                <button
                    onClick={addStep}
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ae7fcb]/10 text-[#ae7fcb] hover:bg-[#ae7fcb] hover:text-white rounded-lg text-xs font-bold transition-all"
                >
                    <Plus size={14} /> Add Step
                </button>
            </div>
            <div className="space-y-4">
                {steps.map((step: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                        <button
                            onClick={() => removeStep(idx)}
                            type="button"
                            className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                            <X size={14} />
                        </button>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Title</label>
                                <input
                                    type="text"
                                    value={step.title || ''}
                                    onChange={(e) => updateStep(idx, 'title', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#ae7fcb] outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Icon Name (Lucide)</label>
                                <input
                                    type="text"
                                    value={step.icon || ''}
                                    onChange={(e) => updateStep(idx, 'icon', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#ae7fcb] outline-none"
                                    placeholder="Feather, Zap, etc."
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Description</label>
                            <textarea
                                rows={2}
                                value={step.description || ''}
                                onChange={(e) => updateStep(idx, 'description', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#ae7fcb] outline-none resize-none"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Specialized Editor for Featured Carousel
const FeaturedCarouselEditor = ({ data, onChange }: { data: any, onChange: (newData: any) => void }) => {
    const designIds = data?.designIds || [];

    return (
        <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Selection Settings</h4>
            <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Specific Design IDs (comma separated)</label>
                <input
                    type="text"
                    value={Array.isArray(designIds) ? designIds.join(', ') : ''}
                    onChange={(e) => {
                        const ids = e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
                        onChange({ ...data, designIds: ids });
                    }}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#ae7fcb] outline-none font-mono"
                    placeholder="65e... , 65f..."
                />
                <p className="text-[10px] text-gray-400 mt-1 italic">Leave empty to show latest 4 featured designs.</p>
            </div>
        </div>
    );
};

// Specialized Editor for Testimonials
const TestimonialEditor = ({ data, onChange }: { data: any, onChange: (newData: any) => void }) => {
    const testimonials = data?.testimonials || [];

    const updateTestimonial = (idx: number, field: string, value: any) => {
        const newTestimonials = [...testimonials];
        newTestimonials[idx] = { ...newTestimonials[idx], [field]: value };
        onChange({ ...data, testimonials: newTestimonials });
    };

    const addTestimonial = () => {
        onChange({ ...data, testimonials: [...testimonials, { name: '', location: '', review: '' }] });
    };

    const removeTestimonial = (idx: number) => {
        const newTestimonials = testimonials.filter((_: any, i: number) => i !== idx);
        onChange({ ...data, testimonials: newTestimonials });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Client Testimonials</h4>
                <button
                    onClick={addTestimonial}
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ae7fcb]/10 text-[#ae7fcb] hover:bg-[#ae7fcb] hover:text-white rounded-lg text-xs font-bold transition-all"
                >
                    <Plus size={14} /> Add Testimonial
                </button>
            </div>

            <div className="space-y-4">
                {testimonials.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                        <button
                            onClick={() => removeTestimonial(idx)}
                            type="button"
                            className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                            <X size={14} />
                        </button>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Client Name</label>
                                <input
                                    type="text"
                                    value={item.name || ''}
                                    onChange={(e) => updateTestimonial(idx, 'name', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#ae7fcb] outline-none"
                                    placeholder="e.g. Priya & Rahul"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Location</label>
                                <input
                                    type="text"
                                    value={item.location || ''}
                                    onChange={(e) => updateTestimonial(idx, 'location', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#ae7fcb] outline-none"
                                    placeholder="e.g. Mumbai"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Review Text</label>
                            <textarea
                                rows={3}
                                value={item.review || ''}
                                onChange={(e) => updateTestimonial(idx, 'review', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#ae7fcb] outline-none resize-none"
                                placeholder="Write the review here..."
                            />
                        </div>

                        {/* Profile Picture */}
                        <div className="mt-3">
                            <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block">Profile Photo (optional)</label>
                            <div className="flex items-center gap-3">
                                {/* Preview */}
                                <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center bg-gray-50 shrink-0">
                                    {item.avatarUrl ? (
                                        <img src={item.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xs font-black text-gray-300">{item.name?.charAt(0) || '?'}</span>
                                    )}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <input
                                        type="text"
                                        value={item.avatarUrl || ''}
                                        onChange={(e) => updateTestimonial(idx, 'avatarUrl', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:border-[#ae7fcb] outline-none"
                                        placeholder="Paste image URL or upload..."
                                    />
                                    <label className="flex items-center justify-center gap-2 w-full py-2 bg-[#ae7fcb]/10 text-[#ae7fcb] hover:bg-[#ae7fcb] hover:text-white rounded-xl text-xs font-bold cursor-pointer transition-all">
                                        <Upload size={12} />
                                        Upload Photo
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                const formDataUpload = new FormData();
                                                formDataUpload.append('file', file);
                                                try {
                                                    const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload });
                                                    const uploadResult = await res.json();
                                                    if (uploadResult.url) {
                                                        updateTestimonial(idx, 'avatarUrl', uploadResult.url);
                                                    }
                                                } catch {
                                                    toast.error('Upload failed');
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                                {item.avatarUrl && (
                                    <button
                                        type="button"
                                        onClick={() => updateTestimonial(idx, 'avatarUrl', '')}
                                        className="p-2 text-red-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                                        title="Remove photo"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

function EditPanel({ section, onClose, onSave }: any) {
    const [formData, setFormData] = useState({ ...section });
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'content' | 'appearance'>('content');

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/homepage/sections/${section._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                const updated = await res.json();
                onSave(updated);
                toast.success('Section updated');
            }
        } catch (error) {
            toast.error('Failed to update section');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-black text-[#ae7fcb] uppercase tracking-wider mb-1 block">
                            Editing Section
                        </span>
                        <h2 className="text-2xl font-bold text-gray-900 font-serif">{section.title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <X size={24} className="text-gray-400" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-6 border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('content')}
                        className={`px-4 py-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'content' ? 'border-[#ae7fcb] text-[#ae7fcb]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Layout size={16} />
                            Content
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('appearance')}
                        className={`px-4 py-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'appearance' ? 'border-[#ae7fcb] text-[#ae7fcb]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Palette size={16} />
                            Appearance
                        </div>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {activeTab === 'content' ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Section ID</label>
                                    <input
                                        type="text"
                                        value={formData.sectionId}
                                        disabled
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Section Type</label>
                                    <input
                                        type="text"
                                        value={formData.sectionType}
                                        disabled
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {formData?.sectionType !== 'hero' && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Headline / Title</label>
                                            <input
                                                type="text"
                                                value={formData.title || ''}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ae7fcb]/10 focus:border-[#ae7fcb] transition-all"
                                                placeholder="Main Headline"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Label / Subtitle</label>
                                            <input
                                                type="text"
                                                value={formData.subtitle || ''}
                                                onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ae7fcb]/10 focus:border-[#ae7fcb] transition-all"
                                                placeholder="Short Label"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Summary Description</label>
                                        <textarea
                                            rows={3}
                                            value={formData.description || ''}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ae7fcb]/10 focus:border-[#ae7fcb] transition-all resize-none"
                                            placeholder="Section description text..."
                                        />
                                    </div>
                                </>
                            )}

                            <div className="pt-4 border-t border-gray-100">
                                {/* Dynamic specialized editor components */}
                                {formData?.sectionType === 'hero' && (
                                    <div className="space-y-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Top Accent Label</label>
                                            <input
                                                type="text"
                                                value={formData.content?.label || ''}
                                                onChange={e => setFormData({ ...formData, content: { ...formData.content, label: e.target.value } })}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#ae7fcb]/10 focus:border-[#ae7fcb] transition-all"
                                                placeholder="Bespoke Invitation Atelier"
                                            />
                                        </div>
                                        <HeroEditor
                                            data={formData.content}
                                            onChange={(newContent) => setFormData({ ...formData, content: newContent })}
                                        />
                                    </div>
                                )}
                                {formData?.sectionType === 'shopByPrice' && (
                                    <PriceSlabEditor
                                        data={formData.content}
                                        onChange={(newContent) => setFormData({ ...formData, content: newContent })}
                                    />
                                )}
                                {formData?.sectionType === 'ourStory' && (
                                    <StoryEditor
                                        data={formData.content}
                                        onChange={(newContent) => setFormData({ ...formData, content: newContent })}
                                    />
                                )}
                                {formData?.sectionType === 'testimonials' && (
                                    <TestimonialEditor
                                        data={formData.content}
                                        onChange={(newContent) => setFormData({ ...formData, content: newContent })}
                                    />
                                )}
                                {formData?.sectionType === 'trending' && (
                                    <TrendingEditor
                                        data={formData.content}
                                        onChange={(newContent) => setFormData({ ...formData, content: newContent })}
                                    />
                                )}
                                {formData?.sectionType === 'craftProcess' && (
                                    <ArtisanProcessEditor
                                        data={formData.content}
                                        onChange={(newContent) => setFormData({ ...formData, content: newContent })}
                                    />
                                )}
                                {formData?.sectionType === 'featuredCollections' && (
                                    <FeaturedCarouselEditor
                                        data={formData.content}
                                        onChange={(newContent) => setFormData({ ...formData, content: newContent })}
                                    />
                                )}

                                {!['hero', 'shopByPrice', 'ourStory', 'testimonials', 'trending', 'craftProcess', 'featuredCollections', 'contact'].includes(formData?.sectionType) && (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">RAW CONTENT (JSON)</label>
                                        <textarea
                                            rows={8}
                                            value={JSON.stringify(formData?.content, null, 2)}
                                            onChange={e => {
                                                try {
                                                    const parsed = JSON.parse(e.target.value);
                                                    setFormData({ ...formData, content: parsed });
                                                } catch (err) { /* SILENT FAIL FOR RAW */ }
                                            }}
                                            className="w-full px-4 py-2.5 bg-gray-900 text-purple-300 font-mono text-[11px] border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ae7fcb]/10 transition-all"
                                            spellCheck={false}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Background Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={formData.styling?.backgroundColor || '#ffffff'}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                styling: { ...formData.styling, backgroundColor: e.target.value }
                                            })}
                                            className="w-12 h-12 rounded-lg cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.styling?.backgroundColor || '#ffffff'}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                styling: { ...formData.styling, backgroundColor: e.target.value }
                                            })}
                                            className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Accent / Icon Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={formData.styling?.accentColor || '#ae7fcb'}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                styling: { ...formData.styling, accentColor: e.target.value }
                                            })}
                                            className="w-12 h-12 rounded-lg cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.styling?.accentColor || '#ae7fcb'}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                styling: { ...formData.styling, accentColor: e.target.value }
                                            })}
                                            className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Section Padding</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 120px 0"
                                        value={formData.styling?.padding || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            styling: { ...formData.styling, padding: e.target.value }
                                        })}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Border Radius</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 24px"
                                        value={formData.styling?.borderRadius || ''}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            styling: { ...formData.styling, borderRadius: e.target.value }
                                        })}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Layout Variant</label>
                                <select
                                    value={formData.layoutType}
                                    onChange={(e) => setFormData({ ...formData, layoutType: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none"
                                >
                                    <option value="default">Default Layout</option>
                                    <option value="compact">Compact</option>
                                    <option value="full-width">Full Width</option>
                                    <option value="alternate">Alternating Side</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-all text-sm"
                    >
                        Discard Changes
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-[2] px-6 py-3 bg-[#ae7fcb] text-white rounded-xl font-bold shadow-lg shadow-[#ae7fcb]/20 hover:scale-[1.02] transition-all text-sm disabled:opacity-50"
                    >
                        {isSaving ? 'Updating...' : 'Update Section'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
