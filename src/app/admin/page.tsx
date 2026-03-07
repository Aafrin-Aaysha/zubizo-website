"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, ShieldCheck, Mail as MailIcon } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                router.push("/admin/dashboard");
            } else {
                const data = await res.json();
                toast.error(data.message || "Invalid credentials.");
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-soft-grey flex items-center justify-center px-4">
            <Navbar />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl"
            >
                <div className="bg-charcoal px-8 py-12 text-center text-white">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-lavender/20 text-lavender">
                        <Lock className="h-8 w-8" />
                    </div>
                    <h1 className="text-3xl font-bold font-serif">Admin Portal</h1>
                    <p className="mt-2 text-sm text-white/60 uppercase tracking-widest font-semibold">
                        Restricted Access
                    </p>
                </div>

                <form onSubmit={handleLogin} className="p-10 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                placeholder="admin@zubizo.com"
                                className="w-full rounded-2xl bg-gray-50 border-2 border-transparent px-6 py-4 text-gray-900 focus:border-[#ae7fcb] focus:bg-white focus:outline-none transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                                Secret Key
                            </label>
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full rounded-2xl bg-gray-50 border-2 border-transparent px-6 py-4 text-gray-900 focus:border-[#ae7fcb] focus:bg-white focus:outline-none transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>



                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-6 text-lg font-bold"
                    >
                        {isSubmitting ? "Authenticating..." : "Authenticate"}
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>

                    <div className="pt-6 flex items-center justify-center text-xs text-charcoal/40 font-medium">
                        <ShieldCheck className="mr-1 h-3 w-3" />
                        End-to-end encrypted session
                    </div>
                </form>
            </motion.div>
        </main>
    );
}
