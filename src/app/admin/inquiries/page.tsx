'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/inquiries');
            const data = await res.json();
            setInquiries(data);
        } catch (error) {
            toast.error('Failed to load inquiries');
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch('/api/inquiries', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus }),
            });

            if (res.ok) {
                toast.success(`Status updated to ${newStatus}`);
                setInquiries(inquiries.map(inv => inv._id === id ? { ...inv, status: newStatus } : inv));
            }
        } catch (error) {
            toast.error('Update failed');
        }
    };

    const filteredInquiries = inquiries.filter(inv => {
        const matchesStatus = filter === 'All' || inv.status === filter;
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
            (inv.designName || '').toLowerCase().includes(searchLower) ||
            (inv.sku || '').toLowerCase().includes(searchLower) ||
            (inv.customerNote || '').toLowerCase().includes(searchLower) ||
            (inv.selectedPackage || '').toLowerCase().includes(searchLower);

        return matchesStatus && matchesSearch;
    });

    const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage);
    const paginatedInquiries = filteredInquiries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [filter, searchQuery]);

    const exportToCSV = () => {
        if (inquiries.length === 0) return;

        const headers = ["Date", "Design Name", "SKU", "Package", "Quantity", "Total Estimate", "Status", "Source"];
        const rows = inquiries.map(inv => [
            new Date(inv.createdAt).toLocaleString(),
            inv.designName || 'N/A',
            inv.sku || 'N/A',
            inv.selectedPackage || 'Standard',
            inv.quantity || 100,
            inv.estimatedTotal || 0,
            inv.status,
            inv.source || 'detail'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `zubizo_all_inquiries_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("CSV Exported successfully");
    };

    return (
        <div className="space-y-10 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-charcoal tracking-tight">Inquiry Logs</h1>
                    <p className="text-gray-500 mt-1 font-medium">Keep track of every customer interest and WhatsApp click.</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <div className="relative group sm:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-lavender transition-colors" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by SKU, Name, or Package..."
                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-lavender/10 focus:border-lavender outline-none transition-all shadow-sm"
                        />
                    </div>
                    <button
                        onClick={exportToCSV}
                        className="bg-white hover:bg-gray-50 text-charcoal px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest border border-gray-100 shadow-sm transition-all flex items-center gap-2"
                    >
                        <Download size={18} />
                        Export All
                    </button>
                </div>
            </div>

            {/* Status Filter Bar */}
            <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-gray-100 shadow-sm w-fit">
                {['All', 'New', 'Contacted', 'Closed'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={cn(
                            "px-6 py-2.5 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest",
                            filter === status
                                ? "bg-lavender text-white shadow-xl shadow-lavender/20"
                                : "text-gray-400 hover:text-charcoal"
                        )}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-8">
                {isLoading ? (
                    [...Array(3)].map((_, i) => <div key={i} className="h-48 bg-gray-50 animate-pulse rounded-[2.5rem]" />)
                ) : paginatedInquiries.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-16 text-center text-gray-400 border border-gray-100 shadow-sm">
                        <MessageSquare size={48} className="mx-auto mb-6 opacity-10" />
                        <p className="font-black text-xl text-charcoal/30 uppercase tracking-widest">No matching inquiries</p>
                        <button onClick={() => { setFilter('All'); setSearchQuery(''); }} className="mt-4 text-lavender font-black text-xs uppercase tracking-widest hover:underline">Clear all filters</button>
                    </div>
                ) : (
                    paginatedInquiries.map((inquiry, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={inquiry._id}
                            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group"
                        >
                            <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                                {/* Left Section: Design & Customer Header */}
                                <div className="lg:w-1/3 p-8 bg-gray-50/50">
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden shadow-sm">
                                                {inquiry.designId?.images?.[0] ? (
                                                    <img src={inquiry.designId.images[0]} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-200"><Package size={24} /></div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-charcoal tracking-tight line-clamp-1">{inquiry.designName}</h3>
                                                <p className="text-[10px] font-black text-lavender uppercase tracking-widest">{inquiry.sku}</p>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "w-2.5 h-2.5 rounded-full",
                                            inquiry.status === 'New' ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse" :
                                                inquiry.status === 'Contacted' ? "bg-amber-500" : "bg-green-500"
                                        )} />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                                            <span className="uppercase tracking-widest text-[9px] text-gray-400">Time</span>
                                            <span>{new Date(inquiry.createdAt).toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                                            <span className="uppercase tracking-widest text-[9px] text-gray-400">Inquired From</span>
                                            <span className="uppercase tracking-widest text-[#ae7fcb]">{inquiry.source || 'CATALOG'}</span>
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-4">Quick Status Update</label>
                                        <div className="flex items-center gap-3">
                                            {['New', 'Contacted', 'Closed'].map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => updateStatus(inquiry._id, s)}
                                                    className={cn(
                                                        "flex-1 py-3 rounded-xl border font-black text-[9px] uppercase tracking-widest transition-all",
                                                        inquiry.status === s
                                                            ? "bg-white border-lavender/30 text-lavender shadow-sm"
                                                            : "bg-white border-transparent text-gray-300 hover:text-gray-500"
                                                    )}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section: Configuration & Note */}
                                <div className="flex-1 p-8 flex flex-col justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-8 mb-8">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected Package</p>
                                                <p className="font-black text-charcoal">{inquiry.selectedPackage || 'Standard Edition'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity</p>
                                                <p className="font-black text-charcoal">{inquiry.quantity || 100} units</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Project Value</p>
                                                <p className="text-xl font-black text-lavender tracking-tight">₹{inquiry.estimatedTotal || 0}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <MessageSquare size={12} /> Inquiry Message
                                            </h4>
                                            <div className="p-5 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                <p className="text-sm font-medium text-gray-600 leading-relaxed italic">
                                                    "{inquiry.customerNote || 'Customer clicked WhatsApp directly without custom notes.'}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 text-xs font-black text-green-600 uppercase tracking-widest animate-pulse">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            Active Inquiry
                                        </div>
                                        <a
                                            href={`https://wa.me/${(inquiry.customerPhone || '9092981748').replace(/\D/g, '')}`}
                                            target="_blank"
                                            className="px-10 py-4 bg-charcoal hover:bg-black text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-charcoal/20 transition-all flex items-center gap-3"
                                        >
                                            Resume on WhatsApp
                                            <ExternalLink size={16} strokeWidth={3} />
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
                <div className="flex items-center justify-center gap-4">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="w-14 h-14 rounded-2xl border border-gray-100 bg-white flex items-center justify-center text-gray-300 hover:text-lavender transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex items-center gap-2">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={cn(
                                    "w-12 h-12 rounded-2xl font-black text-xs transition-all tracking-widest",
                                    currentPage === i + 1
                                        ? "bg-lavender text-white shadow-xl shadow-lavender/20 scale-110"
                                        : "bg-white text-gray-400 border border-gray-100 hover:border-lavender/30"
                                )}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="w-14 h-14 rounded-2xl border border-gray-100 bg-white flex items-center justify-center text-gray-300 hover:text-lavender transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            )}
        </div>
    );
}
