import Link from 'next/link';
import { LuxuryNavbar } from '@/components/layout/luxury-navbar';
import { LuxuryFooter } from '@/components/layout/luxury-footer';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <main className="min-h-screen bg-[#faf9f7] flex flex-col">
            <LuxuryNavbar />

            <div className="flex-grow flex items-center justify-center px-4 pt-20">
                <div className="max-w-xl w-full text-center space-y-8">
                    <div className="relative">
                        <span className="text-[150px] md:text-[200px] font-black text-lavender/10 leading-none select-none">
                            404
                        </span>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <h1 className="text-3xl md:text-4xl font-black text-charcoal font-serif tracking-tight">
                                Design Not Found
                            </h1>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-neutral-500 text-lg font-medium leading-relaxed">
                            The page you are looking for might have been moved, deleted, or never existed in our collection.
                        </p>

                        <div className="w-12 h-1 bg-lavender/30 mx-auto rounded-full" />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link
                            href="/"
                            className="w-full sm:w-auto px-8 h-14 bg-charcoal text-white rounded-lg font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-3 hover:bg-neutral-800 transition-all active:scale-[0.98] shadow-lg shadow-charcoal/20"
                        >
                            <ArrowLeft size={18} />
                            Back to Home
                        </Link>

                        <Link
                            href="/catalog"
                            className="w-full sm:w-auto px-8 h-14 bg-white border border-neutral-200 text-charcoal rounded-lg font-bold text-sm tracking-widest uppercase flex items-center justify-center hover:bg-neutral-50 transition-all active:scale-[0.98]"
                        >
                            Browse Catalogue
                        </Link>
                    </div>
                </div>
            </div>

            <LuxuryFooter />
        </main>
    );
}
