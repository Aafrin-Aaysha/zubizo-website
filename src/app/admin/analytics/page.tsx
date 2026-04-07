'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    BarChart as BarChartIcon,
    TrendingUp,
    Users,
    Package,
    IndianRupee,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Filter,
    Clock,
    AlertCircle,
    CheckCircle2,
    Target,
    Layers,
    Globe2,
    UserCircle,
    Search,
    Star
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
    Cell
} from 'recharts';
import { cn } from '@/lib/utils';

// Helper for currency formatting
const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(val);

export default function AnalyticsDashboard() {
    const [dateRange, setDateRange] = useState('30'); // '7', '30', '90'
    const [adminFilter, setAdminFilter] = useState('All');
    const [skuFilter, setSkuFilter] = useState('');

    // Fetch Date Calculations
    const dates = useMemo(() => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - parseInt(dateRange));
        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        };
    }, [dateRange]);

    // Main Data Fetch
    const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
        queryKey: ['analytics', dates, adminFilter, skuFilter],
        queryFn: async () => {
            const params = new URLSearchParams({
                startDate: dates.start,
                endDate: dates.end,
                adminId: adminFilter,
                sku: skuFilter
            });
            const res = await fetch(`/api/admin/analytics?${params}`);
            if (!res.ok) throw new Error('Failed to fetch analytics');
            return res.json();
        }
    });

    // Fetch Admins for Filter
    const { data: admins = [] } = useQuery({
        queryKey: ['admins'],
        queryFn: async () => {
            const res = await fetch('/api/admin/employees');
            if (!res.ok) return [];
            return res.json();
        }
    });

    if (isAnalyticsLoading) {
        return (
            <div className="flex flex-col gap-8 pb-20 animate-pulse">
                <div className="h-10 w-64 bg-gray-100 rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-50 rounded-[2.5rem]" />)}
                </div>
                <div className="h-[400px] bg-gray-50 rounded-[2.5rem]" />
            </div>
        );
    }

    const { summary = {}, timeSeries = [], topDesigns = [], materials = [], customers = {}, operations = {}, funnel = {} } = analytics || {};

    return (
        <div className="space-y-10 pb-20">
            {/* Header & Global Filters */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-black text-charcoal tracking-tight flex items-center gap-3">
                        Business Analytics <TrendingUp className="text-lavender" size={28} />
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium">Real-time performance across financials, operations, and inventory.</p>
                </div>

                <div className="flex flex-wrap gap-4 w-full lg:w-auto bg-white p-3 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 px-3 border-r border-gray-100">
                        <Calendar size={16} className="text-gray-400" />
                        <select 
                            value={dateRange} 
                            onChange={(e) => setDateRange(e.target.value)}
                            className="text-xs font-black uppercase bg-transparent outline-none cursor-pointer"
                        >
                            <option value="7">Last 7 Days</option>
                            <option value="30">Last 30 Days</option>
                            <option value="90">Last 90 Days</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 px-3 border-r border-gray-100">
                        <UserCircle size={16} className="text-gray-400" />
                        <select 
                            value={adminFilter} 
                            onChange={(e) => setAdminFilter(e.target.value)}
                            className="text-xs font-black uppercase bg-transparent outline-none cursor-pointer"
                        >
                            <option value="All">All Admins</option>
                            {admins.map((adm: any) => (
                                <option key={adm._id} value={adm._id}>{adm.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 px-3 pl-1 flex-1 min-w-[150px]">
                        <Search size={16} className="text-gray-300" />
                        <input 
                            type="text" 
                            placeholder="SKU Search..."
                            value={skuFilter}
                            onChange={(e) => setSkuFilter(e.target.value)}
                            className="text-xs font-bold bg-transparent outline-none w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: 'Total Revenue', value: formatCurrency(summary.totalRevenue || 0), icon: IndianRupee, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { title: 'Gross Profit', value: formatCurrency(summary.totalProfit || 0), icon: ArrowUpRight, color: 'text-lavender', bg: 'bg-lavender/10' },
                    { title: 'Avg Order Profit', value: formatCurrency(summary.avgProfitPerOrder || 0), icon: Target, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { title: 'Active Orders', value: summary.totalOrders || 0, icon: Package, color: 'text-orange-500', bg: 'bg-orange-50' },
                ].map((stat, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="bg-white p-6 rounded-[2.2rem] border border-gray-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition-all"
                    >
                        <div className={cn("w-16 h-16 flex items-center justify-center rounded-2xl shrink-0 group-hover:scale-110 transition-transform", stat.bg, stat.color)}>
                            <stat.icon size={28} />
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.title}</h4>
                            <p className="text-2xl font-black text-charcoal">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Performance Chart */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-[450px] flex flex-col"
                >
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-black text-charcoal tracking-tight">Growth & Profitability</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Last {dateRange} Days Trend</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                                <span className="text-[10px] font-black uppercase">Revenue</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-lavender" />
                                <span className="text-[10px] font-black uppercase">Profit</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timeSeries}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#A237E1" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#A237E1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis 
                                    dataKey="_id" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 9, fontWeight: 900, fill: '#999' }}
                                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#999' }} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                                    formatter={(value: number) => [formatCurrency(value), '']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                                <Area type="monotone" dataKey="profit" stroke="#A237E1" strokeWidth={4} fillOpacity={1} fill="url(#colorProf)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Conversion Funnel */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col"
                >
                    <h3 className="text-xl font-black text-charcoal tracking-tight mb-8">Conversion Funnel</h3>
                    <div className="flex-1 flex flex-col justify-between py-4">
                        {[
                            { label: 'Leads', val: funnel.leads || 0, color: 'bg-blue-500', ratio: 100 },
                            { label: 'Contacted', val: funnel.contacted || 0, color: 'bg-yellow-500', ratio: funnel.leads ? Math.round((funnel.contacted / funnel.leads) * 100) : 0 },
                            { label: 'Confirmed', val: funnel.confirmed || 0, color: 'bg-green-500', ratio: funnel.leads ? Math.round((funnel.confirmed / funnel.leads) * 100) : 0 },
                            { label: 'Completed', val: funnel.completed || 0, color: 'bg-lavender', ratio: funnel.leads ? Math.round((funnel.completed / funnel.leads) * 100) : 0 }
                        ].map((step, i) => (
                            <div key={i} className="relative group">
                                <div className="flex justify-between items-end mb-2 px-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-charcoal transition-colors">{step.label}</span>
                                    <span className="text-lg font-black text-charcoal">{step.val}</span>
                                </div>
                                <div className="h-6 w-full bg-gray-50 rounded-lg overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }} 
                                        animate={{ width: `${step.ratio}%` }} 
                                        transition={{ duration: 1, delay: i * 0.2 }}
                                        className={cn("h-full rounded-lg shadow-sm border-r-4 border-white/20", step.color)}
                                    />
                                </div>
                                {i < 3 && <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-300">▼ {Math.round(([funnel.contacted, funnel.confirmed, funnel.completed][i] / [funnel.leads, funnel.contacted, funnel.confirmed][i]) * 100) || 0}%</div>}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Top Performing Designs */}
                <div className="xl:col-span-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                        <h3 className="text-xl font-black text-charcoal tracking-tight flex items-center gap-3">
                            Top Designs <Star className="text-yellow-500 fill-yellow-500" size={20} />
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white">
                                <tr className="text-[10px] uppercase font-black text-gray-400 tracking-widest border-b border-gray-50">
                                    <th className="px-8 py-5">Design Name</th>
                                    <th className="px-8 py-5">SKU</th>
                                    <th className="px-8 py-5">Orders</th>
                                    <th className="px-8 py-5 text-right">Revenue Generated</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {topDesigns.map((design: any, i: number) => (
                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6 font-black text-charcoal text-sm">{design._id}</td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-500">{design.sku}</span>
                                        </td>
                                        <td className="px-8 py-6 font-bold text-gray-400">{design.count} Units</td>
                                        <td className="px-8 py-6 text-right">
                                            <span className="text-base font-black text-charcoal group-hover:text-lavender transition-colors">{formatCurrency(design.revenue)}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Operational Health */}
                <div className="xl:col-span-4 space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between h-[320px]">
                        <h3 className="text-xl font-black text-charcoal tracking-tight flex items-center gap-3">
                            Operational Health <Clock className="text-blue-500" size={20} />
                        </h3>
                        
                        <div className="space-y-8 py-6">
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg Completion Time</p>
                                    <p className="text-3xl font-black text-charcoal">
                                        {operations.avgCompletionMs ? Math.round(operations.avgCompletionMs / (1000 * 60 * 60 * 24)) : 0} <span className="text-sm">Days</span>
                                    </p>
                                </div>
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                                    <CheckCircle2 size={24} />
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Delay Rate</p>
                                    <p className="text-3xl font-black text-red-500">
                                        {operations.totalDelivered ? Math.round((operations.delayCount / operations.totalDelivered) * 100) : 0}%
                                    </p>
                                </div>
                                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
                                    <AlertCircle size={24} />
                                </div>
                            </div>
                        </div>

                        <p className="text-[9px] font-bold text-gray-400 text-center uppercase tracking-widest italic border-t border-gray-50 pt-4">Computed from Confirmed → Delivered Timeline</p>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-charcoal tracking-tight flex items-center gap-3">
                                Customer Base <Users className="text-orange-500" size={20} />
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100/50">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Repeat Clients</p>
                                <p className="text-2xl font-black text-charcoal">{customers.repeatCustomers || 0}</p>
                            </div>
                            <div className="p-5 bg-blue-50/30 rounded-2xl border border-blue-100/30">
                                <p className="text-[10px] font-black text-blue-500/60 uppercase tracking-widest mb-1 flex items-center gap-1">International <Globe2 size={10} /></p>
                                <p className="text-2xl font-black text-blue-600">{customers.internationalOrders || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Material Analytics Section */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-charcoal tracking-tight flex items-center gap-3">
                        Material Cost Contribution <Layers className="text-gray-400" size={20} />
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {materials.slice(0, 8).map((mat: any, i: number) => {
                        const totalContribution = materials.reduce((sum: number, m: any) => sum + m.totalCost, 0);
                        const percentage = totalContribution ? Math.round((mat.totalCost / totalContribution) * 100) : 0;
                        
                        return (
                            <div key={i} className="p-6 rounded-3xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-lg transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="text-sm font-black text-charcoal line-clamp-1 pr-2">{mat._id}</h4>
                                    <span className="text-[10px] font-black text-lavender bg-white px-2 py-1 rounded-lg border border-lavender/10 shadow-sm">{percentage}%</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Spent</p>
                                        <p className="text-xl font-black text-charcoal mt-1">{formatCurrency(mat.totalCost)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Usage</p>
                                        <p className="text-sm font-black text-gray-500">{mat.usageCount} Times</p>
                                    </div>
                                </div>
                                <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        className="h-full bg-lavender rounded-full"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
