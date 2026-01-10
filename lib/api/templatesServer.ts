import { createClient } from '@/lib/supabase/server';

export interface DbTemplate {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    page: any;
    elements: any;
    version: number;
    created_at: string;
    updated_at: string;
}

/**
 * Get a template by ID for a specific user (server-side version)
 * Verifies ownership in the query for API key access
 */
export async function getTemplateById(id: string, userId: string): Promise<DbTemplate | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)  // Verify ownership
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null; // Not found or not owned by user
        }
        console.error('Error fetching template:', error);
        throw error;
    }

    return data;
}
