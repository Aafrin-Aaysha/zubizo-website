'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    Search,
    MessageSquare,
    Download,
    FileText,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    Package,
    Users,
    TrendingUp,
    RefreshCcw,
    Globe2,
    Star,
    Flame,
    Calendar as CalendarIcon,
    Wallet
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const HIGH_VALUE_THRESHOLD = 10000;
const HIGH_QUANTITY_THRESHOLD = 100;

export default function InquiriesPage() {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState('All');
    const [sourceFilter, setSourceFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('All Time');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<'inquiry' | 'order'>('inquiry');
    const itemsPerPage = 15;

    const { data: inquiries = [], isLoading: inquiriesLoading } = useQuery({
        queryKey: ['inquiries'],
        queryFn: async () => {
            const res = await fetch('/api/inquiries');
            if (!res.ok) throw new Error('Failed to fetch inquiries');
            return res.json();
        }
    });

    const { data: employees = [] } = useQuery({
        queryKey: ['employees'],
        queryFn: async () => {
            const res = await fetch('/api/admin/employees');
            if (!res.ok) return [];
            return res.json();
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, updates }: { id: string, updates: any }) => {
            const res = await fetch('/api/inquiries', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...updates }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Update failed');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inquiries'] });
            toast.success('Updated successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Something went wrong');
        }
    });

    const updateInquiry = (id: string, updates: any) => {
        updateMutation.mutate({ id, updates });
    };

    const handleWhatsApp = (inquiry: any) => {
        // Auto status logic if strictly NEW
        if (inquiry.status === 'New' || inquiry.status === 'NEW') {
            updateInquiry(inquiry._id, { status: 'CONTACTED' });
        }
        const cleanNumber = (inquiry.phone || '9092981748').replace(/\D/g, '');
        window.open(`https://wa.me/${cleanNumber}`, '_blank');
    };

    const setFollowUp = (id: string, days: number) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        // Reset time to start of day for comparison
        d.setHours(0, 0, 0, 0);
        updateInquiry(id, { followUpDate: d.toISOString() });
    };

    const handleDateUpdate = (id: string, val: string) => {
        if (!val) {
            updateInquiry(id, { followUpDate: null });
        } else {
            const d = new Date(val);
            d.setHours(0, 0, 0, 0);
            updateInquiry(id, { followUpDate: d.toISOString() });
        }
    };

    const phoneCounts = useMemo(() => {
        return inquiries.reduce((acc: any, inv: any) => {
            if (inv.phone) {
                acc[inv.phone] = (acc[inv.phone] || 0) + 1;
            }
            return acc;
        }, {});
    }, [inquiries]);

    const dashboardMetrics = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Filter inquiries into Leads vs Orders for accurate metrics
        const leads = inquiries.filter((i: any) => ['NEW', 'CONTACTED', 'FOLLOW_UP', 'CLOSED'].includes(i.status?.toUpperCase()) || i.status === 'New' || i.status === 'Contacted');
        const orders = inquiries.filter((i: any) => !['NEW', 'CONTACTED', 'FOLLOW_UP', 'CLOSED'].includes(i.status?.toUpperCase()) && i.status !== 'New' && i.status !== 'Contacted');

        const currentSet = viewMode === 'inquiry' ? leads : orders;

        return {
            total: currentSet.length,
            newToday: currentSet.filter((i: any) => new Date(i.createdAt).getTime() >= today.getTime()).length,
            convertedCount: inquiries.filter((i: any) => !['NEW', 'CONTACTED', 'FOLLOW_UP'].includes(i.status?.toUpperCase()) && i.status !== 'New' && i.status !== 'Contacted').length,
            repeats: Object.values(phoneCounts).filter((count: any) => count > 1).length
        };
    }, [inquiries, phoneCounts, viewMode]);

    const filteredInquiries = useMemo(() => {
        let result = inquiries.filter((inv: any) => {
            // Force separate Leads vs Orders based on viewMode
            const statusUpper = inv.status?.toUpperCase() || '';
            const isLeadStatus = ['NEW', 'CONTACTED', 'FOLLOW_UP', 'CLOSED'].includes(statusUpper) || inv.status === 'New' || inv.status === 'Contacted';
            if (viewMode === 'inquiry' && !isLeadStatus) return false;
            if (viewMode === 'order' && isLeadStatus) return false;

            let matchesStatus = filter === 'All' || inv.status === filter || inv.status?.toUpperCase() === filter.toUpperCase();
            
            let matchesSource = sourceFilter === 'All' || inv.source === sourceFilter;
            
            let matchesDate = true;
            const invDate = new Date(inv.createdAt);
            if (dateFilter === 'Last 7 Days') {
                const limit = new Date();
                limit.setDate(limit.getDate() - 7);
                matchesDate = invDate >= limit;
            } else if (dateFilter === 'Last 30 Days') {
                const limit = new Date();
                limit.setDate(limit.getDate() - 30);
                matchesDate = invDate >= limit;
            }

            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                (inv.designName || '').toLowerCase().includes(searchLower) ||
                (inv.customerName || '').toLowerCase().includes(searchLower) ||
                (inv.sku || '').toLowerCase().includes(searchLower) ||
                (inv.phone || '').toLowerCase().includes(searchLower);

            return matchesStatus && matchesSearch && matchesSource && matchesDate;
        });

        // Sorting: Overdue > Due Today > Future > Latest ID
        result.sort((a: any, b: any) => {
            const todayTime = new Date().setHours(0,0,0,0);
            const getPriority = (inv: any) => {
                if (!inv.followUpDate) return 0;
                const ft = new Date(inv.followUpDate).getTime();
                if (ft < todayTime) return 2; // Overdue
                if (ft === todayTime) return 1; // Due Today
                return -1; // Future
            };

            const pA = getPriority(a);
            const pB = getPriority(b);

            if (pA !== pB) return pB - pA; // highest priority first
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // newest first
        });

        return result;
    }, [inquiries, filter, sourceFilter, dateFilter, searchQuery, viewMode, phoneCounts]);

    const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage);
    const paginatedInquiries = filteredInquiries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [filter, sourceFilter, dateFilter, searchQuery, viewMode]);

    const exportToCSV = () => {
        if (filteredInquiries.length === 0) return;
        const headers = ["Date", "Customer", "Phone", "Design", "SKU", "Source", "Status", "Total Value"];
        const rows = filteredInquiries.map((inv: any) => [
            new Date(inv.createdAt).toLocaleString(),
            inv.customerName || 'N/A',
            inv.phone || 'N/A',
            inv.designName || 'N/A',
            inv.sku || 'N/A',
            inv.source || 'N/A',
            inv.status,
            inv.confirmedQuotationId ? (inv.estimatedTotal || 0) : 'TBD',
        ]);
        const csvContent = [headers.join(','), ...rows.map((row: any) => row.map((cell: any) => `"${cell}"`).join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `zubizo_leads_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-black text-charcoal tracking-tight">
                        {viewMode === 'inquiry' ? 'Lead Management CRM' : 'Order Management'}
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">
                        {viewMode === 'inquiry' ? 'Track interactions, prioritize follow-ups, and monitor conversions.' : 'Track production and team assignments.'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={exportToCSV} className="bg-white hover:bg-gray-50 text-charcoal px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border border-gray-100 shadow-sm transition-all flex items-center gap-2">
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            {/* Dashboard Analytics (Only for Inquiry Mode) */}
            {viewMode === 'inquiry' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { title: viewMode === 'inquiry' ? 'Total Leads' : 'Total Orders', val: dashboardMetrics.total, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
                        { title: viewMode === 'inquiry' ? 'New Leads Today' : 'New Orders Today', val: dashboardMetrics.newToday, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
                        { title: 'System-wide Conversions', val: dashboardMetrics.convertedCount, icon: Package, color: 'text-lavender', bg: 'bg-lavender/10' },
                        { title: 'Repeat Customers', val: dashboardMetrics.repeats, icon: RefreshCcw, color: 'text-orange-500', bg: 'bg-orange-50' },
                    ].map((metric, i) => (
                        <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-6">
                            <div className={cn("w-14 h-14 flex items-center justify-center rounded-2xl shrink-0", metric.bg, metric.color)}>
                                <metric.icon size={24} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{metric.title}</h4>
                                <p className="text-3xl font-black text-charcoal">{metric.val}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Controls Bar */}
            <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
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

                    <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-100 overflow-x-auto">
                        {['All', 'New', 'Contacted', 'FOLLOW_UP', 'Confirmed', 'Designing', 'Delivered', 'Completed'].filter(s => {
                            if (viewMode === 'inquiry') return ['All', 'New', 'Contacted', 'FOLLOW_UP', 'Confirmed'].includes(s);
                            return ['All', 'Confirmed', 'Designing', 'Delivered', 'Completed'].includes(s);
                        }).map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={cn(
                                    "px-4 py-2 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest whitespace-nowrap",
                                    filter === status ? "bg-lavender text-white shadow-md shadow-lavender/20" : "text-gray-400 hover:text-charcoal"
                                )}
                            >
                                {status.replace('_', '-')}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 w-full xl:w-auto">
                    {viewMode === 'inquiry' && (
                        <>
                            <select
                                value={sourceFilter}
                                onChange={(e) => setSourceFilter(e.target.value)}
                                className="bg-gray-50 border border-gray-100 text-charcoal text-xs font-bold rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-lavender cursor-pointer"
                            >
                                <option value="All">All Sources</option>
                                <option value="design_page">Design Page</option>
                                <option value="contact_page">Contact Page</option>
                                <option value="detail">Detail view</option>
                            </select>

                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="bg-gray-50 border border-gray-100 text-charcoal text-xs font-bold rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-lavender cursor-pointer"
                            >
                                <option value="All Time">All Time</option>
                                <option value="Last 7 Days">Last 7 Days</option>
                                <option value="Last 30 Days">Last 30 Days</option>
                            </select>
                        </>
                    )}

                    <div className="relative group w-full sm:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-lavender transition-colors" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search Name, Phone, SKU..."
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-lavender/10 focus:border-lavender outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-8">
                {inquiriesLoading ? (
                    [...Array(3)].map((_, i) => <div key={i} className="h-48 bg-gray-50 animate-pulse rounded-[2.5rem]" />)
                ) : paginatedInquiries.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-16 text-center text-gray-400 border border-gray-100 shadow-sm">
                        <MessageSquare size={48} className="mx-auto mb-6 opacity-10" />
                        <p className="font-black text-xl text-charcoal/30 uppercase tracking-widest">No matching activities</p>
                    </div>
                ) : (
                    paginatedInquiries.map((inquiry: any) => {
                        const isInternational = inquiry.phone && !inquiry.phone.startsWith('+91');
                        const isRepeat = phoneCounts[inquiry.phone] > 1;
                        const isHighQty = (inquiry.confirmedQuotationId ? inquiry.quantity : inquiry.approxQuantity) >= HIGH_QUANTITY_THRESHOLD;
                        const isHighValue = inquiry.confirmedQuotationId && inquiry.estimatedTotal >= HIGH_VALUE_THRESHOLD;
                        
                        const todayTime = new Date().setHours(0,0,0,0);
                        const followTime = inquiry.followUpDate ? new Date(inquiry.followUpDate).getTime() : 0;
                        const isOverdue = inquiry.followUpDate && followTime < todayTime;
                        const isDueToday = inquiry.followUpDate && followTime === todayTime;

                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={inquiry._id}
                                className={cn(
                                    "bg-white rounded-[2.5rem] border shadow-sm hover:shadow-xl transition-all overflow-hidden group",
                                    isOverdue ? "border-red-200" : isDueToday ? "border-orange-200" : "border-gray-100"
                                )}
                            >
                                {/* Top Banner for Follow-Ups */}
                                {(isOverdue || isDueToday) && viewMode === 'inquiry' && (
                                    <div className={cn(
                                        "px-8 py-3 w-full font-black text-[10px] uppercase tracking-widest flex items-center justify-between",
                                        isOverdue ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
                                    )}>
                                        <span className="flex items-center gap-2">
                                            <CalendarIcon size={14} /> 
                                            {isOverdue ? `Overdue Follow-up (${new Date(inquiry.followUpDate).toLocaleDateString()})` : 'Follow-up Due Today'}
                                        </span>
                                    </div>
                                )}

                                <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                                    {/* Left Section: Info */}
                                    <div className="lg:w-96 p-8 bg-gray-50/50 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <h3 className="text-xl font-black text-charcoal">{inquiry.customerName || 'Anonymous User'}</h3>
                                                    <a href={`tel:${inquiry.phone}`} className="text-xs font-black text-gray-400 hover:text-lavender transition-colors mt-1 block">
                                                        {inquiry.phone || 'No phone provided'}
                                                    </a>
                                                </div>
                                                <span className={cn(
                                                    "px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border border-dashed",
                                                    inquiry.status?.toUpperCase() === 'NEW' ? "bg-blue-50 text-blue-500 border-blue-200" :
                                                    (inquiry.status?.toUpperCase() === 'CONTACTED' || inquiry.status?.toUpperCase() === 'CONTACT') ? "bg-yellow-50 text-yellow-600 border-yellow-200" :
                                                    inquiry.status?.toUpperCase() === 'FOLLOW_UP' ? "bg-orange-50 text-orange-500 border-orange-200" :
                                                    inquiry.status?.toUpperCase() === 'CONFIRMED' ? "bg-green-50 text-green-500 border-green-200" :
                                                    "bg-gray-50 text-charcoal border-gray-200"
                                                )}>{inquiry.status?.replace('_', '-')}</span>
                                            </div>

                                            {/* Smart Tags Array */}
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {isInternational && <span className="bg-white border border-gray-100 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-gray-500 flex items-center gap-1 shadow-sm"><Globe2 size={12} className="text-blue-500"/> Intl Customer</span>}
                                                {isRepeat && <span className="bg-yellow-50 border border-yellow-100 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-yellow-700 flex items-center gap-1 shadow-sm"><Star size={12} className="text-yellow-500 fill-yellow-500"/> Repeat</span>}
                                                {isHighQty && <span className="bg-red-50 border border-red-100 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-red-700 flex items-center gap-1 shadow-sm"><Flame size={12} className="text-red-500"/> High Qty</span>}
                                                {isHighValue && <span className="bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-emerald-700 flex items-center gap-1 shadow-sm"><Wallet size={12} className="text-emerald-500"/> High Value</span>}
                                            </div>

                                            <div className="flex items-center gap-4 mb-2 p-3 bg-white rounded-2xl border border-gray-100">
                                                <div className="w-12 h-12 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                                                    {inquiry.designId?.images?.[0] ? (
                                                        <img src={inquiry.designId.images[0]} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package size={16} className="text-gray-300" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-charcoal line-clamp-1">
                                                        {inquiry.interestedDesigns?.length > 1 
                                                            ? `${inquiry.interestedDesigns.length} Designs Interested` 
                                                            : (inquiry.designName || 'General Inquiry')}
                                                    </p>
                                                    <p className="text-[9px] font-black text-lavender uppercase tracking-widest">
                                                        {inquiry.interestedDesigns?.length > 1 
                                                            ? inquiry.interestedDesigns.map((d: any) => d.sku).join(', ')
                                                            : (inquiry.sku || inquiry.source)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle Section: Follow Up & Action */}
                                    {viewMode === 'inquiry' ? (
                                        <div className="flex-1 p-8 flex flex-col justify-between">
                                            <div className="grid grid-cols-2 gap-8 mb-8">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Projected Value</p>
                                                    <p className="font-black text-2xl text-charcoal">
                                                        {inquiry.confirmedQuotationId ? `₹${inquiry.estimatedTotal}` : 'TBD'}
                                                    </p>
                                                    <p className="text-xs font-bold text-gray-400 mt-1">
                                                        {inquiry.confirmedQuotationId ? `${inquiry.quantity} Units confirmed` : `${inquiry.approxQuantity || 0} Units approx.`}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Next Action / Follow-Up</p>
                                                    
                                                    <input 
                                                        type="date"
                                                        value={inquiry.followUpDate ? new Date(inquiry.followUpDate).toISOString().split('T')[0] : ''}
                                                        onChange={(e) => handleDateUpdate(inquiry._id, e.target.value)}
                                                        className="w-full bg-lavender/5 px-4 py-3 rounded-xl border border-lavender/10 text-xs font-black text-charcoal outline-none focus:ring-2 focus:ring-lavender transition-all"
                                                    />
                                                    
                                                    <div className="flex gap-2 mt-3">
                                                        <button onClick={() => setFollowUp(inquiry._id, 0)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-500 transition-colors">Today</button>
                                                        <button onClick={() => setFollowUp(inquiry._id, 1)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-500 transition-colors">Tmrw</button>
                                                        <button onClick={() => setFollowUp(inquiry._id, 3)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-500 transition-colors">+3D</button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <select
                                                        value={inquiry.status}
                                                        onChange={(e) => updateInquiry(inquiry._id, { status: e.target.value })}
                                                        className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-4 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-lavender"
                                                    >
                                                        <option value="New">NEW</option>
                                                        <option value="CONTACTED">CONTACTED</option>
                                                        <option value="FOLLOW_UP">FOLLOW-UP</option>
                                                        <option value="Confirmed">CONFIRMED</option>
                                                        <option value="Closed">CLOSED</option>
                                                    </select>
                                                </div>
                                                <button
                                                    onClick={() => handleWhatsApp(inquiry)}
                                                    className="flex-[2] h-14 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-500/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                                                >
                                                    Message Again <ExternalLink size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 p-8 flex flex-col justify-between">
                                            {/* Standard Order View Logic preserved */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Package & Qty</p>
                                                    <p className="font-black text-charcoal">{inquiry.selectedPackage || 'Standard'} @ {inquiry.quantity} Units</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned Designer</p>
                                                    <select 
                                                        value={inquiry.assignedTo?._id || ''} 
                                                        onChange={(e: any) => updateInquiry(inquiry._id, { assignedTo: e.target.value, status: 'Designing' })}
                                                        className="w-full bg-gray-50 p-2 rounded-lg text-xs font-black outline-none border border-transparent focus:border-lavender/30"
                                                    >
                                                        <option value="">Unassigned</option>
                                                        {employees.map((e: any) => <option key={e._id} value={e._id}>{e.name}</option>)}
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
                                                    </div>
                                                </div>
                                            </div>

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

                                            <div className="mt-8 flex gap-4">
                                                <Link 
                                                    href={`/admin/inquiries/${inquiry._id}`}
                                                    className="flex-1 py-4 bg-lavender/10 text-lavender rounded-2xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-lavender hover:text-white transition-all flex items-center justify-center gap-2"
                                                >
                                                    Details & Billing <FileText size={14} />
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-300 hover:text-lavender disabled:opacity-30"><ChevronLeft size={20} /></button>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Page {currentPage} of {totalPages}</span>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-300 hover:text-lavender disabled:opacity-30"><ChevronRight size={20} /></button>
                </div>
            )}
        </div>
    );
}
