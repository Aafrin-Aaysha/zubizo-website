'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    Trash2,
    Loader2,
    FileText,
    Zap,
    CheckCircle2,
    XCircle,
    ChevronDown,
    ChevronUp,
    Edit3,
    Image as ImageIcon,
    ArrowLeft,
    Sparkles,
    Package as PackageIcon,
    Plus,
    X,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PriceTier {
    minQty: number;
    maxQty: number | null;
    pricePerCard: number;
}

interface ParsedPackage {
    title: string;
    inclusions: string[];
    priceTiers: PriceTier[];
}

interface ParsedDesign {
    sku: string;
    name: string;
    description: string;
    categoryId: string;
    minQuantity: number;
    packages: ParsedPackage[];
    images: string[];
    isActive: boolean;
    isTrending: boolean;
    isFeatured: boolean;
    demoUrl: string;
    // UI state
    _status: 'pending' | 'uploading' | 'importing' | 'success' | 'error';
    _error?: string;
    _collapsed: boolean;
    _localFiles: File[];
}

// ─── Parser ───────────────────────────────────────────────────────────────────

function parseDesignText(text: string, defaultCategoryId: string): ParsedDesign[] {
    // Split by --- separator for multiple designs, or just treat as one if no separator
    const designBlocks = text.includes('---') ? text.split(/\n---+\n/).filter(b => b.trim()) : [text];
    const designs: ParsedDesign[] = [];

    for (const block of designBlocks) {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length === 0) continue;

        const design: ParsedDesign = {
            sku: '',
            name: '',
            description: '',
            categoryId: defaultCategoryId,
            minQuantity: 50, // Default, will update if lower tier found
            packages: [],
            images: [],
            isActive: true,
            isTrending: false,
            isFeatured: false,
            demoUrl: '',
            _status: 'pending',
            _collapsed: false,
            _localFiles: [],
        };

        let currentPackage: ParsedPackage | null = null;
        let parsingPriceTiers = false;
        let lookingForName = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // 1. Parse Code / SKU
            const codeMatch = line.match(/^(?:Code|SKU)\s*[:：]?\s*(.+)/i);
            if (codeMatch) {
                design.sku = codeMatch[1].trim();
                lookingForName = true;
                continue;
            }

            // 2. Parse Name (If we just parsed code, the next non-empty line might be the name)
            if (lookingForName && !design.name && !line.match(/^(?:Code|Package|Included|Min|100\s*Cards|✨|🌿|📩|\(Including|Category|Description|Theme)/i)) {
                let cleanName = line.replace(/^\*+|\*+$/g, '').trim();
                const fallbackMatch = cleanName.match(/^(?:Name|Design Name|Invitation Name)\s*[:：]\s*(.+)/i);
                if (fallbackMatch) cleanName = fallbackMatch[1].trim();
                design.name = cleanName;
                lookingForName = false;
                continue;
            }

            // Explicit Name fallback
            const nameMatch = line.match(/^(?:Name|Design Name|Invitation Name)\s*[:：]\s*(.+)/i);
            if (nameMatch && !design.name) {
                design.name = nameMatch[1].trim();
                lookingForName = false;
                continue;
            }
            // Demo Link
            const demoMatch = line.match(/^(?:Demo|Live Demo|Website|Link)\s*[:：]?\s*(.+)/i);
            if (demoMatch) {
                design.demoUrl = demoMatch[1].trim();
                continue;
            }

            // 3. Skip noise lines like "(Including Printing)" or "(FIXED PRICE)"
            if (line.match(/^\(Including.*Print/i) || line.match(/^\(FIXED PRICE\)/i)) {
                continue;
            }

            // 4. Parse Package title / Start of new section
            const pkgMatch = line.match(/^(?:Package|📩\s*INVITATIONS INCLUDE)\s*[:：]?\s*(.+)?/i);
            if (pkgMatch) {
                if (currentPackage) {
                    design.packages.push(currentPackage);
                }
                currentPackage = {
                    title: pkgMatch[1] ? pkgMatch[1].trim() : 'Standard Package',
                    inclusions: [],
                    priceTiers: []
                };
                parsingPriceTiers = false;
                continue;
            }

            // 5. Detect major board types as new packages if no explicit package title exists
            const boardMatch = line.match(/^(?:🌿|✨)?\s*(MAT FINISHING|PREMIUM BOARDS|ACRYLIC|GLASS|VELLUM).*?-\s*(.*)/i) || 
                               line.match(/^(?:🌿|✨)\s*(.+)/i) ||
                               line.match(/^(MAT FINISHING|PREMIUM BOARDS).*?(?:\d+ GSM)/i);
            if (boardMatch) {
                if (currentPackage) {
                    if (currentPackage.priceTiers.length === 0) {
                        currentPackage.inclusions.push(line.replace(/^[🌿✨]\s*/, '').trim());
                        parsingPriceTiers = false;
                        continue;
                    }
                    design.packages.push(currentPackage);
                }
                
                currentPackage = {
                    title: 'Standard Package', // Default, will use this board as inclusion
                    inclusions: [line.replace(/^[🌿✨]\s*/, '').trim()],
                    priceTiers: []
                };
                
                // Intelligently name or prefix the package based on the board type
                const boardStr = line.toLowerCase();
                let suffix = '';
                if (boardStr.includes('premium') || boardStr.includes('linen')) {
                    suffix = ' (Premium/Linen)';
                } else if (boardStr.includes('mat finishing') || boardStr.includes('matt')) {
                    suffix = ' (Matte Board)';
                } else if (boardStr.includes('acrylic')) {
                    suffix = ' (Acrylic)';
                } else if (boardStr.includes('glass')) {
                    suffix = ' (Glass)';
                }

                if (suffix) {
                    if (currentPackage.title && currentPackage.title !== 'Standard Package') {
                        // Append to existing custom title
                        // Make sure we don't duplicate it
                        if (!currentPackage.title.includes(suffix.replace(/[()]/g, ''))) {
                             currentPackage.title += suffix;
                        }
                    } else {
                        // Replace generic title
                        const base = boardStr.includes('premium') ? 'Premium Package' :
                                     boardStr.includes('matt') ? 'Budget Friendly Package' :
                                     boardStr.includes('acrylic') ? 'Luxury Package' : 'Standard Package';
                        currentPackage.title = base + suffix;
                    }
                }

                parsingPriceTiers = false;
                continue;
            }

            // 6. Parse Inclusions explicitly
            const incMatch = line.match(/^(?:Included|Includes|What's Included)\s*[:：]?\s*(.+)/i);
            if (incMatch) {
                if (!currentPackage) {
                    currentPackage = { title: 'Standard Package', inclusions: [], priceTiers: [] };
                }
                currentPackage.inclusions.push(incMatch[1].trim());
                parsingPriceTiers = false;
                continue;
            }

            // Handle implicit inclusions
            if (currentPackage && !parsingPriceTiers && line.length > 3 && !line.match(/^\d/) && !line.match(/^(?:Code|Name|Category|Description|Theme|Package|Min)/i)) {
                 currentPackage.inclusions.push(line.trim());
                 continue;
            }

            // 7. Parse price tiers
            const singleQtyMatch = line.match(/^(\d+)\s*(?:Cards?|Pcs|Pieces)?\s*[-–—:]+\s*(?:₹?\s*)?(?:Rs\.?)?\s*(\d+(?:\.\d+)?)\s*(?:\/?\s*card)?/i);
            const rangeQtyMatch = line.match(/^(\d+)\s*[-–—to]+\s*(\d+)\s*(?:Cards?|Pcs)?\s*(?:➝|→|[-–—>:]+)\s*(?:₹?\s*)?(?:Rs\.?)?\s*(\d+(?:\.\d+)?)\s*(?:\/?\s*card)?/i);

            if (rangeQtyMatch) {
                if (!currentPackage) currentPackage = { title: 'Standard Package', inclusions: [], priceTiers: [] };
                currentPackage.priceTiers.push({
                    minQty: parseInt(rangeQtyMatch[1]),
                    maxQty: parseInt(rangeQtyMatch[2]),
                    pricePerCard: parseFloat(rangeQtyMatch[3])
                });
                parsingPriceTiers = true;
                continue;
            } else if (singleQtyMatch) {
                if (!currentPackage) currentPackage = { title: 'Standard Package', inclusions: [], priceTiers: [] };
                const qty = parseInt(singleQtyMatch[1]);
                const prevTier = currentPackage.priceTiers[currentPackage.priceTiers.length - 1];
                if (prevTier && !prevTier.maxQty && qty > prevTier.minQty) {
                    prevTier.maxQty = qty - 1;
                }
                currentPackage.priceTiers.push({
                    minQty: qty,
                    maxQty: null,
                    pricePerCard: parseFloat(singleQtyMatch[2])
                });
                parsingPriceTiers = true;
                continue;
            }

            // If we are looking for the name and find regular text, use it as part of description if name is already set
            if (design.name && !currentPackage && !parsingPriceTiers && line.length > 5) {
                // Ignore 'Category' explicitly
                const catMatch = line.match(/^(?:Category|Type)\s*[:：]\s*(.+)/i);
                if (catMatch) continue;

                let cleanDesc = line;
                const descMatch = cleanDesc.match(/^(?:Description|About|Details|Theme)\s*[:：]\s*(.+)/i);
                if (descMatch) cleanDesc = descMatch[1].trim();

                if (!design.description) design.description = cleanDesc;
                else design.description += '\n' + cleanDesc;
            }
        }

        // Push last package
        if (currentPackage) {
            design.packages.push(currentPackage);
        }

        // Update global minQuantity based on the lowest tier found
        let lowestMin = 999999;
        design.packages.forEach(p => {
            p.priceTiers.forEach(t => {
                if (t.minQty < lowestMin) lowestMin = t.minQty;
            });
        });
        if (lowestMin !== 999999) {
            design.minQuantity = lowestMin;
        }

        // Only add if we have at least a SKU, name, or packages
        if (design.sku || design.name || design.packages.length > 0) {
            // Auto-generate missing fields
            if (!design.name && design.sku) design.name = `Design ${design.sku}`;
            if (!design.sku && design.name) design.sku = design.name.replace(/\s+/g, '_').toUpperCase().slice(0, 10);
            
            // Clean up missing package titles
            design.packages.forEach((pkg, index) => {
                if (!pkg.title) pkg.title = `Package Option ${index + 1}`;
            });

            designs.push(design);
        }
    }

    return designs;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BulkImportPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [rawText, setRawText] = useState('');
    const [parsedDesigns, setParsedDesigns] = useState<ParsedDesign[]>([]);
    const [isParsed, setIsParsed] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState({ done: 0, total: 0 });
    const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            setCategories(Array.isArray(data) ? data : []);
        } catch {
            toast.error('Failed to load categories');
        } finally {
            setIsLoading(false);
        }
    };

    // Resolve category name to ID
    const resolveCategoryId = (nameOrId: string): string => {
        // Already an ObjectId?
        if (/^[a-f\d]{24}$/i.test(nameOrId)) return nameOrId;
        // Try matching by name (case-insensitive)
        const match = categories.find(c =>
            c.name.toLowerCase().includes(nameOrId.toLowerCase()) ||
            nameOrId.toLowerCase().includes(c.name.toLowerCase())
        );
        return match?._id || categories[0]?._id || '';
    };

    const handleParse = () => {
        if (!rawText.trim()) {
            toast.error('Please paste some design data first');
            return;
        }
        const defaultCatId = categories[0]?._id || '';
        const designs = parseDesignText(rawText, defaultCatId);

        if (designs.length === 0) {
            toast.error('Could not parse any designs. Check the format.');
            return;
        }

        // Resolve category names to IDs
        designs.forEach(d => {
            d.categoryId = resolveCategoryId(d.categoryId);
        });

        setParsedDesigns(designs);
        setIsParsed(true);
        toast.success(`Parsed ${designs.length} design(s) successfully!`);
    };

    const handleReset = () => {
        setParsedDesigns([]);
        setIsParsed(false);
        setRawText('');
        setImportProgress({ done: 0, total: 0 });
    };

    const updateDesign = (idx: number, updates: Partial<ParsedDesign>) => {
        setParsedDesigns(prev => prev.map((d, i) => i === idx ? { ...d, ...updates } : d));
    };

    const removeDesign = (idx: number) => {
        setParsedDesigns(prev => prev.filter((_, i) => i !== idx));
    };

    const toggleCollapse = (idx: number) => {
        updateDesign(idx, { _collapsed: !parsedDesigns[idx]._collapsed });
    };

    // Update a package field
    const updatePackage = (dIdx: number, pIdx: number, updates: Partial<ParsedPackage>) => {
        setParsedDesigns(prev => prev.map((d, i) => {
            if (i !== dIdx) return d;
            const packages = [...d.packages];
            packages[pIdx] = { ...packages[pIdx], ...updates };
            return { ...d, packages };
        }));
    };

    const addPackage = (dIdx: number) => {
        setParsedDesigns(prev => prev.map((d, i) => {
            if (i !== dIdx) return d;
            return {
                ...d,
                packages: [...d.packages, { title: '', inclusions: [], priceTiers: [{ minQty: 50, maxQty: 100, pricePerCard: 0 }] }]
            };
        }));
    };

    const removePackage = (dIdx: number, pIdx: number) => {
        setParsedDesigns(prev => prev.map((d, i) => {
            if (i !== dIdx) return d;
            return { ...d, packages: d.packages.filter((_, j) => j !== pIdx) };
        }));
    };

    const addTier = (dIdx: number, pIdx: number) => {
        setParsedDesigns(prev => prev.map((d, i) => {
            if (i !== dIdx) return d;
            const packages = [...d.packages];
            packages[pIdx] = {
                ...packages[pIdx],
                priceTiers: [...packages[pIdx].priceTiers, { minQty: 1, maxQty: null, pricePerCard: 0 }]
            };
            return { ...d, packages };
        }));
    };

    const removeTier = (dIdx: number, pIdx: number, tIdx: number) => {
        setParsedDesigns(prev => prev.map((d, i) => {
            if (i !== dIdx) return d;
            const packages = [...d.packages];
            packages[pIdx] = {
                ...packages[pIdx],
                priceTiers: packages[pIdx].priceTiers.filter((_, j) => j !== tIdx)
            };
            return { ...d, packages };
        }));
    };

    const updateTier = (dIdx: number, pIdx: number, tIdx: number, field: string, value: any) => {
        setParsedDesigns(prev => prev.map((d, i) => {
            if (i !== dIdx) return d;
            const packages = [...d.packages];
            const tiers = [...packages[pIdx].priceTiers];
            tiers[tIdx] = { ...tiers[tIdx], [field]: value };
            packages[pIdx] = { ...packages[pIdx], priceTiers: tiers };
            return { ...d, packages };
        }));
    };

    // Handle image file selection for a design
    const handleFileSelect = (dIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const newFiles = [...parsedDesigns[dIdx]._localFiles, ...Array.from(files)];
        updateDesign(dIdx, { _localFiles: newFiles });
    };

    const removeLocalFile = (dIdx: number, fIdx: number) => {
        const newFiles = parsedDesigns[dIdx]._localFiles.filter((_, i) => i !== fIdx);
        updateDesign(dIdx, { _localFiles: newFiles });
    };

    const removeUploadedImage = (dIdx: number, imgIdx: number) => {
        const newImages = parsedDesigns[dIdx].images.filter((_, i) => i !== imgIdx);
        updateDesign(dIdx, { images: newImages });
    };

    // Upload images for a single design
    const uploadImages = async (dIdx: number): Promise<string[]> => {
        const design = parsedDesigns[dIdx];
        const urls: string[] = [...design.images];

        for (const file of design._localFiles) {
            const formData = new FormData();
            formData.append('file', file);
            try {
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                const result = await res.json();
                if (result.url) {
                    urls.push(result.url);
                }
            } catch {
                // Continue with others
            }
        }

        return urls;
    };

    // Import all designs
    const handleImportAll = async () => {
        const pendingDesigns = parsedDesigns.filter(d => d._status === 'pending' || d._status === 'error');
        if (pendingDesigns.length === 0) {
            toast.error('No designs to import');
            return;
        }

        // Validate all have packages
        for (const d of pendingDesigns) {
            if (d.packages.length === 0) {
                toast.error(`Design "${d.name || d.sku}" needs at least one package`);
                return;
            }
            if (!d.categoryId) {
                toast.error(`Design "${d.name || d.sku}" needs a category`);
                return;
            }
        }

        setIsImporting(true);
        setImportProgress({ done: 0, total: pendingDesigns.length });

        let successCount = 0;

        for (let i = 0; i < parsedDesigns.length; i++) {
            const design = parsedDesigns[i];
            if (design._status !== 'pending' && design._status !== 'error') continue;

            // Upload images first
            updateDesign(i, { _status: 'uploading' });
            let imageUrls: string[] = [];
            try {
                imageUrls = await uploadImages(i);
            } catch {
                updateDesign(i, { _status: 'error', _error: 'Image upload failed' });
                setImportProgress(prev => ({ ...prev, done: prev.done + 1 }));
                continue;
            }

            // Create design via API
            updateDesign(i, { _status: 'importing', images: imageUrls });
            try {
                const payload = {
                    sku: design.sku,
                    name: design.name,
                    description: design.description,
                    categoryId: design.categoryId,
                    minQuantity: design.minQuantity,
                    packages: design.packages.map(p => ({
                        title: p.title,
                        inclusions: p.inclusions,
                        priceTiers: p.priceTiers
                    })),
                    images: imageUrls,
                    isActive: design.isActive,
                    isTrending: design.isTrending,
                    isFeatured: design.isFeatured,
                    demoUrl: design.demoUrl,
                };

                const res = await fetch('/api/designs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (res.ok) {
                    updateDesign(i, { _status: 'success', images: imageUrls, _localFiles: [] });
                    successCount++;
                } else {
                    const err = await res.json();
                    updateDesign(i, { _status: 'error', _error: err.message || 'Failed to create design' });
                }
            } catch (err: any) {
                updateDesign(i, { _status: 'error', _error: err.message || 'Network error' });
            }

            setImportProgress(prev => ({ ...prev, done: prev.done + 1 }));
        }

        setIsImporting(false);
        if (successCount > 0) {
            toast.success(`${successCount} design(s) imported successfully!`);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-lavender" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/designs"
                        className="w-10 h-10 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-lavender hover:border-lavender/20 transition-all"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <Sparkles className="text-lavender" size={28} />
                            Bulk Import
                        </h1>
                        <p className="text-gray-500 mt-1 font-medium">Paste from WhatsApp → Parse → Upload Images → Import in seconds</p>
                    </div>
                </div>
                {isParsed && (
                    <button
                        onClick={handleReset}
                        className="text-gray-400 hover:text-red-500 font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-colors"
                    >
                        <X size={16} />
                        Start Over
                    </button>
                )}
            </div>

            {/* Step 1: Paste Text */}
            {!isParsed && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-lavender/10 text-lavender flex items-center justify-center">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-charcoal">Step 1: Paste Design Data</h2>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Copy from WhatsApp and paste below</p>
                            </div>
                        </div>

                        <textarea
                            value={rawText}
                            onChange={e => setRawText(e.target.value)}
                            className="w-full min-h-[350px] px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-lavender outline-none transition-all font-mono text-sm text-gray-700 resize-none"
                            placeholder={`Paste one or more designs. Example format:

Code: ZB001
Name: Royal Paisley Traditional Invitation
Category: South Indian Traditional Wedding
Description: A stunning traditional wedding invitation...

Package: A4 Size (Two Folded Invite) + Ribbon
Included: MAT FINISHING BOARD – 300 GSM (Budget Friendly)
50-100: 27
200-399: 24
400-599: 23
600-799: 22
800-999: 21
1000-1999: 20

Package: A4 Size (Two Folded Invite) + Ribbon
Included: PREMIUM BOARDS – 300 GSM (Linen / Needle Point)
50-100: 35
200-400: 33
400-600: 30
600-800: 28
800-1000: 26
1000-2000: 24
---
(Use --- to separate multiple designs)`}
                        />

                        {/* Format Guide */}
                        <div className="bg-lavender/5 border border-lavender/10 rounded-2xl p-5">
                            <h4 className="text-[10px] font-black text-lavender uppercase tracking-widest mb-3">Supported Format Keywords</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                {[
                                    { label: 'Code:', desc: 'SKU code (ZB001)' },
                                    { label: 'Name:', desc: 'Design name' },
                                    { label: 'Category:', desc: 'Category name' },
                                    { label: 'Description:', desc: 'Design description' },
                                    { label: 'Package:', desc: 'Package title' },
                                    { label: 'Included:', desc: "What's included" },
                                    { label: '50-100: 27', desc: 'Price tier' },
                                    { label: '---', desc: 'Design separator' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <code className="text-lavender font-black bg-white px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">{item.label}</code>
                                        <span className="text-gray-500 font-medium">{item.desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleParse}
                            className="w-full bg-charcoal hover:bg-black text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-charcoal/20 transition-all flex items-center justify-center gap-3"
                        >
                            <Zap size={18} />
                            Parse Design Data
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Step 2: Review & Edit Parsed Designs */}
            {isParsed && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Summary Bar */}
                    <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-lavender/10 text-lavender rounded-xl flex items-center justify-center font-black text-sm">
                                    {parsedDesigns.length}
                                </div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Designs Parsed</span>
                            </div>
                            {importProgress.total > 0 && (
                                <div className="flex items-center gap-3">
                                    <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-lavender rounded-full transition-all duration-500"
                                            style={{ width: `${(importProgress.done / importProgress.total) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-gray-400">
                                        {importProgress.done}/{importProgress.total}
                                    </span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleImportAll}
                            disabled={isImporting || parsedDesigns.every(d => d._status === 'success')}
                            className="bg-lavender hover:bg-[#9a6ab5] disabled:bg-gray-200 disabled:text-gray-400 text-white px-8 py-3.5 rounded-2xl font-black shadow-xl shadow-lavender/20 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                        >
                            {isImporting ? (
                                <><Loader2 className="animate-spin" size={18} /> Importing...</>
                            ) : (
                                <><Zap size={18} /> Import All Designs</>
                            )}
                        </button>
                    </div>

                    {/* Design Cards */}
                    <div className="space-y-4">
                        {parsedDesigns.map((design, dIdx) => (
                            <motion.div
                                key={dIdx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: dIdx * 0.05 }}
                                className={cn(
                                    "bg-white rounded-[2rem] border shadow-sm overflow-hidden transition-all",
                                    design._status === 'success' ? 'border-green-200 bg-green-50/30' :
                                        design._status === 'error' ? 'border-red-200 bg-red-50/30' :
                                            design._status === 'uploading' || design._status === 'importing' ? 'border-lavender/30' :
                                                'border-gray-100'
                                )}
                            >
                                {/* Card Header */}
                                <div
                                    className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
                                    onClick={() => toggleCollapse(dIdx)}
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        {/* Status Icon */}
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                            design._status === 'success' ? 'bg-green-100 text-green-600' :
                                                design._status === 'error' ? 'bg-red-100 text-red-500' :
                                                    design._status === 'uploading' || design._status === 'importing' ? 'bg-lavender/10 text-lavender' :
                                                        'bg-gray-100 text-gray-400'
                                        )}>
                                            {design._status === 'success' ? <CheckCircle2 size={20} /> :
                                                design._status === 'error' ? <XCircle size={20} /> :
                                                    design._status === 'uploading' || design._status === 'importing' ? <Loader2 className="animate-spin" size={20} /> :
                                                        <PackageIcon size={20} />}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h3 className="font-bold text-charcoal truncate">{design.name || 'Untitled Design'}</h3>
                                                <span className="text-[10px] font-black text-lavender bg-lavender/5 px-2.5 py-1 rounded-full border border-lavender/10 uppercase tracking-widest shrink-0">
                                                    {design.sku}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400 font-medium">
                                                <span>{design.packages.length} package(s)</span>
                                                <span>•</span>
                                                <span>{design._localFiles.length + design.images.length} image(s)</span>
                                                {design._status === 'uploading' && <span className="text-lavender font-bold">Uploading images...</span>}
                                                {design._status === 'importing' && <span className="text-lavender font-bold">Creating design...</span>}
                                                {design._error && <span className="text-red-500 font-bold">{design._error}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {design._status === 'pending' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeDesign(dIdx); }}
                                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                        {design._collapsed ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronUp size={18} className="text-gray-400" />}
                                    </div>
                                </div>

                                {/* Card Body (collapsible) */}
                                <AnimatePresence>
                                    {!design._collapsed && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-6 space-y-5 border-t border-gray-50 pt-5">
                                                {/* Basic Fields */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Design Name</label>
                                                        <input
                                                            type="text" value={design.name}
                                                            onChange={e => updateDesign(dIdx, { name: e.target.value })}
                                                            disabled={design._status === 'success'}
                                                            className="w-full px-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-lavender outline-none transition-all font-bold text-charcoal text-sm disabled:opacity-50"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">SKU Code</label>
                                                        <input
                                                            type="text" value={design.sku}
                                                            onChange={e => updateDesign(dIdx, { sku: e.target.value })}
                                                            disabled={design._status === 'success'}
                                                            className="w-full px-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-lavender outline-none transition-all font-black text-charcoal text-sm disabled:opacity-50"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Category</label>
                                                        <select
                                                            value={design.categoryId}
                                                            onChange={e => updateDesign(dIdx, { categoryId: e.target.value })}
                                                            disabled={design._status === 'success'}
                                                            className="w-full px-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-lavender outline-none transition-all font-bold text-charcoal text-sm appearance-none disabled:opacity-50"
                                                        >
                                                            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Description</label>
                                                    <textarea
                                                        value={design.description}
                                                        onChange={e => updateDesign(dIdx, { description: e.target.value })}
                                                        disabled={design._status === 'success'}
                                                        className="w-full px-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-lavender outline-none transition-all font-medium text-gray-600 text-sm min-h-[60px] resize-none disabled:opacity-50"
                                                        placeholder="Describe the design..."
                                                    />
                                                </div>

                                                {/* Min Quantity */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div>
                                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Min Order Qty</label>
                                                        <input
                                                            type="number" value={design.minQuantity === 0 ? '' : design.minQuantity}
                                                            onChange={e => updateDesign(dIdx, { minQuantity: e.target.value === '' ? 0 : parseInt(e.target.value) })}
                                                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                                            disabled={design._status === 'success'}
                                                            className="w-full px-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-lavender outline-none transition-all font-black text-charcoal text-sm disabled:opacity-50"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Demo Link</label>
                                                        <input
                                                            type="text" value={design.demoUrl}
                                                            onChange={e => updateDesign(dIdx, { demoUrl: e.target.value })}
                                                            disabled={design._status === 'success'}
                                                            className="w-full px-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-lavender outline-none transition-all font-bold text-charcoal text-sm disabled:opacity-50"
                                                            placeholder="https://..."
                                                        />
                                                    </div>
                                                </div>

                                                {/* Packages */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                            <PackageIcon size={12} /> Packages ({design.packages.length})
                                                        </h4>
                                                        {design._status !== 'success' && (
                                                            <button type="button" onClick={() => addPackage(dIdx)} className="text-lavender font-black text-[9px] uppercase tracking-widest hover:underline flex items-center gap-1">
                                                                <Plus size={12} /> Add Package
                                                            </button>
                                                        )}
                                                    </div>

                                                    {design.packages.map((pkg, pIdx) => (
                                                        <div key={pIdx} className="bg-gray-50 rounded-2xl p-4 space-y-3 relative group border border-transparent hover:border-lavender/10 transition-all">
                                                            {design._status !== 'success' && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removePackage(dIdx, pIdx)}
                                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-white shadow-md border border-gray-100 rounded-full flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                                                                >
                                                                    <X size={12} />
                                                                </button>
                                                            )}

                                                            {/* Package Title */}
                                                            <div>
                                                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Package Title</label>
                                                                <input
                                                                    type="text" value={pkg.title}
                                                                    onChange={e => updatePackage(dIdx, pIdx, { title: e.target.value })}
                                                                    disabled={design._status === 'success'}
                                                                    className="w-full px-3 py-2 bg-white border border-gray-100 rounded-xl font-bold text-charcoal text-sm outline-none focus:border-lavender disabled:opacity-50"
                                                                />
                                                            </div>

                                                            {/* Inclusions */}
                                                            <div>
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">What's Included</label>
                                                                    {design._status !== 'success' && (
                                                                        <button type="button" onClick={() => {
                                                                            updatePackage(dIdx, pIdx, { inclusions: [...pkg.inclusions, ''] });
                                                                        }} className="text-lavender font-black text-[8px] uppercase tracking-wider hover:underline flex items-center gap-1">
                                                                            <Plus size={10} /> Add
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                {pkg.inclusions.map((inc, incIdx) => (
                                                                    <div key={incIdx} className="flex gap-2 mb-1">
                                                                        <input
                                                                            type="text" value={inc}
                                                                            onChange={e => {
                                                                                const newInc = [...pkg.inclusions];
                                                                                newInc[incIdx] = e.target.value;
                                                                                updatePackage(dIdx, pIdx, { inclusions: newInc });
                                                                            }}
                                                                            disabled={design._status === 'success'}
                                                                            className="flex-1 px-3 py-1.5 bg-white border border-gray-100 rounded-lg text-xs font-medium text-gray-600 outline-none focus:border-lavender disabled:opacity-50"
                                                                        />
                                                                        {design._status !== 'success' && (
                                                                            <button type="button" onClick={() => {
                                                                                updatePackage(dIdx, pIdx, { inclusions: pkg.inclusions.filter((_, j) => j !== incIdx) });
                                                                            }} className="p-1.5 text-red-300 hover:text-red-500 rounded-lg">
                                                                                <X size={12} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                                {pkg.inclusions.length === 0 && (
                                                                    <p className="text-[9px] text-gray-300 italic">No inclusions</p>
                                                                )}
                                                            </div>

                                                            {/* Price Tiers */}
                                                            <div>
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Price Tiers</label>
                                                                    {design._status !== 'success' && (
                                                                        <button type="button" onClick={() => addTier(dIdx, pIdx)} className="text-lavender font-black text-[8px] uppercase tracking-wider hover:underline flex items-center gap-1">
                                                                            <Plus size={10} /> Add Tier
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <div className="space-y-2">
                                                                    {pkg.priceTiers.map((tier, tIdx) => (
                                                                        <div key={tIdx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-100">
                                                                            <input
                                                                                type="number" value={tier.minQty === 0 ? '' : tier.minQty} placeholder="Min"
                                                                                onChange={e => updateTier(dIdx, pIdx, tIdx, 'minQty', e.target.value === '' ? 0 : parseInt(e.target.value))}
                                                                                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                                                                disabled={design._status === 'success'}
                                                                                className="w-20 px-2 py-1.5 bg-gray-50 rounded-lg text-xs font-bold text-center outline-none focus:bg-white focus:ring-1 focus:ring-lavender disabled:opacity-50"
                                                                            />
                                                                            <span className="text-gray-300 text-xs">→</span>
                                                                            <input
                                                                                type="number" value={tier.maxQty === 0 ? '' : tier.maxQty} placeholder="Max"
                                                                                onChange={e => updateTier(dIdx, pIdx, tIdx, 'maxQty', e.target.value === '' ? 0 : parseInt(e.target.value))}
                                                                                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                                                                disabled={design._status === 'success'}
                                                                                className="w-20 px-2 py-1.5 bg-gray-50 rounded-lg text-xs font-bold text-center outline-none focus:bg-white focus:ring-1 focus:ring-lavender disabled:opacity-50"
                                                                            />
                                                                            <span className="text-gray-400 text-xs">₹</span>
                                                                            <input
                                                                                type="number" value={tier.pricePerCard === 0 ? '' : tier.pricePerCard} placeholder="Price"
                                                                                onChange={e => updateTier(dIdx, pIdx, tIdx, 'pricePerCard', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                                                                                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                                                                disabled={design._status === 'success'}
                                                                                className="w-20 px-2 py-1.5 bg-gray-50 rounded-lg text-xs font-black text-center outline-none focus:bg-white focus:ring-1 focus:ring-lavender disabled:opacity-50"
                                                                            />
                                                                            <span className="text-[9px] text-gray-400">/card</span>
                                                                            {design._status !== 'success' && (
                                                                                <button type="button" onClick={() => removeTier(dIdx, pIdx, tIdx)} className="p-1 text-red-300 hover:text-red-500 ml-auto">
                                                                                    <Trash2 size={12} />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                    {pkg.priceTiers.length === 0 && (
                                                                        <p className="text-[9px] text-gray-300 italic">No tiers added</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {design.packages.length === 0 && (
                                                        <div className="py-6 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-300">
                                                            <AlertCircle size={24} />
                                                            <p className="text-xs font-bold uppercase tracking-widest">No packages — add at least one</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Image Upload */}
                                                <div>
                                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block flex items-center gap-2">
                                                        <ImageIcon size={12} /> Design Images
                                                    </label>
                                                    <div className="flex flex-wrap gap-3">
                                                        {/* Already uploaded images */}
                                                        {design.images.map((img, imgIdx) => (
                                                            <div key={`uploaded-${imgIdx}`} className="w-20 h-20 rounded-xl overflow-hidden relative group border border-gray-100">
                                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                                                {design._status !== 'success' && (
                                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <button onClick={() => removeUploadedImage(dIdx, imgIdx)} className="text-white">
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                                <div className="absolute top-1 left-1">
                                                                    <CheckCircle2 size={14} className="text-green-400 drop-shadow" />
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {/* Local files (not yet uploaded) */}
                                                        {design._localFiles.map((file, fIdx) => (
                                                            <div key={`local-${fIdx}`} className="w-20 h-20 rounded-xl overflow-hidden relative group border border-lavender/20 bg-lavender/5">
                                                                <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                                                {design._status !== 'success' && (
                                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <button onClick={() => removeLocalFile(dIdx, fIdx)} className="text-white">
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                                <div className="absolute bottom-1 left-1 text-[8px] font-bold bg-lavender text-white px-1.5 py-0.5 rounded">
                                                                    Pending
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {/* Add more images */}
                                                        {design._status !== 'success' && (
                                                            <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-300 hover:border-lavender hover:text-lavender cursor-pointer transition-all bg-gray-50/50">
                                                                <input
                                                                    ref={el => { fileInputRefs.current[dIdx] = el; }}
                                                                    type="file"
                                                                    multiple
                                                                    accept="image/*"
                                                                    className="hidden"
                                                                    onChange={e => handleFileSelect(dIdx, e)}
                                                                />
                                                                <Upload size={16} />
                                                                <span className="text-[8px] font-bold uppercase">Add</span>
                                                            </label>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>

                    {/* Bottom Import Button */}
                    {parsedDesigns.length > 0 && !parsedDesigns.every(d => d._status === 'success') && (
                        <div className="sticky bottom-4 z-20">
                            <button
                                onClick={handleImportAll}
                                disabled={isImporting}
                                className="w-full bg-charcoal hover:bg-black disabled:bg-gray-300 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3"
                            >
                                {isImporting ? (
                                    <><Loader2 className="animate-spin" size={18} /> Importing {importProgress.done}/{importProgress.total}...</>
                                ) : (
                                    <><Zap size={18} /> Import {parsedDesigns.filter(d => d._status === 'pending' || d._status === 'error').length} Design(s)</>
                                )}
                            </button>
                        </div>
                    )}

                    {/* All Done */}
                    {parsedDesigns.length > 0 && parsedDesigns.every(d => d._status === 'success') && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-green-50 border border-green-200 p-8 rounded-[2rem] text-center space-y-4"
                        >
                            <CheckCircle2 className="text-green-500 mx-auto" size={48} />
                            <h3 className="text-xl font-black text-green-700">All Designs Imported!</h3>
                            <p className="text-green-600 font-medium">
                                {parsedDesigns.length} design(s) have been successfully created.
                            </p>
                            <div className="flex items-center justify-center gap-4 pt-2">
                                <Link
                                    href="/admin/designs"
                                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                                >
                                    View All Designs
                                </Link>
                                <button
                                    onClick={handleReset}
                                    className="px-6 py-3 bg-white border border-green-200 text-green-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-50 transition-all"
                                >
                                    Import More
                                </button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
