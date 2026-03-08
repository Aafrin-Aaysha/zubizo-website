import React from 'react';
import { LuxuryNavbar } from "@/components/layout/luxury-navbar";
import { LuxuryFooter } from "@/components/layout/luxury-footer";
import { DesignDetailClient } from '@/components/catalog/DesignDetail';
import Link from 'next/link';
import dbConnect from '@/lib/db';
import Design from '@/models/Design';
import SiteSettings from '@/models/SiteSettings';
import { Metadata } from 'next';
import { ChevronLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    await dbConnect();
    const design = await Design.findOne({ slug, isDeleted: false }).populate('categoryId').lean();
    if (!design) return { title: 'Design Not Found' };

    const d = design as any;
    return {
        title: `${d?.name || 'Design Details'} | Zubizo Catalogue`,
        description: d?.description || `View details, pricing, and customization for ${d?.name} invitation design.`,
    };
}

export default async function DesignDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    await dbConnect();

    const [designRaw, siteSettings] = await Promise.all([
        Design.findOne({ slug, isDeleted: false, isActive: true }).populate('categoryId').lean(),
        SiteSettings.findOne().lean(),
    ]);

    const design = designRaw as any;

    if (!design) {
        notFound();
    }

    const s = siteSettings as any;
    const whatsappNumber = s?.whatsappNumber || '7639390868';
    const categoryName = design.categoryId?.name || 'Invitation';

    // Serialize mongoose document
    const serialized = JSON.parse(JSON.stringify(design));

    return (
        <main className="min-h-screen bg-white">
            <LuxuryNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 mb-6 text-[11px] font-bold uppercase tracking-widest">
                    <Link href="/catalog" className="text-lavender hover:opacity-70 transition-opacity">Catalogue</Link>
                    <span className="text-gray-300">›</span>
                    <span className="text-gray-400">{categoryName}</span>
                    <span className="text-gray-300">›</span>
                    <span className="text-gray-500 truncate max-w-[180px]">{design.name}</span>
                </nav>

                {/* Back Button */}
                <Link
                    href="/catalog"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-lavender transition-colors mb-8 group"
                >
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Catalogue
                </Link>

                {/* Client-side interactive detail */}
                <DesignDetailClient design={serialized} whatsappNumber={whatsappNumber} />
            </div>

            {/* Mobile Sticky CTA */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-lg border-t border-neutral-100 z-50">
                <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello! I'm interested in *${design.name}* (${design.sku}) from your catalogue.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full h-12 bg-[#25D366] text-white rounded-lg font-bold text-sm shadow-lg"
                >
                    💬 Enquire on WhatsApp
                </a>
            </div>

            <LuxuryFooter />
        </main>
    );
}
