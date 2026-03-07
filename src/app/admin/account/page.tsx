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

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const res = await fetch('/api/admin/account');
            const data = await res.json();
            if (res.ok) {
                setFormData(prev => ({
                    ...prev,
                    name: data.name || '',
                    email: data.email || ''
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
                    newPassword: formData.newPassword
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
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
            <div>
                <h1 className="text-3xl font-black text-charcoal tracking-tight">Admin Settings</h1>
                <p className="text-gray-500 mt-1 font-medium">Manage your profile information and account security.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Profile Overview */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-lavender/10 rounded-[2rem] flex items-center justify-center text-lavender mb-6 border-4 border-white shadow-lg">
                            <User size={40} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-xl font-black text-charcoal">{formData.name || 'Admin User'}</h3>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">{formData.email}</p>

                        <div className="mt-8 pt-8 border-t border-gray-50 w-full flex items-center justify-center gap-2">
                            <ShieldCheck size={16} className="text-green-500" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verified Administrator</span>
                        </div>
                    </div>
                </div>

                {/* Settings Form */}
                <div className="lg:col-span-2 space-y-8">
                    <form onSubmit={handleUpdate} className="space-y-8">
                        {/* Profile Section */}
                        <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <User size={14} /> Profile Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-charcoal uppercase tracking-widest mb-1.5 block">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                        <input
                                            type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-lavender outline-none transition-all font-bold text-charcoal"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-charcoal uppercase tracking-widest mb-1.5 block">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                        <input
                                            type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-lavender outline-none transition-all font-bold text-charcoal"
                                            placeholder="admin@zubizo.com"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Security Section */}
                        <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Lock size={14} /> Security & Password
                            </h3>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-charcoal uppercase tracking-widest mb-1.5 block">Current Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={formData.currentPassword} onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
                                            className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-lavender outline-none transition-all font-bold text-charcoal"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-lavender transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Required only if changing password</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-charcoal uppercase tracking-widest mb-1.5 block">New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                value={formData.newPassword} onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-lavender outline-none transition-all font-bold text-charcoal"
                                                placeholder="Enter new password"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-charcoal uppercase tracking-widest mb-1.5 block">Confirm New Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-lavender outline-none transition-all font-bold text-charcoal"
                                                placeholder="Repeat new password"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="flex items-center justify-between p-6 bg-lavender/5 rounded-[2rem] border border-lavender/10">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-lavender/10 text-lavender flex items-center justify-center">
                                    <AlertCircle size={18} />
                                </div>
                                <p className="text-[10px] font-black text-lavender uppercase tracking-widest">Always use a strong unique password</p>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-charcoal hover:bg-black text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-charcoal/20 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-70"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (
                                    <>
                                        <Save size={18} />
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
