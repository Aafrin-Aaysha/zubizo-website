'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, TrendingUp } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    trend: string;
    color: string;
    index: number;
}

export default function StatCard({ label, value, trend, color, index }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between group cursor-default"
        >
            <div className="flex justify-between items-start">
                <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-6"
                    style={{ backgroundColor: color, boxShadow: `${color}33 0px 8px 24px` }}
                >
                    <TrendingUp size={24} />
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">
                    <ArrowUpRight size={14} />
                    {trend}
                </div>
            </div>

            <div className="mt-6">
                <p className="text-gray-500 text-sm font-medium">{label}</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{value}</h3>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-50">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Since last month</p>
            </div>
        </motion.div>
    );
}
