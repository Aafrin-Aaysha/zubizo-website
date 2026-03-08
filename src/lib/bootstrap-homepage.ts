export const bootstrapSections = [
    {
        sectionId: 'hero-main',
        sectionType: 'hero',
        order: 1,
        isVisible: true,
        layoutType: 'carousel',
        content: {
            slides: [
                {
                    image: "/zubizo_invites/3.jpeg",
                    title: "Crafting Invitations\nThat Tell Your Story",
                    subtitle: "Luxury handcrafted stationery designed\nwith elegance and timeless detail.",
                },
                {
                    image: "/zubizo_invites/4.jpeg",
                    title: "A Timeless Beginning\nFor Your Love",
                    subtitle: "Bespoke designs that capture the essence\nof your most beautiful moments.",
                },
                {
                    image: "/zubizo_invites/7.jpeg",
                    title: "Excellence in\nEvery Detail",
                    subtitle: "Premium materials and unmatched\ncraftsmanship for your special day.",
                }
            ]
        },
        styling: {
            backgroundColor: '#faf9fb',
            padding: '150px 0 60px',
            overlayOpacity: 0.5
        }
    },
    {
        sectionId: 'featured-main',
        sectionType: 'featuredCollections',
        order: 2,
        isVisible: true,
        title: 'Featured Designs',
        subtitle: 'CURATED COLLECTION',
        styling: {
            backgroundColor: '#ffffff'
        }
    },
    {
        sectionId: 'trending-insta',
        sectionType: 'trending',
        order: 3,
        isVisible: true,
        title: 'Trending on Instagram',
        subtitle: 'SOCIAL SHOWCASE',
        styling: {
            backgroundColor: '#faf9fb',
            padding: '120px 0'
        }
    },
    {
        sectionId: 'our-story-main',
        sectionType: 'ourStory',
        order: 4,
        isVisible: true,
        title: 'Our Story',
        subtitle: 'About Zubizo',
        styling: {
            backgroundColor: '#ffffff',
            padding: '120px 0'
        }
    },
    {
        sectionId: 'craft-process',
        sectionType: 'craftProcess',
        order: 5,
        isVisible: true,
        title: 'Our Artisan Process',
        subtitle: 'THE CRAFTSMANSHIP',
        styling: {
            backgroundColor: '#faf9fb'
        }
    },
    {
        sectionId: 'testimonials-main',
        sectionType: 'testimonials',
        order: 6,
        isVisible: true,
        title: 'Loved by Our Clients',
        subtitle: 'Client Love',
        styling: {
            backgroundColor: '#ffffff',
            padding: '120px 0'
        }
    },
    {
        sectionId: 'shop-by-price',
        sectionType: 'shopByPrice',
        order: 7,
        isVisible: true,
        title: 'Shop by Price',
        subtitle: 'PRICE RANGES',
        description: 'Discover invitation designs across every price range, crafted with elegance and premium materials.',
        styling: {
            backgroundColor: '#faf9fb',
            padding: '120px 0'
        }
    },
    {
        sectionId: 'contact-main',
        sectionType: 'contact',
        order: 8,
        isVisible: true,
        title: 'Luxury Invitation Studio',
        subtitle: 'Connect With Us',
        description: 'We’d love to help you create something beautiful.',
        styling: {
            backgroundColor: '#ffffff',
            padding: '120px 0'
        }
    }
];
