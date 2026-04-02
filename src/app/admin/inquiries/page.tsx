'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    Search,
    MessageSquare,
    User,
    Phone,
    Calendar,
    CheckCircle2,
    Clock,
    XCircle,
    Download,
    FileText,
    ExternalLink,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Tag,
    Share2,
    ShoppingBag,
    Package
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function InquiriesPage() {
    const [inquiries, setInquiries] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<'inquiry' | 'order'>('inquiry');
    const itemsPerPage = 15;

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const [invRes, empRes] = await Promise.all([
                fetch('/api/inquiries'),
                fetch('/api/admin/employees')
            ]);
            const invData = await invRes.json();
            const empData = await empRes.json();
            setInquiries(Array.isArray(invData) ? invData : []);
            setEmployees(Array.isArray(empData) ? empData : []);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const updateInquiry = async (id: string, updates: any) => {
        try {
            const res = await fetch('/api/inquiries', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...updates }),
            });

            if (res.ok) {
                const updated = await res.json();
                toast.success('Updated successfully');
                setInquiries(inquiries.map(inv => inv._id === id ? updated : inv));
            } else {
                const err = await res.json();
                toast.error(err.message || 'Update failed');
            }
        } catch (error) {
            toast.error('Something went wrong');
        }
    };

    const filteredInquiries = inquiries.filter(inv => {
        // Status filter logic
        let matchesStatus = filter === 'All' || inv.status === filter;
        
        // Search logic
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
            (inv.designName || '').toLowerCase().includes(searchLower) ||
            (inv.customerName || '').toLowerCase().includes(searchLower) ||
            (inv.sku || '').toLowerCase().includes(searchLower);

        return matchesStatus && matchesSearch;
    });

    const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage);
    const paginatedInquiries = filteredInquiries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [filter, searchQuery, viewMode]);

    const exportToCSV = () => {
        if (inquiries.length === 0) return;
        const headers = ["Date", "Customer", "Design", "SKU", "Status", "Manager", "Assigned To"];
        const rows = inquiries.map(inv => [
            new Date(inv.createdAt).toLocaleString(),
            inv.customerName || 'N/A',
            inv.designName || 'N/A',
            inv.sku || 'N/A',
            inv.status,
            inv.assignedAdmin || 'N/A',
            inv.assignedTo?.name || 'Unassigned'
        ]);
        const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `zubizo_orders_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-charcoal tracking-tight">
                        {viewMode === 'inquiry' ? 'Inquiry Logs' : 'Order Management'}
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">
                        {viewMode === 'inquiry' ? 'Capture leads and customer interests.' : 'Track production and team assignments.'}
                    </p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <div className="relative group sm:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-lavender transition-colors" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by Name, SKU..."
                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-lavender/10 focus:border-lavender outline-none transition-all shadow-sm"
                        />
                    </div>
                    <button onClick={exportToCSV} className="bg-white hover:bg-gray-50 text-charcoal px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest border border-gray-100 shadow-sm transition-all flex items-center gap-2">
                        <Download size={18} /> Export
                    </button>
                </div>
            </div>

            {/* Mode & Status Filter Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-gray-100 shadow-sm w-fit overflow-x-auto max-w-full">
                    {['All', 'New', 'Contacted', 'Confirmed', 'Designing', 'Design Confirmed', 'Printing', 'Delivered', 'Completed'].filter(s => {
                        if (viewMode === 'inquiry') return ['All', 'New', 'Contacted', 'Closed'].includes(s);
                        return ['All', 'Confirmed', 'Designing', 'Design Confirmed', 'Printing', 'Delivered', 'Completed'].includes(s);
                    }).map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={cn(
                                "px-5 py-2.5 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest whitespace-nowrap",
                                filter === status ? "bg-lavender text-white shadow-xl shadow-lavender/20" : "text-gray-400 hover:text-charcoal"
                            )}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div className="bg-gray-100 p-1.5 rounded-2xl flex items-center gap-1 shrink-0">
                    <button
                        onClick={() => { setViewMode('inquiry'); setFilter('All'); }}
                        className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", viewMode === 'inquiry' ? "bg-white text-charcoal shadow-sm" : "text-gray-400")}
                    >
                        Leads
                    </button>
                    <button
                        onClick={() => { setViewMode('order'); setFilter('All'); }}
                        className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", viewMode === 'order' ? "bg-white text-charcoal shadow-sm" : "text-gray-400")}
                    >
                        Orders
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-8">
                {isLoading ? (
                    [...Array(3)].map((_, i) => <div key={i} className="h-48 bg-gray-50 animate-pulse rounded-[2.5rem]" />)
                ) : paginatedInquiries.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-16 text-center text-gray-400 border border-gray-100 shadow-sm">
                        <MessageSquare size={48} className="mx-auto mb-6 opacity-10" />
                        <p className="font-black text-xl text-charcoal/30 uppercase tracking-widest">No matching activities</p>
                    </div>
                ) : (
                    paginatedInquiries.map((inquiry, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={inquiry._id}
                            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden group"
                        >
                            <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                                {/* Left Section: Info */}
                                <div className="lg:w-80 p-8 bg-gray-50/50 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-16 h-16 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm shrink-0">
                                                {inquiry.designId?.images?.[0] ? (
                                                    <img src={inquiry.designId.images[0]} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-200"><Package size={24} /></div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-charcoal line-clamp-1">{inquiry.designName}</h3>
                                                <p className="text-[10px] font-black text-lavender uppercase tracking-widest">{inquiry.sku}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                <span>Status</span>
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-lg",
                                                    inquiry.status === 'New' ? "bg-blue-50 text-blue-500" :
                                                    inquiry.status === 'Confirmed' ? "bg-green-50 text-green-500" : "bg-gray-100 text-gray-500"
                                                )}>{inquiry.status}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                <span>Customer</span>
                                                <span className="text-charcoal">{inquiry.customerName || 'Zubizo Client'}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                <span>Value</span>
                                                <span className="text-lavender">₹{inquiry.estimatedTotal}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-8 pt-8 border-t border-gray-100">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 font-bold uppercase transition-all">Quick Actions</p>
                                        <div className="flex gap-2">
                                            {viewMode === 'inquiry' ? (
                                                ['New', 'Contacted', 'Confirmed'].map(s => (
                                                    <button key={s} onClick={() => updateInquiry(inquiry._id, { status: s })} className={cn("flex-1 py-2 rounded-lg text-[9px] font-black transition-all", inquiry.status === s ? "bg-lavender text-white" : "bg-white text-gray-400 border border-gray-100")}>{s}</button>
                                                ))
                                            ) : (
                                                <div className="flex flex-col gap-2 w-full">
                                                    <Link 
                                                        href={`/admin/inquiries/${inquiry._id}`}
                                                        className="w-full py-2 bg-lavender/10 text-lavender rounded-lg text-[9px] font-black uppercase tracking-widest text-center border border-lavender/10 hover:bg-lavender hover:text-white transition-all flex items-center justify-center gap-2"
                                                    >
                                                        Details & Billing <FileText size={12} />
                                                    </Link>
                                                    <button onClick={() => updateInquiry(inquiry._id, { status: 'Completed' })} className="w-full py-2 bg-charcoal text-white rounded-lg text-[9px] font-black uppercase tracking-widest">Complete Order</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section: Production Details */}
                                <div className="flex-1 p-8 flex flex-col justify-between">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Package & Qty</p>
                                            <p className="font-black text-charcoal">{inquiry.selectedPackage || 'Standard'} @ {inquiry.quantity} Units</p>
                                        </div>
                                         {viewMode === 'order' && (
                                            <>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned Designer</p>
                                                    <select 
                                                        value={inquiry.assignedTo?._id || ''} 
                                                        onChange={(e) => updateInquiry(inquiry._id, { assignedTo: e.target.value, status: 'Designing' })}
                                                        className="w-full bg-gray-50 p-2 rounded-lg text-xs font-black outline-none border border-transparent focus:border-lavender/30"
                                                    >
                                                        <option value="">Unassigned</option>
                                                        {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Deadline</p>
                                                    <div className="flex items-center gap-2">
                                                        <input 
                                                            type="date" 
                                                            value={inquiry.deliveryDeadline ? new Date(inquiry.deliveryDeadline).toISOString().split('T')[0] : ''} 
                                                            onChange={(e) => updateInquiry(inquiry._id, { deliveryDeadline: e.target.value })}
                                                            className="text-xs font-black bg-lavender/5 px-2 py-1 rounded"
                                                        />
                                                        <input type="checkbox" checked={inquiry.isFixedDate} onChange={e => updateInquiry(inquiry._id, { isFixedDate: e.target.checked })} className="accent-lavender" />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {viewMode === 'order' ? (
                                        <div className="mt-4">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Production Status</p>
                                            <div className="flex items-center gap-1 overflow-x-auto pb-2">
                                                {['Confirmed', 'Designing', 'Design Confirmed', 'Printing', 'Delivered', 'Completed'].map((s, idx, arr) => {
                                                    const isCurrent = inquiry.status === s;
                                                    const isPast = arr.indexOf(inquiry.status) >= idx;
                                                    return (
                                                        <React.Fragment key={s}>
                                                            <button 
                                                                onClick={() => updateInquiry(inquiry._id, { status: s })}
                                                                className={cn(
                                                                    "px-3 py-2 rounded-lg text-[8px] font-black uppercase whitespace-nowrap transition-all",
                                                                    isCurrent ? "bg-lavender text-white scale-110 shadow-lg" : 
                                                                    isPast ? "bg-lavender/20 text-lavender" : "bg-gray-100 text-gray-300 hover:bg-gray-200"
                                                                )}
                                                            >
                                                                {s}
                                                            </button>
                                                            {idx < arr.length - 1 && <div className={cn("min-w-[10px] h-0.5", isPast ? "bg-lavender/20" : "bg-gray-100")} />}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-6 bg-lavender/5 rounded-[2rem] border border-dashed border-lavender/20">
                                            <p className="text-sm font-medium text-charcoal/70 leading-relaxed italic">
                                                "{inquiry.customerNote || 'No custom notes provided by user.'}"
                                            </p>
                                        </div>
                                    )}

                                    <div className="mt-8 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                {new Date(inquiry.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <a
                                            href={`https://wa.me/${(inquiry.phone || '9092981748').replace(/\D/g, '')}`}
                                            target="_blank"
                                            className="px-8 py-3 bg-charcoal text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2"
                                        >
                                            WhatsApp <ExternalLink size={14} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-300 hover:text-lavender disabled:opacity-30"><ChevronLeft size={20} /></button>
                    {/* Simplified Pagination */}
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Page {currentPage} of {totalPages}</span>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-300 hover:text-lavender disabled:opacity-30"><ChevronRight size={20} /></button>
                </div>
            )}
        </div>
    );
}
