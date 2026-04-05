'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    Calculator,
    FileText,
    Download,
    Plus,
    Trash2,
    CheckCircle2,
    Package,
    TrendingUp,
    TrendingDown,
    Printer,
    User,
    Phone,
    MapPin,
    Hash,
    IndianRupee,
    Loader2,
    Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}

export default function OrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [settings, setSettings] = useState<any>(null);
    const [inventory, setInventory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isInvoiced, setIsInvoiced] = useState(false);

    // Calculator State
    const [materials, setMaterials] = useState<any[]>([]);
    const [printingCost, setPrintingCost] = useState<number>(0);
    
    // Billing State
    const [designingCharge, setDesigningCharge] = useState<number>(0);
    const [shippingCharge, setShippingCharge] = useState<number>(0);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [orderRes, settingsRes, activeInventoryRes] = await Promise.all([
                fetch(`/api/inquiries/${id}`),
                fetch('/api/settings'),
                fetch('/api/admin/inventory')
            ]);
            const orderData = await orderRes.json();
            const settingsData = await settingsRes.json();
            const invData = await activeInventoryRes.json();

            setOrder(orderData);
            setSettings(settingsData);
            setInventory(invData || []);
            setIsInvoiced(orderData.isInvoiced || false);

            // Initialize materials
            if (orderData.costing?.materials?.length > 0) {
                setMaterials(orderData.costing.materials);
            } else {
                setMaterials([]);
            }

            setPrintingCost(orderData.costing?.printingCost || 0);
            setDesigningCharge(orderData.billing?.designingCharge || 0);
            setShippingCharge(orderData.billing?.shippingCharge || 0);

        } catch (error) {
            toast.error('Failed to load order details');
        } finally {
            setIsLoading(false);
        }
    };

    // Calculation Logic
    const quantity = order?.quantity || 0;
    const sellingPrice = order?.estimatedTotal || 0;

    const materialCostPerCard = useMemo(() => {
        const qty = quantity || 1;
        const total = materials.reduce((sum, m) => sum + ((Number(m.quantityUsed) || 0) * (Number(m.costPerUnit) || 0)), 0);
        return total / qty;
    }, [materials, quantity]);

    const totalMaterialCost = materials.reduce((sum, m) => sum + ((Number(m.quantityUsed) || 0) * (Number(m.costPerUnit) || 0)), 0);
    const totalCost = totalMaterialCost + Number(printingCost);
    const profit = sellingPrice - totalCost;

    const totalBill = sellingPrice + Number(designingCharge) + Number(shippingCharge);

    const handleAddMaterial = () => {
        setMaterials([...materials, { name: 'Custom Material', quantityUsed: 1, costPerUnit: 0, usageType: 'manual', materialId: null }]);
    };

    const handleSelectInventoryItem = (index: number, materialId: string) => {
        if (!materialId) return;
        const selected = inventory.find(m => m._id === materialId);
        if (!selected) return;

        let qUsed = 1;
        if (selected.usageType === 'per_card') {
            qUsed = quantity;
        } else if (selected.usageType === 'ratio') {
            qUsed = Math.ceil(quantity * selected.usageValue);
        }

        const newMaterials = [...materials];
        newMaterials[index] = { 
            ...newMaterials[index], 
            materialId: selected._id,
            name: selected.name,
            usageType: selected.usageType,
            costPerUnit: selected.defaultPrice,
            quantityUsed: qUsed
        };
        setMaterials(newMaterials);
    };

    const handleUpdateMaterial = (index: number, updates: any) => {
        const newMaterials = [...materials];
        newMaterials[index] = { ...newMaterials[index], ...updates };
        setMaterials(newMaterials);
    };

    const handleRemoveMaterial = (index: number) => {
        setMaterials(materials.filter((_, i) => i !== index));
    };

    const saveDetails = async (markInvoiced = false) => {
        setIsSaving(true);
        try {
            const finalMaterials = materials.map(m => ({
                ...m,
                totalCost: (Number(m.quantityUsed) || 0) * (Number(m.costPerUnit) || 0)
            }));
            
            const payload: any = {
                id,
                costing: {
                    materials: finalMaterials,
                    printingCost,
                    totalMaterialCost,
                    totalCost,
                    profit
                },
                billing: {
                    designingCharge,
                    shippingCharge,
                    totalBill,
                    invoiceDate: new Date()
                }
            };

            if (markInvoiced) {
                payload.isInvoiced = true;
            }

            const res = await fetch('/api/inquiries', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast.success('Calculations saved');
                if (markInvoiced) setIsInvoiced(true);
            } else {
                toast.error('Failed to save');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setIsSaving(false);
        }
    };

    const generatePDF = async () => {
        // Save and mark invoiced first to deduct inventory
        await saveDetails(true);

        const doc = new jsPDF();
        
        // Header
        doc.setFillColor(243, 233, 250); // Light lavender
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setFontSize(24);
        doc.setTextColor(43, 43, 43); // Charcoal
        doc.text('ZUBIZO ART', 105, 20, { align: 'center' });
        
        doc.setFontSize(10);
        doc.text('PREMIUM INVITATION STATIONARY', 105, 30, { align: 'center' });

        // Invoice Title
        doc.setFontSize(18);
        doc.text('INVOICE', 20, 55);
        
        // Order Info
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        const skuId = order.sku || (order._id ? order._id.slice(-6).toUpperCase() : 'UNKNOWN');
        doc.text(`Order ID: ${skuId}`, 20, 65);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 70);

        // Customer Details
        doc.setTextColor(43, 43, 43);
        doc.setFont('helvetica', 'bold');
        doc.text('BILL TO:', 20, 85);
        doc.setFont('helvetica', 'normal');
        doc.text(String(order.customerName || 'Zubizo Client'), 20, 92);
        doc.text(`Phone: ${String(order.phone || 'N/A')}`, 20, 97);
        doc.text(`Address: ${String(order.address || 'India')}`, 20, 102);

        // Table
        const tableData = [
            ['Invitations', `${order.designName} (${quantity} units)`, `₹${sellingPrice}`],
            ['Design Charges', 'Professional layout & typography', `₹${designingCharge}`],
            ['Shipping Charges', 'Pan-India Delivery', `₹${shippingCharge}`]
        ];

        doc.autoTable({
            startY: 115,
            head: [['Item', 'Description', 'Amount']],
            body: [
                ['Invitations', `${order.designName || 'Custom Design'} (${quantity} units)`, `₹${sellingPrice}`],
                ['Design Charges', 'Professional layout & typography', `₹${designingCharge}`],
                ['Shipping Charges', 'Pan-India Delivery', `₹${shippingCharge}`]
            ],
            theme: 'striped',
            headStyles: { fillColor: [153, 110, 182] }, // Lavender
            columnStyles: { 2: { halign: 'right' } }
        });

        const finalY = (doc as any).lastAutoTable.finalY + 10;
        
        // Total
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Grand Total:', 140, finalY + 10);
        doc.text(`₹${totalBill}`, 190, finalY + 10, { align: 'right' });

        // Footer
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150, 150, 150);
        doc.text('Thank you for choosing Zubizo Art for your special day.', 105, 280, { align: 'center' });
        doc.text('zubizoart.com | +91 7639390868', 105, 285, { align: 'center' });

        doc.save(`invoice_${order.sku || 'order'}.pdf`);
        toast.success('Invoice Downloaded');
    };

    if (isLoading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-lavender" size={40} />
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Loading Order Finance...</p>
        </div>
    );

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-lavender transition-all">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-charcoal tracking-tight">Financial Overview</h1>
                    <p className="text-gray-500 mt-1 font-medium italic">Order: {order.sku} — {order.customerName}</p>
                    {isInvoiced && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1 mt-2">
                            <CheckCircle2 size={12} /> INVOICED & DEDUCTED
                        </span>
                    )}
                </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => saveDetails(false)} disabled={isSaving} className="bg-white border border-gray-200 text-charcoal px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:border-lavender/50 transition-all flex items-center gap-2">
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Data
                    </button>
                    <button onClick={generatePDF} className="bg-charcoal text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-charcoal/20 hover:bg-black transition-all flex items-center gap-2">
                        <Download size={18} />
                        Download Invoice
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Left Column: Calculator */}
                <div className="xl:col-span-2 space-y-10">
                    <section className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-10 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-lavender/10 text-lavender rounded-2xl flex items-center justify-center">
                                    <Calculator size={24} />
                                </div>
                                <h2 className="text-2xl font-black text-charcoal">Material Cost Calculator</h2>
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Profit Tracking</span>
                        </div>
                        
                        <div className="p-10 space-y-8">
                            <div className="grid grid-cols-1 gap-4">
                                {materials.map((m, idx) => (
                                    <div key={idx} className="flex flex-col md:flex-row items-center gap-4 p-4 bg-gray-50 rounded-[1.5rem] border border-transparent focus-within:border-lavender/20 transition-all group">
                                        <select
                                            className="w-full md:w-32 bg-white px-3 py-2 rounded-xl border border-gray-100 text-xs font-bold text-charcoal outline-none"
                                            value={m.materialId || ''}
                                            onChange={(e) => handleSelectInventoryItem(idx, e.target.value)}
                                        >
                                            <option value="">-- Manual --</option>
                                            {inventory.map((inv: any) => (
                                                <option key={inv._id} value={inv._id}>{inv.name} (₹{inv.defaultPrice})</option>
                                            ))}
                                        </select>
                                        
                                        <input 
                                            type="text" 
                                            value={m.name} 
                                            onChange={(e) => handleUpdateMaterial(idx, { name: e.target.value })}
                                            className="bg-transparent border-none outline-none font-bold text-charcoal flex-1 placeholder-gray-300 w-full" 
                                            placeholder="Material Name"
                                        />
                                        
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-gray-100">
                                                <span className="text-[10px] font-black text-gray-400">Qty</span>
                                                <input 
                                                    type="number" 
                                                    value={m.quantityUsed} 
                                                    onChange={(e) => handleUpdateMaterial(idx, { quantityUsed: parseFloat(e.target.value) || 0 })}
                                                    className="w-12 bg-transparent border-none outline-none font-black text-charcoal text-center" 
                                                />
                                            </div>
                                            <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-gray-100">
                                                <span className="text-[10px] font-black text-lavender">₹/U</span>
                                                <input 
                                                    type="number" 
                                                    value={m.costPerUnit} 
                                                    onChange={(e) => handleUpdateMaterial(idx, { costPerUnit: parseFloat(e.target.value) || 0 })}
                                                    className="w-12 bg-transparent border-none outline-none font-black text-charcoal text-right" 
                                                />
                                            </div>
                                            <div className="w-20 text-right font-black italic text-lavender tracking-tighter">
                                                ₹{((Number(m.quantityUsed) || 0) * (Number(m.costPerUnit) || 0)).toFixed(2)}
                                            </div>
                                            <button onClick={() => handleRemoveMaterial(idx)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all p-2">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={handleAddMaterial} className="flex items-center justify-center gap-2 p-5 border-2 border-dashed border-gray-100 rounded-[1.5rem] text-gray-400 hover:border-lavender/30 hover:text-lavender transition-all group">
                                    <Plus size={20} className="group-hover:scale-110 transition-transform" />
                                    <span className="font-black text-[10px] uppercase tracking-widest">Add Material</span>
                                </button>
                            </div>

                            <div className="pt-10 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="p-6 bg-lavender/5 rounded-[2rem] space-y-2">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Material / Card</p>
                                    <p className="text-3xl font-black text-lavender italic">₹{materialCostPerCard.toFixed(2)}</p>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-[2rem] space-y-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Manual Printing Cost</p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl font-black text-charcoal">₹</span>
                                        <input 
                                            type="number" 
                                            value={printingCost} 
                                            onChange={(e) => setPrintingCost(parseFloat(e.target.value) || 0)}
                                            className="w-full bg-white px-4 py-3 rounded-xl border border-gray-100 font-black text-charcoal outline-none focus:border-lavender"
                                        />
                                    </div>
                                </div>
                                <div className={cn(
                                    "p-6 rounded-[2rem] space-y-2 transition-all",
                                    profit >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                                )}>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Estimated Profit</p>
                                        {profit >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                    </div>
                                    <p className="text-3xl font-black italic">₹{profit.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Costing Breakdown (Mini Cards) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center"><Package size={24} /></div>
                                <div>
                                    <p className="font-black text-charcoal">Total Materials</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">For {quantity} units</p>
                                </div>
                            </div>
                            <p className="text-2xl font-black text-charcoal italic">₹{totalMaterialCost.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center"><Hash size={24} /></div>
                                <div>
                                    <p className="font-black text-charcoal">Total Cost</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Mat + Printing</p>
                                </div>
                            </div>
                            <p className="text-2xl font-black text-charcoal italic">₹{totalCost.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Invoice Generator */}
                <div className="space-y-10">
                    <section className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden h-full">
                        <div className="p-10 border-b border-gray-50 bg-gray-50/50 flex items-center gap-4">
                            <div className="w-12 h-12 bg-charcoal text-white rounded-2xl flex items-center justify-center">
                                <FileText size={24} />
                            </div>
                            <h2 className="text-2xl font-black text-charcoal">Invoice Generator</h2>
                        </div>

                        <div className="p-10 space-y-8">
                            {/* Auto-filled Info */}
                            <div className="space-y-5">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2 flex items-center gap-2">
                                    <User size={14} /> Client Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-gray-300 uppercase">Name</span>
                                        <p className="text-xs font-black text-charcoal">{order.customerName || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-gray-300 uppercase">Phone</span>
                                        <p className="text-xs font-black text-charcoal">{order.phone || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-gray-300 uppercase">Address</span>
                                    <p className="text-xs font-black text-charcoal flex items-center gap-1"><MapPin size={12} /> {order.address || 'India'}</p>
                                </div>
                            </div>

                            {/* Billing Inputs */}
                            <div className="space-y-6 pt-4">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2 flex items-center gap-2">
                                    <IndianRupee size={14} /> Billing Inputs
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-charcoal uppercase tracking-widest">Designing Charge</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-black text-xs">₹</span>
                                            <input 
                                                type="number" 
                                                value={designingCharge}
                                                onChange={(e) => setDesigningCharge(parseFloat(e.target.value) || 0)}
                                                className="w-full pl-8 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl font-black text-charcoal text-xs outline-none focus:bg-white focus:border-lavender"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-charcoal uppercase tracking-widest">Shipping Charge</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-black text-xs">₹</span>
                                            <input 
                                                type="number" 
                                                value={shippingCharge}
                                                onChange={(e) => setShippingCharge(parseFloat(e.target.value) || 0)}
                                                className="w-full pl-8 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl font-black text-charcoal text-xs outline-none focus:bg-white focus:border-lavender"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Final Bill Display */}
                            <div className="mt-10 p-10 bg-lavender rounded-[2.5rem] text-white shadow-2xl shadow-lavender/30 relative overflow-hidden group">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                                <div className="relative z-10 space-y-1">
                                    <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-70">Total Receivable Bill</p>
                                    <p className="text-5xl font-black tracking-tighter italic">₹{totalBill.toFixed(0)}</p>
                                </div>
                                <div className="mt-8 pt-8 border-t border-white/20 relative z-10 flex flex-col gap-3">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-80">
                                        <span>Items ({quantity} units)</span>
                                        <span>₹{sellingPrice}</span>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-80">
                                        <span>Extra Services</span>
                                        <span>₹{(Number(designingCharge) + Number(shippingCharge))}</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest text-center mt-6">
                                Designs & Shipping fees are excluded from calculator profit.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
