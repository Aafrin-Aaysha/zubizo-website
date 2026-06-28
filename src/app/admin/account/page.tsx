'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Mail,
    Lock,
    Save,
    Loader2,
    ShieldCheck,
    AlertCircle,
    Eye,
    EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminAccountPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [adminRole, setAdminRole] = useState('admin');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showGlobalData: false
    });

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const res = await fetch('/api/admin/account');
            const data = await res.json();
            if (res.ok) {
                setAdminRole(data.role || 'admin');
                setFormData(prev => ({
                    ...prev,
                    name: data.name || '',
                    email: data.email || '',
                    showGlobalData: data.showGlobalData || false
                }));
            }
        } catch (error) {
            toast.error('Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/admin/account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                    showGlobalData: formData.showGlobalData
                }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success('Account updated successfully');
                setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }));
            } else {
                toast.error(data.message || 'Failed to update');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-lavender" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10 text-slate-700 text-xs">
            <div>
                <h2 className="text-2xl font-normal text-charcoal">Admin Settings</h2>
                <p className="text-gray-500 mt-0.5 text-xs font-medium">Manage your profile information and account security.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Overview */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-lavender/10 rounded-2xl flex items-center justify-center text-lavender mb-4 border-2 border-white shadow">
                            <User size={28} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-lg font-black text-charcoal">{formData.name || 'Admin User'}</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{formData.email}</p>

                        <div className="mt-6 pt-4 border-t border-gray-50 w-full flex items-center justify-center gap-2">
                            <ShieldCheck size={14} className="text-green-500" />
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Verified Administrator</span>
                        </div>
                    </div>
                </div>

                {/* Settings Form */}
                <div className="lg:col-span-2 space-y-5">
                    <form onSubmit={handleUpdate} className="space-y-5">
                        {/* Profile Section */}
                        <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                            <h3 className="text-[10px] font-black text-gray-405 uppercase tracking-widest flex items-center gap-2">
                                <User size={12} /> Profile Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-charcoal uppercase tracking-widest block">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                        <input
                                            type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-lavender outline-none transition-all font-bold text-charcoal"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-charcoal uppercase tracking-widest block">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                        <input
                                            type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-lavender outline-none transition-all font-bold text-charcoal"
                                            placeholder="admin@zubizo.com"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>


                        <div className="flex items-center justify-between p-4 bg-lavender/5 rounded-2xl border border-lavender/10">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-lavender/10 text-lavender flex items-center justify-center">
                                    <AlertCircle size={14} />
                                </div>
                                <p className="text-[9px] font-black text-lavender uppercase tracking-widest">Always use a strong unique password</p>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-charcoal hover:bg-black text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-charcoal/20 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-70"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : (
                                    <>
                                        <Save size={16} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
