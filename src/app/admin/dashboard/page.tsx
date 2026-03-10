'use client';

import React, { useEffect, useState } from 'react';
import StatCard from './components/StatCard';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Search,
    Download,
    MessageSquare,
    ExternalLink,
    Package,
    Layers,
    CheckCircle2,
    AlertCircle,
    ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
    const [stats, setStats] = useState<any[]>([]);
    const [recentInquiries, setRecentInquiries] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/dashboard/stats');
                const data = await res.json();
                if (res.ok) {
                    setStats(data.stats);
                    setRecentInquiries(data.recentInquiries);
                }
            } catch (error) {
                toast.error('Failed to load dashboard data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const filteredInquiries = recentInquiries.filter(inv => {
        const searchLower = searchQuery.toLowerCase();
        return (
            (inv.designName || '').toLowerCase().includes(searchLower) ||
            (inv.sku || '').toLowerCase().includes(searchLower) ||
            (inv.customerNote || '').toLowerCase().includes(searchLower) ||
            (inv.selectedPackage || '').toLowerCase().includes(searchLower)
        );
    });

    const exportToCSV = () => {
        if (recentInquiries.length === 0) return;

        const headers = ["Date", "Design Name", "SKU", "Package", "Qty", "Total Estimate", "Source", "Status"];
        const rows = recentInquiries.map(inv => [
            new Date(inv.createdAt).toLocaleString(),
            inv.designName || 'N/A',
            inv.sku || 'N/A',
            inv.selectedPackage || 'Standard',
            inv.quantity || 100,
            inv.estimatedTotal || 0,
            inv.source || 'detail',
            inv.status
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `zubizo_inquiries_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("CSV Exported successfully");
    };

    return (
        <div className="space-y-10 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-charcoal tracking-tight">Business Overview</h1>
                    <p className="text-gray-500 mt-1 font-medium">Insights into your invitation boutique performing today.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={exportToCSV}
                        className="bg-white hover:bg-gray-50 text-charcoal px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-gray-100 shadow-sm transition-all flex items-center gap-2"
                    >
                        <Download size={16} />
                        Export Data
                    </button>
                    <Link
                        href="/admin/designs"
                        className="bg-lavender hover:bg-[#9a6ab5] text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-lavender/20 transition-all flex items-center gap-2"
                    >
                        <Package size={16} />
                        Manage Designs
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {isLoading ? (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="h-28 md:h-32 bg-white border border-gray-50 rounded-[1.5rem] md:rounded-[2rem] animate-pulse" />
                    ))
                ) : (
                    stats.map((stat, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={index}
                            className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-sm"
                        >
                            <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                                <h3 className="text-xl md:text-3xl font-black text-charcoal">{stat.value}</h3>
                                <span className="text-[8px] md:text-[10px] font-bold text-lavender uppercase">{stat.trend}</span>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Inquiries */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
                        <div className="p-5 md:p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-black text-charcoal">Recent Inquiries</h2>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Live from WhatsApp</p>
                            </div>
                            <div className="relative group sm:w-64">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-lavender transition-colors" size={16} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by SKU/Design..."
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-[11px] font-bold focus:bg-white focus:border-lavender outline-none transition-all uppercase tracking-wider"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 text-gray-400 text-[9px] font-black uppercase tracking-[0.2em]">
                                    <tr>
                                        <th className="px-8 py-5 min-w-[200px]">Design Info</th>
                                        <th className="px-8 py-5 min-w-[150px]">Value / Detail</th>
                                        <th className="px-8 py-5 min-w-[120px]">Status</th>
                                        <th className="px-8 py-5 text-right">Preview</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {isLoading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={4} className="px-8 py-6"><div className="h-4 bg-gray-50 rounded w-full" /></td>
                                            </tr>
                                        ))
                                    ) : filteredInquiries.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-32 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                                                No inquiries matching search criteria
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredInquiries.map((inquiry, index) => (
                                            <tr key={inquiry._id} className="hover:bg-gray-50/30 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                                                            {inquiry.designId?.images?.[0] ? (
                                                                <img src={inquiry.designId.images[0]} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-200"><MessageSquare size={16} /></div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-charcoal line-clamp-1">{inquiry.designName}</p>
                                                            <p className="text-[10px] font-black text-lavender uppercase tracking-widest">{inquiry.sku}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col gap-0.5">
                                                        <p className="text-sm font-black text-charcoal">₹{inquiry.estimatedTotal || 0}</p>
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                            {inquiry.quantity || 100} units • {inquiry.selectedPackage || 'Std'}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className={cn(
                                                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest inline-block border",
                                                        inquiry.status === 'New' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                            inquiry.status === 'Contacted' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                                "bg-green-50 text-green-600 border-green-100"
                                                    )}>
                                                        {inquiry.status}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <Link href="/admin/inquiries" className="p-2.5 text-gray-300 hover:text-lavender hover:bg-lavender/5 rounded-xl transition-all border border-transparent hover:border-lavender/20 inline-block">
                                                        <ArrowRight size={18} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Quick Actions & Tips */}
                <div className="space-y-8">
                    <section className="bg-charcoal p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-lavender/10 rounded-full -translate-y-16 translate-x-16 blur-3xl" />
                        <h2 className="text-xl font-black mb-1">Quick Links</h2>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] mb-8">Instant Admin Access</p>

                        <div className="space-y-4">
                            {[
                                { label: 'New Collection', href: '/admin/categories', icon: Layers },
                                { label: 'Inquiry Logs', href: '/admin/inquiries', icon: MessageSquare },
                                { label: 'Account Settings', href: '/admin/account', icon: ShieldCheck },
                            ].map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.href}
                                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/10 rounded-lg text-lavender"><link.icon size={16} /></div>
                                        <span className="text-sm font-bold">{link.label}</span>
                                    </div>
                                    <ArrowRight size={16} className="text-white/20 group-hover:text-white transition-all group-hover:translate-x-1" />
                                </Link>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-lavender/10 text-lavender rounded-xl flex items-center justify-center">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-charcoal">System Health</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Everything is running smooth</p>
                            </div>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-xs font-bold text-gray-500">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                MongoDB Connected
                            </li>
                            <li className="flex items-center gap-3 text-xs font-bold text-gray-500">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                WhatsApp Integration Active
                            </li>
                            <li className="flex items-center gap-3 text-xs font-bold text-gray-500">
                                <div className="w-1.5 h-1.5 rounded-full bg-lavender" />
                                API Rate: Normal
                            </li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}

function ShieldCheck({ size }: { size: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .67-.94l8-3a1 1 0 0 1 .66 0l8 3A1 1 0 0 1 20 6v7z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}
