'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Search,
    Package,
    ArrowRight,
    ShieldCheck,
    CheckCircle2,
    Database,
    Zap,
    TrendingUp,
    Crown,
    Star,
    Image as ImageIcon,
    Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { cn, getStartingPrice } from '@/lib/utils';
import Image from 'next/image';

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
    const recentDesigns = data?.recentDesigns || [];

    const filteredDesigns = recentDesigns.filter((design: any) => {
        const searchLower = searchQuery.toLowerCase();
        return (
            (design.name || '').toLowerCase().includes(searchLower) ||
            (design.sku || '').toLowerCase().includes(searchLower)
        );
    });

    const getIconForStat = (label: string) => {
        switch (label) {
            case 'Physical Designs': return <Package className="w-5 h-5" />;
            case 'Digital Designs': return <Zap className="w-5 h-5" />;
            case 'Best Sellers': return <Crown className="w-5 h-5" />;
            case 'Trending Designs': return <TrendingUp className="w-5 h-5" />;
            case 'New Arrivals': return <Star className="w-5 h-5" />;
            default: return <Package className="w-5 h-5" />;
        }
    };

    return (
        <div className="space-y-8 pb-10 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-serif text-charcoal">Design Overview</h2>
                    <p className="text-gray-500 mt-1 font-medium">Insights into your catalog and active designs.</p>
                </div>
            </div>

            {/* Stats Ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
                {isLoading ? (
                    [...Array(5)].map((_, i) => (
                        <div key={i} className="h-32 bg-white border border-gray-100 rounded-3xl animate-pulse shadow-sm" />
                    ))
                ) : (
                    stats.map((stat: any, index: number) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={index}
                            className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8 opacity-10 transition-transform group-hover:scale-110" style={{ backgroundColor: stat.color }} />
                            
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-xl" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                    {getIconForStat(stat.label)}
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    {stat.label}
                                </p>
                            </div>
                            
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-bold text-charcoal">
                                    {stat.value}
                                </h3>
                                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: stat.color }}>
                                    {stat.trend}
                                </span>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area: Recent Designs */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
                        <div className="p-6 md:p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/30">
                            <div>
                                <h2 className="text-xl font-bold text-charcoal flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-lavender" />
                                    Recently Added
                                </h2>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Latest catalog updates</p>
                            </div>
                            <div className="relative group sm:w-64">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-lavender transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search by ID, Name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white border border-gray-200 focus:border-lavender focus:ring-4 focus:ring-lavender/10 rounded-2xl py-2.5 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-gray-400 font-medium"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto flex-1">
                            <table className="w-full min-w-[600px] text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="pb-4 pt-5 px-6 font-bold text-[10px] uppercase tracking-widest text-gray-400">Design Info</th>
                                        <th className="pb-4 pt-5 px-6 font-bold text-[10px] uppercase tracking-widest text-gray-400 text-center">Badges</th>
                                        <th className="pb-4 pt-5 px-6 font-bold text-[10px] uppercase tracking-widest text-gray-400 text-center">Price</th>
                                        <th className="pb-4 pt-5 px-6 font-bold text-[10px] uppercase tracking-widest text-gray-400 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {isLoading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={4} className="px-6 py-5"><div className="h-12 bg-gray-50 rounded-xl w-full" /></td>
                                            </tr>
                                        ))
                                    ) : filteredDesigns.length > 0 ? (
                                        filteredDesigns.map((design: any) => (
                                            <tr key={design._id} className="hover:bg-gray-50/40 transition-colors group">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-4">
                                                        {design.images && design.images.length > 0 ? (
                                                            <div className="w-12 h-12 rounded-xl overflow-hidden relative shadow-sm border border-gray-100 flex-shrink-0">
                                                                <Image src={design.images[0]} alt={design.name} fill className="object-cover" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 border border-gray-100 flex-shrink-0">
                                                                <ImageIcon size={20} />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <Link href={`/admin/designs?edit=${design._id}`} className="text-sm font-bold text-charcoal hover:text-lavender transition-colors line-clamp-1">
                                                                {design.name || 'Unnamed'}
                                                            </Link>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-[10px] font-black text-lavender uppercase tracking-widest bg-lavender/10 px-1.5 py-0.5 rounded">
                                                                    {design.sku || '-'}
                                                                </span>
                                                                <span className="text-xs text-gray-400">{design.categoryId?.name || 'Uncategorized'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                                        {design.isTrending && <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border border-emerald-100">Best Seller</span>}
                                                        {design.isFeatured && <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border border-amber-100">Trending</span>}
                                                        {design.isNewArrival && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border border-blue-100">New</span>}
                                                        {!design.isTrending && !design.isFeatured && !design.isNewArrival && <span className="text-gray-300 text-xs">-</span>}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <p className="text-sm font-bold text-charcoal">₹{getStartingPrice(design)}</p>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <p className="text-xs font-semibold text-gray-500">
                                                        {new Date(design.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="py-20 text-center text-gray-400">
                                                <Package size={48} className="mx-auto mb-4 opacity-20" />
                                                <p className="text-sm font-medium">No recent designs found.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Quick Actions & Health */}
                <div className="space-y-6">
                    <section className="bg-charcoal p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-lavender/20 to-transparent rounded-full -translate-y-16 translate-x-16 blur-2xl" />
                        <h2 className="text-2xl font-serif mb-1">Quick Links</h2>
                        <p className="text-[10px] text-white/50 font-bold uppercase tracking-[0.2em] mb-8">Instant Access</p>

                        <div className="space-y-3">
                            {[
                                { label: 'Upload Designs', href: '/admin/bulk-import', icon: Package, desc: 'Batch import new SKUs' },
                                { label: 'Account Settings', href: '/admin/account', icon: ShieldCheck, desc: 'Manage profile & security' },
                            ].map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.href}
                                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 bg-white/10 rounded-xl text-lavender"><link.icon size={18} /></div>
                                        <div>
                                            <p className="text-sm font-bold text-white group-hover:text-lavender transition-colors">{link.label}</p>
                                            <p className="text-[10px] text-white/50 mt-0.5">{link.desc}</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={16} className="text-white/20 group-hover:text-lavender transition-all group-hover:translate-x-1" />
                                </Link>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                                <Database size={24} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-charcoal">System Health</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">All systems operational</p>
                            </div>
                        </div>
                        <ul className="space-y-3">
                            <li className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <span className="text-xs font-bold text-gray-600">Database Connection</span>
                                </div>
                                <CheckCircle2 size={14} className="text-emerald-500" />
                            </li>
                            <li className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <span className="text-xs font-bold text-gray-600">Asset CDN Synced</span>
                                </div>
                                <CheckCircle2 size={14} className="text-emerald-500" />
                            </li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
