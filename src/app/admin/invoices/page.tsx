'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, FileText, Search, Loader2, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';

// Use dynamic import for jspdf to avoid SSR errors
export default function InvoicesHistoryPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const { data: invoices = [], isLoading } = useQuery({
        queryKey: ['invoices'],
        queryFn: async () => {
            const res = await fetch('/api/admin/invoices');
            if (!res.ok) throw new Error('Failed to load invoices');
            return res.json();
        }
    });

    const filteredInvoices = invoices.filter((inv: any) => 
        inv.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customerPhone.includes(searchQuery)
    );

    const handleExportPDF = async (invoice: any) => {
        try {
            const { generateInvoicePDF } = await import('@/lib/pdfGenerator');
            await generateInvoicePDF(invoice);
            toast.success('Invoice downloaded successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate PDF');
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-normal text-charcoal">Invoice History</h2>
                    <p className="text-gray-500 mt-1 font-medium">View and manage all generated invoices.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/invoices/new"
                        className="bg-[#1a1c23] hover:bg-black text-white px-8 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-xl"
                    >
                        <FileText size={18} />
                        Generate Invoice
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative group sm:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by ID, Name or Phone..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-purple-200 focus:ring-4 focus:ring-purple-50 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Order ID & Date</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Total Bill</th>
                                <th className="px-6 py-4">Profit</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center">
                                        <Loader2 className="animate-spin mx-auto text-purple-500" size={32} />
                                    </td>
                                </tr>
                            ) : filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center text-gray-400 font-bold">
                                        No invoices found.
                                    </td>
                                </tr>
                            ) : (
                                filteredInvoices.map((invoice: any) => (
                                    <tr key={invoice._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{invoice.orderId}</div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                                                {new Date(invoice.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-700">{invoice.customerName}</div>
                                            <div className="text-xs text-gray-400">{invoice.customerPhone || 'No Phone'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-black text-gray-900">₹{invoice.grandTotal}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-block">
                                                +₹{invoice.profit}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/invoices/${invoice._id}/edit`}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-block"
                                                title="Edit Invoice"
                                            >
                                                <Edit2 size={20} />
                                            </Link>
                                            <button 
                                                onClick={() => handleExportPDF(invoice)}
                                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors inline-block"
                                                title="Download Invoice PDF"
                                            >
                                                <Download size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="block md:hidden border-t border-gray-100 divide-y divide-gray-50">
                    {isLoading ? (
                        <div className="py-12 text-center">
                            <Loader2 className="animate-spin mx-auto text-purple-500" size={32} />
                        </div>
                    ) : filteredInvoices.length === 0 ? (
                        <div className="py-16 text-center text-gray-400 font-bold">
                            No invoices found.
                        </div>
                    ) : (
                        filteredInvoices.map((invoice: any) => (
                            <div key={invoice._id} className="p-4 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-gray-900">{invoice.orderId}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                                            {new Date(invoice.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="font-black text-gray-900">₹{invoice.grandTotal}</div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-gray-700">{invoice.customerName}</div>
                                        <div className="text-xs text-gray-400">{invoice.customerPhone || 'No Phone'}</div>
                                    </div>
                                    <div className="font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs">
                                        +₹{invoice.profit}
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50">
                                    <Link
                                        href={`/admin/invoices/${invoice._id}/edit`}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold"
                                    >
                                        <Edit2 size={16} /> Edit
                                    </Link>
                                    <button 
                                        onClick={() => handleExportPDF(invoice)}
                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold"
                                    >
                                        <Download size={16} /> Download
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
