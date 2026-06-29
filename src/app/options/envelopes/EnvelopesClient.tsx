'use client';

import React, { useState, useEffect } from "react";
import { LuxuryNavbar } from "@/components/layout/luxury-navbar";
import { LuxuryFooter } from "@/components/layout/luxury-footer";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function EnvelopesClient() {
    const [selectedType, setSelectedType] = useState<any>(null);
    const [envelopeShapes, setEnvelopeShapes] = useState<any[]>([]);
    const [envelopeColors, setEnvelopeColors] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const res = await fetch('/api/admin/materials');
                const data = await res.json();
                
                // Filter active shapes and colors (supporting both legacy 'Envelope Shape' and new 'Envelopes' category with parent checks)
                const shapes = data.filter((m: any) => (m.category === 'Envelope Shape' || (m.category === 'Envelopes' && !m.parentMaterialId)) && m.isActive);
                const colors = data.filter((m: any) => (m.category === 'Envelope Color' || (m.category === 'Envelopes' && m.parentMaterialId)) && m.isActive);
                
                setEnvelopeShapes(shapes);
                setEnvelopeColors(colors);
            } catch (error) {
                toast.error("Failed to load envelopes");
            } finally {
                setIsLoading(false);
            }
        };
        fetchMaterials();
    }, []);

    // Get colors for a specific shape. 
    // If a color has no parentMaterialId, it applies to all shapes.
    // If it has a parentMaterialId, it only applies to that specific shape.
    const getColorsForShape = (shapeId: string) => {
        return envelopeColors.filter(color => 
            !color.parentMaterialId || 
            color.parentMaterialId._id === shapeId || 
            color.parentMaterialId === shapeId
        );
    };

    return (
        <main className="min-h-screen bg-[#FAF9F6]">
            <LuxuryNavbar />
            <div className="pt-32 pb-20 min-h-[70vh]">
                <div className="site-container">
                    
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="animate-spin text-[#6E4B8B]" size={40} />
                        </div>
                    ) : !selectedType ? (
                        <>
                            <Link href="/catalog" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#6E4B8B] transition-colors mb-8 font-bold uppercase tracking-wider">
                                <ArrowLeft size={16} /> Back to Catalog
                            </Link>

                            <div className="text-center max-w-2xl mx-auto mb-16">
                                <h1 className="text-4xl md:text-5xl font-serif text-[#6E4B8B] mb-4">Envelopes</h1>
                                <p className="text-slate-600 mb-6">Discover the perfect envelope to complement your premium invitations.</p>
                                <div className="inline-block bg-[#6E4B8B]/10 text-[#6E4B8B] px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide">
                                    Note: Prices vary for different color variants and sizes.
                                </div>
                            </div>

                            {envelopeShapes.length === 0 ? (
                                <div className="text-center text-slate-500 py-10">
                                    No envelope shapes added yet.
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                                    {envelopeShapes.map((env) => (
                                        <div 
                                            key={env._id} 
                                            onClick={() => setSelectedType(env)}
                                            className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                                        >
                                            <div className="aspect-[4/3] overflow-hidden bg-slate-50">
                                                <img src={env.imageUrl} alt={env.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            </div>
                                            <div className="p-4 text-center flex items-center justify-between">
                                                <h3 className="text-lg font-serif text-[#6E4B8B]">{env.name}</h3>
                                                <div className="bg-[#6E4B8B]/5 w-8 h-8 rounded-full flex items-center justify-center text-[#6E4B8B] group-hover:bg-[#6E4B8B] group-hover:text-white transition-all">
                                                    <ChevronRight size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <button 
                                onClick={() => setSelectedType(null)} 
                                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#6E4B8B] transition-colors mb-8 font-bold uppercase tracking-wider"
                            >
                                <ArrowLeft size={16} /> Back to Sizes
                            </button>

                            <div className="text-center max-w-2xl mx-auto mb-16">
                                <h1 className="text-4xl md:text-5xl font-serif text-[#6E4B8B] mb-4">{selectedType.name} Colors</h1>
                                <p className="text-slate-600 mb-6">Explore all available color variants for our {selectedType.name} envelopes.</p>
                            </div>

                            {getColorsForShape(selectedType._id).length === 0 ? (
                                <div className="text-center text-slate-500 py-10">
                                    No colors added for this shape yet.
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                                    {getColorsForShape(selectedType._id).map((variant) => (
                                        <div key={variant._id} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                                            <div className="aspect-square overflow-hidden bg-gray-100">
                                                <img src={variant.imageUrl} alt={variant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            </div>
                                            <div className="p-4 text-center border-t border-gray-50">
                                                <h3 className="text-sm font-bold text-charcoal uppercase tracking-widest">{variant.name}</h3>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
            <LuxuryFooter />
        </main>
    );
}
