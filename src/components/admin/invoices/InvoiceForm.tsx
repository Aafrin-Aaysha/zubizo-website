'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Plus, ArrowRight, Loader2, Trash2, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface InvoiceFormProps {
    initialData?: any;
    isEditing?: boolean;
}

export default function InvoiceForm({ initialData, isEditing = false }: InvoiceFormProps) {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Form inputs
    const [customerName, setCustomerName] = useState(initialData?.customerName || '');
    const [customerPhone, setCustomerPhone] = useState(initialData?.customerPhone || '');
    const [customerAddress, setCustomerAddress] = useState(initialData?.customerAddress || '');
    
    const [designCode, setDesignCode] = useState(initialData?.designCode || '');
    const [quantity, setQuantity] = useState(initialData?.quantity || 1);
    const [pricePerCard, setPricePerCard] = useState(initialData?.pricePerCard || 10);
    
    const [shippingCharge, setShippingCharge] = useState(initialData?.shippingCharge || 0);
    const [designingCharge, setDesigningCharge] = useState(initialData?.designingCharge || 0);
    const [customCharges, setCustomCharges] = useState<{label: string, amount: number}[]>(initialData?.customCharges || []);
    const [status, setStatus] = useState(initialData?.status || 'Generated');

    // Fetched details
    const [design, setDesign] = useState<any>(null);
    const [materials, setMaterials] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Fetch master inventory
    const { data: inventory = [] } = useQuery({
        queryKey: ['inventory'],
        queryFn: async () => {
            const res = await fetch('/api/admin/inventory');
            if (!res.ok) throw new Error('Failed to fetch inventory');
            return res.json();
        }
    });

    // Populate materials if editing
    useEffect(() => {
        if (initialData && initialData.materialsUsed) {
            // We need to map the stored materialsUsed back to the form structure
            // In the form, we use quantityPerCard (quantUsed / designQty)
            const designQty = initialData.quantity || 1;
            const mapped = initialData.materialsUsed.map((m: any) => ({
                materialId: m.materialId,
                name: m.name,
                unit: 'pcs', // Fallback, could be improved by fetching material details
                costPerUnit: m.costPerUnit,
                quantityPerCard: m.quantityUsed / designQty
            }));
            setMaterials(mapped);
            setDesign({ _id: initialData.designId, name: initialData.designName, sku: initialData.designCode });
        }
    }, [initialData]);

    const handleFetchDesign = async () => {
        if (!designCode.trim()) return;
        setIsSearching(true);
        try {
            const res = await fetch(`/api/designs?search=${designCode}`);
            const data = await res.json();
            
            if (data && data.length > 0) {
                const fetchedDesign = data[0];
                setDesign(fetchedDesign);
                
                if (fetchedDesign.materials && fetchedDesign.materials.length > 0) {
                    const mapped = fetchedDesign.materials.map((m: any) => ({
                        materialId: m.materialId?._id,
                        name: m.materialId?.name || 'Unknown',
                        unit: m.materialId?.unit || 'pcs',
                        costPerUnit: m.materialId?.defaultPrice || 0,
                        quantityPerCard: m.quantityPerCard || 1,
                    }));
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

    const addCustomCharge = () => setCustomCharges([...customCharges, { label: '', amount: 0 }]);
    const removeCustomCharge = (index: number) => setCustomCharges(customCharges.filter((_, i) => i !== index));
    
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

    const addCustomMaterial = () => setMaterials([...materials, { materialId: null, name: 'Custom Card/Item', unit: 'pcs', costPerUnit: 0, quantityPerCard: 1 }]);
    const removeMaterial = (index: number) => setMaterials(materials.filter((_, i) => i !== index));
    const updateMaterialQty = (index: number, val: number) => {
        const copy = [...materials];
        copy[index].quantityPerCard = val;
        setMaterials(copy);
    };

    const updateMaterialRate = (index: number, val: number) => {
        const copy = [...materials];
        copy[index].costPerUnit = val;
        setMaterials(copy);
    };

    // Derived values
    const materialsUsed = materials.map((m: any) => ({
        materialId: m.materialId,
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

    const saveMutation = useMutation({
        mutationFn: async (payload: any) => {
            const url = isEditing ? `/api/admin/invoices/${initialData._id}` : '/api/admin/invoices';
            const method = isEditing ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
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
            toast.success(isEditing ? 'Invoice Updated!' : 'Invoice Generated!');
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            router.push('/admin/invoices');
        },
        onError: (err: any) => toast.error(err.message)
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!design) return toast.error('Please load a design first');
        
        saveMutation.mutate({
            customerName,
            customerPhone,
            customerAddress,
            designId: design._id,
            designCode: design.sku || designCode,
            designName: design.name,
            quantity,
            pricePerCard,
            materialsUsed,
            shippingCharge,
            designingCharge,
            customCharges,
            status
        });
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                {/* Customer Details */}
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                    <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Customer Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Customer Name *</label>
                            <input required value={customerName} onChange={e => setCustomerName(e.target.value)} type="text" className="w-full p-3 bg-gray-50 border-transparent rounded-xl focus:bg-white border-none outline-none transition-all font-medium text-sm" placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                            <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} type="text" className="w-full p-3 bg-gray-50 border-transparent rounded-xl focus:bg-white border-none outline-none transition-all font-medium text-sm" placeholder="+91 99999..." />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Address</label>
                            <textarea value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full p-3 bg-gray-50 border-transparent rounded-xl focus:bg-white border-none outline-none transition-all font-medium text-sm resize-none h-20" placeholder="Full shipping address..." />
                        </div>
                    </div>
                </div>

                {/* Order Details */}
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                    <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Order Specifics</h2>
                    <div className="flex items-end gap-2">
                        <div className="flex-1 space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Design Code (SKU) *</label>
                            <input required value={designCode} onChange={e => setDesignCode(e.target.value)} type="text" className="w-full p-3 bg-gray-50 border-gray-100 border rounded-xl focus:bg-white outline-none transition-all font-bold tracking-widest text-sm uppercase" placeholder="ZB_1031" />
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
                            <input required type="number" min="1" value={quantity === 0 ? '' : quantity} onChange={e => setQuantity(e.target.value === '' ? 0 : Number(e.target.value))} onWheel={(e) => (e.target as HTMLInputElement).blur()} className="w-full p-4 bg-gray-50 border-none rounded-xl focus:bg-white outline-none transition-all font-black text-xl text-center" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Price / Card (₹) *</label>
                            <input required type="number" step="0.01" min="0" value={pricePerCard === 0 ? '' : pricePerCard} onChange={e => setPricePerCard(e.target.value === '' ? 0 : Number(e.target.value))} onWheel={(e) => (e.target as HTMLInputElement).blur()} className="w-full p-4 bg-gray-50 border-none rounded-xl focus:bg-white outline-none transition-all font-black text-xl text-center" />
                        </div>
                    </div>
                </div>

                {/* Materials list */}
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
                        <h2 className="text-lg font-bold text-gray-900 flex-1">Materials Required</h2>
                        <button type="button" onClick={addCustomMaterial} className="px-3 py-1.5 text-[10px] font-black bg-blue-50 text-blue-700 rounded-lg uppercase tracking-widest border border-blue-100">
                            + Custom Cost
                        </button>
                        <select onChange={(e) => { if(e.target.value) addMaterial(e.target.value); e.target.value=''; }} className="px-3 py-1.5 text-[10px] font-black bg-purple-50 text-purple-700 rounded-lg cursor-pointer max-w-[150px] uppercase tracking-widest border border-purple-100 outline-none">
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
                                                <input value={m.name} onChange={e => { const copy = [...materials]; copy[i].name = e.target.value; setMaterials(copy); }} className="text-sm font-bold text-charcoal bg-transparent border-b border-dashed border-gray-300 outline-none focus:border-purple-400 w-full" placeholder="Item name..." />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Rate (₹):</span>
                                            <input type="number" step="0.01" value={m.costPerUnit === 0 ? '' : m.costPerUnit} onChange={e => updateMaterialRate(i, e.target.value === '' ? 0 : Number(e.target.value))} onWheel={(e) => (e.target as HTMLInputElement).blur()} className="w-16 p-0.5 text-center font-bold text-[10px] bg-white border border-gray-200 rounded outline-none text-purple-600" />
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">/ {m.unit}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Qty Required:</span>
                                        <input type="number" step="0.01" value={m.quantityPerCard === 0 ? '' : m.quantityPerCard} onChange={e => updateMaterialQty(i, e.target.value === '' ? 0 : Number(e.target.value))} onWheel={(e) => (e.target as HTMLInputElement).blur()} className="w-16 p-1 text-center font-bold text-sm bg-white border border-gray-200 rounded outline-none" />
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

            <div className="lg:col-span-1 space-y-6">
                <div className="bg-charcoal p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                    <h2 className="text-lg font-black mb-6 border-b border-white/10 pb-4">Customer Bill <span className="text-lavender font-normal italic">Calc</span></h2>
                    <div className="space-y-4 text-sm font-medium">
                        <div className="flex justify-between text-gray-400">
                            <span>Cards Cost</span>
                            <span className="font-bold text-white">₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                                <span className="text-gray-400 text-xs">Designing</span>
                                <input type="number" value={designingCharge === 0 ? '' : designingCharge} onChange={e=>setDesigningCharge(e.target.value === '' ? 0 : Number(e.target.value))} onWheel={(e) => (e.target as HTMLInputElement).blur()} className="w-20 bg-transparent text-right outline-none font-bold text-white uppercase tracking-widest" />
                            </div>
                            <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                                <span className="text-gray-400 text-xs">Shipping</span>
                                <input type="number" value={shippingCharge === 0 ? '' : shippingCharge} onChange={e=>setShippingCharge(e.target.value === '' ? 0 : Number(e.target.value))} onWheel={(e) => (e.target as HTMLInputElement).blur()} className="w-20 bg-transparent text-right outline-none font-bold text-white uppercase tracking-widest" />
                            </div>
                        </div>

                        {customCharges.map((c, i) => (
                            <div key={i} className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                                <input value={c.label} onChange={e => { const arr = [...customCharges]; arr[i].label = e.target.value; setCustomCharges(arr); }} className="flex-1 bg-transparent text-xs outline-none text-white" placeholder="Label..." />
                                <input type="number" value={c.amount === 0 ? '' : c.amount} onChange={e => { const arr = [...customCharges]; arr[i].amount = e.target.value === '' ? 0 : Number(e.target.value); setCustomCharges(arr); }} onWheel={(e) => (e.target as HTMLInputElement).blur()} className="w-16 bg-transparent text-right outline-none font-bold text-white text-xs uppercase tracking-widest" />
                                <button type="button" onClick={() => removeCustomCharge(i)} className="text-red-400"><Trash2 size={12}/></button>
                            </div>
                        ))}
                        <button type="button" onClick={addCustomCharge} className="text-[10px] text-lavender font-bold uppercase tracking-widest">+ Add Charge</button>

                        <div className="h-px bg-white/10 my-4" />
                        <div className="flex justify-between text-lg">
                            <span className="font-bold text-white uppercase tracking-widest text-sm">Grand Total</span>
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
                    <p className="text-[10px] text-emerald-500 font-bold mt-2 leading-tight uppercase tracking-widest">
                        Calculated dynamically based on live inventory prices.
                    </p>
                </div>

                {isEditing && (
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice Status</label>
                        <select 
                            value={status} 
                            onChange={e => setStatus(e.target.value)}
                            className="w-full p-3 bg-gray-50 border-none rounded-xl outline-none font-bold text-sm"
                        >
                            <option value="Generated">Generated</option>
                            <option value="Paid">Paid</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                )}

                <button 
                    type="submit"
                    disabled={saveMutation.isPending || !design}
                    className="w-full py-5 bg-lavender hover:bg-[#9a6ab5] text-white rounded-3xl font-bold text-lg shadow-xl shadow-lavender/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {saveMutation.isPending ? <Loader2 className="animate-spin" /> : <Save size={22} />}
                    {isEditing ? 'Update Invoice' : 'Generate Invoice'}
                </button>
            </div>
        </form>
    );
}
