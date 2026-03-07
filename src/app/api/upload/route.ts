import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ message: 'No file provided' }, { status: 400 });
        }

        // In a real production app, you'd use the Cloudinary SDK or an unsigned upload preset.
        // For this implementation, we expect the user to have a Cloudinary upload preset.
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            return NextResponse.json({ message: 'Cloudinary configuration missing' }, { status: 500 });
        }

        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', uploadPreset);

        const isVideo = file.type.startsWith('video/');
        const resourceType = isVideo ? 'video' : 'image';

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
            method: 'POST',
            body: data,
        });

        const result = await res.json();

        if (!res.ok) {
            console.error('Cloudinary upload error:', result);
            return NextResponse.json({
                message: result.error?.message || 'Cloudinary upload failed',
                details: result
            }, { status: res.status });
        }

        return NextResponse.json({ url: result.secure_url });
    } catch (error: any) {
        console.error('Upload API catch error:', error);
        return NextResponse.json({
            message: 'Upload failed',
            error: error.message
        }, { status: 500 });
    }
}
