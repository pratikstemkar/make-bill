import imageCompression from 'browser-image-compression';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

interface UploadResult {
    url: string;
    path: string;
}

export async function uploadImage(file: File): Promise<UploadResult> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('User must be authenticated to upload images');
    }

    // Compress the image
    const options = {
        maxSizeMB: 1, // Max file size in MB
        maxWidthOrHeight: 1920, // Max dimension
        useWebWorker: true,
        fileType: 'image/webp' as const, // Convert to WebP for better compression
    };

    let compressedFile: File;
    try {
        compressedFile = await imageCompression(file, options);
    } catch (error) {
        console.error('Image compression failed:', error);
        // Fall back to original file if compression fails
        compressedFile = file;
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const extension = 'webp';
    const fileName = `${user.id}/${timestamp}-${randomId}.${extension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, compressedFile, {
            contentType: 'image/webp',
            cacheControl: '31536000', // Cache for 1 year
            upsert: false,
        });

    if (error) {
        console.error('Upload error:', error);
        throw new Error('Failed to upload image');
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(data.path);

    return {
        url: urlData.publicUrl,
        path: data.path,
    };
}

export async function deleteImage(path: string): Promise<void> {
    const { error } = await supabase.storage
        .from('images')
        .remove([path]);

    if (error) {
        console.error('Delete error:', error);
        throw new Error('Failed to delete image');
    }
}
