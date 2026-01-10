import { createClient } from '@/lib/supabase/server';

interface UploadResult {
    url: string;
    path: string;
}

/**
 * Upload a PDF buffer to Supabase storage
 */
export async function uploadPdf(
    pdfBuffer: Buffer,
    userId: string
): Promise<UploadResult> {
    const supabase = await createClient();

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const fileName = `${userId}/${timestamp}-${randomId}.pdf`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
        .from('pdfs')
        .upload(fileName, pdfBuffer, {
            contentType: 'application/pdf',
            cacheControl: '31536000', // Cache for 1 year
            upsert: false,
        });

    if (error) {
        console.error('PDF upload error:', error);
        throw new Error('Failed to upload PDF');
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from('pdfs')
        .getPublicUrl(data.path);

    return {
        url: urlData.publicUrl,
        path: data.path,
    };
}

/**
 * Delete a PDF from Supabase storage
 */
export async function deletePdf(path: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.storage
        .from('pdfs')
        .remove([path]);

    if (error) {
        console.error('PDF delete error:', error);
        throw new Error('Failed to delete PDF');
    }
}
