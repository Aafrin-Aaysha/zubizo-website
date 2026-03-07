export interface InvitationDesign {
    id: string;
    name: string;
    category: string;
    theme: string;
    size: "A5 Standard" | "Square (6x6)" | "Pocket Fold";
    price: number;
    imageUrl: string;
    isTrending?: boolean;
    isNew?: boolean;
    isBestseller?: boolean;
}

export const MOCK_DESIGNS: InvitationDesign[] = [
    {
        id: "1",
        name: "Lavender Bloom Suite",
        category: "New Collections",
        theme: "Minimal",
        size: "A5 Standard",
        price: 4.5,
        imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop",
        isNew: true,
    },
    {
        id: "2",
        name: "Golden Script Classic",
        category: "Traditional Designs",
        theme: "Traditional",
        size: "A5 Standard",
        price: 6.2,
        imageUrl: "https://images.unsplash.com/photo-1607197143003-7cb75960098f?q=80&w=800&auto=format&fit=crop",
        isBestseller: true,
    },
    {
        id: "3",
        name: "Botanical Garden",
        category: "Seasonal",
        theme: "Floral",
        size: "Square (6x6)",
        price: 3.9,
        imageUrl: "https://images.unsplash.com/photo-1512413316925-fd47914c9c11?q=80&w=800&auto=format&fit=crop",
        isTrending: true,
    },
    {
        id: "4",
        name: "Copper Geometric",
        category: "Minimal & Modern",
        theme: "Minimal",
        size: "Pocket Fold",
        price: 5.1,
        imageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=800&auto=format&fit=crop",
        isNew: true,
    },
    {
        id: "5",
        name: "Royal Heritage",
        category: "Religious",
        theme: "Traditional",
        size: "A5 Standard",
        price: 8.5,
        imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop",
        isBestseller: true,
    },
    {
        id: "6",
        name: "Monochrome Sketch",
        category: "A5 Friends",
        theme: "Minimal",
        size: "A5 Standard",
        price: 3.25,
        imageUrl: "https://images.unsplash.com/photo-1621619856624-42fd193a0b0d?q=80&w=800&auto=format&fit=crop",
    },
];
