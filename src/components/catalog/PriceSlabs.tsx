"use client";

import React from 'react';

interface DiscountSlab {
    minQty: number;
    maxQty: number;
    discountPercentage: number;
}

interface PriceSlabsProps {
    basePrice: number;
    slabs: DiscountSlab[];
}

export const PriceSlabs: React.FC<PriceSlabsProps> = ({ basePrice, slabs }) => {
    const calculateFinalPrice = (discount: number) => {
        return Math.round(basePrice - (basePrice * discount / 100));
    };

    return (
        <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700">Price Slabs</h4>
            <div className="grid grid-cols-1 gap-2">
                {slabs.map((slab, index) => (
                    <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-lavender-50 border border-lavender-100 rounded-lg"
                        style={{ backgroundColor: '#f9f5ff', borderColor: '#e9d7fe' }}
                    >
                        <span className="text-sm text-gray-600">
                            {slab.minQty}{slab.maxQty ? `–${slab.maxQty}` : '+'} Cards
                        </span>
                        <span className="text-sm font-bold text-primary" style={{ color: '#ae7fcb' }}>
                            ₹{calculateFinalPrice(slab.discountPercentage)} / card
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
