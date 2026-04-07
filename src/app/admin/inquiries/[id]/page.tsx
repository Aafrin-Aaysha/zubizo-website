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

    // 3-Stage Workflow State
    const [quotations, setQuotations] = useState<any[]>([]);
    const [activeQuoIndex, setActiveQuoIndex] = useState(0);
    const [interestedDesigns, setInterestedDesigns] = useState<any[]>([]);
    const [approxQuantity, setApproxQuantity] = useState(0);
    const [confirmedQuoId, setConfirmedQuoId] = useState<string | null>(null);
    const [manualOrderId, setManualOrderId] = useState<string>('');

    // Active Quotation State (Editable)
    const [quoName, setQuoName] = useState('');
    const [selectedDesign, setSelectedDesign] = useState<any>(null);
    const [quoQuantity, setQuoQuantity] = useState(0);
    const [materials, setMaterials] = useState<any[]>([]);
    const [printingCost, setPrintingCost] = useState<number>(0);
    const [designingCharge, setDesigningCharge] = useState<number>(0);
    const [shippingCharge, setShippingCharge] = useState<number>(0);
    const [languageCharge, setLanguageCharge] = useState<number>(0);
    const [customizationCharge, setCustomizationCharge] = useState<number>(0);
    const [discount, setDiscount] = useState<number>(0);
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('fixed');

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

            setQuotations(orderData.quotations || []);
            setInterestedDesigns(orderData.interestedDesigns || []);
            setApproxQuantity(orderData.approxQuantity || 0);
            setConfirmedQuoId(orderData.confirmedQuotationId || null);
            setManualOrderId(orderData.orderId || '');

            // Initialize Active Quotation (Switch to Confirmed if exists, else first)
            const confirmedIdx = (orderData.quotations || []).findIndex((q: any) => q.status === 'Confirmed');
            const initialIdx = confirmedIdx !== -1 ? confirmedIdx : 0;
            setActiveQuoIndex(initialIdx);
            
            if (orderData.quotations?.length > 0) {
                const q = orderData.quotations[initialIdx];
                loadQuotationIntoState(q);
            }

        } catch (error) {
            toast.error('Failed to load order details');
        } finally {
            setIsLoading(false);
        }
    };

    const loadQuotationIntoState = (q: any) => {
        setQuoName(q.name || 'Quotation');
        setSelectedDesign(q.design || null);
        setQuoQuantity(q.quantity || 0);
        setMaterials(q.costing?.materials || []);
        setPrintingCost(q.costing?.printingCost || 0);
        setDesigningCharge(q.billing?.designingCharge || 0);
        setShippingCharge(q.billing?.shippingCharge || 0);
        setLanguageCharge(q.billing?.languageCharge || 0);
        setCustomizationCharge(q.billing?.customizationCharge || 0);
        setDiscount(q.billing?.discount || 0);
        setDiscountType(q.billing?.discountType || 'fixed');
    };

    // Calculation Logic
    const quantity = quoQuantity || approxQuantity || 0;
    const sellingPrice = (selectedDesign?.price || order?.estimatedTotal) || 0; // Fallback to estimated if new quo
    
    const materialCostPerCard = useMemo(() => {
        const qty = quantity || 1;
        const total = materials.reduce((sum, m) => sum + ((Number(m.quantityUsed) || 0) * (Number(m.costPerUnit) || 0)), 0);
        return total / qty;
    }, [materials, quantity]);

    const totalMaterialCost = materials
        .filter(m => m.isSelected !== false)
        .reduce((sum, m) => sum + ((Number(m.quantityUsed) || 0) * (Number(m.costPerUnit) || 0)), 0);
        
    const totalCost = totalMaterialCost + Number(printingCost);
    
    // Billing Calculations
    const subtotal = (Number(quoQuantity) * Number(sellingPrice)) + Number(designingCharge) + Number(shippingCharge) + Number(languageCharge) + Number(customizationCharge);
    const calculatedDiscount = discountType === 'percentage' 
        ? (subtotal * (Number(discount) / 100)) 
        : Number(discount);
        
    const totalBill = subtotal - calculatedDiscount;
    const profit = totalBill - totalCost;

    const isLocked = confirmedQuoId === quotations[activeQuoIndex]?._id && !['Confirmed', 'NEW', 'New', 'Contacted', 'CONTACTED', 'FOLLOW_UP'].includes(order?.status);

    const handleSwitchQuotation = (idx: number) => {
        const q = quotations[idx];
        if (q) {
            setActiveQuoIndex(idx);
            loadQuotationIntoState(q);
        }
    };

    const handleAddQuotation = () => {
        const newQuo = {
            name: `Option ${quotations.length + 1}`,
            design: interestedDesigns[0] || { name: 'Custom Design', sku: 'CUSTOM' },
            quantity: approxQuantity || 100,
            costing: { materials: [], printingCost: 0 },
            billing: { designingCharge: 0, shippingCharge: 0 },
            status: 'Draft'
        };
        const updated = [...quotations, newQuo];
        setQuotations(updated);
        setActiveQuoIndex(updated.length - 1);
        loadQuotationIntoState(updated[updated.length - 1]);
    };

    const handleCloneQuotation = () => {
        const current = quotations[activeQuoIndex];
        const cloned = JSON.parse(JSON.stringify(current));
        cloned.name = `${cloned.name} (Copy)`;
        delete cloned._id;
        cloned.status = 'Draft';
        
        const updated = [...quotations, cloned];
        setQuotations(updated);
        setActiveQuoIndex(updated.length - 1);
        loadQuotationIntoState(updated[updated.length - 1]);
    };

    const handleConfirmQuotation = async () => {
        await saveDetails(false, true);
    };

    const handleAddMaterial = () => {
        setMaterials([...materials, { name: 'Custom Material', quantityUsed: 1, costPerUnit: 0, usageType: 'manual', materialId: null, isSelected: true }]);
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
            quantityUsed: qUsed,
            isSelected: true
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

    const saveDetails = async (markInvoiced = false, confirmQuo = false) => {
        setIsSaving(true);
        try {
            const finalMaterials = materials.map(m => ({
                ...m,
                totalCost: (Number(m.quantityUsed) || 0) * (Number(m.costPerUnit) || 0)
            }));
            
            const currentQuo = {
                name: quoName,
                design: selectedDesign,
                quantity: quoQuantity,
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
                    languageCharge,
                    customizationCharge,
                    discount,
                    discountType,
                    totalBill
                },
                status: confirmQuo ? 'Confirmed' : (quotations[activeQuoIndex]?.status || 'Draft')
            };

            const updatedQuotations = [...quotations];
            updatedQuotations[activeQuoIndex] = { ...updatedQuotations[activeQuoIndex], ...currentQuo };

            const payload: any = {
                id,
                quotations: updatedQuotations,
                orderId: manualOrderId
            };

            if (confirmQuo) {
                // Determine ID if existing or use index temporarily (backend should handle)
                const targetQuoId = quotations[activeQuoIndex]._id;
                if (targetQuoId) {
                    payload.confirmedQuotationId = targetQuoId;
                    payload.status = 'Confirmed';
                    setConfirmedQuoId(targetQuoId);
                } else {
                    // If it's a new quo without ID, we need the backend to return it or handle by name/index
                    // For now, we assume simple save first, or backend identifies by array position
                }
            }

            if (markInvoiced) {
                payload.isInvoiced = true;
            }

            const res = await fetch('/api/inquiries', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const updatedData = await res.json();
                setOrder(updatedData);
                setQuotations(updatedData.quotations);
                setConfirmedQuoId(updatedData.confirmedQuotationId);
                toast.success(confirmQuo ? 'Quotation Confirmed!' : 'Details saved');
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
        const doc = new jsPDF();
        doc.setFillColor(243, 233, 250);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setFontSize(24);
        doc.setTextColor(43, 43, 43);
        doc.text('ZUBIZO ART', 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text('PREMIUM INVITATION STATIONARY', 105, 30, { align: 'center' });
        doc.setFontSize(18);
        doc.text('INVOICE / QUOTATION', 20, 55);
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Doc ID: ${manualOrderId || id.toString().slice(-6).toUpperCase()}`, 20, 65);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 70);
        doc.setTextColor(43, 43, 43);
        doc.setFont('helvetica', 'bold');
        doc.text('BILL TO:', 20, 85);
        doc.setFont('helvetica', 'normal');
        doc.text(String(order.customerName || 'Client'), 20, 92);
        doc.text(`Phone: ${String(order.phone || 'N/A')}`, 20, 97);

        doc.autoTable({
            startY: 115,
            head: [['Item', 'Description', 'Amount']],
            body: [
                ['Invitations', `${selectedDesign?.name || 'Custom'} (${quoQuantity} units)`, `₹${(quoQuantity * (selectedDesign?.price || 0))}`],
                ['Design Charges', 'Professional layout', `₹${designingCharge}`],
                ['Shipping Charges', 'Delivery', `₹${shippingCharge}`],
                ['Misc Charges', 'Language/Customization', `₹${(Number(languageCharge) + Number(customizationCharge))}`],
                ...(discount > 0 ? [['Discount', `${discountType === 'percentage' ? discount + '%' : 'Bulk Discount'}`, `-₹${calculatedDiscount.toFixed(0)}`]] : [])
            ],
            theme: 'striped',
            headStyles: { fillColor: [153, 110, 182] },
            columnStyles: { 2: { halign: 'right' } }
        });

        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Grand Total:', 140, finalY + 10);
        doc.text(`₹${totalBill.toFixed(0)}`, 190, finalY + 10, { align: 'right' });
        doc.save(`invoice_${manualOrderId || 'order'}.pdf`);
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
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-charcoal tracking-tight">Order Management</h1>
                            <span className={cn(
                                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                confirmedQuoId ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                            )}>
                                {confirmedQuoId ? 'Order Finalized' : 'Quotation Stage'}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                             <input 
                                type="text"
                                value={manualOrderId}
                                onChange={(e) => setManualOrderId(e.target.value)}
                                className="bg-lavender/5 border border-lavender/10 px-3 py-1 rounded-lg text-xs font-black text-charcoal outline-none focus:border-lavender"
                                placeholder="Manual Order ID"
                             />
                             <p className="text-gray-400 text-xs font-medium">— {order.customerName}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    {!confirmedQuoId && (
                        <button 
                            onClick={handleConfirmQuotation} 
                            disabled={isSaving}
                            className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center gap-2"
                        >
                            <CheckCircle2 size={18} /> Confirm This Option
                        </button>
                    )}
                    <button onClick={() => saveDetails(false)} disabled={isSaving} className="bg-white border border-gray-200 text-charcoal px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:border-lavender/50 transition-all flex items-center gap-2">
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save Data
                    </button>
                    <button onClick={generatePDF} className="bg-charcoal text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
                        <Download size={18} /> Export
                    </button>
                </div>
            </div>

            {/* Quotation Selection Tabs */}
            <div className="flex flex-wrap items-center gap-3 p-2 bg-gray-100 rounded-[2rem] w-fit">
                {quotations.map((q, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleSwitchQuotation(idx)}
                        className={cn(
                            "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                            activeQuoIndex === idx ? "bg-white text-charcoal shadow-md" : "text-gray-400 hover:text-charcoal"
                        )}
                    >
                        {q.name} {q.status === 'Confirmed' && <CheckCircle2 size={12} className="text-emerald-500" />}
                    </button>
                ))}
                <button onClick={handleAddQuotation} className="px-4 py-3 rounded-2xl text-[10px] font-black uppercase text-lavender hover:bg-white transition-all">+ New Option</button>
                <button onClick={handleCloneQuotation} className="px-4 py-3 rounded-2xl text-[10px] font-black uppercase text-gray-500 hover:bg-white transition-all">Clone Active</button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 space-y-10">
                    <section className={cn("bg-white rounded-[3rem] border shadow-sm transition-all overflow-hidden", isLocked ? "border-emerald-200 ring-4 ring-emerald-50" : "border-gray-100")}>
                        <div className="p-10 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <input 
                                    value={quoName}
                                    onChange={(e) => setQuoName(e.target.value)}
                                    className="text-2xl font-black text-charcoal bg-transparent border-none outline-none focus:ring-2 focus:ring-lavender/10 rounded-lg px-2"
                                    placeholder="Quotation Name"
                                    disabled={isLocked}
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pricing Calculator</span>
                                {isLocked && <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-black text-[9px] uppercase flex items-center gap-1"><CheckCircle2 size={10} /> Confirmed & Locked</span>}
                            </div>
                        </div>
                        
                        <div className={cn("p-10 space-y-8", isLocked && "pointer-events-none opacity-80")}>
                            {/* Materials */}
                            <div className="grid grid-cols-1 gap-4">
                                {materials.map((m, idx) => (
                                    <div key={idx} className="flex flex-col md:flex-row items-center gap-4 p-4 bg-gray-50 rounded-[1.5rem] border border-transparent hover:border-lavender/20 transition-all">
                                        <input type="checkbox" checked={m.isSelected !== false} onChange={(e) => handleUpdateMaterial(idx, { isSelected: e.target.checked })} className="w-5 h-5 rounded-md border-2 border-gray-200 checked:bg-lavender" />
                                        <select
                                            className="w-full md:w-32 bg-white px-3 py-2 rounded-xl text-xs font-bold border border-gray-100 outline-none"
                                            value={m.materialId || ''}
                                            onChange={(e) => handleSelectInventoryItem(idx, e.target.value)}
                                        >
                                            <option value="">-- Manual --</option>
                                            {inventory.map((inv: any) => <option key={inv._id} value={inv._id}>{inv.name}</option>)}
                                        </select>
                                        <input value={m.name} onChange={(e) => handleUpdateMaterial(idx, { name: e.target.value })} className="bg-transparent border-none outline-none font-bold text-charcoal flex-1 placeholder-gray-300" placeholder="Material Name" />
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-gray-100">
                                                <span className="text-[10px] font-black text-gray-400">Qty</span>
                                                <input type="number" value={m.quantityUsed} onChange={(e) => handleUpdateMaterial(idx, { quantityUsed: parseFloat(e.target.value) || 0 })} className="w-12 bg-transparent border-none outline-none font-black text-charcoal text-center" />
                                            </div>
                                            <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-gray-100">
                                                <span className="text-[10px] font-black text-lavender">₹/U</span>
                                                <input type="number" value={m.costPerUnit} onChange={(e) => handleUpdateMaterial(idx, { costPerUnit: parseFloat(e.target.value) || 0 })} className="w-12 bg-transparent border-none outline-none font-black text-charcoal text-right" />
                                            </div>
                                            <button onClick={() => handleRemoveMaterial(idx)} className="text-gray-300 hover:text-red-500 p-2 transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={handleAddMaterial} className="p-5 border-2 border-dashed border-gray-100 rounded-[1.5rem] text-gray-400 hover:border-lavender/30 hover:text-lavender transition-all font-black text-[10px] uppercase tracking-widest">+ Add custom cost row</button>
                            </div>

                            <div className="pt-10 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="p-6 bg-lavender/5 rounded-[2rem]"><p className="text-[10px] font-black text-gray-400 uppercase mb-2">Cost / Card</p><p className="text-2xl font-black text-lavender italic">₹{materialCostPerCard.toFixed(2)}</p></div>
                                <div className="p-6 bg-gray-50 rounded-[2rem]"><p className="text-[10px] font-black text-gray-400 uppercase mb-2">Printing Cost</p><input type="number" value={printingCost} onChange={(e) => setPrintingCost(parseFloat(e.target.value) || 0)} className="w-full bg-transparent font-black outline-none border-b border-dashed border-gray-200" /></div>
                                <div className="p-6 bg-gray-50 rounded-[2rem]"><p className="text-[10px] font-black text-gray-400 uppercase mb-2">Units</p><input type="number" value={quoQuantity} onChange={(e) => setQuoQuantity(parseFloat(e.target.value) || 0)} className="w-full bg-transparent font-black outline-none border-b border-dashed border-gray-200" /></div>
                                <div className={cn("p-6 rounded-[2rem] transition-all", profit >= 0 ? "bg-emerald-50 text-emerald-700 shadow-lg shadow-emerald-500/10" : "bg-red-50 text-red-700 shadow-lg shadow-red-500/10")}><p className="text-[10px] font-black uppercase mb-1 flex items-center justify-between">Net Profit {profit >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}</p><p className="text-3xl font-black italic tracking-tighter">₹{profit.toFixed(0)}</p></div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="space-y-10">
                    <section className="bg-white rounded-[3rem] border border-gray-100 p-10 h-full shadow-sm overflow-hidden">
                        <h2 className="text-2xl font-black text-charcoal mb-8 tracking-tight">Billing Sidebar</h2>
                        <div className={cn("space-y-6", isLocked && "pointer-events-none opacity-80")}>
                            <div className="grid grid-cols-1 gap-6">
                                <div className="bg-gray-50 p-6 rounded-[2rem] transition-all hover:bg-white border border-transparent hover:border-gray-100">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Base Selling Price / Card</label>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl font-black text-charcoal opacity-20 italic">₹</span>
                                        <input type="number" value={sellingPrice} onChange={(e) => setSelectedDesign({ ...selectedDesign, price: parseFloat(e.target.value) || 0 })} className="w-full bg-transparent text-2xl font-black outline-none italic tracking-tighter" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Designing</label><input type="number" value={designingCharge} onChange={(e) => setDesigningCharge(parseFloat(e.target.value) || 0)} className="w-full bg-gray-50 p-4 rounded-2xl font-black text-xs outline-none" /></div>
                                    <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Shipping</label><input type="number" value={shippingCharge} onChange={(e) => setShippingCharge(parseFloat(e.target.value) || 0)} className="w-full bg-gray-50 p-4 rounded-2xl font-black text-xs outline-none" /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Languages</label><input type="number" value={languageCharge} onChange={(e) => setLanguageCharge(parseFloat(e.target.value) || 0)} className="w-full bg-gray-50 p-4 rounded-2xl font-black text-x outline-none text-xs" /></div>
                                    <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Custom Fee</label><input type="number" value={customizationCharge} onChange={(e) => setCustomizationCharge(parseFloat(e.target.value) || 0)} className="w-full bg-gray-50 p-4 rounded-2xl font-black text-xs outline-none" /></div>
                                </div>
                            </div>

                            <div className="p-10 bg-charcoal rounded-[3rem] text-white space-y-6 shadow-2xl shadow-charcoal/30 relative group overflow-hidden transition-all hover:-translate-y-1">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full" />
                                <div className="relative z-10">
                                    <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-50 text-center mb-2">Final Quotation Value</p>
                                    <p className="text-5xl font-black text-center italic tracking-tighter">₹{totalBill.toFixed(0)}</p>
                                </div>
                                <div className="pt-8 border-t border-white/10 space-y-3 relative z-10">
                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest opacity-60"><span>Items total</span><span>₹{(Number(quoQuantity) * Number(sellingPrice))}</span></div>
                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest opacity-60"><span>Total extras</span><span>₹{(Number(designingCharge) + Number(shippingCharge) + Number(languageCharge) + Number(customizationCharge))}</span></div>
                                    {discount > 0 && <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-emerald-400 italic"><span>Discount</span><span>-₹{calculatedDiscount.toFixed(0)}</span></div>}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
