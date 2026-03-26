'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Package, 
    ExternalLink, 
    LogOut,
    Calendar,
    MessageSquare
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function EmployeeDashboard() {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ active: 0, completed: 0, delayed: 0 });
    const router = useRouter();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/inquiries');
            if (res.status === 401) {
                router.push('/employee/login');
                return;
            }
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
            calculateStats(data);
        } catch (error) {
            toast.error('Failed to load assigned orders');
        } finally {
            setIsLoading(false);
        }
    };

    const calculateStats = (data: any[]) => {
        const now = new Date();
        let active = 0, completed = 0, delayed = 0;
        
        data.forEach(order => {
            if (order.status === 'Completed' || order.status === 'Delivered') {
                completed++;
            } else {
                active++;
                // Check 48h design limit
                if (order.status === 'Designing' && order.timeline?.designStartedAt) {
                    const started = new Date(order.timeline.designStartedAt);
                    const diff = (now.getTime() - started.getTime()) / (1000 * 60 * 60);
                    if (diff > 48) delayed++;
                }
            }
        });
        setStats({ active, completed, delayed });
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch('/api/inquiries', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus }),
            });

            if (res.ok) {
                toast.success(`Priority Updated: ${newStatus}`);
                fetchOrders(); // Refresh to update timeline and stats
            }
        } catch (error) {
            toast.error('Update failed');
        }
    };

    const handleLogout = async () => {
        // Simple cookie clear via API or client-side if path is /
        document.cookie = "employee-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.push('/employee/login');
    };

    return (
        <div className="min-h-screen bg-[#fafafa] p-6 lg:p-12">
            <Toaster position="top-right" />
            
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-lavender rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-lavender/20">Z</div>
                            <h1 className="text-2xl font-black text-charcoal tracking-tight uppercase tracking-[0.1em]">Production Desk</h1>
                        </div>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Designing & Content Creation Pipeline</p>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-charcoal transition-all shadow-sm"
                    >
                        Sign Out <LogOut size={14} />
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Active Tasks', value: stats.active, color: 'bg-lavender', icon: Package },
                        { label: 'Completed', value: stats.completed, color: 'bg-green-500', icon: CheckCircle2 },
                        { label: 'Delayed (>48h)', value: stats.delayed, color: 'bg-red-500', icon: AlertCircle, alert: stats.delayed > 0 },
                    ].map((stat, i) => (
                        <div key={i} className={cn("bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between", stat.alert && "border-red-100 bg-red-50/10")}>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                                <p className={cn("text-4xl font-black tracking-tight", stat.alert ? "text-red-600" : "text-charcoal")}>{stat.value}</p>
                            </div>
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-current/20", stat.color)}>
                                <stat.icon size={24} strokeWidth={2.5} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Orders List */}
                <div className="space-y-6">
                    <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-1">Assigned Pipeline</h2>
                    {isLoading ? (
                        <div className="h-64 bg-white rounded-[2.5rem] animate-pulse border border-gray-100" />
                    ) : orders.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] p-20 text-center border border-gray-100 shadow-sm">
                            <Clock size={48} className="mx-auto mb-6 text-gray-200" />
                            <p className="font-black text-gray-400 uppercase tracking-widest">No orders assigned to you yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {orders.map((order, idx) => {
                                const isDesigning = order.status === 'Designing';
                                let isDelayed = false;
                                if (isDesigning && order.timeline?.designStartedAt) {
                                    const started = new Date(order.timeline.designStartedAt);
                                    isDelayed = (new Date().getTime() - started.getTime()) / (1000 * 60 * 60) > 48;
                                }

                                return (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        key={order._id}
                                        className={cn(
                                            "bg-white rounded-[2.5rem] border overflow-hidden transition-all hover:shadow-xl",
                                            isDelayed ? "border-red-200 shadow-red-500/5 shadow-2xl" : "border-gray-100 shadow-sm"
                                        )}
                                    >
                                        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                                            {/* Design Info */}
                                            <div className="lg:w-1/3 p-8 bg-gray-50/50">
                                                <div className="flex items-center gap-4 mb-8">
                                                    <div className="w-16 h-16 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm shrink-0">
                                                        {order.designId?.images?.[0] ? (
                                                            <img src={order.designId.images[0]} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-200"><Package size={24} /></div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-black text-charcoal line-clamp-1">{order.designName}</h3>
                                                        <p className="text-[10px] font-black text-lavender uppercase tracking-widest">{order.sku}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        <span>Status</span>
                                                        <span className={cn("px-2 py-1 rounded-lg", isDelayed ? "bg-red-100 text-red-600 animate-pulse" : "bg-lavender/10 text-lavender")}>{order.status}</span>
                                                    </div>
                                                    {isDelayed && (
                                                        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
                                                            <AlertCircle size={14} className="text-red-500 shrink-0" />
                                                            <p className="text-[9px] font-black text-red-600 uppercase tracking-widest">Designing Limit Exceeded (48h)</p>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        <span>Deadline</span>
                                                        <span className="text-charcoal flex items-center gap-2">
                                                            <Calendar size={12} />
                                                            {order.deliveryDeadline ? new Date(order.deliveryDeadline).toLocaleDateString() : 'Not Set'}
                                                            {order.isFixedDate && <span className="text-red-500">*</span>}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Production Status */}
                                            <div className="flex-1 p-8 flex flex-col justify-between">
                                                <div>
                                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                        <Clock size={12} /> Status Progress
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {['Designing', 'Design Confirmed', 'Printing', 'Delivered'].map((s) => {
                                                            const isCurrent = order.status === s;
                                                            return (
                                                                <button
                                                                    key={s}
                                                                    onClick={() => updateStatus(order._id, s)}
                                                                    className={cn(
                                                                        "px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                                                        isCurrent ? "bg-charcoal text-white shadow-lg" : "bg-white border border-gray-100 text-gray-300 hover:text-charcoal hover:border-charcoal/20"
                                                                    )}
                                                                >
                                                                    {s}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    
                                                    <div className="mt-8 space-y-4">
                                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                            <MessageSquare size={12} /> Project Specs
                                                        </h4>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="p-4 bg-gray-50 rounded-2xl">
                                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Package</p>
                                                                <p className="text-xs font-black text-charcoal">{order.selectedPackage || 'Standard'}</p>
                                                            </div>
                                                            <div className="p-4 bg-gray-50 rounded-2xl">
                                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Quantity</p>
                                                                <p className="text-xs font-black text-charcoal">{order.quantity} Units</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Assigned at {new Date(order.createdAt).toLocaleDateString()}</p>
                                                    <a
                                                        href={`https://wa.me/${(order.phone || '9092981748').replace(/\D/g, '')}`}
                                                        target="_blank"
                                                        className="px-8 py-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2"
                                                    >
                                                        Contact Lead <ExternalLink size={14} />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
