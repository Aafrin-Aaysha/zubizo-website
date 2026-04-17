'use client';

import React from 'react';
import InvoiceForm from '@/components/admin/invoices/InvoiceForm';

export default function NewInvoicePage() {
    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-charcoal tracking-tight">Invoice Generator</h1>
                    <p className="text-gray-500 mt-1 font-medium">Create a smart invoice & automatically deduct inventory.</p>
                </div>
            </div>

            <InvoiceForm />
        </div>
    );
}
