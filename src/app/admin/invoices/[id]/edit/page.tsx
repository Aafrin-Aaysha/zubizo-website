'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import InvoiceForm from '@/components/admin/invoices/InvoiceForm';
import { useParams } from 'next/navigation';

export default function EditInvoicePage() {
    const params = useParams();
    const id = params.id;

    const { data: invoice, isLoading, error } = useQuery({
        queryKey: ['invoice', id],
        queryFn: async () => {
            const res = await fetch(`/api/admin/invoices/${id}`);
            if (!res.ok) throw new Error('Failed to fetch invoice');
            return res.json();
        }
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="animate-spin text-purple-600" size={40} />
                <p className="text-gray-500 font-medium tracking-tight">Loading invoice details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <p className="text-red-500 font-bold">Error loading invoice</p>
                <Link href="/admin/invoices" className="text-purple-600 font-medium hover:underline">Back to History</Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Link href="/admin/invoices" className="text-gray-400 hover:text-purple-600 transition-colors">
                            <ArrowLeft size={18} />
                        </Link>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Invoice Management</span>
                    </div>
                    <h1 className="text-3xl font-black text-charcoal tracking-tight">Edit Invoice</h1>
                    <p className="text-gray-500 mt-1 font-medium">Modify existing order {invoice.orderId} and sync stock.</p>
                </div>
            </div>

            <InvoiceForm initialData={invoice} isEditing={true} />
        </div>
    );
}
