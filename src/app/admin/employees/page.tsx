'use client';

import React, { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Loader2,
    User,
    Shield,
    Key,
    CheckCircle2,
    XCircle,
    Eye,
    EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        empId: '',
        name: '',
        password: '',
        isActive: true
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/employees');
            if (res.ok) {
                const data = await res.json();
                setEmployees(data);
            }
        } catch (error) {
            toast.error('Failed to load employees');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const url = editingEmployee ? `/api/admin/employees/${editingEmployee._id}` : '/api/admin/employees';
        const method = editingEmployee ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success(editingEmployee ? 'Employee updated' : 'Employee created');
                fetchEmployees();
                closeModal();
            } else {
                const error = await res.json();
                toast.error(error.message || 'Operation failed');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteEmployee = async (id: string) => {
        if (!confirm('Are you sure you want to delete this employee?')) return;

        try {
            const res = await fetch(`/api/admin/employees/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Employee deleted');
                fetchEmployees();
            }
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const openModal = (emp: any = null) => {
        if (emp) {
            setEditingEmployee(emp);
            setFormData({
                empId: emp.empId,
                name: emp.name,
                password: '', // Don't show password
                isActive: emp.isActive
            });
        } else {
            setEditingEmployee(null);
            setFormData({
                empId: '',
                name: '',
                password: '',
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingEmployee(null);
    };

    const filteredEmployees = employees.filter(emp => 
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.empId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Employee Management</h1>
                    <p className="text-gray-500 mt-1 font-medium">Manage team access and production roles.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-lavender hover:bg-[#9a6ab5] text-white px-8 py-3.5 rounded-2xl font-black shadow-xl shadow-lavender/20 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                >
                    <Plus size={20} />
                    Add Employee
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-lavender transition-colors" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by ID or Name..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-lavender/10 focus:border-lavender transition-all font-medium"
                    />
                </div>
            </div>

            {/* Employee Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 animate-pulse h-64" />
                    ))
                ) : filteredEmployees.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-gray-100">
                        <User size={48} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No employees found</p>
                    </div>
                ) : (
                    filteredEmployees.map(emp => (
                        <motion.div
                            key={emp._id}
                            layout
                            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-lavender/5 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                <button onClick={() => openModal(emp)} className="p-2.5 bg-gray-50 text-gray-400 hover:text-lavender rounded-xl transition-all"><Edit2 size={16} /></button>
                                <button onClick={() => deleteEmployee(emp._id)} className="p-2.5 bg-gray-50 text-gray-400 hover:text-red-500 rounded-xl transition-all"><Trash2 size={16} /></button>
                            </div>

                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-20 h-20 bg-lavender/5 text-lavender rounded-[2rem] flex items-center justify-center relative">
                                    <User size={32} />
                                    <div className={cn(
                                        "absolute -bottom-1 -right-1 w-6 h-6 rounded-lg border-4 border-white flex items-center justify-center",
                                        emp.isActive ? "bg-green-500" : "bg-gray-300"
                                    )}>
                                        {emp.isActive ? <CheckCircle2 size={10} className="text-white" /> : <XCircle size={10} className="text-white" />}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-charcoal">{emp.name}</h3>
                                    <p className="text-[10px] font-black text-lavender uppercase tracking-widest bg-lavender/5 px-3 py-1 rounded-full inline-block mt-1">{emp.empId}</p>
                                </div>
                                <div className="pt-4 border-t border-gray-50 w-full flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    <span>Added {new Date(emp.createdAt).toLocaleDateString()}</span>
                                    <span className={emp.isActive ? "text-green-500" : "text-gray-400"}>{emp.isActive ? 'Active' : 'Disabled'}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-charcoal/40 backdrop-blur-md" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-lavender/10 text-lavender rounded-2xl flex items-center justify-center"><Shield size={24} /></div>
                                    <h2 className="text-2xl font-black text-charcoal">{editingEmployee ? 'Update Access' : 'Create Access'}</h2>
                                </div>
                                <button onClick={closeModal} className="p-2 hover:bg-gray-50 rounded-full transition-colors"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-charcoal uppercase tracking-widest mb-1.5 block">Employee ID</label>
                                        <input
                                            type="text" required value={formData.empId}
                                            onChange={e => setFormData({ ...formData, empId: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-lavender outline-none transition-all font-bold"
                                            placeholder="EMP001"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-charcoal uppercase tracking-widest mb-1.5 block">Full Name</label>
                                        <input
                                            type="text" required value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-lavender outline-none transition-all font-bold"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-charcoal uppercase tracking-widest mb-1.5 block">
                                            {editingEmployee ? 'New Password (leave blank to keep current)' : 'Initial Password'}
                                        </label>
                                        <div className="relative">
                                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type={showPassword ? 'text' : 'password'} required={!editingEmployee} value={formData.password}
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-lavender outline-none transition-all font-bold"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(p => !p)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-lavender transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                                        <input
                                            type="checkbox" checked={formData.isActive}
                                            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="w-5 h-5 rounded accent-lavender"
                                        />
                                        <div>
                                            <p className="font-bold text-sm text-charcoal uppercase tracking-widest">Active Status</p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Allow this employee to log in</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button" onClick={closeModal}
                                        className="flex-1 px-8 py-4 font-black text-xs uppercase tracking-widest text-gray-400 hover:text-charcoal transition-colors border-2 border-transparent"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit" disabled={isSubmitting}
                                        className="flex-[2] bg-charcoal hover:bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-charcoal/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingEmployee ? 'Update User' : 'Grant Access')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
