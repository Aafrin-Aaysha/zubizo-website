'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Image as ImageIcon,
    FolderTree,
    MessageSquare,
    Settings,
    User,
    LogOut,
    Bell,
    Menu,
    X,
    ChevronRight,
    Zap,
    Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogoIcon } from '@/components/ui/logo-icon';
import { motion, AnimatePresence } from 'framer-motion';

const sidebarItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Homepage Builder', href: '/admin/builder', icon: FolderTree },
    { name: 'Manage Designs', href: '/admin/designs', icon: ImageIcon },
    { name: 'Digital Invites', href: '/admin/digital-invites', icon: Zap },
    { name: 'Bulk Import', href: '/admin/bulk-import', icon: Zap },
    { name: 'Team Management', href: '/admin/employees', icon: User },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Inquiry Logs', href: '/admin/inquiries', icon: MessageSquare },
    { name: 'Inventory', href: '/admin/inventory', icon: Database },
    { name: 'Website Settings', href: '/admin/settings', icon: Settings },
    { name: 'Account', href: '/admin/account', icon: User },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed on mobile-first
    const [isMobile, setIsMobile] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // Handle screen resize and initial state
    React.useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            setIsSidebarOpen(!mobile);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close sidebar on route change for mobile
    React.useEffect(() => {
        if (isMobile) {
            setIsSidebarOpen(false);
        }
    }, [pathname, isMobile]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/admin/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (pathname === '/admin/login') return <>{children}</>;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Overlay for Mobile */}
            <AnimatePresence>
                {isMobile && isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    width: isMobile ? (isSidebarOpen ? '280px' : '0px') : (isSidebarOpen ? '280px' : '80px'),
                    x: isMobile && !isSidebarOpen ? '-100%' : '0%'
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className={cn(
                    "fixed inset-y-0 left-0 z-[100] bg-white border-r border-lavender/10 text-charcoal overflow-hidden flex flex-col shadow-2xl lg:shadow-none",
                    isMobile && !isSidebarOpen ? "pointer-events-none" : "pointer-events-auto"
                )}
            >
                {/* Sidebar Header */}
                <div className="h-16 flex items-center px-6 border-b border-lavender/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-lavender/5 rounded-xl flex items-center justify-center group-hover:bg-lavender transition-all">
                            <LogoIcon size={32} />
                        </div>
                        {isSidebarOpen && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="font-bold text-xl tracking-tight text-charcoal/80"
                            >
                                Zubizo
                            </motion.span>
                        )}
                    </div>
                </div>

                {/* Navigation items */}
                <nav className="flex-1 py-6 px-3 space-y-1">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-lavender text-white shadow-sm'
                                    : 'text-charcoal/60 hover:bg-lavender/5 hover:text-lavender'
                                    }`}
                            >
                                <item.icon size={20} className={isActive ? 'text-white' : 'text-charcoal/40 group-hover:text-lavender'} />
                                {isSidebarOpen && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="font-medium whitespace-nowrap"
                                    >
                                        {item.name}
                                    </motion.span>
                                )}
                                {isActive && isSidebarOpen && (
                                    <motion.div layoutId="active" className="ml-auto">
                                        <ChevronRight size={16} />
                                    </motion.div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-3 border-t border-lavender/10">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-charcoal/60 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors"
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span className="font-medium">Sign Out</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className={cn(
                "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
                isMobile ? "pl-0" : (isSidebarOpen ? "pl-[280px]" : "pl-[80px]")
            )}>
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-[30]">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                        >
                            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>

                        {isMobile && (
                            <div className="flex items-center gap-2">
                                <LogoIcon size={24} />
                                <span className="font-bold text-lg text-charcoal/80">Zubizo</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="h-8 w-px bg-gray-200 mx-2"></div>

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-gray-900 leading-none">Admin</p>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-lavender bg-lavender/10 px-1.5 py-0.5 rounded mt-1 inline-block">
                                    Super Admin
                                </span>
                            </div>
                            <div className="w-10 h-10 bg-lavender rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white font-bold">
                                A
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-8 overflow-x-hidden">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
