'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Search,
    Download,
    ExternalLink,
    Package,
    Layers,
    CheckCircle2,
    ArrowRight,
    FileText,
    ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const { data, isLoading, isError } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: async () => {
            const res = await fetch('/api/dashboard/stats');
            if (!res.ok) throw new Error('Failed to load dashboard data');
            return res.json();
        },
        refetchInterval: 60000,
    });

    useEffect(() => {
        if (isError) toast.error('Failed to load dashboard data');
    }, [isError]);

    const stats = data?.stats || [];
    const recentInvoices = data?.recentInvoices || [];

    const filteredInvoices = recentInvoices.filter((inv: any) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            (inv.designName || '').toLowerCase().includes(searchLower) ||
            (inv.designCode || '').toLowerCase().includes(searchLower) ||
            (inv.customerName || '').toLowerCase().includes(searchLower) ||
            (inv.orderId || '').toLowerCase().includes(searchLower)
        );
    });

    const exportToCSV = () => {
        if (recentInvoices.length === 0) return;

        const headers = ["Date", "Order ID", "Customer", "Design", "SKU", "Qty", "Total Revenue", "Profit"];
        const rows = recentInvoices.map((inv: any) => [
            new Date(inv.createdAt).toLocaleString(),
            inv.orderId,
            inv.customerName || 'N/A',
            inv.designName || 'N/A',
            inv.designCode || 'N/A',
            inv.quantity || 1,
            inv.grandTotal || 0,
            inv.profit || 0
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map((row: any) => row.map((cell: any) => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `zubizo_invoices_${new Date().toISOString().split('T')[0]}.csv`);
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
                    <p className="text-gray-500 mt-1 font-medium">Insights into your revenue and inventory consumption.</p>
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
                        href="/admin/invoices/new"
                        className="bg-lavender hover:bg-[#9a6ab5] text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-lavender/20 transition-all flex items-center gap-2"
                    >
                        <FileText size={16} />
                        New Invoice
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
                    stats.map((stat: any, index: number) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={index}
                            className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-sm"
                        >
                            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1 text-gray-400">
                                {stat.label}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                                <h3 className="text-xl md:text-3xl font-black text-charcoal">
                                    {stat.value}
                                </h3>
                                <span className={cn("text-[8px] md:text-[10px] font-bold uppercase", `text-[${stat.color}]`)} style={{ color: stat.color }}>
                                    {stat.trend}
                                </span>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Invoices */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
                        <div className="p-5 md:p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-black text-charcoal">Recent Invoices</h2>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Generated Orders</p>
                            </div>
                            <div className="relative group sm:w-64">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-lavender transition-colors" size={16} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by ID, Name..."
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-[11px] font-bold focus:bg-white focus:border-lavender outline-none transition-all uppercase tracking-wider"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 text-gray-400 text-[9px] font-black uppercase tracking-[0.2em]">
                                    <tr>
                                        <th className="px-8 py-5 min-w-[200px]">Design Info</th>
                                        <th className="px-8 py-5 min-w-[150px]">Customer</th>
                                        <th className="px-8 py-5 min-w-[120px]">Revenue</th>
                                        <th className="px-8 py-5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {isLoading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={4} className="px-8 py-6"><div className="h-4 bg-gray-50 rounded w-full" /></td>
                                            </tr>
                                        ))
                                    ) : filteredInvoices.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-32 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                                                No invoices matching search criteria
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredInvoices.map((invoice: any) => (
                                            <tr key={invoice._id} className="hover:bg-gray-50/30 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 text-gray-300">
                                                            <FileText size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-charcoal line-clamp-1">{invoice.designName}</p>
                                                            <p className="text-[10px] font-black text-lavender uppercase tracking-widest">{invoice.orderId}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col gap-0.5">
                                                        <p className="text-sm font-black text-charcoal">{invoice.customerName}</p>
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                            Qty: {invoice.quantity}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col gap-0.5">
                                                        <p className="text-sm font-black text-green-600">₹{invoice.grandTotal || 0}</p>
                                                        <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                                                            Profit: ₹{invoice.profit || 0}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <Link href="/admin/invoices" className="p-2.5 text-gray-300 hover:text-lavender hover:bg-lavender/5 rounded-xl transition-all border border-transparent hover:border-lavender/20 inline-block">
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
                                { label: 'Invoice History', href: '/admin/invoices', icon: FileText },
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
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Inventory sync active</p>
                            </div>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-xs font-bold text-gray-500">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                Auto-Deductions Working
                            </li>
                            <li className="flex items-center gap-3 text-xs font-bold text-gray-500">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                Invoices Connected
                            </li>
                            <li className="flex items-center gap-3 text-xs font-bold text-gray-500">
                                <div className="w-1.5 h-1.5 rounded-full bg-lavender" />
                                Analytics Synced
                            </li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
