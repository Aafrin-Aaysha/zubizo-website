'use client';

import React, { useState, useEffect } from "react";
import { LuxuryNavbar } from "@/components/layout/luxury-navbar";
import { LuxuryFooter } from "@/components/layout/luxury-footer";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function WaxSealsClient() {
    const [waxSeals, setWaxSeals] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const res = await fetch('/api/admin/materials');
                const data = await res.json();
                
                const seals = data.filter((m: any) => (m.category === 'Wax Seal' || m.category === 'Wax Seals') && m.isActive);
                setWaxSeals(seals);
            } catch (error) {
                toast.error("Failed to load wax seals");
            } finally {
                setIsLoading(false);
            }
        };
        fetchMaterials();
    }, []);

    return (
        <main className="min-h-screen bg-[#FAF9F6]">
            <LuxuryNavbar />
            <div className="pt-32 pb-20 min-h-[70vh]">
                <div className="site-container">
                    <Link href="/catalog" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#6E4B8B] transition-colors mb-8 font-bold uppercase tracking-wider">
                        <ArrowLeft size={16} /> Back to Catalog
                    </Link>

                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h1 className="text-4xl md:text-5xl font-serif text-[#6E4B8B] mb-4">Wax Seals</h1>
                        <p className="text-slate-600 mb-6">Add a timeless, elegant finishing touch to your invitations.</p>
                        <div className="inline-block bg-[#6E4B8B]/10 text-[#6E4B8B] px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide mb-2">
                            Note: Prices vary for different color variants.
                        </div>
                        <br />
                        <div className="inline-block bg-[#6E4B8B]/10 text-[#6E4B8B] px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide">
                            Additional Charge: Wax Initial Customisation – ₹1800 (One Time Charge)
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="animate-spin text-[#6E4B8B]" size={40} />
                        </div>
                    ) : waxSeals.length === 0 ? (
                        <div className="text-center text-slate-500 py-10">
                            No wax seals added yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                            {waxSeals.map((seal) => (
                                <div key={seal._id} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                                    <div className="aspect-[4/3] overflow-hidden bg-slate-50">
                                        <img src={seal.imageUrl} alt={seal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <div className="p-4 text-center">
                                        <h3 className="text-sm font-bold text-charcoal uppercase tracking-widest">{seal.name}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <LuxuryFooter />
        </main>
    );
}
