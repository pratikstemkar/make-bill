import { createClient } from '@/lib/supabase/client';
import type { DbTemplate, CreateTemplateInput, UpdateTemplateInput } from '@/lib/database.types';

export async function getTemplates(): Promise<DbTemplate[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Error fetching templates:', error);
        throw error;
    }

    return data || [];
}

export async function getTemplate(id: string): Promise<DbTemplate | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null; // Not found
        }
        console.error('Error fetching template:', error);
        throw error;
    }

    return data;
}

export async function createTemplate(input: CreateTemplateInput): Promise<DbTemplate> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User must be authenticated to create templates');
    }

    const { data, error } = await supabase
        .from('templates')
        .insert({
            user_id: user.id,
            name: input.name,
            description: input.description || null,
            page: input.page,
            elements: input.elements,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating template:', error);
        throw error;
    }

    return data;
}

export async function updateTemplate(id: string, input: UpdateTemplateInput): Promise<DbTemplate> {
    const supabase = createClient();

    // First get current version
    const { data: current } = await supabase
        .from('templates')
        .select('version')
        .eq('id', id)
        .single();

    const newVersion = (current?.version || 0) + 1;

    const { data, error } = await supabase
        .from('templates')
        .update({
            ...input,
            version: newVersion,
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating template:', error);
        throw error;
    }

    return data;
}

export async function deleteTemplate(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting template:', error);
        throw error;
    }
}
