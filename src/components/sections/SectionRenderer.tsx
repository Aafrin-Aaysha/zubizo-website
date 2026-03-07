"use client";

import React, { Suspense } from 'react';
import { LuxuryHero } from './luxury-hero';
import { ShopByPrice } from './ShopByPrice';
import { TrendingRow } from './trending-row';
import { OurStory } from './our-story';
import { Testimonials } from './testimonials';
import { ContactSection } from './contact';

const sectionComponents: Record<string, React.ComponentType<any>> = {
    hero: LuxuryHero,
    shopByPrice: ShopByPrice,
    trending: TrendingRow,
    ourStory: OurStory,
    testimonials: Testimonials,
    contact: ContactSection,
};

interface SectionProps {
    sections: any[];
    siteSettings?: any;
}

export const SectionRenderer = ({ sections, siteSettings }: SectionProps) => {
    return (
        <div className="flex flex-col">
            {sections.map((section) => {
                const Component = sectionComponents[section.sectionType];

                if (!Component || !section.isVisible) return null;

                return (
                    <div key={section._id} style={{
                        backgroundColor: section.styling?.backgroundColor,
                        color: section.styling?.textColor
                    }}>
                        <Suspense fallback={<div className="h-40 flex items-center justify-center">Loading...</div>}>
                            <Component
                                data={section.content}
                                styling={section.styling}
                                title={section.title}
                                subtitle={section.subtitle}
                                description={section.description}
                                layout={section.layoutType}
                                siteSettings={siteSettings}
                            />
                        </Suspense>
                    </div>
                );
            })}
        </div>
    );
};
