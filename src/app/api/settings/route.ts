import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SiteSettings from '@/models/SiteSettings';
import { getAdminFromRequest, unauthorizedResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        await dbConnect();
        let settings = await SiteSettings.findOne();

        if (!settings) {
            settings = await SiteSettings.create({
                about: 'Premium Invitation Stationary Brand.',
                terms: 'Terms of service apply.',
                address: 'Your Store Address Here',
                phone: '+91 0000000000',
                email: 'contact@zubizo.com',
                whatsappNumber: '7639390868',
                heroSlides: [],
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching settings' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const admin = await getAdminFromRequest(req);
        if (!admin) return unauthorizedResponse();

        const body = await req.json();

        // Destructure all known fields including new ones
        const {
            about, terms, policyContent, termsContent,
            address, phone, email, whatsappNumber,
            logoUrl, faviconUrl, aboutImageUrl,
            heroSlides, instagramUrl, facebookUrl, businessHours, homeTagline,
        } = body;

        await dbConnect();
        const settings = await SiteSettings.findOneAndUpdate(
            {},
            {
                about, terms, policyContent, termsContent,
                address, phone, email, whatsappNumber,
                logoUrl, faviconUrl, aboutImageUrl,
                heroSlides, instagramUrl, facebookUrl, businessHours, homeTagline,
            },
            { upsert: true, new: true }
        );

        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ message: 'Error updating settings' }, { status: 500 });
    }
}
