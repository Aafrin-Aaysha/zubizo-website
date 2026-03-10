'use client';

import React, { useEffect, useState } from 'react';
import {
    Settings,
    MapPin,
    Phone,
    Mail,
    MessageCircle,
    Info,
    Save,
    Loader2,
    Globe,
    Share2,
    Upload,
    Plus,
    Trash2,
    Instagram,
    Clock,
    Image,
    X
} from 'lucide-react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';
import ReactDOM from 'react-dom';

const modules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['link', 'clean']
    ],
};

// Fix for React 19 compatibility with react-quill
if (typeof window !== 'undefined') {
    (ReactDOM as any).findDOMNode = (instance: any) => {
        return instance instanceof HTMLElement ? instance : null;
    };
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<any>({
        terms: '',
        policyContent: '',
        termsContent: '',
        shippingPolicyContent: '',
        refundPolicyContent: '',
        printingPolicyContent: '',
        address: '',
        phone: '',
        email: '',
        whatsappNumber: '',
        heroSlides: [] as { image: string; tag: string; title: string; subtitle: string }[],
        instagramUrl: '',
        facebookUrl: '',
        businessHours: '',
        homeTagline: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/settings', { cache: 'no-store' });
            const data = await res.json();
            if (res.ok) {
                setSettings((prev: typeof settings) => ({ ...prev, ...data }));
            }
        } catch (error) {
            toast.error('Failed to load settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (res.ok) {
                toast.success('Settings updated successfully');
            } else {
                toast.error('Failed to update settings');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-[#ae7fcb]" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Website Settings</h1>
                <p className="text-gray-500 mt-1">Global configuration for Zubizo invitation stationary store.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-8 pb-20">
                {/* Policies Section */}
                <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                        <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
                            <Info size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Legal Policies</h2>
                            <p className="text-xs text-gray-500 font-medium">Manage your website's terms, privacy, and shipping policies.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl overflow-hidden [&_.ql-editor]:min-h-[150px] [&_.ql-toolbar]:rounded-t-2xl [&_.ql-container]:rounded-b-2xl [&_.ql-toolbar]:border-gray-200 [&_.ql-container]:border-gray-200">
                            <label className="text-sm font-bold text-gray-700 block mb-2 px-1">Terms & Conditions</label>
                            <ReactQuill
                                theme="snow"
                                modules={modules}
                                value={settings.termsContent || ''}
                                onChange={val => setSettings({ ...settings, termsContent: val })}
                                placeholder="Detailed terms and conditions..."
                            />
                        </div>
                        <div className="bg-white rounded-2xl overflow-hidden [&_.ql-editor]:min-h-[150px] [&_.ql-toolbar]:rounded-t-2xl [&_.ql-container]:rounded-b-2xl [&_.ql-toolbar]:border-gray-200 [&_.ql-container]:border-gray-200">
                            <label className="text-sm font-bold text-gray-700 block mb-2 px-1">Privacy Policy</label>
                            <ReactQuill
                                theme="snow"
                                modules={modules}
                                value={settings.policyContent || ''}
                                onChange={val => setSettings({ ...settings, policyContent: val })}
                                placeholder="Detailed privacy policy..."
                            />
                        </div>
                        <div className="bg-white rounded-2xl overflow-hidden [&_.ql-editor]:min-h-[150px] [&_.ql-toolbar]:rounded-t-2xl [&_.ql-container]:rounded-b-2xl [&_.ql-toolbar]:border-gray-200 [&_.ql-container]:border-gray-200">
                            <label className="text-sm font-bold text-gray-700 block mb-2 px-1">Shipping Policy</label>
                            <ReactQuill
                                theme="snow"
                                modules={modules}
                                value={settings.shippingPolicyContent || ''}
                                onChange={val => setSettings({ ...settings, shippingPolicyContent: val })}
                                placeholder="Detailed shipping policy..."
                            />
                        </div>
                        <div className="bg-white rounded-2xl overflow-hidden [&_.ql-editor]:min-h-[150px] [&_.ql-toolbar]:rounded-t-2xl [&_.ql-container]:rounded-b-2xl [&_.ql-toolbar]:border-gray-200 [&_.ql-container]:border-gray-200">
                            <label className="text-sm font-bold text-gray-700 block mb-2 px-1">Refund Policy</label>
                            <ReactQuill
                                theme="snow"
                                modules={modules}
                                value={settings.refundPolicyContent || ''}
                                onChange={val => setSettings({ ...settings, refundPolicyContent: val })}
                                placeholder="Detailed refund policy..."
                            />
                        </div>
                        <div className="bg-white rounded-2xl overflow-hidden [&_.ql-editor]:min-h-[150px] [&_.ql-toolbar]:rounded-t-2xl [&_.ql-container]:rounded-b-2xl [&_.ql-toolbar]:border-gray-200 [&_.ql-container]:border-gray-200">
                            <label className="text-sm font-bold text-gray-700 block mb-2 px-1">Printing Policy</label>
                            <ReactQuill
                                theme="snow"
                                modules={modules}
                                value={settings.printingPolicyContent || ''}
                                onChange={val => setSettings({ ...settings, printingPolicyContent: val })}
                                placeholder="Detailed printing policy..."
                            />
                        </div>
                    </div>
                </section>

                {/* Contact Information */}
                <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                        <div className="p-3 bg-green-50 text-green-500 rounded-2xl">
                            <Share2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Contact Channels</h2>
                            <p className="text-xs text-gray-500 font-medium">Configure store location and contact details.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <MapPin size={16} className="text-[#ae7fcb]" /> Office Address
                            </label>
                            <input
                                type="text"
                                value={settings.address}
                                onChange={e => setSettings({ ...settings, address: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ae7fcb]/10 focus:border-[#ae7fcb]"
                                placeholder="123 Street Name, City"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Phone size={16} className="text-[#ae7fcb]" /> Contact Number
                            </label>
                            <input
                                type="text"
                                value={settings.phone}
                                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ae7fcb]/10 focus:border-[#ae7fcb]"
                                placeholder="+91 12345 67890"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Mail size={16} className="text-[#ae7fcb]" /> Business Email
                            </label>
                            <input
                                type="email"
                                value={settings.email}
                                onChange={e => setSettings({ ...settings, email: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ae7fcb]/10 focus:border-[#ae7fcb]"
                                placeholder="hello@zubizo.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <MessageCircle size={16} className="text-[#ae7fcb]" /> WhatsApp Business
                            </label>
                            <input
                                type="text"
                                value={settings.whatsappNumber}
                                onChange={e => setSettings({ ...settings, whatsappNumber: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ae7fcb]/10 focus:border-[#ae7fcb]"
                                placeholder="91xxxxxxxxxx (With Country Code)"
                            />
                        </div>
                    </div>
                </section>

                {/* Contact Information */}
                <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                        <div className="p-3 bg-pink-50 text-pink-500 rounded-2xl"><Share2 size={24} /></div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Social & Business Info</h2>
                            <p className="text-xs text-gray-500">Appear in footer and contact pages.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Instagram size={16} className="text-pink-500" /> Instagram URL</label>
                            <input type="text" value={settings.instagramUrl || ''} onChange={e => setSettings({ ...settings, instagramUrl: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#ae7fcb]" placeholder="https://instagram.com/zubizo" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Globe size={16} className="text-blue-500" /> Facebook URL</label>
                            <input type="text" value={settings.facebookUrl || ''} onChange={e => setSettings({ ...settings, facebookUrl: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#ae7fcb]" placeholder="https://facebook.com/zubizo" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Clock size={16} className="text-[#ae7fcb]" /> Business Hours</label>
                            <input type="text" value={settings.businessHours || ''} onChange={e => setSettings({ ...settings, businessHours: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-[#ae7fcb]" placeholder="Mon–Sat: 10am – 7pm" />
                        </div>
                    </div>
                </section>

                {/* Floating Save Button */}
                <div className="fixed bottom-8 right-8 z-10">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-3 px-8 py-4 bg-[#1a1c23] hover:bg-black text-white font-bold rounded-2xl shadow-2xl transition-all active:scale-95 disabled:opacity-70 group"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                <Save size={20} className="text-[#ae7fcb] group-hover:scale-110 transition-transform" />
                                Save Website Configuration
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
