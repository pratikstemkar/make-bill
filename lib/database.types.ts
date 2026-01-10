// Database types for Supabase tables
import type { Element, Page } from '@/lib/types';

// JSON type for Supabase JSONB columns
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface DbTemplate {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    page: Json;
    elements: Json;
    version: number;
    created_at: string;
    updated_at: string;
}

export interface CreateTemplateInput {
    name: string;
    description?: string;
    page: Page;
    elements: Element[];
}

export interface UpdateTemplateInput {
    name?: string;
    description?: string;
    page?: Page;
    elements?: Element[];
}
