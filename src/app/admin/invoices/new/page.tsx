'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Plus, ArrowRight, Loader2, Trash2, IndianRupee, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function InvoiceGenerator() {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Form inputs
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    
    const [designCode, setDesignCode] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [pricePerCard, setPricePerCard] = useState(10);
    
    const [shippingCharge, setShippingCharge] = useState(0);
    const [designingCharge, setDesigningCharge] = useState(0);
    const [customCharges, setCustomCharges] = useState<{label: string, amount: number}[]>([]);

    // Fetched details
    const [design, setDesign] = useState<any>(null);
    const [materials, setMaterials] = useState<any[]>([]);
    
    const [isSearching, setIsSearching] = useState(false);

    // Fetch master inventory to allow adding custom materials
    const { data: inventory = [] } = useQuery({
        queryKey: ['inventory'],
        queryFn: async () => {
            const res = await fetch('/api/admin/inventory');
            if (!res.ok) throw new Error('Failed to fetch inventory');
            return res.json();
        }
    });

    // Handle design code lookup
    const handleFetchDesign = async () => {
        if (!designCode.trim()) return;
        setIsSearching(true);
        try {
            const res = await fetch(`/api/designs?search=${designCode}`);
            const data = await res.json();
            
            if (data && data.length > 0) {
                const fetchedDesign = data[0];
                setDesign(fetchedDesign);
                
                // Map materials
                if (fetchedDesign.materials && fetchedDesign.materials.length > 0) {
                    const mapped = fetchedDesign.materials.map((m: any) => {
                        return {
                            materialId: m.materialId?._id,
                            name: m.materialId?.name || 'Unknown',
                            unit: m.materialId?.unit || 'pcs',
                            costPerUnit: m.materialId?.defaultPrice || 0,
                            quantityPerCard: m.quantityPerCard || 1,
                        };
                    });
                    setMaterials(mapped);
                } else {
                    setMaterials([]);
                    toast.error('No materials mapped to this design');
                }
                toast.success('Design loaded');
            } else {
                toast.error('Design not found');
                setDesign(null);
                setMaterials([]);
            }
        } catch (error) {
            toast.error('Failed to fetch design');
        } finally {
            setIsSearching(false);
        }
    };

    const addCustomCharge = () => {
        setCustomCharges([...customCharges, { label: '', amount: 0 }]);
    };

    const removeCustomCharge = (index: number) => {
        setCustomCharges(customCharges.filter((_, i) => i !== index));
    };
    
    const addMaterial = (invMaterialId: string) => {
        const item = inventory.find((i: any) => i._id === invMaterialId);
        if (!item) return;
        setMaterials([...materials, {
            materialId: item._id,
            name: item.name,
            size: item.size,
            gsm: item.gsm,
            unit: item.unit,
            costPerUnit: item.defaultPrice,
            quantityPerCard: 1
        }]);
    };

    const updateMaterialRate = (index: number, val: number) => {
        const copy = [...materials];
        copy[index].costPerUnit = val;
        setMaterials(copy);
    };

    const addCustomMaterial = () => {
        setMaterials([...materials, {
            materialId: null, // Indicates a custom one-off item
            name: 'Custom Card/Item',
            unit: 'pcs',
            costPerUnit: 0,
            quantityPerCard: 1
        }]);
    };
    
    const removeMaterial = (index: number) => {
        setMaterials(materials.filter((_, i) => i !== index));
    };

    const updateMaterialQty = (index: number, val: number) => {
        const copy = [...materials];
        copy[index].quantityPerCard = val;
        setMaterials(copy);
    };

    // Derived values
    const materialsUsed = materials.map((m: any) => ({
        materialId: m.materialId, // may be null for custom items
        name: m.name,
        quantityUsed: m.quantityPerCard * quantity,
        costPerUnit: m.costPerUnit,
        totalCost: (m.quantityPerCard * quantity) * m.costPerUnit
    }));

    const totalMaterialCost = materialsUsed.reduce((acc, m) => acc + m.totalCost, 0);
    const subtotal = quantity * pricePerCard;
    const additionalCustomTotal = customCharges.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
    const grandTotal = subtotal + Number(shippingCharge) + Number(designingCharge) + additionalCustomTotal;
    const profit = grandTotal - totalMaterialCost;

    const createMutation = useMutation({
        mutationFn: async (payload: any) => {
            const res = await fetch('/api/admin/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const e = await res.json();
                throw new Error(e.message || 'Error saving invoice');
            }
            return res.json();
        },
        onSuccess: () => {
            toast.success('Invoice Generated and Stock Deducted!');
            router.push('/admin/invoices');
        },
        onError: (err: any) => {
            toast.error(err.message);
        }
    });

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!design) return toast.error('Please load a design first');
        
        createMutation.mutate({
            customerName,
            customerPhone,
            customerAddress,
            designId: design._id,
            designCode: design.sku,
            designName: design.name,
            quantity,
            pricePerCard,
            materialsUsed,
            shippingCharge,
            designingCharge,
            customCharges
        });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-charcoal tracking-tight">Invoice Generator</h1>
                    <p className="text-gray-500 mt-1 font-medium">Create a smart invoice & automatically deduct inventory.</p>
                </div>
            </div>

            <form onSubmit={handleGenerate} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Customer Details */}
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Customer Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Customer Name *</label>
                                <input required value={customerName} onChange={e => setCustomerName(e.target.value)} type="text" className="w-full p-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-purple-300 focus:ring-4 focus:ring-purple-50 outline-none transition-all font-medium text-sm" placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                                <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} type="text" className="w-full p-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-purple-300 focus:ring-4 focus:ring-purple-50 outline-none transition-all font-medium text-sm" placeholder="+91 99999..." />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Address</label>
                                <textarea value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full p-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-purple-300 focus:ring-4 focus:ring-purple-50 outline-none transition-all font-medium text-sm resize-none h-20" placeholder="Full shipping address..." />
                            </div>
                        </div>
                    </div>

                    {/* Order Details */}
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Order Specifics</h2>
                        
                        <div className="flex items-end gap-2">
                            <div className="flex-1 space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Design Code (SKU) *</label>
                                <input required value={designCode} onChange={e => setDesignCode(e.target.value)} type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-300 focus:ring-4 focus:ring-purple-50 outline-none transition-all font-bold tracking-widest text-sm uppercase" placeholder="ZB_1031" />
                            </div>
                            <button type="button" onClick={handleFetchDesign} disabled={isSearching} className="p-3 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-xl transition-colors font-bold flex items-center justify-center">
                                {isSearching ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                            </button>
                        </div>
                        
                        {design && (
                            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-4">
                                {design.images?.[0] && <img src={design.images[0]} className="w-12 h-12 rounded object-cover" />}
                                <div>
                                    <p className="font-bold text-emerald-900">{design.name}</p>
                                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Matched</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quantity *</label>
                                <input required type="number" min="1" value={quantity === 0 ? '' : quantity} onChange={e => setQuantity(e.target.value === '' ? 0 : Number(e.target.value))} onWheel={(e) => (e.target as HTMLInputElement).blur()} className="w-full p-4 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-purple-300 focus:ring-4 focus:ring-purple-50 outline-none transition-all font-black text-xl text-center" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Price / Card (₹) *</label>
                                <input required type="number" step="0.01" min="0" value={pricePerCard === 0 ? '' : pricePerCard} onChange={e => setPricePerCard(e.target.value === '' ? 0 : Number(e.target.value))} onWheel={(e) => (e.target as HTMLInputElement).blur()} className="w-full p-4 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-purple-300 focus:ring-4 focus:ring-purple-50 outline-none transition-all font-black text-xl text-center" />
                            </div>
                        </div>
                    </div>

                    {/* Materials Map (Editable) */}
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
                            <h2 className="text-lg font-bold text-gray-900 flex-1">Materials Required</h2>
                            <button 
                                type="button"
                                onClick={addCustomMaterial}
                                className="px-3 py-1.5 text-[10px] font-black bg-blue-50 text-blue-700 outline-none rounded-lg hover:bg-blue-100 transition-colors uppercase tracking-widest border border-blue-100"
                            >
                                + Custom Cost
                            </button>
                            <select 
                                onChange={(e) => { if(e.target.value) addMaterial(e.target.value); e.target.value=''; }}
                                className="px-3 py-1.5 text-[10px] font-black bg-purple-50 text-purple-700 outline-none rounded-lg cursor-pointer max-w-[150px] uppercase tracking-widest border border-purple-100"
                            >
                                <option value="">+ From Lib</option>
                                {inventory.map((inv: any) => (
                                    <option key={inv._id} value={inv._id}>{inv.name} {inv.size ? `(${inv.size})` : ''}</option>
                                ))}
                            </select>
                        </div>
                        
                        {materials.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4 font-medium">No materials mapped yet. Load a design or add manually.</p>
                        ) : (
                            <div className="space-y-3">
                                {materials.map((m, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                {m.materialId ? (
                                                    <p className="text-sm font-bold text-charcoal">{m.name}</p>
                                                ) : (
                                                    <input 
                                                        value={m.name} 
                                                        onChange={e => {
                                                            const copy = [...materials];
                                                            copy[i].name = e.target.value;
                                                            setMaterials(copy);
                                                        }}
                                                        className="text-sm font-bold text-charcoal bg-transparent border-b border-dashed border-gray-300 outline-none focus:border-purple-400 w-full"
                                                        placeholder="Item name..."
                                                    />
                                                )}
                                                {(m.size || m.gsm) && (
                                                    <span className="text-[9px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-md font-bold border border-purple-100 uppercase tracking-widest">
                                                        {m.size && <span>{m.size}</span>}
                                                        {m.size && m.gsm && <span>•</span>}
                                                        {m.gsm && <span>{m.gsm}gsm</span>}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Rate (₹):</span>
                                                <input
                                                    type="number" step="0.01" value={m.costPerUnit === 0 ? '' : m.costPerUnit} 
                                                    onChange={e => updateMaterialRate(i, e.target.value === '' ? 0 : Number(e.target.value))}
                                                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                                    className="w-16 p-0.5 text-center font-bold text-[10px] bg-white border border-gray-200 rounded outline-none text-purple-600 focus:border-purple-300"
                                                />
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">/ {m.unit}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Qty/Card:</span>
                                            <input
                                                type="number" step="0.01" value={m.quantityPerCard === 0 ? '' : m.quantityPerCard} 
                                                onChange={e => updateMaterialQty(i, e.target.value === '' ? 0 : Number(e.target.value))}
                                                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                                className="w-16 p-1 text-center font-bold text-sm bg-white border border-gray-200 rounded outline-none"
                                            />
                                        </div>
                                        <button type="button" onClick={() => removeMaterial(i)} className="text-red-400 hover:text-red-500 p-1">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <div className="mt-4 p-3 bg-purple-50/50 rounded-xl flex items-center justify-between text-sm font-bold text-purple-900">
                                    <span>Total Material Cost Prediction:</span>
                                    <span>₹{totalMaterialCost.toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Billing & Review */}
                <div className="lg:col-span-1 space-y-6">
                    
                    <div className="bg-charcoal p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-lavender/20 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
                        <h2 className="text-lg font-black mb-6 border-b border-white/10 pb-4">Customer Bill <span className="text-lavender font-normal italic">Calc</span></h2>
                        
                        <div className="space-y-4 text-sm font-medium">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Cards Cost</span>
                                <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                            </div>
                            
                            <div className="space-y-1">
                                <div className="flex justify-between items-center group">
                                    <span className="text-gray-400">Designing Charge</span>
                                    <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <IndianRupee size={12}/>
                                        <input type="number" value={designingCharge === 0 ? '' : designingCharge} onChange={e=>setDesigningCharge(e.target.value === '' ? 0 : Number(e.target.value))} onWheel={(e) => (e.target as HTMLInputElement).blur()} className="w-16 bg-white/10 border-none rounded p-1 text-right outline-none text-white font-bold"/>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center group">
                                    <span className="text-gray-400">Shipping Charge</span>
                                    <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <IndianRupee size={12}/>
                                        <input type="number" value={shippingCharge === 0 ? '' : shippingCharge} onChange={e=>setShippingCharge(e.target.value === '' ? 0 : Number(e.target.value))} onWheel={(e) => (e.target as HTMLInputElement).blur()} className="w-16 bg-white/10 border-none rounded p-1 text-right outline-none text-white font-bold"/>
                                    </div>
                                </div>
                            </div>

                            {/* Custom charges */}
                            {customCharges.length > 0 && <div className="h-px bg-white/10 my-2" />}
                            {customCharges.map((c, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <input placeholder="Label..." value={c.label} onChange={e => {
                                        const arr = [...customCharges]; arr[i].label = e.target.value; setCustomCharges(arr);
                                    }} className="flex-1 bg-white/10 rounded p-1.5 text-xs outline-none text-white" />
                                    
                                    <div className="flex items-center gap-1 bg-white/10 rounded px-1">
                                        <IndianRupee size={10} className="text-gray-400" />
                                        <input type="number" value={c.amount === 0 ? '' : c.amount} onChange={e => {
                                            const arr = [...customCharges]; arr[i].amount = e.target.value === '' ? 0 : Number(e.target.value); setCustomCharges(arr);
                                        }} onWheel={(e) => (e.target as HTMLInputElement).blur()} className="w-12 bg-transparent border-none p-1 text-right outline-none text-white font-bold text-xs" />
                                    </div>
                                    <button type="button" onClick={() => removeCustomCharge(i)} className="text-red-400 p-1 hover:bg-white/10 rounded"><Trash2 size={12}/></button>
                                </div>
                            ))}

                            <button type="button" onClick={addCustomCharge} className="text-[10px] text-lavender hover:bg-lavender/10 px-2 py-1 rounded font-bold uppercase tracking-widest flex items-center gap-1 transition-all">
                                <Plus size={12} /> Add Charge
                            </button>
                            
                            <div className="h-px bg-white/20 my-4" />
                            
                            <div className="flex justify-between text-lg">
                                <span className="font-bold text-white uppercase tracking-widest">Grand Total</span>
                                <span className="font-black text-white">₹{grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Admin Profit Insight */}
                    <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-sm font-bold text-emerald-900 uppercase tracking-widest">Admin Profit</h2>
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><IndianRupee size={16}/></div>
                        </div>
                        <p className="text-3xl font-black text-emerald-600">₹{profit.toFixed(2)}</p>
                        <p className="text-[10px] text-emerald-500 font-bold mt-2 leading-tight">
                            Calculated dynamically based on live inventory prices mapped to this order.
                        </p>
                    </div>

                    <button 
                        type="submit"
                        disabled={createMutation.isPending || !design}
                        className="w-full py-5 bg-lavender hover:bg-[#9a6ab5] text-white rounded-3xl font-bold text-lg shadow-xl shadow-lavender/20 active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {createMutation.isPending ? <Loader2 className="animate-spin" /> : <Save size={22} className="group-hover:-translate-y-0.5 transition-transform" />}
                        Generate Invoice
                    </button>
                    <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Generates PDF & Deducts Stock</p>

                </div>

            </form>
        </div>
    );
}
