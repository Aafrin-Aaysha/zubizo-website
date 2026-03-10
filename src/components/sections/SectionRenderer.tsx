"use client";

import React, { Suspense } from 'react';
import { LuxuryHero } from './luxury-hero';
import { FeaturedCarousel } from './FeaturedCarousel';
import { TrendingRow } from './trending-row';
import { OurStory } from './our-story';
import { Testimonials } from './testimonials';
import { ShopByPrice } from './ShopByPrice';
import { ContactSection } from './contact';
import { SectionDivider } from '../ui/section-divider';

const sectionComponents: Record<string, React.ComponentType<any>> = {
    hero: LuxuryHero,
    featuredCollections: FeaturedCarousel,
    trending: TrendingRow,
    ourStory: OurStory,
    testimonials: Testimonials,
    shopByPrice: ShopByPrice,
    contact: ContactSection,
};

interface SectionProps {
    sections: any[];
    siteSettings?: any;
}

export const SectionRenderer = ({ sections, siteSettings }: SectionProps) => {
    return (
        <div className="flex flex-col">
            {sections.map((section, index) => {
                const Component = sectionComponents[section.sectionType];

                if (!Component || !section.isVisible) return null;

                return (
                    <React.Fragment key={section._id || `fallback-${index}`}>
                        {index > 0 && <SectionDivider />}
                        <section
                            className="relative w-full overflow-hidden"
                            style={{
                                backgroundColor: section.styling?.backgroundColor || 'transparent',
                                color: section.styling?.textColor,
                                padding: 'var(--section-spacing) 0'
                            }}
                        >
                            <div className="site-container">
                                <Suspense fallback={<div className="h-40 flex items-center justify-center text-charcoal/30 text-xs font-bold uppercase tracking-widest">Loading...</div>}>
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
                        </section>
                    </React.Fragment>
                );
            })}
        </div>
    );
};
